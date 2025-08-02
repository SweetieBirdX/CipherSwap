import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CustomLimitOrderService } from '../src/services/customLimitOrderService';
import { LimitOrderStatus } from '../src/types/swap';
import { ConditionalOrderParams, DynamicPricingParams, CustomStrategyParams } from '../src/services/customLimitOrderService';

// Mock CustomOrderbookService
jest.mock('../src/services/customOrderbookService', () => ({
  CustomOrderbookService: jest.fn().mockImplementation(() => ({
    storeCustomOrder: jest.fn().mockResolvedValue(undefined),
    getOrder: jest.fn().mockResolvedValue({
      success: true,
      data: {
        orderId: 'test-order-123',
        status: LimitOrderStatus.PENDING,
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        fromAmount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        userAddress: '0x1234567890123456789012345678901234567890',
        deadline: Date.now() + 3600000,
        timestamp: Date.now(),
        customData: {
          strategyType: 'conditional',
          triggerPrice: '1500000000000000000',
          triggerCondition: 'above'
        }
      }
    }),
    updateOrder: jest.fn().mockResolvedValue(undefined)
  }))
}));

// Mock LimitOrderSDKService
jest.mock('../src/services/limitOrderSDKService', () => ({
  LimitOrderSDKService: jest.fn().mockImplementation(() => ({
    createLimitOrder: jest.fn().mockResolvedValue({
      success: true,
      data: {
        orderId: 'executed-order-123',
        status: LimitOrderStatus.EXECUTED,
        txHash: '0x1234567890123456789012345678901234567890123456789012345678901234'
      }
    })
  }))
}));

