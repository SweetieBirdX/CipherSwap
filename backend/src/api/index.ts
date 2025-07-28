import { Router } from 'express';
import quoteRoutes from './routes/quoteRoutes';
import swapRoutes from './routes/swapRoutes';
import predicateRoutes from './routes/predicateRoutes';

const apiRouter = Router();

// API Documentation
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
    }
  },
  features: [
    '1inch DEX Aggregation',
    'Fusion+ MEV Protection',
    'Chainlink Oracle Integration',
    'Cross-chain Support',
    'Slippage Protection',
    'Real-time Price Feeds'
  ],
  chains: [1, 137, 42161], // Ethereum, Polygon, Arbitrum
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

// API Stats endpoint
apiRouter.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalEndpoints: 18,
      activeServices: ['quote', 'swap', 'predicate'],
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