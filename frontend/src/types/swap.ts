// Frontend swap types - Backend ile uyumlu
export interface SwapRequest {
  fromToken: string
  toToken: string
  amount: string
  chainId: number
  slippage?: number
  userAddress: string
  deadline?: number
  permit?: any
  useMEVProtection?: boolean
}

export interface SwapResponse {
  success: boolean
  data?: SwapData
  error?: string
}

export interface SwapData {
  swapId: string
  txHash?: string
  status: SwapStatus
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  slippage: number
  gasEstimate: string
  gasPrice?: string
  deadline: number
  userAddress: string
  timestamp: number
  route?: RouteStep[]
  fusionData?: FusionData
  bundleId?: string
  bundleHash?: string
  fallbackUsed?: boolean
  fallbackReason?: string
}

export const SwapStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const

export type SwapStatus = typeof SwapStatus[keyof typeof SwapStatus]

export interface RouteStep {
  fromToken: string
  toToken: string
  fromTokenAmount: string
  toTokenAmount: string
  estimatedGas: string
  protocol: string
  pool?: string
}

export interface FusionData {
  permit: any
  deadline: number
  nonce: number
  signature?: string
  secret?: string
  escrowAddress?: string
}

export interface SwapHistory {
  id: string
  swapId: string
  fromToken: string
  toToken: string
  amount: string
  status: SwapStatus
  timestamp: number
  userAddress: string
  txHash?: string
} 