import { Router } from 'express';
import quoteRoutes from './routes/quoteRoutes';
import swapRoutes from './routes/swapRoutes';
import predicateRoutes from './routes/predicateRoutes';
import oracleRoutes from './routes/oracleRoutes';
import docsRoutes from './routes/docsRoutes';

const apiRouter = Router();

// API Documentation
apiRouter.use('/docs', docsRoutes);
const apiDocs = {
  name: 'CipherSwap API',
  version: '1.0.0',
  description: 'DeFi OTC Swap Platform API',
  endpoints: {
    quote: {
      base: '/api/quote',
      endpoints: {
        'POST /quote': 'Get quote for swap',
        'POST /quote/simulate': 'Simulate swap with current quote',
        'GET /quote/history': 'Get quote history for user',
        'GET /quote/tokens': 'Get supported tokens for chain'
      }
    },
    swap: {
      base: '/api/swap',
      endpoints: {
        'POST /swap': 'Create a new swap transaction',
        'POST /swap/fusion': 'Create a Fusion+ swap transaction',
        'GET /swap/status/:id': 'Get swap transaction status',
        'POST /swap/simulate': 'Simulate swap transaction',
        'GET /swap/history': 'Get swap history for user',
        'POST /swap/cancel/:id': 'Cancel pending swap transaction'
      }
    },
    predicate: {
      base: '/api/predicate',
      endpoints: {
        'POST /predicate/create': 'Create a new price predicate',
        'GET /predicate/validate/:id': 'Validate predicate with current oracle price',
        'GET /predicate/history': 'Get predicate history for user',
        'GET /predicate/oracles': 'Get available Chainlink oracles for chain',
        'POST /predicate/cancel/:id': 'Cancel active predicate',
        'GET /predicate/status/:id': 'Get predicate status and details'
      }
    },
    oracle: {
      base: '/api/oracle',
      endpoints: {
        'GET /oracle/price/:chainId/:pair': 'Get current price from Chainlink Oracle',
        'POST /oracle/price/batch': 'Get multiple prices at once',
        'POST /oracle/price/tolerance': 'Get price with tolerance check',
        'GET /oracle/feeds/:chainId': 'Get available price feeds for a network',
        'GET /oracle/networks': 'Get all supported networks with their price feeds',
        'GET /oracle/health/:chainId/:pair': 'Get price feed health status'
      }
    }
  },
  features: [
    '1inch DEX Aggregation',
    'Fusion+ MEV Protection',
    'Chainlink Oracle Integration',
    'Cross-chain Support',
    'Slippage Protection',
    'Real-time Price Feeds',
    'Oracle Price Validation'
  ],
  chains: [1, 137, 42161, 8453, 324], // Ethereum, Polygon, Arbitrum, Base, zkSync
  hackathon: 'ETHGlobal Unite DeFi'
};

// API Info endpoint
apiRouter.get('/', (req, res) => {
  res.json({
    success: true,
    data: apiDocs,
    timestamp: Date.now()
  });
});

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CipherSwap API is healthy',
    version: apiDocs.version,
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// Register all routes
apiRouter.use('/', quoteRoutes);
apiRouter.use('/', swapRoutes);
apiRouter.use('/', predicateRoutes);
apiRouter.use('/', oracleRoutes);

// API Stats endpoint
apiRouter.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalEndpoints: 24,
      activeServices: ['quote', 'swap', 'predicate', 'oracle'],
      supportedChains: apiDocs.chains,
      features: apiDocs.features,
      uptime: process.uptime(),
      timestamp: Date.now()
    }
  });
});

// Error handler for API routes
apiRouter.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    code: 'API_NOT_FOUND',
    path: req.originalUrl,
    availableEndpoints: Object.keys(apiDocs.endpoints),
    timestamp: Date.now()
  });
});

export default apiRouter; 