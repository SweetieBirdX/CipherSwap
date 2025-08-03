"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv = require("dotenv");
// Load environment variables
dotenv.config();
exports.config = {
    // Server Configuration
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    // API Keys
    INCH_API_KEY: process.env.INCH_API_KEY,
    INFURA_KEY: process.env.INFURA_KEY,
    ALCHEMY_KEY: process.env.ALCHEMY_KEY,
    // Blockchain Configuration - MAINNET
    CHAIN_ID: parseInt(process.env.CHAIN_ID || '1'), // Ethereum mainnet
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    // RPC URLs - MAINNET
    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/".concat(process.env.INFURA_KEY),
    ARBITRUM_RPC_URL: process.env.ARBITRUM_RPC_URL || "https://arb-mainnet.g.alchemy.com/v2/".concat(process.env.ALCHEMY_KEY),
    BASE_RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    ZKSYNC_RPC_URL: process.env.ZKSYNC_RPC_URL || 'https://mainnet.era.zksync.io',
    // Chainlink Configuration - MAINNET
    CHAINLINK_ORACLE_ADDRESS: process.env.CHAINLINK_ORACLE_ADDRESS,
    // Security
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    // Feature Flags
    ENABLE_MEV_PROTECTION: process.env.ENABLE_MEV_PROTECTION === 'true',
    ENABLE_FUSION: process.env.ENABLE_FUSION === 'true',
    ENABLE_L2_SUPPORT: process.env.ENABLE_L2_SUPPORT === 'true',
    ENABLE_LIMIT_ORDERS: process.env.ENABLE_LIMIT_ORDERS !== 'false', // Default true
    ENABLE_RESOLVER_BOT: process.env.ENABLE_RESOLVER_BOT === 'true',
    // Limit Order Configuration
    LIMIT_ORDER_DEFAULT_EXPIRY: parseInt(process.env.LIMIT_ORDER_DEFAULT_EXPIRY || '120'), // 2 minutes
    LIMIT_ORDER_MAX_EXPIRY: parseInt(process.env.LIMIT_ORDER_MAX_EXPIRY || '86400'), // 24 hours
    LIMIT_ORDER_MIN_SIZE: process.env.LIMIT_ORDER_MIN_SIZE || '1000000000000000000', // 1 token
    LIMIT_ORDER_MAX_SIZE: process.env.LIMIT_ORDER_MAX_SIZE || '1000000000000000000000000', // 1M tokens
    // Resolver Bot Configuration
    RESOLVER_BOT_INTERVAL: parseInt(process.env.RESOLVER_BOT_INTERVAL || '10000'), // 10 seconds
    RESOLVER_BOT_MIN_ORDER_SIZE: parseFloat(process.env.RESOLVER_BOT_MIN_ORDER_SIZE || '0.001'), // Minimum order size
    RESOLVER_BOT_MAX_CONCURRENT_ORDERS: parseInt(process.env.RESOLVER_BOT_MAX_CONCURRENT_ORDERS || '5'),
    RESOLVER_BOT_ENABLE_WHITELIST: process.env.RESOLVER_BOT_ENABLE_WHITELIST === 'true',
    // 1inch Limit Order SDK Configuration - MAINNET
    INCH_LIMIT_ORDER_NETWORK_ID: parseInt(process.env.INCH_LIMIT_ORDER_NETWORK_ID || '1'), // Ethereum mainnet
    INCH_LIMIT_ORDER_AUTH_KEY: process.env.INCH_LIMIT_ORDER_AUTH_KEY || process.env.INCH_API_KEY,
    // Real Market Data APIs
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
    DEFILLAMA_API_KEY: process.env.DEFILLAMA_API_KEY,
    THEGRAPH_API_KEY: process.env.THEGRAPH_API_KEY,
    // Chainlink Oracle Addresses - MAINNET
    CHAINLINK_ETH_USD_ORACLE: process.env.CHAINLINK_ETH_USD_ORACLE || '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', // Mainnet ETH/USD
    CHAINLINK_BTC_USD_ORACLE: process.env.CHAINLINK_BTC_USD_ORACLE || '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c', // Mainnet BTC/USD
    // DEX Integration - MAINNET
    UNISWAP_V3_FACTORY: process.env.UNISWAP_V3_FACTORY || '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Mainnet Uniswap V3
    SUSHISWAP_FACTORY: process.env.SUSHISWAP_FACTORY || '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac', // Mainnet SushiSwap
    // Flashbots Configuration - MAINNET
    FLASHBOTS_RELAY_URL: process.env.FLASHBOTS_RELAY_URL || 'https://relay.flashbots.net',
    FLASHBOTS_SIGNER_PRIVATE_KEY: process.env.FLASHBOTS_SIGNER_PRIVATE_KEY,
    FLASHBOTS_BUNDLE_TIMEOUT: parseInt(process.env.FLASHBOTS_BUNDLE_TIMEOUT || '120000'), // 2 minutes
    FLASHBOTS_MAX_RETRIES: parseInt(process.env.FLASHBOTS_MAX_RETRIES || '3'),
    // Flashbots Retry and Fallback Configuration
    FLASHBOTS_RETRY_BASE_DELAY: parseInt(process.env.FLASHBOTS_RETRY_BASE_DELAY || '1000'), // 1 second
    FLASHBOTS_RETRY_MAX_DELAY: parseInt(process.env.FLASHBOTS_RETRY_MAX_DELAY || '30000'), // 30 seconds
    FLASHBOTS_RETRY_BACKOFF_MULTIPLIER: parseFloat(process.env.FLASHBOTS_RETRY_BACKOFF_MULTIPLIER || '2.0'),
    FLASHBOTS_ENABLE_FALLBACK: process.env.FLASHBOTS_ENABLE_FALLBACK === 'true',
    FLASHBOTS_FALLBACK_GAS_PRICE: process.env.FLASHBOTS_FALLBACK_GAS_PRICE || '25000000000', // 25 gwei
    FLASHBOTS_FALLBACK_SLIPPAGE: parseFloat(process.env.FLASHBOTS_FALLBACK_SLIPPAGE || '0.5'), // 0.5%
    FLASHBOTS_RETRY_ON_FAILURE: process.env.FLASHBOTS_RETRY_ON_FAILURE !== 'false', // Default true
    FLASHBOTS_RETRY_ON_EXPIRY: process.env.FLASHBOTS_RETRY_ON_EXPIRY !== 'false', // Default true
    FLASHBOTS_RETRY_ON_REVERT: process.env.FLASHBOTS_RETRY_ON_REVERT !== 'false', // Default true
    // Slippage Tolerance Controls
    SLIPPAGE_DEFAULT_TOLERANCE: parseFloat(process.env.SLIPPAGE_DEFAULT_TOLERANCE || '0.5'), // 0.5%
    SLIPPAGE_MAX_TOLERANCE: parseFloat(process.env.SLIPPAGE_MAX_TOLERANCE || '5.0'), // 5%
    SLIPPAGE_MIN_TOLERANCE: parseFloat(process.env.SLIPPAGE_MIN_TOLERANCE || '0.1'), // 0.1%
    SLIPPAGE_WARNING_THRESHOLD: parseFloat(process.env.SLIPPAGE_WARNING_THRESHOLD || '2.0'), // 2%
    SLIPPAGE_CRITICAL_THRESHOLD: parseFloat(process.env.SLIPPAGE_CRITICAL_THRESHOLD || '5.0'), // 5%
    SLIPPAGE_AUTO_ADJUSTMENT: process.env.SLIPPAGE_AUTO_ADJUSTMENT !== 'false', // Default true
    SLIPPAGE_MARKET_BASED_ADJUSTMENT: process.env.SLIPPAGE_MARKET_BASED_ADJUSTMENT !== 'false', // Default true
    SLIPPAGE_VOLATILITY_MULTIPLIER: parseFloat(process.env.SLIPPAGE_VOLATILITY_MULTIPLIER || '1.5'), // 1.5x for volatile markets
    SLIPPAGE_LIQUIDITY_MULTIPLIER: parseFloat(process.env.SLIPPAGE_LIQUIDITY_MULTIPLIER || '1.2'), // 1.2x for low liquidity
    SLIPPAGE_TIME_BASED_ADJUSTMENT: process.env.SLIPPAGE_TIME_BASED_ADJUSTMENT !== 'false', // Default true
    SLIPPAGE_PEAK_HOURS_MULTIPLIER: parseFloat(process.env.SLIPPAGE_PEAK_HOURS_MULTIPLIER || '1.3'), // 1.3x during peak hours
    SLIPPAGE_OFF_PEAK_MULTIPLIER: parseFloat(process.env.SLIPPAGE_OFF_PEAK_MULTIPLIER || '0.8'), // 0.8x during off-peak hours
    SLIPPAGE_TRADE_SIZE_ADJUSTMENT: process.env.SLIPPAGE_TRADE_SIZE_ADJUSTMENT !== 'false', // Default true
    SLIPPAGE_LARGE_TRADE_THRESHOLD: parseFloat(process.env.SLIPPAGE_LARGE_TRADE_THRESHOLD || '10000'), // $10k USD
    SLIPPAGE_LARGE_TRADE_MULTIPLIER: parseFloat(process.env.SLIPPAGE_LARGE_TRADE_MULTIPLIER || '1.4'), // 1.4x for large trades
    SLIPPAGE_CHAIN_SPECIFIC: process.env.SLIPPAGE_CHAIN_SPECIFIC === 'true', // Enable chain-specific adjustments
    SLIPPAGE_ETHEREUM_MULTIPLIER: parseFloat(process.env.SLIPPAGE_ETHEREUM_MULTIPLIER || '1.0'), // 1.0x for Ethereum
    SLIPPAGE_ARBITRUM_MULTIPLIER: parseFloat(process.env.SLIPPAGE_ARBITRUM_MULTIPLIER || '0.8'), // 0.8x for Arbitrum
    SLIPPAGE_BASE_MULTIPLIER: parseFloat(process.env.SLIPPAGE_BASE_MULTIPLIER || '0.9'), // 0.9x for Base
    SLIPPAGE_ZKSYNC_MULTIPLIER: parseFloat(process.env.SLIPPAGE_ZKSYNC_MULTIPLIER || '0.7'), // 0.7x for zkSync
};
// Validate required environment variables
var requiredEnvVars = [
    'INCH_API_KEY',
    'PRIVATE_KEY',
    'CHAINLINK_ORACLE_ADDRESS'
];
for (var _i = 0, requiredEnvVars_1 = requiredEnvVars; _i < requiredEnvVars_1.length; _i++) {
    var envVar = requiredEnvVars_1[_i];
    if (!process.env[envVar]) {
        throw new Error("Missing required environment variable: ".concat(envVar));
    }
}
exports.default = exports.config;
