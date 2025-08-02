import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LimitOrderSDKService } from '../src/services/limitOrderSDKService';
import { LimitOrderRequest, LimitOrderStatus } from '../src/types/swap';

// Mock ethers
jest.mock('ethers', () => ({
  Wallet: jest.fn().mockImplementation(() => ({
    address: '0x1234567890123456789012345678901234567890',
    signTypedData: jest.fn().mockResolvedValue('0xsignature123')
  })),
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1 })
  }))
}));

// Mock config
jest.mock('../src/config/env', () => ({
  config: {
    INCH_API_KEY: 'test-api-key',
    CHAIN_ID: 1,
    ETHEREUM_RPC_URL: 'https://eth-mainnet.alchemyapi.io/v2/test',
    PRIVATE_KEY: '0x1234567890123456789012345678901234567890123456789012345678901234'
  }
}));

// Mock logger
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('LimitOrderSDKService', () => {
  let service: LimitOrderSDKService;

  beforeEach(() => {
    service = new LimitOrderSDKService();
  });

  describe('createLimitOrder', () => {
    it('should create a valid limit order', async () => {
      const orderRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000', // 1 token
        limitPrice: '2000000000000000000', // 2 tokens
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.createLimitOrder(orderRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.orderId).toBeDefined();
      expect(result.data?.status).toBe(LimitOrderStatus.PENDING);
      expect(result.data?.fromToken).toBe(orderRequest.fromToken);
      expect(result.data?.toToken).toBe(orderRequest.toToken);
      expect(result.data?.fromAmount).toBe(orderRequest.amount);
      expect(result.data?.limitPrice).toBe(orderRequest.limitPrice);
    });

    it('should reject invalid order request', async () => {
      const invalidRequest: LimitOrderRequest = {
        fromToken: '',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '0',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.createLimitOrder(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('fromToken is required');
    });

    it('should reject order with same tokens', async () => {
      const invalidRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C', // Same as fromToken
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'sell',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.createLimitOrder(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('fromToken and toToken cannot be the same');
    });

    it('should reject invalid order type', async () => {
      const invalidRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        limitPrice: '2000000000000000000',
        orderType: 'invalid' as any,
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.createLimitOrder(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Order type must be either "buy" or "sell"');
    });
  });

  describe('submitOrder', () => {
    it('should submit order successfully', async () => {
      const orderHash = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const signature = '0xsignature123';

      const result = await service.submitOrder(orderHash, signature);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.orderId).toBe(orderHash);
    });
  });

  describe('getOrderStatus', () => {
    it('should get order status successfully', async () => {
      const orderHash = '0x1234567890123456789012345678901234567890123456789012345678901234';

      const result = await service.getOrderStatus(orderHash);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.orderId).toBe(orderHash);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const orderHash = '0x1234567890123456789012345678901234567890123456789012345678901234';

      const result = await service.cancelOrder(orderHash);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.orderId).toBe(orderHash);
      expect(result.data?.status).toBe(LimitOrderStatus.CANCELLED);
    });
  });
}); 