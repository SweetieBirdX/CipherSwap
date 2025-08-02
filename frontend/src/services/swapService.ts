import api from './api'
import type { SwapRequest, SwapResponse, SwapData } from '../types/swap'

export class SwapService {
  // Create normal swap
  static async createSwap(request: SwapRequest): Promise<SwapResponse> {
    try {
      const response = await api.post('/swap', request)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create swap'
      }
    }
  }

  // Create Fusion+ swap
  static async createFusionSwap(request: SwapRequest): Promise<SwapResponse> {
    try {
      const response = await api.post('/swap/fusion', request)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create Fusion+ swap'
      }
    }
  }

  // Get swap status
  static async getSwapStatus(swapId: string): Promise<SwapResponse> {
    try {
      const response = await api.get(`/swap/status/${swapId}`)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get swap status'
      }
    }
  }

  // Simulate swap
  static async simulateSwap(request: SwapRequest): Promise<SwapResponse> {
    try {
      const response = await api.post('/swap/simulate', request)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to simulate swap'
      }
    }
  }

  // Get swap history
  static async getSwapHistory(userAddress: string): Promise<SwapResponse> {
    try {
      const response = await api.get('/swap/history', {
        params: { userAddress }
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get swap history'
      }
    }
  }

  // Cancel swap
  static async cancelSwap(swapId: string, userAddress: string): Promise<SwapResponse> {
    try {
      const response = await api.post(`/swap/cancel/${swapId}`, { userAddress })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel swap'
      }
    }
  }

  // Execute swap with optimization (split routing, etc.)
  static async executeSwapWithOptimization(request: SwapRequest): Promise<SwapResponse> {
    try {
      const response = await api.post('/swap/optimize', request)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to execute optimized swap'
      }
    }
  }
} 