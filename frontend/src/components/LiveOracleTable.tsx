import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OracleService } from '../services/oracleService'
import type { OraclePrice } from '../types/oracle'

interface LiveOracleTableProps {
  className?: string
}

// Popüler token çiftleri
const POPULAR_PAIRS = [
  { chainId: 1, pair: 'ETH/USD', symbol: 'ETH' },
  { chainId: 1, pair: 'BTC/USD', symbol: 'BTC' },
  { chainId: 1, pair: 'USDC/USD', symbol: 'USDC' },
  { chainId: 1, pair: 'USDT/USD', symbol: 'USDT' },
  { chainId: 1, pair: 'DAI/USD', symbol: 'DAI' },
  { chainId: 137, pair: 'MATIC/USD', symbol: 'MATIC' },
  { chainId: 137, pair: 'WETH/USD', symbol: 'WETH' },
  { chainId: 10, pair: 'OP/USD', symbol: 'OP' },
  { chainId: 42161, pair: 'ARB/USD', symbol: 'ARB' },
  { chainId: 8453, pair: 'ETH/USD', symbol: 'ETH' }
]

export default function LiveOracleTable({ className = '' }: LiveOracleTableProps) {
  const [prices, setPrices] = useState<OraclePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [selectedToken, setSelectedToken] = useState<string>('all')

  // Fiyatları güncelle
  const updatePrices = async () => {
    try {
      const batchRequest = {
        prices: POPULAR_PAIRS.map(pair => ({
          chainId: pair.chainId,
          pair: pair.pair
        }))
      }

      const response = await OracleService.getBatchPrices(batchRequest)
      
      if (response.success && response.data) {
        // Backend'den gelen data'yı frontend formatına çevir
        const formattedPrices = response.data.map((item: any) => ({
          chainId: item.chainId,
          pair: item.pair,
          price: item.price || '0',
          timestamp: item.timestamp || Math.floor(Date.now() / 1000),
          decimals: item.decimals || 8,
          feedAddress: item.feedAddress || '0x0000000000000000000000000000000000000000',
          description: item.description || `${item.pair} Price Feed`
        }))
        
        setPrices(formattedPrices)
        setLastUpdate(new Date())
        setError(null)
      } else {
        setError(response.error || 'Failed to fetch prices')
      }
    } catch (err: any) {
      console.error('Oracle price fetch error:', err)
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  // İlk yükleme ve periyodik güncelleme
  useEffect(() => {
    updatePrices()
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(updatePrices, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Fiyat değişim rengini hesapla
  const getPriceChangeColor = (currentPrice: string, previousPrice?: string) => {
    if (!previousPrice) return 'text-gray-400'
    
    const current = parseFloat(currentPrice)
    const previous = parseFloat(previousPrice)
    
    if (current > previous) return 'text-green-400'
    if (current < previous) return 'text-red-400'
    return 'text-gray-400'
  }

  // Chain ID'yi chain adına çevir
  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      10: 'Optimism',
      42161: 'Arbitrum',
      8453: 'Base'
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  // Fiyatı formatla
  const formatPrice = (price: string, decimals: number = 8) => {
    const numPrice = parseFloat(price)
    if (numPrice >= 1) {
      return numPrice.toFixed(2)
    } else if (numPrice >= 0.01) {
      return numPrice.toFixed(4)
    } else {
      return numPrice.toFixed(6)
    }
  }

  if (loading) {
    return (
      <div className={`bg-[#2433FF]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#00C2D1]/20 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Live Oracle Prices</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#2433FF]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#00C2D1]/20 ${className}`}
    >
             {/* Header */}
       <div className="flex items-center justify-between mb-6">
         <div>
           <h3 className="text-xl font-semibold text-white mb-1">Live Oracle Prices</h3>
           <p className="text-sm text-[#F8F9FC]/70">
             Last updated: {lastUpdate.toLocaleTimeString()}
           </p>
         </div>
         <div className="flex items-center space-x-2">
           <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
           <span className="text-sm text-[#F8F9FC]/70">Live</span>
         </div>
       </div>

       {/* Filters */}
       <div className="flex flex-wrap gap-4 mb-6">
         <div className="flex items-center space-x-2">
           <label className="text-[#F8F9FC]/80 text-sm font-medium">Network:</label>
           <select 
             value={selectedChain}
             onChange={(e) => setSelectedChain(e.target.value)}
             className="bg-[#2433FF]/20 text-white rounded-lg px-3 py-1 text-sm border border-[#00C2D1]/30 focus:border-[#2433FF] focus:outline-none"
           >
             <option value="all">All Networks</option>
             <option value="1">Ethereum</option>
             <option value="137">Polygon</option>
             <option value="10">Optimism</option>
             <option value="42161">Arbitrum</option>
             <option value="8453">Base</option>
           </select>
         </div>
         
         <div className="flex items-center space-x-2">
           <label className="text-[#F8F9FC]/80 text-sm font-medium">Token:</label>
           <select 
             value={selectedToken}
             onChange={(e) => setSelectedToken(e.target.value)}
             className="bg-[#2433FF]/20 text-white rounded-lg px-3 py-1 text-sm border border-[#00C2D1]/30 focus:border-[#2433FF] focus:outline-none"
           >
             <option value="all">All Tokens</option>
             <option value="ETH">ETH</option>
             <option value="BTC">BTC</option>
             <option value="USDC">USDC</option>
             <option value="USDT">USDT</option>
             <option value="DAI">DAI</option>
             <option value="MATIC">MATIC</option>
             <option value="OP">OP</option>
             <option value="ARB">ARB</option>
           </select>
         </div>
       </div>

      {/* Error Display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

             {/* Price Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
         <AnimatePresence>
           {prices
             .filter(price => {
               const pair = POPULAR_PAIRS.find(p => 
                 p.chainId === price.chainId && p.pair === price.pair
               )
               if (!pair) return false
               
               // Chain filter
               if (selectedChain !== 'all' && price.chainId !== parseInt(selectedChain)) {
                 return false
               }
               
               // Token filter
               if (selectedToken !== 'all' && pair.symbol !== selectedToken) {
                 return false
               }
               
               return true
             })
             .map((price, index) => {
             const pair = POPULAR_PAIRS.find(p => 
               p.chainId === price.chainId && p.pair === price.pair
             )
             
             if (!pair) return null

             return (
              <motion.div
                key={`${price.chainId}-${price.pair}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#2433FF]/15 backdrop-blur-sm rounded-xl p-4 border border-[#00C2D1]/30 hover:border-[#2433FF]/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#2433FF] to-[#00C2D1] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {pair.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{pair.symbol}</p>
                      <p className="text-xs text-[#F8F9FC]/70">{getChainName(price.chainId)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getPriceChangeColor(price.price)}`}>
                      ${formatPrice(price.price, price.decimals)}
                    </p>
                    <p className="text-xs text-[#F8F9FC]/70">
                      {new Date(price.timestamp * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {/* Health indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-[#F8F9FC]/70">Oracle</span>
                  </div>
                  <span className="text-xs text-[#F8F9FC]/70">
                    {price.feedAddress.slice(0, 6)}...{price.feedAddress.slice(-4)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={updatePrices}
          className="px-4 py-2 bg-gradient-to-r from-[#2433FF] to-[#00C2D1] text-white rounded-lg text-sm font-medium hover:from-[#1a2bff] hover:to-[#00a8b8] transition-all duration-300"
        >
          Refresh Prices
        </motion.button>
      </div>
    </motion.div>
  )
} 