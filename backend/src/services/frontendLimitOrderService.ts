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
        chainId: orderParams.chainId,
        orderType: orderParams.orderType,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      // Create order in orderbook with required parameters
      const orderRequest = {
        ...orderParams,
        chainId: orderParams.chainId || 1, // Default to Ethereum mainnet
        orderType: orderParams.orderType || 'sell' // Default to sell order
      }
      
      logger.info('Order request parameters', {
        orderRequest,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })
      
      const orderResponse = await this.orderbookService.createCustomLimitOrder(orderRequest)
      
      if (!orderResponse.success) {
        return {
          success: false,
          error: orderResponse.error
        }
      }

      const order = orderResponse.data!
      const orderId = order.orderId

      // Create unsigned transaction data for frontend signing
      const unsignedTxData = await this.createLimitOrderTransactionData({
        ...orderParams,
        orderId
      })

      logger.info('Unsigned transaction created successfully', {
        orderId,
        to: unsignedTxData.to,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      return {
        success: true,
        data: {
          orderId,
          ...unsignedTxData
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
      gasPrice: gasPrice.gasPrice?.toString() || LIMIT_ORDER_CONFIG.GAS.DEFAULT_GAS_PRICE,
      nonce: await this.provider.getTransactionCount(order.userAddress, 'pending'),
    }
  }

  /**
   * Encode limit order creation data
   */
  private encodeLimitOrderCreation(order: any): string {
    // Using 1inch Limit Order Protocol interface
    const iface = new ethers.Interface([
      'function fillOrder((address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, address maker, address taker, uint256 salt, uint256 start, uint256 end, bytes4 makerAssetData, bytes4 takerAssetData, bytes4 getMakerAmount, bytes4 getTakerAmount, bytes4 predicate, bytes4 permit, bytes4 interaction, bytes4 signature)) order, uint256 makingAmount, uint256 takingAmount, uint256 thresholdAmount)'
    ])

    // Create order structure for 1inch Limit Order Protocol
    const deadline = order.deadline || Math.floor(Date.now() / 1000) + 3600 // Default to 1 hour from now
    const salt = Math.floor(Math.random() * 1000000000) // Random salt for uniqueness
    
    // Calculate taking amount based on limit price
    const makingAmount = order.amount || '0'
    const takingAmount = this.calculateTakingAmount(makingAmount, order.limitPrice)
    
    // Create the order structure
    const orderStruct = {
      makerAsset: order.fromToken,
      takerAsset: order.toToken,
      makingAmount: makingAmount,
      takingAmount: takingAmount,
      maker: order.userAddress,
      taker: '0x0000000000000000000000000000000000000000', // Anyone can fill
      salt: salt.toString(),
      start: Math.floor(Date.now() / 1000).toString(),
      end: deadline.toString(),
      makerAssetData: '0x', // Default empty data
      takerAssetData: '0x', // Default empty data
      getMakerAmount: '0x', // Default empty data
      getTakerAmount: '0x', // Default empty data
      predicate: '0x', // Default empty data
      permit: '0x', // Default empty data
      interaction: '0x', // Default empty data
      signature: '0x' // Will be filled by frontend
    }

    // For now, we'll create a simple order creation transaction
    // This is a simplified version - in production, you'd want to use the actual 1inch SDK
    const simpleIface = new ethers.Interface([
      'function createOrder(address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, address maker, uint256 deadline)'
    ])

    return simpleIface.encodeFunctionData('createOrder', [
      order.fromToken,
      order.toToken,
      makingAmount,
      takingAmount,
      order.userAddress,
      deadline
    ])
  }

  /**
   * Calculate taking amount based on limit price
   */
  private calculateTakingAmount(makingAmount: string, limitPrice: string): string {
    const makingAmountNum = parseFloat(makingAmount)
    const limitPriceNum = parseFloat(limitPrice)
    
    // Calculate taking amount: makingAmount * limitPrice
    // Note: This is a simplified calculation - in production, you'd want to use proper price feeds
    const takingAmount = makingAmountNum * limitPriceNum
    
    return takingAmount.toString()
  }
} 