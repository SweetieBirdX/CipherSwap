// Frontend quote types - Backend ile uyumlu
export interface QuoteRequest {
  fromToken: string
  toToken: string
  amount: string
  chainId: number
  slippage?: number
  userAddress?: string
}

export interface QuoteResponse {
  success: boolean
  data?: QuoteData
  error?: string
}

export interface QuoteData {
  quote: any // 1inch quote response
  estimatedGas: string
  slippage: number
  priceImpact: number
  estimatedGains: number
  route: RouteStep[]
  timestamp: number
}

export interface RouteStep {
  fromToken: string
  toToken: string
  fromTokenAmount: string
  toTokenAmount: string
  estimatedGas: string
  protocol: string
  pool?: string
}

export interface QuoteHistory {
  id: string
  fromToken: string
  toToken: string
  amount: string
  quote: QuoteData
  timestamp: number
  userAddress?: string
} 