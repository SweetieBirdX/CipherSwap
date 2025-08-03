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
exports.OrderbookController = void 0;
var orderbookService_1 = require("../../services/orderbookService");
var orderbook_1 = require("../../types/orderbook");
var logger_1 = require("../../utils/logger");
var OrderbookController = /** @class */ (function () {
    function OrderbookController() {
        this.orderbookService = new orderbookService_1.OrderbookService();
    }
    /**
     * Add order to off-chain orderbook
     * POST /api/orderbook/orders
     */
    OrderbookController.prototype.addOrder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userAddress, fromToken, toToken, amount, orderType, orderSide, chainId, limitPrice, deadline, useMEVProtection, allowedSenders, maxSlippage, orderRequest, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Orderbook add order request', { body: req.body });
                        _a = req.body, userAddress = _a.userAddress, fromToken = _a.fromToken, toToken = _a.toToken, amount = _a.amount, orderType = _a.orderType, orderSide = _a.orderSide, chainId = _a.chainId, limitPrice = _a.limitPrice, deadline = _a.deadline, useMEVProtection = _a.useMEVProtection, allowedSenders = _a.allowedSenders, maxSlippage = _a.maxSlippage;
                        // Validate required fields
                        if (!userAddress || !fromToken || !toToken || !amount || !orderType || !orderSide || !chainId) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing required fields: userAddress, fromToken, toToken, amount, orderType, orderSide, chainId'
                            });
                            return [2 /*return*/];
                        }
                        orderRequest = {
                            userAddress: userAddress,
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            orderType: orderType,
                            orderSide: orderSide,
                            chainId: chainId,
                            limitPrice: limitPrice,
                            deadline: deadline,
                            useMEVProtection: useMEVProtection,
                            allowedSenders: allowedSenders,
                            maxSlippage: maxSlippage
                        };
                        return [4 /*yield*/, this.orderbookService.addOrder(orderRequest)];
                    case 1:
                        result = _b.sent();
                        if (result.success) {
                            res.status(201).json({
                                success: true,
                                data: result.data,
                                message: 'Order added to off-chain orderbook successfully'
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
                        error_1 = _b.sent();
                        logger_1.logger.error('Orderbook add order error', { error: error_1.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get order by ID
     * GET /api/orderbook/orders/:orderId
     */
    OrderbookController.prototype.getOrder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var orderId, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        if (!orderId) {
                            res.status(400).json({
                                success: false,
                                error: 'Order ID is required'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.orderbookService.getOrder(orderId)];
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
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error('Orderbook get order error', { error: error_2.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Query orders with filters
     * GET /api/orderbook/orders
     */
    OrderbookController.prototype.queryOrders = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userAddress, fromToken, toToken, orderType, orderSide, chainId, status_1, limit, page, sortBy, sortOrder, query, orders, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, userAddress = _a.userAddress, fromToken = _a.fromToken, toToken = _a.toToken, orderType = _a.orderType, orderSide = _a.orderSide, chainId = _a.chainId, status_1 = _a.status, limit = _a.limit, page = _a.page, sortBy = _a.sortBy, sortOrder = _a.sortOrder;
                        query = {
                            userAddress: userAddress,
                            fromToken: fromToken,
                            toToken: toToken,
                            orderType: orderType,
                            orderSide: orderSide,
                            chainId: chainId ? parseInt(chainId) : undefined,
                            status: status_1,
                            limit: limit ? parseInt(limit) : undefined,
                            page: page ? parseInt(page) : undefined,
                            sortBy: sortBy,
                            sortOrder: sortOrder
                        };
                        return [4 /*yield*/, this.orderbookService.queryOrders(query)];
                    case 1:
                        orders = _b.sent();
                        res.status(200).json({
                            success: true,
                            data: orders,
                            count: orders.length
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        logger_1.logger.error('Orderbook query orders error', { error: error_3.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update order status
     * PUT /api/orderbook/orders/:orderId/status
     */
    OrderbookController.prototype.updateOrderStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var orderId, _a, status_2, executionData, result, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        _a = req.body, status_2 = _a.status, executionData = _a.executionData;
                        if (!orderId || !status_2) {
                            res.status(400).json({
                                success: false,
                                error: 'Order ID and status are required'
                            });
                            return [2 /*return*/];
                        }
                        // Validate status
                        if (!Object.values(orderbook_1.OrderStatus).includes(status_2)) {
                            res.status(400).json({
                                success: false,
                                error: 'Invalid order status'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.orderbookService.updateOrderStatus(orderId, status_2, executionData)];
                    case 1:
                        result = _b.sent();
                        if (result.success) {
                            res.status(200).json({
                                success: true,
                                data: result.data,
                                message: 'Order status updated successfully'
                            });
                        }
                        else {
                            res.status(404).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        logger_1.logger.error('Orderbook update order status error', { error: error_4.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get fillable orders for resolver bot
     * GET /api/orderbook/resolver/:botAddress/fillable-orders
     */
    OrderbookController.prototype.getFillableOrders = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var botAddress, orders, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        botAddress = req.params.botAddress;
                        if (!botAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'Bot address is required'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.orderbookService.getFillableOrders(botAddress)];
                    case 1:
                        orders = _a.sent();
                        res.status(200).json({
                            success: true,
                            data: orders,
                            count: orders.length
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        logger_1.logger.error('Orderbook get fillable orders error', { error: error_5.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate resolver bot
     * GET /api/orderbook/resolver/:botAddress/validate
     */
    OrderbookController.prototype.validateResolver = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var botAddress, isValid, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        botAddress = req.params.botAddress;
                        if (!botAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'Bot address is required'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.orderbookService.validateResolver(botAddress)];
                    case 1:
                        isValid = _a.sent();
                        res.status(200).json({
                            success: true,
                            data: {
                                botAddress: botAddress,
                                isValid: isValid
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('Orderbook validate resolver error', { error: error_6.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add resolver bot to whitelist
     * POST /api/orderbook/resolver
     */
    OrderbookController.prototype.addResolverBot = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, address, name_1, allowedPairs, maxOrderSize, minOrderSize, botRequest, result, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Orderbook add resolver bot request', { body: req.body });
                        _a = req.body, address = _a.address, name_1 = _a.name, allowedPairs = _a.allowedPairs, maxOrderSize = _a.maxOrderSize, minOrderSize = _a.minOrderSize;
                        // Validate required fields
                        if (!address || !name_1 || !allowedPairs || !maxOrderSize || !minOrderSize) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing required fields: address, name, allowedPairs, maxOrderSize, minOrderSize'
                            });
                            return [2 /*return*/];
                        }
                        botRequest = {
                            address: address,
                            name: name_1,
                            allowedPairs: allowedPairs,
                            maxOrderSize: maxOrderSize,
                            minOrderSize: minOrderSize
                        };
                        return [4 /*yield*/, this.orderbookService.addResolverBot(botRequest)];
                    case 1:
                        result = _b.sent();
                        if (result.success) {
                            res.status(201).json({
                                success: true,
                                data: result.data,
                                message: 'Resolver bot added successfully'
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
                        error_7 = _b.sent();
                        logger_1.logger.error('Orderbook add resolver bot error', { error: error_7.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update resolver bot status
     * PUT /api/orderbook/resolver/:botAddress/status
     */
    OrderbookController.prototype.updateResolverBotStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var botAddress, isOnline, result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        botAddress = req.params.botAddress;
                        isOnline = req.body.isOnline;
                        if (!botAddress || typeof isOnline !== 'boolean') {
                            res.status(400).json({
                                success: false,
                                error: 'Bot address and isOnline status are required'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.orderbookService.updateResolverBotStatus(botAddress, isOnline)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            res.status(200).json({
                                success: true,
                                data: result.data,
                                message: 'Resolver bot status updated successfully'
                            });
                        }
                        else {
                            res.status(404).json({
                                success: false,
                                error: result.error
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        logger_1.logger.error('Orderbook update resolver bot status error', { error: error_8.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all resolver bots
     * GET /api/orderbook/resolver
     */
    OrderbookController.prototype.getResolverBots = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var bots, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.orderbookService.getResolverBots()];
                    case 1:
                        bots = _a.sent();
                        res.status(200).json({
                            success: true,
                            data: bots,
                            count: bots.length
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        logger_1.logger.error('Orderbook get resolver bots error', { error: error_9.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get orderbook statistics
     * GET /api/orderbook/stats
     */
    OrderbookController.prototype.getOrderbookStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, error_10;
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
                        error_10 = _a.sent();
                        logger_1.logger.error('Orderbook get stats error', { error: error_10.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up expired orders
     * POST /api/orderbook/cleanup
     */
    OrderbookController.prototype.cleanupExpiredOrders = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var error_11;
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
                        error_11 = _a.sent();
                        logger_1.logger.error('Orderbook cleanup expired orders error', { error: error_11.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return OrderbookController;
}());
exports.OrderbookController = OrderbookController;
