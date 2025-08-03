import { logger } from '../utils/logger';
import { 
  LimitOrderRequest, 
  LimitOrderResponse, 
  LimitOrderData, 
  LimitOrderStatus 
} from '../types/swap';
import { LimitOrderSDKService } from './limitOrderSDKService';
import { LIMIT_ORDER_CONFIG } from '../config/limitOrderConfig';

export class CustomOrderbookService {
  private orders: Map<string, LimitOrderData> = new Map();
  private userOrders: Map<string, Set<string>> = new Map(); // userAddress -> Set<orderId>
  private sdkService: LimitOrderSDKService;
  
  constructor() {
    this.sdkService = new LimitOrderSDKService();
    logger.info('CustomOrderbookService initialized', {
      timestamp: Date.now(),
      service: 'cipherswap-custom-orderbook'
    });
  }
  
  /**
   * Create a custom limit order (no official API)
   */
  async createCustomLimitOrder(params: LimitOrderRequest): Promise<LimitOrderResponse> {
    try {
      logger.info('Creating custom limit order', { 
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          amount: params.amount,
          limitPrice: params.limitPrice,
          orderType: params.orderType,
          chainId: params.chainId,
          userAddress: params.userAddress
        },
        fullParams: params,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      // Validate request
      const validation = this.validateCustomLimitOrderRequest(params);
      logger.info('Validation result', {
        isValid: validation.isValid,
        errors: validation.errors,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      // Temporarily bypass validation for debugging
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Check user order limits - REMOVED FOR 1INCH INTEGRATION
      // const userOrderCount = this.getUserOrderCount(params.userAddress);
      // if (userOrderCount >= LIMIT_ORDER_CONFIG.ORDER.MAX_ORDERS_PER_USER || 10) {
      //   return {
      //     success: false,
      //     error: `Maximum orders per user exceeded (10)`
      //   };
      // }
      
      // Create order using SDK (no official API)
      const sdkResponse = await this.sdkService.createLimitOrder(params);
      
      if (!sdkResponse.success) {
        logger.error('SDK limit order creation failed', {
          error: sdkResponse.error,
          params: {
            fromToken: params.fromToken,
            toToken: params.toToken,
            userAddress: params.userAddress
          },
          timestamp: Date.now(),
          service: 'cipherswap-custom-orderbook'
        });
        return {
          success: false,
          error: `Custom limit order creation failed: ${sdkResponse.error}`
        };
      }
      
      // Store order in custom system
      const orderData = sdkResponse.data!;
      this.orders.set(orderData.orderId, orderData);
      
      // Update user orders index
      if (!this.userOrders.has(params.userAddress)) {
        this.userOrders.set(params.userAddress, new Set());
      }
      this.userOrders.get(params.userAddress)!.add(orderData.orderId);
      
      logger.info('Custom limit order created successfully', { 
        orderId: orderData.orderId,
        userAddress: params.userAddress,
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        limitPrice: params.limitPrice,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('Custom limit order creation error', { 
        error: error.message, 
        stack: error.stack,
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          userAddress: params.userAddress
        },
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      return {
        success: false,
        error: `Custom limit order creation failed: ${error.message}`
      };
    }
  }
  
  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<LimitOrderResponse> {
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
      logger.error('Get order error', { 
        error: error.message, 
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      return {
        success: false,
        error: 'Failed to get order'
      };
    }
  }
  
  /**
   * Get user orders
   */
  async getUserOrders(userAddress: string, limit: number = 10, page: number = 1): Promise<LimitOrderData[]> {
    try {
      const userOrderSet = this.userOrders.get(userAddress);
      if (!userOrderSet) {
        return [];
      }
      
      const userOrderIds = Array.from(userOrderSet);
      const userOrders: LimitOrderData[] = [];
      
      for (const orderId of userOrderIds) {
        const order = this.orders.get(orderId);
        if (order) {
          userOrders.push(order);
        }
      }
      
      // Sort by timestamp (newest first)
      userOrders.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return userOrders.slice(startIndex, endIndex);
      
    } catch (error: any) {
      logger.error('Get user orders error', { 
        error: error.message, 
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      return [];
    }
  }
  
  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userAddress: string): Promise<LimitOrderResponse> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found'
        };
      }
      
      // Check ownership
      if (order.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to cancel this order'
        };
      }
      
      // Cancel order using SDK
      const sdkResponse = await this.sdkService.cancelOrder(orderId);
      
      if (!sdkResponse.success) {
        return {
          success: false,
          error: sdkResponse.error
        };
      }
      
      // Update order status
      order.status = LimitOrderStatus.CANCELLED;
      this.orders.set(orderId, order);
      
      logger.info('Order cancelled successfully', { 
        orderId,
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      return {
        success: true,
        data: order
      };
      
    } catch (error: any) {
      logger.error('Cancel order error', { 
        error: error.message, 
        orderId,
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      return {
        success: false,
        error: 'Failed to cancel order'
      };
    }
  }
  
  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<LimitOrderResponse> {
    try {
      // Get status from SDK (onchain)
      const sdkResponse = await this.sdkService.getOrderStatus(orderId);
      
      if (!sdkResponse.success) {
        return {
          success: false,
          error: sdkResponse.error
        };
      }
      
      // Update local order if exists
      const localOrder = this.orders.get(orderId);
      if (localOrder) {
        localOrder.status = sdkResponse.data!.status;
        this.orders.set(orderId, localOrder);
      }
      
      return {
        success: true,
        data: sdkResponse.data!
      };
      
    } catch (error: any) {
      logger.error('Get order status error', { 
        error: error.message, 
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      return {
        success: false,
        error: 'Failed to get order status'
      };
    }
  }
  
  /**
   * Get all active orders
   */
  async getActiveOrders(): Promise<LimitOrderData[]> {
    try {
      const activeOrders: LimitOrderData[] = [];
      
      for (const order of this.orders.values()) {
        if (order.status === LimitOrderStatus.PENDING) {
          activeOrders.push(order);
        }
      }
      
      return activeOrders;
      
    } catch (error: any) {
      logger.error('Get active orders error', { 
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      return [];
    }
  }
  
  /**
   * Clean up expired orders
   */
  async cleanupExpiredOrders(): Promise<void> {
    try {
      const now = Date.now();
      let expiredCount = 0;
      
      for (const [orderId, order] of this.orders.entries()) {
        if (order.status === LimitOrderStatus.PENDING && now > order.deadline * 1000) {
          order.status = LimitOrderStatus.EXPIRED;
          this.orders.set(orderId, order);
          expiredCount++;
        }
      }
      
      if (expiredCount > 0) {
        logger.info('Cleaned up expired orders', { 
          expiredCount,
          timestamp: Date.now(),
          service: 'cipherswap-custom-orderbook'
        });
      }
      
    } catch (error: any) {
      logger.error('Cleanup expired orders error', { 
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
    }
  }
  
  /**
   * Store custom order in orderbook
   */
  async storeCustomOrder(orderData: LimitOrderData): Promise<void> {
    try {
      logger.info('Storing custom order in orderbook', {
        orderId: orderData.orderId,
        userAddress: orderData.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      // Store order
      this.orders.set(orderData.orderId, orderData);
      
      // Update user orders index
      if (!this.userOrders.has(orderData.userAddress)) {
        this.userOrders.set(orderData.userAddress, new Set());
      }
      this.userOrders.get(orderData.userAddress)!.add(orderData.orderId);
      
      logger.info('Custom order stored successfully', {
        orderId: orderData.orderId,
        userAddress: orderData.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
    } catch (error: any) {
      logger.error('Store custom order error', {
        error: error.message,
        orderId: orderData.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      throw error;
    }
  }
  
  /**
   * Update existing order in orderbook
   */
  async updateOrder(orderId: string, updatedOrder: LimitOrderData): Promise<void> {
    try {
      logger.info('Updating order in orderbook', {
        orderId,
        userAddress: updatedOrder.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      // Check if order exists
      if (!this.orders.has(orderId)) {
        throw new Error('Order not found');
      }
      
      // Update order
      this.orders.set(orderId, updatedOrder);
      
      logger.info('Order updated successfully', {
        orderId,
        userAddress: updatedOrder.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
    } catch (error: any) {
      logger.error('Update order error', {
        error: error.message,
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      throw error;
    }
  }
  
  /**
   * Update order status only
   */
  async updateOrderStatus(orderId: string, status: LimitOrderStatus): Promise<void> {
    try {
      logger.info('Updating order status', {
        orderId,
        status,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      // Check if order exists
      if (!this.orders.has(orderId)) {
        throw new Error('Order not found');
      }
      
      // Get current order
      const order = this.orders.get(orderId)!;
      
      // Update status
      order.status = status;
      
      // Update order
      this.orders.set(orderId, order);
      
      logger.info('Order status updated successfully', {
        orderId,
        status,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
    } catch (error: any) {
      logger.error('Update order status error', {
        error: error.message,
        orderId,
        status,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      throw error;
    }
  }
  
  /**
   * Get orderbook statistics
   */
  async getOrderbookStats(): Promise<{
    totalOrders: number;
    activeOrders: number;
    cancelledOrders: number;
    expiredOrders: number;
    totalUsers: number;
  }> {
    try {
      const orders = Array.from(this.orders.values());
      const activeOrders = orders.filter(order => order.status === LimitOrderStatus.PENDING);
      const cancelledOrders = orders.filter(order => order.status === LimitOrderStatus.CANCELLED);
      const expiredOrders = orders.filter(order => order.status === LimitOrderStatus.EXPIRED);
      
      const stats = {
        totalOrders: orders.length,
        activeOrders: activeOrders.length,
        cancelledOrders: cancelledOrders.length,
        expiredOrders: expiredOrders.length,
        totalUsers: this.userOrders.size
      };
      
      return stats;
      
    } catch (error: any) {
      logger.error('Get orderbook stats error', { 
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-custom-orderbook'
      });
      
      return {
        totalOrders: 0,
        activeOrders: 0,
        cancelledOrders: 0,
        expiredOrders: 0,
        totalUsers: 0
      };
    }
  }
  
  // Private helper methods
  
  private validateCustomLimitOrderRequest(params: LimitOrderRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    // Required fields
    if (!params.fromToken) {
      errors.push('fromToken is required');
    }
    if (!params.toToken) {
      errors.push('toToken is required');
    }
    if (!params.amount) {
      errors.push('amount is required');
    }
    if (params.chainId === undefined || params.chainId === null) {
      errors.push('chainId is required');
    }
    if (!params.userAddress) {
      errors.push('userAddress is required');
    }
    if (!params.limitPrice) {
      errors.push('limitPrice is required');
    }
    if (params.orderType === undefined || params.orderType === null) {
      errors.push('orderType is required');
    }
    // Amount validation
    if (params.amount) {
      const amount = parseFloat(params.amount);
      if (amount <= 0) {
        errors.push('Amount must be greater than 0');
      }
    }
    // Price validation
    if (params.limitPrice && parseFloat(params.limitPrice) <= 0) {
      errors.push('Limit price must be greater than 0');
    }
    // Order type validation
    if (params.orderType && !['buy', 'sell'].includes(params.orderType)) {
      errors.push('Order type must be either "buy" or "sell"');
    }
    // Token validation
    if (params.fromToken === params.toToken) {
      errors.push('fromToken and toToken cannot be the same');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private getUserOrderCount(userAddress: string): number {
    const userOrderSet = this.userOrders.get(userAddress);
    return userOrderSet ? userOrderSet.size : 0;
  }
} 