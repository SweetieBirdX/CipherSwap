/// <reference types="jest" />
import { OracleService } from '../src/services/oracleService';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.INCH_API_KEY = 'test_api_key';
process.env.PRIVATE_KEY = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
process.env.CHAINLINK_ORACLE_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890';
process.env.ETHEREUM_RPC_URL = 'https://eth-mainnet.g.alchemy.com/v2/test_key';
process.env.ARBITRUM_RPC_URL = 'https://arb-mainnet.g.alchemy.com/v2/test_key';
process.env.BASE_RPC_URL = 'https://mainnet.base.org';
process.env.POLYGON_RPC_URL = 'https://polygon-rpc.com';

// Mock ethers for faster testing
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1n }),
    getBlockNumber: jest.fn().mockResolvedValue(1000000)
  })),
  Contract: jest.fn().mockImplementation(() => ({
    latestRoundData: jest.fn().mockResolvedValue([
      123456789n, // roundId
      2500000000000000000000n, // answer (2500 USD)
      1700000000n, // startedAt
      Math.floor(Date.now() / 1000), // updatedAt
      123456789n // answeredInRound
    ]),
    decimals: jest.fn().mockResolvedValue(8n)
  }))
}));

// Increase timeout for network calls
jest.setTimeout(30000);

describe('OracleService', () => {
  let oracleService: OracleService;

  beforeEach(() => {
    oracleService = new OracleService();
  });

  describe('getPrice', () => {
    it('should get ETH/USD price from Ethereum mainnet', async () => {
      const response = await oracleService.getPrice(1, 'ETH/USD');
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.price).toBeGreaterThan(0);
      expect(response.data?.pair).toBe('ETH/USD');
      expect(response.data?.network).toBe('Ethereum Mainnet');
    });

    it('should get BTC/USD price from Ethereum mainnet', async () => {
      const response = await oracleService.getPrice(1, 'BTC/USD');
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.price).toBeGreaterThan(0);
      expect(response.data?.pair).toBe('BTC/USD');
    });

    it('should get USDC/USD price from Ethereum mainnet', async () => {
      const response = await oracleService.getPrice(1, 'USDC/USD');
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.price).toBeGreaterThan(0);
      expect(response.data?.pair).toBe('USDC/USD');
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
      const pairs = ['ETH/USD', 'BTC/USD', 'USDC/USD'];
      const responses = await oracleService.getMultiplePrices(1, pairs);
      
      expect(responses).toHaveLength(3);
      expect(responses[0].success).toBe(true);
      expect(responses[1].success).toBe(true);
      expect(responses[2].success).toBe(true);
    });
  });

  describe('getPriceWithTolerance', () => {
    it('should pass when price is within tolerance', async () => {
      const response = await oracleService.getPriceWithTolerance(1, 'ETH/USD', 2000, 50);
      
      expect(response.success).toBe(true);
    });

    it('should fail when price is outside tolerance', async () => {
      const response = await oracleService.getPriceWithTolerance(1, 'ETH/USD', 1000000, 1);
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Price outside tolerance');
    });
  });

  describe('getAvailablePriceFeeds', () => {
    it('should return available feeds for Ethereum mainnet', () => {
      const feeds = oracleService.getAvailablePriceFeeds(1);
      
      // Check that feeds contain the expected pairs
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
      expect(networks[0]).toHaveProperty('chainId');
      expect(networks[0]).toHaveProperty('name');
      expect(networks[0]).toHaveProperty('feeds');
    });
  });

  describe('getAllNetworks', () => {
    it('should return all networks (backward compatibility)', () => {
      const networks = oracleService.getAllNetworks();
      
      expect(networks.length).toBeGreaterThan(0);
      expect(networks[0]).toHaveProperty('chainId');
      expect(networks[0]).toHaveProperty('name');
      expect(networks[0]).toHaveProperty('feeds');
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