"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var frontendLimitOrderController_1 = require("../controllers/frontendLimitOrderController");
var router = (0, express_1.Router)();
var controller = new frontendLimitOrderController_1.FrontendLimitOrderController();
// Create unsigned transaction for frontend signing
router.post('/create-unsigned', controller.createUnsignedTransaction.bind(controller));
// Execute user-signed transaction
router.post('/execute-signed', controller.executeUserSignedTransaction.bind(controller));
// Get order status
router.get('/:orderId', controller.getOrderStatus.bind(controller));
exports.default = router;
