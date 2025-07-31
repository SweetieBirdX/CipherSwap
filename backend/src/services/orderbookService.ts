import { logger } from '../utils/logger';
import { 
  OrderData, 
  OrderStatus, 
  ResolverBot, 
  BotMetrics,
  OrderbookRequest, 
  OrderbookResponse, 
  OrderbookQuery,
  OrderbookStats,
  OrderbookHistory,
  ResolverBotRequest,
  ResolverBotResponse,
  ORDERBOOK_CONSTANTS
} from '../types/orderbook';
import { PredicateService } from './predicateService';

// ====== LIMIT_ORDER_LOGIC (tolga) ======
import { LimitOrder, MakerTraits, Address, randBigInt, HttpProviderConnector } from '@1inch/limit-order-sdk';
import { Wallet } from 'ethers';

/**
 * 1inch Limit Order oluşturucu (sadece orderType: 'limit' için)
 * @param params OrderbookRequest
 * @param authKey 1inch API Auth Key
 * @param maker Ethers Wallet instance
 */
export async function buildLimitOrder1inch(
  params: OrderbookRequest,
  authKey: string,
  maker: Wallet
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (params.orderType !== 'limit') {
      return { success: false, error: 'Only limit orders are supported by buildLimitOrder1inch.' };
    }
    const expiresIn = BigInt(params.deadline ?? 120); // seconds
    const expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;
    const UINT_40_MAX = (1n << 40n) - 1n;

    const makerTraits = MakerTraits.default()
      .withExpiration(expiration)
      .withNonce(randBigInt(UINT_40_MAX));

    // Create order directly without SDK (since SDK has import issues)
    const order = new LimitOrder({
      makerAsset: new Address(params.fromToken),
      takerAsset: new Address(params.toToken),
      makingAmount: BigInt(params.amount),
      takingAmount: params.limitPrice ? BigInt(params.limitPrice) : BigInt(params.amount),
      maker: new Address(maker.address),
    }, makerTraits);

    const typedData = order.getTypedData(params.chainId ?? 1);
    const signature = await maker.signTypedData(
      typedData.domain,
      { Order: typedData.types.Order },
      typedData.message
    );

    return {
      success: true,
      data: {
        order,
        signature,
        orderHash: order.getOrderHash(params.chainId ?? 1),
        expiration: Number(expiration),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
// ====== END LIMIT_ORDER_LOGIC ======

export class OrderbookService {
  private orders: Map<string, OrderData> = new Map();
  private userOrders: Map<string, Set<string>> = new Map(); // userAddress -> Set<orderId>
  private resolverBots: Map<string, ResolverBot> = new Map();
  private predicateService: PredicateService;
  
  constructor() {
    this.predicateService = new PredicateService();
    this.initializeMockData();
  }
  
  /**
   * Add order to off-chain orderbook
   */
  async addOrder(params: OrderbookRequest): Promise<OrderbookResponse> {
    try {
      logger.info('Adding order to off-chain orderbook', { params });
      
      // Validate request
      const validation = this.validateOrderRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Check user order limits
      const userOrderCount = this.getUserOrderCount(params.userAddress);
      if (userOrderCount >= ORDERBOOK_CONSTANTS.MAX_ORDERS_PER_USER) {
        return {
          success: false,
          error: `Maximum orders per user exceeded (${ORDERBOOK_CONSTANTS.MAX_ORDERS_PER_USER})`
        };
      }
      
      // ====== LIMIT_ORDER_INTEGRATION (tolga) ======
      // Handle limit orders with 1inch SDK integration
      if (params.orderType === 'limit') {
        try {
          const { ethers } = await import('ethers');
          const { config } = await import('../config/env');
          
          // Create wallet instance for signing
          const provider = new ethers.JsonRpcProvider(config.ETHEREUM_RPC_URL);
          const wallet = new ethers.Wallet(config.PRIVATE_KEY, provider);
          
          // Build 1inch limit order
          const limitOrderResult = await buildLimitOrder1inch(
            params,
            config.INCH_LIMIT_ORDER_AUTH_KEY!,
            wallet
          );
          
          if (!limitOrderResult.success) {
            logger.error('1inch limit order creation failed', {
              error: limitOrderResult.error,
              params,
              service: 'cipherswap-orderbook'
            });
            return {
              success: false,
              error: `Limit order creation failed: ${limitOrderResult.error}`
            };
          }
          
          logger.info('1inch limit order created successfully', {
            orderHash: limitOrderResult.data?.orderHash,
            params,
            service: 'cipherswap-orderbook'
          });
          
          // Add 1inch order data to the order
          params.metadata = {
            ...params.metadata,
            inchOrderHash: limitOrderResult.data?.orderHash,
            inchSignature: limitOrderResult.data?.signature,
            inchExpiration: limitOrderResult.data?.expiration
          };
          
        } catch (error: any) {
          logger.error('Limit order integration error', {
            error: error.message,
            params,
            service: 'cipherswap-orderbook'
          });
          return {
            success: false,
            error: `Limit order integration failed: ${error.message}`
          };
        }
      }
      // ====== END LIMIT_ORDER_INTEGRATION ======
      
      // Create order data
      const orderData = this.formatOrderData(params);
      
      // Store order
      this.orders.set(orderData.orderId, orderData);
      
      // Update user orders index
      if (!this.userOrders.has(params.userAddress)) {
        this.userOrders.set(params.userAddress, new Set());
      }
      this.userOrders.get(params.userAddress)!.add(orderData.orderId);
      
      logger.info('Order added to off-chain orderbook successfully', { 
        orderId: orderData.orderId,
        userAddress: params.userAddress,
        orderType: params.orderType,
        amount: params.amount
      });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('Add order to orderbook error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: 'Failed to add order to orderbook'
      };
    }
  }
  
  /**
   * Get fillable orders for a resolver bot
   */
  async getFillableOrders(resolverAddress: string): Promise<OrderData[]> {
    try {
      logger.info('Getting fillable orders for resolver', { resolverAddress });
      
      // Validate resolver bot
      const bot = this.resolverBots.get(resolverAddress);
      if (!bot || !bot.isWhitelisted || !bot.isOnline) {
        logger.warn('Resolver bot not authorized or offline', { resolverAddress });
        return [];
      }
      
      const fillableOrders: OrderData[] = [];
      
      for (const order of this.orders.values()) {
        // Check if order is active
        if (order.status !== OrderStatus.ACTIVE) {
          continue;
        }
        
        // Check if order is expired
        if (Date.now() > order.deadline) {
          order.status = OrderStatus.EXPIRED;
          this.orders.set(order.orderId, order);
          continue;
        }
        
        // Check if bot is allowed to fill this order
        if (order.allowedSenders && order.allowedSenders.length > 0) {
          if (!order.allowedSenders.includes(resolverAddress)) {
            continue;
          }
        }
        
        // Check if bot can trade this pair
        const pair = `${order.fromToken}-${order.toToken}`;
        if (bot.allowedPairs && bot.allowedPairs.length > 0 && !bot.allowedPairs.includes(pair)) {
          continue;
        }
        
        // Check order size limits
        const orderSize = parseFloat(order.fromAmount);
        if (bot.minOrderSize && orderSize < bot.minOrderSize) {
          continue;
        }
        if (bot.maxOrderSize && orderSize > bot.maxOrderSize) {
          continue;
        }
        
        // Check predicate if exists
        if (order.predicateId) {
          const predicateValidation = await this.predicateService.validatePredicate(order.predicateId);
          if (!predicateValidation.success || !predicateValidation.data?.isValid) {
            continue;
          }
        }
        
        fillableOrders.push(order);
      }
      
      logger.info('Found fillable orders for resolver', { 
        resolverAddress, 
        count: fillableOrders.length 
      });
      
      return fillableOrders;
      
    } catch (error: any) {
      logger.error('Get fillable orders error', { 
        error: error.message, 
        resolverAddress 
      });
      return [];
    }
  }
  
  /**
   * Validate if a resolver bot is whitelisted
   */
  async validateResolver(botAddress: string): Promise<boolean> {
    const bot = this.resolverBots.get(botAddress);
    return !!(bot && bot.isWhitelisted && bot.isOnline);
  }
  
  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, executionData?: {
    executedBy?: string;
    executionTxHash?: string;
    executionTimestamp?: number;
  }): Promise<OrderbookResponse> {
    try {
      logger.info('Updating order status', { orderId, status, executionData });
      
      const order = this.orders.get(orderId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found'
        };
      }
      
      order.status = status;
      order.executionAttempts += 1;
      order.lastExecutionAttempt = Date.now();
      
      if (executionData) {
        order.executedBy = executionData.executedBy;
        order.executionTxHash = executionData.executionTxHash;
        order.executionTimestamp = executionData.executionTimestamp;
      }
      
      this.orders.set(orderId, order);
      
      logger.info('Order status updated successfully', { 
        orderId, 
        status, 
        executionData 
      });
      
      return {
        success: true,
        data: order
      };
      
    } catch (error: any) {
      logger.error('Update order status error', { 
        error: error.message, 
        orderId, 
        status 
      });
      
      return {
        success: false,
        error: 'Failed to update order status'
      };
    }
  }
  
  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<OrderbookResponse> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found'
        };
      }
      
      return {
        success: true,
        data: order
      };
      
    } catch (error: any) {
      logger.error('Get order error', { error: error.message, orderId });
      return {
        success: false,
        error: 'Failed to get order'
      };
    }
  }
  
  /**
   * Query orders with filters
   */
  async queryOrders(query: OrderbookQuery): Promise<OrderData[]> {
    try {
      logger.info('Querying orders', { query });
      
      let filteredOrders = Array.from(this.orders.values());
      
      // Apply filters
      if (query.userAddress) {
        filteredOrders = filteredOrders.filter(order => order.userAddress === query.userAddress);
      }
      
      if (query.fromToken) {
        filteredOrders = filteredOrders.filter(order => order.fromToken === query.fromToken);
      }
      
      if (query.toToken) {
        filteredOrders = filteredOrders.filter(order => order.toToken === query.toToken);
      }
      
      if (query.orderType) {
        filteredOrders = filteredOrders.filter(order => order.orderType === query.orderType);
      }
      
      if (query.orderSide) {
        filteredOrders = filteredOrders.filter(order => order.orderSide === query.orderSide);
      }
      
      if (query.chainId) {
        filteredOrders = filteredOrders.filter(order => order.chainId === query.chainId);
      }
      
      if (query.status) {
        filteredOrders = filteredOrders.filter(order => order.status === query.status);
      }
      
      // Sort orders
      if (query.sortBy) {
        filteredOrders.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (query.sortBy) {
            case 'timestamp':
              aValue = a.timestamp;
              bValue = b.timestamp;
              break;
            case 'amount':
              aValue = parseFloat(a.fromAmount);
              bValue = parseFloat(b.fromAmount);
              break;
            case 'price':
              aValue = parseFloat(a.limitPrice || '0');
              bValue = parseFloat(b.limitPrice || '0');
              break;
            default:
              aValue = a.timestamp;
              bValue = b.timestamp;
          }
          
          if (query.sortOrder === 'desc') {
            return bValue - aValue;
          }
          return aValue - bValue;
        });
      }
      
      // Apply pagination
      const limit = query.limit || 50;
      const page = query.page || 1;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      logger.info('Orders queried successfully', { 
        total: filteredOrders.length,
        returned: paginatedOrders.length,
        page,
        limit
      });
      
      return paginatedOrders;
      
    } catch (error: any) {
      logger.error('Query orders error', { error: error.message, query });
      return [];
    }
  }
  
  /**
   * Get orderbook statistics
   */
  async getOrderbookStats(): Promise<OrderbookStats> {
    try {
      const orders = Array.from(this.orders.values());
      const activeOrders = orders.filter(order => order.status === OrderStatus.ACTIVE);
      
      // Calculate total volume
      const totalVolume = orders
        .filter(order => order.status === OrderStatus.FILLED)
        .reduce((sum, order) => sum + parseFloat(order.fromAmount), 0)
        .toString();
      
      // Calculate average order size
      const averageOrderSize = orders.length > 0 
        ? (orders.reduce((sum, order) => sum + parseFloat(order.fromAmount), 0) / orders.length).toString()
        : '0';
      
      // Get most active pairs
      const pairStats = new Map<string, { volume: number; count: number }>();
      orders.forEach(order => {
        const pair = `${order.fromToken}-${order.toToken}`;
        const current = pairStats.get(pair) || { volume: 0, count: 0 };
        current.volume += parseFloat(order.fromAmount);
        current.count += 1;
        pairStats.set(pair, current);
      });
      
      const mostActivePairs = Array.from(pairStats.entries())
        .map(([pair, stats]) => ({
          pair,
          volume: stats.volume.toString(),
          orderCount: stats.count
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5);
      
      // Get resolver bot stats
      const bots = Array.from(this.resolverBots.values());
      const onlineBots = bots.filter(bot => bot.isOnline);
      const whitelistedBots = bots.filter(bot => bot.isWhitelisted);
      
      const stats: OrderbookStats = {
        totalOrders: orders.length,
        activeOrders: activeOrders.length,
        totalVolume,
        averageOrderSize,
        mostActivePairs,
        resolverBots: {
          total: bots.length,
          online: onlineBots.length,
          whitelisted: whitelistedBots.length
        }
      };
      
      return stats;
      
    } catch (error: any) {
      logger.error('Get orderbook stats error', { error: error.message });
      return {
        totalOrders: 0,
        activeOrders: 0,
        totalVolume: '0',
        averageOrderSize: '0',
        mostActivePairs: [],
        resolverBots: {
          total: 0,
          online: 0,
          whitelisted: 0
        }
      };
    }
  }
  
  /**
   * Add resolver bot to whitelist
   */
  async addResolverBot(params: ResolverBotRequest): Promise<ResolverBotResponse> {
    try {
      logger.info('Adding resolver bot', { params });
      
      // Validate required fields
      if (!params.address || !params.name || !params.allowedPairs || !params.maxOrderSize || !params.minOrderSize) {
        return {
          success: false,
          error: 'Missing required fields: address, name, allowedPairs, maxOrderSize, minOrderSize'
        };
      }
      
      const bot: ResolverBot = {
        address: params.address,
        name: params.name,
        isWhitelisted: true,
        allowedPairs: params.allowedPairs,
        maxOrderSize: params.maxOrderSize,
        minOrderSize: params.minOrderSize,
        performanceMetrics: {
          totalOrdersFilled: 0,
          successRate: 100,
          averageExecutionTime: 0,
          totalVolume: '0',
          reputation: 100
        },
        lastActive: Date.now(),
        isOnline: true
      };
      
      this.resolverBots.set(params.address, bot);
      
      logger.info('Resolver bot added successfully', { 
        address: params.address,
        name: params.name
      });
      
      return {
        success: true,
        data: bot
      };
      
    } catch (error: any) {
      logger.error('Add resolver bot error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: 'Failed to add resolver bot'
      };
    }
  }
  
  /**
   * Update resolver bot status
   */
  async updateResolverBotStatus(botAddress: string, isOnline: boolean): Promise<ResolverBotResponse> {
    try {
      const bot = this.resolverBots.get(botAddress);
      if (!bot) {
        return {
          success: false,
          error: 'Resolver bot not found'
        };
      }
      
      bot.isOnline = isOnline;
      bot.lastActive = Date.now();
      
      this.resolverBots.set(botAddress, bot);
      
      logger.info('Resolver bot status updated', { 
        botAddress, 
        isOnline 
      });
      
      return {
        success: true,
        data: bot
      };
      
    } catch (error: any) {
      logger.error('Update resolver bot status error', { 
        error: error.message, 
        botAddress 
      });
      
      return {
        success: false,
        error: 'Failed to update resolver bot status'
      };
    }
  }
  
  /**
   * Get all resolver bots
   */
  async getResolverBots(): Promise<ResolverBot[]> {
    return Array.from(this.resolverBots.values());
  }
  
  /**
   * Clean up expired orders
   */
  async cleanupExpiredOrders(): Promise<void> {
    try {
      const now = Date.now();
      let expiredCount = 0;
      
      for (const [orderId, order] of this.orders.entries()) {
        if (order.status === OrderStatus.ACTIVE && now > order.deadline) {
          order.status = OrderStatus.EXPIRED;
          this.orders.set(orderId, order);
          expiredCount++;
        }
      }
      
      if (expiredCount > 0) {
        logger.info('Cleaned up expired orders', { expiredCount });
      }
      
    } catch (error: any) {
      logger.error('Cleanup expired orders error', { error: error.message });
    }
  }
  
  // Private helper methods
  
  private validateOrderRequest(params: OrderbookRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.userAddress) {
      errors.push('userAddress is required');
    }
    
    if (!params.fromToken) {
      errors.push('fromToken is required');
    }
    
    if (!params.toToken) {
      errors.push('toToken is required');
    }
    
    if (!params.amount) {
      errors.push('amount is required');
    }
    
    if (!params.orderType) {
      errors.push('orderType is required');
    }
    
    if (!params.orderSide) {
      errors.push('orderSide is required');
    }
    
    if (!params.chainId) {
      errors.push('chainId is required');
    }
    
    if (params.amount) {
      const amount = parseFloat(params.amount);
      if (amount < parseFloat(ORDERBOOK_CONSTANTS.MIN_ORDER_SIZE)) {
        errors.push(`Amount too small. Minimum: ${ORDERBOOK_CONSTANTS.MIN_ORDER_SIZE}`);
      }
      if (amount > parseFloat(ORDERBOOK_CONSTANTS.MAX_ORDER_SIZE)) {
        errors.push(`Amount too large. Maximum: ${ORDERBOOK_CONSTANTS.MAX_ORDER_SIZE}`);
      }
    }
    
    if (params.allowedSenders && params.allowedSenders.length > ORDERBOOK_CONSTANTS.MAX_ALLOWED_SENDERS) {
      errors.push(`Too many allowed senders. Maximum: ${ORDERBOOK_CONSTANTS.MAX_ALLOWED_SENDERS}`);
    }
    
    if (params.maxSlippage && (params.maxSlippage < 0 || params.maxSlippage > ORDERBOOK_CONSTANTS.MAX_SLIPPAGE)) {
      errors.push(`Invalid slippage. Must be between 0 and ${ORDERBOOK_CONSTANTS.MAX_SLIPPAGE}%`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private formatOrderData(params: OrderbookRequest): OrderData {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      orderId,
      userAddress: params.userAddress,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.amount,
      toAmount: params.amount, // Will be calculated by quote service
      limitPrice: params.limitPrice,
      orderType: params.orderType,
      orderSide: params.orderSide,
      chainId: params.chainId,
      deadline: params.deadline || (Date.now() + ORDERBOOK_CONSTANTS.ORDER_EXPIRY_TIME),
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      useMEVProtection: params.useMEVProtection || false,
      allowedSenders: params.allowedSenders,
      maxSlippage: params.maxSlippage || ORDERBOOK_CONSTANTS.DEFAULT_SLIPPAGE,
      executionAttempts: 0,
      fusionData: {
        isReady: false
      }
    };
  }
  
  private getUserOrderCount(userAddress: string): number {
    const userOrderSet = this.userOrders.get(userAddress);
    return userOrderSet ? userOrderSet.size : 0;
  }
  
  private initializeMockData(): void {
         // Add some mock resolver bots
     const mockBots: ResolverBot[] = [
       {
         address: '0xResolverBot1',
         name: 'Alpha Resolver',
         isWhitelisted: true,
         allowedPairs: ['0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b-0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '0xTokenA-0xTokenB'],
         maxOrderSize: 1000000000000000000000000, // 1M tokens in wei
         minOrderSize: 1000000000000000000, // 1 token in wei
         performanceMetrics: {
           totalOrdersFilled: 150,
           successRate: 98.5,
           averageExecutionTime: 2500,
           totalVolume: '500000000000000000000000',
           reputation: 95
         },
         lastActive: Date.now(),
         isOnline: true
       },
       {
         address: '0xResolverBot2',
         name: 'Beta Resolver',
         isWhitelisted: true,
         allowedPairs: ['0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b-0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '0xTokenB-0xTokenC'],
         maxOrderSize: 1000000000000000000000000, // 1M tokens in wei
         minOrderSize: 1000000000000000000, // 1 token in wei
         performanceMetrics: {
           totalOrdersFilled: 75,
           successRate: 96.2,
           averageExecutionTime: 3200,
           totalVolume: '250000000000000000000000',
           reputation: 88
         },
         lastActive: Date.now(),
         isOnline: true
       }
     ];
    
    mockBots.forEach(bot => {
      this.resolverBots.set(bot.address, bot);
    });
    
    logger.info('Orderbook service initialized with mock data', {
      resolverBots: mockBots.length
    });
  }
} 