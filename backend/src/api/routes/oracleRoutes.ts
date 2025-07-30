import { Router } from 'express';
import { oracleController } from '../controllers/oracleController';

const router = Router();

/**
 * @route   GET /api/oracle/price/:chainId/:pair
 * @desc    Get current price from Chainlink Oracle
 * @access  Public
 */
router.get('/price/:chainId/:pair', oracleController.getPrice.bind(oracleController));

/**
 * @route   POST /api/oracle/price/batch
 * @desc    Get multiple prices at once
 * @access  Public
 */
router.post('/price/batch', oracleController.getMultiplePrices.bind(oracleController));

/**
 * @route   POST /api/oracle/price/tolerance
 * @desc    Get price with tolerance check
 * @access  Public
 */
router.post('/price/tolerance', oracleController.getPriceWithTolerance.bind(oracleController));

/**
 * @route   GET /api/oracle/feeds/:chainId
 * @desc    Get available price feeds for a network
 * @access  Public
 */
router.get('/feeds/:chainId', oracleController.getAvailableFeeds.bind(oracleController));

/**
 * @route   GET /api/oracle/networks
 * @desc    Get all supported networks with their price feeds
 * @access  Public
 */
router.get('/networks', oracleController.getSupportedNetworks.bind(oracleController));

/**
 * @route   GET /api/oracle/health/:chainId/:pair
 * @desc    Get price feed health status
 * @access  Public
 */
router.get('/health/:chainId/:pair', oracleController.getPriceFeedHealth.bind(oracleController));

export default router; 