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
    if (!previousPrice) return ''
    
    const current = parseFloat(currentPrice)
    const previous = parseFloat(previousPrice)
    
    if (current > previous) return ''
    if (current < previous) return ''
    return ''
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
    const numPrice = parseFloat(price) / Math.pow(10, decimals)
    return numPrice.toFixed(2)
  }

  // Filtrelenmiş fiyatları al
  const filteredPrices = prices.filter(price => {
    if (selectedChain !== 'all' && price.chainId !== parseInt(selectedChain)) {
      return false
    }
    if (selectedToken !== 'all' && !price.pair.includes(selectedToken)) {
      return false
    }
    return true
  })

  if (loading) {
    return (
      <div>
        <div>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div>
          <div>Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div>
        <h2>Live Oracle Prices</h2>
        <p>Real-time price feeds from Chainlink oracles</p>
        <div>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div>
          <label>Chain:</label>
          <select 
            value={selectedChain} 
            onChange={(e) => setSelectedChain(e.target.value)}
          >
            <option value="all">All Chains</option>
            <option value="1">Ethereum</option>
            <option value="137">Polygon</option>
            <option value="10">Optimism</option>
            <option value="42161">Arbitrum</option>
            <option value="8453">Base</option>
          </select>
        </div>
        <div>
          <label>Token:</label>
          <select 
            value={selectedToken} 
            onChange={(e) => setSelectedToken(e.target.value)}
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

      {/* Price Table */}
      <div>
        <table>
          <thead>
            <tr>
              <th>Chain</th>
              <th>Pair</th>
              <th>Price</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredPrices.map((price, index) => (
                <motion.tr
                  key={`${price.chainId}-${price.pair}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td>{getChainName(price.chainId)}</td>
                  <td>{price.pair}</td>
                  <td>${formatPrice(price.price, price.decimals)}</td>
                  <td>{new Date(price.timestamp * 1000).toLocaleTimeString()}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
} 