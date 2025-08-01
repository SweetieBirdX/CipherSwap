import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
         <footer className="relative z-10 bg-[#1e3a8a]/90 backdrop-blur-xl border-t border-[#1e40af]/50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                                 <div className="w-10 h-10 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-xl shadow-lg"></div>
                 <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-xl blur-sm opacity-50"></div>
              </div>
              <span className="text-2xl font-bold text-white">CipherSwap</span>
            </div>
            <p className="text-[#F8F9FC]/80 text-lg leading-relaxed max-w-md">
              Enterprise-grade OTC swaps with advanced MEV protection, intelligent split routing, 
              and zero slippage execution.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/swap" className="text-[#F8F9FC]/70 hover:text-white transition-colors duration-300">
                  Start Trading
                </Link>
              </li>
              <li>
                <a href="#" className="text-[#F8F9FC]/70 hover:text-white transition-colors duration-300">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-[#F8F9FC]/70 hover:text-white transition-colors duration-300">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-[#F8F9FC]/70 hover:text-white transition-colors duration-300">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
                         <div className="flex space-x-4">
               <a href="#" className="w-10 h-10 bg-[#1e3a8a]/30 rounded-lg flex items-center justify-center hover:bg-[#1e3a8a]/50 transition-all duration-300">
                 <span className="text-white">🐦</span>
               </a>
               <a href="#" className="w-10 h-10 bg-[#1e3a8a]/30 rounded-lg flex items-center justify-center hover:bg-[#1e3a8a]/50 transition-all duration-300">
                 <span className="text-white">📘</span>
               </a>
               <a href="#" className="w-10 h-10 bg-[#1e3a8a]/30 rounded-lg flex items-center justify-center hover:bg-[#1e3a8a]/50 transition-all duration-300">
                 <span className="text-white">💬</span>
               </a>
               <a href="#" className="w-10 h-10 bg-[#1e3a8a]/30 rounded-lg flex items-center justify-center hover:bg-[#1e3a8a]/50 transition-all duration-300">
                 <span className="text-white">📧</span>
               </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
                 <div className="mt-8 pt-8 border-t border-[#1e40af]/30">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#F8F9FC]/60 text-sm">
              © 2024 CipherSwap. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-[#F8F9FC]/60 hover:text-white text-sm transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-[#F8F9FC]/60 hover:text-white text-sm transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-[#F8F9FC]/60 hover:text-white text-sm transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 