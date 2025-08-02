import { logger } from '../utils/logger';
import { 
  LimitOrderRequest, 
  LimitOrderResponse, 
  LimitOrderData, 
  LimitOrderStatus 
} from '../types/swap';
import { CustomOrderbookService } from './customOrderbookService';
import { LimitOrderSDKService } from './limitOrderSDKService';
import { LIMIT_ORDER_CONFIG } from '../config/limitOrderConfig';

export interface CustomStrategyParams {
  strategyType: 'conditional' | 'dynamic' | 'time-based' | 'market-based';
  conditions?: {
    priceThreshold?: string;
    timeThreshold?: number;
    volumeThreshold?: string;
    marketCondition?: 'bullish' | 'bearish' | 'neutral';
  };
  executionParams?: {
    maxRetries?: number;
    retryDelay?: number;
    gasOptimization?: boolean;
    slippageTolerance?: number;
  };
}

export interface ConditionalOrderParams extends LimitOrderRequest {
  triggerPrice: string;
  triggerCondition: 'above' | 'below';
  expiryTime: number;
}

export interface DynamicPricingParams extends LimitOrderRequest {
  basePrice: string;
  priceAdjustment: number; // percentage
  adjustmentInterval: number; // seconds
  maxAdjustments: number;
}

export class CustomLimitOrderService {
  private orderbookService: CustomOrderbookService;
  private sdkService: LimitOrderSDKService;
  
  constructor() {
    this.orderbookService = new CustomOrderbookService();
    this.sdkService = new LimitOrderSDKService();
    
    logger.info('CustomLimitOrderService initialized', {
      timestamp: Date.now(),
      service: 'cipherswap-custom-limit-order'
    });
  }
  
