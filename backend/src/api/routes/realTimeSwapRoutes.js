"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var realTimeSwapController_1 = require("../controllers/realTimeSwapController");
var router = (0, express_1.Router)();
var controller = new realTimeSwapController_1.RealTimeSwapController();
/**
 * @route POST /api/real-time-swap/analyze
 * @desc Gerçek zamanlı swap analizi ve öneriler
 */
router.post('/analyze', controller.analyzeAndRecommend);
/**
 * @route POST /api/real-time-swap/execute
 * @desc Optimize edilmiş swap işlemi gerçekleştirme
 */
router.post('/execute', controller.executeOptimizedSwap);
/**
 * @route GET /api/real-time-swap/market-status
 * @desc Piyasa durumu ve koşulları
 */
router.get('/market-status', controller.getMarketStatus);
/**
 * @route POST /api/real-time-swap/simulate
 * @desc Swap simülasyonu ve sonuç analizi
 */
router.post('/simulate', controller.simulateSwap);
/**
 * @route GET /api/real-time-swap/price/:fromToken/:toToken
 * @desc Gerçek zamanlı fiyat bilgisi
 */
router.get('/price/:fromToken/:toToken', controller.getCurrentPrice);
/**
 * @route POST /api/real-time-swap/limit-order
 * @desc Limit order oluşturma
 */
router.post('/limit-order', controller.createLimitOrder);
/**
 * @route GET /api/real-time-swap/order-status/:orderId
 * @desc Limit order durumu
 */
router.get('/order-status/:orderId', controller.getOrderStatus);
exports.default = router;
