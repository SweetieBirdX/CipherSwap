import { config } from './env';

export const LIMIT_ORDER_CONFIG = {
  // SDK Configuration
  SDK: {
    AUTH_KEY: config.INCH_API_KEY,
    NETWORK_ID: config.CHAIN_ID || 1, // Ethereum mainnet default
    TIMEOUT: 30000, // 30 seconds
  },
  
  // Order Configuration
  ORDER: {
    DEFAULT_EXPIRY: 120, // 2 minutes
    MAX_EXPIRY: 86400, // 24 hours
    MIN_AMOUNT: '1000000000000000000', // 1 token in wei
    MAX_AMOUNT: '1000000000000000000000000', // 1M tokens in wei
    DEFAULT_SLIPPAGE: 0.5, // 0.5%
    MAX_SLIPPAGE: 5.0, // 5%
    MAX_ORDERS_PER_USER: 10, // Maximum orders per user
  },
  
  // Gas Configuration
  GAS: {
    DEFAULT_GAS_LIMIT: 300000,
    MAX_GAS_LIMIT: 500000,
    DEFAULT_GAS_PRICE: '20000000000', // 20 gwei
    MAX_GAS_PRICE: '100000000000', // 100 gwei
  },
  
  // Execution Configuration
  EXECUTION: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    EXECUTION_TIMEOUT: 60000, // 60 seconds
    CONFIRMATION_BLOCKS: 1, // Number of blocks to wait for confirmation
  },
  
  // Contract Addresses (1inch Limit Order Protocol)
  CONTRACTS: {
    LIMIT_ORDER_PROTOCOL: {
      1: '0x1111111254fb6c44bAC0beD2854e76F90643097d', // Ethereum mainnet
      137: '0x1111111254fb6c44bAC0beD2854e76F90643097d', // Polygon
      42161: '0x1111111254fb6c44bAC0beD2854e76F90643097d', // Arbitrum
      8453: '0x1111111254fb6c44bAC0beD2854e76F90643097d', // Base
      324: '0x1111111254fb6c44bAC0beD2854e76F90643097d', // zkSync
    }
  },
  
  // Supported Networks
  SUPPORTED_NETWORKS: [1, 137, 42161, 8453, 324],
  
  // Error Messages
  ERRORS: {
    INVALID_NETWORK: 'Unsupported network',
    INVALID_AMOUNT: 'Invalid amount',
    INVALID_PRICE: 'Invalid price',
    INVALID_EXPIRY: 'Invalid expiry time',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    ORDER_NOT_FOUND: 'Order not found',
    ORDER_EXPIRED: 'Order expired',
    ORDER_ALREADY_FILLED: 'Order already filled',
    ORDER_ALREADY_CANCELLED: 'Order already cancelled',
    EXECUTION_FAILED: 'Order execution failed',
    GAS_ESTIMATION_FAILED: 'Gas estimation failed',
  },
  
  // Logging Configuration
  LOGGING: {
    ENABLE_DEBUG: process.env.NODE_ENV === 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    SERVICE_NAME: 'cipherswap-limit-order-sdk',
  }
};

export const getLimitOrderContractAddress = (chainId: number): string => {
  const address = LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL[chainId as keyof typeof LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL];
  if (!address) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  return address;
};

export const validateNetwork = (chainId: number): boolean => {
  return LIMIT_ORDER_CONFIG.SUPPORTED_NETWORKS.includes(chainId);
};

export const validateAmount = (amount: string): boolean => {
  const amountNum = parseFloat(amount);
  const minAmount = parseFloat(LIMIT_ORDER_CONFIG.ORDER.MIN_AMOUNT);
  const maxAmount = parseFloat(LIMIT_ORDER_CONFIG.ORDER.MAX_AMOUNT);
  
  return amountNum >= minAmount && amountNum <= maxAmount;
};

export const validatePrice = (price: string): boolean => {
  const priceNum = parseFloat(price);
  return priceNum > 0;
};

export const validateExpiry = (expiry: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  const minExpiry = now + LIMIT_ORDER_CONFIG.ORDER.DEFAULT_EXPIRY;
  const maxExpiry = now + LIMIT_ORDER_CONFIG.ORDER.MAX_EXPIRY;
  
  return expiry >= minExpiry && expiry <= maxExpiry;
}; 