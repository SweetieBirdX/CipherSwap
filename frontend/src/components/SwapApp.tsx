import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { QuoteService } from '../services/quoteService'
import { SwapService } from '../services/swapService'
import type { QuoteRequest, QuoteData } from '../types/quote'
import type { SwapRequest } from '../types/swap'

export default function SwapApp() {
  const { address, isConnected } = useAccount()
  
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [swapStatus, setSwapStatus] = useState('')

  // Get quote when tokens or amount changes
  useEffect(() => {
    if (amount && fromToken && toToken && isConnected && address) {
      getQuote()
    }
  }, [amount, fromToken, toToken, slippage, isConnected, address])

  const getQuote = async () => {
    if (!amount || !fromToken || !toToken || !address) return

    setLoading(true)
    setError('')

    try {
      const request: QuoteRequest = {
        fromToken,
        toToken,
        amount,
        chainId: 1, // Ethereum mainnet
        slippage,
        userAddress: address
      }

      const response = await QuoteService.getQuote(request)
      
      if (response.success && response.data) {
        setQuote(response.data)
      } else {
        setError(response.error || 'Failed to get quote')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!quote || !address) return

    setLoading(true)
    setError('')
    setSwapStatus('Initiating swap...')

    try {
      const request: SwapRequest = {
        fromToken,
        toToken,
        amount,
        chainId: 1,
        slippage,
        userAddress: address,
        useMEVProtection: true
      }

      const response = await SwapService.createSwap(request)
      
      if (response.success && response.data) {
        setSwapStatus('Swap created successfully!')
        // Reset form
        setAmount('')
        setQuote(null)
      } else {
        setError(response.error || 'Failed to create swap')
        setSwapStatus('')
      }
    } catch (err) {
      setError('Network error occurred')
      setSwapStatus('')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(6)
  }

  if (!isConnected) {
    return (
      <div>
        <div>
          <h2>Connect Wallet</h2>
          <p>Please connect your wallet to start trading</p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div>
        <h2>Swap Tokens</h2>
        <p>Trade with MEV protection and intelligent routing</p>
      </div>

      <div>
        {/* From Token */}
        <div>
          <label>From Token</label>
          <select 
            value={fromToken} 
            onChange={(e) => setFromToken(e.target.value)}
          >
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="DAI">DAI</option>
          </select>
        </div>

        {/* To Token */}
        <div>
          <label>To Token</label>
          <select 
            value={toToken} 
            onChange={(e) => setToToken(e.target.value)}
          >
            <option value="USDC">USDC</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
            <option value="DAI">DAI</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        {/* Slippage */}
        <div>
          <label>Slippage (%)</label>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(parseFloat(e.target.value))}
            step="0.1"
            min="0.1"
            max="10"
          />
        </div>

        {/* Quote Display */}
        {quote && (
          <div>
            <h3>Quote</h3>
            <div>
              <p>You will receive: {formatAmount(quote.toAmount)} {toToken}</p>
              <p>Price Impact: {quote.priceImpact}%</p>
              <p>Gas Estimate: {quote.gasEstimate} ETH</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div>
            <p>Error: {error}</p>
          </div>
        )}

        {/* Status Display */}
        {swapStatus && (
          <div>
            <p>{swapStatus}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div>
          <button 
            onClick={getQuote}
            disabled={loading || !amount}
          >
            {loading ? 'Getting Quote...' : 'Get Quote'}
          </button>

          <button 
            onClick={handleSwap}
            disabled={loading || !quote}
          >
            {loading ? 'Swapping...' : 'Swap'}
          </button>
        </div>
      </div>
    </div>
  )
} 