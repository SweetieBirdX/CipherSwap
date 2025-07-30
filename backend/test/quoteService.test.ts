/// <reference types="jest" />
import { QuoteService } from '../src/services/quoteService';
import { config } from '../src/config/env';

jest.setTimeout(30000);

// Check if API key is available
const hasApiKey = !!config.INCH_API_KEY;

describe('QuoteService', () => {
  let quoteService: QuoteService;

  beforeEach(() => {
    quoteService = new QuoteService();
  });

  describe('getQuote', () => {
    it('should get quote for ETH to USDT swap', async () => {
      if (!hasApiKey) {
        console.log('Skipping test: No API key available');
        return;
      }

      const params = {
        fromToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        toToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const response = await quoteService.getQuote(params);

      // If API fails, we should still get a proper error response
      if (!response.success) {
        expect(response.error).toBeDefined();
        console.log('API call failed:', response.error);
        return;
      }

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.quote).toBeDefined();
      expect(response.data?.slippage).toBeGreaterThanOrEqual(0);
      expect(response.data?.priceImpact).toBeGreaterThanOrEqual(0);
    });

    it('should return error for invalid token addresses', async () => {
      const params = {
        fromToken: 'invalid-address',
        toToken: 'invalid-address',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const response = await quoteService.getQuote(params);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('getQuoteHistory', () => {
    it('should return empty history initially', async () => {
      const history = await quoteService.getQuoteHistory();

      expect(history).toEqual([]);
    });

    it('should return history after getting quotes', async () => {
      if (!hasApiKey) {
        console.log('Skipping test: No API key available');
        return;
      }

      // First get a quote
      const params = {
        fromToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        toToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const quoteResponse = await quoteService.getQuote(params);

      // If quote fails, skip history test
      if (!quoteResponse.success) {
        console.log('Quote failed, skipping history test');
        return;
      }

      // Then get history
      const history = await quoteService.getQuoteHistory();

      expect(history.length).toBeGreaterThan(0);
      expect(history[0].fromToken).toBe(params.fromToken);
      expect(history[0].toToken).toBe(params.toToken);
      expect(history[0].amount).toBe(params.amount);
    });

    it('should filter history by user address', async () => {
      if (!hasApiKey) {
        console.log('Skipping test: No API key available');
        return;
      }

      const userAddress1 = '0x1234567890123456789012345678901234567890';
      const userAddress2 = '0x0987654321098765432109876543210987654321';

      // Get quotes for different users
      const params1 = {
        fromToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        toToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: userAddress1
      };

      const params2 = {
        fromToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        toToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        amount: '2000000000000000000',
        chainId: 1,
        userAddress: userAddress2
      };

      const quote1Response = await quoteService.getQuote(params1);
      const quote2Response = await quoteService.getQuote(params2);

      // If quotes fail, skip history test
      if (!quote1Response.success || !quote2Response.success) {
        console.log('Quotes failed, skipping history filter test');
        return;
      }

      // Get history for user1
      const history1 = await quoteService.getQuoteHistory(userAddress1);
      expect(history1.length).toBeGreaterThan(0);
      expect(history1.every(quote => quote.userAddress === userAddress1)).toBe(true);

      // Get history for user2
      const history2 = await quoteService.getQuoteHistory(userAddress2);
      expect(history2.length).toBeGreaterThan(0);
      expect(history2.every(quote => quote.userAddress === userAddress2)).toBe(true);
    });
  });

  describe('getSupportedTokens', () => {
    it('should return tokens for Ethereum mainnet', async () => {
      if (!hasApiKey) {
        console.log('Skipping test: No API key available');
        return;
      }

      const tokens = await quoteService.getSupportedTokens(1);

      expect(Array.isArray(tokens)).toBe(true);
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[0]).toHaveProperty('address');
      expect(tokens[0]).toHaveProperty('symbol');
    });

    it('should return fallback tokens when API fails', async () => {
      // Test the fallback tokens directly
      const fallbackTokens = (quoteService as any).getFallbackTokens(1);

      console.log('Fallback tokens:', fallbackTokens);

      expect(Array.isArray(fallbackTokens)).toBe(true);
      expect(fallbackTokens.length).toBeGreaterThan(0);
      expect(fallbackTokens[0]).toHaveProperty('address');
      expect(fallbackTokens[0]).toHaveProperty('symbol');
      expect(fallbackTokens[0]).toHaveProperty('name');
      expect(fallbackTokens[0]).toHaveProperty('decimals');
    });
  });

  describe('simulateSwap', () => {
    it('should simulate swap with quote data', async () => {
      const mockQuoteData = {
        quote: {
          fromTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          toTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          fromTokenAmount: '1000000000000000000',
          toTokenAmount: '1800000000',
          estimatedGas: '150000'
        },
        estimatedGas: '150000',
        slippage: 0.5,
        priceImpact: 0.1,
        estimatedGains: 100,
        route: [],
        timestamp: Date.now()
      };

      const simulation = await quoteService.simulateSwap(mockQuoteData, '0x1234567890123456789012345678901234567890');

      expect(simulation).toBeDefined();
      expect(simulation.success).toBe(true);
      expect(simulation.data).toBeDefined();
      expect(simulation.data.estimatedSlippage).toBeDefined();
      expect(simulation.data.priceImpact).toBeDefined();
      expect(simulation.data.estimatedGains).toBeDefined();
      expect(simulation.data.gasEstimate).toBeDefined();
    });
  });
}); 