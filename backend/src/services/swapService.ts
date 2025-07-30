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
  SwapSimulation,
  LimitOrderRequest,
  LimitOrderResponse,
  LimitOrderData,
  LimitOrderStatus,
  FusionQuoteRequest,
  FusionQuoteResponse,
  FusionSecretRequest,
  FusionSecretResponse,
  FusionSecretData,
  SecretStatus,
  EscrowStatusRequest,
  EscrowStatusResponse,
  EscrowStatusData,
  EscrowStatus
} from '../types/swap';

export class SwapService {
  private readonly baseUrl = 'https://api.1inch.dev';
  private readonly apiKey: string;
  private swapHistory: Map<string, SwapData> = new Map();
  private limitOrderHistory: Map<string, LimitOrderData> = new Map();
  private secretsHistory: Map<string, FusionSecretData> = new Map();
  
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
   * Create a MEV-protected limit order using 1inch Fusion+
   */
  async createLimitOrder(params: LimitOrderRequest): Promise<LimitOrderResponse> {
    try {
      logger.info('Creating MEV-protected limit order', { params });
      
      // Validate limit order request
      const validation = this.validateLimitOrderRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get Fusion+ quote first
      const quoteResponse = await this.getFusionQuote({
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        chainId: params.chainId,
        userAddress: params.userAddress,
        limitPrice: params.limitPrice,
        orderType: params.orderType
      });
      
      if (!quoteResponse.success) {
        return {
          success: false,
          error: quoteResponse.error
        };
      }
      
      // Create Fusion+ limit order
      const response: AxiosResponse = await axios.post(`${this.baseUrl}/fusion/v1.0/order`, {
        src: params.fromToken,
        dst: params.toToken,
        amount: params.amount,
        from: params.userAddress,
        limitPrice: params.limitPrice,
        orderType: params.orderType, // 'buy' or 'sell'
        deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
        permit: params.permit,
        chain: params.chainId,
        apiKey: this.apiKey
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 20000 // 20 second timeout for limit orders
      });
      
      // Format limit order data
      const orderData = this.formatLimitOrderResponse(response.data, params, quoteResponse.data);
      
      // Store order data
      this.limitOrderHistory.set(orderData.orderId, orderData);
      
      logger.info('Limit order created successfully', { 
        orderId: orderData.orderId,
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        limitPrice: params.limitPrice
      });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('Limit order creation error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleLimitOrderError(error)
      };
    }
  }
  
  /**
   * Get Fusion+ quote for limit order
   */
  async getFusionQuote(params: FusionQuoteRequest): Promise<FusionQuoteResponse> {
    try {
      logger.info('Getting Fusion+ quote for limit order', { params });
      
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/fusion/v1.0/quote`, {
        params: {
          src: params.fromToken,
          dst: params.toToken,
          amount: params.amount,
          from: params.userAddress,
          limitPrice: params.limitPrice,
          orderType: params.orderType,
          chain: params.chainId
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      const quoteData = this.formatFusionQuoteResponse(response.data, params);
      
      return {
        success: true,
        data: quoteData
      };
      
    } catch (error: any) {
      logger.error('Fusion+ quote error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleLimitOrderError(error)
      };
    }
  }
  
  /**
   * Get limit order status
   */
  async getLimitOrderStatus(orderId: string): Promise<LimitOrderResponse> {
    try {
      logger.info('Getting limit order status', { orderId });
      
      const orderData = this.limitOrderHistory.get(orderId);
      if (!orderData) {
        return {
          success: false,
          error: 'Limit order not found'
        };
      }
      
      // Check if order is expired
      if (orderData.deadline < Math.floor(Date.now() / 1000)) {
        orderData.status = LimitOrderStatus.EXPIRED;
        this.limitOrderHistory.set(orderId, orderData);
      }
      
      // For real implementation, you would call 1inch API to get current status
      // const response = await axios.get(`${this.baseUrl}/fusion/v1.0/order/${orderId}`, {
      //   headers: { 'Authorization': `Bearer ${this.apiKey}` }
      // });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('Get limit order status error', { error: error.message, orderId });
      return {
        success: false,
        error: 'Failed to get limit order status'
      };
    }
  }
  
  /**
   * Cancel limit order
   */
  async cancelLimitOrder(orderId: string, userAddress: string): Promise<LimitOrderResponse> {
    try {
      logger.info('Cancelling limit order', { orderId, userAddress });
      
      const orderData = this.limitOrderHistory.get(orderId);
      if (!orderData) {
        return {
          success: false,
          error: 'Limit order not found'
        };
      }
      
      // Check if user is authorized to cancel
      if (orderData.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to cancel this order'
        };
      }
      
      // Check if order can be cancelled
      if (orderData.status !== LimitOrderStatus.PENDING) {
        return {
          success: false,
          error: 'Order cannot be cancelled'
        };
      }
      
      // Call 1inch API to cancel order
      const response: AxiosResponse = await axios.delete(`${this.baseUrl}/fusion/v1.0/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      // Update order status
      orderData.status = LimitOrderStatus.CANCELLED;
      this.limitOrderHistory.set(orderId, orderData);
      
      logger.info('Limit order cancelled successfully', { orderId });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('Cancel limit order error', { error: error.message, orderId });
      return {
        success: false,
        error: 'Failed to cancel limit order'
      };
    }
  }
  
