import { SwapService } from '../src/services/swapService';
import { LimitOrderRequest, FusionQuoteRequest } from '../src/types/swap';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('SwapService - Fusion+ Limit Orders', () => {
  let swapService: SwapService;

  beforeEach(() => {
    // Mock environment variables
    process.env.INCH_API_KEY = 'test-api-key';
    swapService = new SwapService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLimitOrder', () => {
    it('should create a MEV-protected limit order successfully', async () => {
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          route: []
        }
      };

      const mockOrderResponse = {
        data: {
          tx: { hash: '0x123...' },
          nonce: 1,
          signature: '0xabc...'
        }
      };

      // Mock the quote API call
      axios.get.mockResolvedValueOnce(mockQuoteResponse);
      
      // Mock the order creation API call
      axios.post.mockResolvedValueOnce(mockOrderResponse);

      const limitOrderRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '2000', // $2000 per ETH
        orderType: 'buy'
      };

      const result = await swapService.createLimitOrder(limitOrderRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.orderId).toBeDefined();
      expect(result.data?.status).toBe('pending');
      expect(result.data?.orderType).toBe('buy');
      expect(result.data?.limitPrice).toBe('2000');
    });

    it('should validate limit order request parameters', async () => {
      const invalidRequest: LimitOrderRequest = {
        fromToken: '',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '0', // Invalid price
        orderType: 'invalid' as any
      };

      const result = await swapService.createLimitOrder(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('fromToken is required');
      expect(result.error).toContain('Limit price must be greater than 0');
      expect(result.error).toContain('Order type must be either "buy" or "sell"');
    });
  });

  describe('getFusionQuote', () => {
    it('should get Fusion+ quote successfully', async () => {
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          priceImpact: 0.1,
          route: []
        }
      };

      axios.get.mockResolvedValueOnce(mockQuoteResponse);

      const quoteRequest: FusionQuoteRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '2000',
        orderType: 'buy'
      };

      const result = await swapService.getFusionQuote(quoteRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.fromToken).toBe(quoteRequest.fromToken);
      expect(result.data?.toToken).toBe(quoteRequest.toToken);
      expect(result.data?.limitPrice).toBe('2000');
    });
  });

  describe('simulateLimitOrder', () => {
    it('should simulate limit order execution', async () => {
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          route: []
        }
      };

      axios.get.mockResolvedValueOnce(mockQuoteResponse);

      const limitOrderRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '2000',
        orderType: 'buy'
      };

      const result = await swapService.simulateLimitOrder(limitOrderRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect((result.data as any)?.originalQuote).toBeDefined();
      expect((result.data as any)?.simulatedOrder).toBeDefined();
      expect((result.data as any)?.executionProbability).toBeDefined();
      expect((result.data as any)?.mevProtectionBenefits).toBeDefined();
      expect((result.data as any)?.estimatedExecutionTime).toBeDefined();
    });
  });

  describe('getLimitOrderStatus', () => {
    it('should get limit order status', async () => {
      // First create an order
      const mockQuoteResponse = {
        data: {
          toTokenAmount: '1000000000000000000',
          estimatedGas: '150000',
          route: []
        }
      };

      const mockOrderResponse = {
        data: {
          tx: { hash: '0x123...' },
          nonce: 1,
          signature: '0xabc...'
        }
      };

      axios.get.mockResolvedValueOnce(mockQuoteResponse);
      axios.post.mockResolvedValueOnce(mockOrderResponse);

      const limitOrderRequest: LimitOrderRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        toToken: '0xB0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C4',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        limitPrice: '2000',
        orderType: 'buy'
      };

      const createResult = await swapService.createLimitOrder(limitOrderRequest);
      expect(createResult.success).toBe(true);

      const orderId = createResult.data!.orderId;
      const statusResult = await swapService.getLimitOrderStatus(orderId);

      expect(statusResult.success).toBe(true);
      expect(statusResult.data?.orderId).toBe(orderId);
      expect(statusResult.data?.status).toBe('pending');
    });
  });
}); 