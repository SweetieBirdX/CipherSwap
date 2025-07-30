import { Request, Response } from 'express';
import { OrderbookService } from '../../services/orderbookService';
import { 
  OrderbookRequest, 
  OrderbookQuery, 
  ResolverBotRequest,
  OrderStatus 
} from '../../types/orderbook';
import { logger } from '../../utils/logger';

export class OrderbookController {
  private orderbookService: OrderbookService;

  constructor() {
    this.orderbookService = new OrderbookService();
  }

  /**
   * Add order to off-chain orderbook
   * POST /api/orderbook/orders
   */
  async addOrder(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Orderbook add order request', { body: req.body });

      const {
        userAddress,
        fromToken,
        toToken,
        amount,
        orderType,
        orderSide,
        chainId,
        limitPrice,
        deadline,
        useMEVProtection,
        allowedSenders,
        maxSlippage
      } = req.body;

      // Validate required fields
      if (!userAddress || !fromToken || !toToken || !amount || !orderType || !orderSide || !chainId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userAddress, fromToken, toToken, amount, orderType, orderSide, chainId'
        });
        return;
      }

      const orderRequest: OrderbookRequest = {
        userAddress,
        fromToken,
        toToken,
        amount,
        orderType,
        orderSide,
        chainId,
        limitPrice,
        deadline,
        useMEVProtection,
        allowedSenders,
        maxSlippage
      };

      const result = await this.orderbookService.addOrder(orderRequest);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Order added to off-chain orderbook successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error: any) {
      logger.error('Orderbook add order error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get order by ID
   * GET /api/orderbook/orders/:orderId
   */
  async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
        return;
      }

      const result = await this.orderbookService.getOrder(orderId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }

    } catch (error: any) {
      logger.error('Orderbook get order error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Query orders with filters
   * GET /api/orderbook/orders
   */
  async queryOrders(req: Request, res: Response): Promise<void> {
    try {
      const {
        userAddress,
        fromToken,
        toToken,
        orderType,
        orderSide,
        chainId,
        status,
        limit,
        page,
        sortBy,
        sortOrder
      } = req.query;

      const query: OrderbookQuery = {
        userAddress: userAddress as string,
        fromToken: fromToken as string,
        toToken: toToken as string,
        orderType: orderType as 'swap' | 'limit',
        orderSide: orderSide as 'buy' | 'sell',
        chainId: chainId ? parseInt(chainId as string) : undefined,
        status: status as OrderStatus,
        limit: limit ? parseInt(limit as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        sortBy: sortBy as 'timestamp' | 'amount' | 'price',
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const orders = await this.orderbookService.queryOrders(query);

      res.status(200).json({
        success: true,
        data: orders,
        count: orders.length
      });

    } catch (error: any) {
      logger.error('Orderbook query orders error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update order status
   * PUT /api/orderbook/orders/:orderId/status
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { status, executionData } = req.body;

      if (!orderId || !status) {
        res.status(400).json({
          success: false,
          error: 'Order ID and status are required'
        });
        return;
      }

      // Validate status
      if (!Object.values(OrderStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid order status'
        });
        return;
      }

      const result = await this.orderbookService.updateOrderStatus(orderId, status, executionData);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Order status updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }

    } catch (error: any) {
      logger.error('Orderbook update order status error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get fillable orders for resolver bot
   * GET /api/orderbook/resolver/:botAddress/fillable-orders
   */
  async getFillableOrders(req: Request, res: Response): Promise<void> {
    try {
      const { botAddress } = req.params;

      if (!botAddress) {
        res.status(400).json({
          success: false,
          error: 'Bot address is required'
        });
        return;
      }

      const orders = await this.orderbookService.getFillableOrders(botAddress);

      res.status(200).json({
        success: true,
        data: orders,
        count: orders.length
      });

    } catch (error: any) {
      logger.error('Orderbook get fillable orders error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Validate resolver bot
   * GET /api/orderbook/resolver/:botAddress/validate
   */
  async validateResolver(req: Request, res: Response): Promise<void> {
    try {
      const { botAddress } = req.params;

      if (!botAddress) {
        res.status(400).json({
          success: false,
          error: 'Bot address is required'
        });
        return;
      }

      const isValid = await this.orderbookService.validateResolver(botAddress);

      res.status(200).json({
        success: true,
        data: {
          botAddress,
          isValid
        }
      });

    } catch (error: any) {
      logger.error('Orderbook validate resolver error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Add resolver bot to whitelist
   * POST /api/orderbook/resolver
   */
  async addResolverBot(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Orderbook add resolver bot request', { body: req.body });

      const {
        address,
        name,
        allowedPairs,
        maxOrderSize,
        minOrderSize
      } = req.body;

      // Validate required fields
      if (!address || !name || !allowedPairs || !maxOrderSize || !minOrderSize) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: address, name, allowedPairs, maxOrderSize, minOrderSize'
        });
        return;
      }

      const botRequest: ResolverBotRequest = {
        address,
        name,
        allowedPairs,
        maxOrderSize,
        minOrderSize
      };

      const result = await this.orderbookService.addResolverBot(botRequest);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Resolver bot added successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error: any) {
      logger.error('Orderbook add resolver bot error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update resolver bot status
   * PUT /api/orderbook/resolver/:botAddress/status
   */
  async updateResolverBotStatus(req: Request, res: Response): Promise<void> {
    try {
      const { botAddress } = req.params;
      const { isOnline } = req.body;

      if (!botAddress || typeof isOnline !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Bot address and isOnline status are required'
        });
        return;
      }

      const result = await this.orderbookService.updateResolverBotStatus(botAddress, isOnline);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Resolver bot status updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }

    } catch (error: any) {
      logger.error('Orderbook update resolver bot status error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get all resolver bots
   * GET /api/orderbook/resolver
   */
  async getResolverBots(req: Request, res: Response): Promise<void> {
    try {
      const bots = await this.orderbookService.getResolverBots();

      res.status(200).json({
        success: true,
        data: bots,
        count: bots.length
      });

    } catch (error: any) {
      logger.error('Orderbook get resolver bots error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get orderbook statistics
   * GET /api/orderbook/stats
   */
  async getOrderbookStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.orderbookService.getOrderbookStats();

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error: any) {
      logger.error('Orderbook get stats error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Clean up expired orders
   * POST /api/orderbook/cleanup
   */
  async cleanupExpiredOrders(req: Request, res: Response): Promise<void> {
    try {
      await this.orderbookService.cleanupExpiredOrders();

      res.status(200).json({
        success: true,
        message: 'Expired orders cleaned up successfully'
      });

    } catch (error: any) {
      logger.error('Orderbook cleanup expired orders error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
} 