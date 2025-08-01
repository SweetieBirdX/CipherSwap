import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ 
      padding: 'clamp(30px, 6vw, 40px) clamp(16px, 4vw, 20px)', 
      backgroundColor: '#1E3A8A' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Quick Links - Ortalanmış */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 'clamp(30px, 6vw, 40px)' 
        }}>
          <h4 style={{ 
            fontSize: 'clamp(18px, 4vw, 20px)', 
            fontWeight: 'bold', 
            marginBottom: 'clamp(16px, 3vw, 20px)', 
            color: 'white' 
          }}>Quick Links</h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 'clamp(8px, 2vw, 12px)'
          }}>
            <Link
              to="/swap"
              style={{
                color: '#E8F2FF',
                textDecoration: 'none',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
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
              to="/prices"
              style={{
                color: '#E8F2FF',
                textDecoration: 'none',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
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
              Live Prices
            </Link>
            <Link
              to="/docs"
              style={{
                color: '#E8F2FF',
                textDecoration: 'none',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
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
            <Link
              to="/support"
              style={{
                color: '#E8F2FF',
                textDecoration: 'none',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
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
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: '1px solid #3B82F6', 
          paddingTop: 'clamp(16px, 3vw, 20px)', 
          width: '100%' 
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 'clamp(12px, 2vw, 16px)',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <p style={{ 
              color: '#E8F2FF', 
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              margin: 0
            }}>
              © 2025 CipherSwap &nbsp; All rights reserved.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(12px, 3vw, 20px)',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <a
                href="#"
                style={{
                  color: '#E8F2FF',
                  textDecoration: 'none',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
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
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
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
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
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