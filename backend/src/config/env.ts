import dotenv from 'dotenv';

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
  ENABLE_L2_SUPPORT: process.env.ENABLE_L2_SUPPORT === 'true'
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