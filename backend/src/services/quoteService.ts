import axios, { AxiosResponse } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { SimulationUtils } from '../utils/simulation';
import { 
  QuoteRequest, 
  QuoteResponse, 
  QuoteData, 
  QuoteValidation,
  QUOTE_CONSTANTS,
  QuoteErrorCodes 
} from '../types/quote';

export class QuoteService {
  private readonly baseUrl = 'https://api.1inch.dev';
  private readonly apiKey: string;
  
  constructor() {
    this.apiKey = config.INCH_API_KEY;
    if (!this.apiKey) {
      throw new Error('1inch API key is required');
    }
  }
  
  /**
   * Get quote from 1inch API
   */
  async getQuote(params: QuoteRequest): Promise<QuoteResponse> {
    try {
      logger.info('Getting quote from 1inch API', { params });
      
      // Validate request
      const validation = this.validateQuoteRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Call 1inch API
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/swap/v5.2/quote`, {
        params: {
          src: params.fromToken,
          dst: params.toToken,
          amount: params.amount,
          chain: params.chainId,
          apiKey: this.apiKey
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Format response
      const quoteData = this.formatQuoteResponse(response.data, params);
      
      logger.info('Quote received successfully', { 
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        slippage: quoteData.slippage
      });
      
      return {
        success: true,
        data: quoteData
      };
      
    } catch (error: any) {
      logger.error('Quote service error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleQuoteError(error)
      };
    }
  }
  
  /**
   * Simulate swap with current quote
   */
  async simulateSwap(quoteData: QuoteData, userAddress: string): Promise<any> {
    try {
      logger.info('Simulating swap', { userAddress });
      
      const simulation = SimulationUtils.simulateSwap(
        {
          fromToken: quoteData.quote.fromTokenAddress,
          toToken: quoteData.quote.toTokenAddress,
          amount: quoteData.quote.fromTokenAmount,
          slippage: quoteData.slippage
        },
        quoteData.quote
      );
      
      return {
        success: true,
        data: {
          ...simulation,
          userAddress,
          timestamp: Date.now()
        }
      };
      
    } catch (error: any) {
      logger.error('Simulation error', { error: error.message });
      return {
        success: false,
        error: 'Simulation failed'
      };
    }
  }
  
  /**
   * Get quote history (mock implementation)
   */
  async getQuoteHistory(userAddress?: string, limit: number = 10): Promise<any[]> {
    // Mock implementation - in real app this would query database
    return [];
  }
  
  /**
   * Validate quote request parameters
   */
  private validateQuoteRequest(params: QuoteRequest): QuoteValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields
    if (!params.fromToken) {
      errors.push('fromToken is required');
    }
    if (!params.toToken) {
      errors.push('toToken is required');
    }
    if (!params.amount) {
      errors.push('amount is required');
    }
    if (!params.chainId) {
      errors.push('chainId is required');
    }
    
    // Amount validation
    if (params.amount) {
      const amount = parseFloat(params.amount);
      if (amount < parseFloat(QUOTE_CONSTANTS.MIN_AMOUNT)) {
        errors.push(`Amount too small. Minimum: ${QUOTE_CONSTANTS.MIN_AMOUNT}`);
      }
      if (amount > parseFloat(QUOTE_CONSTANTS.MAX_AMOUNT)) {
        errors.push(`Amount too large. Maximum: ${QUOTE_CONSTANTS.MAX_AMOUNT}`);
      }
    }
    
    // Slippage validation
    if (params.slippage && params.slippage > QUOTE_CONSTANTS.MAX_SLIPPAGE) {
      errors.push(`Slippage too high. Maximum: ${QUOTE_CONSTANTS.MAX_SLIPPAGE}%`);
    }
    
    // Token validation (basic)
    if (params.fromToken === params.toToken) {
      errors.push('fromToken and toToken cannot be the same');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Format 1inch API response
   */
  private formatQuoteResponse(data: any, params: QuoteRequest): QuoteData {
    const slippage = SimulationUtils.calculateSlippage(
      data, 
      parseFloat(data.toTokenAmount) / parseFloat(data.fromTokenAmount)
    );
    
    const priceImpact = SimulationUtils.calculatePriceImpact(data, 1000000000);
    const estimatedGains = SimulationUtils.calculateEstimatedGains(data, 10000);
    const gasEstimate = SimulationUtils.estimateGasCost(data.route || []);
    
    return {
      quote: data,
      estimatedGas: gasEstimate,
      slippage,
      priceImpact,
      estimatedGains,
      route: data.route || [],
      timestamp: Date.now()
    };
  }
  
  /**
   * Handle different types of errors
   */
  private handleQuoteError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid request parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Quote not found';
        case 429:
          return 'Rate limit exceeded';
        case 500:
          return '1inch API server error';
        default:
          return data?.message || 'Unknown API error';
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout';
    }
    
    if (error.code === 'ENOTFOUND') {
      return 'Network error';
    }
    
    return error.message || 'Unknown error';
  }
  
  /**
   * Get supported tokens for a chain
   */
  async getSupportedTokens(chainId: number): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/swap/v5.2/tokens`, {
        params: {
          chain: chainId,
          apiKey: this.apiKey
        }
      });
      
      return response.data.tokens || [];
    } catch (error) {
      logger.error('Error fetching supported tokens', { error, chainId });
      return [];
    }
  }
}

export default QuoteService; 