import { Router } from 'express';
import SwapController from '../controllers/swapController';

const router = Router();
const swapController = new SwapController();

/**
 * @route   POST /api/swap
 * @desc    Create a new swap transaction
 * @access  Public
 */
router.post('/swap', swapController.createSwap.bind(swapController));

/**
 * @route   POST /api/swap/fusion
 * @desc    Create a Fusion+ swap transaction
 * @access  Public
 */
router.post('/swap/fusion', swapController.createFusionSwap.bind(swapController));

/**
 * @route   GET /api/swap/status/:id
 * @desc    Get swap transaction status
 * @access  Public
 */
router.get('/swap/status/:id', swapController.getSwapStatus.bind(swapController));

/**
 * @route   POST /api/swap/simulate
 * @desc    Simulate swap transaction
 * @access  Public
 */
router.post('/swap/simulate', swapController.simulateSwap.bind(swapController));

/**
 * @route   GET /api/swap/history
 * @desc    Get swap history for user
 * @access  Public
 */
router.get('/swap/history', swapController.getSwapHistory.bind(swapController));

/**
 * @route   POST /api/swap/cancel/:id
 * @desc    Cancel pending swap transaction
 * @access  Public
 */
router.post('/swap/cancel/:id', swapController.cancelSwap.bind(swapController));

export default router; 