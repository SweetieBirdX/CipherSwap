import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './api/middleware/errorHandler';

// Import API router
import apiRouter from './api/index';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CipherSwap API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', apiRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    timestamp: Date.now()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.PORT;

app.listen(PORT, async () => {
  logger.info(`🚀 CipherSwap API server started`, {
    port: PORT,
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
  
  // ====== RESOLVER_BOT_STARTUP (yahya) ======
  // Initialize and start resolver bot if enabled
  if (config.ENABLE_RESOLVER_BOT) {
    try {
      const { ResolverBot } = await import('./services/resolverBot');
      const { OrderbookService } = await import('./services/orderbookService');
      const { PredicateService } = await import('./services/predicateService');
      const { ethers } = await import('ethers');
      
      // Initialize services
      const orderbookService = new OrderbookService();
      const predicateService = new PredicateService();
      
      // Create provider
      const provider = new ethers.JsonRpcProvider(config.ETHEREUM_RPC_URL);
      
      // Initialize resolver bot
      const resolverBot = new ResolverBot(
        config.INCH_LIMIT_ORDER_AUTH_KEY!,
        config.PRIVATE_KEY,
        provider,
        orderbookService,
        predicateService
      );
      
      // Start resolver bot
      await resolverBot.start();
      
      logger.info('🤖 Resolver bot started successfully', {
        botAddress: resolverBot.getStatus().address,
        timestamp: new Date().toISOString(),
        service: 'cipherswap-resolver-bot'
      });
      
      // Store bot instance for potential future use
      (global as any).resolverBot = resolverBot;
      
    } catch (error: any) {
      logger.error('Failed to start resolver bot', {
        error: error.message,
        timestamp: new Date().toISOString(),
        service: 'cipherswap-resolver-bot'
      });
    }
  }
  // ====== END RESOLVER_BOT_STARTUP ======
  
  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                    CipherSwap API                            ║
  ║                                                              ║
  ║  🚀 Server running on port ${PORT}                          ║
  ║  🌍 Environment: ${config.NODE_ENV}                         ║
  ║  📊 Health check: http://localhost:${PORT}/health           ║
  ║  📚 API docs: http://localhost:${PORT}/api                  ║
  ║  🤖 Resolver Bot: ${config.ENABLE_RESOLVER_BOT ? 'Enabled' : 'Disabled'} ║
  ║  📋 Limit Orders: ${config.ENABLE_LIMIT_ORDERS ? 'Enabled' : 'Disabled'} ║
  ║                                                              ║
  ║  ETHGlobal Unite DeFi Hackathon                             ║
  ╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app; 