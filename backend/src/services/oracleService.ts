import { JsonRpcProvider, Provider, Contract } from 'ethers';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { ChainConfigUtils } from '../utils/chainConfig';

// Chainlink Price Feed ABI (simplified for latestRoundData)
const PRICE_FEED_ABI = [
  {
    "inputs": [],
    "name": "latestRoundData",
    "outputs": [
      {
        "internalType": "uint80",
        "name": "roundId",
        "type": "uint80"
      },
      {
        "internalType": "int256",
        "name": "answer",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "startedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "updatedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint80",
        "name": "answeredInRound",
        "type": "uint80"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Chainlink Price Feed addresses for different networks
const PRICE_FEEDS: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    'USDC/USD': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
    'DAI/USD': '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee5',
    'LINK/USD': '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
    'UNI/USD': '0x553303d460EE0afB37EdFf9bE42922D8FF732f70',
    'AAVE/USD': '0x547a514d5e3769680Ce22B2361c10Ea13619e8a9',
    'MATIC/USD': '0x7bAC85A8a13A4BcD8abb3eB7d6b35d45465Dc063'
  },
  // Arbitrum One
  42161: {
    'ETH/USD': '0x639Fe6ab55C921f74e7d1aDdEa6682642eA29a9',
    'BTC/USD': '0x6ce185860a496310F6C54D98eAaa266bC946E1de',
    'USDC/USD': '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
    'DAI/USD': '0xc5C8E77B397E531B8EC06Eb188CcC5E40bBe1A3c'
  },
  // Base
  8453: {
    'ETH/USD': '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
    'USDC/USD': '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B'
  },
  // Polygon
  137: {
    'ETH/USD': '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    'BTC/USD': '0xc907E116054ad103354f2D350FD2514433D57F0f',
    'USDC/USD': '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
    'DAI/USD': '0x4746DeC9e833A82EC7C2C1356372CcF2cfcF2b3D',
    'MATIC/USD': '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0'
  }
};

export interface OraclePrice {
  price: number;
  decimals: number;
  roundId: number;
  updatedAt: number;
  network: string;
  pair: string;
  oracleAddress: string;
  timestamp: number;
}

export interface OracleError {
  error: string;
  code: string;
  details?: any;
}

export interface OracleResponse {
  success: boolean;
  data?: OraclePrice;
  error?: string;
}

export class OracleService {
  private providers: Map<number, Provider> = new Map();
  private priceFeeds: Map<string, Contract> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize providers for all supported networks
   */
  private initializeProviders(): void {
    const networks = ChainConfigUtils.getAllNetworks();
    
    networks.forEach(network => {
      try {
        // Use more reliable RPC URLs for testing
        let rpcUrl = network.rpcUrl;
        
        // For testing, use public RPC endpoints
        if (process.env.NODE_ENV === 'test') {
          switch (network.chainId) {
            case 1: // Ethereum Mainnet
              rpcUrl = 'https://eth.llamarpc.com';
              break;
            case 137: // Polygon
              rpcUrl = 'https://polygon-rpc.com';
              break;
            case 42161: // Arbitrum
              rpcUrl = 'https://arb1.arbitrum.io/rpc';
              break;
            case 8453: // Base
              rpcUrl = 'https://mainnet.base.org';
              break;
            case 324: // zkSync
              rpcUrl = 'https://mainnet.era.zksync.io';
              break;
            default:
              rpcUrl = network.rpcUrl;
          }
        }
        
        const provider = new JsonRpcProvider(rpcUrl);
        this.providers.set(network.chainId, provider);
        logger.info(`Provider initialized for ${network.name}`, { chainId: network.chainId });
      } catch (error: any) {
        logger.error(`Failed to initialize provider for ${network.name}`, { 
          chainId: network.chainId, 
          error: error.message 
        });
      }
    });
  }

  /**
   * Get price from Chainlink Oracle
   */
  async getPrice(chainId: number, pair: string): Promise<OracleResponse> {
    try {
      logger.info('Getting oracle price', { chainId, pair });

      // Validate chain ID
      if (!ChainConfigUtils.isValidChainId(chainId)) {
        return {
          success: false,
          error: `Invalid chain ID: ${chainId}`
        };
      }

      // Get price feed address
      const priceFeedAddress = this.getPriceFeedAddress(chainId, pair);
      if (!priceFeedAddress) {
        return {
          success: false,
          error: `Price feed not found for ${pair} on chain ${chainId}`
        };
      }

      // Get provider
      const provider = this.providers.get(chainId);
      if (!provider) {
        return {
          success: false,
          error: `Provider not available for chain ${chainId}`
        };
      }

      // Get price feed contract
      const priceFeed = this.getPriceFeedContract(chainId, pair, priceFeedAddress, provider);
      
      // Get latest round data
      const roundData = await priceFeed.latestRoundData();
      const decimals = await priceFeed.decimals();

      // Calculate price
      const price = this.calculatePrice(roundData.answer, decimals);
      
      // Get network info
      const networkName = ChainConfigUtils.getNetworkName(chainId);

      const oraclePrice: OraclePrice = {
        price,
        decimals: Number(decimals),
        roundId: Number(roundData.roundId),
        updatedAt: Number(roundData.updatedAt),
        network: networkName,
        pair,
        oracleAddress: priceFeedAddress,
        timestamp: Date.now()
      };

      logger.info('Oracle price retrieved successfully', {
        chainId,
        pair,
        price,
        network: networkName
      });

      return {
        success: true,
        data: oraclePrice
      };

    } catch (error: any) {
      logger.error('Oracle service error', {
        chainId,
        pair,
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: `Failed to get price: ${error.message}`
      };
    }
  }

  /**
   * Get multiple prices at once
   */
  async getMultiplePrices(chainId: number, pairs: string[]): Promise<OracleResponse[]> {
    const promises = pairs.map(pair => this.getPrice(chainId, pair));
    return Promise.all(promises);
  }

  /**
   * Get price with tolerance check
   */
  async getPriceWithTolerance(
    chainId: number, 
    pair: string, 
    expectedPrice: number, 
    tolerance: number = 1.0
  ): Promise<OracleResponse> {
    const response = await this.getPrice(chainId, pair);
    
    if (!response.success || !response.data) {
      return response;
    }

    const actualPrice = response.data.price;
    const priceDifference = Math.abs((actualPrice - expectedPrice) / expectedPrice) * 100;

    if (priceDifference > tolerance) {
      return {
        success: false,
        error: `Price deviation too high: ${priceDifference.toFixed(2)}% (max: ${tolerance}%)`
      };
    }

    return response;
  }

  /**
   * Get available price feeds for a network
   */
  getAvailablePriceFeeds(chainId: number): string[] {
    const feeds = PRICE_FEEDS[chainId];
    return feeds ? Object.keys(feeds) : [];
  }

  /**
   * Get all supported networks with their price feeds
   */
  getAllSupportedNetworks(): { chainId: number; name: string; feeds: string[] }[] {
    const networks = ChainConfigUtils.getAllNetworks();
    
    return networks.map(network => ({
      chainId: network.chainId,
      name: network.name,
      feeds: this.getAvailablePriceFeeds(network.chainId)
    }));
  }

  /**
   * Get price feed address for a specific pair and chain
   */
  private getPriceFeedAddress(chainId: number, pair: string): string | null {
    const feeds = PRICE_FEEDS[chainId];
    return feeds?.[pair] || null;
  }

  /**
   * Get or create price feed contract
   */
  private getPriceFeedContract(
    chainId: number, 
    pair: string, 
    address: string, 
    provider: Provider
  ): Contract {
    const key = `${chainId}-${pair}`;
    
    if (!this.priceFeeds.has(key)) {
      const contract = new Contract(address, PRICE_FEED_ABI, provider);
      this.priceFeeds.set(key, contract);
    }
    
    return this.priceFeeds.get(key)!;
  }

  /**
   * Calculate price from raw answer and decimals
   */
  private calculatePrice(answer: bigint, decimals: bigint): number {
    const answerNumber = Number(answer);
    const decimalsNumber = Number(decimals);
    return answerNumber / Math.pow(10, decimalsNumber);
  }

  /**
   * Validate if a price feed is stale (older than 1 hour)
   */
  isPriceStale(updatedAt: number): boolean {
    const oneHour = 60 * 60; // 1 hour in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    return (currentTime - updatedAt) > oneHour;
  }

  /**
   * Get price feed health status
   */
  async getPriceFeedHealth(chainId: number, pair: string): Promise<{
    isHealthy: boolean;
    lastUpdate: number;
    isStale: boolean;
    error?: string;
  }> {
    try {
      const response = await this.getPrice(chainId, pair);
      
      if (!response.success || !response.data) {
        return {
          isHealthy: false,
          lastUpdate: 0,
          isStale: false,
          error: response.error
        };
      }

      const isStale = this.isPriceStale(response.data.updatedAt);

      return {
        isHealthy: true,
        lastUpdate: response.data.updatedAt,
        isStale
      };

    } catch (error: any) {
      return {
        isHealthy: false,
        lastUpdate: 0,
        isStale: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const oracleService = new OracleService();
export default oracleService; 