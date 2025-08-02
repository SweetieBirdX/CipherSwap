import { Router } from 'express';
import QuoteController from '../controllers/quoteController';

const router = Router();
const quoteController = new QuoteController();

/**
 * @swagger
 * /api/quote:
 *   post:
 *     summary: Get quote for token swap
 *     tags: [Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromToken
 *               - toToken
 *               - amount
 *               - chainId
 *             properties:
 *               fromToken:
 *                 type: string
 *                 description: Source token address
 *               toToken:
 *                 type: string
 *                 description: Destination token address
 *               amount:
 *                 type: string
 *                 description: Amount to swap (in wei)
 *               chainId:
 *                 type: number
 *                 description: Chain ID (e.g., 1 for Ethereum mainnet)
 *               slippage:
 *                 type: number
 *                 description: Maximum allowed slippage (optional)
 *     responses:
 *       200:
 *         description: Successful quote
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.post('/', quoteController.getQuote.bind(quoteController));

/**
 * @swagger
 * /api/quote/simulate:
 *   post:
 *     summary: Simulate a swap with current quote
 *     tags: [Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quote
 *               - userAddress
 *             properties:
 *               quote:
 *                 type: object
 *                 description: Quote object from /quote endpoint
 *               userAddress:
 *                 type: string
 *                 description: User's wallet address
 *     responses:
 *       200:
 *         description: Simulation results
 *       400:
 *         description: Invalid parameters
 */
router.post('/simulate', quoteController.simulateSwap.bind(quoteController));

/**
 * @swagger
 * /api/quote/history:
 *   get:
 *     summary: Get quote history for user
 *     tags: [Quotes]
 *     parameters:
 *       - in: query
 *         name: userAddress
 *         schema:
 *           type: string
 *         description: User's wallet address
 *     responses:
 *       200:
 *         description: Quote history
 */
router.get('/history', quoteController.getQuoteHistory.bind(quoteController));

/**
 * @swagger
 * /api/quote/tokens:
 *   get:
 *     summary: Get list of supported tokens
 *     tags: [Quotes]
 *     parameters:
 *       - in: query
 *         name: chainId
 *         schema:
 *           type: number
 *         description: Chain ID to get tokens for
 *     responses:
 *       200:
 *         description: List of supported tokens
 */
router.get('/tokens', quoteController.getSupportedTokens.bind(quoteController));

/**
 * @swagger
 * /api/quote/analytics:
 *   get:
 *     summary: Get network analytics and gas prices
 *     tags: [Quotes]
 *     responses:
 *       200:
 *         description: Network analytics data
 */
router.get('/analytics', quoteController.getNetworkAnalytics.bind(quoteController));

/**
 * @swagger
 * /api/quote/multiple:
 *   post:
 *     summary: Get multiple quotes for different tokens and strategies
 *     tags: [Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromToken
 *               - amount
 *               - chainId
 *               - userAddress
 *             properties:
 *               fromToken:
 *                 type: string
 *                 description: Source token address
 *               amount:
 *                 type: string
 *                 description: Amount to swap (in ETH)
 *               chainId:
 *                 type: number
 *                 description: Chain ID (e.g., 1 for Ethereum mainnet)
 *               userAddress:
 *                 type: string
 *                 description: User's wallet address
 *               slippage:
 *                 type: number
 *                 description: Maximum allowed slippage (optional)
 *     responses:
 *       200:
 *         description: Multiple quotes analysis
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.post('/multiple', quoteController.getMultipleQuotes.bind(quoteController));

export default router; 