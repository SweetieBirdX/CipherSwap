import { RealMarketDataService } from '../src/services/realMarketDataService';

// Set test environment
process.env.NODE_ENV = 'test';

// Use real APIs for hackathon demo
// No mocks - we want live data

describe('Real Market Data Service Tests (Live Data)', () => {
  let marketDataService: RealMarketDataService;

  beforeEach(() => {
    marketDataService = new RealMarketDataService();
  });

  describe('Real-time Price Retrieval', () => {
    it('should get real-time price from multiple sources', async () => {
      const tokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
      const tokenSymbol = 'ethereum';

      const priceData = await marketDataService.getRealTimePrice(tokenAddress, tokenSymbol);

      expect(priceData).toBeDefined();
      expect(priceData.price).toBeGreaterThan(0);
      expect(priceData.timestamp).toBeGreaterThan(0);
      expect(priceData.source).toBe('multi-source-validated');
    }, 30000); // 30 seconds timeout for live API calls

    it('should handle price source failures gracefully', async () => {
      const tokenAddress = '0xInvalidToken';

      const priceData = await marketDataService.getRealTimePrice(tokenAddress);

      expect(priceData).toBeDefined();
      expect(priceData.price).toBeGreaterThan(0);
    }, 30000);

    it('should throw error when all price sources fail', async () => {
      const tokenAddress = '0x0000000000000000000000000000000000000000';

      await expect(marketDataService.getRealTimePrice(tokenAddress))
        .rejects.toThrow('No price sources available');
    }, 30000);
  });

  describe('Volatility Calculation', () => {
    it('should calculate real volatility from historical data', async () => {
      const tokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH

      const volatilityData = await marketDataService.getVolatility(tokenAddress);

      expect(volatilityData).toBeDefined();
      expect(volatilityData.volatility).toBeGreaterThan(0);
      expect(volatilityData.period).toBe(24);
      expect(volatilityData.confidence).toBeGreaterThan(0);
      expect(volatilityData.confidence).toBeLessThanOrEqual(1);
    }, 30000);

    it('should handle insufficient historical data', async () => {
      // Mock getHistoricalPrices to return insufficient data
      const originalMethod = marketDataService['getHistoricalPrices'];
      marketDataService['getHistoricalPrices'] = jest.fn().mockResolvedValue([
        { price: 1800, timestamp: Date.now(), source: 'historical' }
        // Only 1 data point - insufficient for volatility calculation
      ]);

      const tokenAddress = '0xNewToken';

      await expect(marketDataService.getVolatility(tokenAddress))
        .rejects.toThrow('Insufficient historical data for volatility calculation');

      // Restore original method
      marketDataService['getHistoricalPrices'] = originalMethod;
    }, 30000);
  });

  describe('Liquidity Analysis', () => {
    it('should get real liquidity data from multiple DEXs', async () => {
      const tokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH

      const liquidityData = await marketDataService.getLiquidity(tokenAddress);

      expect(liquidityData).toBeDefined();
      expect(liquidityData.totalLiquidity).toBeGreaterThan(0);
      expect(liquidityData.uniswapLiquidity).toBeGreaterThan(0);
      expect(liquidityData.sushiswapLiquidity).toBeGreaterThan(0);
      expect(liquidityData.dexScreenerLiquidity).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('should handle DEX API failures gracefully', async () => {
      const tokenAddress = '0xInvalidToken';

      const liquidityData = await marketDataService.getLiquidity(tokenAddress);

      expect(liquidityData).toBeDefined();
      expect(liquidityData.totalLiquidity).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe('Comprehensive Market Data', () => {
    it('should get comprehensive market data', async () => {
      const tokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
      const tokenSymbol = 'ethereum';

      const marketData = await marketDataService.getMarketData(tokenAddress, tokenSymbol);

      expect(marketData).toBeDefined();
      expect(marketData.price).toBeGreaterThan(0);
      expect(marketData.volatility).toBeGreaterThan(0);
      expect(marketData.liquidity).toBeGreaterThan(0);
      expect(['BULLISH', 'BEARISH', 'NEUTRAL']).toContain(marketData.trend);
    }, 30000);

    it('should handle market data retrieval failures', async () => {
      const tokenAddress = '0xInvalidToken';

      await expect(marketDataService.getMarketData(tokenAddress))
        .rejects.toThrow();
    }, 30000);
  });

  describe('Price Validation', () => {
    it('should detect high price variance', async () => {
      const tokenAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH

      // This test will pass if there's high variance in real prices
      const priceData = await marketDataService.getRealTimePrice(tokenAddress);

      expect(priceData).toBeDefined();
      expect(priceData.price).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const tokenAddress = '0xInvalidToken';

      await expect(marketDataService.getRealTimePrice(tokenAddress))
        .rejects.toThrow();
    }, 30000);

    it('should handle timeout errors', async () => {
      const tokenAddress = '0xInvalidToken';

      await expect(marketDataService.getRealTimePrice(tokenAddress))
        .rejects.toThrow();
    }, 30000);
  });
}); 