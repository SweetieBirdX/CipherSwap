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
  QuoteErrorCodes,
  QuoteHistory
} from '../types/quote';

export class QuoteService {
  private readonly baseUrl = 'https://api.1inch.dev';
  private readonly apiKey: string;
  private quoteHistory: Map<string, QuoteHistory> = new Map();
  
  constructor() {
    this.apiKey = config.INCH_API_KEY;
    if (!this.apiKey) {
      throw new Error('1inch API key is required');
    }
    logger.info('QuoteService initialized', { 
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey.length,
      apiKeyPrefix: this.apiKey.substring(0, 10) + '...'
    });
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
          chain: params.chainId
        },
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Format response
      const quoteData = this.formatQuoteResponse(response.data, params);
      
      // Store quote in history
      this.storeQuoteHistory(params, quoteData);
      
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
   * Get quote history for user
   */
  async getQuoteHistory(userAddress?: string, limit: number = 10): Promise<QuoteHistory[]> {
    try {
      logger.info('Getting quote history', { userAddress, limit });
      
      let quotes = Array.from(this.quoteHistory.values());
      
      // Filter by user address if provided
      if (userAddress) {
        quotes = quotes.filter(quote => quote.userAddress === userAddress);
      }
      
      // Sort by timestamp (newest first)
      quotes.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply limit
      quotes = quotes.slice(0, limit);
      
      logger.info('Quote history retrieved', { 
        count: quotes.length,
        userAddress 
      });
      
      return quotes;
      
    } catch (error: any) {
      logger.error('Get quote history error', { error: error.message });
      return [];
    }
  }
  
  /**
   * Store quote in history
   */
  private storeQuoteHistory(params: QuoteRequest, quoteData: QuoteData): void {
    const historyId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const quoteHistory: QuoteHistory = {
      id: historyId,
      fromToken: params.fromToken,
      toToken: params.toToken,
      amount: params.amount,
      quote: quoteData,
      timestamp: Date.now(),
      userAddress: params.userAddress
    };
    
    this.quoteHistory.set(historyId, quoteHistory);
    
    // Clean up old quotes (keep only last 100)
    if (this.quoteHistory.size > QUOTE_CONSTANTS.MAX_QUOTE_HISTORY) {
      const sortedQuotes = Array.from(this.quoteHistory.entries())
        .sort(([,a], [,b]) => b.timestamp - a.timestamp)
        .slice(0, QUOTE_CONSTANTS.MAX_QUOTE_HISTORY);
      
      this.quoteHistory.clear();
      sortedQuotes.forEach(([id, quote]) => {
        this.quoteHistory.set(id, quote);
      });
    }
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
      logger.info('Fetching supported tokens', { chainId });
      
      const response = await axios.get(`${this.baseUrl}/swap/v5.2/tokens`, {
        params: {
          chain: chainId
        },
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      const tokens = response.data.tokens || [];
      
      logger.info('Supported tokens fetched successfully', { 
        chainId, 
        tokenCount: tokens.length 
      });
      
      return tokens;
      
    } catch (error: any) {
      logger.error('Error fetching supported tokens', { 
        error: error.message, 
        chainId,
        status: error.response?.status 
      });
      
      // Return common tokens as fallback
      return this.getFallbackTokens(chainId);
    }
  }
  
  /**
   * Get fallback tokens when API fails
   */
  private getFallbackTokens(chainId: number): any[] {
    const commonTokens = {
      1: [ // Ethereum Mainnet
        { address: '0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C', symbol: 'ETH', name: 'Ethereum', decimals: 18 },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
        { address: '0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
        { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 }
      ],
      137: [ // Polygon
        { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC', name: 'Wrapped MATIC', decimals: 18 },
        { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
        { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6 }
      ],
      42161: [ // Arbitrum
        { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
        { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
        { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', symbol: 'USDC', name: 'USD Coin', decimals: 6 }
      ]
    };
    
    return commonTokens[chainId as keyof typeof commonTokens] || [];
  }
}

export default QuoteService; 