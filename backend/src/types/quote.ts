// Quote related type definitions - Eyüp's responsibility

export interface QuoteRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  slippage?: number;
  userAddress?: string;
}

export interface QuoteResponse {
  success: boolean;
  data?: QuoteData;
  error?: string;
}

export interface QuoteData {
  quote: any; // 1inch quote response
  estimatedGas: string;
  slippage: number;
  priceImpact: number;
  estimatedGains: number;
  route: RouteStep[];
  timestamp: number;
}

export interface RouteStep {
  fromToken: string;
  toToken: string;
  fromTokenAmount: string;
  toTokenAmount: string;
  estimatedGas: string;
  protocol: string;
  pool?: string;
}

export interface QuoteHistory {
  id: string;
  fromToken: string;
  toToken: string;
  amount: string;
  quote: QuoteData;
  timestamp: number;
  userAddress?: string;
}

export interface QuoteValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QuoteSimulation {
  originalQuote: QuoteData;
  simulatedQuote: QuoteData;
  slippageDifference: number;
  gasDifference: string;
  priceImpactDifference: number;
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

export enum QuoteErrorCodes {
  INVALID_TOKENS = 'INVALID_TOKENS',
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  HIGH_SLIPPAGE = 'HIGH_SLIPPAGE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_AMOUNT = 'INVALID_AMOUNT'
}

// Constants
export const QUOTE_CONSTANTS = {
  MAX_SLIPPAGE: 50, // 50%
  MIN_AMOUNT: '1000000000000000', // 0.001 ETH in wei
  MAX_AMOUNT: '1000000000000000000000000', // 1M ETH in wei
  DEFAULT_SLIPPAGE: 0.5, // 0.5%
  QUOTE_CACHE_DURATION: 30000, // 30 seconds
  MAX_QUOTE_HISTORY: 100
} as const; 