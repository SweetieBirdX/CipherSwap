/// <reference types="jest" />
import { oracleService } from '../src/services/oracleService';

// Set timeout for all tests in this file
jest.setTimeout(30000);

describe('OracleService', () => {
  describe('getPrice', () => {
    it('should get ETH/USD price from Ethereum mainnet', async () => {
      const response = await oracleService.getPrice(1, 'ETH/USD');
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.pair).toBe('ETH/USD');
      expect(response.data?.network).toBe('Ethereum Mainnet');
      expect(response.data?.price).toBeGreaterThan(0);
      expect(response.data?.oracleAddress).toBe('0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419');
    });

    it('should get BTC/USD price from Ethereum mainnet', async () => {
      const response = await oracleService.getPrice(1, 'BTC/USD');
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.pair).toBe('BTC/USD');
      expect(response.data?.price).toBeGreaterThan(0);
    });

    it('should get USDC/USD price from Ethereum mainnet', async () => {
      const response = await oracleService.getPrice(1, 'USDC/USD');
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.pair).toBe('USDC/USD');
      // USDC should be close to $1, but allow some deviation
      expect(response.data?.price).toBeGreaterThan(0.95);
      expect(response.data?.price).toBeLessThan(1.05);
    });

    it('should return error for invalid chain ID', async () => {
      const response = await oracleService.getPrice(999999, 'ETH/USD');
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Invalid chain ID');
    });

    it('should return error for unsupported pair', async () => {
      const response = await oracleService.getPrice(1, 'INVALID/PAIR');
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Price feed not found');
    });
  });

  describe('getMultiplePrices', () => {
    it('should get multiple prices at once', async () => {
      const pairs = ['ETH/USD', 'BTC/USD'];
      const responses = await oracleService.getMultiplePrices(1, pairs);
      
      expect(responses).toHaveLength(2);
      expect(responses[0].success).toBe(true);
      expect(responses[1].success).toBe(true);
    });
  });

  describe('getPriceWithTolerance', () => {
    it('should pass when price is within tolerance', async () => {
      // First get current price
      const currentPriceResponse = await oracleService.getPrice(1, 'ETH/USD');
      expect(currentPriceResponse.success).toBe(true);
      
      const currentPrice = currentPriceResponse.data!.price;
      const tolerance = 5.0; // 5% tolerance
      
      const response = await oracleService.getPriceWithTolerance(
        1, 
        'ETH/USD', 
        currentPrice, 
        tolerance
      );
      
      expect(response.success).toBe(true);
      expect(response.data?.price).toBe(currentPrice);
    });

    it('should fail when price is outside tolerance', async () => {
      const response = await oracleService.getPriceWithTolerance(
        1, 
        'ETH/USD', 
        1000000, // Very high price
        1.0 // 1% tolerance
      );
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Price deviation too high');
    });
  });

  describe('getAvailablePriceFeeds', () => {
    it('should return available feeds for Ethereum mainnet', () => {
      const feeds = oracleService.getAvailablePriceFeeds(1);
      
      expect(feeds).toContain('ETH/USD');
      expect(feeds).toContain('BTC/USD');
      expect(feeds).toContain('USDC/USD');
      expect(feeds.length).toBeGreaterThan(0);
    });

    it('should return empty array for unsupported chain', () => {
      const feeds = oracleService.getAvailablePriceFeeds(999999);
      expect(feeds).toEqual([]);
    });
  });

  describe('getAllSupportedNetworks', () => {
    it('should return all supported networks', () => {
      const networks = oracleService.getAllSupportedNetworks();
      
      expect(networks.length).toBeGreaterThan(0);
      
      // Check that Ethereum mainnet is included
      const ethereumNetwork = networks.find(n => n.chainId === 1);
      expect(ethereumNetwork).toBeDefined();
      expect(ethereumNetwork?.name).toBe('Ethereum Mainnet');
      expect(ethereumNetwork?.feeds).toContain('ETH/USD');
    });
  });

  describe('getPriceFeedHealth', () => {
    it('should return health status for valid price feed', async () => {
      const health = await oracleService.getPriceFeedHealth(1, 'ETH/USD');
      
      expect(health.isHealthy).toBe(true);
      expect(health.lastUpdate).toBeGreaterThan(0);
      expect(typeof health.isStale).toBe('boolean');
    });

    it('should return unhealthy status for invalid price feed', async () => {
      const health = await oracleService.getPriceFeedHealth(1, 'INVALID/PAIR');
      
      expect(health.isHealthy).toBe(false);
      expect(health.error).toBeDefined();
    });
  });

  describe('isPriceStale', () => {
    it('should detect stale prices', () => {
      const twoHoursAgo = Math.floor(Date.now() / 1000) - (2 * 60 * 60); // 2 hours ago
      const isStale = oracleService.isPriceStale(twoHoursAgo);
      expect(isStale).toBe(true);
    });

    it('should not detect fresh prices as stale', () => {
      const now = Math.floor(Date.now() / 1000);
      const isStale = oracleService.isPriceStale(now);
      expect(isStale).toBe(false);
    });

    it('should detect prices just over 1 hour as stale', () => {
      const oneHourAndFiveMinutesAgo = Math.floor(Date.now() / 1000) - (65 * 60); // 1h 5min ago
      const isStale = oracleService.isPriceStale(oneHourAndFiveMinutesAgo);
      expect(isStale).toBe(true);
    });

    it('should not detect prices just under 1 hour as stale', () => {
      const fiftyFiveMinutesAgo = Math.floor(Date.now() / 1000) - (55 * 60); // 55min ago
      const isStale = oracleService.isPriceStale(fiftyFiveMinutesAgo);
      expect(isStale).toBe(false);
    });
  });
}); 