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
exports.RealTimeSwapService = void 0;
var axios_1 = require("axios");
var ethers_1 = require("ethers");
var env_1 = require("../config/env");
var logger_1 = require("../utils/logger");
var swapService_1 = require("./swapService");
var RealTimeSwapService = /** @class */ (function () {
    function RealTimeSwapService() {
        this.swapService = new swapService_1.SwapService();
        this.ethersProvider = new ethers_1.ethers.JsonRpcProvider(env_1.config.ETHEREUM_RPC_URL);
    }
    /**
     * Gerçek zamanlı swap analizi ve öneriler
     */
    RealTimeSwapService.prototype.analyzeAndRecommend = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPrice, marketConditions, riskAssessment, recommendations, _a, recommendedAction, confidence, reasoning, analysis, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        logger_1.logger.info('Starting real-time swap analysis', {
                            fromToken: params.fromToken,
                            toToken: params.toToken,
                            amount: params.amount,
                            userAddress: params.userAddress,
                            timestamp: Date.now()
                        });
                        return [4 /*yield*/, this.getCurrentPrice(params.fromToken, params.toToken)];
                    case 1:
                        currentPrice = _b.sent();
                        return [4 /*yield*/, this.analyzeMarketConditions(params)];
                    case 2:
                        marketConditions = _b.sent();
                        return [4 /*yield*/, this.assessRisks(params, currentPrice)];
                    case 3:
                        riskAssessment = _b.sent();
                        return [4 /*yield*/, this.generateRecommendations(params, currentPrice, marketConditions)];
                    case 4:
                        recommendations = _b.sent();
                        return [4 /*yield*/, this.determineBestAction(params, currentPrice, marketConditions, riskAssessment)];
                    case 5:
                        _a = _b.sent(), recommendedAction = _a.recommendedAction, confidence = _a.confidence, reasoning = _a.reasoning;
                        analysis = {
                            currentPrice: currentPrice,
                            recommendedAction: recommendedAction,
                            confidence: confidence,
                            reasoning: reasoning,
                            marketConditions: marketConditions,
                            recommendations: recommendations,
                            riskAssessment: riskAssessment
                        };
                        logger_1.logger.info('Real-time analysis completed', {
                            recommendedAction: recommendedAction,
                            confidence: confidence,
                            currentPrice: currentPrice,
                            timestamp: Date.now()
                        });
                        return [2 /*return*/, analysis];
                    case 6:
                        error_1 = _b.sent();
                        logger_1.logger.error('Real-time analysis failed', {
                            error: error_1 instanceof Error ? error_1.message : String(error_1),
                            params: {
                                fromToken: params.fromToken,
                                toToken: params.toToken,
                                amount: params.amount
                            },
                            timestamp: Date.now()
                        });
                        // Fallback analiz
                        return [2 /*return*/, this.getFallbackAnalysis(params)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gerçek swap işlemi gerçekleştirme
     */
    RealTimeSwapService.prototype.executeOptimizedSwap = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, optimizedParams, swapResponse, limitOrderParams, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.analyzeAndRecommend(params)];
                    case 1:
                        analysis = _c.sent();
                        optimizedParams = this.applyOptimizations(params, analysis.recommendations);
                        swapResponse = void 0;
                        if (!(analysis.recommendedAction === 'LIMIT_ORDER')) return [3 /*break*/, 3];
                        limitOrderParams = {
                            fromToken: params.fromToken,
                            toToken: params.toToken,
                            amount: params.amount,
                            limitPrice: analysis.recommendations.optimalAmount,
                            orderType: 'sell',
                            chainId: params.chainId,
                            userAddress: params.userAddress,
                            deadline: Math.floor(Date.now() / 1000) + 3600 // 1 saat
                        };
                        return [4 /*yield*/, this.swapService.createLimitOrder(limitOrderParams)];
                    case 2:
                        swapResponse = (_c.sent());
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(analysis.recommendedAction === 'SPLIT' && ((_a = analysis.recommendations.splitRecommendation) === null || _a === void 0 ? void 0 : _a.shouldSplit))) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.executeSplitSwap(optimizedParams, analysis.recommendations.splitRecommendation)];
                    case 4:
                        // Split swap gerçekleştir
                        swapResponse = _c.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.swapService.createSwap(optimizedParams)];
                    case 6:
                        // Normal swap gerçekleştir
                        swapResponse = _c.sent();
                        _c.label = 7;
                    case 7:
                        logger_1.logger.info('Optimized swap executed', {
                            recommendedAction: analysis.recommendedAction,
                            swapId: (_b = swapResponse.data) === null || _b === void 0 ? void 0 : _b.swapId,
                            success: swapResponse.success,
                            timestamp: Date.now()
                        });
                        return [2 /*return*/, swapResponse];
                    case 8:
                        error_2 = _c.sent();
                        logger_1.logger.error('Optimized swap execution failed', {
                            error: error_2 instanceof Error ? error_2.message : String(error_2),
                            params: {
                                fromToken: params.fromToken,
                                toToken: params.toToken,
                                amount: params.amount
                            },
                            timestamp: Date.now()
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Optimized swap failed: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error')
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Mevcut fiyat alma (gerçek implementasyon)
     */
    RealTimeSwapService.prototype.getCurrentPrice = function (fromToken, toToken) {
        return __awaiter(this, void 0, void 0, function () {
            var RealMarketDataService, marketDataService, priceData, error_3, response, toAmount, fromAmount, price, fallbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 8]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./realMarketDataService'); })];
                    case 1:
                        RealMarketDataService = (_a.sent()).RealMarketDataService;
                        marketDataService = new RealMarketDataService();
                        return [4 /*yield*/, marketDataService.getRealTimePrice(fromToken)];
                    case 2:
                        priceData = _a.sent();
                        return [2 /*return*/, priceData.price];
                    case 3:
                        error_3 = _a.sent();
                        logger_1.logger.warn('Failed to get current price, using fallback', {
                            error: error_3 instanceof Error ? error_3.message : String(error_3),
                            fromToken: fromToken,
                            toToken: toToken
                        });
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, axios_1.default.get('https://api.1inch.dev/swap/v5.2/quote', {
                                params: {
                                    src: fromToken,
                                    dst: toToken,
                                    amount: '1000000000000000000', // 1 token
                                    chain: 1, // Ethereum
                                    from: '0x0000000000000000000000000000000000000000'
                                },
                                headers: {
                                    'Authorization': "Bearer ".concat(env_1.config.INCH_API_KEY),
                                    'Accept': 'application/json'
                                },
                                timeout: 5000
                            })];
                    case 5:
                        response = _a.sent();
                        toAmount = BigInt(response.data.toTokenAmount);
                        fromAmount = BigInt('1000000000000000000');
                        price = Number(toAmount) / Number(fromAmount);
                        return [2 /*return*/, price];
                    case 6:
                        fallbackError_1 = _a.sent();
                        logger_1.logger.error('All price sources failed, using default', {
                            error: fallbackError_1 instanceof Error ? fallbackError_1.message : String(fallbackError_1),
                            fromToken: fromToken,
                            toToken: toToken
                        });
                        return [2 /*return*/, 1.8]; // Default ETH/USDC price
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Piyasa koşulları analizi (gerçek implementasyon)
     */
    RealTimeSwapService.prototype.analyzeMarketConditions = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var RealMarketDataService, marketDataService, marketData, volatility, volatilityLevel, liquidity, liquidityLevel, trend, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./realMarketDataService'); })];
                    case 1:
                        RealMarketDataService = (_a.sent()).RealMarketDataService;
                        marketDataService = new RealMarketDataService();
                        return [4 /*yield*/, marketDataService.getMarketData(params.fromToken)];
                    case 2:
                        marketData = _a.sent();
                        volatility = marketData.volatility;
                        volatilityLevel = volatility > 0.5 ? 'HIGH' : volatility > 0.2 ? 'MEDIUM' : 'LOW';
                        liquidity = marketData.liquidity;
                        liquidityLevel = liquidity > 10000000 ? 'HIGH' : liquidity > 1000000 ? 'MEDIUM' : 'LOW';
                        trend = marketData.trend;
                        return [2 /*return*/, {
                                volatility: volatilityLevel,
                                liquidity: liquidityLevel,
                                trend: trend
                            }];
                    case 3:
                        error_4 = _a.sent();
                        logger_1.logger.warn('Market analysis failed, using defaults', {
                            error: error_4 instanceof Error ? error_4.message : String(error_4)
                        });
                        return [2 /*return*/, {
                                volatility: 'MEDIUM',
                                liquidity: 'HIGH',
                                trend: 'NEUTRAL'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Risk değerlendirmesi
     */
    RealTimeSwapService.prototype.assessRisks = function (params, currentPrice) {
        return __awaiter(this, void 0, void 0, function () {
            var riskFactors, riskScore, amount, volatility, liquidity, overallRisk, mitigationStrategies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        riskFactors = [];
                        riskScore = 0;
                        amount = parseFloat(params.amount);
                        if (amount > 1000000000000000000000) { // 1000 ETH
                            riskFactors.push('Large trade size may cause high slippage');
                            riskScore += 2;
                        }
                        return [4 /*yield*/, this.getVolatility(params.fromToken, params.toToken)];
                    case 1:
                        volatility = _a.sent();
                        if (volatility > 0.15) {
                            riskFactors.push('High market volatility detected');
                            riskScore += 2;
                        }
                        return [4 /*yield*/, this.getLiquidity(params.fromToken, params.toToken)];
                    case 2:
                        liquidity = _a.sent();
                        if (liquidity < 100000) {
                            riskFactors.push('Low liquidity may cause execution issues');
                            riskScore += 3;
                        }
                        overallRisk = riskScore >= 6 ? 'CRITICAL' : riskScore >= 4 ? 'HIGH' : riskScore >= 2 ? 'MEDIUM' : 'LOW';
                        mitigationStrategies = [
                            'Consider splitting large trades',
                            'Use limit orders for volatile markets',
                            'Increase slippage tolerance for low liquidity pairs'
                        ];
                        return [2 /*return*/, {
                                overallRisk: overallRisk,
                                riskFactors: riskFactors,
                                mitigationStrategies: mitigationStrategies
                            }];
                }
            });
        });
    };
    /**
     * Optimizasyon önerileri
     */
    RealTimeSwapService.prototype.generateRecommendations = function (params, currentPrice, marketConditions) {
        return __awaiter(this, void 0, void 0, function () {
            var amount, optimalAmount, optimalSlippage, optimalGasPrice, gasPrice, splitRecommendation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        amount = parseFloat(params.amount);
                        optimalAmount = params.amount;
                        optimalSlippage = 0.5;
                        optimalGasPrice = '20000000000';
                        // Miktar optimizasyonu
                        if (amount > 100000000000000000000) { // 100 ETH
                            optimalAmount = (amount * 0.8).toString(); // %20 azalt
                        }
                        // Slippage optimizasyonu
                        if (marketConditions.volatility === 'HIGH') {
                            optimalSlippage = 1.0; // %1
                        }
                        else if (marketConditions.liquidity === 'LOW') {
                            optimalSlippage = 0.8; // %0.8
                        }
                        return [4 /*yield*/, this.ethersProvider.getFeeData()];
                    case 1:
                        gasPrice = _a.sent();
                        if (gasPrice.gasPrice) {
                            optimalGasPrice = gasPrice.gasPrice.toString();
                        }
                        if (amount > 500000000000000000000) { // 500 ETH
                            splitRecommendation = {
                                shouldSplit: true,
                                splitCount: 3,
                                splitAmounts: [
                                    (amount * 0.4).toString(),
                                    (amount * 0.35).toString(),
                                    (amount * 0.25).toString()
                                ],
                                intervals: [300, 600] // 5 dk, 10 dk
                            };
                        }
                        return [2 /*return*/, {
                                optimalAmount: optimalAmount,
                                optimalSlippage: optimalSlippage,
                                optimalGasPrice: optimalGasPrice,
                                splitRecommendation: splitRecommendation
                            }];
                }
            });
        });
    };
    /**
     * En iyi aksiyon belirleme
     */
    RealTimeSwapService.prototype.determineBestAction = function (params, currentPrice, marketConditions, riskAssessment) {
        return __awaiter(this, void 0, void 0, function () {
            var reasoning, confidence;
            return __generator(this, function (_a) {
                reasoning = [];
                confidence = 0.7;
                // Risk bazlı karar
                if (riskAssessment.overallRisk === 'CRITICAL') {
                    reasoning.push('High risk detected - recommending limit order');
                    return [2 /*return*/, {
                            recommendedAction: 'LIMIT_ORDER',
                            confidence: 0.9,
                            reasoning: reasoning
                        }];
                }
                // Piyasa koşulları bazlı karar
                if (marketConditions.volatility === 'HIGH') {
                    reasoning.push('High volatility - recommending wait or limit order');
                    confidence += 0.1;
                    if (marketConditions.trend === 'BULLISH') {
                        reasoning.push('Bullish trend detected - good time to swap');
                        return [2 /*return*/, {
                                recommendedAction: 'SWAP_NOW',
                                confidence: 0.8,
                                reasoning: reasoning
                            }];
                    }
                    else {
                        return [2 /*return*/, {
                                recommendedAction: 'WAIT',
                                confidence: 0.7,
                                reasoning: reasoning
                            }];
                    }
                }
                // Normal koşullar
                reasoning.push('Market conditions favorable for immediate swap');
                return [2 /*return*/, {
                        recommendedAction: 'SWAP_NOW',
                        confidence: 0.8,
                        reasoning: reasoning
                    }];
            });
        });
    };
    /**
     * Split swap gerçekleştirme
     */
    RealTimeSwapService.prototype.executeSplitSwap = function (params, splitRecommendation) {
        return __awaiter(this, void 0, void 0, function () {
            var swaps, _loop_1, this_1, i, successfulSwap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        swaps = [];
                        _loop_1 = function (i) {
                            var splitParams, swapResponse;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        splitParams = __assign(__assign({}, params), { amount: splitRecommendation.splitAmounts[i] });
                                        return [4 /*yield*/, this_1.swapService.createSwap(splitParams)];
                                    case 1:
                                        swapResponse = _b.sent();
                                        swaps.push(swapResponse);
                                        if (!(i < splitRecommendation.splitCount - 1)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, splitRecommendation.intervals[i] * 1000); })];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < splitRecommendation.splitCount)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        successfulSwap = swaps.find(function (swap) { return swap.success; });
                        return [2 /*return*/, successfulSwap || swaps[0]];
                }
            });
        });
    };
    /**
     * Optimizasyonları uygula
     */
    RealTimeSwapService.prototype.applyOptimizations = function (params, recommendations) {
        return __assign(__assign({}, params), { amount: recommendations.optimalAmount, slippage: recommendations.optimalSlippage });
    };
    /**
     * Fallback analiz
     */
    RealTimeSwapService.prototype.getFallbackAnalysis = function (params) {
        return {
            currentPrice: 1.8,
            recommendedAction: 'SWAP_NOW',
            confidence: 0.6,
            reasoning: ['Using fallback analysis due to API issues'],
            marketConditions: {
                volatility: 'MEDIUM',
                liquidity: 'HIGH',
                trend: 'NEUTRAL'
            },
            recommendations: {
                optimalAmount: params.amount,
                optimalSlippage: 0.5,
                optimalGasPrice: '20000000000'
            },
            riskAssessment: {
                overallRisk: 'MEDIUM',
                riskFactors: ['Limited market data available'],
                mitigationStrategies: ['Proceed with caution', 'Monitor execution']
            }
        };
    };
    /**
     * Yardımcı metodlar (gerçek implementasyon)
     */
    RealTimeSwapService.prototype.getVolatility = function (fromToken, toToken) {
        return __awaiter(this, void 0, void 0, function () {
            var RealMarketDataService, marketDataService, volatilityData, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./realMarketDataService'); })];
                    case 1:
                        RealMarketDataService = (_a.sent()).RealMarketDataService;
                        marketDataService = new RealMarketDataService();
                        return [4 /*yield*/, marketDataService.getVolatility(fromToken)];
                    case 2:
                        volatilityData = _a.sent();
                        return [2 /*return*/, volatilityData.volatility];
                    case 3:
                        error_5 = _a.sent();
                        logger_1.logger.warn('Failed to get real volatility, using default', {
                            error: error_5 instanceof Error ? error_5.message : String(error_5),
                            fromToken: fromToken,
                            toToken: toToken
                        });
                        return [2 /*return*/, 0.05]; // Default 5% volatility
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RealTimeSwapService.prototype.getLiquidity = function (fromToken, toToken) {
        return __awaiter(this, void 0, void 0, function () {
            var RealMarketDataService, marketDataService, liquidityData, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./realMarketDataService'); })];
                    case 1:
                        RealMarketDataService = (_a.sent()).RealMarketDataService;
                        marketDataService = new RealMarketDataService();
                        return [4 /*yield*/, marketDataService.getLiquidity(fromToken)];
                    case 2:
                        liquidityData = _a.sent();
                        return [2 /*return*/, liquidityData.totalLiquidity];
                    case 3:
                        error_6 = _a.sent();
                        logger_1.logger.warn('Failed to get real liquidity, using default', {
                            error: error_6 instanceof Error ? error_6.message : String(error_6),
                            fromToken: fromToken,
                            toToken: toToken
                        });
                        return [2 /*return*/, 5000000]; // Default 5M USD liquidity
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RealTimeSwapService.prototype.getTrend = function (fromToken, toToken) {
        return __awaiter(this, void 0, void 0, function () {
            var RealMarketDataService, marketDataService, marketData, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./realMarketDataService'); })];
                    case 1:
                        RealMarketDataService = (_a.sent()).RealMarketDataService;
                        marketDataService = new RealMarketDataService();
                        return [4 /*yield*/, marketDataService.getMarketData(fromToken)];
                    case 2:
                        marketData = _a.sent();
                        // Calculate trend based on market data
                        // This is a simplified calculation - in production you'd use more sophisticated analysis
                        if (marketData.trend === 'BULLISH') {
                            return [2 /*return*/, 0.02]; // 2% positive trend
                        }
                        else if (marketData.trend === 'BEARISH') {
                            return [2 /*return*/, -0.02]; // 2% negative trend
                        }
                        else {
                            return [2 /*return*/, 0.0]; // Neutral trend
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        logger_1.logger.warn('Failed to get real trend, using default', {
                            error: error_7 instanceof Error ? error_7.message : String(error_7),
                            fromToken: fromToken,
                            toToken: toToken
                        });
                        return [2 /*return*/, 0.01]; // Default 1% positive trend
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return RealTimeSwapService;
}());
exports.RealTimeSwapService = RealTimeSwapService;
