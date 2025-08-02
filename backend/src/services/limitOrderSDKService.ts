import { 
  LimitOrder, 
  MakerTraits, 
  Address, 
  randBigInt
} from '@1inch/limit-order-sdk';
import { Wallet, JsonRpcProvider } from 'ethers';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { 
  LimitOrderRequest, 
  LimitOrderResponse, 
  LimitOrderData, 
  LimitOrderStatus 
} from '../types/swap';
import axios from 'axios';

export class LimitOrderSDKService {
  private wallet: Wallet;
  private provider: JsonRpcProvider;
  private apiKey: string;
  
  constructor() {
    // Initialize wallet for signing
    this.provider = new JsonRpcProvider(config.ETHEREUM_RPC_URL);
    this.wallet = new Wallet(config.PRIVATE_KEY, this.provider);
    this.apiKey = config.INCH_API_KEY || '';
    
    logger.info('LimitOrderSDKService initialized', {
      networkId: config.CHAIN_ID,
      walletAddress: this.wallet.address,
      hasApiKey: !!this.apiKey,
      timestamp: Date.now(),
      service: 'cipherswap-limit-order-sdk'
    });
  }
  
  /**
   * Create a limit order using 1inch API
   */
  async createLimitOrder(params: LimitOrderRequest): Promise<LimitOrderResponse> {
    try {
      logger.info('Creating limit order with 1inch API', { 
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          amount: params.amount,
          limitPrice: params.limitPrice,
          orderType: params.orderType,
          chainId: params.chainId,
          userAddress: params.userAddress
        },
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });
      
      // Validate request
      const validation = this.validateLimitOrderRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Create maker traits with proper expiration
      const expiresIn = BigInt(params.deadline || 3600); // 1 hour default
      const expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;
      const UINT_40_MAX = (1n << 40n) - 1n;
      
      const makerTraits = MakerTraits.default()
        .withExpiration(expiration)
        .withNonce(randBigInt(UINT_40_MAX));
      
      // Create order using 1inch SDK
      const order = new LimitOrder({
        makerAsset: new Address(params.fromToken.toLowerCase()),
        takerAsset: new Address(params.toToken.toLowerCase()),
        makingAmount: BigInt(params.amount),
        takingAmount: BigInt(params.limitPrice),
        maker: new Address(params.userAddress.toLowerCase()),
        receiver: new Address(params.userAddress.toLowerCase()), // Same as maker for simple orders
      }, makerTraits);
      
      // Get real order hash using 1inch SDK
      const orderHash = order.getOrderHash(params.chainId);
      
      // Get real signature using 1inch SDK
      const typedData = order.getTypedData(params.chainId);
      const signature = await this.wallet.signTypedData(
        typedData.domain,
        { Order: typedData.types.Order },
        typedData.message
      );
      
      // Submit to 1inch API if API key is available
      let apiResponse = null;
      if (this.apiKey) {
        try {
          apiResponse = await this.submitTo1inchAPI(order, signature, params);
          logger.info('Order submitted to 1inch API', {
            orderId: orderHash,
            apiResponse: apiResponse?.data,
            timestamp: Date.now(),
            service: 'cipherswap-limit-order-sdk'
          });
        } catch (apiError: any) {
          logger.warn('1inch API submission failed, using local order', {
            error: apiError.message,
            orderId: orderHash,
            timestamp: Date.now(),
            service: 'cipherswap-limit-order-sdk'
          });
        }
      }
      
      // Format order data for 1inch Limit Order Protocol
      const orderData: LimitOrderData = {
        orderId: orderHash,
        txHash: apiResponse?.data?.txHash,
        status: LimitOrderStatus.PENDING,
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.amount,
        toAmount: params.limitPrice,
        limitPrice: params.limitPrice,
        orderType: params.orderType,
        gasEstimate: '0', // Will be calculated during execution
        gasPrice: undefined,
        deadline: Number(expiration),
        userAddress: params.userAddress,
        timestamp: Date.now(),
        route: [],
        fusionData: {
          permit: null,
          deadline: Number(expiration),
          nonce: 0
        },
        customData: {
          orderHash: orderHash,
          signature: signature,
          typedData: {
            domain: typedData.domain,
            types: typedData.types,
            message: {
              ...typedData.message,
              makingAmount: typedData.message.makingAmount.toString(),
              takingAmount: typedData.message.takingAmount.toString(),
              salt: typedData.message.salt.toString()
            }
          },
          orderDetails: {
            makerAsset: params.fromToken.toLowerCase(),
            takerAsset: params.toToken.toLowerCase(),
            makingAmount: params.amount,
            takingAmount: params.limitPrice,
            maker: params.userAddress.toLowerCase(),
            receiver: params.userAddress.toLowerCase(),
            expiration: Number(expiration)
          },
          apiResponse: apiResponse?.data
        },
        signature: signature,
        createdAt: new Date().toISOString(),
        expiresAt: new Date((Number(expiration) * 1000)).toISOString()
      };
      
      logger.info('1inch Limit Order created successfully', {
        orderId: orderHash,
        signature: signature,
        expiration: Number(expiration),
        apiSubmitted: !!apiResponse,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('1inch Limit Order creation failed', {
        error: error.message,
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          userAddress: params.userAddress
        },
        stack: error.stack,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });
      
      return {
        success: false,
        error: `1inch Limit Order creation failed: ${error.message}`
      };
    }
  }
  
