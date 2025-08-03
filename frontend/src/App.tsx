import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import SwapApp from './components/SwapApp'
import LivePricesPage from './components/LivePricesPage'
import DocsPage from './components/DocsPage'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/swap" element={<SwapApp />} />
          <Route path="/prices" element={<LivePricesPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
