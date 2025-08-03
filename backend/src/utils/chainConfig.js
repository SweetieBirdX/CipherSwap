"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainConfigUtils = exports.CHAIN_CONFIGS = void 0;
var logger_1 = require("./logger");
exports.CHAIN_CONFIGS = {
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
var ChainConfigUtils = /** @class */ (function () {
    function ChainConfigUtils() {
    }
    /**
     * Get chain configuration by chain ID
     */
    ChainConfigUtils.getChainConfig = function (chainId) {
        return exports.CHAIN_CONFIGS[chainId] || null;
    };
    /**
     * Get all supported chain IDs
     */
    ChainConfigUtils.getAllChainIds = function () {
        return Object.keys(exports.CHAIN_CONFIGS).map(Number);
    };
    /**
     * Get all mainnet chain IDs
     */
    ChainConfigUtils.getMainnetChainIds = function () {
        return Object.values(exports.CHAIN_CONFIGS)
            .filter(function (config) { return !config.isTestnet; })
            .map(function (config) { return config.chainId; });
    };
    /**
     * Get all testnet chain IDs
     */
    ChainConfigUtils.getTestnetChainIds = function () {
        return Object.values(exports.CHAIN_CONFIGS)
            .filter(function (config) { return config.isTestnet; })
            .map(function (config) { return config.chainId; });
    };
    /**
     * Check if chain ID is valid
     */
    ChainConfigUtils.isValidChainId = function (chainId) {
        return chainId in exports.CHAIN_CONFIGS;
    };
    /**
     * Check if chain is testnet
     */
    ChainConfigUtils.isTestnet = function (chainId) {
        var config = this.getChainConfig(chainId);
        return (config === null || config === void 0 ? void 0 : config.isTestnet) || false;
    };
    /**
     * Get network name by chain ID
     */
    ChainConfigUtils.getNetworkName = function (chainId) {
        var config = this.getChainConfig(chainId);
        return (config === null || config === void 0 ? void 0 : config.name) || 'Unknown Network';
    };
    /**
     * Get RPC URL by chain ID
     */
    ChainConfigUtils.getRpcUrl = function (chainId) {
        var config = this.getChainConfig(chainId);
        return (config === null || config === void 0 ? void 0 : config.rpcUrl) || null;
    };
    /**
     * Get explorer URL by chain ID
     */
    ChainConfigUtils.getExplorerUrl = function (chainId) {
        var config = this.getChainConfig(chainId);
        return (config === null || config === void 0 ? void 0 : config.explorer) || null;
    };
    /**
     * Get native currency by chain ID
     */
    ChainConfigUtils.getNativeCurrency = function (chainId) {
        var config = this.getChainConfig(chainId);
        return (config === null || config === void 0 ? void 0 : config.nativeCurrency) || null;
    };
    /**
     * Get all networks
     */
    ChainConfigUtils.getAllNetworks = function () {
        return Object.values(exports.CHAIN_CONFIGS);
    };
    /**
     * Get mainnet networks
     */
    ChainConfigUtils.getMainnetNetworks = function () {
        return Object.values(exports.CHAIN_CONFIGS).filter(function (config) { return !config.isTestnet; });
    };
    /**
     * Get testnet networks
     */
    ChainConfigUtils.getTestnetNetworks = function () {
        return Object.values(exports.CHAIN_CONFIGS).filter(function (config) { return config.isTestnet; });
    };
    /**
     * Validate chain configuration
     */
    ChainConfigUtils.validateChainConfig = function (chainId) {
        var errors = [];
        if (!this.isValidChainId(chainId)) {
            errors.push("Invalid chain ID: ".concat(chainId));
        }
        var config = this.getChainConfig(chainId);
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
            errors: errors
        };
    };
    /**
     * Log chain configuration for debugging
     */
    ChainConfigUtils.logChainConfig = function (chainId) {
        var config = this.getChainConfig(chainId);
        if (config) {
            logger_1.logger.info('Chain configuration', {
                chainId: chainId,
                name: config.name,
                isTestnet: config.isTestnet,
                nativeCurrency: config.nativeCurrency,
                blockTime: config.blockTime
            });
        }
        else {
            logger_1.logger.warn('Unknown chain ID', { chainId: chainId });
        }
    };
    return ChainConfigUtils;
}());
exports.ChainConfigUtils = ChainConfigUtils;
