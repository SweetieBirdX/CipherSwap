"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var oracleController_1 = require("../controllers/oracleController");
var router = (0, express_1.Router)();
/**
 * @route   GET /api/oracle/price/:chainId/:pair
 * @desc    Get current price from Chainlink Oracle
 * @access  Public
 */
router.get('/price/:chainId/:pair', oracleController_1.oracleController.getPrice.bind(oracleController_1.oracleController));
/**
 * @route   POST /api/oracle/price/batch
 * @desc    Get multiple prices at once
 * @access  Public
 */
router.post('/price/batch', oracleController_1.oracleController.getMultiplePrices.bind(oracleController_1.oracleController));
/**
 * @route   POST /api/oracle/price/tolerance
 * @desc    Get price with tolerance check
 * @access  Public
 */
router.post('/price/tolerance', oracleController_1.oracleController.getPriceWithTolerance.bind(oracleController_1.oracleController));
/**
 * @route   GET /api/oracle/feeds/:chainId
 * @desc    Get available price feeds for a network
 * @access  Public
 */
router.get('/feeds/:chainId', oracleController_1.oracleController.getAvailableFeeds.bind(oracleController_1.oracleController));
/**
 * @route   GET /api/oracle/networks
 * @desc    Get all supported networks with their price feeds
 * @access  Public
 */
router.get('/networks', oracleController_1.oracleController.getSupportedNetworks.bind(oracleController_1.oracleController));
/**
 * @route   GET /api/oracle/health/:chainId/:pair
 * @desc    Get price feed health status
 * @access  Public
 */
router.get('/health/:chainId/:pair', oracleController_1.oracleController.getPriceFeedHealth.bind(oracleController_1.oracleController));
exports.default = router;
