import { logger } from './logger';

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockTime: number;
  isTestnet: boolean;
}

export const CHAIN_CONFIGS: Record<number, ChainConfig> = {
  // Mainnet Chains
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockTime: 12,
    isTestnet: false
  },
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    blockTime: 2,
    isTestnet: false
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockTime: 1,
    isTestnet: false
  },
  8453: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockTime: 2,
    isTestnet: false
  },
  324: {
    chainId: 324,
    name: 'zkSync Era',
    rpcUrl: 'https://mainnet.era.zksync.io',
    explorer: 'https://explorer.zksync.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockTime: 1,
    isTestnet: false
  },
  
  // Testnet Chains
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockTime: 12,
    isTestnet: true
  },
  5: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/',
    explorer: 'https://goerli.etherscan.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockTime: 12,
    isTestnet: true
  },
  80001: {
    chainId: 80001,
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    blockTime: 2,
    isTestnet: true
  },
  421613: {
    chainId: 421613,
    name: 'Arbitrum Goerli',
    rpcUrl: 'https://goerli-rollup.arbitrum.io/rpc',
    explorer: 'https://goerli.arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockTime: 1,
    isTestnet: true
  },
  84531: {
    chainId: 84531,
    name: 'Base Goerli',
    rpcUrl: 'https://goerli.base.org',
    explorer: 'https://goerli.basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockTime: 2,
    isTestnet: true
  }
};

export class ChainConfigUtils {
  /**
   * Get chain configuration by chain ID
   */
  static getChainConfig(chainId: number): ChainConfig | null {
    return CHAIN_CONFIGS[chainId] || null;
  }

  /**
   * Get all supported chain IDs
   */
  static getAllChainIds(): number[] {
    return Object.keys(CHAIN_CONFIGS).map(Number);
  }

  /**
   * Get all mainnet chain IDs
   */
  static getMainnetChainIds(): number[] {
    return Object.values(CHAIN_CONFIGS)
      .filter(config => !config.isTestnet)
      .map(config => config.chainId);
  }

  /**
   * Get all testnet chain IDs
   */
  static getTestnetChainIds(): number[] {
    return Object.values(CHAIN_CONFIGS)
      .filter(config => config.isTestnet)
      .map(config => config.chainId);
  }

  /**
   * Check if chain ID is valid
   */
  static isValidChainId(chainId: number): boolean {
    return chainId in CHAIN_CONFIGS;
  }

  /**
   * Check if chain is testnet
   */
  static isTestnet(chainId: number): boolean {
    const config = this.getChainConfig(chainId);
    return config?.isTestnet || false;
  }

  /**
   * Get network name by chain ID
   */
  static getNetworkName(chainId: number): string {
    const config = this.getChainConfig(chainId);
    return config?.name || 'Unknown Network';
  }

  /**
   * Get RPC URL by chain ID
   */
  static getRpcUrl(chainId: number): string | null {
    const config = this.getChainConfig(chainId);
    return config?.rpcUrl || null;
  }

  /**
   * Get explorer URL by chain ID
   */
  static getExplorerUrl(chainId: number): string | null {
    const config = this.getChainConfig(chainId);
    return config?.explorer || null;
  }

  /**
   * Get native currency by chain ID
   */
  static getNativeCurrency(chainId: number) {
    const config = this.getChainConfig(chainId);
    return config?.nativeCurrency || null;
  }

  /**
   * Get all networks
   */
  static getAllNetworks(): ChainConfig[] {
    return Object.values(CHAIN_CONFIGS);
  }

  /**
   * Get mainnet networks
   */
  static getMainnetNetworks(): ChainConfig[] {
    return Object.values(CHAIN_CONFIGS).filter(config => !config.isTestnet);
  }

  /**
   * Get testnet networks
   */
  static getTestnetNetworks(): ChainConfig[] {
    return Object.values(CHAIN_CONFIGS).filter(config => config.isTestnet);
  }

  /**
   * Validate chain configuration
   */
  static validateChainConfig(chainId: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.isValidChainId(chainId)) {
      errors.push(`Invalid chain ID: ${chainId}`);
    }
    
    const config = this.getChainConfig(chainId);
    if (config) {
      if (!config.rpcUrl) {
        errors.push('Missing RPC URL');
      }
      if (!config.explorer) {
        errors.push('Missing explorer URL');
      }
      if (!config.nativeCurrency) {
        errors.push('Missing native currency configuration');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Log chain configuration for debugging
   */
  static logChainConfig(chainId: number): void {
    const config = this.getChainConfig(chainId);
    if (config) {
      logger.info('Chain configuration', {
        chainId,
        name: config.name,
        isTestnet: config.isTestnet,
        nativeCurrency: config.nativeCurrency,
        blockTime: config.blockTime
      });
    } else {
      logger.warn('Unknown chain ID', { chainId });
    }
  }
} 