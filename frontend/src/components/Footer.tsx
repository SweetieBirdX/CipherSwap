import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Quick Links - Ortalanmış */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Link to="/swap" style={{ color: '#333', textDecoration: 'none', fontSize: '16px' }}>
              Start Trading
            </Link>
            <Link to="/docs" style={{ color: '#333', textDecoration: 'none', fontSize: '16px' }}>
              Documentation
            </Link>
            <a href="https://portal.1inch.dev/documentation/overview" target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'none', fontSize: '16px' }}>
              API Reference
            </a>
            <a href="https://github.com/SweetieBirdX/CipherSwap" target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'none', fontSize: '16px' }}>
              Support
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              © 2025 CipherSwap &nbsp; All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                Privacy Policy
              </a>
              <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                Terms of Service
              </a>
              <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 