import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: '#2C3E80' }}>
      {/* Logo - Sol Taraf */}
      <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img 
            src="/CipherSwap-nonbg.png" 
            alt="CipherSwap Logo" 
            style={{ width: '40px', height: '50px' }}
          />
        </Link>
        <Link to="/" style={{ fontSize: '28px', fontWeight: 'bold', color: '#00979B', textDecoration: 'none', fontFamily: "'Poppins', sans-serif" }}>
          CipherSwap
        </Link>
      </div>

      {/* Navigation Links - Sağ Taraf */}
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
        <Link 
          to="/prices" 
          style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'white', 
            textDecoration: 'none', 
            marginRight: '48px', 
            fontFamily: "'Inter', sans-serif", 
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.color = '#00D8BE';
            target.style.fontSize = '20px';
            target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.color = 'white';
            target.style.fontSize = '18px';
            target.style.transform = 'translateY(0)';
          }}
        >
          Live Prices
        </Link>
        <Link 
          to="/swap" 
          style={{ 
            fontSize: '18px', 
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
            target.style.fontSize = '20px';
            target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.color = 'white';
            target.style.fontSize = '18px';
            target.style.transform = 'translateY(0)';
          }}
        >
          Go App
        </Link>
      </div>
    </nav>
  );
}
