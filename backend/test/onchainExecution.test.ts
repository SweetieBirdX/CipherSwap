import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { OnchainExecutionService } from '../src/services/onchainExecutionService';
import { LimitOrderData, LimitOrderStatus } from '../src/types/swap';
import { OnchainExecutionParams } from '../src/services/onchainExecutionService';

// Mock ethers
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getFeeData: jest.fn().mockResolvedValue({
      gasPrice: '20000000000',
      maxPriorityFeePerGas: '2000000000',
      maxFeePerGas: '25000000000'
    }),
    broadcastTransaction: jest.fn().mockResolvedValue({
      wait: jest.fn().mockResolvedValue({
        hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
        blockNumber: 12345678,
        gasUsed: '150000',
        gasPrice: '20000000000',
        status: 1,
        confirmations: 1
      })
    }),
    getTransactionReceipt: jest.fn().mockResolvedValue({
      hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
      blockNumber: 12345678,
      gasUsed: '150000',
      gasPrice: '20000000000',
      status: 1,
      confirmations: 1
    })
  })),
  Wallet: jest.fn().mockImplementation(() => ({
    address: '0x1234567890123456789012345678901234567890',
    signTransaction: jest.fn().mockResolvedValue('0xsignedtx123'),
    getNonce: jest.fn().mockResolvedValue(5)
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

// Mock CustomOrderbookService
jest.mock('../src/services/customOrderbookService', () => ({
  CustomOrderbookService: jest.fn().mockImplementation(() => ({
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
        deadline: Date.now() + 3600000, // 1 hour from now
        timestamp: Date.now()
      }
    }),
    updateOrder: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('OnchainExecutionService', () => {
  let service: OnchainExecutionService;

  beforeEach(() => {
    service = new OnchainExecutionService();
  });

  describe('executeLimitOrderOnchain', () => {
    it('should execute limit order successfully', async () => {
      const executionParams: OnchainExecutionParams = {
        orderId: 'test-order-123',
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.executeLimitOrderOnchain(executionParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.txHash).toBeDefined();
      expect(result.data?.status).toBe(LimitOrderStatus.EXECUTED);
      expect(result.data?.gasEstimate).toBeDefined();
      expect(result.data?.gasPrice).toBeDefined();
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

      const executionParams: OnchainExecutionParams = {
        orderId: 'non-existent-order',
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.executeLimitOrderOnchain(executionParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });

    it('should reject execution for already executed order', async () => {
      // Mock getOrder to return executed order
      const mockOrderbookService = require('../src/services/customOrderbookService').CustomOrderbookService;
      mockOrderbookService.mockImplementation(() => ({
        getOrder: jest.fn().mockResolvedValue({
          success: true,
          data: {
            orderId: 'executed-order-123',
            status: LimitOrderStatus.EXECUTED,
            fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
            toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
            fromAmount: '1000000000000000000',
            limitPrice: '2000000000000000000',
            orderType: 'sell',
            userAddress: '0x1234567890123456789012345678901234567890',
            deadline: Date.now() + 3600000,
            timestamp: Date.now()
          }
        })
      }));

      const executionParams: OnchainExecutionParams = {
        orderId: 'executed-order-123',
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.executeLimitOrderOnchain(executionParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order cannot be executed');
    });

    it('should reject execution for expired order', async () => {
      // Mock getOrder to return expired order
      const mockOrderbookService = require('../src/services/customOrderbookService').CustomOrderbookService;
      mockOrderbookService.mockImplementation(() => ({
        getOrder: jest.fn().mockResolvedValue({
          success: true,
          data: {
            orderId: 'expired-order-123',
            status: LimitOrderStatus.PENDING,
            fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
            toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
            fromAmount: '1000000000000000000',
            limitPrice: '2000000000000000000',
            orderType: 'sell',
            userAddress: '0x1234567890123456789012345678901234567890',
            deadline: Date.now() - 3600000, // 1 hour ago (expired)
            timestamp: Date.now()
          }
        }),
        updateOrderStatus: jest.fn().mockResolvedValue(undefined)
      }));

      const executionParams: OnchainExecutionParams = {
        orderId: 'expired-order-123',
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.executeLimitOrderOnchain(executionParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order has expired');
    });
  });

  describe('estimateGasForExecution', () => {
    it('should estimate gas successfully', async () => {
      const order: LimitOrderData = {
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
        gasEstimate: '0',
        route: []
      };

      const executionParams: OnchainExecutionParams = {
        orderId: 'test-order-123',
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.estimateGasForExecution(order, executionParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.gasLimit).toBeDefined();
      expect(result.data?.gasPrice).toBeDefined();
      expect(result.data?.maxPriorityFeePerGas).toBeDefined();
      expect(result.data?.maxFeePerGas).toBeDefined();
      expect(result.data?.totalCost).toBeDefined();
    });
  });

  describe('getTransactionStatus', () => {
    it('should get transaction status successfully', async () => {
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234';

      const result = await service.getTransactionStatus(txHash);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.txHash).toBe(txHash);
      expect(result.data?.status).toBe('success');
      expect(result.data?.gasUsed).toBeDefined();
      expect(result.data?.gasPrice).toBeDefined();
      expect(result.data?.blockNumber).toBeDefined();
      expect(result.data?.confirmations).toBeDefined();
    });

    it('should handle non-existent transaction', async () => {
      // Mock getTransactionReceipt to return null
      const mockEthers = require('ethers');
      mockEthers.JsonRpcProvider.mockImplementation(() => ({
        getTransactionReceipt: jest.fn().mockResolvedValue(null)
      }));

      const txHash = '0xnon-existent-tx-hash';

      const result = await service.getTransactionStatus(txHash);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction not found');
    });
  });

  describe('cancelLimitOrderOnchain', () => {
    it('should cancel order successfully', async () => {
      const orderId = 'test-order-123';
      const userAddress = '0x1234567890123456789012345678901234567890';

      const result = await service.cancelLimitOrderOnchain(orderId, userAddress);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.txHash).toBeDefined();
      expect(result.data?.status).toBe(LimitOrderStatus.CANCELLED);
    });

    it('should reject cancellation for non-existent order', async () => {
      // Mock getOrder to return not found
      const mockOrderbookService = require('../src/services/customOrderbookService').CustomOrderbookService;
      mockOrderbookService.mockImplementation(() => ({
        getOrder: jest.fn().mockResolvedValue({
          success: false,
          error: 'Order not found'
        })
      }));

      const orderId = 'non-existent-order';
      const userAddress = '0x1234567890123456789012345678901234567890';

      const result = await service.cancelLimitOrderOnchain(orderId, userAddress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });
  });
}); 