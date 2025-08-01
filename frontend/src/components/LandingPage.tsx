import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #4169E1 0%, #5B7CF7 100%)',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>
          Secure{' '}
          <span style={{ color: '#E8F2FF' }}>
            DeFi
          </span>{' '}
          Trading
        </h1>
        
        <p style={{ fontSize: '20px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto', color: '#E8F2FF', marginBottom: '32px' }}>
        Advanced DEX Swaps with advanced MEV protection, intelligent split routing, 
          and zero slippage execution. Built for DeFi traders.
        </p>

        <Link to="/docs" style={{ 
          display: 'inline-block', 
          padding: '12px 24px', 
          backgroundColor: 'white', 
          color: '#4169E1', 
          textDecoration: 'none', 
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
          cursor: 'pointer',
          transform: 'translateY(0)'
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = '#E8F2FF';
          target.style.color = '#2C3E80';
          target.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.4), 0 4px 15px rgba(65, 105, 225, 0.4)';
          target.style.transform = 'translateY(-3px)';
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = 'white';
          target.style.color = '#4169E1';
          target.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.3)';
          target.style.transform = 'translateY(0)';
        }}
        >
          Learn More
        </Link>
      </div>

      {/* Features Grid */}
      <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#6495ED' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          <div 
            style={{ 
              padding: '30px', 
              borderRadius: '12px', 
              backgroundColor: '#5390FE', 
              boxShadow: '0 10px 30px rgba(44, 62, 128, 0.8), 0 6px 20px rgba(65, 105, 225, 0.7)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.backgroundColor = '#4169E1';
              target.style.boxShadow = '0 15px 40px rgba(44, 62, 128, 0.9), 0 8px 25px rgba(65, 105, 225, 0.8)';
              target.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.backgroundColor = '#5390FE';
              target.style.boxShadow = '0 10px 30px rgba(44, 62, 128, 0.8), 0 6px 20px rgba(65, 105, 225, 0.7)';
              target.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>
              🛡️ MEV Protection <br /> + Limit Order
            </h3>
            <p style={{ lineHeight: '1.6', color: '#E8F2FF' }}>
              Advanced protection against front-running and sandwich attacks using Flashbots and sophisticated routing algorithms.
            </p>
          </div>

          <div 
            style={{ 
              padding: '30px', 
              borderRadius: '12px', 
              backgroundColor: '#5390FE', 
              boxShadow: '0 10px 30px rgba(44, 62, 128, 0.8), 0 6px 20px rgba(65, 105, 225, 0.7)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.backgroundColor = '#4169E1';
              target.style.boxShadow = '0 15px 40px rgba(44, 62, 128, 0.9), 0 8px 25px rgba(65, 105, 225, 0.8)';
              target.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.backgroundColor = '#5390FE';
              target.style.boxShadow = '0 10px 30px rgba(44, 62, 128, 0.8), 0 6px 20px rgba(65, 105, 225, 0.7)';
              target.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>
              ⚡ Split Routing + APIs
            </h3>
            <p style={{ lineHeight: '1.6', color: '#E8F2FF' }}>
            Smart routing via 1inch and chains for optimal execution and minimal price impact.
            </p>
          </div>

          <div 
            style={{ 
              padding: '30px', 
              borderRadius: '12px', 
              backgroundColor: '#5390FE', 
              boxShadow: '0 10px 30px rgba(44, 62, 128, 0.8), 0 6px 20px rgba(65, 105, 225, 0.7)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.backgroundColor = '#4169E1';
              target.style.boxShadow = '0 15px 40px rgba(44, 62, 128, 0.9), 0 8px 25px rgba(65, 105, 225, 0.8)';
              target.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.backgroundColor = '#5390FE';
              target.style.boxShadow = '0 10px 30px rgba(44, 62, 128, 0.8), 0 6px 20px rgba(65, 105, 225, 0.7)';
              target.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>
              🔒 Zero Slippage
            </h3>
            <p style={{ lineHeight: '1.6', color: '#E8F2FF' }}>
              Smart order routing and execution ensures minimal slippage even for large institutional trades.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ padding: '60px 20px', backgroundColor: '#93C5FD' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '40px'
        }}>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4169E1', marginBottom: '8px' }}>Live on</div>
            <div style={{ fontSize: '20px', color: '#666' }}>Ethereum Testnet</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4169E1', marginBottom: '8px' }}>Flashbots</div>
            <div style={{ fontSize: '20px', color: '#666' }}>Protected</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4169E1', marginBottom: '8px' }}>1inch</div>
            <div style={{ fontSize: '20px', color: '#666' }}>Powered</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4169E1', marginBottom: '8px' }}>Multi-Chain</div>
            <div style={{ fontSize: '20px', color: '#666' }}>Support</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
} 