import { Request, Response } from 'express'
import { FrontendLimitOrderService } from '../../services/frontendLimitOrderService'
import { logger } from '../../utils/logger'

export class FrontendLimitOrderController {
  private service: FrontendLimitOrderService

  constructor() {
    this.service = new FrontendLimitOrderService()
  }

  /**
   * Create unsigned transaction for frontend signing
   */
  async createUnsignedTransaction(req: Request, res: Response) {
    try {
      const { fromToken, toToken, amount, limitPrice, deadline, userAddress } = req.body

      logger.info('Creating unsigned transaction for limit order', {
        userAddress,
        fromToken,
        toToken,
        amount,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      const result = await this.service.createUnsignedTransaction({
        fromToken,
        toToken,
        amount,
        limitPrice,
        deadline,
        userAddress,
      })

      if (!result.success) {
        return res.status(400).json(result)
      }

      res.json(result)
    } catch (error: any) {
      logger.error('Failed to create unsigned transaction', {
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      res.status(500).json({
        success: false,
        error: 'Failed to create unsigned transaction'
      })
    }
  }

  /**
   * Execute user-signed transaction
   */
  async executeUserSignedTransaction(req: Request, res: Response) {
    try {
      const { signedTransaction, orderId } = req.body

      logger.info('Executing user-signed transaction', {
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      const result = await this.service.executeUserSignedTransaction(
        signedTransaction,
        orderId
      )

      res.json(result)
    } catch (error: any) {
      logger.error('Failed to execute user-signed transaction', {
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      res.status(500).json({
        success: false,
        error: 'Failed to execute transaction'
      })
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params

      logger.info('Getting order status', {
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      const result = await this.service.getOrderStatus(orderId)

      res.json(result)
    } catch (error: any) {
      logger.error('Failed to get order status', {
        error: error.message,
        timestamp: Date.now(),
        service: 'cipherswap-frontend-limit-order'
      })

      res.status(500).json({
        success: false,
        error: 'Failed to get order status'
      })
    }
  }
} 