import { ethers } from 'ethers'
import { logger } from '../utils/logger'
import { LIMIT_ORDER_CONFIG } from '../config/limitOrderConfig'
import { CustomOrderbookService } from './customOrderbookService'

export interface UnsignedTransactionData {
  to: string
  data: string
  value: string
  gas: string
  gasPrice: string
  nonce: number
  orderId: string
}

export class FrontendLimitOrderService {
  private orderbookService: CustomOrderbookService
  private provider: ethers.JsonRpcProvider

  constructor() {
    this.orderbookService = new CustomOrderbookService()
    this.provider = new ethers.JsonRpcProvider(LIMIT_ORDER_CONFIG.SDK.NETWORK_ID === 1 
      ? process.env.ETHEREUM_RPC_URL 
      : process.env.POLYGON_RPC_URL || process.env.ETHEREUM_RPC_URL)
  }

  /**
   * Create unsigned transaction for frontend signing
   */
  async createUnsignedTransaction(orderParams: any): Promise<any> {
    try {
      logger.info('Creating unsigned transaction for limit order', {
        userAddress: orderParams.userAddress,
        fromToken: orderParams.fromToken,
        toToken: orderParams.toToken,
        amount: orderParams.amount,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      // Create order in orderbook with required parameters
      const orderRequest = {
        ...orderParams,
        chainId: orderParams.chainId || 1, // Default to Ethereum mainnet
        orderType: orderParams.orderType || 'sell' // Default to sell order
      }
      
      const orderResponse = await this.orderbookService.createCustomLimitOrder(orderRequest)
      
      if (!orderResponse.success) {
        return {
          success: false,
          error: orderResponse.error
        }
      }

      const order = orderResponse.data!
      const orderId = order.orderId

      // For now, return order data without transaction creation
      // This allows the frontend to work with the order while we implement proper transaction creation
      return {
        success: true,
        data: {
          orderId,
          order: order,
          message: 'Order created successfully. Transaction creation coming soon.'
        }
      }
    } catch (error: any) {
      logger.error('Failed to create unsigned transaction', {
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      return {
        success: false,
        error: `Failed to create unsigned transaction: ${error.message}`
      }
    }
  }

  /**
   * Execute user-signed transaction
   */
  async executeUserSignedTransaction(
    signedTransaction: string,
    orderId: string
  ): Promise<any> {
    try {
      logger.info('Broadcasting user-signed transaction', {
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      // Broadcast the user-signed transaction
      const txResponse = await this.provider.broadcastTransaction(signedTransaction)
      
      // Wait for confirmation
      const receipt = await txResponse.wait(LIMIT_ORDER_CONFIG.EXECUTION.CONFIRMATION_BLOCKS)

      if (!receipt || receipt.status === 0) {
        throw new Error('Transaction failed onchain')
      }

      // Update order status
      await this.orderbookService.updateOrderStatus(orderId, 'EXECUTED' as any)

      logger.info('User-signed transaction executed successfully', {
        orderId,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      return {
        success: true,
        data: {
          orderId,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          status: 'executed'
        }
      }
    } catch (error: any) {
      logger.error('Failed to execute user-signed transaction', {
        error: error.message,
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      return {
        success: false,
        error: `Failed to execute transaction: ${error.message}`
      }
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    try {
      const orderResponse = await this.orderbookService.getOrder(orderId)
      
      if (!orderResponse.success) {
        return {
          success: false,
          error: 'Order not found'
        }
      }

      return {
        success: true,
        data: {
          orderId,
          status: orderResponse.data?.status || 'unknown',
          order: orderResponse.data
        }
      }
    } catch (error: any) {
      logger.error('Failed to get order status', {
        error: error.message,
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      return {
        success: false,
        error: `Failed to get order status: ${error.message}`
      }
    }
  }

  /**
   * Create transaction data for limit order
   */
  private async createLimitOrderTransactionData(order: any): Promise<UnsignedTransactionData> {
    const contractAddress = LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL[
      LIMIT_ORDER_CONFIG.SDK.NETWORK_ID as keyof typeof LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL
    ]

    // Encode the function call for creating limit order
    const data = this.encodeLimitOrderCreation(order)

    // Estimate gas
    const gasEstimate = await this.provider.estimateGas({
      to: contractAddress,
      data,
      value: order.value || '0x0'
    })

    // Get current gas price
    const gasPrice = await this.provider.getFeeData()

    return {
      to: contractAddress,
      data,
      value: order.value || '0x0',
      gas: gasEstimate.toString(),
      gasPrice: gasPrice.gasPrice?.toString() || '20000000000',
      nonce: await this.provider.getTransactionCount(order.userAddress, 'pending'),
      orderId: order.orderId
    }
  }

  /**
   * Encode limit order creation data
   */
  private encodeLimitOrderCreation(order: any): string {
    // This would encode the actual function call to create the limit order
    // For now, we'll create a placeholder that can be extended
    const iface = new ethers.Interface([
      'function createOrder(address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, address maker, uint256 deadline)'
    ])

    // Ensure we have valid values for all parameters
    const deadline = order.deadline || Math.floor(Date.now() / 1000) + 3600 // Default to 1 hour from now
    const amount = order.amount || '0'
    const limitPrice = order.limitPrice || '0'

    return iface.encodeFunctionData('createOrder', [
      order.fromToken,
      order.toToken,
      amount,
      limitPrice,
      order.userAddress,
      deadline
    ])
  }
} 