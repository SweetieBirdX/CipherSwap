import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100
});
app.use(limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CipherSwap API is running',
    timestamp: Date.now(),
    version: '1.0.0'
  });
});

// Placeholder endpoints for now
app.get('/api/oracle/price/:chainId/:pair', (req, res) => {
  res.json({
    success: true,
    data: {
      price: '0',
      timestamp: Date.now(),
      chainId: req.params.chainId,
      pair: req.params.pair
    }
  });
});

app.get('/api/real-market-data/prices', (req, res) => {
  res.json({
    success: true,
    data: {
      tokens: [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 3500.00,
          change24h: 2.5,
          volume24h: 1500000000,
          marketCap: 420000000000,
          icon: 'Ξ',
          color: '#627EEA',
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
        }
      ]
    },
    timestamp: Date.now()
  });
});

// Catch all other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not implemented yet'
  });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
} 