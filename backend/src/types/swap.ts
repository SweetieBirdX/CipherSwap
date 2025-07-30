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
  useMEVProtection?: boolean; // Enable MEV protection with Flashbots
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
  // MEV protection and fallback data
  bundleId?: string;
  bundleHash?: string;
  fallbackUsed?: boolean;
  fallbackReason?: string;
}

export enum SwapStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// Limit Order Types
export interface LimitOrderRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  userAddress: string;
  limitPrice: string;
  orderType: 'buy' | 'sell';
  deadline?: number;
  permit?: any;
}

export interface LimitOrderResponse {
  success: boolean;
  data?: LimitOrderData;
  error?: string;
}

export interface LimitOrderData {
  orderId: string;
  txHash?: string;
  status: LimitOrderStatus;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  limitPrice: string;
  orderType: 'buy' | 'sell';
  gasEstimate: string;
  gasPrice?: string;
  deadline: number;
  userAddress: string;
  timestamp: number;
  route?: RouteStep[];
  fusionData?: FusionData;
}

export enum LimitOrderStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  FAILED = 'failed'
}

// Fusion+ Quote Types
export interface FusionQuoteRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  userAddress: string;
  limitPrice: string;
  orderType: 'buy' | 'sell';
}

export interface FusionQuoteResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Fusion+ Secrets and Escrow Types
export interface FusionSecretRequest {
  orderId: string;
  userAddress: string;
  secret: string;
  signature: string;
  nonce: number;
}

export interface FusionSecretResponse {
  success: boolean;
  data?: FusionSecretData;
  error?: string;
}

export interface FusionSecretData {
  secretId: string;
  orderId: string;
  userAddress: string;
  status: SecretStatus;
  timestamp: number;
  escrowAddress?: string;
  escrowReady: boolean;
  secretHash?: string;
  submissionTxHash?: string;
}

export enum SecretStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export interface EscrowStatusRequest {
  orderId: string;
  userAddress: string;
}

export interface EscrowStatusResponse {
  success: boolean;
  data?: EscrowStatusData;
  error?: string;
}

export interface EscrowStatusData {
  orderId: string;
  escrowAddress: string;
  isReady: boolean;
  readyTimestamp?: number;
  expirationTimestamp: number;
  depositedAmount: string;
  requiredAmount: string;
  status: EscrowStatus;
}

export enum EscrowStatus {
  PENDING = 'pending',
  READY = 'ready',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
  FAILED = 'failed'
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
  secret?: string;
  escrowAddress?: string;
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
  UNAUTHORIZED_CANCEL = 'UNAUTHORIZED_CANCEL',
  ESCROW_NOT_READY = 'ESCROW_NOT_READY',
  SECRET_INVALID = 'SECRET_INVALID',
  SECRET_EXPIRED = 'SECRET_EXPIRED'
}

// Constants
export const SWAP_CONSTANTS = {
  MAX_SLIPPAGE: 50, // 50%
  MIN_AMOUNT: '1000000000000000', // 0.001 ETH in wei
  MAX_AMOUNT: '1000000000000000000000000', // 1M ETH in wei
  DEFAULT_SLIPPAGE: 0.5, // 0.5%
  DEFAULT_DEADLINE: 1800, // 30 minutes
  SWAP_CACHE_DURATION: 30000, // 30 seconds
  MAX_SWAP_HISTORY: 100,
  ESCROW_CHECK_INTERVAL: 5000, // 5 seconds
  SECRET_SUBMISSION_TIMEOUT: 60000, // 60 seconds
  MAX_ESCROW_WAIT_TIME: 300000 // 5 minutes
} as const;

// Flashbots Bundle Types
export interface FlashbotsBundleRequest {
  transactions: BundleTransaction[];
  targetBlock?: number;
  maxBlockNumber?: number;
  minTimestamp?: number;
  maxTimestamp?: number;
  revertingTxHashes?: string[];
  replacementUuid?: string;
  refundRecipient?: string;
  refundPercent?: number;
}

export interface BundleTransaction {
  transaction: string; // Signed transaction hex
  canRevert?: boolean;
}

export interface FlashbotsBundleResponse {
  success: boolean;
  data?: FlashbotsBundleData;
  error?: string;
}

export interface FlashbotsBundleData {
  bundleId: string;
  bundleHash: string;
  targetBlock: number;
  status: BundleStatus;
  transactions: BundleTransaction[];
  gasEstimate: string;
  gasPrice: string;
  totalValue: string;
  refundRecipient?: string;
  refundPercent?: number;
  timestamp: number;
  userAddress: string;
  simulationResult?: BundleSimulationResult;
  // Retry and fallback data
  retryData?: BundleRetryData;
  fallbackData?: BundleFallbackData;
  submissionAttempts: number;
  lastSubmissionAttempt?: number;
}

export enum BundleStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REVERTED = 'reverted'
}

export interface BundleSimulationResult {
  success: boolean;
  error?: string;
  gasUsed: string;
  blockNumber: number;
  stateBlockNumber: number;
  mevGasPrice: string;
  profit: string;
  refundableValue: string;
  logs: any[];
}

export interface FlashbotsSimulationRequest {
  bundle: FlashbotsBundleRequest;
  blockNumber: number;
  stateBlockNumber?: number;
}

export interface FlashbotsSimulationResponse {
  success: boolean;
  data?: BundleSimulationResult;
  error?: string;
}

export interface GasEstimateRequest {
  transactions: string[];
  blockNumber?: number;
  stateBlockNumber?: number;
}

export interface GasEstimateResponse {
  success: boolean;
  data?: {
    gasUsed: string;
    gasPrice: string;
    totalCost: string;
    estimatedProfit: string;
  };
  error?: string;
}

export interface MEVProtectionConfig {
  useFlashbots: boolean;
  targetBlock?: number;
  maxBlockNumber?: number;
  refundRecipient?: string;
  refundPercent?: number;
  minTimestamp?: number;
  maxTimestamp?: number;
  revertingTxHashes?: string[];
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
  enableFallback?: boolean;
  fallbackGasPrice?: string;
  fallbackSlippage?: number;
}

// Retry and Fallback Types
export interface BundleRetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  enableFallback: boolean;
  fallbackGasPrice?: string;
  fallbackSlippage?: number;
}

export interface BundleRetryAttempt {
  attempt: number;
  timestamp: number;
  error?: string;
  bundleHash?: string;
  targetBlock: number;
  gasPrice?: string;
}

export interface BundleRetryData {
  originalBundleId: string;
  retryAttempts: BundleRetryAttempt[];
  currentAttempt: number;
  maxRetries: number;
  lastError?: string;
  fallbackUsed: boolean;
  finalStatus: BundleStatus;
}

export interface BundleFallbackData {
  originalBundleId: string;
  fallbackTxHash?: string;
  fallbackGasPrice: string;
  fallbackSlippage: number;
  fallbackStatus: BundleStatus;
  timestamp: number;
} 