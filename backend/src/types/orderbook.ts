export interface OrderData {
  orderId: string;
  userAddress: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  limitPrice?: string;
  orderType: 'swap' | 'limit';
  orderSide: 'buy' | 'sell';
  chainId: number;
  deadline: number;
  status: OrderStatus;
  timestamp: number;
  
  // MEV Protection
  useMEVProtection: boolean;
  allowedSenders?: string[]; // Whitelist of resolver bots
  predicateId?: string; // Associated price predicate
  maxSlippage?: number;
  
  // Fusion+ specific
  fusionData?: {
    escrowAddress?: string;
    isReady: boolean;
    secret?: string;
    signature?: string;
    nonce?: number;
  };
  
  // Execution tracking
  executionAttempts: number;
  lastExecutionAttempt?: number;
  executedBy?: string;
  executionTxHash?: string;
  executionTimestamp?: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  FAILED = 'failed'
}

export interface ResolverBot {
  address: string;
  name: string;
  isWhitelisted: boolean;
  allowedPairs: string[]; // Token pairs this bot can trade
  maxOrderSize: number; // Maximum order size in USD
  minOrderSize: number; // Minimum order size in USD
  performanceMetrics: BotMetrics;
  lastActive: number;
  isOnline: boolean;
}

export interface BotMetrics {
  totalOrdersFilled: number;
  successRate: number;
  averageExecutionTime: number;
  totalVolume: string;
  lastExecutionTime?: number;
  reputation: number; // 0-100 score
}

export interface OrderbookStats {
  totalOrders: number;
  activeOrders: number;
  totalVolume: string;
  averageOrderSize: string;
  mostActivePairs: Array<{
    pair: string;
    volume: string;
    orderCount: number;
  }>;
  resolverBots: {
    total: number;
    online: number;
    whitelisted: number;
  };
}

export interface OrderbookRequest {
  userAddress: string;
  fromToken: string;
  toToken: string;
  amount: string;
  orderType: 'swap' | 'limit';
  orderSide: 'buy' | 'sell';
  chainId: number;
  limitPrice?: string;
  deadline?: number;
  useMEVProtection?: boolean;
  allowedSenders?: string[];
  maxSlippage?: number;
  metadata?: {
    inchOrderHash?: string;
    inchSignature?: string;
    inchExpiration?: number;
    [key: string]: any;
  };
}

export interface OrderbookResponse {
  success: boolean;
  data?: OrderData;
  error?: string;
}

export interface OrderbookQuery {
  userAddress?: string;
  fromToken?: string;
  toToken?: string;
  orderType?: 'swap' | 'limit';
  orderSide?: 'buy' | 'sell';
  chainId?: number;
  status?: OrderStatus;
  limit?: number;
  page?: number;
  sortBy?: 'timestamp' | 'amount' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderbookHistory {
  orderId: string;
  userAddress: string;
  fromToken: string;
  toToken: string;
  amount: string;
  orderType: string;
  status: string;
  timestamp: number;
  executionTxHash?: string;
}

export interface ResolverBotRequest {
  address: string;
  name: string;
  allowedPairs: string[];
  maxOrderSize: number;
  minOrderSize: number;
}

export interface ResolverBotResponse {
  success: boolean;
  data?: ResolverBot;
  error?: string;
}

export interface OrderbookConstants {
  MAX_ORDERS_PER_USER: number;
  MAX_ORDER_SIZE: string;
  MIN_ORDER_SIZE: string;
  ORDER_EXPIRY_TIME: number;
  MAX_ALLOWED_SENDERS: number;
  DEFAULT_SLIPPAGE: number;
  MAX_SLIPPAGE: number;
}

export const ORDERBOOK_CONSTANTS: OrderbookConstants = {
  MAX_ORDERS_PER_USER: 50,
  MAX_ORDER_SIZE: '1000000000000000000000000', // 1M tokens
  MIN_ORDER_SIZE: '1000000000000000000', // 1 token
  ORDER_EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours
  MAX_ALLOWED_SENDERS: 10,
  DEFAULT_SLIPPAGE: 0.5,
  MAX_SLIPPAGE: 5.0
}; 