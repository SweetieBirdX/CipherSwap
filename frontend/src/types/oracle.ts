// Oracle data types
export interface OraclePrice {
  chainId: number
  pair: string
  price: string
  timestamp: number
  decimals: number
  feedAddress: string
  description?: string
}

export interface OracleBatchRequest {
  prices: Array<{
    chainId: number
    pair: string
  }>
}

export interface OracleBatchResponse {
  success: boolean
  data?: OraclePrice[]
  error?: string
}

export interface OracleFeed {
  chainId: number
  pair: string
  feedAddress: string
  description: string
  decimals: number
  isActive: boolean
  lastUpdate: number
}

export interface OracleNetwork {
  chainId: number
  name: string
  feeds: OracleFeed[]
}

export interface OracleHealth {
  chainId: number
  pair: string
  isHealthy: boolean
  lastUpdate: number
  stalenessPeriod: number
  deviationThreshold: number
  heartbeat: number
}

export interface OracleResponse {
  success: boolean
  data?: OraclePrice
  error?: string
}

export interface OracleNetworksResponse {
  success: boolean
  data?: OracleNetwork[]
  error?: string
}

export interface OracleHealthResponse {
  success: boolean
  data?: OracleHealth
  error?: string
} 