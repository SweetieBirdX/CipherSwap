import axios, { AxiosResponse } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { 
  SwapRequest, 
  SwapResponse, 
  SwapData, 
  SwapStatus,
  SwapErrorCodes,
  SWAP_CONSTANTS,
  SwapHistory,
  SwapSimulation
} from '../types/swap';

export class SwapService {
  private readonly baseUrl = 'https://api.1inch.dev';
  private readonly apiKey: string;
  private swapHistory: Map<string, SwapData> = new Map();
  
  constructor() {
    this.apiKey = config.INCH_API_KEY;
    if (!this.apiKey) {
      throw new Error('1inch API key is required');
    }
  }
  
  /**
   * Create a new swap transaction
   */
  async createSwap(params: SwapRequest): Promise<SwapResponse> {
    try {
      logger.info('Creating swap transaction', { params });
      
      // Validate request
      const validation = this.validateSwapRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get quote first
      const quoteResponse = await this.getQuote(params);
      if (!quoteResponse.success) {
        return {
          success: false,
          error: quoteResponse.error
        };
      }
      
      // Call 1inch swap API
      const response: AxiosResponse = await axios.post(`${this.baseUrl}/swap/v5.2/swap`, {
        src: params.fromToken,
        dst: params.toToken,
        amount: params.amount,
        from: params.userAddress,
        slippage: params.slippage || SWAP_CONSTANTS.DEFAULT_SLIPPAGE,
        chain: params.chainId,
        apiKey: this.apiKey
      }, {
        timeout: 15000 // 15 second timeout
      });
      
      // Format swap data
      const swapData = this.formatSwapResponse(response.data, params, quoteResponse.data);
      
      // Store swap data
      this.swapHistory.set(swapData.swapId, swapData);
      
      logger.info('Swap created successfully', { 
        swapId: swapData.swapId,
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount
      });
      
      return {
        success: true,
        data: swapData
      };
      
    } catch (error: any) {
      logger.error('Swap service error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleSwapError(error)
      };
    }
  }
  
  /**
   * Create a Fusion+ swap transaction
   */
  async createFusionSwap(params: SwapRequest): Promise<SwapResponse> {
    try {
      logger.info('Creating Fusion+ swap transaction', { params });
      
      // Validate request
      const validation = this.validateSwapRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get quote first
      const quoteResponse = await this.getQuote(params);
      if (!quoteResponse.success) {
        return {
          success: false,
          error: quoteResponse.error
        };
      }
      
      // Call 1inch Fusion+ API
      const response: AxiosResponse = await axios.post(`${this.baseUrl}/fusion/v1.0/quote`, {
        src: params.fromToken,
        dst: params.toToken,
        amount: params.amount,
        from: params.userAddress,
        slippage: params.slippage || SWAP_CONSTANTS.DEFAULT_SLIPPAGE,
        chain: params.chainId,
        permit: params.permit,
        deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
        apiKey: this.apiKey
      }, {
        timeout: 15000
      });
      
      // Format fusion swap data
      const swapData = this.formatFusionSwapResponse(response.data, params, quoteResponse.data);
      
      // Store swap data
      this.swapHistory.set(swapData.swapId, swapData);
      
      logger.info('Fusion+ swap created successfully', { 
        swapId: swapData.swapId,
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount
      });
      
      return {
        success: true,
        data: swapData
      };
      
    } catch (error: any) {
      logger.error('Fusion+ swap service error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleSwapError(error)
      };
    }
  }
  
  /**
   * Get swap transaction status
   */
  async getSwapStatus(swapId: string): Promise<SwapResponse> {
    try {
      logger.info('Getting swap status', { swapId });
      
      const swapData = this.swapHistory.get(swapId);
      if (!swapData) {
        return {
          success: false,
          error: 'Swap not found'
        };
      }
      
      // Check if swap is expired
      if (swapData.deadline < Math.floor(Date.now() / 1000)) {
        swapData.status = SwapStatus.EXPIRED;
        this.swapHistory.set(swapId, swapData);
      }
      
      return {
        success: true,
        data: swapData
      };
      
    } catch (error: any) {
      logger.error('Get swap status error', { error: error.message, swapId });
      return {
        success: false,
        error: 'Failed to get swap status'
      };
    }
  }
  
  /**
   * Simulate swap transaction
   */
  async simulateSwap(params: SwapRequest): Promise<SwapResponse> {
    try {
      logger.info('Simulating swap transaction', { params });
      
      // Validate request
      const validation = this.validateSwapRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get quote
      const quoteResponse = await this.getQuote(params);
      if (!quoteResponse.success) {
        return {
          success: false,
          error: quoteResponse.error
        };
      }
      
      // Simulate swap
      const simulation = this.simulateSwapTransaction(params, quoteResponse.data);
      
      return {
        success: true,
        data: simulation as any
      };
      
    } catch (error: any) {
      logger.error('Swap simulation error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: 'Simulation failed'
      };
    }
  }
  
