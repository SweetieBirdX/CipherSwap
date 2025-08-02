import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OracleService } from '../services/oracleService'
import { OneInchSpotPriceService } from '../services/oneInchSpotPriceService'
import type { OraclePrice } from '../types/oracle'

interface LiveOracleTableProps {
  className?: string
}

// Popular tokens with 1inch addresses
const POPULAR_TOKENS = [
  { 
    chainId: 1, 
    pair: 'ETH/USD', 
    symbol: 'ETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  { 
    chainId: 1, 
    pair: 'BTC/USD', 
    symbol: 'BTC',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  },
  { 
    chainId: 1, 
    pair: 'USDC/USD', 
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  },
  { 
    chainId: 1, 
    pair: 'USDT/USD', 
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
]

export default function LiveOracleTable({ className = '' }: LiveOracleTableProps) {
  const [prices, setPrices] = useState<OraclePrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [selectedToken, setSelectedToken] = useState<string>('all')

  // Update prices using 1inch Spot Price API
  const updatePrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const addresses = POPULAR_TOKENS.map(token => token.address);
      console.log('Fetching prices for addresses:', addresses);
      
      const response = await OneInchSpotPriceService.getMultipleSpotPrices(addresses);
      
      console.log('1inch API response:', response);
      
      if (response.success && response.data.prices) {
        // Convert 1inch data to frontend format
        const formattedPrices = response.data.prices.map((priceData, index) => {
          const token = POPULAR_TOKENS[index];
          return {
            chainId: token.chainId,
            pair: token.pair,
            price: (priceData.price * Math.pow(10, 8)).toString(), // Convert to 8 decimals
            timestamp: Math.floor(priceData.timestamp / 1000),
            decimals: 8,
            feedAddress: priceData.address,
            description: `${token.pair} Price Feed (1inch)`
          }
        });
        
        console.log('Formatted prices:', formattedPrices);
        setPrices(formattedPrices);
        setLastUpdate(new Date());
        setError(null);
      } else {
        console.error('Invalid response from 1inch API:', response);
        setError('Failed to fetch prices from 1inch API - invalid response');
      }
    } catch (err: any) {
      console.error('1inch price fetch error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
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
        <p>Real-time price feeds from 1inch Spot Price API</p>
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