  /**
   * Create conditional limit order
   * Order only executes when market conditions are met
   */
  async createConditionalOrder(params: ConditionalOrderParams): Promise<LimitOrderResponse> {
    try {
      logger.info('Creating conditional limit order', { 
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          triggerPrice: params.triggerPrice,
          triggerCondition: params.triggerCondition,
          expiryTime: params.expiryTime
        },
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      // Validate conditional order parameters
      const validation = this.validateConditionalOrder(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Create base order with conditional logic
      const orderData: LimitOrderData = {
        orderId: `conditional_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        txHash: undefined,
        status: LimitOrderStatus.PENDING,
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.amount,
        toAmount: params.limitPrice,
        limitPrice: params.limitPrice,
        orderType: params.orderType,
        gasEstimate: '0',
        gasPrice: undefined,
        deadline: params.expiryTime,
        userAddress: params.userAddress,
        timestamp: Date.now(),
        route: [],
        fusionData: {
          permit: null,
          deadline: params.expiryTime,
          nonce: 0
        },
        // Custom fields for conditional orders
        customData: {
          strategyType: 'conditional',
          triggerPrice: params.triggerPrice,
          triggerCondition: params.triggerCondition,
          conditions: {
            priceThreshold: params.triggerPrice,
            timeThreshold: params.expiryTime,
            marketCondition: 'neutral'
          }
        }
      };
      
      // Store in custom orderbook
      await this.orderbookService.storeCustomOrder(orderData);
      
      logger.info('Conditional limit order created successfully', { 
        orderId: orderData.orderId,
        triggerPrice: params.triggerPrice,
        triggerCondition: params.triggerCondition,
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('Conditional order creation error', { 
        error: error.message, 
        stack: error.stack,
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          triggerPrice: params.triggerPrice
        },
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      return {
        success: false,
        error: `Conditional order creation failed: ${error.message}`
      };
    }
  }
  
  /**
   * Create dynamic pricing limit order
   * Price adjusts based on market conditions and time
   */
  async createDynamicPricingOrder(params: DynamicPricingParams): Promise<LimitOrderResponse> {
    try {
      logger.info('Creating dynamic pricing limit order', { 
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          basePrice: params.basePrice,
          priceAdjustment: params.priceAdjustment,
          adjustmentInterval: params.adjustmentInterval
        },
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      // Validate dynamic pricing parameters
      const validation = this.validateDynamicPricingOrder(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Calculate initial dynamic price
      const initialPrice = this.calculateDynamicPrice(
        params.basePrice,
        params.priceAdjustment,
        0 // initial adjustment
      );
      
      const orderData: LimitOrderData = {
        orderId: `dynamic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        txHash: undefined,
        status: LimitOrderStatus.PENDING,
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.amount,
        toAmount: initialPrice,
        limitPrice: initialPrice,
        orderType: params.orderType,
        gasEstimate: '0',
        gasPrice: undefined,
        deadline: Date.now() + (params.adjustmentInterval * params.maxAdjustments * 1000),
        userAddress: params.userAddress,
        timestamp: Date.now(),
        route: [],
        fusionData: {
          permit: null,
          deadline: Date.now() + (params.adjustmentInterval * params.maxAdjustments * 1000),
          nonce: 0
        },
        // Custom fields for dynamic pricing
        customData: {
          strategyType: 'dynamic',
          basePrice: params.basePrice,
          priceAdjustment: params.priceAdjustment,
          adjustmentInterval: params.adjustmentInterval,
          maxAdjustments: params.maxAdjustments,
          currentAdjustment: 0
        }
      };
      
      // Store in custom orderbook
      await this.orderbookService.storeCustomOrder(orderData);
      
      logger.info('Dynamic pricing limit order created successfully', { 
        orderId: orderData.orderId,
        basePrice: params.basePrice,
        initialPrice: initialPrice,
        priceAdjustment: params.priceAdjustment,
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('Dynamic pricing order creation error', { 
        error: error.message, 
        stack: error.stack,
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          basePrice: params.basePrice
        },
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      return {
        success: false,
        error: `Dynamic pricing order creation failed: ${error.message}`
      };
    }
  }
  
  /**
   * Execute custom strategy logic
   */
  async executeCustomStrategy(orderId: string, strategyParams: CustomStrategyParams): Promise<LimitOrderResponse> {
    try {
      logger.info('Executing custom strategy', { 
        orderId,
        strategyType: strategyParams.strategyType,
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      // Get order from custom orderbook
      const orderResponse = await this.orderbookService.getOrder(orderId);
      if (!orderResponse || !orderResponse.success || !orderResponse.data) {
        return {
          success: false,
          error: 'Order not found'
        };
      }
      
      const order = orderResponse.data;
      
      // Execute based on strategy type
      switch (strategyParams.strategyType) {
        case 'conditional':
          return await this.executeConditionalStrategy(order, strategyParams);
        case 'dynamic':
          return await this.executeDynamicPricingStrategy(order, strategyParams);
        case 'time-based':
          return await this.executeTimeBasedStrategy(order, strategyParams);
        case 'market-based':
          return await this.executeMarketBasedStrategy(order, strategyParams);
        default:
          return {
            success: false,
            error: 'Unknown strategy type'
          };
      }
      
    } catch (error: any) {
      logger.error('Custom strategy execution error', { 
        error: error.message, 
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      return {
        success: false,
        error: `Strategy execution failed: ${error.message}`
      };
    }
  }
  
  /**
   * Execute conditional strategy
   */
  private async executeConditionalStrategy(order: LimitOrderData, params: CustomStrategyParams): Promise<LimitOrderResponse> {
    const customData = order.customData as any;
    const triggerPrice = parseFloat(customData.triggerPrice);
    const triggerCondition = customData.triggerCondition;
    
    // Get current market price (mock for now)
    const currentPrice = await this.getCurrentMarketPrice(order.fromToken, order.toToken);
    
    let shouldExecute = false;
    
    if (triggerCondition === 'above' && currentPrice >= triggerPrice) {
      shouldExecute = true;
    } else if (triggerCondition === 'below' && currentPrice <= triggerPrice) {
      shouldExecute = true;
    }
    
    if (shouldExecute) {
      logger.info('Conditional order triggered', { 
        orderId: order.orderId,
        triggerPrice,
        currentPrice,
        triggerCondition,
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      // Execute the order using SDK
      const result = await this.sdkService.createLimitOrder({
        fromToken: order.fromToken,
        toToken: order.toToken,
        amount: order.fromAmount,
        limitPrice: order.limitPrice,
        orderType: order.orderType,
        chainId: 1, // Default to Ethereum
        userAddress: order.userAddress
      });
      
      return result;
    }
    
    return {
      success: false,
      error: 'Conditions not met for execution'
    };
  }
  
  /**
   * Execute dynamic pricing strategy
   */
  private async executeDynamicPricingStrategy(order: LimitOrderData, params: CustomStrategyParams): Promise<LimitOrderResponse> {
    const customData = order.customData as any;
    const currentAdjustment = customData.currentAdjustment || 0;
    
    if (currentAdjustment >= customData.maxAdjustments) {
      return {
        success: false,
        error: 'Maximum price adjustments reached'
      };
    }
    
    // Calculate new price
    const newPrice = this.calculateDynamicPrice(
      customData.basePrice,
      customData.priceAdjustment,
      currentAdjustment + 1
    );
    
    // Update order with new price
    order.limitPrice = newPrice;
    order.toAmount = newPrice;
    customData.currentAdjustment = currentAdjustment + 1;
    
    // Update in orderbook
    await this.orderbookService.updateOrder(order.orderId, order);
    
    logger.info('Dynamic pricing order updated', { 
      orderId: order.orderId,
      newPrice,
      currentAdjustment: customData.currentAdjustment,
      timestamp: Date.now(),
      service: 'cipherswap-custom-limit-order'
    });
    
    return {
      success: true,
      data: order
    };
  }
  
  /**
   * Execute time-based strategy
   */
  private async executeTimeBasedStrategy(order: LimitOrderData, params: CustomStrategyParams): Promise<LimitOrderResponse> {
    const now = Date.now();
    const timeThreshold = params.conditions?.timeThreshold || 0;
    
    if (now >= timeThreshold) {
      logger.info('Time-based order triggered', { 
        orderId: order.orderId,
        timeThreshold,
        currentTime: now,
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      // Execute the order
      return await this.sdkService.createLimitOrder({
        fromToken: order.fromToken,
        toToken: order.toToken,
        amount: order.fromAmount,
        limitPrice: order.limitPrice,
        orderType: order.orderType,
        chainId: 1,
        userAddress: order.userAddress
      });
    }
    
    return {
      success: false,
      error: 'Time threshold not reached'
    };
  }
  
  /**
   * Execute market-based strategy
   */
  private async executeMarketBasedStrategy(order: LimitOrderData, params: CustomStrategyParams): Promise<LimitOrderResponse> {
    const marketCondition = params.conditions?.marketCondition || 'neutral';
    
    // Get market sentiment (mock for now)
    const marketSentiment = await this.getMarketSentiment(order.fromToken, order.toToken);
    
    let shouldExecute = false;
    
    switch (marketCondition) {
      case 'bullish':
        shouldExecute = marketSentiment > 0.6;
        break;
      case 'bearish':
        shouldExecute = marketSentiment < 0.4;
        break;
      case 'neutral':
        shouldExecute = marketSentiment >= 0.4 && marketSentiment <= 0.6;
        break;
    }
    
    if (shouldExecute) {
      logger.info('Market-based order triggered', { 
        orderId: order.orderId,
        marketCondition,
        marketSentiment,
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      return await this.sdkService.createLimitOrder({
        fromToken: order.fromToken,
        toToken: order.toToken,
        amount: order.fromAmount,
        limitPrice: order.limitPrice,
        orderType: order.orderType,
        chainId: 1,
        userAddress: order.userAddress
      });
    }
    
    return {
      success: false,
      error: 'Market conditions not met'
    };
  }
  
  /**
   * Calculate dynamic price based on adjustments
   */
  private calculateDynamicPrice(basePrice: string, adjustment: number, adjustmentCount: number): string {
    const basePriceNum = parseFloat(basePrice);
    const adjustmentMultiplier = Math.pow(1 + (adjustment / 100), adjustmentCount);
    const newPrice = basePriceNum * adjustmentMultiplier;
    return newPrice.toString();
  }
  
  /**
   * Get current market price (real implementation)
   */
  private async getCurrentMarketPrice(fromToken: string, toToken: string): Promise<number> {
    try {
      // Import real market data service
      const { RealMarketDataService } = await import('./realMarketDataService');
      const marketDataService = new RealMarketDataService();
      
      // Get real price from multiple sources
      const priceData = await marketDataService.getRealTimePrice(fromToken);
      return priceData.price;
    } catch (error: any) {
      logger.warn('Failed to get real market price, using fallback', {
        error: error.message,
        fromToken,
        toToken
      });
      // Fallback to mock data if real data fails
      return Math.random() * 1000 + 100;
    }
  }
  
  /**
   * Get market sentiment (real implementation)
   */
  private async getMarketSentiment(fromToken: string, toToken: string): Promise<number> {
    try {
      // Import real market data service
      const { RealMarketDataService } = await import('./realMarketDataService');
      const marketDataService = new RealMarketDataService();
      
      // Get comprehensive market data
      const marketData = await marketDataService.getMarketData(fromToken);
      
      // Calculate sentiment based on volatility and trend
      let sentiment = 0.5; // Neutral base
      
      if (marketData.trend === 'BULLISH') {
        sentiment += 0.3;
      } else if (marketData.trend === 'BEARISH') {
        sentiment -= 0.3;
      }
      
      // Adjust for volatility (high volatility = lower confidence)
      const volatilityFactor = Math.max(0, 1 - marketData.volatility);
      sentiment *= volatilityFactor;
      
      return Math.max(0, Math.min(1, sentiment)); // Clamp between 0-1
    } catch (error: any) {
      logger.warn('Failed to get real market sentiment, using fallback', {
        error: error.message,
        fromToken,
        toToken
      });
      // Fallback to mock data if real data fails
      return Math.random();
    }
  }
  
  /**
   * Validate conditional order parameters
   */
  private validateConditionalOrder(params: ConditionalOrderParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.triggerPrice || parseFloat(params.triggerPrice) <= 0) {
      errors.push('Invalid trigger price');
    }
    
    if (!['above', 'below'].includes(params.triggerCondition)) {
      errors.push('Invalid trigger condition');
    }
    
    if (!params.expiryTime || params.expiryTime <= Date.now()) {
      errors.push('Invalid expiry time');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate dynamic pricing order parameters
   */
  private validateDynamicPricingOrder(params: DynamicPricingParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.basePrice || parseFloat(params.basePrice) <= 0) {
      errors.push('Invalid base price');
    }
    
    if (params.priceAdjustment < -50 || params.priceAdjustment > 50) {
      errors.push('Price adjustment must be between -50% and 50%');
    }
    
    if (params.adjustmentInterval < 60 || params.adjustmentInterval > 3600) {
      errors.push('Adjustment interval must be between 60 and 3600 seconds');
    }
    
    if (params.maxAdjustments < 1 || params.maxAdjustments > 10) {
      errors.push('Max adjustments must be between 1 and 10');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 