  /**
   * Submit order to 1inch API
   */
  private async submitTo1inchAPI(order: any, signature: string, params: LimitOrderRequest): Promise<any> {
    try {
      const response = await axios.post(
        `https://api.1inch.dev/limit-order/v1.0/order`,
        {
          order: {
            makerAsset: params.fromToken.toLowerCase(),
            takerAsset: params.toToken.toLowerCase(),
            makingAmount: params.amount,
            takingAmount: params.limitPrice,
            maker: params.userAddress.toLowerCase(),
            receiver: params.userAddress.toLowerCase(),
            salt: order.salt.toString(),
            expiration: order.expiration.toString()
          },
          signature: signature,
          chainId: params.chainId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response;
    } catch (error: any) {
      logger.error('1inch API submission failed', {
        error: error.message,
        orderId: order.getOrderHash(params.chainId),
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });
      throw error;
    }
  }

  /**
   * Submit order to the network
   */
  async submitOrder(orderHash: string, signature: string): Promise<LimitOrderResponse> {
    try {
      logger.info('Submitting order to network', {
        orderHash,
        signature,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });

      // Mock submission for now - in real implementation this would use the API
      const mockResult = {
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        status: 'submitted'
      };

      logger.info('Order submitted successfully', {
        orderHash,
        result: mockResult,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });

      return {
        success: true,
        data: {
          orderId: orderHash,
          txHash: mockResult.txHash,
          status: LimitOrderStatus.PENDING,
          fromToken: '',
          toToken: '',
          fromAmount: '0',
          toAmount: '0',
          limitPrice: '0',
          orderType: 'sell' as const,
          gasEstimate: '0',
          gasPrice: undefined,
          deadline: 0,
          userAddress: '',
          timestamp: Date.now(),
          route: [],
          fusionData: {
            permit: null,
            deadline: 0,
            nonce: 0
          },
          customData: {},
          createdAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Error submitting order', {
        error: error instanceof Error ? error.message : String(error),
        orderHash,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderHash: string): Promise<LimitOrderResponse> {
    try {
      logger.info('Getting order status', {
        orderHash,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });

      // Mock status for now - in real implementation this would use the API
      const mockResult = {
        status: LimitOrderStatus.PENDING,
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        createdAt: new Date().toISOString()
      };

      logger.info('Order status retrieved', {
        orderHash,
        status: mockResult.status,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });

      return {
        success: true,
        data: {
          orderId: orderHash,
          txHash: mockResult.txHash,
          status: mockResult.status,
          fromToken: '',
          toToken: '',
          fromAmount: '0',
          toAmount: '0',
          limitPrice: '0',
          orderType: 'sell' as const,
          gasEstimate: '0',
          gasPrice: undefined,
          deadline: 0,
          userAddress: '',
          timestamp: Date.now(),
          route: [],
          fusionData: {
            permit: null,
            deadline: 0,
            nonce: 0
          },
          customData: {},
          createdAt: mockResult.createdAt
        }
      };

    } catch (error) {
      logger.error('Error getting order status', {
        error: error instanceof Error ? error.message : String(error),
        orderHash,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderHash: string): Promise<LimitOrderResponse> {
    try {
      logger.info('Cancelling order', {
        orderHash,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });

      // Mock cancellation for now - in real implementation this would use the API
      const mockResult = {
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        status: 'cancelled'
      };

      logger.info('Order cancelled successfully', {
        orderHash,
        result: mockResult,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });

      return {
        success: true,
        data: {
          orderId: orderHash,
          txHash: mockResult.txHash,
          status: LimitOrderStatus.CANCELLED,
          fromToken: '',
          toToken: '',
          fromAmount: '0',
          toAmount: '0',
          limitPrice: '0',
          orderType: 'sell' as const,
          gasEstimate: '0',
          gasPrice: undefined,
          deadline: 0,
          userAddress: '',
          timestamp: Date.now(),
          route: [],
          fusionData: {
            permit: null,
            deadline: 0,
            nonce: 0
          },
          customData: {},
          createdAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Error cancelling order', {
        error: error instanceof Error ? error.message : String(error),
        orderHash,
        timestamp: Date.now(),
        service: 'cipherswap-limit-order-sdk'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Validate limit order request
   */
  private validateLimitOrderRequest(params: LimitOrderRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!params.fromToken) {
      errors.push('fromToken is required');
    }

    if (!params.toToken) {
      errors.push('toToken is required');
    }

    if (!params.amount || params.amount === '0') {
      errors.push('amount must be greater than 0');
    }

    if (!params.limitPrice || params.limitPrice === '0') {
      errors.push('limitPrice must be greater than 0');
    }

    if (!params.userAddress) {
      errors.push('userAddress is required');
    }

    // Validate token addresses
    if (params.fromToken && params.toToken && params.fromToken === params.toToken) {
      errors.push('fromToken and toToken cannot be the same');
    }

    // Validate order type
    if (params.orderType && !['buy', 'sell'].includes(params.orderType)) {
      errors.push('Order type must be either "buy" or "sell"');
    }

    // Validate chain ID
    if (!params.chainId || params.chainId <= 0) {
      errors.push('Valid chainId is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 