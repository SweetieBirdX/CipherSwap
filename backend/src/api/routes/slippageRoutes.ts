import { Router } from 'express';
import { SlippageController } from '../controllers/slippageController';

const router = Router();
const slippageController = new SlippageController();

/**
 * @swagger
 * /api/slippage/config:
 *   get:
 *     summary: Get current slippage tolerance configuration
 *     tags: [Slippage]
 *     responses:
 *       200:
 *         description: Current slippage tolerance configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     defaultTolerance:
 *                       type: number
 *                       description: Default slippage tolerance percentage
 *                     maxTolerance:
 *                       type: number
 *                       description: Maximum allowed slippage tolerance
 *                     minTolerance:
 *                       type: number
 *                       description: Minimum allowed slippage tolerance
 *                     warningThreshold:
 *                       type: number
 *                       description: Warning threshold for slippage tolerance
 *                     criticalThreshold:
 *                       type: number
 *                       description: Critical threshold for slippage tolerance
 *                     autoAdjustment:
 *                       type: boolean
 *                       description: Whether automatic adjustment is enabled
 *                     marketBasedAdjustment:
 *                       type: boolean
 *                       description: Whether market-based adjustment is enabled
 *                     timeBasedAdjustment:
 *                       type: boolean
 *                       description: Whether time-based adjustment is enabled
 *                     tradeSizeAdjustment:
 *                       type: boolean
 *                       description: Whether trade size adjustment is enabled
 *                     chainSpecific:
 *                       type: boolean
 *                       description: Whether chain-specific adjustments are enabled
 *       500:
 *         description: Server error
 */
router.get('/config', slippageController.getConfig.bind(slippageController));

/**
 * @swagger
 * /api/slippage/config:
 *   put:
 *     summary: Update slippage tolerance configuration
 *     tags: [Slippage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               defaultTolerance:
 *                 type: number
 *                 description: Default slippage tolerance percentage
 *               maxTolerance:
 *                 type: number
 *                 description: Maximum allowed slippage tolerance
 *               minTolerance:
 *                 type: number
 *                 description: Minimum allowed slippage tolerance
 *               warningThreshold:
 *                 type: number
 *                 description: Warning threshold for slippage tolerance
 *               criticalThreshold:
 *                 type: number
 *                 description: Critical threshold for slippage tolerance
 *               autoAdjustment:
 *                 type: boolean
 *                 description: Whether automatic adjustment is enabled
 *               marketBasedAdjustment:
 *                 type: boolean
 *                 description: Whether market-based adjustment is enabled
 *               timeBasedAdjustment:
 *                 type: boolean
 *                 description: Whether time-based adjustment is enabled
 *               tradeSizeAdjustment:
 *                 type: boolean
 *                 description: Whether trade size adjustment is enabled
 *               chainSpecific:
 *                 type: boolean
 *                 description: Whether chain-specific adjustments are enabled
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *       400:
 *         description: Invalid configuration parameters
 *       500:
 *         description: Server error
 */
router.put('/config', slippageController.updateConfig.bind(slippageController));

/**
 * @swagger
 * /api/slippage/calculate:
 *   post:
 *     summary: Calculate optimal slippage tolerance for a specific scenario
 *     tags: [Slippage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - baseTolerance
 *               - chainId
 *               - tradeSize
 *             properties:
 *               baseTolerance:
 *                 type: number
 *                 description: Base slippage tolerance percentage
 *               chainId:
 *                 type: number
 *                 description: Chain ID for the trade
 *               tradeSize:
 *                 type: number
 *                 description: Trade size in USD
 *               marketConditions:
 *                 type: string
 *                 enum: [STABLE, VOLATILE, EXTREME]
 *                 description: Market conditions
 *               volatility:
 *                 type: number
 *                 description: Market volatility factor (0-1)
 *               liquidity:
 *                 type: number
 *                 description: Market liquidity factor (0-1)
 *               timeOfDay:
 *                 type: number
 *                 description: Time of day factor (0-1)
 *     responses:
 *       200:
 *         description: Calculated optimal slippage tolerance
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.post('/calculate', slippageController.calculateTolerance.bind(slippageController));

/**
 * @swagger
 * /api/slippage/validate:
 *   post:
 *     summary: Validate slippage tolerance against configured limits
 *     tags: [Slippage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tolerance
 *             properties:
 *               tolerance:
 *                 type: number
 *                 description: Slippage tolerance percentage to validate
 *     responses:
 *       200:
 *         description: Validation results
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.post('/validate', slippageController.validateTolerance.bind(slippageController));

/**
 * @swagger
 * /api/slippage/recommended/{chainId}:
 *   get:
 *     summary: Get recommended slippage tolerance for a specific chain
 *     tags: [Slippage]
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: number
 *         description: Chain ID
 *       - in: query
 *         name: tradeSize
 *         schema:
 *           type: number
 *         description: Trade size in USD
 *       - in: query
 *         name: marketConditions
 *         schema:
 *           type: string
 *           enum: [STABLE, VOLATILE, EXTREME]
 *         description: Market conditions
 *     responses:
 *       200:
 *         description: Recommended slippage tolerance
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/recommended/:chainId', slippageController.getRecommendedTolerance.bind(slippageController));

/**
 * @swagger
 * /api/slippage/reset:
 *   post:
 *     summary: Reset slippage tolerance configuration to environment variable defaults
 *     tags: [Slippage]
 *     responses:
 *       200:
 *         description: Configuration reset successfully
 *       500:
 *         description: Server error
 */
router.post('/reset', slippageController.resetConfig.bind(slippageController));

export default router; 