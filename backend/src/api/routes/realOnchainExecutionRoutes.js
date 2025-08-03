"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var realOnchainExecutionController_1 = require("../controllers/realOnchainExecutionController");
var router = (0, express_1.Router)();
var controller = new realOnchainExecutionController_1.RealOnchainExecutionController();
// Gas estimation endpoint
router.post('/estimate-gas', controller.estimateGas.bind(controller));
// Execute limit order onchain
router.post('/execute-order', controller.executeOrder.bind(controller));
// Get transaction status
router.get('/transaction-status/:txHash', controller.getTransactionStatus.bind(controller));
// Cancel limit order
router.post('/cancel-order', controller.cancelOrder.bind(controller));
exports.default = router;
