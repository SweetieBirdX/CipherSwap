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
exports.RealMarketDataService = void 0;
var ethers_1 = require("ethers");
var axios_1 = require("axios");
var logger_1 = require("../utils/logger");
var env_1 = require("../config/env");
var oneInchSpotPriceService_1 = require("./oneInchSpotPriceService");
var RealMarketDataService = /** @class */ (function () {
    function RealMarketDataService() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(env_1.config.ETHEREUM_RPC_URL);
        this.oneInchSpotPriceService = new oneInchSpotPriceService_1.OneInchSpotPriceService();
    }
    /**
     * Get real-time price using only 1inch Spot Price API
     */
    RealMarketDataService.prototype.getRealTimePrice = function (tokenAddress, tokenSymbol) {
        return __awaiter(this, void 0, void 0, function () {
            var oneInchData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Getting real-time price', { tokenAddress: tokenAddress, tokenSymbol: tokenSymbol });
                        return [4 /*yield*/, this.oneInchSpotPriceService.getSpotPriceWithFallback(tokenAddress)];
                    case 1:
                        oneInchData = _a.sent();
                        return [2 /*return*/, {
                                price: oneInchData.price,
                                timestamp: Date.now(),
                                source: oneInchData.source
                            }];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error('Failed to get real-time price', {
                            error: error_1.message,
                            tokenAddress: tokenAddress
                        });
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get price from 1inch API
     */
    RealMarketDataService.prototype.get1inchPrice = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var response, toAmount, fromAmount, price, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get('https://api.1inch.dev/swap/v5.2/quote', {
                                params: {
                                    src: tokenAddress,
                                    dst: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Correct USDC address
                                    amount: '1000000000000000000', // 1 token
                                    chain: 1,
                                    from: '0x0000000000000000000000000000000000000000'
                                },
                                headers: {
                                    'Authorization': "Bearer ".concat(env_1.config.INCH_API_KEY),
                                    'Accept': 'application/json'
                                },
                                timeout: 3000
                            })];
                    case 1:
                        response = _a.sent();
                        toAmount = BigInt(response.data.toTokenAmount);
                        fromAmount = BigInt('1000000000000000000');
                        price = Number(toAmount) / Number(fromAmount);
                        return [2 /*return*/, price];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("1inch API failed: ".concat(error_2.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate real volatility using historical data
     */
    RealMarketDataService.prototype.getVolatility = function (tokenAddress_1) {
        return __awaiter(this, arguments, void 0, function (tokenAddress, timeframe) {
            var historicalPrices, priceChanges, i, change, mean_1, variance, volatility, annualizedVolatility, error_3;
            if (timeframe === void 0) { timeframe = 24; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Calculating volatility', { tokenAddress: tokenAddress, timeframe: timeframe });
                        return [4 /*yield*/, this.getHistoricalPrices(tokenAddress, timeframe)];
                    case 1:
                        historicalPrices = _a.sent();
                        if (historicalPrices.length < 2) {
                            throw new Error('Insufficient historical data for volatility calculation');
                        }
                        priceChanges = [];
                        for (i = 1; i < historicalPrices.length; i++) {
                            change = (historicalPrices[i].price - historicalPrices[i - 1].price) / historicalPrices[i - 1].price;
                            priceChanges.push(change);
                        }
                        mean_1 = priceChanges.reduce(function (sum, change) { return sum + change; }, 0) / priceChanges.length;
                        variance = priceChanges.reduce(function (sum, change) { return sum + Math.pow(change - mean_1, 2); }, 0) / priceChanges.length;
                        volatility = Math.sqrt(variance);
                        annualizedVolatility = volatility * Math.sqrt(365);
                        return [2 /*return*/, {
                                volatility: annualizedVolatility,
                                period: timeframe,
                                confidence: this.calculateVolatilityConfidence(priceChanges.length)
                            }];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.logger.error('Volatility calculation failed', {
                            error: error_3.message,
                            tokenAddress: tokenAddress
                        });
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get real liquidity data from DEXs
     */
    RealMarketDataService.prototype.getLiquidity = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, uniswapLiquidity, sushiswapLiquidity, dexScreenerLiquidity, totalLiquidity, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Getting liquidity data', { tokenAddress: tokenAddress });
                        return [4 /*yield*/, Promise.allSettled([
                                this.getUniswapLiquidity(tokenAddress),
                                this.getSushiswapLiquidity(tokenAddress),
                                this.getDexScreenerLiquidity(tokenAddress)
                            ])];
                    case 1:
                        _a = _b.sent(), uniswapLiquidity = _a[0], sushiswapLiquidity = _a[1], dexScreenerLiquidity = _a[2];
                        totalLiquidity = (uniswapLiquidity.status === 'fulfilled' ? uniswapLiquidity.value : 0) +
                            (sushiswapLiquidity.status === 'fulfilled' ? sushiswapLiquidity.value : 0) +
                            (dexScreenerLiquidity.status === 'fulfilled' ? dexScreenerLiquidity.value : 0);
                        return [2 /*return*/, {
                                totalLiquidity: totalLiquidity,
                                uniswapLiquidity: uniswapLiquidity.status === 'fulfilled' ? uniswapLiquidity.value : 0,
                                sushiswapLiquidity: sushiswapLiquidity.status === 'fulfilled' ? sushiswapLiquidity.value : 0,
                                dexScreenerLiquidity: dexScreenerLiquidity.status === 'fulfilled' ? dexScreenerLiquidity.value : 0
                            }];
                    case 2:
                        error_4 = _b.sent();
                        logger_1.logger.error('Liquidity calculation failed', {
                            error: error_4.message,
                            tokenAddress: tokenAddress
                        });
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get comprehensive market data
     */
    RealMarketDataService.prototype.getMarketData = function (tokenAddress, tokenSymbol) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, priceData, volatilityData, liquidityData, trend, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Getting comprehensive market data', { tokenAddress: tokenAddress, tokenSymbol: tokenSymbol });
                        return [4 /*yield*/, Promise.all([
                                this.getRealTimePrice(tokenAddress, tokenSymbol),
                                this.getVolatility(tokenAddress),
                                this.getLiquidity(tokenAddress)
                            ])];
                    case 1:
                        _a = _b.sent(), priceData = _a[0], volatilityData = _a[1], liquidityData = _a[2];
                        trend = this.calculateTrend(priceData.price, volatilityData.volatility);
                        return [2 /*return*/, {
                                price: priceData.price,
                                volume24h: 0, // Would need additional API calls
                                marketCap: 0, // Would need additional API calls
                                priceChange24h: 0, // Would need additional API calls
                                volatility: volatilityData.volatility,
                                liquidity: liquidityData.totalLiquidity,
                                trend: trend
                            }];
                    case 2:
                        error_5 = _b.sent();
                        logger_1.logger.error('Market data retrieval failed', {
                            error: error_5.message,
                            tokenAddress: tokenAddress
                        });
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get historical prices for volatility calculation
     */
    RealMarketDataService.prototype.getHistoricalPrices = function (tokenAddress, hours) {
        return __awaiter(this, void 0, void 0, function () {
            var prices, now, i, timestamp, basePrice, randomVariation, price;
            return __generator(this, function (_a) {
                try {
                    prices = [];
                    now = Date.now();
                    // Generate mock historical data (replace with real API calls)
                    for (i = hours; i >= 0; i--) {
                        timestamp = now - (i * 60 * 60 * 1000);
                        basePrice = 1800;
                        randomVariation = (Math.random() - 0.5) * 0.1;
                        price = basePrice * (1 + randomVariation);
                        prices.push({
                            price: price,
                            timestamp: timestamp,
                            source: 'historical'
                        });
                    }
                    return [2 /*return*/, prices];
                }
                catch (error) {
                    throw new Error("Historical price retrieval failed: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get Uniswap liquidity
     */
    RealMarketDataService.prototype.getUniswapLiquidity = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This would require Uniswap V3 subgraph or direct contract calls
                    // For now, returning mock data
                    return [2 /*return*/, Math.random() * 10000000 + 1000000]; // 1M-11M USD
                }
                catch (error) {
                    throw new Error("Uniswap liquidity failed: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get Sushiswap liquidity
     */
    RealMarketDataService.prototype.getSushiswapLiquidity = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This would require Sushiswap subgraph or direct contract calls
                    // For now, returning mock data
                    return [2 /*return*/, Math.random() * 5000000 + 500000]; // 500K-5.5M USD
                }
                catch (error) {
                    throw new Error("Sushiswap liquidity failed: ".concat(error.message));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get DexScreener liquidity
     */
    RealMarketDataService.prototype.getDexScreenerLiquidity = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("https://api.dexscreener.com/latest/dex/tokens/".concat(tokenAddress), {
                                timeout: 3000
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.data.pairs && response.data.pairs.length > 0) {
                            return [2 /*return*/, response.data.pairs.reduce(function (total, pair) {
                                    var _a;
                                    return total + (parseFloat((_a = pair.liquidity) === null || _a === void 0 ? void 0 : _a.usd) || 0);
                                }, 0)];
                        }
                        return [2 /*return*/, 0];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.warn('DexScreener API failed', { error: error_6.message });
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate median of numbers
     */
    RealMarketDataService.prototype.calculateMedian = function (numbers) {
        var sorted = numbers.sort(function (a, b) { return a - b; });
        var middle = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        return sorted[middle];
    };
    /**
     * Calculate price variance
     */
    RealMarketDataService.prototype.calculatePriceVariance = function (prices) {
        var mean = prices.reduce(function (sum, price) { return sum + price; }, 0) / prices.length;
        var variance = prices.reduce(function (sum, price) { return sum + Math.pow(price - mean, 2); }, 0) / prices.length;
        return Math.sqrt(variance) / mean; // Coefficient of variation
    };
    /**
     * Calculate volatility confidence
     */
    RealMarketDataService.prototype.calculateVolatilityConfidence = function (dataPoints) {
        // More data points = higher confidence
        return Math.min(dataPoints / 100, 1.0);
    };
    /**
     * Calculate market trend
     */
    RealMarketDataService.prototype.calculateTrend = function (currentPrice, volatility) {
        // This is a simplified trend calculation
        // In production, you'd use more sophisticated analysis
        if (volatility > 0.5) {
            return 'NEUTRAL'; // High volatility = uncertain trend
        }
        // For now, return neutral
        // In production, compare with historical prices
        return 'NEUTRAL';
    };
    return RealMarketDataService;
}());
exports.RealMarketDataService = RealMarketDataService;
