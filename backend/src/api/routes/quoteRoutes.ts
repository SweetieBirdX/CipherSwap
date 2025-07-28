import { Router } from 'express';
import QuoteController from '../controllers/quoteController';

const router = Router();
const quoteController = new QuoteController();

/**
 * @route   POST /api/quote
 * @desc    Get quote for swap
 * @access  Public
 */
router.post('/quote', quoteController.getQuote.bind(quoteController));

/**
 * @route   POST /api/quote/simulate
 * @desc    Simulate swap with current quote
 * @access  Public
 */
router.post('/quote/simulate', quoteController.simulateSwap.bind(quoteController));

/**
 * @route   GET /api/quote/history
 * @desc    Get quote history for user
 * @access  Public
 */
router.get('/quote/history', quoteController.getQuoteHistory.bind(quoteController));

/**
 * @route   GET /api/quote/tokens
 * @desc    Get supported tokens for chain
 * @access  Public
 */
router.get('/quote/tokens', quoteController.getSupportedTokens.bind(quoteController));

export default router; 