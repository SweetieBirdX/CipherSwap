import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './api/middleware/errorHandler';

// Import routes
import quoteRoutes from './api/routes/quoteRoutes';
import swapRoutes from './api/routes/swapRoutes';

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
app.use('/api', quoteRoutes);
app.use('/api', swapRoutes);

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

app.listen(PORT, () => {
  logger.info(`🚀 CipherSwap API server started`, {
    port: PORT,
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
  
  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                    CipherSwap API                            ║
  ║                                                              ║
  ║  🚀 Server running on port ${PORT}                          ║
  ║  🌍 Environment: ${config.NODE_ENV}                         ║
  ║  📊 Health check: http://localhost:${PORT}/health           ║
  ║  📚 API docs: http://localhost:${PORT}/api                  ║
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