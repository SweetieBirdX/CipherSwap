"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var swapController_1 = require("../controllers/swapController");
var router = (0, express_1.Router)();
var swapController = new swapController_1.default();
/**
 * @route   POST /api/swap
 * @desc    Create a new swap transaction
 * @access  Public
 */
router.post('/', swapController.createSwap.bind(swapController));
/**
 * @route   POST /api/swap/fusion
 * @desc    Create a Fusion+ swap transaction
 * @access  Public
 */
router.post('/fusion', swapController.createFusionSwap.bind(swapController));
/**
 * @route   GET /api/swap/status/:id
 * @desc    Get swap transaction status
 * @access  Public
 */
router.get('/status/:id', swapController.getSwapStatus.bind(swapController));
/**
 * @route   POST /api/swap/simulate
 * @desc    Simulate swap transaction
 * @access  Public
 */
router.post('/simulate', swapController.simulateSwap.bind(swapController));
/**
 * @route   GET /api/swap/history
 * @desc    Get swap history for user
 * @access  Public
 */
router.get('/history', swapController.getSwapHistory.bind(swapController));
/**
 * @route   POST /api/swap/cancel/:id
 * @desc    Cancel pending swap transaction
 * @access  Public
 */
router.post('/cancel/:id', swapController.cancelSwap.bind(swapController));
/**
 * @route   POST /api/swap/optimize
 * @desc    Execute swap with optimization (split routing, etc.)
 * @access  Public
 */
router.post('/optimize', swapController.executeSwapWithOptimization.bind(swapController));
exports.default = router;
