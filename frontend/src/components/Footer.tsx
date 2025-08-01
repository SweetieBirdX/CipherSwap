import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ padding: '40px 20px', backgroundColor: '#1E3A8A' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Quick Links - Ortalanmış */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: 'white' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Link 
              to="/swap" 
              style={{ 
                color: '#E8F2FF', 
                textDecoration: 'none', 
                fontSize: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#00D8BE';
                target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#E8F2FF';
                target.style.transform = 'translateY(0)';
              }}
            >
              Start Trading
            </Link>
            <Link 
              to="/docs" 
              style={{ 
                color: '#E8F2FF', 
                textDecoration: 'none', 
                fontSize: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#00D8BE';
                target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#E8F2FF';
                target.style.transform = 'translateY(0)';
              }}
            >
              Documentation
            </Link>
            <a 
              href="https://portal.1inch.dev/documentation/overview" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                color: '#E8F2FF', 
                textDecoration: 'none', 
                fontSize: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#00D8BE';
                target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#E8F2FF';
                target.style.transform = 'translateY(0)';
              }}
            >
              API Reference
            </a>
            <a 
              href="https://github.com/SweetieBirdX/CipherSwap" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                color: '#E8F2FF', 
                textDecoration: 'none', 
                fontSize: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#00D8BE';
                target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.color = '#E8F2FF';
                target.style.transform = 'translateY(0)';
              }}
            >
              Support
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #3B82F6', paddingTop: '20px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#E8F2FF', fontSize: '14px' }}>
              © 2025 CipherSwap &nbsp; All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a 
                href="#" 
                style={{ 
                  color: '#E8F2FF', 
                  textDecoration: 'none', 
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.color = '#00D8BE';
                  target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.color = '#E8F2FF';
                  target.style.transform = 'translateY(0)';
                }}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                style={{ 
                  color: '#E8F2FF', 
                  textDecoration: 'none', 
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.color = '#00D8BE';
                  target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.color = '#E8F2FF';
                  target.style.transform = 'translateY(0)';
                }}
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                style={{ 
                  color: '#E8F2FF', 
                  textDecoration: 'none', 
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.color = '#00D8BE';
                  target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.color = '#E8F2FF';
                  target.style.transform = 'translateY(0)';
                }}
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 