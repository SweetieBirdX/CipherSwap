export interface RFQRequest {
  requestId: string;
  userAddress: string;
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  deadline: number;
  timestamp: number;
  status: RFQStatus;
  
  // MEV Protection
  useMEVProtection: boolean;
  allowedResolvers?: string[]; // Whitelist of resolver addresses
  maxSlippage?: number;
  predicateId?: string; // Associated price predicate
  
  // Quote preferences
  preferredExecutionTime?: number; // Max execution time in seconds
  gasOptimization?: boolean; // Whether to optimize for gas
  partialFill?: boolean; // Allow partial fills
  
  // Metadata
  metadata?: {
    source?: string; // Frontend source
    sessionId?: string; // User session
    referralCode?: string; // Referral tracking
  };
}

export interface RFQResponse {
  responseId: string;
  requestId: string;
  resolverAddress: string;
  resolverName: string;
  
  // Quote details
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  gasEstimate: string;
  gasPrice: string;
  executionTime: number; // Estimated execution time in seconds
  
  // MEV Protection details
  mevProtectionType: 'flashbots' | 'fusion' | 'none';
  bundleId?: string; // Flashbots bundle ID
  escrowAddress?: string; // Fusion+ escrow address
  
  // Fees and costs
  resolverFee: string;
  protocolFee: string;
  totalCost: string;
  
  // Validity
  validUntil: number;
  timestamp: number;
  status: RFQResponseStatus;
  
  // Performance metrics
  resolverReputation: number;
  averageExecutionTime: number;
  successRate: number;
}

export interface RFQExecution {
  executionId: string;
  requestId: string;
  responseId: string;
  userAddress: string;
  resolverAddress: string;
  
  // Execution details
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  
  // Transaction details
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  
  // Execution status
  status: ExecutionStatus;
  executionTime: number; // Actual execution time
  timestamp: number;
  
  // Error details (if failed)
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export enum RFQStatus {
  PENDING = 'pending',
  QUOTED = 'quoted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  EXECUTED = 'executed',
  FAILED = 'failed'
}

export enum RFQResponseStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  EXECUTED = 'executed',
  FAILED = 'failed'
}

export enum ExecutionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface RFQQuery {
  userAddress?: string;
  fromToken?: string;
  toToken?: string;
  chainId?: number;
  status?: RFQStatus;
  startTime?: number;
  endTime?: number;
  limit?: number;
  page?: number;
  sortBy?: 'timestamp' | 'amount' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface RFQStats {
  totalRequests: number;
  activeRequests: number;
  totalVolume: string;
  averageResponseTime: number;
  successRate: number;
  mostActivePairs: Array<{
    pair: string;
    volume: string;
    requestCount: number;
  }>;
  resolverStats: {
    total: number;
    active: number;
    averageReputation: number;
  };
}

export interface ResolverQuote {
  resolverAddress: string;
  resolverName: string;
  quote: RFQResponse;
  performance: {
    reputation: number;
    successRate: number;
    averageExecutionTime: number;
    totalFills: number;
  };
}

export interface RFQConstants {
  MAX_REQUESTS_PER_USER: number;
  MAX_AMOUNT: string;
  MIN_AMOUNT: string;
  REQUEST_EXPIRY_TIME: number;
  QUOTE_VALIDITY_TIME: number;
  MAX_ALLOWED_RESOLVERS: number;
  DEFAULT_SLIPPAGE: number;
  MAX_SLIPPAGE: number;
  MIN_RESPONSE_TIME: number;
  MAX_RESPONSE_TIME: number;
}

export const RFQ_CONSTANTS: RFQConstants = {
  MAX_REQUESTS_PER_USER: 100,
  MAX_AMOUNT: '1000000000000000000000000', // 1M tokens
  MIN_AMOUNT: '1000000000000000000', // 1 token
  REQUEST_EXPIRY_TIME: 5 * 60 * 1000, // 5 minutes
  QUOTE_VALIDITY_TIME: 2 * 60 * 1000, // 2 minutes
  MAX_ALLOWED_RESOLVERS: 20,
  DEFAULT_SLIPPAGE: 0.5,
  MAX_SLIPPAGE: 5.0,
  MIN_RESPONSE_TIME: 1000, // 1 second
  MAX_RESPONSE_TIME: 30000 // 30 seconds
};

export interface RFQNotification {
  type: 'request_created' | 'quote_received' | 'quote_expired' | 'execution_started' | 'execution_completed' | 'execution_failed';
  requestId: string;
  userAddress: string;
  data: {
    message: string;
    details?: any;
  };
  timestamp: number;
}

export interface RFQAnalytics {
  requestId: string;
  userAddress: string;
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
  
  // Timing metrics
  requestTime: number;
  firstQuoteTime?: number;
  lastQuoteTime?: number;
  executionTime?: number;
  
  // Quote metrics
  totalQuotes: number;
  averageQuoteTime: number;
  bestQuote?: RFQResponse;
  worstQuote?: RFQResponse;
  
  // Execution metrics
  executedQuote?: RFQResponse;
  executionSuccess: boolean;
  actualExecutionTime?: number;
  gasUsed?: string;
  priceImpact?: number;
  
  // Resolver metrics
  activeResolvers: number;
  resolverPerformance: Array<{
    resolverAddress: string;
    responseTime: number;
    quoteQuality: number;
  }>;
} 