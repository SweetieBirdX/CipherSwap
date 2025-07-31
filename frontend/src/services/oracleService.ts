import api from './api'
import type { 
  OraclePrice, 
  OracleBatchRequest, 
  OracleBatchResponse,
  OracleResponse,
  OracleNetworksResponse,
  OracleHealthResponse
} from '../types/oracle'

export class OracleService {
  // Get single price
  static async getPrice(chainId: number, pair: string): Promise<OracleResponse> {
    try {
      const response = await api.get(`/oracle/price/${chainId}/${pair}`)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get price'
      }
    }
  }

  // Get multiple prices at once
  static async getBatchPrices(request: OracleBatchRequest): Promise<OracleBatchResponse> {
    try {
      const response = await api.post('/oracle/price/batch', request)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get batch prices'
      }
    }
  }

  // Get price with tolerance check
  static async getPriceWithTolerance(chainId: number, pair: string, tolerance: number): Promise<OracleResponse> {
    try {
      const response = await api.post('/oracle/price/tolerance', {
        chainId,
        pair,
        tolerance
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get price with tolerance'
      }
    }
  }

  // Get available feeds for a network
  static async getAvailableFeeds(chainId: number): Promise<OracleNetworksResponse> {
    try {
      const response = await api.get(`/oracle/feeds/${chainId}`)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get available feeds'
      }
    }
  }

  // Get all supported networks
  static async getSupportedNetworks(): Promise<OracleNetworksResponse> {
    try {
      const response = await api.get('/oracle/networks')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get supported networks'
      }
    }
  }

  // Get price feed health status
  static async getPriceFeedHealth(chainId: number, pair: string): Promise<OracleHealthResponse> {
    try {
      const response = await api.get(`/oracle/health/${chainId}/${pair}`)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get price feed health'
      }
    }
  }
} 