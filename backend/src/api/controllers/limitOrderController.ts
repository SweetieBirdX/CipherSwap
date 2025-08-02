import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { 
  LimitOrderRequest, 
  LimitOrderResponse, 
  LimitOrderData 
} from '../../types/swap';
import { CustomOrderbookService } from '../../services/customOrderbookService';
import { CustomLimitOrderService } from '../../services/customLimitOrderService';
import { OnchainExecutionService } from '../../services/onchainExecutionService';
import { 
  ConditionalOrderParams, 
  DynamicPricingParams, 
  CustomStrategyParams 
} from '../../services/customLimitOrderService';
import { OnchainExecutionParams } from '../../services/onchainExecutionService';

export class LimitOrderController {
  private orderbookService: CustomOrderbookService;
  private customLimitOrderService: CustomLimitOrderService;
  private onchainExecutionService: OnchainExecutionService;
  
  constructor() {
    this.orderbookService = new CustomOrderbookService();
    this.customLimitOrderService = new CustomLimitOrderService();
    this.onchainExecutionService = new OnchainExecutionService();
    
    logger.info('LimitOrderController initialized', {
      timestamp: Date.now(),
      service: 'cipherswap-limit-order-controller'
    });
  }
  
  /**
   * Create basic limit order
   */
  createLimitOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderData: LimitOrderRequest = req.body;
      
      logger.info('Creating limit order via API', {
        fromToken: orderData.fromToken,
        toToken: orderData.toToken,
        userAddress: orderData.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      const result = await this.orderbookService.createCustomLimitOrder(orderData);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Limit order created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error: any) {
      logger.error('Create limit order API error', {
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Get order by ID
   */
  getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      
      const result = await this.orderbookService.getOrder(orderId);
      
      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
    } catch (error: any) {
      logger.error('Get order API error', {
        error: error.message,
        orderId: req.params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Get user orders
   */
  getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userAddress } = req.params;
      const { limit = 10, page = 1 } = req.query;
      
      const orders = await this.orderbookService.getUserOrders(
        userAddress, 
        Number(limit), 
        Number(page)
      );
      
      res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: orders.length
        }
      });
      
    } catch (error: any) {
      logger.error('Get user orders API error', {
        error: error.message,
        userAddress: req.params.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Cancel order
   */
  cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const { userAddress } = req.body;
      
      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: 'userAddress is required'
        });
        return;
      }
      
      const result = await this.orderbookService.cancelOrder(orderId, userAddress);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Order cancelled successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error: any) {
      logger.error('Cancel order API error', {
        error: error.message,
        orderId: req.params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Get order status
   */
  getOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      
      const result = await this.orderbookService.getOrderStatus(orderId);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
    } catch (error: any) {
      logger.error('Get order status API error', {
        error: error.message,
        orderId: req.params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Create conditional order
   */
  createConditionalOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderData: ConditionalOrderParams = req.body;
      
      logger.info('Creating conditional order via API', {
        fromToken: orderData.fromToken,
        toToken: orderData.toToken,
        triggerPrice: orderData.triggerPrice,
        triggerCondition: orderData.triggerCondition,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      const result = await this.customLimitOrderService.createConditionalOrder(orderData);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Conditional order created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error: any) {
      logger.error('Create conditional order API error', {
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Create dynamic pricing order
   */
  createDynamicPricingOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderData: DynamicPricingParams = req.body;
      
      logger.info('Creating dynamic pricing order via API', {
        fromToken: orderData.fromToken,
        toToken: orderData.toToken,
        basePrice: orderData.basePrice,
        priceAdjustment: orderData.priceAdjustment,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      const result = await this.customLimitOrderService.createDynamicPricingOrder(orderData);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Dynamic pricing order created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error: any) {
      logger.error('Create dynamic pricing order API error', {
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Execute custom strategy
   */
  executeCustomStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const strategyParams: CustomStrategyParams = req.body;
      
      logger.info('Executing custom strategy via API', {
        orderId,
        strategyType: strategyParams.strategyType,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      const result = await this.customLimitOrderService.executeCustomStrategy(orderId, strategyParams);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Custom strategy executed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error: any) {
      logger.error('Execute custom strategy API error', {
        error: error.message,
        orderId: req.params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Execute order onchain
   */
  executeOrderOnchain = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const executionParams: OnchainExecutionParams = {
        orderId,
        userAddress: req.body.userAddress,
        gasPrice: req.body.gasPrice,
        gasLimit: req.body.gasLimit,
        maxPriorityFeePerGas: req.body.maxPriorityFeePerGas,
        maxFeePerGas: req.body.maxFeePerGas
      };
      
      logger.info('Executing order onchain via API', {
        orderId,
        userAddress: executionParams.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      const result = await this.onchainExecutionService.executeLimitOrderOnchain(executionParams);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Order executed successfully onchain'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error: any) {
      logger.error('Execute order onchain API error', {
        error: error.message,
        orderId: req.params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Cancel order onchain
   */
  cancelOrderOnchain = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const { userAddress } = req.body;
      
      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: 'userAddress is required'
        });
        return;
      }
      
      logger.info('Cancelling order onchain via API', {
        orderId,
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      const result = await this.onchainExecutionService.cancelLimitOrderOnchain(orderId, userAddress);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Order cancelled successfully onchain'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error: any) {
      logger.error('Cancel order onchain API error', {
        error: error.message,
        orderId: req.params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Get transaction status
   */
  getTransactionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { txHash } = req.params;
      
      const result = await this.onchainExecutionService.getTransactionStatus(txHash);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }
      
    } catch (error: any) {
      logger.error('Get transaction status API error', {
        error: error.message,
        txHash: req.params.txHash,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Get orderbook statistics
   */
  getOrderbookStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.orderbookService.getOrderbookStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
      
    } catch (error: any) {
      logger.error('Get orderbook stats API error', {
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Get active orders
   */
  getActiveOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.orderbookService.getActiveOrders();
      
      res.status(200).json({
        success: true,
        data: orders
      });
      
    } catch (error: any) {
      logger.error('Get active orders API error', {
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Cleanup expired orders
   */
  cleanupExpiredOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.orderbookService.cleanupExpiredOrders();
      
      res.status(200).json({
        success: true,
        message: 'Expired orders cleaned up successfully'
      });
      
    } catch (error: any) {
      logger.error('Cleanup expired orders API error', {
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
  
  /**
   * Estimate gas for order execution
   */
  estimateGas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const { userAddress, gasPrice, gasLimit, maxPriorityFeePerGas, maxFeePerGas } = req.body;
      
      // Get order from orderbook
      const orderResponse = await this.orderbookService.getOrder(orderId);
      if (!orderResponse.success || !orderResponse.data) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }
      
      const order = orderResponse.data;
      
      // Estimate gas
      const result = await this.onchainExecutionService.estimateGasForExecution(order, {
        orderId,
        userAddress,
        gasPrice,
        gasLimit,
        maxPriorityFeePerGas,
        maxFeePerGas
      });
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
    } catch (error: any) {
      logger.error('Estimate gas API error', {
        error: error.message,
        orderId: req.params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-controller'
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
} 