import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
          className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
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
          className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
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
          className="absolute bottom-40 left-20 w-20 h-20 bg-green-500/10 rounded-full blur-xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur-sm opacity-50"></div>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            CipherSwap
          </span>
        </div>
        <Link
          to="/swap"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Go App
        </Link>
      </header>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 py-32"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Secure{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              DeFi
            </span>{' '}
            Trading
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Enterprise-grade OTC swaps with advanced MEV protection, intelligent split routing, 
          and zero slippage execution. Built for institutional traders and DAOs.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/swap"
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl text-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            Start Trading
          </Link>
          <button className="px-10 py-4 border-2 border-gray-600 text-gray-300 rounded-2xl text-xl font-semibold hover:border-blue-500 hover:text-blue-400 transition-all duration-300">
            Learn More
          </button>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <div className="relative z-10 px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">🛡️</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">MEV Protection</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Advanced protection against front-running and sandwich attacks using Flashbots and sophisticated routing algorithms.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Split Routing</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Intelligent routing across multiple DEXs and chains for optimal execution and minimal price impact.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Zero Slippage</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Smart order routing and execution ensures minimal slippage even for large institutional trades.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="relative z-10 text-center px-6 py-20"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center group">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300"
            >
              $50M+
            </motion.div>
            <div className="text-gray-400 text-lg">Total Volume</div>
          </div>
          <div className="text-center group">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300"
            >
              99.9%
            </motion.div>
            <div className="text-gray-400 text-lg">Success Rate</div>
          </div>
          <div className="text-center group">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300"
            >
              0.1%
            </motion.div>
            <div className="text-gray-400 text-lg">Avg Slippage</div>
          </div>
          <div className="text-center group">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300"
            >
              24/7
            </motion.div>
            <div className="text-gray-400 text-lg">Uptime</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 