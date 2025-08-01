import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
         <nav className="relative z-10 flex justify-between items-center p-6">
       {/* Logo */}
       <div className="flex items-center space-x-3">
         <div className="relative">
           <div className="w-10 h-10 bg-gradient-to-r from-[#2433FF] to-[#00C2D1] rounded-xl shadow-lg"></div>
           <div className="absolute inset-0 bg-gradient-to-r from-[#2433FF] to-[#00C2D1] rounded-xl blur-sm opacity-50"></div>
         </div>
                            <Link to="/" className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-wide hover:text-[#00C2D1] transition-colors duration-300 cursor-pointer">
            CipherSwap
          </Link>
       </div>
       
               {/* Navigation Links */}
        <div className="flex items-center">
          <Link
            to="/prices"
            className="text-white hover:text-[#00C2D1] transition-colors duration-300 font-medium"
          >
            Live Prices
          </Link>
          <br/>
          <Link
            to="/swap"
            className="px-6 py-3 bg-gradient-to-r from-[#2433FF] to-[#00C2D1] text-white rounded-xl font-semibold hover:from-[#1a2bff] hover:to-[#00a8b8] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Go App
          </Link>
        </div>
    </nav>
  )
} 