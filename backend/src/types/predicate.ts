// Predicate related type definitions - Eyüp's responsibility

export interface PredicateRequest {
  chainId: number;
  oracleAddress: string;
  tolerance: number;
  userAddress: string;
  tokenAddress?: string;
  priceThreshold?: number;
  deadline?: number;
}

export interface PredicateResponse {
  success: boolean;
  data?: PredicateData;
  error?: string;
}

export interface PredicateData {
  predicateId: string;
  chainId: number;
  oracleAddress: string;
  tolerance: number;
  userAddress: string;
  tokenAddress?: string;
  priceThreshold?: number;
  currentPrice: number;
  isValid: boolean;
  status: PredicateStatus;
  createdAt: number;
  expiresAt?: number;
  txHash?: string;
}

export enum PredicateStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  INVALID = 'invalid',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled'
}

export interface OracleData {
  address: string;
  price: number;
  timestamp: number;
  decimals: number;
  description: string;
}

export interface PredicateValidation {
  predicateId: string;
  currentPrice: number;
  thresholdPrice: number;
  tolerance: number;
  isValid: boolean;
  deviation: number;
  timestamp: number;
}

export interface PredicateHistory {
  id: string;
  predicateId: string;
  chainId: number;
  oracleAddress: string;
  tolerance: number;
  status: PredicateStatus;
  createdAt: number;
  userAddress: string;
  txHash?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export enum PredicateErrorCodes {
  INVALID_ORACLE = 'INVALID_ORACLE',
  INVALID_TOLERANCE = 'INVALID_TOLERANCE',
  PREDICATE_NOT_FOUND = 'PREDICATE_NOT_FOUND',
  PREDICATE_EXPIRED = 'PREDICATE_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CHAIN_ID = 'INVALID_CHAIN_ID',
  ORACLE_TIMEOUT = 'ORACLE_TIMEOUT'
}

// Constants
export const PREDICATE_CONSTANTS = {
  MAX_TOLERANCE: 10, // 10%
  MIN_TOLERANCE: 0.1, // 0.1%
  DEFAULT_TOLERANCE: 1, // 1%
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_PREDICATE_HISTORY: 100,
  ORACLE_UPDATE_INTERVAL: 60000 // 1 minute
} as const;

// Chainlink Oracle Addresses (Mainnet)
export const CHAINLINK_ORACLES = {
  1: { // Ethereum Mainnet
    'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    'BTC/USD': '0xF4030086522a5bEEa5E49b0311D971b50Ff9b538',
    'USDC/USD': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
    'DAI/USD': '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9'
  },
  137: { // Polygon
    'ETH/USD': '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    'BTC/USD': '0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6',
    'USDC/USD': '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7'
  },
  42161: { // Arbitrum
    'ETH/USD': '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
    'BTC/USD': '0x6ce185860a496310F6C54D98eaaB54831c2Af31d'
  }
} as const; 