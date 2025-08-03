import { useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { FrontendLimitOrderService } from '../services/limitOrderService'
import type { LimitOrderRequest, LimitOrderResponse } from '../services/limitOrderService'

export function useLimitOrder() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const limitOrderService = new FrontendLimitOrderService()

  const createLimitOrder = async (orderParams: Omit<LimitOrderRequest, 'userAddress'>): Promise<LimitOrderResponse> => {
    if (!isConnected || !address || !walletClient) {
      return {
        success: false,
        error: 'Wallet not connected',
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Create unsigned transaction
      const unsignedTx = await limitOrderService.createUnsignedTransaction({
        ...orderParams,
        userAddress: address,
        chainId: orderParams.chainId || 1,
        orderType: orderParams.orderType || 'sell',
      })

      // 2. User signs transaction in frontend
      const signedTx = await walletClient.signTransaction({
        account: address,
        to: unsignedTx.to,
        data: unsignedTx.data,
        value: unsignedTx.value || '0x0',
        gas: unsignedTx.gas,
        gasPrice: unsignedTx.gasPrice,
        nonce: unsignedTx.nonce,
      })

      // 3. Send signed transaction to backend for broadcasting
      const result = await limitOrderService.executeUserSignedTransaction(
        signedTx,
        unsignedTx.orderId
      )

      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create limit order'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getOrderStatus = async (orderId: string): Promise<LimitOrderResponse> => {
    return await limitOrderService.getOrderStatus(orderId)
  }

  return {
    createLimitOrder,
    getOrderStatus,
    isLoading,
    error,
    isConnected,
    address,
  }
} 