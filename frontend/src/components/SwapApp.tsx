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

  const formatGas = (gas: string) => {
    return (parseInt(gas) / 1e9).toFixed(2)
  }

  return (
    <div className="min-h-screen p-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">
            ← Back to Home
          </Link>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur-sm opacity-50"></div>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            CipherSwap
          </span>
        </div>
        
        <ConnectButton />
      </header>

      {/* Main Swap Interface */}
      <div className="relative z-10 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Swap Tokens</h2>
          
          {/* From Token */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm mb-3 font-medium">From</label>
            <div className="flex space-x-3">
              <select 
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="flex-1 bg-slate-700/50 text-white rounded-xl px-4 py-3 border border-slate-600/50 focus:border-blue-500 focus:outline-none transition-all duration-300"
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="DAI">DAI</option>
                <option value="WBTC">WBTC</option>
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-slate-700/50 text-white rounded-xl px-4 py-3 border border-slate-600/50 focus:border-blue-500 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center my-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 180 }}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300"
            >
              <span className="text-white text-xl">↓</span>
            </motion.div>
          </div>

          {/* To Token */}
          <div className="mb-8">
            <label className="block text-gray-300 text-sm mb-3 font-medium">To</label>
            <div className="flex space-x-3">
              <select 
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="flex-1 bg-slate-700/50 text-white rounded-xl px-4 py-3 border border-slate-600/50 focus:border-blue-500 focus:outline-none transition-all duration-300"
              >
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="DAI">DAI</option>
                <option value="WBTC">WBTC</option>
              </select>
              <input
                type="number"
                placeholder="0.0"
                value={quote && quote.quote?.toTokenAmount ? formatAmount(quote.quote.toTokenAmount) : ''}
                className="flex-1 bg-slate-700/50 text-white rounded-xl px-4 py-3 border border-slate-600/50 focus:border-blue-500 focus:outline-none transition-all duration-300"
                readOnly
              />
            </div>
          </div>

          {/* Quote Details */}
          {quote && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-6 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl border border-slate-600/50"
            >
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price Impact:</span>
                  <span className="text-white font-semibold">{quote.priceImpact.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Estimated Gas:</span>
                  <span className="text-white font-semibold">{formatGas(quote.estimatedGas)} Gwei</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Route:</span>
                  <span className="text-white font-semibold">{quote.route.length} steps</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Slippage Settings */}
          <div className="mb-8">
            <label className="block text-gray-300 text-sm mb-3 font-medium">Slippage Tolerance</label>
            <div className="flex space-x-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    slippage === value 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 border border-slate-600/50'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Status Display */}
          {swapStatus && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl"
            >
              <p className="text-blue-400 text-sm">{swapStatus}</p>
            </motion.div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!isConnected || !amount || loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing...
              </div>
            ) : !isConnected ? (
              'Connect Wallet First'
            ) : !amount ? (
              'Enter Amount'
            ) : (
              'Swap'
            )}
          </button>
        </motion.div>

        {/* Features Info */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
            🛡️ MEV Protected • ⚡ Split Routing • 🔒 Zero Slippage
          </p>
        </div>
      </div>
    </div>
  )
} 