import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import SwapApp from './components/SwapApp'
import LivePricesPage from './components/LivePricesPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#2433FF] via-[#00C2D1] to-[#2433FF] overflow-y-auto">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/swap" element={<SwapApp />} />
          <Route path="/prices" element={<LivePricesPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
