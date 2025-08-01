import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import LiveOracleTable from './LiveOracleTable'

export default function LivePricesPage() {
  return (
    <div>
      {/* Animated Background */}
      <div>
        <div></div>
      </div>

      {/* Floating Elements */}
      <div>
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
        />
      </div>

      {/* Live Oracle Table */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div>
          <LiveOracleTable />
        </div>
      </motion.div>
    </div>
  )
} 