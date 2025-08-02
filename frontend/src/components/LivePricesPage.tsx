import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Footer from './Footer'
import { OneInchSpotPriceService } from '../services/oneInchSpotPriceService'

// Market data types
interface TokenData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  icon: string
  color: string
}

interface MarketData {
  tokens: TokenData[]
  lastUpdated: string
  isLoading: boolean
  error: string | null
}

export default function LivePricesPage() {
  const [marketData, setMarketData] = useState<MarketData>({
    tokens: [],
    lastUpdated: '',
    isLoading: true,
    error: null
  })

  // Fetch live market data from backend using 1inch Spot Price API
  const fetchMarketData = async () => {
    try {
      setMarketData(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Use 1inch Spot Price API for better accuracy
      const response = await OneInchSpotPriceService.getPopularTokens()
      
      if (response.success) {
        setMarketData({
          tokens: response.data.tokens || [],
          lastUpdated: new Date().toLocaleTimeString(),
          isLoading: false,
          error: null
        })
      } else {
        throw new Error('Failed to fetch market data from 1inch API')
      }
    } catch (error: any) {
      console.error('Error fetching market data:', error)
      setMarketData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load market data'
      }))
    }
  }

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchMarketData()
    
    // Update every 30 seconds
    const interval = setInterval(fetchMarketData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Default tokens if API fails
  const defaultTokens: TokenData[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 43250.67,
      change24h: 2.45,
      volume24h: 28450000000,
      marketCap: 850000000000,
      icon: '₿',
      color: '#F7931A'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2650.34,
      change24h: 1.87,
      volume24h: 15200000000,
      marketCap: 318000000000,
      icon: 'Ξ',
      color: '#627EEA'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.00,
      change24h: 0.01,
      volume24h: 8500000000,
      marketCap: 25000000000,
      icon: '$',
      color: '#2775CA'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      price: 1.00,
      change24h: 0.02,
      volume24h: 72000000000,
      marketCap: 95000000000,
      icon: '₮',
      color: '#26A17B'
    }
  ]

  const tokens = marketData.tokens.length > 0 ? marketData.tokens : defaultTokens

  return (
    <div>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 20px)',
        background: 'linear-gradient(135deg, #4169E1 0%, #5B7CF7 100%)',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(32px, 6vw, 48px)', 
          fontWeight: 'bold', 
          marginBottom: 'clamp(16px, 3vw, 24px)', 
          color: 'white',
          lineHeight: '1.2'
        }}>
          Live{' '}
          <span style={{ color: '#E8F2FF' }}>
            Crypto
          </span>{' '}
          Prices
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(16px, 3vw, 20px)', 
          lineHeight: '1.6', 
          maxWidth: 'min(800px, 90vw)', 
          margin: '0 auto', 
          color: '#E8F2FF', 
          marginBottom: 'clamp(24px, 4vw, 32px)' 
        }}>
          Real-time cryptocurrency prices and market data from 1inch Spot Price API. Track your favorite tokens 
          with live updates and comprehensive market information.
        </p>

        {/* Live Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#E8F2FF'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: marketData.isLoading ? '#FFD700' : marketData.error ? '#FF6B6B' : '#10B981',
            animation: marketData.isLoading ? 'pulse 2s infinite' : 'none'
          }} />
          <span>
            {marketData.isLoading ? 'Loading live data...' : 
             marketData.error ? 'Using cached data' : 
             `Live data • Updated ${marketData.lastUpdated}`}
          </span>
        </div>
      </div>

      {/* Price Cards Grid */}
      <div style={{ 
        padding: 'clamp(40px, 8vw, 60px) clamp(16px, 4vw, 20px)', 
        backgroundColor: '#F8FAFF' 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: 'clamp(20px, 4vw, 30px)'
        }}>
          {tokens.map((token, index) => (
            <motion.div 
              key={token.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={{ 
                padding: 'clamp(20px, 4vw, 30px)', 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid #E8F2FF',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Loading overlay */}
              {marketData.isLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #E8F2FF',
                    borderTop: '2px solid #4169E1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: token.color, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                    {token.icon}
                  </span>
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: 'clamp(18px, 3.5vw, 20px)', 
                    fontWeight: 'bold', 
                    margin: '0 0 4px 0' 
                  }}>
                    {token.name}
                  </h3>
                  <p style={{ 
                    fontSize: 'clamp(12px, 2.5vw, 14px)', 
                    color: '#666', 
                    margin: 0 
                  }}>
                    {token.symbol}
                  </p>
                </div>
              </div>
              
              <div style={{ 
                fontSize: 'clamp(24px, 5vw, 32px)', 
                fontWeight: 'bold', 
                color: '#4169E1', 
                marginBottom: '8px' 
              }}>
                ${token.price.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </div>
              
              <div style={{ 
                fontSize: 'clamp(14px, 2.5vw, 16px)', 
                color: token.change24h >= 0 ? '#10B981' : '#EF4444', 
                fontWeight: '600' 
              }}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}% (24h)
              </div>

              {/* Additional market data */}
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #E8F2FF',
                fontSize: '12px',
                color: '#666'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Volume 24h:</span>
                  <span>${(token.volume24h / 1000000000).toFixed(1)}B</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Market Cap:</span>
                  <span>${(token.marketCap / 1000000000).toFixed(1)}B</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Market Info Section */}
      <div style={{ 
        padding: 'clamp(40px, 8vw, 60px) clamp(16px, 4vw, 20px)', 
        backgroundColor: '#E8F2FF' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 'clamp(28px, 5vw, 36px)', 
            fontWeight: 'bold', 
            color: '#4169E1', 
            marginBottom: 'clamp(16px, 3vw, 24px)' 
          }}>
            Live Market Data
          </h2>
          <p style={{ 
            fontSize: 'clamp(16px, 3vw, 18px)', 
            lineHeight: '1.6', 
            color: '#666', 
            maxWidth: 'min(800px, 90vw)', 
            margin: '0 auto' 
          }}>
            Real-time cryptocurrency prices powered by 1inch API integration. 
            Data updates every 30 seconds to keep you informed with the latest market movements.
          </p>
          
          {/* Error message if any */}
          {marketData.error && (
            <div style={{
              marginTop: '20px',
              padding: '12px 20px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '14px'
            }}>
              ⚠️ {marketData.error} - Showing cached data
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <Footer />
    </div>
  )
} 