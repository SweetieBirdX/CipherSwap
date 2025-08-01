import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 20px',
      backgroundColor: '#2C3E80',
      position: 'relative'
    }}>
      {/* Logo - Sol Taraf */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img 
            src="/CipherSwap-nonbg.png" 
            alt="CipherSwap Logo" 
            style={{ width: '32px', height: '40px' }}
          />
        </Link>
        <Link to="/" style={{ 
          fontSize: 'clamp(20px, 4vw, 28px)', 
          fontWeight: 'bold', 
          color: '#00979B', 
          textDecoration: 'none', 
          fontFamily: "'Poppins', sans-serif" 
        }}>
          CipherSwap
        </Link>
      </div>

      {/* Mobile Menu Button */}
      {!isDesktop && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px', 
          cursor: 'pointer',
          padding: '8px',
          zIndex: 1000
        }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div style={{ 
            width: '25px', 
            height: '3px', 
            backgroundColor: 'white', 
            transition: 'all 0.3s ease',
            transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
          }}></div>
          <div style={{ 
            width: '25px', 
            height: '3px', 
            backgroundColor: 'white', 
            transition: 'all 0.3s ease',
            opacity: isMenuOpen ? '0' : '1'
          }}></div>
          <div style={{ 
            width: '25px', 
            height: '3px', 
            backgroundColor: 'white', 
            transition: 'all 0.3s ease',
            transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
          }}></div>
        </div>
      )}

      {/* Navigation Links - Desktop */}
      {isDesktop && (
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '32px'
        }}>
          <Link 
            to="/prices" 
            style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'white', 
              textDecoration: 'none', 
              fontFamily: "'Inter', sans-serif", 
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.color = '#00D8BE';
              target.style.fontSize = '18px';
              target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.color = 'white';
              target.style.fontSize = '16px';
              target.style.transform = 'translateY(0)';
            }}
          >
            Live Prices
          </Link>
          <Link 
            to="/swap" 
            style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'white', 
              textDecoration: 'none', 
              fontFamily: "'Inter', sans-serif", 
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.color = '#00D8BE';
              target.style.fontSize = '18px';
              target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.color = 'white';
              target.style.fontSize = '16px';
              target.style.transform = 'translateY(0)';
            }}
          >
            Go App
          </Link>
        </div>
      )}

      {/* Mobile Menu */}
      {!isDesktop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#2C3E80',
          display: isMenuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '32px',
          zIndex: 999
        }}>
          <Link 
            to="/prices" 
            style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: 'white', 
              textDecoration: 'none', 
              fontFamily: "'Inter', sans-serif", 
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            Live Prices
          </Link>
          <Link 
            to="/swap" 
            style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: 'white', 
              textDecoration: 'none', 
              fontFamily: "'Inter', sans-serif", 
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            Go App
          </Link>
        </div>
      )}
    </nav>
  );
}
