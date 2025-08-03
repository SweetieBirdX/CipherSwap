"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var limitOrderController_1 = require("../controllers/limitOrderController");
var router = (0, express_1.Router)();
var limitOrderController = new limitOrderController_1.LimitOrderController();
// Basic limit order endpoints
router.post('/create', limitOrderController.createLimitOrder);
router.get('/:orderId', limitOrderController.getOrder);
router.get('/user/:userAddress', limitOrderController.getUserOrders);
router.delete('/:orderId', limitOrderController.cancelOrder);
router.get('/:orderId/status', limitOrderController.getOrderStatus);
// Custom strategy endpoints
router.post('/conditional', limitOrderController.createConditionalOrder);
router.post('/dynamic-pricing', limitOrderController.createDynamicPricingOrder);
router.post('/:orderId/execute-strategy', limitOrderController.executeCustomStrategy);
// Onchain execution endpoints
router.post('/:orderId/execute', limitOrderController.executeOrderOnchain);
router.post('/:orderId/cancel-onchain', limitOrderController.cancelOrderOnchain);
router.get('/transaction/:txHash/status', limitOrderController.getTransactionStatus);
// Orderbook management endpoints
router.get('/orderbook/stats', limitOrderController.getOrderbookStats);
router.get('/orderbook/active', limitOrderController.getActiveOrders);
router.post('/orderbook/cleanup', limitOrderController.cleanupExpiredOrders);
// Gas estimation endpoints
router.post('/:orderId/estimate-gas', limitOrderController.estimateGas);
exports.default = router;
