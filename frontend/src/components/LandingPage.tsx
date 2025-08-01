import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

export default function LandingPage() {
  return (
         <div className="min-h-screen w-full relative overflow-y-auto">
             {/* Animated Background */}
       <div className="absolute inset-0 bg-gradient-to-br from-[#2433FF] via-[#00C2D1] to-[#2433FF]">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
                 <motion.div
           animate={{ 
             y: [0, -20, 0],
             rotate: [0, 5, 0]
           }}
           transition={{ 
             duration: 6,
             repeat: Infinity,
             ease: "easeInOut"
           }}
           className="absolute top-20 left-10 w-32 h-32 bg-[#2433FF]/20 rounded-full blur-xl"
         />
         <motion.div
           animate={{ 
             y: [0, 20, 0],
             rotate: [0, -5, 0]
           }}
           transition={{ 
             duration: 8,
             repeat: Infinity,
             ease: "easeInOut"
           }}
           className="absolute top-40 right-20 w-24 h-24 bg-[#00C2D1]/20 rounded-full blur-xl"
         />
         <motion.div
           animate={{ 
             y: [0, -15, 0],
             x: [0, 10, 0]
           }}
           transition={{ 
             duration: 7,
             repeat: Infinity,
             ease: "easeInOut"
           }}
           className="absolute bottom-40 left-20 w-20 h-20 bg-[#2433FF]/15 rounded-full blur-xl"
         />
      </div>

                           {/* Navbar */}
        <Navbar />

             {/* Hero Section - Orta Mavi */}
       <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8 }}
         className="relative z-10 text-center px-6 py-32 bg-[#3b82f6]/20 backdrop-blur-sm"
       >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8"
        >
                     <h1 className="text-7xl md:text-8xl font-bold text-white mb-8 leading-tight">
             Secure{' '}
             <span className="text-white">
               DeFi
             </span>{' '}
             Trading
           </h1>
        </motion.div>
        
                 <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 0.8 }}
           className="text-xl md:text-2xl text-[#F8F9FC]/90 mb-12 max-w-4xl mx-auto leading-relaxed"
         >
           Enterprise-grade OTC swaps with advanced MEV protection, intelligent split routing, 
           and zero slippage execution. Built for institutional traders and DAOs.
         </motion.p>

        
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
                     <Link
             to="/swap"
             className="px-10 py-4 bg-gradient-to-r from-[#2433FF] to-[#00C2D1] text-white rounded-2xl text-xl font-semibold hover:from-[#1a2bff] hover:to-[#00a8b8] transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
           >
             Start Trading
           </Link>
           <button className="px-10 py-4 border-2 border-[#00C2D1] text-[#F8F9FC] rounded-2xl text-xl font-semibold hover:border-[#2433FF] hover:text-[#2433FF] transition-all duration-300">
             Learn More
           </button>
        </motion.div>
      </motion.div>

                           {/* Features Grid - Açık Mavi */}
        <div className="relative z-10 px-6 py-20 bg-[#60a5fa]/10 backdrop-blur-sm">
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1.1, duration: 0.8 }}
           className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
         >
                     <motion.div 
             whileHover={{ y: -10, scale: 1.02 }}
             className="group bg-gradient-to-br from-[#2433FF]/20 to-[#00C2D1]/20 backdrop-blur-xl rounded-2xl p-8 border border-[#00C2D1]/30 hover:border-[#2433FF]/50 transition-all duration-300"
           >
             <div className="w-16 h-16 bg-gradient-to-br from-[#2433FF]/30 to-[#00C2D1]/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
               <span className="text-3xl">🛡️</span>
             </div>
             <h3 className="text-2xl font-bold text-[#F8F9FC] mb-4">MEV Protection</h3>
             <p className="text-[#F8F9FC]/80 text-lg leading-relaxed">
               Advanced protection against front-running and sandwich attacks using Flashbots and sophisticated routing algorithms.
             </p>
           </motion.div>

           <motion.div 
             whileHover={{ y: -10, scale: 1.02 }}
             className="group bg-gradient-to-br from-[#2433FF]/20 to-[#00C2D1]/20 backdrop-blur-xl rounded-2xl p-8 border border-[#00C2D1]/30 hover:border-[#2433FF]/50 transition-all duration-300"
           >
             <div className="w-16 h-16 bg-gradient-to-br from-[#00C2D1]/30 to-[#2433FF]/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
               <span className="text-3xl">⚡</span>
             </div>
             <h3 className="text-2xl font-bold text-[#F8F9FC] mb-4">Split Routing</h3>
             <p className="text-[#F8F9FC]/80 text-lg leading-relaxed">
               Intelligent routing across multiple DEXs and chains for optimal execution and minimal price impact.
             </p>
           </motion.div>

           <motion.div 
             whileHover={{ y: -10, scale: 1.02 }}
             className="group bg-gradient-to-br from-[#2433FF]/20 to-[#00C2D1]/20 backdrop-blur-xl rounded-2xl p-8 border border-[#00C2D1]/30 hover:border-[#2433FF]/50 transition-all duration-300"
           >
             <div className="w-16 h-16 bg-gradient-to-br from-[#2433FF]/30 to-[#00C2D1]/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
               <span className="text-3xl">🔒</span>
             </div>
             <h3 className="text-2xl font-bold text-[#F8F9FC] mb-4">Zero Slippage</h3>
             <p className="text-[#F8F9FC]/80 text-lg leading-relaxed">
               Smart order routing and execution ensures minimal slippage even for large institutional trades.
             </p>
           </motion.div>
                 </motion.div>
       </div>

                             

               {/* Stats Section - En Açık Mavi */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="relative z-10 text-center px-6 py-20 bg-[#dbeafe]/20 backdrop-blur-sm"
        >
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
           <div className="text-center group">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                               className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300"
              >
                $50M+
             </motion.div>
                           <div className="text-[#1e3a8a] text-lg font-medium">Total Volume</div>
            </div>
            <div className="text-center group">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.7, type: "spring", stiffness: 200 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300"
              >
                99.9%
              </motion.div>
              <div className="text-[#1e3a8a] text-lg font-medium">Success Rate</div>
            </div>
            <div className="text-center group">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300"
              >
                0.1%
              </motion.div>
              <div className="text-[#1e3a8a] text-lg font-medium">Avg Slippage</div>
            </div>
            <div className="text-center group">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.9, type: "spring", stiffness: 200 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300"
              >
                24/7
              </motion.div>
              <div className="text-[#1e3a8a] text-lg font-medium">Uptime</div>
           </div>
         </div>
       </motion.div>

       {/* Footer */}
       <Footer />
     </div>
   )
} 