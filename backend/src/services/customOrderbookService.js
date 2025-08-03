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
exports.CustomOrderbookService = void 0;
var logger_1 = require("../utils/logger");
var swap_1 = require("../types/swap");
var limitOrderSDKService_1 = require("./limitOrderSDKService");
var CustomOrderbookService = /** @class */ (function () {
    function CustomOrderbookService() {
        this.orders = new Map();
        this.userOrders = new Map(); // userAddress -> Set<orderId>
        this.sdkService = new limitOrderSDKService_1.LimitOrderSDKService();
        logger_1.logger.info('CustomOrderbookService initialized', {
            timestamp: Date.now(),
            service: 'cipherswap-custom-orderbook'
        });
    }
    /**
     * Create a custom limit order (no official API)
     */
    CustomOrderbookService.prototype.createCustomLimitOrder = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, sdkResponse, orderData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Creating custom limit order', {
                            params: {
                                fromToken: params.fromToken,
                                toToken: params.toToken,
                                amount: params.amount,
                                limitPrice: params.limitPrice,
                                orderType: params.orderType,
                                chainId: params.chainId,
                                userAddress: params.userAddress
                            },
                            timestamp: Date.now(),
                            service: 'cipherswap-custom-orderbook'
                        });
                        validation = this.validateCustomLimitOrderRequest(params);
                        if (!validation.isValid) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: validation.errors.join(', ')
                                }];
                        }
                        return [4 /*yield*/, this.sdkService.createLimitOrder(params)];
                    case 1:
                        sdkResponse = _a.sent();
                        if (!sdkResponse.success) {
                            logger_1.logger.error('SDK limit order creation failed', {
                                error: sdkResponse.error,
                                params: {
                                    fromToken: params.fromToken,
                                    toToken: params.toToken,
                                    userAddress: params.userAddress
                                },
                                timestamp: Date.now(),
                                service: 'cipherswap-custom-orderbook'
                            });
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Custom limit order creation failed: ".concat(sdkResponse.error)
                                }];
                        }
                        orderData = sdkResponse.data;
                        this.orders.set(orderData.orderId, orderData);
                        // Update user orders index
                        if (!this.userOrders.has(params.userAddress)) {
                            this.userOrders.set(params.userAddress, new Set());
                        }
                        this.userOrders.get(params.userAddress).add(orderData.orderId);
                        logger_1.logger.info('Custom limit order created successfully', {
                            orderId: orderData.orderId,
                            userAddress: params.userAddress,
                            fromToken: params.fromToken,
                            toToken: params.toToken,
                            amount: params.amount,
                            limitPrice: params.limitPrice,
                            timestamp: Date.now(),
                            service: 'cipherswap-custom-orderbook'
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: orderData
                            }];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error('Custom limit order creation error', {
                            error: error_1.message,
                            stack: error_1.stack,
                            params: {
                                fromToken: params.fromToken,
                                toToken: params.toToken,
                                userAddress: params.userAddress
                            },
                            timestamp: Date.now(),
                            service: 'cipherswap-custom-orderbook'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Custom limit order creation failed: ".concat(error_1.message)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get order by ID
     */
    CustomOrderbookService.prototype.getOrder = function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_a) {
                try {
                    order = this.orders.get(orderId);
                    if (!order) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Order not found'
                            }];
                    }
                    return [2 /*return*/, {
                            success: true,
                            data: order
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Get order error', {
                        error: error.message,
                        orderId: orderId,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to get order'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get user orders
     */
    CustomOrderbookService.prototype.getUserOrders = function (userAddress_1) {
        return __awaiter(this, arguments, void 0, function (userAddress, limit, page) {
            var userOrderSet, userOrderIds, userOrders, _i, userOrderIds_1, orderId, order, startIndex, endIndex;
            if (limit === void 0) { limit = 10; }
            if (page === void 0) { page = 1; }
            return __generator(this, function (_a) {
                try {
                    userOrderSet = this.userOrders.get(userAddress);
                    if (!userOrderSet) {
                        return [2 /*return*/, []];
                    }
                    userOrderIds = Array.from(userOrderSet);
                    userOrders = [];
                    for (_i = 0, userOrderIds_1 = userOrderIds; _i < userOrderIds_1.length; _i++) {
                        orderId = userOrderIds_1[_i];
                        order = this.orders.get(orderId);
                        if (order) {
                            userOrders.push(order);
                        }
                    }
                    // Sort by timestamp (newest first)
                    userOrders.sort(function (a, b) { return b.timestamp - a.timestamp; });
                    startIndex = (page - 1) * limit;
                    endIndex = startIndex + limit;
                    return [2 /*return*/, userOrders.slice(startIndex, endIndex)];
                }
                catch (error) {
                    logger_1.logger.error('Get user orders error', {
                        error: error.message,
                        userAddress: userAddress,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Cancel order
     */
    CustomOrderbookService.prototype.cancelOrder = function (orderId, userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var order, sdkResponse, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        order = this.orders.get(orderId);
                        if (!order) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Order not found'
                                }];
                        }
                        // Check ownership
                        if (order.userAddress !== userAddress) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Unauthorized to cancel this order'
                                }];
                        }
                        return [4 /*yield*/, this.sdkService.cancelOrder(orderId)];
                    case 1:
                        sdkResponse = _a.sent();
                        if (!sdkResponse.success) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: sdkResponse.error
                                }];
                        }
                        // Update order status
                        order.status = swap_1.LimitOrderStatus.CANCELLED;
                        this.orders.set(orderId, order);
                        logger_1.logger.info('Order cancelled successfully', {
                            orderId: orderId,
                            userAddress: userAddress,
                            timestamp: Date.now(),
                            service: 'cipherswap-custom-orderbook'
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: order
                            }];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error('Cancel order error', {
                            error: error_2.message,
                            orderId: orderId,
                            userAddress: userAddress,
                            timestamp: Date.now(),
                            service: 'cipherswap-custom-orderbook'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: 'Failed to cancel order'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get order status
     */
    CustomOrderbookService.prototype.getOrderStatus = function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var sdkResponse, localOrder, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sdkService.getOrderStatus(orderId)];
                    case 1:
                        sdkResponse = _a.sent();
                        if (!sdkResponse.success) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: sdkResponse.error
                                }];
                        }
                        localOrder = this.orders.get(orderId);
                        if (localOrder) {
                            localOrder.status = sdkResponse.data.status;
                            this.orders.set(orderId, localOrder);
                        }
                        return [2 /*return*/, {
                                success: true,
                                data: sdkResponse.data
                            }];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.logger.error('Get order status error', {
                            error: error_3.message,
                            orderId: orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-custom-orderbook'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: 'Failed to get order status'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all active orders
     */
    CustomOrderbookService.prototype.getActiveOrders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeOrders, _i, _a, order;
            return __generator(this, function (_b) {
                try {
                    activeOrders = [];
                    for (_i = 0, _a = this.orders.values(); _i < _a.length; _i++) {
                        order = _a[_i];
                        if (order.status === swap_1.LimitOrderStatus.PENDING) {
                            activeOrders.push(order);
                        }
                    }
                    return [2 /*return*/, activeOrders];
                }
                catch (error) {
                    logger_1.logger.error('Get active orders error', {
                        error: error.message,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Clean up expired orders
     */
    CustomOrderbookService.prototype.cleanupExpiredOrders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, expiredCount, _i, _a, _b, orderId, order;
            return __generator(this, function (_c) {
                try {
                    now = Date.now();
                    expiredCount = 0;
                    for (_i = 0, _a = this.orders.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], orderId = _b[0], order = _b[1];
                        if (order.status === swap_1.LimitOrderStatus.PENDING && now > order.deadline * 1000) {
                            order.status = swap_1.LimitOrderStatus.EXPIRED;
                            this.orders.set(orderId, order);
                            expiredCount++;
                        }
                    }
                    if (expiredCount > 0) {
                        logger_1.logger.info('Cleaned up expired orders', {
                            expiredCount: expiredCount,
                            timestamp: Date.now(),
                            service: 'cipherswap-custom-orderbook'
                        });
                    }
                }
                catch (error) {
                    logger_1.logger.error('Cleanup expired orders error', {
                        error: error.message,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Store custom order in orderbook
     */
    CustomOrderbookService.prototype.storeCustomOrder = function (orderData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Storing custom order in orderbook', {
                        orderId: orderData.orderId,
                        userAddress: orderData.userAddress,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    // Store order
                    this.orders.set(orderData.orderId, orderData);
                    // Update user orders index
                    if (!this.userOrders.has(orderData.userAddress)) {
                        this.userOrders.set(orderData.userAddress, new Set());
                    }
                    this.userOrders.get(orderData.userAddress).add(orderData.orderId);
                    logger_1.logger.info('Custom order stored successfully', {
                        orderId: orderData.orderId,
                        userAddress: orderData.userAddress,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                }
                catch (error) {
                    logger_1.logger.error('Store custom order error', {
                        error: error.message,
                        orderId: orderData.orderId,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update existing order in orderbook
     */
    CustomOrderbookService.prototype.updateOrder = function (orderId, updatedOrder) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Updating order in orderbook', {
                        orderId: orderId,
                        userAddress: updatedOrder.userAddress,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    // Check if order exists
                    if (!this.orders.has(orderId)) {
                        throw new Error('Order not found');
                    }
                    // Update order
                    this.orders.set(orderId, updatedOrder);
                    logger_1.logger.info('Order updated successfully', {
                        orderId: orderId,
                        userAddress: updatedOrder.userAddress,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                }
                catch (error) {
                    logger_1.logger.error('Update order error', {
                        error: error.message,
                        orderId: orderId,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update order status only
     */
    CustomOrderbookService.prototype.updateOrderStatus = function (orderId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Updating order status', {
                        orderId: orderId,
                        status: status,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    // Check if order exists
                    if (!this.orders.has(orderId)) {
                        throw new Error('Order not found');
                    }
                    order = this.orders.get(orderId);
                    // Update status
                    order.status = status;
                    // Update order
                    this.orders.set(orderId, order);
                    logger_1.logger.info('Order status updated successfully', {
                        orderId: orderId,
                        status: status,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                }
                catch (error) {
                    logger_1.logger.error('Update order status error', {
                        error: error.message,
                        orderId: orderId,
                        status: status,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get orderbook statistics
     */
    CustomOrderbookService.prototype.getOrderbookStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var orders, activeOrders, cancelledOrders, expiredOrders, stats;
            return __generator(this, function (_a) {
                try {
                    orders = Array.from(this.orders.values());
                    activeOrders = orders.filter(function (order) { return order.status === swap_1.LimitOrderStatus.PENDING; });
                    cancelledOrders = orders.filter(function (order) { return order.status === swap_1.LimitOrderStatus.CANCELLED; });
                    expiredOrders = orders.filter(function (order) { return order.status === swap_1.LimitOrderStatus.EXPIRED; });
                    stats = {
                        totalOrders: orders.length,
                        activeOrders: activeOrders.length,
                        cancelledOrders: cancelledOrders.length,
                        expiredOrders: expiredOrders.length,
                        totalUsers: this.userOrders.size
                    };
                    return [2 /*return*/, stats];
                }
                catch (error) {
                    logger_1.logger.error('Get orderbook stats error', {
                        error: error.message,
                        timestamp: Date.now(),
                        service: 'cipherswap-custom-orderbook'
                    });
                    return [2 /*return*/, {
                            totalOrders: 0,
                            activeOrders: 0,
                            cancelledOrders: 0,
                            expiredOrders: 0,
                            totalUsers: 0
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    // Private helper methods
    CustomOrderbookService.prototype.validateCustomLimitOrderRequest = function (params) {
        var errors = [];
        // Required fields
        if (!params.fromToken) {
            errors.push('fromToken is required');
        }
        if (!params.toToken) {
            errors.push('toToken is required');
        }
        if (!params.amount) {
            errors.push('amount is required');
        }
        if (!params.chainId) {
            errors.push('chainId is required');
        }
        if (!params.userAddress) {
            errors.push('userAddress is required');
        }
        if (!params.limitPrice) {
            errors.push('limitPrice is required');
        }
        if (!params.orderType) {
            errors.push('orderType is required');
        }
        // Amount validation
        if (params.amount) {
            var amount = parseFloat(params.amount);
            if (amount <= 0) {
                errors.push('Amount must be greater than 0');
            }
        }
        // Price validation
        if (params.limitPrice && parseFloat(params.limitPrice) <= 0) {
            errors.push('Limit price must be greater than 0');
        }
        // Order type validation
        if (params.orderType && !['buy', 'sell'].includes(params.orderType)) {
            errors.push('Order type must be either "buy" or "sell"');
        }
        // Token validation
        if (params.fromToken === params.toToken) {
            errors.push('fromToken and toToken cannot be the same');
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    CustomOrderbookService.prototype.getUserOrderCount = function (userAddress) {
        var userOrderSet = this.userOrders.get(userAddress);
        return userOrderSet ? userOrderSet.size : 0;
    };
    return CustomOrderbookService;
}());
exports.CustomOrderbookService = CustomOrderbookService;
