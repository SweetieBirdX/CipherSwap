import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: 'white' }}>
      {/* Logo - Sol Taraf */}
      <div style={{ marginLeft: '16px' }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'black', textDecoration: 'none' }}>
          CipherSwap
        </Link>
      </div>

      {/* Navigation Links - Sağ Taraf */}
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
        <Link to="/prices" style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', textDecoration: 'none', marginRight: '48px' }}>
          Live Prices
        </Link>
        <Link to="/swap" style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', textDecoration: 'none' }}>
          Go App
        </Link>
      </div>
    </nav>
  );
}