  /**
   * Get limit order history for user
   */
  async getLimitOrderHistory(userAddress: string, limit: number = 10, page: number = 1): Promise<LimitOrderData[]> {
    try {
      logger.info('Getting limit order history', { userAddress, limit, page });
      
      const userOrders = Array.from(this.limitOrderHistory.values())
        .filter(order => order.userAddress === userAddress)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return userOrders.slice(startIndex, endIndex);
      
    } catch (error: any) {
      logger.error('Get limit order history error', { error: error.message, userAddress });
      return [];
    }
  }
  
  /**
   * Simulate limit order execution
   */
  async simulateLimitOrder(params: LimitOrderRequest): Promise<LimitOrderResponse> {
    try {
      logger.info('Simulating limit order execution', { params });
      
      // Validate request
      const validation = this.validateLimitOrderRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get quote
      const quoteResponse = await this.getFusionQuote({
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        chainId: params.chainId,
        userAddress: params.userAddress,
        limitPrice: params.limitPrice,
        orderType: params.orderType
      });
      
      if (!quoteResponse.success) {
        return {
          success: false,
          error: quoteResponse.error
        };
      }
      
      // Simulate order execution
      const simulation = this.simulateLimitOrderExecution(params, quoteResponse.data);
      
      return {
        success: true,
        data: simulation as any
      };
      
    } catch (error: any) {
      logger.error('Limit order simulation error', { 
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
   * Check escrow readiness for Fusion+ order
   */
  async checkEscrowStatus(params: EscrowStatusRequest): Promise<EscrowStatusResponse> {
    try {
      logger.info('Checking escrow status', { params });
      
      // Get the limit order data
      const orderData = this.limitOrderHistory.get(params.orderId);
      if (!orderData) {
        return {
          success: false,
          error: 'Order not found'
        };
      }
      
      // Check if user is authorized
      if (orderData.userAddress !== params.userAddress) {
        return {
          success: false,
          error: 'Unauthorized to check this order'
        };
      }
      
      // Call 1inch API to check escrow status
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/fusion/v1.0/escrow/${params.orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      const escrowData = this.formatEscrowStatusResponse(response.data, params.orderId);
      
      logger.info('Escrow status checked successfully', { 
        orderId: params.orderId,
        isReady: escrowData.isReady,
        status: escrowData.status
      });
      
      return {
        success: true,
        data: escrowData
      };
      
    } catch (error: any) {
      logger.error('Check escrow status error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleEscrowError(error)
      };
    }
  }
  
  /**
   * Submit secret for Fusion+ order
   */
  async submitSecret(params: FusionSecretRequest): Promise<FusionSecretResponse> {
    try {
      logger.info('Submitting secret for Fusion+ order', { 
        orderId: params.orderId,
        userAddress: params.userAddress 
      });
      
      // Validate secret request
      const validation = this.validateSecretRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Check if escrow is ready first
      const escrowResponse = await this.checkEscrowStatus({
        orderId: params.orderId,
        userAddress: params.userAddress
      });
      
      if (!escrowResponse.success) {
        return {
          success: false,
          error: escrowResponse.error
        };
      }
      
      if (!escrowResponse.data?.isReady) {
        return {
          success: false,
          error: 'Escrow is not ready for secret submission'
        };
      }
      
      // Submit secret to 1inch Fusion+ API
      const response: AxiosResponse = await axios.post(`${this.baseUrl}/fusion/v1.0/secret`, {
        orderId: params.orderId,
        userAddress: params.userAddress,
        secret: params.secret,
        signature: params.signature,
        nonce: params.nonce
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      // Format secret data
      const secretData = this.formatSecretResponse(response.data, params, escrowResponse.data);
      
      // Store secret data
      this.secretsHistory.set(secretData.secretId, secretData);
      
      logger.info('Secret submitted successfully', { 
        secretId: secretData.secretId,
        orderId: params.orderId,
        status: secretData.status
      });
      
      return {
        success: true,
        data: secretData
      };
      
    } catch (error: any) {
      logger.error('Secret submission error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleSecretError(error)
      };
    }
  }
  
  /**
   * Wait for escrow to be ready and submit secret
   */
  async waitForEscrowAndSubmitSecret(
    orderId: string, 
    userAddress: string, 
    secret: string, 
    signature: string, 
    nonce: number,
    maxWaitTime: number = SWAP_CONSTANTS.MAX_ESCROW_WAIT_TIME
  ): Promise<FusionSecretResponse> {
    try {
      logger.info('Waiting for escrow and submitting secret', { 
        orderId, 
        userAddress,
        maxWaitTime 
      });
      
      const startTime = Date.now();
      const checkInterval = SWAP_CONSTANTS.ESCROW_CHECK_INTERVAL;
      
      while (Date.now() - startTime < maxWaitTime) {
        // Check escrow status
        const escrowResponse = await this.checkEscrowStatus({
          orderId,
          userAddress
        });
        
        if (!escrowResponse.success) {
          return {
            success: false,
            error: escrowResponse.error
          };
        }
        
        if (escrowResponse.data?.isReady) {
          // Escrow is ready, submit secret
          return await this.submitSecret({
            orderId,
            userAddress,
            secret,
            signature,
            nonce
          });
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
      
      return {
        success: false,
        error: 'Escrow did not become ready within the specified time'
      };
      
    } catch (error: any) {
      logger.error('Wait for escrow and submit secret error', { 
        error: error.message, 
        orderId,
        userAddress 
      });
      
      return {
        success: false,
        error: 'Failed to wait for escrow and submit secret'
      };
    }
  }
  
  /**
   * Get secret submission status
   */
  async getSecretStatus(secretId: string, userAddress: string): Promise<FusionSecretResponse> {
    try {
      logger.info('Getting secret status', { secretId, userAddress });
      
      const secretData = this.secretsHistory.get(secretId);
      if (!secretData) {
        return {
          success: false,
          error: 'Secret not found'
        };
      }
      
      // Check if user is authorized
      if (secretData.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to check this secret'
        };
      }
      
      // Check if secret is expired
      if (Date.now() - secretData.timestamp > SWAP_CONSTANTS.SECRET_SUBMISSION_TIMEOUT) {
        secretData.status = SecretStatus.EXPIRED;
        this.secretsHistory.set(secretId, secretData);
      }
      
      return {
        success: true,
        data: secretData
      };
      
    } catch (error: any) {
      logger.error('Get secret status error', { error: error.message, secretId });
      return {
        success: false,
        error: 'Failed to get secret status'
      };
    }
  }
  
  /**
   * Get all secrets for a user
   */
  async getUserSecrets(userAddress: string, limit: number = 10, page: number = 1): Promise<FusionSecretData[]> {
    try {
      logger.info('Getting user secrets', { userAddress, limit, page });
      
      const userSecrets = Array.from(this.secretsHistory.values())
        .filter(secret => secret.userAddress === userAddress)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return userSecrets.slice(startIndex, endIndex);
      
    } catch (error: any) {
      logger.error('Get user secrets error', { error: error.message, userAddress });
      return [];
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
   * Validate limit order request parameters
   */
  private validateLimitOrderRequest(params: LimitOrderRequest): { isValid: boolean; errors: string[] } {
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
    if (!params.limitPrice) {
      errors.push('limitPrice is required');
    }
    if (!params.orderType) {
      errors.push('orderType is required');
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
    
    // Price validation
    if (params.limitPrice && parseFloat(params.limitPrice) <= 0) {
      errors.push('Limit price must be greater than 0');
    }
    
    // Order type validation
    if (params.orderType && !['buy', 'sell'].includes(params.orderType)) {
      errors.push('Order type must be either "buy" or "sell"');
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
   * Format limit order response
   */
  private formatLimitOrderResponse(data: any, params: LimitOrderRequest, quoteData: any): LimitOrderData {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      orderId,
      txHash: data.tx?.hash,
      status: LimitOrderStatus.PENDING,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.amount,
      toAmount: quoteData.toTokenAmount,
      limitPrice: params.limitPrice,
      orderType: params.orderType,
      gasEstimate: quoteData.estimatedGas || '0',
      gasPrice: data.tx?.gasPrice,
      deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
      userAddress: params.userAddress,
      timestamp: Date.now(),
      route: quoteData.route || [],
      fusionData: {
        permit: params.permit,
        deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
        nonce: data.nonce || 0,
        signature: data.signature
      }
    };
  }
  
  /**
   * Format Fusion+ quote response
   */
  private formatFusionQuoteResponse(data: any, params: FusionQuoteRequest): any {
    return {
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromTokenAmount: params.amount,
      toTokenAmount: data.toTokenAmount,
      limitPrice: params.limitPrice,
      orderType: params.orderType,
      estimatedGas: data.estimatedGas || '0',
      priceImpact: data.priceImpact || 0,
      route: data.route || [],
      timestamp: Date.now()
    };
  }
  
  /**
   * Simulate limit order execution
   */
  private simulateLimitOrderExecution(params: LimitOrderRequest, quoteData: any): any {
    const originalQuote = quoteData;
    const simulatedOrder = this.formatLimitOrderResponse(quoteData, params, quoteData);
    
    // Calculate execution probability based on current market conditions
    const executionProbability = this.calculateExecutionProbability(params, quoteData);
    
    // Calculate potential savings/MEV protection benefits
    const mevProtectionBenefits = this.calculateMEVProtectionBenefits(params, quoteData);
    
    return {
      originalQuote,
      simulatedOrder,
      executionProbability,
      mevProtectionBenefits,
      estimatedExecutionTime: this.estimateExecutionTime(params, quoteData)
    };
  }
  
  /**
   * Calculate execution probability for limit order
   */
  private calculateExecutionProbability(params: LimitOrderRequest, quoteData: any): number {
    // This would integrate with market data to calculate probability
    // For now, return a mock calculation
    const currentPrice = parseFloat(quoteData.toTokenAmount) / parseFloat(params.amount);
    const limitPrice = parseFloat(params.limitPrice);
    
    if (params.orderType === 'buy') {
      return currentPrice <= limitPrice ? 0.8 : 0.2;
    } else {
      return currentPrice >= limitPrice ? 0.8 : 0.2;
    }
  }
  
  /**
   * Calculate MEV protection benefits
   */
  private calculateMEVProtectionBenefits(params: LimitOrderRequest, quoteData: any): any {
    // Mock calculation of MEV protection benefits
    return {
      frontrunProtection: true,
      sandwichProtection: true,
      estimatedSavings: '0.001', // ETH
      protectionLevel: 'high'
    };
  }
  
  /**
   * Estimate execution time for limit order
   */
  private estimateExecutionTime(params: LimitOrderRequest, quoteData: any): number {
    // Mock estimation based on order type and market conditions
    return params.orderType === 'buy' ? 300 : 600; // seconds
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

  /**
   * Handle limit order specific errors
   */
  private handleLimitOrderError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid limit order parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Limit order route not found';
        case 429:
          return 'Rate limit exceeded';
        case 500:
          return '1inch Fusion+ API server error';
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
   * Handle escrow specific errors
   */
  private handleEscrowError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid escrow status request parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Escrow status route not found';
        case 429:
          return 'Rate limit exceeded';
        case 500:
          return '1inch Fusion+ API server error';
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
   * Handle secret specific errors
   */
  private handleSecretError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid secret submission parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Secret submission route not found';
        case 429:
          return 'Rate limit exceeded';
        case 500:
          return '1inch Fusion+ API server error';
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
   * Format escrow status response
   */
  private formatEscrowStatusResponse(data: any, orderId: string): EscrowStatusData {
    return {
      orderId,
      escrowAddress: data.escrowAddress || '',
      isReady: data.isReady || false,
      readyTimestamp: data.readyTimestamp,
      expirationTimestamp: data.expirationTimestamp || (Date.now() + 300000), // 5 minutes default
      depositedAmount: data.depositedAmount || '0',
      requiredAmount: data.requiredAmount || '0',
      status: data.status || EscrowStatus.PENDING
    };
  }

  /**
   * Validate secret request parameters
   */
  private validateSecretRequest(params: FusionSecretRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields
    if (!params.orderId) {
      errors.push('orderId is required');
    }
    if (!params.userAddress) {
      errors.push('userAddress is required');
    }
    if (!params.secret) {
      errors.push('secret is required');
    }
    if (!params.signature) {
      errors.push('signature is required');
    }
    if (!params.nonce) {
      errors.push('nonce is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format secret response
   */
  private formatSecretResponse(data: any, params: FusionSecretRequest, escrowData: any): FusionSecretData {
    const secretId = `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      secretId,
      orderId: params.orderId,
      userAddress: params.userAddress,
      status: SecretStatus.PENDING,
      timestamp: Date.now(),
      escrowAddress: escrowData?.escrowAddress,
      escrowReady: escrowData?.isReady || false,
      secretHash: data.secretHash,
      submissionTxHash: data.submissionTxHash
    };
  }
}

export default SwapService; 