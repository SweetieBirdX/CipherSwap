import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // API Keys
  INCH_API_KEY: process.env.INCH_API_KEY!,
  INFURA_KEY: process.env.INFURA_KEY!,
  ALCHEMY_KEY: process.env.ALCHEMY_KEY!,
  
  // Blockchain Configuration
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '1'),
  PRIVATE_KEY: process.env.PRIVATE_KEY!,
  
  // RPC URLs
  ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
  ARBITRUM_RPC_URL: process.env.ARBITRUM_RPC_URL || `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
  BASE_RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  ZKSYNC_RPC_URL: process.env.ZKSYNC_RPC_URL || 'https://mainnet.era.zksync.io',
  
  // Chainlink Configuration
  CHAINLINK_ORACLE_ADDRESS: process.env.CHAINLINK_ORACLE_ADDRESS!,
  
  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Feature Flags
  ENABLE_MEV_PROTECTION: process.env.ENABLE_MEV_PROTECTION === 'true',
  ENABLE_FUSION: process.env.ENABLE_FUSION === 'true',
  ENABLE_L2_SUPPORT: process.env.ENABLE_L2_SUPPORT === 'true',
  
  // Flashbots Configuration
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
};

// Validate required environment variables
const requiredEnvVars = [
  'INCH_API_KEY',
  'PRIVATE_KEY',
  'CHAINLINK_ORACLE_ADDRESS'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config; 