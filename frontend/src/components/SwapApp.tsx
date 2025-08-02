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
        chainId: 11155111, // Sepolia testnet
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
        chainId: 11155111, // Sepolia testnet
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
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#4169E1', marginBottom: '20px' }}>Connect Wallet</h2>
        <p style={{ marginBottom: '20px' }}>Please connect your wallet to start trading on Sepolia testnet</p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#4169E1', fontSize: '28px', fontWeight: 'bold' }}>CipherSwap</h2>
        <p style={{ color: '#666', fontSize: '16px' }}>Trade with MEV protection on Sepolia testnet</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* From Token */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>From Token</label>
          <select 
            value={fromToken} 
            onChange={(e) => setFromToken(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          >
            <option value="ETH">ETH (Sepolia)</option>
            <option value="USDC">USDC (Test)</option>
            <option value="USDT">USDT (Test)</option>
            <option value="DAI">DAI (Test)</option>
          </select>
        </div>

        {/* To Token */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>To Token</label>
          <select 
            value={toToken} 
            onChange={(e) => setToToken(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          >
            <option value="USDC">USDC (Test)</option>
            <option value="ETH">ETH (Sepolia)</option>
            <option value="USDT">USDT (Test)</option>
            <option value="DAI">DAI (Test)</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Slippage (%)</label>
        <input
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(parseFloat(e.target.value))}
          step="0.1"
          min="0.1"
          max="10"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
      </div>

      {/* Quote Display */}
      {quote && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#4169E1' }}>Quote Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <p><strong>Price Impact:</strong> {quote.priceImpact.toFixed(2)}%</p>
            <p><strong>Slippage:</strong> {quote.slippage}%</p>
            <p><strong>Estimated Gas:</strong> {quote.estimatedGas} ETH</p>
            <p><strong>Estimated Gains:</strong> {quote.estimatedGains.toFixed(6)} {toToken}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          Error: {error}
        </div>
      )}

      {/* Status Display */}
      {swapStatus && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#d1ecf1', 
          color: '#0c5460', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          {swapStatus}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <button 
          onClick={getQuote}
          disabled={loading || !amount}
          style={{
            padding: '12px',
            backgroundColor: '#4169E1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Getting Quote...' : 'Get Quote'}
        </button>

        <button 
          onClick={handleSwap}
          disabled={loading || !quote}
          style={{
            padding: '12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Swapping...' : 'Execute Swap'}
        </button>
      </div>
    </div>
  )
} 