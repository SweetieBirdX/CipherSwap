"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var realMarketDataController_1 = require("../controllers/realMarketDataController");
var router = (0, express_1.Router)();
var controller = new realMarketDataController_1.RealMarketDataController();
router.get('/price/:tokenAddress', controller.getPrice.bind(controller));
router.get('/volatility/:tokenAddress', controller.getVolatility.bind(controller));
router.get('/liquidity/:tokenAddress', controller.getLiquidity.bind(controller));
router.get('/comprehensive/:tokenAddress', controller.getComprehensive.bind(controller));
router.get('/prices', controller.getAllPrices.bind(controller));
// 1inch Spot Price API endpoints
router.get('/1inch/spot-price/:tokenAddress', controller.getOneInchSpotPrice.bind(controller));
router.post('/1inch/spot-prices', controller.getMultipleOneInchSpotPrices.bind(controller));
router.get('/1inch/currencies', controller.getOneInchCurrencies.bind(controller));
exports.default = router;
