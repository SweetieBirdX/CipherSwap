import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px' }}>
          Secure{' '}
          <span style={{ color: 'black' }}>
            DeFi
          </span>{' '}
          Trading
        </h1>
        
        <p style={{ fontSize: '20px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto', color: '#666', marginBottom: '32px' }}>
          Enterprise-grade OTC swaps with advanced MEV protection, intelligent split routing, 
          and zero slippage execution. Built for institutional traders and DAOs.
        </p>

        <Link to="/docs" style={{ 
          display: 'inline-block', 
          padding: '12px 24px', 
          backgroundColor: '#2433FF', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          Learn More
        </Link>
      </div>

      {/* Features Grid */}
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          <div style={{ padding: '30px', border: '1px solid #eee', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              🛡️ MEV Protection
            </h3>
            <p style={{ lineHeight: '1.6', color: '#666' }}>
              Advanced protection against front-running and sandwich attacks using Flashbots and sophisticated routing algorithms.
            </p>
          </div>

          <div style={{ padding: '30px', border: '1px solid #eee', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              ⚡ Split Routing
            </h3>
            <p style={{ lineHeight: '1.6', color: '#666' }}>
              Intelligent routing across multiple DEXs and chains for optimal execution and minimal price impact.
            </p>
          </div>

          <div style={{ padding: '30px', border: '1px solid #eee', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              🔒 Zero Slippage
            </h3>
            <p style={{ lineHeight: '1.6', color: '#666' }}>
              Smart order routing and execution ensures minimal slippage even for large institutional trades.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '8px' }}>$50M+</div>
            <div style={{ fontSize: '16px', color: '#666' }}>Total Volume</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '8px' }}>99.9%</div>
            <div style={{ fontSize: '16px', color: '#666' }}>Success Rate</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '8px' }}>0.1%</div>
            <div style={{ fontSize: '16px', color: '#666' }}>Avg Slippage</div>
          </div>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', marginBottom: '8px' }}>24/7</div>
            <div style={{ fontSize: '16px', color: '#666' }}>Uptime</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
} 