// Mock logger
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('CustomLimitOrderService', () => {
  let service: CustomLimitOrderService;

  beforeEach(() => {
    service = new CustomLimitOrderService();
  });

  describe('createConditionalOrder', () => {
    it('should create conditional order successfully', async () => {
      const orderParams: ConditionalOrderParams = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        triggerPrice: '1500000000000000000',
        triggerCondition: 'above',
        expiryTime: Date.now() + 3600000
      };

      const result = await service.createConditionalOrder(orderParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.orderId).toContain('conditional_');
      expect(result.data?.status).toBe(LimitOrderStatus.PENDING);
      expect(result.data?.customData).toBeDefined();
      expect(result.data?.customData.strategyType).toBe('conditional');
      expect(result.data?.customData.triggerPrice).toBe(orderParams.triggerPrice);
      expect(result.data?.customData.triggerCondition).toBe(orderParams.triggerCondition);
    });

    it('should reject conditional order with invalid trigger price', async () => {
      const invalidParams: ConditionalOrderParams = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        triggerPrice: '0', // Invalid trigger price
        triggerCondition: 'above',
        expiryTime: Date.now() + 3600000
      };

      const result = await service.createConditionalOrder(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid trigger price');
    });

    it('should reject conditional order with invalid trigger condition', async () => {
      const invalidParams: ConditionalOrderParams = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        triggerPrice: '1500000000000000000',
        triggerCondition: 'invalid' as any,
        expiryTime: Date.now() + 3600000
      };

      const result = await service.createConditionalOrder(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid trigger condition');
    });

    it('should reject conditional order with expired time', async () => {
      const invalidParams: ConditionalOrderParams = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        triggerPrice: '1500000000000000000',
        triggerCondition: 'above',
        expiryTime: Date.now() - 3600000 // Expired time
      };

      const result = await service.createConditionalOrder(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid expiry time');
    });
  });

  describe('createDynamicPricingOrder', () => {
    it('should create dynamic pricing order successfully', async () => {
      const orderParams: DynamicPricingParams = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        basePrice: '2000000000000000000',
        priceAdjustment: 5.0, // 5% increase
        adjustmentInterval: 300, // 5 minutes
        maxAdjustments: 3
      };

      const result = await service.createDynamicPricingOrder(orderParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.orderId).toContain('dynamic_');
      expect(result.data?.status).toBe(LimitOrderStatus.PENDING);
      expect(result.data?.customData).toBeDefined();
      expect(result.data?.customData.strategyType).toBe('dynamic');
      expect(result.data?.customData.basePrice).toBe(orderParams.basePrice);
      expect(result.data?.customData.priceAdjustment).toBe(orderParams.priceAdjustment);
      expect(result.data?.customData.adjustmentInterval).toBe(orderParams.adjustmentInterval);
      expect(result.data?.customData.maxAdjustments).toBe(orderParams.maxAdjustments);
    });

    it('should reject dynamic pricing order with invalid base price', async () => {
      const invalidParams: DynamicPricingParams = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        basePrice: '0', // Invalid base price
        priceAdjustment: 5.0,
        adjustmentInterval: 300,
        maxAdjustments: 3
      };

      const result = await service.createDynamicPricingOrder(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid base price');
    });

    it('should reject dynamic pricing order with invalid price adjustment', async () => {
      const invalidParams: DynamicPricingParams = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        basePrice: '2000000000000000000',
        priceAdjustment: 75.0, // Invalid: > 50%
        adjustmentInterval: 300,
        maxAdjustments: 3
      };

      const result = await service.createDynamicPricingOrder(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Price adjustment must be between -50% and 50%');
    });

    it('should reject dynamic pricing order with invalid adjustment interval', async () => {
      const invalidParams: DynamicPricingParams = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        basePrice: '2000000000000000000',
        priceAdjustment: 5.0,
        adjustmentInterval: 30, // Invalid: < 60 seconds
        maxAdjustments: 3
      };

      const result = await service.createDynamicPricingOrder(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Adjustment interval must be between 60 and 3600 seconds');
    });
  });

  describe('executeCustomStrategy', () => {
    it('should execute conditional strategy successfully', async () => {
      const orderId = 'test-order-123';
      const strategyParams: CustomStrategyParams = {
        strategyType: 'conditional',
        conditions: {
          priceThreshold: '1500000000000000000',
          marketCondition: 'neutral'
        }
      };

      const result = await service.executeCustomStrategy(orderId, strategyParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should execute dynamic pricing strategy successfully', async () => {
      const orderId = 'test-order-123';
      const strategyParams: CustomStrategyParams = {
        strategyType: 'dynamic',
        executionParams: {
          maxRetries: 3,
          retryDelay: 1000
        }
      };

      const result = await service.executeCustomStrategy(orderId, strategyParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should execute time-based strategy successfully', async () => {
      const orderId = 'test-order-123';
      const strategyParams: CustomStrategyParams = {
        strategyType: 'time-based',
        conditions: {
          timeThreshold: Date.now() + 3600000 // 1 hour from now
        }
      };

      const result = await service.executeCustomStrategy(orderId, strategyParams);

      expect(result.success).toBe(false); // Should fail because time threshold not reached
      expect(result.error).toContain('Time threshold not reached');
    });

    it('should execute market-based strategy successfully', async () => {
      const orderId = 'test-order-123';
      const strategyParams: CustomStrategyParams = {
        strategyType: 'market-based',
        conditions: {
          marketCondition: 'bullish'
        }
      };

      const result = await service.executeCustomStrategy(orderId, strategyParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject execution for non-existent order', async () => {
      // Mock getOrder to return not found
      const mockOrderbookService = require('../src/services/customOrderbookService').CustomOrderbookService;
      mockOrderbookService.mockImplementation(() => ({
        getOrder: jest.fn().mockResolvedValue({
          success: false,
          error: 'Order not found'
        })
      }));

      const orderId = 'non-existent-order';
      const strategyParams: CustomStrategyParams = {
        strategyType: 'conditional'
      };

      const result = await service.executeCustomStrategy(orderId, strategyParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });

    it('should reject execution for unknown strategy type', async () => {
      const orderId = 'test-order-123';
      const strategyParams: CustomStrategyParams = {
        strategyType: 'unknown' as any
      };

      const result = await service.executeCustomStrategy(orderId, strategyParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown strategy type');
    });
  });

  describe('calculateDynamicPrice', () => {
    it('should calculate dynamic price correctly', () => {
      const basePrice = '1000000000000000000'; // 1 token
      const adjustment = 10; // 10% increase
      const adjustmentCount = 2;

      // This is a private method, so we need to access it through reflection
      const service = new CustomLimitOrderService();
      const calculateDynamicPrice = (service as any).calculateDynamicPrice;

      const result = calculateDynamicPrice(basePrice, adjustment, adjustmentCount);

      // Expected: 1 * (1.1)^2 = 1.21
      const expectedPrice = (parseFloat(basePrice) * Math.pow(1.1, 2)).toString();
      expect(result).toBe(expectedPrice);
    });
  });
}); 