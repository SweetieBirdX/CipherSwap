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
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    icon: 'Ξ',
    color: '#627EEA'
  },
  { 
    chainId: 1, 
    pair: 'BTC/USD', 
    symbol: 'BTC',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    icon: '₿',
    color: '#F7931A'
  },
  { 
    chainId: 1, 
    pair: 'USDC/USD', 
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    icon: '$',
    color: '#2775CA'
  },
  { 
    chainId: 1, 
    pair: 'USDT/USD', 
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    icon: '₮',
    color: '#26A17B'
  },
  { 
    chainId: 1, 
    pair: 'DAI/USD', 
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    icon: '◈',
    color: '#F5AC37'
  },
  { 
    chainId: 1, 
    pair: 'LINK/USD', 
    symbol: 'LINK',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    icon: '🔗',
    color: '#2A5ADA'
  },
  { 
    chainId: 1, 
    pair: 'UNI/USD', 
    symbol: 'UNI',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    icon: '🦄',
    color: '#FF007A'
  },
  { 
    chainId: 1, 
    pair: 'AAVE/USD', 
    symbol: 'AAVE',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    icon: '⚡',
    color: '#B6509E'
  },
  { 
    chainId: 1, 
    pair: 'CRV/USD', 
    symbol: 'CRV',
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    icon: '📈',
    color: '#D53369'
  },
  { 
    chainId: 1, 
    pair: 'MKR/USD', 
    symbol: 'MKR',
    address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    icon: '🏛️',
    color: '#1AAB9B'
  },
  { 
    chainId: 1, 
    pair: 'SNX/USD', 
    symbol: 'SNX',
    address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    icon: '⚖️',
    color: '#00D1FF'
  },
  { 
    chainId: 1, 
    pair: 'COMP/USD', 
    symbol: 'COMP',
    address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    icon: '🏦',
    color: '#00D5FF'
  },
  { 
    chainId: 1, 
    pair: 'YFI/USD', 
    symbol: 'YFI',
    address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad9eC',
    icon: '🎯',
    color: '#006AE3'
  },
  { 
    chainId: 1, 
    pair: 'BAL/USD', 
    symbol: 'BAL',
    address: '0xba100000625a3754423978a60c9317c58a424e3D',
    icon: '⚖️',
    color: '#E3E3E3'
  },
  { 
    chainId: 1, 
    pair: 'SUSHI/USD', 
    symbol: 'SUSHI',
    address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
    icon: '🍣',
    color: '#FA52A0'
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
            description: `${token.pair} Price Feed (1inch)`,
            icon: token.icon,
            color: token.color
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
            <option value="LINK">LINK</option>
            <option value="UNI">UNI</option>
            <option value="AAVE">AAVE</option>
            <option value="CRV">CRV</option>
            <option value="MKR">MKR</option>
            <option value="SNX">SNX</option>
            <option value="COMP">COMP</option>
            <option value="YFI">YFI</option>
            <option value="BAL">BAL</option>
            <option value="SUSHI">SUSHI</option>
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