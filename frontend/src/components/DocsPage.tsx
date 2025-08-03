import React from 'react';
import { Link } from 'react-router-dom';

const DocsPage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4169E1 0%, #5B7CF7 50%, #6495ED 100%)',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

       {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 20px)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Hero Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 'clamp(40px, 8vw, 60px)',
          color: 'white'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(32px, 6vw, 48px)', 
            fontWeight: 'bold', 
            marginBottom: 'clamp(16px, 3vw, 24px)',
            color: 'white',
            lineHeight: '1.2',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            CipherSwap{' '}
            <span style={{ color: '#E8F2FF' }}>
              Documentation
            </span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(16px, 3vw, 20px)', 
            lineHeight: '1.6', 
            maxWidth: 'min(800px, 90vw)', 
            margin: '0 auto', 
            color: '#E8F2FF',
            marginBottom: 'clamp(24px, 4vw, 32px)',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }}>
            Advanced MEV protection, intelligent split routing, and zero slippage execution DeFi OTC swap platform
          </p>
        </div>

                 {/* Table of Contents */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: 'clamp(24px, 4vw, 32px)',
          marginBottom: 'clamp(40px, 8vw, 60px)',
          boxShadow: '0 20px 40px rgba(44, 62, 128, 0.3), 0 8px 20px rgba(65, 105, 225, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(24px, 4vw, 32px)', 
            fontWeight: 'bold', 
            color: '#2C3E80',
            marginBottom: 'clamp(16px, 3vw, 24px)',
            textAlign: 'center'
          }}>
            Table of Contents
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'clamp(12px, 2vw, 16px)'
          }}>
            {[
              { id: 'features', title: '🔧 Core Features', color: '#4169E1' },
              { id: 'api', title: '📡 API Endpoints', color: '#5B7CF7' },
              { id: 'security', title: '🛡️ Security Features', color: '#6495ED' }
            ].map((item) => (
             <button 
                key={item.id}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: 'clamp(12px, 2vw, 16px)',
                  backgroundColor: 'white',
                  border: `2px solid ${item.color}`,
                  borderRadius: '12px',
                  color: item.color,
                  fontWeight: '600',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  boxShadow: '0 4px 15px rgba(65, 105, 225, 0.1)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = item.color;
                  target.style.color = 'white';
                  target.style.transform = 'translateY(-3px)';
                  target.style.boxShadow = `0 8px 25px rgba(65, 105, 225, 0.3)`;
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = 'white';
                  target.style.color = item.color;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 4px 15px rgba(65, 105, 225, 0.1)';
                }}
              >
                {item.title}
             </button>
            ))}
           </div>
         </div>

        {/* Core Features */}
        <section id="features" style={{ marginBottom: 'clamp(40px, 8vw, 60px)' }}>
          <h2 style={{ 
            fontSize: 'clamp(28px, 5vw, 36px)', 
            fontWeight: 'bold', 
            color: 'white',
            marginBottom: 'clamp(24px, 4vw, 32px)',
            textAlign: 'center',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            🔧 Core Features
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(20px, 4vw, 30px)'
          }}>
            {[
              {
                title: '1. MEV Protection',
                features: [
                  'Flashbots Bundle support',
                  'Fusion+ escrow integration',
                  'Private transaction execution',
                  'Bundle validation and submission',
                  'Fallback mechanisms for security'
                ],
                color: '#4169E1'
              },
              {
                title: '2. Intelligent Split Routing',
                features: [
                  'Multi-DEX routing',
                  'Gas optimization',
                  'Slippage minimization',
                  'Real-time market analysis',
                  'Dynamic route selection'
                ],
                color: '#5B7CF7'
              },
              {
                title: '3. Slippage Control',
                features: [
                  'Dynamic tolerance calculation',
                  'Market-based adjustments',
                  'Time-based optimizations',
                  'Chain-specific configurations',
                  'Risk assessment system'
                ],
                color: '#6495ED'
              },
              {
                title: '4. RFQ (Request for Quote) System',
                features: [
                  'Resolver bot management',
                  'Quote comparison and validation',
                  'Execution tracking',
                  'Analytics and monitoring',
                  'Whitelist-based authorization'
                ],
                color: '#5390FE'
              },
              {
                title: '5. Oracle Integration',
                features: [
                  'Chainlink price feeds',
                  'Multi-chain support',
                  'Real-time price updates',
                  'Health monitoring',
                  'Fallback mechanisms'
                ],
                color: '#4A90E2'
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: 'clamp(20px, 4vw, 30px)',
                  boxShadow: '0 15px 35px rgba(44, 62, 128, 0.2), 0 8px 20px rgba(65, 105, 225, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.transform = 'translateY(-5px)';
                  target.style.boxShadow = '0 20px 45px rgba(44, 62, 128, 0.3), 0 12px 25px rgba(65, 105, 225, 0.25)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 15px 35px rgba(44, 62, 128, 0.2), 0 8px 20px rgba(65, 105, 225, 0.15)';
                }}
              >
                <h3 style={{ 
                  fontSize: 'clamp(18px, 3vw, 22px)', 
                  fontWeight: 'bold', 
                  color: feature.color,
                  marginBottom: 'clamp(12px, 2vw, 16px)'
                }}>
                  {feature.title}
                </h3>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      color: '#2C3E80',
                      lineHeight: '1.5'
                    }}>
                      <span style={{ 
                        color: '#10B981', 
                        marginRight: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </span>
                      {item}
                </li>
                  ))}
              </ul>
            </div>
            ))}
          </div>
        </section>

        {/* API Endpoints */}
        <section id="api" style={{ marginBottom: 'clamp(40px, 8vw, 60px)' }}>
          <h2 style={{ 
            fontSize: 'clamp(28px, 5vw, 36px)', 
            fontWeight: 'bold', 
            color: 'white',
            marginBottom: 'clamp(24px, 4vw, 32px)',
            textAlign: 'center',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            📡 API Endpoints
          </h2>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: 'clamp(24px, 4vw, 32px)',
            boxShadow: '0 20px 40px rgba(44, 62, 128, 0.3), 0 8px 20px rgba(65, 105, 225, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(20px, 3vw, 24px)', 
              fontWeight: 'bold', 
              color: '#2C3E80',
              marginBottom: 'clamp(16px, 3vw, 24px)',
              textAlign: 'center'
            }}>
              Core Services (49+ endpoints)
            </h3>
            
            {[
              {
                title: 'Quote & Swap',
                endpoints: [
                  { method: 'POST', path: '/api/quote', desc: 'Get swap quote' },
                  { method: 'POST', path: '/api/swap', desc: 'Execute swap' },
                  { method: 'POST', path: '/api/swap/fusion', desc: 'Fusion+ swap' },
                  { method: 'GET', path: '/api/swap/status/:id', desc: 'Check status' }
                ]
              },
              {
                title: 'Real-Time Features',
                endpoints: [
                  { method: 'POST', path: '/api/real-time-swap/analyze', desc: 'Market analysis' },
                  { method: 'POST', path: '/api/real-time-swap/execute', desc: 'Optimized execution' },
                  { method: 'GET', path: '/api/real-time-swap/market-status', desc: 'Market conditions' }
                ]
              },
              {
                title: 'MEV Protection',
                endpoints: [
                  { method: 'POST', path: '/api/swap/flashbots', desc: 'Flashbots bundle' },
                  { method: 'POST', path: '/api/swap/simulate', desc: 'Transaction simulation' },
                  { method: 'GET', path: '/api/swap/mev-status', desc: 'MEV protection status' }
                ]
              },
              {
                title: 'RFQ System',
                endpoints: [
                  { method: 'POST', path: '/api/rfq/request', desc: 'Create RFQ' },
                  { method: 'POST', path: '/api/rfq/quote', desc: 'Submit quote' },
                  { method: 'GET', path: '/api/rfq/stats', desc: 'RFQ analytics' }
                ]
              },
              {
                title: 'Oracle & Price Data',
                endpoints: [
                  { method: 'GET', path: '/api/oracle/price/:chainId/:pair', desc: 'Get price' },
                  { method: 'POST', path: '/api/oracle/price/batch', desc: 'Batch prices' },
                  { method: 'GET', path: '/api/oracle/feeds/:chainId', desc: 'Available feeds' }
                ]
              },
              {
                title: 'Slippage Management',
                endpoints: [
                  { method: 'GET', path: '/api/slippage/config', desc: 'Get configuration' },
                  { method: 'PUT', path: '/api/slippage/config', desc: 'Update settings' },
                  { method: 'POST', path: '/api/slippage/calculate', desc: 'Calculate optimal' }
                ]
              }
            ].map((section, sectionIndex) => (
              <div key={sectionIndex} style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
                <h4 style={{ 
                  fontSize: 'clamp(16px, 3vw, 18px)', 
                  fontWeight: '600', 
                  color: '#4169E1',
                  marginBottom: 'clamp(8px, 2vw, 12px)'
                }}>
                  {section.title}
                </h4>
                <div style={{
                  backgroundColor: 'rgba(65, 105, 225, 0.05)',
                  borderRadius: '12px',
                  padding: 'clamp(16px, 3vw, 20px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {section.endpoints.map((endpoint, endpointIndex) => (
                    <div key={endpointIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(65, 105, 225, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'translateX(4px)';
                      target.style.boxShadow = '0 4px 12px rgba(65, 105, 225, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = 'translateX(0)';
                      target.style.boxShadow = '0 2px 8px rgba(65, 105, 225, 0.1)';
                    }}
                    >
                      <span style={{
                        backgroundColor: endpoint.method === 'GET' ? '#3B82F6' : 
                                       endpoint.method === 'POST' ? '#10B981' : 
                                       endpoint.method === 'PUT' ? '#F59E0B' : '#EF4444',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        marginRight: '12px',
                        minWidth: '50px',
                        textAlign: 'center'
                      }}>
                        {endpoint.method}
                      </span>
                      <code style={{
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        color: '#2C3E80',
                        fontWeight: '500',
                        marginRight: '12px'
                      }}>
                        {endpoint.path}
                      </code>
                      <span style={{
                        color: '#6B7280',
                        fontSize: '14px'
                      }}>
                        {endpoint.desc}
                      </span>
                </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Features */}
        <section id="security" style={{ marginBottom: 'clamp(40px, 8vw, 60px)' }}>
          <h2 style={{ 
            fontSize: 'clamp(28px, 5vw, 36px)', 
            fontWeight: 'bold', 
            color: 'white',
            marginBottom: 'clamp(24px, 4vw, 32px)',
            textAlign: 'center',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            🛡️ Security Features
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(20px, 4vw, 30px)'
          }}>
            {[
              {
                title: 'MEV Protection',
                features: [
                  'Flashbots bundle submission',
                  'Private mempool usage',
                  'Pre-execution bundle simulation',
                  'Fallback mechanisms',
                  'Gas optimization'
                ],
                color: '#EF4444'
              },
              {
                title: 'API Security',
                features: [
                  'Rate limiting (configurable)',
                  'CORS policy',
                  'Helmet security headers',
                  'Input validation and sanitization',
                  'Error handling middleware'
                ],
                color: '#10B981'
              },
              {
                title: 'Wallet Security',
                features: [
                  'RainbowKit integration',
                  'Multi-chain support',
                  'Transaction signing validation',
                  'Gas estimation optimization'
                ],
                color: '#F59E0B'
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: 'clamp(20px, 4vw, 30px)',
                  boxShadow: '0 15px 35px rgba(44, 62, 128, 0.2), 0 8px 20px rgba(65, 105, 225, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.transform = 'translateY(-5px)';
                  target.style.boxShadow = '0 20px 45px rgba(44, 62, 128, 0.3), 0 12px 25px rgba(65, 105, 225, 0.25)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 15px 35px rgba(44, 62, 128, 0.2), 0 8px 20px rgba(65, 105, 225, 0.15)';
                }}
              >
                <h3 style={{ 
                  fontSize: 'clamp(18px, 3vw, 22px)', 
                  fontWeight: 'bold', 
                  color: feature.color,
                  marginBottom: 'clamp(12px, 2vw, 16px)'
                }}>
                  {feature.title}
                </h3>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      color: '#2C3E80',
                      lineHeight: '1.5'
                    }}>
                      <span style={{ 
                        color: '#10B981', 
                        marginRight: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </span>
                      {item}
                </li>
                  ))}
              </ul>
            </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #4169E1 0%, #5B7CF7 100%)',
          borderRadius: '20px',
          padding: 'clamp(32px, 6vw, 48px)',
          color: 'white',
          boxShadow: '0 25px 50px rgba(44, 62, 128, 0.4), 0 12px 25px rgba(65, 105, 225, 0.3)',
          marginBottom: 'clamp(40px, 8vw, 60px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ 
              fontSize: 'clamp(24px, 4vw, 32px)', 
              fontWeight: 'bold', 
              marginBottom: 'clamp(12px, 2vw, 16px)',
              color: 'white',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
              Get Started Now
            </h2>
            <p style={{ 
              fontSize: 'clamp(16px, 3vw, 18px)', 
              marginBottom: 'clamp(20px, 4vw, 24px)', 
              opacity: 0.9,
              color: '#E8F2FF',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}>
              Explore CipherSwap's powerful features and experience secure DeFi trading.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(12px, 2vw, 16px)',
              flexWrap: 'wrap'
            }}>
            <Link
              to="/swap"
                style={{
                  display: 'inline-block',
                  padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                  backgroundColor: 'white',
                  color: '#4169E1',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#E8F2FF';
                  target.style.color = '#2C3E80';
                  target.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.4)';
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
                Start Swapping
            </Link>
            <Link
              to="/prices"
                style={{
                  display: 'inline-block',
                  padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                  backgroundColor: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = 'white';
                  target.style.color = '#4169E1';
                  target.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = 'transparent';
                  target.style.color = 'white';
                  target.style.transform = 'translateY(0)';
                }}
              >
                View Prices
            </Link>
            </div>
          </div>
        </section>
      </div>

             {/* Footer */}
      <footer style={{
        backgroundColor: '#2C3E80',
        color: 'white',
        padding: 'clamp(24px, 4vw, 32px) clamp(16px, 4vw, 20px)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <p style={{
            color: '#94A3B8',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            margin: 0
          }}>
            © 2025 CipherSwap. All rights reserved.
          </p>
         </div>
       </footer>
    </div>
  );
};

export default DocsPage; 