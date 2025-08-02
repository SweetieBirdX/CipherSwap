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
  estimatedGains: string // Changed from number to string
  route: RouteStep[]
  protocol: string // 1inch aggregation protocol
  routeSteps: number // Number of steps in the route
  timestamp: number
  toTokenAmount?: string // Amount of tokens you will receive
  toTokenDecimals?: number // Decimals of the destination token
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