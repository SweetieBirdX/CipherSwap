import api from './api'
import type { QuoteRequest, QuoteResponse, QuoteData } from '../types/quote'

export class QuoteService {
  // Get quote for token swap
  static async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      const response = await api.post('/quote', request)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get quote'
      }
    }
  }

  // Simulate swap with current quote
  static async simulateSwap(quote: QuoteData, userAddress: string): Promise<QuoteResponse> {
    try {
      const response = await api.post('/quote/simulate', { quote, userAddress })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to simulate swap'
      }
    }
  }

  // Get quote history for user
  static async getQuoteHistory(userAddress: string): Promise<QuoteResponse> {
    try {
      const response = await api.get('/quote/history', {
        params: { userAddress }
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get quote history'
      }
    }
  }
} 