"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.OrderbookService = void 0;
exports.buildLimitOrder1inch = buildLimitOrder1inch;
var logger_1 = require("../utils/logger");
var orderbook_1 = require("../types/orderbook");
var predicateService_1 = require("./predicateService");
// ====== LIMIT_ORDER_LOGIC (tolga) ======
var limit_order_sdk_1 = require("@1inch/limit-order-sdk");
/**
 * 1inch Limit Order oluşturucu (sadece orderType: 'limit' için)
 * @param params OrderbookRequest
 * @param authKey 1inch API Auth Key
 * @param maker Ethers Wallet instance
 */
function buildLimitOrder1inch(params, authKey, maker) {
    return __awaiter(this, void 0, void 0, function () {
        var expiresIn, expiration, UINT_40_MAX, makerTraits, order, typedData, signature, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    if (params.orderType !== 'limit') {
                        return [2 /*return*/, { success: false, error: 'Only limit orders are supported by buildLimitOrder1inch.' }];
                    }
                    expiresIn = BigInt((_a = params.deadline) !== null && _a !== void 0 ? _a : 120);
                    expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;
                    UINT_40_MAX = (1n << 40n) - 1n;
                    makerTraits = limit_order_sdk_1.MakerTraits.default()
                        .withExpiration(expiration)
                        .withNonce((0, limit_order_sdk_1.randBigInt)(UINT_40_MAX));
                    order = new limit_order_sdk_1.LimitOrder({
                        makerAsset: new limit_order_sdk_1.Address(params.fromToken),
                        takerAsset: new limit_order_sdk_1.Address(params.toToken),
                        makingAmount: BigInt(params.amount),
                        takingAmount: params.limitPrice ? BigInt(params.limitPrice) : BigInt(params.amount),
                        maker: new limit_order_sdk_1.Address(maker.address),
                    }, makerTraits);
                    typedData = order.getTypedData((_b = params.chainId) !== null && _b !== void 0 ? _b : 1);
                    return [4 /*yield*/, maker.signTypedData(typedData.domain, { Order: typedData.types.Order }, typedData.message)];
                case 1:
                    signature = _d.sent();
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                order: order,
                                signature: signature,
                                orderHash: order.getOrderHash((_c = params.chainId) !== null && _c !== void 0 ? _c : 1),
                                expiration: Number(expiration),
                            },
                        }];
                case 2:
                    error_1 = _d.sent();
                    return [2 /*return*/, { success: false, error: error_1.message }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// ====== END LIMIT_ORDER_LOGIC ======
var OrderbookService = /** @class */ (function () {
    function OrderbookService() {
        this.orders = new Map();
        this.userOrders = new Map(); // userAddress -> Set<orderId>
        this.resolverBots = new Map();
        this.predicateService = new predicateService_1.PredicateService();
        this.initializeMockData();
    }
    /**
     * Add order to off-chain orderbook
     */
    OrderbookService.prototype.addOrder = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, userOrderCount, ethers, config, provider, wallet, limitOrderResult, error_2, orderData, error_3;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 7, , 8]);
                        logger_1.logger.info('Adding order to off-chain orderbook', { params: params });
                        validation = this.validateOrderRequest(params);
                        if (!validation.isValid) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: validation.errors.join(', ')
                                }];
                        }
                        userOrderCount = this.getUserOrderCount(params.userAddress);
                        if (userOrderCount >= orderbook_1.ORDERBOOK_CONSTANTS.MAX_ORDERS_PER_USER) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Maximum orders per user exceeded (".concat(orderbook_1.ORDERBOOK_CONSTANTS.MAX_ORDERS_PER_USER, ")")
                                }];
                        }
                        if (!(params.orderType === 'limit')) return [3 /*break*/, 6];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('ethers'); })];
                    case 2:
                        ethers = (_e.sent()).ethers;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../config/env'); })];
                    case 3:
                        config = (_e.sent()).config;
                        provider = new ethers.JsonRpcProvider(config.ETHEREUM_RPC_URL);
                        wallet = new ethers.Wallet(config.PRIVATE_KEY, provider);
                        return [4 /*yield*/, buildLimitOrder1inch(params, config.INCH_LIMIT_ORDER_AUTH_KEY, wallet)];
                    case 4:
                        limitOrderResult = _e.sent();
                        if (!limitOrderResult.success) {
                            logger_1.logger.error('1inch limit order creation failed', {
                                error: limitOrderResult.error,
                                params: params,
                                service: 'cipherswap-orderbook'
                            });
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Limit order creation failed: ".concat(limitOrderResult.error)
                                }];
                        }
                        logger_1.logger.info('1inch limit order created successfully', {
                            orderHash: (_a = limitOrderResult.data) === null || _a === void 0 ? void 0 : _a.orderHash,
                            params: params,
                            service: 'cipherswap-orderbook'
                        });
                        // Add 1inch order data to the order
                        params.metadata = __assign(__assign({}, params.metadata), { inchOrderHash: (_b = limitOrderResult.data) === null || _b === void 0 ? void 0 : _b.orderHash, inchSignature: (_c = limitOrderResult.data) === null || _c === void 0 ? void 0 : _c.signature, inchExpiration: (_d = limitOrderResult.data) === null || _d === void 0 ? void 0 : _d.expiration });
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _e.sent();
                        logger_1.logger.error('Limit order integration error', {
                            error: error_2.message,
                            params: params,
                            service: 'cipherswap-orderbook'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Limit order integration failed: ".concat(error_2.message)
                            }];
                    case 6:
                        orderData = this.formatOrderData(params);
                        // Store order
                        this.orders.set(orderData.orderId, orderData);
                        // Update user orders index
                        if (!this.userOrders.has(params.userAddress)) {
                            this.userOrders.set(params.userAddress, new Set());
                        }
                        this.userOrders.get(params.userAddress).add(orderData.orderId);
                        logger_1.logger.info('Order added to off-chain orderbook successfully', {
                            orderId: orderData.orderId,
                            userAddress: params.userAddress,
                            orderType: params.orderType,
                            amount: params.amount
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: orderData
                            }];
                    case 7:
                        error_3 = _e.sent();
                        logger_1.logger.error('Add order to orderbook error', {
                            error: error_3.message,
                            params: params
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: 'Failed to add order to orderbook'
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get fillable orders for a resolver bot
     */
    OrderbookService.prototype.getFillableOrders = function (resolverAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var bot, fillableOrders, _i, _a, order, pair, orderSize, predicateValidation, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        logger_1.logger.info('Getting fillable orders for resolver', { resolverAddress: resolverAddress });
                        bot = this.resolverBots.get(resolverAddress);
                        if (!bot || !bot.isWhitelisted || !bot.isOnline) {
                            logger_1.logger.warn('Resolver bot not authorized or offline', { resolverAddress: resolverAddress });
                            return [2 /*return*/, []];
                        }
                        fillableOrders = [];
                        _i = 0, _a = this.orders.values();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        order = _a[_i];
                        // Check if order is active
                        if (order.status !== orderbook_1.OrderStatus.ACTIVE) {
                            return [3 /*break*/, 4];
                        }
                        // Check if order is expired
                        if (Date.now() > order.deadline) {
                            order.status = orderbook_1.OrderStatus.EXPIRED;
                            this.orders.set(order.orderId, order);
                            return [3 /*break*/, 4];
                        }
                        // Check if bot is allowed to fill this order
                        if (order.allowedSenders && order.allowedSenders.length > 0) {
                            if (!order.allowedSenders.includes(resolverAddress)) {
                                return [3 /*break*/, 4];
                            }
                        }
                        pair = "".concat(order.fromToken, "-").concat(order.toToken);
                        if (bot.allowedPairs && bot.allowedPairs.length > 0 && !bot.allowedPairs.includes(pair)) {
                            return [3 /*break*/, 4];
                        }
                        orderSize = parseFloat(order.fromAmount);
                        if (bot.minOrderSize && orderSize < bot.minOrderSize) {
                            return [3 /*break*/, 4];
                        }
                        if (bot.maxOrderSize && orderSize > bot.maxOrderSize) {
                            return [3 /*break*/, 4];
                        }
                        if (!order.predicateId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.predicateService.validatePredicate(order.predicateId)];
                    case 2:
                        predicateValidation = _c.sent();
                        if (!predicateValidation.success || !((_b = predicateValidation.data) === null || _b === void 0 ? void 0 : _b.isValid)) {
                            return [3 /*break*/, 4];
                        }
                        _c.label = 3;
                    case 3:
                        fillableOrders.push(order);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        logger_1.logger.info('Found fillable orders for resolver', {
                            resolverAddress: resolverAddress,
                            count: fillableOrders.length
                        });
                        return [2 /*return*/, fillableOrders];
                    case 6:
                        error_4 = _c.sent();
                        logger_1.logger.error('Get fillable orders error', {
                            error: error_4.message,
                            resolverAddress: resolverAddress
                        });
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate if a resolver bot is whitelisted
     */
    OrderbookService.prototype.validateResolver = function (botAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var bot;
            return __generator(this, function (_a) {
                bot = this.resolverBots.get(botAddress);
                return [2 /*return*/, !!(bot && bot.isWhitelisted && bot.isOnline)];
            });
        });
    };
    /**
     * Update order status
     */
    OrderbookService.prototype.updateOrderStatus = function (orderId, status, executionData) {
        return __awaiter(this, void 0, void 0, function () {
            var order;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Updating order status', { orderId: orderId, status: status, executionData: executionData });
                    order = this.orders.get(orderId);
                    if (!order) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Order not found'
                            }];
                    }
                    order.status = status;
                    order.executionAttempts += 1;
                    order.lastExecutionAttempt = Date.now();
                    if (executionData) {
                        order.executedBy = executionData.executedBy;
                        order.executionTxHash = executionData.executionTxHash;
                        order.executionTimestamp = executionData.executionTimestamp;
                    }
                    this.orders.set(orderId, order);
                    logger_1.logger.info('Order status updated successfully', {
                        orderId: orderId,
                        status: status,
                        executionData: executionData
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: order
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Update order status error', {
                        error: error.message,
                        orderId: orderId,
                        status: status
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to update order status'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get order by ID
     */
    OrderbookService.prototype.getOrder = function (orderId) {
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
                    logger_1.logger.error('Get order error', { error: error.message, orderId: orderId });
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
     * Query orders with filters
     */
    OrderbookService.prototype.queryOrders = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var filteredOrders, limit, page, startIndex, endIndex, paginatedOrders;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Querying orders', { query: query });
                    filteredOrders = Array.from(this.orders.values());
                    // Apply filters
                    if (query.userAddress) {
                        filteredOrders = filteredOrders.filter(function (order) { return order.userAddress === query.userAddress; });
                    }
                    if (query.fromToken) {
                        filteredOrders = filteredOrders.filter(function (order) { return order.fromToken === query.fromToken; });
                    }
                    if (query.toToken) {
                        filteredOrders = filteredOrders.filter(function (order) { return order.toToken === query.toToken; });
                    }
                    if (query.orderType) {
                        filteredOrders = filteredOrders.filter(function (order) { return order.orderType === query.orderType; });
                    }
                    if (query.orderSide) {
                        filteredOrders = filteredOrders.filter(function (order) { return order.orderSide === query.orderSide; });
                    }
                    if (query.chainId) {
                        filteredOrders = filteredOrders.filter(function (order) { return order.chainId === query.chainId; });
                    }
                    if (query.status) {
                        filteredOrders = filteredOrders.filter(function (order) { return order.status === query.status; });
                    }
                    // Sort orders
                    if (query.sortBy) {
                        filteredOrders.sort(function (a, b) {
                            var aValue, bValue;
                            switch (query.sortBy) {
                                case 'timestamp':
                                    aValue = a.timestamp;
                                    bValue = b.timestamp;
                                    break;
                                case 'amount':
                                    aValue = parseFloat(a.fromAmount);
                                    bValue = parseFloat(b.fromAmount);
                                    break;
                                case 'price':
                                    aValue = parseFloat(a.limitPrice || '0');
                                    bValue = parseFloat(b.limitPrice || '0');
                                    break;
                                default:
                                    aValue = a.timestamp;
                                    bValue = b.timestamp;
                            }
                            if (query.sortOrder === 'desc') {
                                return bValue - aValue;
                            }
                            return aValue - bValue;
                        });
                    }
                    limit = query.limit || 50;
                    page = query.page || 1;
                    startIndex = (page - 1) * limit;
                    endIndex = startIndex + limit;
                    paginatedOrders = filteredOrders.slice(startIndex, endIndex);
                    logger_1.logger.info('Orders queried successfully', {
                        total: filteredOrders.length,
                        returned: paginatedOrders.length,
                        page: page,
                        limit: limit
                    });
                    return [2 /*return*/, paginatedOrders];
                }
                catch (error) {
                    logger_1.logger.error('Query orders error', { error: error.message, query: query });
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get orderbook statistics
     */
    OrderbookService.prototype.getOrderbookStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var orders, activeOrders, totalVolume, averageOrderSize, pairStats_1, mostActivePairs, bots, onlineBots, whitelistedBots, stats;
            return __generator(this, function (_a) {
                try {
                    orders = Array.from(this.orders.values());
                    activeOrders = orders.filter(function (order) { return order.status === orderbook_1.OrderStatus.ACTIVE; });
                    totalVolume = orders
                        .filter(function (order) { return order.status === orderbook_1.OrderStatus.FILLED; })
                        .reduce(function (sum, order) { return sum + parseFloat(order.fromAmount); }, 0)
                        .toString();
                    averageOrderSize = orders.length > 0
                        ? (orders.reduce(function (sum, order) { return sum + parseFloat(order.fromAmount); }, 0) / orders.length).toString()
                        : '0';
                    pairStats_1 = new Map();
                    orders.forEach(function (order) {
                        var pair = "".concat(order.fromToken, "-").concat(order.toToken);
                        var current = pairStats_1.get(pair) || { volume: 0, count: 0 };
                        current.volume += parseFloat(order.fromAmount);
                        current.count += 1;
                        pairStats_1.set(pair, current);
                    });
                    mostActivePairs = Array.from(pairStats_1.entries())
                        .map(function (_a) {
                        var pair = _a[0], stats = _a[1];
                        return ({
                            pair: pair,
                            volume: stats.volume.toString(),
                            orderCount: stats.count
                        });
                    })
                        .sort(function (a, b) { return b.orderCount - a.orderCount; })
                        .slice(0, 5);
                    bots = Array.from(this.resolverBots.values());
                    onlineBots = bots.filter(function (bot) { return bot.isOnline; });
                    whitelistedBots = bots.filter(function (bot) { return bot.isWhitelisted; });
                    stats = {
                        totalOrders: orders.length,
                        activeOrders: activeOrders.length,
                        totalVolume: totalVolume,
                        averageOrderSize: averageOrderSize,
                        mostActivePairs: mostActivePairs,
                        resolverBots: {
                            total: bots.length,
                            online: onlineBots.length,
                            whitelisted: whitelistedBots.length
                        }
                    };
                    return [2 /*return*/, stats];
                }
                catch (error) {
                    logger_1.logger.error('Get orderbook stats error', { error: error.message });
                    return [2 /*return*/, {
                            totalOrders: 0,
                            activeOrders: 0,
                            totalVolume: '0',
                            averageOrderSize: '0',
                            mostActivePairs: [],
                            resolverBots: {
                                total: 0,
                                online: 0,
                                whitelisted: 0
                            }
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Add resolver bot to whitelist
     */
    OrderbookService.prototype.addResolverBot = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var bot;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Adding resolver bot', { params: params });
                    // Validate required fields
                    if (!params.address || !params.name || !params.allowedPairs || !params.maxOrderSize || !params.minOrderSize) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Missing required fields: address, name, allowedPairs, maxOrderSize, minOrderSize'
                            }];
                    }
                    bot = {
                        address: params.address,
                        name: params.name,
                        isWhitelisted: true,
                        allowedPairs: params.allowedPairs,
                        maxOrderSize: params.maxOrderSize,
                        minOrderSize: params.minOrderSize,
                        performanceMetrics: {
                            totalOrdersFilled: 0,
                            successRate: 100,
                            averageExecutionTime: 0,
                            totalVolume: '0',
                            reputation: 100
                        },
                        lastActive: Date.now(),
                        isOnline: true
                    };
                    this.resolverBots.set(params.address, bot);
                    logger_1.logger.info('Resolver bot added successfully', {
                        address: params.address,
                        name: params.name
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: bot
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Add resolver bot error', {
                        error: error.message,
                        params: params
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to add resolver bot'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update resolver bot status
     */
    OrderbookService.prototype.updateResolverBotStatus = function (botAddress, isOnline) {
        return __awaiter(this, void 0, void 0, function () {
            var bot;
            return __generator(this, function (_a) {
                try {
                    bot = this.resolverBots.get(botAddress);
                    if (!bot) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Resolver bot not found'
                            }];
                    }
                    bot.isOnline = isOnline;
                    bot.lastActive = Date.now();
                    this.resolverBots.set(botAddress, bot);
                    logger_1.logger.info('Resolver bot status updated', {
                        botAddress: botAddress,
                        isOnline: isOnline
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: bot
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Update resolver bot status error', {
                        error: error.message,
                        botAddress: botAddress
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to update resolver bot status'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get all resolver bots
     */
    OrderbookService.prototype.getResolverBots = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.resolverBots.values())];
            });
        });
    };
    /**
     * Clean up expired orders
     */
    OrderbookService.prototype.cleanupExpiredOrders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, expiredCount, _i, _a, _b, orderId, order;
            return __generator(this, function (_c) {
                try {
                    now = Date.now();
                    expiredCount = 0;
                    for (_i = 0, _a = this.orders.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], orderId = _b[0], order = _b[1];
                        if (order.status === orderbook_1.OrderStatus.ACTIVE && now > order.deadline) {
                            order.status = orderbook_1.OrderStatus.EXPIRED;
                            this.orders.set(orderId, order);
                            expiredCount++;
                        }
                    }
                    if (expiredCount > 0) {
                        logger_1.logger.info('Cleaned up expired orders', { expiredCount: expiredCount });
                    }
                }
                catch (error) {
                    logger_1.logger.error('Cleanup expired orders error', { error: error.message });
                }
                return [2 /*return*/];
            });
        });
    };
    // Private helper methods
    OrderbookService.prototype.validateOrderRequest = function (params) {
        var errors = [];
        if (!params.userAddress) {
            errors.push('userAddress is required');
        }
        if (!params.fromToken) {
            errors.push('fromToken is required');
        }
        if (!params.toToken) {
            errors.push('toToken is required');
        }
        if (!params.amount) {
            errors.push('amount is required');
        }
        if (!params.orderType) {
            errors.push('orderType is required');
        }
        if (!params.orderSide) {
            errors.push('orderSide is required');
        }
        if (!params.chainId) {
            errors.push('chainId is required');
        }
        if (params.amount) {
            var amount = parseFloat(params.amount);
            // Convert wei constants to ETH for comparison
            var minAmountEth = parseFloat(orderbook_1.ORDERBOOK_CONSTANTS.MIN_ORDER_SIZE) / Math.pow(10, 18);
            var maxAmountEth = parseFloat(orderbook_1.ORDERBOOK_CONSTANTS.MAX_ORDER_SIZE) / Math.pow(10, 18);
            if (amount < minAmountEth) {
                errors.push("Amount too small. Minimum: ".concat(minAmountEth, " ETH"));
            }
            if (amount > maxAmountEth) {
                errors.push("Amount too large. Maximum: ".concat(maxAmountEth, " ETH"));
            }
        }
        if (params.allowedSenders && params.allowedSenders.length > orderbook_1.ORDERBOOK_CONSTANTS.MAX_ALLOWED_SENDERS) {
            errors.push("Too many allowed senders. Maximum: ".concat(orderbook_1.ORDERBOOK_CONSTANTS.MAX_ALLOWED_SENDERS));
        }
        if (params.maxSlippage && (params.maxSlippage < 0 || params.maxSlippage > orderbook_1.ORDERBOOK_CONSTANTS.MAX_SLIPPAGE)) {
            errors.push("Invalid slippage. Must be between 0 and ".concat(orderbook_1.ORDERBOOK_CONSTANTS.MAX_SLIPPAGE, "%"));
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    OrderbookService.prototype.formatOrderData = function (params) {
        var orderId = "order_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        return {
            orderId: orderId,
            userAddress: params.userAddress,
            fromToken: params.fromToken,
            toToken: params.toToken,
            fromAmount: params.amount,
            toAmount: params.amount, // Will be calculated by quote service
            limitPrice: params.limitPrice,
            orderType: params.orderType,
            orderSide: params.orderSide,
            chainId: params.chainId,
            deadline: params.deadline || (Date.now() + orderbook_1.ORDERBOOK_CONSTANTS.ORDER_EXPIRY_TIME),
            status: orderbook_1.OrderStatus.PENDING,
            timestamp: Date.now(),
            useMEVProtection: params.useMEVProtection || false,
            allowedSenders: params.allowedSenders,
            maxSlippage: params.maxSlippage || orderbook_1.ORDERBOOK_CONSTANTS.DEFAULT_SLIPPAGE,
            executionAttempts: 0,
            fusionData: {
                isReady: false
            }
        };
    };
    OrderbookService.prototype.getUserOrderCount = function (userAddress) {
        var userOrderSet = this.userOrders.get(userAddress);
        return userOrderSet ? userOrderSet.size : 0;
    };
    OrderbookService.prototype.initializeMockData = function () {
        var _this = this;
        // Add some mock resolver bots
        var mockBots = [
            {
                address: '0xResolverBot1',
                name: 'Alpha Resolver',
                isWhitelisted: true,
                allowedPairs: ['0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b-0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '0xTokenA-0xTokenB'],
                maxOrderSize: 1000000000000000000000000, // 1M tokens in wei
                minOrderSize: 1000000000000000000, // 1 token in wei
                performanceMetrics: {
                    totalOrdersFilled: 150,
                    successRate: 98.5,
                    averageExecutionTime: 2500,
                    totalVolume: '500000000000000000000000',
                    reputation: 95
                },
                lastActive: Date.now(),
                isOnline: true
            },
            {
                address: '0xResolverBot2',
                name: 'Beta Resolver',
                isWhitelisted: true,
                allowedPairs: ['0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b-0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '0xTokenB-0xTokenC'],
                maxOrderSize: 1000000000000000000000000, // 1M tokens in wei
                minOrderSize: 1000000000000000000, // 1 token in wei
                performanceMetrics: {
                    totalOrdersFilled: 75,
                    successRate: 96.2,
                    averageExecutionTime: 3200,
                    totalVolume: '250000000000000000000000',
                    reputation: 88
                },
                lastActive: Date.now(),
                isOnline: true
            }
        ];
        mockBots.forEach(function (bot) {
            _this.resolverBots.set(bot.address, bot);
        });
        logger_1.logger.info('Orderbook service initialized with mock data', {
            resolverBots: mockBots.length
        });
    };
    return OrderbookService;
}());
exports.OrderbookService = OrderbookService;
