import { motion } from 'framer-motion'
import Footer from './Footer'

export default function LivePricesPage() {
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
          Real-time cryptocurrency prices and market data. Track your favorite tokens 
          with live updates and comprehensive market information.
        </p>
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
          {/* Bitcoin Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ 
              padding: 'clamp(20px, 4vw, 30px)', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E8F2FF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#F7931A', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>₿</span>
              </div>
              <div>
                <h3 style={{ 
                  fontSize: 'clamp(18px, 3.5vw, 20px)', 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0' 
                }}>Bitcoin</h3>
                <p style={{ 
                  fontSize: 'clamp(12px, 2.5vw, 14px)', 
                  color: '#666', 
                  margin: 0 
                }}>BTC</p>
              </div>
            </div>
            <div style={{ 
              fontSize: 'clamp(24px, 5vw, 32px)', 
              fontWeight: 'bold', 
              color: '#4169E1', 
              marginBottom: '8px' 
            }}>
              $43,250.67
            </div>
            <div style={{ 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              color: '#10B981', 
              fontWeight: '600' 
            }}>
              +2.45% (24h)
            </div>
          </motion.div>

          {/* Ethereum Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ 
              padding: 'clamp(20px, 4vw, 30px)', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E8F2FF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#627EEA', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Ξ</span>
              </div>
              <div>
                <h3 style={{ 
                  fontSize: 'clamp(18px, 3.5vw, 20px)', 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0' 
                }}>Ethereum</h3>
                <p style={{ 
                  fontSize: 'clamp(12px, 2.5vw, 14px)', 
                  color: '#666', 
                  margin: 0 
                }}>ETH</p>
              </div>
            </div>
            <div style={{ 
              fontSize: 'clamp(24px, 5vw, 32px)', 
              fontWeight: 'bold', 
              color: '#4169E1', 
              marginBottom: '8px' 
            }}>
              $2,650.34
            </div>
            <div style={{ 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              color: '#10B981', 
              fontWeight: '600' 
            }}>
              +1.87% (24h)
            </div>
          </motion.div>

          {/* USDC Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ 
              padding: 'clamp(20px, 4vw, 30px)', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E8F2FF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#2775CA', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>$</span>
              </div>
              <div>
                <h3 style={{ 
                  fontSize: 'clamp(18px, 3.5vw, 20px)', 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0' 
                }}>USD Coin</h3>
                <p style={{ 
                  fontSize: 'clamp(12px, 2.5vw, 14px)', 
                  color: '#666', 
                  margin: 0 
                }}>USDC</p>
              </div>
            </div>
            <div style={{ 
              fontSize: 'clamp(24px, 5vw, 32px)', 
              fontWeight: 'bold', 
              color: '#4169E1', 
              marginBottom: '8px' 
            }}>
              $1.00
            </div>
            <div style={{ 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              color: '#10B981', 
              fontWeight: '600' 
            }}>
              +0.01% (24h)
            </div>
          </motion.div>

          {/* USDT Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ 
              padding: 'clamp(20px, 4vw, 30px)', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E8F2FF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#26A17B', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>₮</span>
              </div>
              <div>
                <h3 style={{ 
                  fontSize: 'clamp(18px, 3.5vw, 20px)', 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0' 
                }}>Tether</h3>
                <p style={{ 
                  fontSize: 'clamp(12px, 2.5vw, 14px)', 
                  color: '#666', 
                  margin: 0 
                }}>USDT</p>
              </div>
            </div>
            <div style={{ 
              fontSize: 'clamp(24px, 5vw, 32px)', 
              fontWeight: 'bold', 
              color: '#4169E1', 
              marginBottom: '8px' 
            }}>
              $1.00
            </div>
            <div style={{ 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              color: '#10B981', 
              fontWeight: '600' 
            }}>
              +0.02% (24h)
            </div>
          </motion.div>
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
            Market Overview
          </h2>
          <p style={{ 
            fontSize: 'clamp(16px, 3vw, 18px)', 
            lineHeight: '1.6', 
            color: '#666', 
            maxWidth: 'min(800px, 90vw)', 
            margin: '0 auto' 
          }}>
            Stay informed with real-time market data, price movements, and trading volumes. 
            Our comprehensive market overview helps you make informed trading decisions.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
} 