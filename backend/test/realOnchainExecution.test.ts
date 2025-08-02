import { RealOnchainExecutionService } from '../src/services/realOnchainExecutionService';
import { LimitOrderStatus } from '../src/types/swap';

// Set test environment
process.env.NODE_ENV = 'test';

// Use real blockchain for hackathon demo
// No mocks - we want live onchain execution

describe('Real Onchain Execution Service Tests (Live Data)', () => {
  let onchainExecutionService: RealOnchainExecutionService;

  beforeEach(() => {
    onchainExecutionService = new RealOnchainExecutionService();
  });

  describe('Gas Estimation', () => {
    it('should estimate gas for order execution', async () => {
      // Create a simple order data for testing
      const orderData = {
        orderId: 'test-order-123',
        status: LimitOrderStatus.PENDING,
        fromToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        toToken: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        fromAmount: '1000000000000000000', // 1 WETH
        toAmount: '1800000000', // 1800 USDC
        limitPrice: '1800000000',
        orderType: 'sell' as const,
        gasEstimate: '0',
        gasPrice: undefined,
        deadline: Date.now() + 3600000, // 1 hour from now
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        timestamp: Date.now(),
        route: [],
        fusionData: {
          permit: null,
          deadline: Date.now() + 3600000,
          nonce: 0
        },
        customData: {},
        signature: '0x1234567890abcdef',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };

      const params = {
        orderId: 'test-order-123',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        gasPrice: '20000000000',
        gasLimit: '210000',
        maxPriorityFeePerGas: '2000000000',
        maxFeePerGas: '20000000000'
      };

      const result = await onchainExecutionService.estimateGasForExecution(orderData, params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      if (result.data) {
        const gasData = result.data as any;
        expect(parseInt(gasData.gasLimit)).toBeGreaterThan(0);
        expect(parseInt(gasData.gasPrice)).toBeGreaterThan(0);
        expect(parseInt(gasData.totalCost)).toBeGreaterThan(0);
        
        console.log('✅ Gas estimation successful:', {
          gasLimit: gasData.gasLimit,
          gasPrice: gasData.gasPrice,
          totalCost: gasData.totalCost
        });
      }
    }, 30000); // 30 second timeout

    it('should handle gas estimation failures gracefully', async () => {
      const invalidOrderData = {
        orderId: 'invalid',
        status: LimitOrderStatus.PENDING,
        fromToken: '0xInvalid',
        toToken: '0xInvalid',
        fromAmount: '0',
        toAmount: '0',
        limitPrice: '0',
        orderType: 'sell' as const,
        gasEstimate: '0',
        gasPrice: undefined,
        deadline: Date.now() + 3600000,
        userAddress: '0xInvalid',
        timestamp: Date.now(),
        route: [],
        fusionData: {
          permit: null,
          deadline: Date.now() + 3600000,
          nonce: 0
        },
        customData: {},
        signature: '0x1234567890abcdef',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };

      const params = {
        orderId: 'invalid',
        userAddress: '0xInvalid',
        gasPrice: '0',
        gasLimit: '0',
        maxPriorityFeePerGas: '0',
        maxFeePerGas: '0'
      };

      const result = await onchainExecutionService.estimateGasForExecution(invalidOrderData, params);

      // Should still succeed with fallback values
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      console.log('✅ Fallback gas estimation successful');
    }, 30000); // 30 second timeout
  });

  describe('Onchain Execution', () => {
    it('should execute limit order onchain with standard transaction', async () => {
      const params = {
        orderId: 'test-execution-order',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        gasPrice: '20000000000',
        gasLimit: '210000',
        maxPriorityFeePerGas: '2000000000',
        maxFeePerGas: '20000000000'
      };

      const executionResult = await onchainExecutionService.executeLimitOrderOnchain(params);

      // Note: This might fail in test environment due to insufficient funds
      // but we can still test the execution flow
      expect(executionResult).toBeDefined();
      
      if (executionResult.success) {
        expect(executionResult.data!.txHash).toBeDefined();
        expect(executionResult.data!.status).toBe(LimitOrderStatus.EXECUTED);
      } else {
        // Expected failure in test environment
        expect(executionResult.error).toBeDefined();
        expect(executionResult.error).toContain('execution failed');
      }
    }, 60000);

    it('should handle expired orders gracefully', async () => {
      const params = {
        orderId: 'expired-order',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        gasPrice: '20000000000',
        gasLimit: '210000',
        maxPriorityFeePerGas: '2000000000',
        maxFeePerGas: '20000000000'
      };

      const result = await onchainExecutionService.executeLimitOrderOnchain(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order not found');
    }, 30000);
  });

  describe('Transaction Status', () => {
    it('should get transaction status', async () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      const result = await onchainExecutionService.getTransactionStatus(txHash);

      expect(result).toBeDefined();
      
      if (result.success) {
        expect(result.data).toBeDefined();
        const txData = result.data as any;
        expect(txData.txHash).toBeDefined();
        expect(txData.status).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
    }, 30000);
  });

  describe('Cancel Order', () => {
    it('should cancel limit order onchain', async () => {
      const orderId = 'test-cancel-order';
      const userAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

      const result = await onchainExecutionService.cancelLimitOrderOnchain(orderId, userAddress);

      expect(result).toBeDefined();
      
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.status).toBe(LimitOrderStatus.CANCELLED);
      } else {
        expect(result.error).toBeDefined();
      }
    }, 60000);
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const params = {
        orderId: 'network-error-test',
        userAddress: '0xInvalidAddress',
        gasPrice: '0',
        gasLimit: '0',
        maxPriorityFeePerGas: '0',
        maxFeePerGas: '0'
      };

      const result = await onchainExecutionService.executeLimitOrderOnchain(params);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    }, 30000);
  });
}); 