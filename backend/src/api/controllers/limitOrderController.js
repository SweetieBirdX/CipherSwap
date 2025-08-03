"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitOrderController = void 0;
var logger_1 = require("../../utils/logger");
var customOrderbookService_1 = require("../../services/customOrderbookService");
var customLimitOrderService_1 = require("../../services/customLimitOrderService");
var onchainExecutionService_1 = require("../../services/onchainExecutionService");
var LimitOrderController = /** @class */ (function () {
    function LimitOrderController() {
        var _this = this;
        /**
         * Create basic limit order
         */
        this.createLimitOrder = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderData, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderData = req.body;
                        logger_1.logger.info('Creating limit order via API', {
                            fromToken: orderData.fromToken,
                            toToken: orderData.toToken,
                            userAddress: orderData.userAddress,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        return [4 /*yield*/, this.orderbookService.createCustomLimitOrder(orderData)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(201).json({
                                success: true,
                                data: result.data,
                                message: 'Limit order created successfully'
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error('Create limit order API error', {
                            error: error_1.message,
                            stack: error_1.stack,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Get order by ID
         */
        this.getOrder = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderId, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        return [4 /*yield*/, this.orderbookService.getOrder(orderId)];
                    case 1:
                        result = _a.sent();
                        if (result.success && result.data) {
                            res.status(200).json({
                                success: true,
                                data: result.data
                            });
                        }
                        else {
                            res.status(404).json({
                                success: false,
                                error: 'Order not found'
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error('Get order API error', {
                            error: error_2.message,
                            orderId: req.params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Get user orders
         */
        this.getUserOrders = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userAddress, _a, _b, limit, _c, page, orders, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        userAddress = req.params.userAddress;
                        _a = req.query, _b = _a.limit, limit = _b === void 0 ? 10 : _b, _c = _a.page, page = _c === void 0 ? 1 : _c;
                        return [4 /*yield*/, this.orderbookService.getUserOrders(userAddress, Number(limit), Number(page))];
                    case 1:
                        orders = _d.sent();
                        res.status(200).json({
                            success: true,
                            data: orders,
                            pagination: {
                                page: Number(page),
                                limit: Number(limit),
                                total: orders.length
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _d.sent();
                        logger_1.logger.error('Get user orders API error', {
                            error: error_3.message,
                            userAddress: req.params.userAddress,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Cancel order
         */
        this.cancelOrder = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderId, userAddress, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        userAddress = req.body.userAddress;
                        if (!userAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'userAddress is required'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.orderbookService.cancelOrder(orderId, userAddress)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(200).json({
                                success: true,
                                data: result.data,
                                message: 'Order cancelled successfully'
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('Cancel order API error', {
                            error: error_4.message,
                            orderId: req.params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Get order status
         */
        this.getOrderStatus = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderId, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        return [4 /*yield*/, this.orderbookService.getOrderStatus(orderId)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(200).json({
                                success: true,
                                data: result.data
                            });
                        }
                        else {
                            res.status(404).json({
                                success: false,
                                error: 'Order not found'
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        logger_1.logger.error('Get order status API error', {
                            error: error_5.message,
                            orderId: req.params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Create conditional order
         */
        this.createConditionalOrder = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderData, result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderData = req.body;
                        logger_1.logger.info('Creating conditional order via API', {
                            fromToken: orderData.fromToken,
                            toToken: orderData.toToken,
                            triggerPrice: orderData.triggerPrice,
                            triggerCondition: orderData.triggerCondition,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        return [4 /*yield*/, this.customLimitOrderService.createConditionalOrder(orderData)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(201).json({
                                success: true,
                                data: result.data,
                                message: 'Conditional order created successfully'
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('Create conditional order API error', {
                            error: error_6.message,
                            stack: error_6.stack,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Create dynamic pricing order
         */
        this.createDynamicPricingOrder = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderData, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderData = req.body;
                        logger_1.logger.info('Creating dynamic pricing order via API', {
                            fromToken: orderData.fromToken,
                            toToken: orderData.toToken,
                            basePrice: orderData.basePrice,
                            priceAdjustment: orderData.priceAdjustment,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        return [4 /*yield*/, this.customLimitOrderService.createDynamicPricingOrder(orderData)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(201).json({
                                success: true,
                                data: result.data,
                                message: 'Dynamic pricing order created successfully'
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        logger_1.logger.error('Create dynamic pricing order API error', {
                            error: error_7.message,
                            stack: error_7.stack,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Execute custom strategy
         */
        this.executeCustomStrategy = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderId, strategyParams, result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        strategyParams = req.body;
                        logger_1.logger.info('Executing custom strategy via API', {
                            orderId: orderId,
                            strategyType: strategyParams.strategyType,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        return [4 /*yield*/, this.customLimitOrderService.executeCustomStrategy(orderId, strategyParams)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(200).json({
                                success: true,
                                data: result.data,
                                message: 'Custom strategy executed successfully'
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        logger_1.logger.error('Execute custom strategy API error', {
                            error: error_8.message,
                            orderId: req.params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Execute order onchain
         */
        this.executeOrderOnchain = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderId, executionParams, result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        executionParams = {
                            orderId: orderId,
                            userAddress: req.body.userAddress,
                            gasPrice: req.body.gasPrice,
                            gasLimit: req.body.gasLimit,
                            maxPriorityFeePerGas: req.body.maxPriorityFeePerGas,
                            maxFeePerGas: req.body.maxFeePerGas
                        };
                        logger_1.logger.info('Executing order onchain via API', {
                            orderId: orderId,
                            userAddress: executionParams.userAddress,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        return [4 /*yield*/, this.onchainExecutionService.executeLimitOrderOnchain(executionParams)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(200).json({
                                success: true,
                                data: result.data,
                                message: 'Order executed successfully onchain'
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        logger_1.logger.error('Execute order onchain API error', {
                            error: error_9.message,
                            orderId: req.params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Cancel order onchain
         */
        this.cancelOrderOnchain = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderId, userAddress, result, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        userAddress = req.body.userAddress;
                        if (!userAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'userAddress is required'
                            });
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('Cancelling order onchain via API', {
                            orderId: orderId,
                            userAddress: userAddress,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        return [4 /*yield*/, this.onchainExecutionService.cancelLimitOrderOnchain(orderId, userAddress)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(200).json({
                                success: true,
                                data: result.data,
                                message: 'Order cancelled successfully onchain'
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        logger_1.logger.error('Cancel order onchain API error', {
                            error: error_10.message,
                            orderId: req.params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Get transaction status
         */
        this.getTransactionStatus = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var txHash, result, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        txHash = req.params.txHash;
                        return [4 /*yield*/, this.onchainExecutionService.getTransactionStatus(txHash)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(200).json({
                                success: true,
                                data: result.data
                            });
                        }
                        else {
                            res.status(404).json({
                                success: false,
                                error: 'Transaction not found'
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        logger_1.logger.error('Get transaction status API error', {
                            error: error_11.message,
                            txHash: req.params.txHash,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Get orderbook statistics
         */
        this.getOrderbookStats = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var stats, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.orderbookService.getOrderbookStats()];
                    case 1:
                        stats = _a.sent();
                        res.status(200).json({
                            success: true,
                            data: stats
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _a.sent();
                        logger_1.logger.error('Get orderbook stats API error', {
                            error: error_12.message,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Get active orders
         */
        this.getActiveOrders = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orders, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.orderbookService.getActiveOrders()];
                    case 1:
                        orders = _a.sent();
                        res.status(200).json({
                            success: true,
                            data: orders
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        logger_1.logger.error('Get active orders API error', {
                            error: error_13.message,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Cleanup expired orders
         */
        this.cleanupExpiredOrders = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.orderbookService.cleanupExpiredOrders()];
                    case 1:
                        _a.sent();
                        res.status(200).json({
                            success: true,
                            message: 'Expired orders cleaned up successfully'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _a.sent();
                        logger_1.logger.error('Cleanup expired orders API error', {
                            error: error_14.message,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Estimate gas for order execution
         */
        this.estimateGas = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var orderId, _a, userAddress, gasPrice, gasLimit, maxPriorityFeePerGas, maxFeePerGas, orderResponse, order, result, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        orderId = req.params.orderId;
                        _a = req.body, userAddress = _a.userAddress, gasPrice = _a.gasPrice, gasLimit = _a.gasLimit, maxPriorityFeePerGas = _a.maxPriorityFeePerGas, maxFeePerGas = _a.maxFeePerGas;
                        return [4 /*yield*/, this.orderbookService.getOrder(orderId)];
                    case 1:
                        orderResponse = _b.sent();
                        if (!orderResponse.success || !orderResponse.data) {
                            res.status(404).json({
                                success: false,
                                error: 'Order not found'
                            });
                            return [2 /*return*/];
                        }
                        order = orderResponse.data;
                        return [4 /*yield*/, this.onchainExecutionService.estimateGasForExecution(order, {
                                orderId: orderId,
                                userAddress: userAddress,
                                gasPrice: gasPrice,
                                gasLimit: gasLimit,
                                maxPriorityFeePerGas: maxPriorityFeePerGas,
                                maxFeePerGas: maxFeePerGas
                            })];
                    case 2:
                        result = _b.sent();
                        if (result.success) {
                            res.status(200).json({
                                success: true,
                                data: result.data
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_15 = _b.sent();
                        logger_1.logger.error('Estimate gas API error', {
                            error: error_15.message,
                            orderId: req.params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-controller'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.orderbookService = new customOrderbookService_1.CustomOrderbookService();
        this.customLimitOrderService = new customLimitOrderService_1.CustomLimitOrderService();
        this.onchainExecutionService = new onchainExecutionService_1.OnchainExecutionService();
        logger_1.logger.info('LimitOrderController initialized', {
            timestamp: Date.now(),
            service: 'cipherswap-limit-order-controller'
        });
    }
    return LimitOrderController;
}());
exports.LimitOrderController = LimitOrderController;
