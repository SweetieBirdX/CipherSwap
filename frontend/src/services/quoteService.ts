import api from './api'
import type { QuoteRequest, QuoteResponse, QuoteData } from '../types/quote'

export interface MultipleQuotesResponse {
  success: boolean;
  data?: {
    tokenQuotes: Array<{
      token: string;
      tokenSymbol: string;
      tokenAddress: string;
      amount: string;
      slippage: number;
      priceImpact: number;
      estimatedGas: string;
      netValue: string;
      rank: number;
    }>;
    strategyQuotes: Array<{
      strategy: string;
      description: string;
      gasCost: string;
      slippage: number;
      security: string;
      netValue: string;
      rank: number;
    }>;
    recommendations: Array<{
      type: 'BEST_VALUE' | 'LOWEST_SLIPPAGE' | 'MOST_SECURE' | 'GASLESS';
      token?: string;
      strategy?: string;
      reason: string;
      savings?: string;
    }>;
  };
  error?: string;
}

export class QuoteService {
  // Get quote for token swap
  static async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      const response = await api.post('/quote', request)
      return response.data
    } catch (error: any) {
      console.error('Quote API Error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get quote'
      }
    }
  }

  // Get multiple quotes for analysis
  static async getMultipleQuotes(request: QuoteRequest): Promise<MultipleQuotesResponse> {
    try {
      const response = await api.post('/quote/multiple', request)
      return response.data
    } catch (error: any) {
      console.error('Multiple Quotes API Error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get multiple quotes'
      }
    }
  }

  // Simulate swap with current quote
  static async simulateSwap(quote: QuoteData, userAddress: string): Promise<QuoteResponse> {
    try {
      const response = await api.post('/quote/simulate', { quote, userAddress })
      return response.data
    } catch (error: any) {
      console.error('Simulate API Error:', error.response?.data || error.message)
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
      console.error('History API Error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get quote history'
      }
    }
  }
} 