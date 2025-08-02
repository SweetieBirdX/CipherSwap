import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { RealTimeSwapService } from '../src/services/realTimeSwapService';
import { SwapRequest } from '../src/types/swap';

// Mock axios
const mockAxios = {
  get: jest.fn()
};
jest.mock('axios', () => mockAxios);

// Mock ethers
const mockEthers = {
  JsonRpcProvider: jest.fn()
};
jest.mock('ethers', () => mockEthers);

// Mock SwapService
const mockSwapService = {
  createSwap: jest.fn(),
  createLimitOrder: jest.fn()
};
jest.mock('../src/services/swapService', () => ({
  SwapService: jest.fn().mockImplementation(() => mockSwapService)
}));

// Mock config
jest.mock('../src/config/env', () => ({
  config: {
    INCH_API_KEY: 'test-api-key',
    ETHEREUM_RPC_URL: 'https://eth-mainnet.alchemyapi.io/v2/test'
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

describe('RealTimeSwapService', () => {
  let service: RealTimeSwapService;

  beforeEach(() => {
    // Setup default mocks
    (mockAxios.get as any).mockResolvedValue({
      data: {
        toTokenAmount: '1800000000000000000', // 1.8 ETH
        fromTokenAmount: '1000000000000000000' // 1 ETH
      }
    });

    (mockEthers.JsonRpcProvider as any).mockImplementation(() => ({
      getFeeData: jest.fn().mockResolvedValue({
        gasPrice: '20000000000'
      })
    }));

    (mockSwapService.createSwap as any).mockResolvedValue({
      success: true,
      data: {
        swapId: 'swap_1234567890_abc123',
        status: 'pending',
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        fromAmount: '1000000000000000000',
        toAmount: '1800000000000000000',
        txHash: '0x1234567890123456789012345678901234567890123456789012345678901234'
      }
    });

    (mockSwapService.createLimitOrder as any).mockResolvedValue({
      success: true,
      data: {
        orderId: 'order_1234567890_def456',
        status: 'pending',
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        fromAmount: '1000000000000000000',
        toAmount: '1800000000000000000',
        limitPrice: '1800000000000000000'
      }
    });

    service = new RealTimeSwapService();
  });

  describe('analyzeAndRecommend', () => {
    it('should analyze swap and provide recommendations', async () => {
      const swapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const analysis = await service.analyzeAndRecommend(swapRequest);

      expect(analysis.currentPrice).toBeGreaterThan(0);
      expect(analysis.recommendedAction).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.reasoning).toBeInstanceOf(Array);
      expect(analysis.marketConditions).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.riskAssessment).toBeDefined();
    });

    it('should handle large amounts with split recommendation', async () => {
      const swapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '600000000000000000000', // 600 ETH - large amount
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const analysis = await service.analyzeAndRecommend(swapRequest);

      expect(analysis.recommendations.splitRecommendation).toBeDefined();
      expect(analysis.recommendations.splitRecommendation?.shouldSplit).toBe(true);
      expect(analysis.recommendations.splitRecommendation?.splitCount).toBe(3);
    });

    it('should provide risk assessment for high-risk scenarios', async () => {
      const swapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '2000000000000000000000', // 2000 ETH - very large amount
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const analysis = await service.analyzeAndRecommend(swapRequest);

      expect(analysis.riskAssessment.overallRisk).toBeDefined();
      expect(analysis.riskAssessment.riskFactors).toBeInstanceOf(Array);
      expect(analysis.riskAssessment.mitigationStrategies).toBeInstanceOf(Array);
    });
  });

  describe('executeOptimizedSwap', () => {
    it('should execute normal swap when conditions are favorable', async () => {
      const swapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.executeOptimizedSwap(swapRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.swapId).toBeDefined();
    });

    it('should execute limit order when risk is high', async () => {
      const swapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '2000000000000000000000', // 2000 ETH - very large amount
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.executeOptimizedSwap(swapRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Check for either swapId or orderId depending on the result type
      expect(result.data?.swapId || (result.data as any)?.orderId).toBeDefined();
    });

    it('should execute split swap for large amounts', async () => {
      const swapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '600000000000000000000', // 600 ETH - large amount
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const result = await service.executeOptimizedSwap(swapRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('market analysis', () => {
    it('should provide market conditions analysis', async () => {
      const swapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const analysis = await service.analyzeAndRecommend(swapRequest);

      expect(analysis.marketConditions.volatility).toBeDefined();
      expect(analysis.marketConditions.liquidity).toBeDefined();
      expect(analysis.marketConditions.trend).toBeDefined();
    });

    it('should provide optimization recommendations', async () => {
      const swapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const analysis = await service.analyzeAndRecommend(swapRequest);

      expect(analysis.recommendations.optimalAmount).toBeDefined();
      expect(analysis.recommendations.optimalSlippage).toBeGreaterThan(0);
      expect(analysis.recommendations.optimalGasPrice).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock axios to throw error
      (mockAxios.get as any).mockRejectedValueOnce(new Error('API Error'));

      const swapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        toToken: '0xB0b86a33E6441b8c4C8C1C1C1C1C1C1C1C1C1C1C',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const analysis = await service.analyzeAndRecommend(swapRequest);

      // Should return fallback analysis
      expect(analysis.currentPrice).toBe(1.8);
      expect(analysis.recommendedAction).toBe('SWAP_NOW');
      expect(analysis.confidence).toBe(0.6);
    });
  });
}); 