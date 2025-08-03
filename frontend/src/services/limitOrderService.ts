import { LIMIT_ORDER_ABI } from '../constants/abis'

export interface LimitOrderRequest {
  fromToken: string
  toToken: string
  amount: string
  limitPrice: string
  deadline: number
  userAddress: string
}

export interface LimitOrderResponse {
  success: boolean
  data?: {
    orderId: string
    txHash?: string
    status: 'pending' | 'executed' | 'failed'
  }
  error?: string
}

export class FrontendLimitOrderService {
  private apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }

  /**
   * Create unsigned transaction for limit order
   */
  async createUnsignedTransaction(order: LimitOrderRequest): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/frontend-limit-orders/create-unsigned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create unsigned transaction')
      }

      return data.data
    } catch (error: any) {
      throw new Error(`Failed to create unsigned transaction: ${error.message}`)
    }
  }

  /**
   * Execute user-signed transaction
   */
  async executeUserSignedTransaction(
    signedTransaction: string,
    orderId: string
  ): Promise<LimitOrderResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/frontend-limit-orders/execute-signed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signedTransaction,
          orderId,
        }),
      })

      const data = await response.json()
      return data
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to execute transaction: ${error.message}`,
      }
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<LimitOrderResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/frontend-limit-orders/${orderId}`)
      const data = await response.json()
      return data
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get order status: ${error.message}`,
      }
    }
  }
} 