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
exports.RealTimeSwapController = void 0;
var realTimeSwapService_1 = require("../../services/realTimeSwapService");
var swapService_1 = require("../../services/swapService");
var logger_1 = require("../../utils/logger");
var RealTimeSwapController = /** @class */ (function () {
    function RealTimeSwapController() {
        this.realTimeService = new realTimeSwapService_1.RealTimeSwapService();
        this.swapService = new swapService_1.SwapService();
    }
    /**
     * Gerçek zamanlı swap analizi ve öneriler
     */
    RealTimeSwapController.prototype.analyzeAndRecommend = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var swapRequest, validation, analysis, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        swapRequest = req.body;
                        logger_1.logger.info('Real-time swap analysis requested', {
                            fromToken: swapRequest.fromToken,
                            toToken: swapRequest.toToken,
                            amount: swapRequest.amount,
                            userAddress: swapRequest.userAddress,
                            timestamp: Date.now()
                        });
                        validation = this.validateSwapRequest(swapRequest);
                        if (!validation.isValid) {
                            res.status(400).json({
                                success: false,
                                error: validation.errors.join(', '),
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.realTimeService.analyzeAndRecommend(swapRequest)];
                    case 1:
                        analysis = _a.sent();
                        res.status(200).json({
                            success: true,
                            data: analysis,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error('Real-time analysis controller error', {
                            error: error_1 instanceof Error ? error_1.message : String(error_1),
                            body: req.body,
                            timestamp: Date.now()
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Real-time analysis failed',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Optimize edilmiş swap işlemi gerçekleştirme
     */
    RealTimeSwapController.prototype.executeOptimizedSwap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var swapRequest, validation, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        swapRequest = req.body;
                        logger_1.logger.info('Optimized swap execution requested', {
                            fromToken: swapRequest.fromToken,
                            toToken: swapRequest.toToken,
                            amount: swapRequest.amount,
                            userAddress: swapRequest.userAddress,
                            timestamp: Date.now()
                        });
                        validation = this.validateSwapRequest(swapRequest);
                        if (!validation.isValid) {
                            res.status(400).json({
                                success: false,
                                error: validation.errors.join(', '),
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.realTimeService.executeOptimizedSwap(swapRequest)];
                    case 1:
                        result = _a.sent();
                        res.status(200).json({
                            success: result.success,
                            data: result.data,
                            error: result.error,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error('Optimized swap execution controller error', {
                            error: error_2 instanceof Error ? error_2.message : String(error_2),
                            body: req.body,
                            timestamp: Date.now()
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Optimized swap execution failed',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Piyasa durumu ve koşulları
     */
    RealTimeSwapController.prototype.getMarketStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fromToken, toToken, marketStatus, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, fromToken = _a.fromToken, toToken = _a.toToken;
                        if (!fromToken || !toToken) {
                            res.status(400).json({
                                success: false,
                                error: 'fromToken and toToken are required',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getMarketStatusData(fromToken, toToken)];
                    case 1:
                        marketStatus = _b.sent();
                        res.status(200).json({
                            success: true,
                            data: marketStatus,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        logger_1.logger.error('Market status controller error', {
                            error: error_3 instanceof Error ? error_3.message : String(error_3),
                            query: req.query,
                            timestamp: Date.now()
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Market status retrieval failed',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Swap simülasyonu ve sonuç analizi
     */
    RealTimeSwapController.prototype.simulateSwap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var swapRequest, validation, simulation, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        swapRequest = req.body;
                        logger_1.logger.info('Swap simulation requested', {
                            fromToken: swapRequest.fromToken,
                            toToken: swapRequest.toToken,
                            amount: swapRequest.amount,
                            userAddress: swapRequest.userAddress,
                            timestamp: Date.now()
                        });
                        validation = this.validateSwapRequest(swapRequest);
                        if (!validation.isValid) {
                            res.status(400).json({
                                success: false,
                                error: validation.errors.join(', '),
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.swapService.simulateSwapEnhanced(swapRequest)];
                    case 1:
                        simulation = _a.sent();
                        res.status(200).json({
                            success: simulation.success,
                            data: simulation.data,
                            error: simulation.error,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('Swap simulation controller error', {
                            error: error_4 instanceof Error ? error_4.message : String(error_4),
                            body: req.body,
                            timestamp: Date.now()
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Swap simulation failed',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gerçek zamanlı fiyat bilgisi
     */
    RealTimeSwapController.prototype.getCurrentPrice = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fromToken, toToken, price, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.params, fromToken = _a.fromToken, toToken = _a.toToken;
                        logger_1.logger.info('Current price requested', {
                            fromToken: fromToken,
                            toToken: toToken,
                            timestamp: Date.now()
                        });
                        return [4 /*yield*/, this.realTimeService['getCurrentPrice'](fromToken, toToken)];
                    case 1:
                        price = _b.sent();
                        res.status(200).json({
                            success: true,
                            data: {
                                fromToken: fromToken,
                                toToken: toToken,
                                price: price,
                                timestamp: Date.now()
                            },
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        logger_1.logger.error('Current price controller error', {
                            error: error_5 instanceof Error ? error_5.message : String(error_5),
                            params: req.params,
                            timestamp: Date.now()
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Price retrieval failed',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Limit order oluşturma
     */
    RealTimeSwapController.prototype.createLimitOrder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var limitOrderRequest, validation, result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        limitOrderRequest = req.body;
                        logger_1.logger.info('Limit order creation requested', {
                            fromToken: limitOrderRequest.fromToken,
                            toToken: limitOrderRequest.toToken,
                            amount: limitOrderRequest.amount,
                            limitPrice: limitOrderRequest.limitPrice,
                            orderType: limitOrderRequest.orderType,
                            userAddress: limitOrderRequest.userAddress,
                            timestamp: Date.now()
                        });
                        validation = this.validateLimitOrderRequest(limitOrderRequest);
                        if (!validation.isValid) {
                            res.status(400).json({
                                success: false,
                                error: validation.errors.join(', '),
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.swapService.createLimitOrder(limitOrderRequest)];
                    case 1:
                        result = _a.sent();
                        res.status(200).json({
                            success: result.success,
                            data: result.data,
                            error: result.error,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('Limit order creation controller error', {
                            error: error_6 instanceof Error ? error_6.message : String(error_6),
                            body: req.body,
                            timestamp: Date.now()
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Limit order creation failed',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Limit order durumu
     */
    RealTimeSwapController.prototype.getOrderStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var orderId, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        logger_1.logger.info('Order status requested', {
                            orderId: orderId,
                            timestamp: Date.now()
                        });
                        if (!orderId) {
                            res.status(400).json({
                                success: false,
                                error: 'orderId is required',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.swapService.getLimitOrderStatus(orderId)];
                    case 1:
                        result = _a.sent();
                        res.status(200).json({
                            success: result.success,
                            data: result.data,
                            error: result.error,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        logger_1.logger.error('Order status controller error', {
                            error: error_7 instanceof Error ? error_7.message : String(error_7),
                            params: req.params,
                            timestamp: Date.now()
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Order status retrieval failed',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Swap request validasyonu
     */
    RealTimeSwapController.prototype.validateSwapRequest = function (request) {
        var errors = [];
        if (!request.fromToken) {
            errors.push('fromToken is required');
        }
        if (!request.toToken) {
            errors.push('toToken is required');
        }
        if (!request.amount) {
            errors.push('amount is required');
        }
        if (!request.chainId) {
            errors.push('chainId is required');
        }
        if (!request.userAddress) {
            errors.push('userAddress is required');
        }
        if (request.fromToken === request.toToken) {
            errors.push('fromToken and toToken cannot be the same');
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    /**
     * Limit order request validasyonu
     */
    RealTimeSwapController.prototype.validateLimitOrderRequest = function (request) {
        var errors = [];
        if (!request.fromToken) {
            errors.push('fromToken is required');
        }
        if (!request.toToken) {
            errors.push('toToken is required');
        }
        if (!request.amount) {
            errors.push('amount is required');
        }
        if (!request.limitPrice) {
            errors.push('limitPrice is required');
        }
        if (!request.orderType) {
            errors.push('orderType is required');
        }
        if (!request.chainId) {
            errors.push('chainId is required');
        }
        if (!request.userAddress) {
            errors.push('userAddress is required');
        }
        if (!['buy', 'sell'].includes(request.orderType)) {
            errors.push('orderType must be either "buy" or "sell"');
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    /**
     * Piyasa durumu verisi
     */
    RealTimeSwapController.prototype.getMarketStatusData = function (fromToken, toToken) {
        return __awaiter(this, void 0, void 0, function () {
            var volatility, liquidity, trend, currentPrice, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.realTimeService['getVolatility'](fromToken, toToken)];
                    case 1:
                        volatility = _a.sent();
                        return [4 /*yield*/, this.realTimeService['getLiquidity'](fromToken, toToken)];
                    case 2:
                        liquidity = _a.sent();
                        return [4 /*yield*/, this.realTimeService['getTrend'](fromToken, toToken)];
                    case 3:
                        trend = _a.sent();
                        return [4 /*yield*/, this.realTimeService['getCurrentPrice'](fromToken, toToken)];
                    case 4:
                        currentPrice = _a.sent();
                        return [2 /*return*/, {
                                fromToken: fromToken,
                                toToken: toToken,
                                currentPrice: currentPrice,
                                marketConditions: {
                                    volatility: volatility > 0.1 ? 'HIGH' : volatility > 0.05 ? 'MEDIUM' : 'LOW',
                                    liquidity: liquidity > 1000000 ? 'HIGH' : liquidity > 100000 ? 'MEDIUM' : 'LOW',
                                    trend: trend > 0.02 ? 'BULLISH' : trend < -0.02 ? 'BEARISH' : 'NEUTRAL'
                                },
                                metrics: {
                                    volatilityScore: volatility,
                                    liquidityScore: liquidity,
                                    trendScore: trend
                                },
                                timestamp: Date.now()
                            }];
                    case 5:
                        error_8 = _a.sent();
                        logger_1.logger.warn('Market status data retrieval failed', {
                            error: error_8 instanceof Error ? error_8.message : String(error_8),
                            fromToken: fromToken,
                            toToken: toToken
                        });
                        return [2 /*return*/, {
                                fromToken: fromToken,
                                toToken: toToken,
                                currentPrice: 1.8,
                                marketConditions: {
                                    volatility: 'MEDIUM',
                                    liquidity: 'HIGH',
                                    trend: 'NEUTRAL'
                                },
                                metrics: {
                                    volatilityScore: 0.05,
                                    liquidityScore: 5000000,
                                    trendScore: 0.01
                                },
                                timestamp: Date.now()
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return RealTimeSwapController;
}());
exports.RealTimeSwapController = RealTimeSwapController;
