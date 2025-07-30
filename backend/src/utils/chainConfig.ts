// Chain configuration for multiple networks (Ethereum, L2s, etc.)

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  gasSettings: {
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    gasLimit: number;
  };
  contracts: {
    limitOrderProtocol?: string;
    fusionProtocol?: string;
    chainlinkOracle?: string;
  };
  features: {
    supportsEIP1559: boolean;
    supportsFusion: boolean;
    supportsL2: boolean;
  };
}

export interface NetworkConfig {
  [chainId: number]: ChainConfig;
}

// Mainnet configurations
export const NETWORKS: NetworkConfig = {
  // Ethereum Mainnet
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETHEREUM_RPC_URL || `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    gasSettings: {
      maxFeePerGas: '50', // gwei
      maxPriorityFeePerGas: '2', // gwei
      gasLimit: 500000
    },
    contracts: {
      limitOrderProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      fusionProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      chainlinkOracle: process.env.CHAINLINK_ORACLE_ADDRESS
    },
    features: {
      supportsEIP1559: true,
      supportsFusion: true,
      supportsL2: false
    }
  },

  // Arbitrum One
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: process.env.ARBITRUM_RPC_URL || `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    gasSettings: {
      maxFeePerGas: '0.1', // gwei (L2 gas is cheaper)
      maxPriorityFeePerGas: '0.01', // gwei
      gasLimit: 1000000
    },
    contracts: {
      limitOrderProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      fusionProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      chainlinkOracle: process.env.ARBITRUM_CHAINLINK_ORACLE
    },
    features: {
      supportsEIP1559: true,
      supportsFusion: true,
      supportsL2: true
    }
  },

  // Base
  8453: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    gasSettings: {
      maxFeePerGas: '0.1', // gwei
      maxPriorityFeePerGas: '0.01', // gwei
      gasLimit: 1000000
    },
    contracts: {
      limitOrderProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      fusionProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      chainlinkOracle: process.env.BASE_CHAINLINK_ORACLE
    },
    features: {
      supportsEIP1559: true,
      supportsFusion: true,
      supportsL2: true
    }
  },

  // zkSync Era
  324: {
    chainId: 324,
    name: 'zkSync Era',
    rpcUrl: process.env.ZKSYNC_RPC_URL || 'https://mainnet.era.zksync.io',
    explorerUrl: 'https://explorer.zksync.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    gasSettings: {
      maxFeePerGas: '0.05', // gwei
      maxPriorityFeePerGas: '0.005', // gwei
      gasLimit: 2000000
    },
    contracts: {
      limitOrderProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      fusionProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      chainlinkOracle: process.env.ZKSYNC_CHAINLINK_ORACLE
    },
    features: {
      supportsEIP1559: true,
      supportsFusion: false, // zkSync doesn't support Fusion yet
      supportsL2: true
    }
  },

  // Polygon
  137: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || `https://polygon-rpc.com`,
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    gasSettings: {
      maxFeePerGas: '100', // gwei
      maxPriorityFeePerGas: '30', // gwei
      gasLimit: 500000
    },
    contracts: {
      limitOrderProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      fusionProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      chainlinkOracle: process.env.POLYGON_CHAINLINK_ORACLE
    },
    features: {
      supportsEIP1559: true,
      supportsFusion: true,
      supportsL2: true
    }
  }
};

// Testnet configurations
export const TESTNETS: NetworkConfig = {
  // Goerli Testnet
  5: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: process.env.GOERLI_RPC_URL || `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`,
    explorerUrl: 'https://goerli.etherscan.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    },
    gasSettings: {
      maxFeePerGas: '20', // gwei
      maxPriorityFeePerGas: '1', // gwei
      gasLimit: 500000
    },
    contracts: {
      limitOrderProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      fusionProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      chainlinkOracle: process.env.GOERLI_CHAINLINK_ORACLE
    },
    features: {
      supportsEIP1559: true,
      supportsFusion: true,
      supportsL2: false
    }
  },

  // Sepolia Testnet
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    gasSettings: {
      maxFeePerGas: '20', // gwei
      maxPriorityFeePerGas: '1', // gwei
      gasLimit: 500000
    },
    contracts: {
      limitOrderProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      fusionProtocol: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
      chainlinkOracle: process.env.SEPOLIA_CHAINLINK_ORACLE
    },
    features: {
      supportsEIP1559: true,
      supportsFusion: true,
      supportsL2: false
    }
  }
};

// Utility functions
export class ChainConfigUtils {
  /**
   * Get chain configuration by chain ID
   */
  static getChainConfig(chainId: number): ChainConfig | null {
    return NETWORKS[chainId] || TESTNETS[chainId] || null;
  }

  /**
   * Get all supported networks
   */
  static getAllNetworks(): ChainConfig[] {
    return [...Object.values(NETWORKS), ...Object.values(TESTNETS)];
  }

  /**
   * Get only mainnet networks
   */
  static getMainnetNetworks(): ChainConfig[] {
    return Object.values(NETWORKS);
  }

  /**
   * Get only testnet networks
   */
  static getTestnetNetworks(): ChainConfig[] {
    return Object.values(TESTNETS);
  }

  /**
   * Check if network supports Fusion
   */
  static supportsFusion(chainId: number): boolean {
    const config = this.getChainConfig(chainId);
    return config?.features.supportsFusion || false;
  }

  /**
   * Check if network is L2
   */
  static isL2(chainId: number): boolean {
    const config = this.getChainConfig(chainId);
    return config?.features.supportsL2 || false;
  }

  /**
   * Get gas settings for a chain
   */
  static getGasSettings(chainId: number) {
    const config = this.getChainConfig(chainId);
    return config?.gasSettings || {
      maxFeePerGas: '50',
      maxPriorityFeePerGas: '2',
      gasLimit: 500000
    };
  }

  /**
   * Get contract addresses for a chain
   */
  static getContractAddresses(chainId: number) {
    const config = this.getChainConfig(chainId);
    return config?.contracts || {};
  }

  /**
   * Validate chain ID
   */
  static isValidChainId(chainId: number): boolean {
    return this.getChainConfig(chainId) !== null;
  }

  /**
   * Get network name by chain ID
   */
  static getNetworkName(chainId: number): string {
    const config = this.getChainConfig(chainId);
    return config?.name || 'Unknown Network';
  }

  /**
   * Get RPC URL for a chain
   */
  static getRpcUrl(chainId: number): string {
    const config = this.getChainConfig(chainId);
    return config?.rpcUrl || '';
  }
}

// Default export
export default ChainConfigUtils; 