  /**
   * Get swap history for user
   */
  async getSwapHistory(userAddress: string, limit: number = 10, page: number = 1): Promise<SwapHistory[]> {
    try {
      logger.info('Getting swap history', { userAddress, limit, page });
      
      const userSwaps = Array.from(this.swapHistory.values())
        .filter(swap => swap.userAddress === userAddress)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return userSwaps.slice(startIndex, endIndex).map(swap => ({
        id: swap.swapId,
        swapId: swap.swapId,
        fromToken: swap.fromToken,
        toToken: swap.toToken,
        amount: swap.fromAmount,
        status: swap.status,
        timestamp: swap.timestamp,
        userAddress: swap.userAddress,
        txHash: swap.txHash
      }));
      
    } catch (error: any) {
      logger.error('Get swap history error', { error: error.message, userAddress });
      return [];
    }
  }
  
  /**
   * Cancel pending swap transaction
   */
  async cancelSwap(swapId: string, userAddress: string): Promise<SwapResponse> {
    try {
      logger.info('Cancelling swap', { swapId, userAddress });
      
      const swapData = this.swapHistory.get(swapId);
      if (!swapData) {
        return {
          success: false,
          error: 'Swap not found'
        };
      }
      
      // Check if user is authorized to cancel
      if (swapData.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to cancel this swap'
        };
      }
      
      // Check if swap can be cancelled
      if (swapData.status !== SwapStatus.PENDING) {
        return {
          success: false,
          error: 'Swap cannot be cancelled'
        };
      }
      
      // Update swap status
      swapData.status = SwapStatus.CANCELLED;
      this.swapHistory.set(swapId, swapData);
      
      logger.info('Swap cancelled successfully', { swapId });
      
      return {
        success: true,
        data: swapData
      };
      
    } catch (error: any) {
      logger.error('Cancel swap error', { error: error.message, swapId });
      return {
        success: false,
        error: 'Failed to cancel swap'
      };
    }
  }
  
  /**
   * Get quote from 1inch API
   */
  private async getQuote(params: SwapRequest): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/swap/v5.2/quote`, {
        params: {
          src: params.fromToken,
          dst: params.toToken,
          amount: params.amount,
          chain: params.chainId,
          apiKey: this.apiKey
        },
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
      
    } catch (error: any) {
      logger.error('Get quote error', { error: error.message, params });
      return {
        success: false,
        error: this.handleSwapError(error)
      };
    }
  }
  
  /**
   * Validate swap request parameters
   */
  private validateSwapRequest(params: SwapRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
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
    if (!params.userAddress) {
      errors.push('userAddress is required');
    }
    
    // Amount validation
    if (params.amount) {
      const amount = parseFloat(params.amount);
      if (amount < parseFloat(SWAP_CONSTANTS.MIN_AMOUNT)) {
        errors.push(`Amount too small. Minimum: ${SWAP_CONSTANTS.MIN_AMOUNT}`);
      }
      if (amount > parseFloat(SWAP_CONSTANTS.MAX_AMOUNT)) {
        errors.push(`Amount too large. Maximum: ${SWAP_CONSTANTS.MAX_AMOUNT}`);
      }
    }
    
    // Slippage validation
    if (params.slippage && params.slippage > SWAP_CONSTANTS.MAX_SLIPPAGE) {
      errors.push(`Slippage too high. Maximum: ${SWAP_CONSTANTS.MAX_SLIPPAGE}%`);
    }
    
    // Token validation
    if (params.fromToken === params.toToken) {
      errors.push('fromToken and toToken cannot be the same');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Format swap response
   */
  private formatSwapResponse(data: any, params: SwapRequest, quoteData: any): SwapData {
    const swapId = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      swapId,
      txHash: data.tx?.hash,
      status: SwapStatus.PENDING,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.amount,
      toAmount: quoteData.toTokenAmount,
      slippage: params.slippage || SWAP_CONSTANTS.DEFAULT_SLIPPAGE,
      gasEstimate: quoteData.estimatedGas || '0',
      gasPrice: data.tx?.gasPrice,
      deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
      userAddress: params.userAddress,
      timestamp: Date.now(),
      route: quoteData.route || []
    };
  }
  
  /**
   * Format Fusion+ swap response
   */
  private formatFusionSwapResponse(data: any, params: SwapRequest, quoteData: any): SwapData {
    const swapData = this.formatSwapResponse(data, params, quoteData);
    
    // Add Fusion+ specific data
    swapData.fusionData = {
      permit: params.permit,
      deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
      nonce: data.nonce || 0,
      signature: data.signature
    };
    
    return swapData;
  }
  
  /**
   * Simulate swap transaction
   */
  private simulateSwapTransaction(params: SwapRequest, quoteData: any): SwapSimulation {
    const originalQuote = quoteData;
    const simulatedSwap = this.formatSwapResponse(quoteData, params, quoteData);
    
    // Calculate differences
    const slippageDifference = 0; // Would be calculated based on market conditions
    const gasDifference = '0'; // Would be calculated based on network conditions
    const priceImpactDifference = 0; // Would be calculated based on trade size
    const estimatedGains = parseFloat(quoteData.toTokenAmount) - parseFloat(params.amount);
    
    return {
      originalQuote,
      simulatedSwap,
      slippageDifference,
      gasDifference,
      priceImpactDifference,
      estimatedGains
    };
  }
  
  /**
   * Handle different types of errors
   */
  private handleSwapError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid swap parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Swap route not found';
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
}

export default SwapService; 