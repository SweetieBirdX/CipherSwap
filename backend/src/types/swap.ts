// Swap related type definitions - Eyüp's responsibility

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  slippage?: number;
  userAddress: string;
  deadline?: number;
  permit?: any; // For Fusion+ permit
}

export interface SwapResponse {
  success: boolean;
  data?: SwapData;
  error?: string;
}

export interface SwapData {
  swapId: string;
  txHash?: string;
  status: SwapStatus;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  gasEstimate: string;
  gasPrice?: string;
  deadline: number;
  userAddress: string;
  timestamp: number;
  route?: RouteStep[];
  fusionData?: FusionData;
}

export enum SwapStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
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

export interface FusionData {
  permit: any;
  deadline: number;
  nonce: number;
  signature?: string;
}

export interface SwapHistory {
  id: string;
  swapId: string;
  fromToken: string;
  toToken: string;
  amount: string;
  status: SwapStatus;
  timestamp: number;
  userAddress: string;
  txHash?: string;
}

export interface SwapSimulation {
  originalQuote: any;
  simulatedSwap: SwapData;
  slippageDifference: number;
  gasDifference: string;
  priceImpactDifference: number;
  estimatedGains: number;
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

export enum SwapErrorCodes {
  INVALID_TOKENS = 'INVALID_TOKENS',
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  HIGH_SLIPPAGE = 'HIGH_SLIPPAGE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  SWAP_NOT_FOUND = 'SWAP_NOT_FOUND',
  SWAP_EXPIRED = 'SWAP_EXPIRED',
  UNAUTHORIZED_CANCEL = 'UNAUTHORIZED_CANCEL'
}

// Constants
export const SWAP_CONSTANTS = {
  MAX_SLIPPAGE: 50, // 50%
  MIN_AMOUNT: '1000000000000000', // 0.001 ETH in wei
  MAX_AMOUNT: '1000000000000000000000000', // 1M ETH in wei
  DEFAULT_SLIPPAGE: 0.5, // 0.5%
  DEFAULT_DEADLINE: 1800, // 30 minutes
  SWAP_CACHE_DURATION: 30000, // 30 seconds
  MAX_SWAP_HISTORY: 100
} as const; 