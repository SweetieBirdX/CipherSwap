import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OneInchSpotPriceService } from '../services/oneInchSpotPriceService'

interface LiveOracleTableProps {
  className?: string
}

interface TokenPrice {
  symbol: string
  price: string
  change24h: number
  volume24h: number
  marketCap: number
  icon: string
  color: string
  address: string
  lastUpdated: number
}

export default function LiveOracleTable({ className = '' }: LiveOracleTableProps) {
  const [prices, setPrices] = useState<TokenPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const updatePrices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await OneInchSpotPriceService.getPopularTokens()
      
      if (response.success && response.data.tokens) {
        const formattedPrices: TokenPrice[] = response.data.tokens.map(token => ({
          symbol: token.symbol,
          price: token.price.toFixed(6),
          change24h: token.change24h,
          volume24h: token.volume24h,
          marketCap: token.marketCap,
          icon: token.icon,
          color: token.color,
          address: token.address,
          lastUpdated: response.timestamp
        }))
        
        setPrices(formattedPrices)
        setLastUpdate(new Date(response.timestamp))
      } else {
        setError('Failed to fetch price data')
      }
    } catch (err) {
      console.error('Error updating prices:', err)
      setError('Failed to fetch price data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    updatePrices()
    
    // Update prices every 30 seconds
    const interval = setInterval(updatePrices, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 137: return 'Polygon'
      case 42161: return 'Arbitrum'
      case 10: return 'Optimism'
      case 8453: return 'Base'
      default: return `Chain ${chainId}`
    }
  }

  const formatPrice = (price: string, decimals: number = 8) => {
    const numPrice = parseFloat(price)
    if (numPrice === 0) return '$0.00'
    
    if (numPrice < 0.01) {
      return `$${numPrice.toFixed(6)}`
    } else if (numPrice < 1) {
      return `$${numPrice.toFixed(4)}`
    } else if (numPrice < 1000) {
      return `$${numPrice.toFixed(2)}`
    } else {
      return `$${numPrice.toLocaleString()}`
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`
    } else {
      return `$${volume.toFixed(2)}`
    }
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`
    } else {
      return `$${marketCap.toFixed(2)}`
    }
  }

  const formatChange24h = (change: number) => {
    const isPositive = change >= 0
    const formattedChange = Math.abs(change).toFixed(2)
    return `${isPositive ? '+' : '-'}${formattedChange}%`
  }

  if (loading && prices.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live price data...</p>
        </div>
      </div>
    )
  }

  if (error && prices.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={updatePrices}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Live Oracle Prices
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Real-time price feeds from Chainlink and 1inch
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <span>•</span>
            <span>{prices.length} tokens</span>
            <span>•</span>
            <span>Chainlink + 1inch</span>
          </div>
        </div>

        {/* Price Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    24h Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    24h Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {prices.map((token, index) => (
                    <motion.tr
                      key={token.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: token.color }}
                          >
                            {token.icon}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {token.symbol}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getChainName(1)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(token.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatChange24h(token.change24h)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatVolume(token.volume24h)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMarketCap(token.marketCap)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">
                          {token.address.slice(0, 6)}...{token.address.slice(-4)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={updatePrices}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh Prices'}
          </button>
        </div>
      </div>
    </div>
  )
} 