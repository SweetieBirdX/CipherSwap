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
exports.QuoteService = void 0;
var axios_1 = require("axios");
var env_1 = require("../config/env");
var logger_1 = require("../utils/logger");
var simulation_1 = require("../utils/simulation");
var quote_1 = require("../types/quote");
var QuoteService = /** @class */ (function () {
    function QuoteService() {
        this.baseUrl = 'https://api.1inch.dev';
        this.quoteHistory = new Map();
        this.apiKey = env_1.config.INCH_API_KEY;
        if (!this.apiKey) {
            throw new Error('1inch API key is required');
        }
        logger_1.logger.info('QuoteService initialized', {
            hasApiKey: !!this.apiKey,
            apiKeyLength: this.apiKey.length,
            apiKeyPrefix: this.apiKey.substring(0, 10) + '...'
        });
    }
    /**
     * Get spot price from 1inch API
     */
    QuoteService.prototype.getSpotPrice = function (fromToken, toToken, chainId) {
        return __awaiter(this, void 0, void 0, function () {
            var apiUrl, requestParams, response, price, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Getting spot price from 1inch API', {
                            fromToken: fromToken,
                            toToken: toToken,
                            chainId: chainId
                        });
                        apiUrl = "".concat(this.baseUrl, "/spot/v1/quote");
                        requestParams = {
                            src: fromToken,
                            dst: toToken,
                            amount: '1000000000000000000', // 1 ETH in wei
                            chainId: chainId
                        };
                        logger_1.logger.info('Calling 1inch spot API', {
                            url: apiUrl,
                            params: requestParams
                        });
                        return [4 /*yield*/, axios_1.default.get(apiUrl, {
                                params: requestParams,
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Accept': 'application/json'
                                },
                                timeout: 15000
                            })];
                    case 1:
                        response = _a.sent();
                        logger_1.logger.info('1inch spot API response received', {
                            status: response.status,
                            hasData: !!response.data,
                            dataKeys: response.data ? Object.keys(response.data) : []
                        });
                        if (response.status === 200 && response.data) {
                            price = response.data.toTokenAmount;
                            logger_1.logger.info('Spot price fetched successfully', {
                                fromToken: fromToken,
                                toToken: toToken,
                                price: price
                            });
                            return [2 /*return*/, {
                                    success: true,
                                    data: {
                                        price: price,
                                        fromToken: fromToken,
                                        toToken: toToken
                                    }
                                }];
                        }
                        else {
                            logger_1.logger.error('1inch spot API error', {
                                status: response.status,
                                data: response.data
                            });
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Failed to get spot price from 1inch API'
                                }];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error('Spot price fetch error', {
                            error: error_1.toString(),
                            stack: error_1.stack
                        });
                        errorMessage = this.handleQuoteError(error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: errorMessage
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get quote from 1inch API
     */
    QuoteService.prototype.getQuote = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, fromTokenAddress, toTokenAddress, amountInWei, apiUrl, requestParams, response, quoteData, error_2;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Getting quote from 1inch API', {
                            params: params,
                            amountType: typeof params.amount,
                            amountValue: params.amount,
                            parsedAmount: parseFloat(params.amount)
                        });
                        validation = this.validateQuoteRequest(params);
                        if (!validation.isValid) {
                            logger_1.logger.error('Quote validation failed', { errors: validation.errors });
                            return [2 /*return*/, {
                                    success: false,
                                    error: validation.errors.join(', ')
                                }];
                        }
                        fromTokenAddress = params.fromToken;
                        toTokenAddress = params.toToken;
                        logger_1.logger.info('Using token addresses directly', {
                            fromToken: params.fromToken,
                            fromTokenAddress: fromTokenAddress,
                            toToken: params.toToken,
                            toTokenAddress: toTokenAddress
                        });
                        amountInWei = (parseFloat(params.amount) * Math.pow(10, 18)).toString();
                        apiUrl = "".concat(this.baseUrl, "/swap/v5.2/").concat(params.chainId, "/quote");
                        requestParams = {
                            src: fromTokenAddress,
                            dst: toTokenAddress,
                            amount: amountInWei,
                            from: params.userAddress
                        };
                        logger_1.logger.info('Calling 1inch API', {
                            url: apiUrl,
                            params: requestParams,
                            hasApiKey: !!this.apiKey,
                            apiKeyPrefix: this.apiKey.substring(0, 10) + '...'
                        });
                        return [4 /*yield*/, axios_1.default.get(apiUrl, {
                                params: requestParams,
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Accept': 'application/json'
                                },
                                timeout: 15000 // 15 second timeout
                            })];
                    case 1:
                        response = _e.sent();
                        logger_1.logger.info('1inch API response received', {
                            status: response.status,
                            statusText: response.statusText,
                            hasData: !!response.data,
                            dataKeys: response.data ? Object.keys(response.data) : []
                        });
                        quoteData = this.formatQuoteResponse(response.data, params);
                        // Store quote in history
                        this.storeQuoteHistory(params, quoteData);
                        logger_1.logger.info('Quote received successfully', {
                            fromToken: params.fromToken,
                            toToken: params.toToken,
                            amount: params.amount,
                            slippage: quoteData.slippage
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: quoteData
                            }];
                    case 2:
                        error_2 = _e.sent();
                        logger_1.logger.error('Quote service error', {
                            error: error_2.message,
                            params: params,
                            status: (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.status,
                            statusText: (_b = error_2.response) === null || _b === void 0 ? void 0 : _b.statusText,
                            responseData: (_c = error_2.response) === null || _c === void 0 ? void 0 : _c.data,
                            responseHeaders: (_d = error_2.response) === null || _d === void 0 ? void 0 : _d.headers,
                            stack: error_2.stack
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: this.handleQuoteError(error_2)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Simulate swap with current quote
     */
    QuoteService.prototype.simulateSwap = function (quoteData, userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var simulation;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Simulating swap', { userAddress: userAddress });
                    simulation = simulation_1.SimulationUtils.simulateSwap(quoteData);
                    return [2 /*return*/, {
                            success: true,
                            data: __assign(__assign({}, simulation), { userAddress: userAddress, timestamp: Date.now() })
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Simulation error', { error: error.message });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Simulation failed'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get quote history for user
     */
    QuoteService.prototype.getQuoteHistory = function (userAddress_1) {
        return __awaiter(this, arguments, void 0, function (userAddress, limit) {
            var quotes;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Getting quote history', { userAddress: userAddress, limit: limit });
                    quotes = Array.from(this.quoteHistory.values());
                    // Filter by user address if provided
                    if (userAddress) {
                        quotes = quotes.filter(function (quote) { return quote.userAddress === userAddress; });
                    }
                    // Sort by timestamp (newest first)
                    quotes.sort(function (a, b) { return b.timestamp - a.timestamp; });
                    // Apply limit
                    quotes = quotes.slice(0, limit);
                    logger_1.logger.info('Quote history retrieved', {
                        count: quotes.length,
                        userAddress: userAddress
                    });
                    return [2 /*return*/, quotes];
                }
                catch (error) {
                    logger_1.logger.error('Get quote history error', { error: error.message });
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Store quote in history
     */
    QuoteService.prototype.storeQuoteHistory = function (params, quoteData) {
        var _this = this;
        var historyId = "quote_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        var quoteHistory = {
            id: historyId,
            fromToken: params.fromToken,
            toToken: params.toToken,
            amount: params.amount,
            quote: quoteData,
            timestamp: Date.now(),
            userAddress: params.userAddress
        };
        this.quoteHistory.set(historyId, quoteHistory);
        // Clean up old quotes (keep only last 100)
        if (this.quoteHistory.size > quote_1.QUOTE_CONSTANTS.MAX_QUOTE_HISTORY) {
            var sortedQuotes = Array.from(this.quoteHistory.entries())
                .sort(function (_a, _b) {
                var a = _a[1];
                var b = _b[1];
                return b.timestamp - a.timestamp;
            })
                .slice(0, quote_1.QUOTE_CONSTANTS.MAX_QUOTE_HISTORY);
            this.quoteHistory.clear();
            sortedQuotes.forEach(function (_a) {
                var id = _a[0], quote = _a[1];
                _this.quoteHistory.set(id, quote);
            });
        }
    };
    /**
     * Validate quote request parameters
     */
    QuoteService.prototype.validateQuoteRequest = function (params) {
        var errors = [];
        var warnings = [];
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
        // Amount validation
        if (params.amount) {
            var amount = parseFloat(params.amount);
            // QUOTE_CONSTANTS values are already in ETH units, not wei
            var minAmountEth = parseFloat(quote_1.QUOTE_CONSTANTS.MIN_AMOUNT);
            var maxAmountEth = parseFloat(quote_1.QUOTE_CONSTANTS.MAX_AMOUNT);
            logger_1.logger.info('Amount validation DEBUG', {
                inputAmount: params.amount,
                parsedAmount: amount,
                minAmountEth: minAmountEth,
                maxAmountEth: maxAmountEth,
                QUOTE_CONSTANTS_MIN: quote_1.QUOTE_CONSTANTS.MIN_AMOUNT,
                QUOTE_CONSTANTS_MAX: quote_1.QUOTE_CONSTANTS.MAX_AMOUNT,
                isAmountValid: amount >= minAmountEth && amount <= maxAmountEth
            });
            if (amount < minAmountEth) {
                errors.push("Amount too small. Minimum: ".concat(minAmountEth, " ETH"));
            }
            if (amount > maxAmountEth) {
                errors.push("Amount too large. Maximum: ".concat(maxAmountEth, " ETH"));
            }
        }
        // Slippage validation
        if (params.slippage && params.slippage > quote_1.QUOTE_CONSTANTS.MAX_SLIPPAGE) {
            errors.push("Slippage too high. Maximum: ".concat(quote_1.QUOTE_CONSTANTS.MAX_SLIPPAGE, "%"));
        }
        // Token validation (basic)
        if (params.fromToken === params.toToken) {
            errors.push('fromToken and toToken cannot be the same');
        }
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    };
    /**
     * Format 1inch API response
     */
    QuoteService.prototype.formatQuoteResponse = function (data, params) {
        logger_1.logger.info('Formatting quote response', {
            dataKeys: Object.keys(data),
            hasToAmount: !!data.toAmount,
            toAmount: data.toAmount
        });
        // Extract amounts from 1inch response
        var fromTokenAmount = params.amount; // User input amount in ETH
        var toTokenAmount = data.toAmount || '0'; // 1inch response amount in wei
        // Convert amounts to numbers for calculations
        var fromAmountEth = parseFloat(fromTokenAmount);
        var toAmountWei = parseFloat(toTokenAmount);
        // 1. DYNAMIC PRICE IMPACT CALCULATION
        var priceImpact = this.calculatePriceImpact(fromAmountEth, toAmountWei, params.toToken);
        // 2. DYNAMIC SLIPPAGE CALCULATION
        var slippage = this.calculateSlippage(params.slippage || 0.5, fromAmountEth, toAmountWei);
        // 3. DYNAMIC ESTIMATED GAINS CALCULATION
        var estimatedGains = this.calculateEstimatedGains(fromAmountEth, toAmountWei, params.fromToken, params.toToken);
        // Calculate gas estimate
        var gasEstimate = simulation_1.SimulationUtils.calculateGasCost(data.estimatedGas || '500000', '20000000000', // 20 gwei
        1 // Ethereum mainnet
        );
        // Extract protocol and route steps from 1inch response
        var protocol = this.extractProtocolFromResponse(data);
        var routeSteps = this.calculateRouteSteps(data);
        // Get token decimals for proper formatting
        var toTokenDecimals = this.getTokenDecimals(params.toToken);
        // Create a properly formatted quote response
        var formattedQuote = {
            quote: data,
            fromTokenAmount: fromTokenAmount,
            toTokenAmount: toTokenAmount,
            toTokenDecimals: toTokenDecimals,
            estimatedGas: gasEstimate,
            slippage: slippage,
            priceImpact: priceImpact,
            estimatedGains: estimatedGains.toString(), // Convert to string
            route: data.route || [],
            protocol: protocol,
            routeSteps: routeSteps,
            timestamp: Date.now()
        };
        logger_1.logger.info('Formatted quote response', {
            fromTokenAmount: formattedQuote.fromTokenAmount,
            toTokenAmount: formattedQuote.toTokenAmount,
            toTokenDecimals: formattedQuote.toTokenDecimals,
            priceImpact: formattedQuote.priceImpact,
            slippage: formattedQuote.slippage,
            estimatedGains: formattedQuote.estimatedGains
        });
        return formattedQuote;
    };
    /**
     * Calculate dynamic price impact based on trade size and liquidity
     */
    QuoteService.prototype.calculatePriceImpact = function (fromAmountEth, toAmountWei, toToken) {
        try {
            // Convert toAmount from wei to token units
            var toTokenDecimals = this.getTokenDecimals(toToken);
            var toAmountTokens = toAmountWei / Math.pow(10, toTokenDecimals);
            // Calculate price per ETH
            var pricePerEth = toAmountTokens / fromAmountEth;
            // Mock pool liquidity (in real scenario, this would come from DEX APIs)
            var poolLiquidity = this.getPoolLiquidity(toToken);
            // Calculate price impact using square root formula
            // Price Impact = (Trade Size / Pool Liquidity) * 100
            var tradeSizeUSD = fromAmountEth * this.getEthPrice(); // Convert to USD
            var priceImpact = (tradeSizeUSD / poolLiquidity) * 100;
            // Cap price impact at reasonable levels
            var cappedPriceImpact = Math.min(priceImpact, 10); // Max 10%
            logger_1.logger.info('Price impact calculation', {
                fromAmountEth: fromAmountEth,
                toAmountTokens: toAmountTokens,
                pricePerEth: pricePerEth,
                tradeSizeUSD: tradeSizeUSD,
                poolLiquidity: poolLiquidity,
                priceImpact: cappedPriceImpact
            });
            return Math.round(cappedPriceImpact * 100) / 100; // Round to 2 decimal places
        }
        catch (error) {
            logger_1.logger.error('Price impact calculation failed', { error: error.message });
            return 0.1; // Fallback to 0.1%
        }
    };
    /**
     * Calculate dynamic slippage based on user input and market conditions
     */
    QuoteService.prototype.calculateSlippage = function (userSlippage, fromAmountEth, toAmountWei) {
        try {
            // Base slippage from user input
            var slippage = userSlippage;
            // Adjust based on trade size
            if (fromAmountEth > 10) {
                slippage += 0.2; // Large trades get higher slippage
            }
            else if (fromAmountEth > 1) {
                slippage += 0.1; // Medium trades get moderate slippage
            }
            // Adjust based on market volatility (mock)
            var marketVolatility = this.getMarketVolatility();
            slippage += marketVolatility;
            // Cap slippage at reasonable levels
            var cappedSlippage = Math.min(slippage, 5); // Max 5%
            logger_1.logger.info('Slippage calculation', {
                userSlippage: userSlippage,
                fromAmountEth: fromAmountEth,
                marketVolatility: marketVolatility,
                finalSlippage: cappedSlippage
            });
            return Math.round(cappedSlippage * 10) / 10; // Round to 1 decimal place
        }
        catch (error) {
            logger_1.logger.error('Slippage calculation failed', { error: error.message });
            return userSlippage; // Fallback to user input
        }
    };
    /**
     * Calculate estimated gains based on price differences and arbitrage opportunities
     */
    QuoteService.prototype.calculateEstimatedGains = function (fromAmountEth, toAmountWei, fromToken, toToken) {
        try {
            // Get current market prices
            var fromTokenPrice = this.getTokenPrice(fromToken);
            var toTokenPrice = this.getTokenPrice(toToken);
            // Calculate expected vs actual amounts
            var expectedToAmount = (fromAmountEth * fromTokenPrice) / toTokenPrice;
            var actualToAmount = toAmountWei / Math.pow(10, this.getTokenDecimals(toToken));
            // Calculate gains as percentage
            var gainsPercentage = ((actualToAmount - expectedToAmount) / expectedToAmount) * 100;
            // Check for arbitrage opportunities
            var arbitrageGains = this.calculateArbitrageGains(fromToken, toToken, fromAmountEth);
            // Total gains
            var totalGains = gainsPercentage + arbitrageGains;
            logger_1.logger.info('Estimated gains calculation', {
                fromTokenPrice: fromTokenPrice,
                toTokenPrice: toTokenPrice,
                expectedToAmount: expectedToAmount,
                actualToAmount: actualToAmount,
                gainsPercentage: gainsPercentage,
                arbitrageGains: arbitrageGains,
                totalGains: totalGains
            });
            return Math.round(totalGains * 1000000) / 1000000; // Round to 6 decimal places
        }
        catch (error) {
            logger_1.logger.error('Estimated gains calculation failed', { error: error.message });
            return 0.002; // Fallback to 0.2%
        }
    };
    /**
     * Helper methods for price and liquidity data
     */
    QuoteService.prototype.getTokenDecimals = function (token) {
        // Token address to decimals mapping
        var tokenDecimals = {
            // Ethereum mainnet addresses
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 18, // WETH
            '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6, // USDC
            '0xdAC17F958D2ee523a2206206994597C13D831ec7': 6, // USDT
            '0x6B175474E89094C44Da98b954EedeAC495271d0F': 18, // DAI
            // Sepolia testnet addresses
            '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9': 18, // WETH
            '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238': 6, // USDC
            '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0': 6, // USDT
            '0x68194a729C2450ad26072b3D33ADaCbcef39D574': 18, // DAI
            // Token symbols (fallback)
            'ETH': 18,
            'USDC': 6,
            'USDT': 6,
            'DAI': 18
        };
        return tokenDecimals[token] || 18;
    };
    QuoteService.prototype.getEthPrice = function () {
        // Mock ETH price (in real scenario, this would come from price feeds)
        return 2000; // $2000 per ETH
    };
    QuoteService.prototype.getTokenPrice = function (token) {
        var prices = {
            'ETH': 2000,
            'USDC': 1,
            'USDT': 1,
            'DAI': 1
        };
        return prices[token] || 1;
    };
    QuoteService.prototype.getPoolLiquidity = function (token) {
        // Mock pool liquidity in USD
        var liquidity = {
            'USDC': 10000000, // $10M liquidity
            'USDT': 8000000, // $8M liquidity
            'DAI': 5000000 // $5M liquidity
        };
        return liquidity[token] || 1000000;
    };
    QuoteService.prototype.getMarketVolatility = function () {
        // Mock market volatility (in real scenario, this would come from market data)
        return Math.random() * 0.3; // 0-0.3% random volatility
    };
    QuoteService.prototype.calculateArbitrageGains = function (fromToken, toToken, amount) {
        // Mock arbitrage calculation
        // In real scenario, this would check multiple DEXes for price differences
        var priceDifferences = {
            'ETH-USDC': 0.05, // 0.05% arbitrage opportunity
            'ETH-USDT': 0.03, // 0.03% arbitrage opportunity
            'ETH-DAI': 0.02 // 0.02% arbitrage opportunity
        };
        var pair = "".concat(fromToken, "-").concat(toToken);
        return priceDifferences[pair] || 0;
    };
    /**
     * Handle different types of errors
     */
    QuoteService.prototype.handleQuoteError = function (error) {
        if (error.response) {
            var status_1 = error.response.status;
            var data = error.response.data;
            switch (status_1) {
                case 400:
                    return 'Invalid request parameters';
                case 401:
                    return 'Invalid API key';
                case 403:
                    return 'API key rate limit exceeded';
                case 404:
                    return 'Quote not found';
                case 429:
                    return 'Rate limit exceeded';
                case 500:
                    return '1inch API server error';
                default:
                    return (data === null || data === void 0 ? void 0 : data.message) || 'Unknown API error';
            }
        }
        if (error.code === 'ECONNABORTED') {
            return 'Request timeout';
        }
        if (error.code === 'ENOTFOUND') {
            return 'Network error';
        }
        return error.message || 'Unknown error';
    };
    /**
     * Get supported tokens for a chain
     */
    QuoteService.prototype.getSupportedTokens = function (chainId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, tokens, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Fetching supported tokens', { chainId: chainId });
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/swap/v5.2/tokens"), {
                                params: {
                                    chain: chainId
                                },
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Accept': 'application/json'
                                },
                                timeout: 10000
                            })];
                    case 1:
                        response = _b.sent();
                        tokens = response.data.tokens || [];
                        logger_1.logger.info('Supported tokens fetched successfully', {
                            chainId: chainId,
                            tokenCount: tokens.length
                        });
                        return [2 /*return*/, tokens];
                    case 2:
                        error_3 = _b.sent();
                        logger_1.logger.error('Error fetching supported tokens', {
                            error: error_3.message,
                            chainId: chainId,
                            status: (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.status
                        });
                        // Return common tokens as fallback
                        return [2 /*return*/, this.getFallbackTokens(chainId)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get fallback tokens when API fails
     */
    QuoteService.prototype.getFallbackTokens = function (chainId) {
        var commonTokens = {
            1: [
                { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
                { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
                { address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
                { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
                { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 }
            ],
            137: [
                { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC', name: 'Wrapped MATIC', decimals: 18 },
                { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
                { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6 }
            ],
            42161: [
                { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
                { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
                { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', symbol: 'USDC', name: 'USD Coin', decimals: 6 }
            ]
        };
        return commonTokens[chainId] || [];
    };
    /**
     * Convert token symbol to address
     */
    QuoteService.prototype.getTokenAddress = function (symbol, chainId) {
        var tokenMap = {
            11155111: {
                'ETH': '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // WETH on Sepolia
                'USDC': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
                'USDT': '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // USDT on Sepolia
                'DAI': '0x68194a729C2450ad26072b3D33ADaCbcef39D574' // DAI on Sepolia
            },
            1: {
                'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
                'USDC': '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
                'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
                'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
                '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEe': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // ETH alias
                '0xA0b86a33E6441b8c4C8C1d1BecBfC3AC09A21E70': '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC alias
            }
        };
        var chainTokens = tokenMap[chainId];
        if (!chainTokens) {
            throw new Error("Unsupported chain ID: ".concat(chainId));
        }
        var address = chainTokens[symbol];
        if (!address) {
            throw new Error("Unsupported token: ".concat(symbol, " on chain ").concat(chainId));
        }
        return address;
    };
    /**
     * Get real-time network analytics
     */
    QuoteService.prototype.getNetworkAnalytics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gasPrice, networkCongestion, riskLevel, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getRealGasPrice()];
                    case 1:
                        gasPrice = _a.sent();
                        networkCongestion = this.calculateNetworkCongestion(gasPrice);
                        riskLevel = this.calculateRiskLevel(gasPrice, networkCongestion);
                        logger_1.logger.info('Network analytics fetched', {
                            gasPrice: gasPrice,
                            networkCongestion: networkCongestion,
                            riskLevel: riskLevel
                        });
                        return [2 /*return*/, {
                                gasPrice: "".concat(gasPrice, " Gwei"),
                                networkCongestion: networkCongestion,
                                riskLevel: riskLevel,
                                chain: 'Ethereum Mainnet'
                            }];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('Network analytics fetch failed', { error: error_4.message });
                        // Fallback to mock data
                        return [2 /*return*/, {
                                gasPrice: '20 Gwei',
                                networkCongestion: 15,
                                riskLevel: 'LOW',
                                chain: 'Ethereum Mainnet'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get real gas price from Etherscan API
     */
    QuoteService.prototype.getRealGasPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, gasPrice, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        return [4 /*yield*/, axios_1.default.get('https://api.etherscan.io/api', {
                                params: {
                                    module: 'gastracker',
                                    action: 'gasoracle',
                                    apikey: 'YourApiKeyToken' // You'll need to get a free API key from Etherscan
                                },
                                timeout: 5000
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.data.status === '1' && response.data.result) {
                            gasPrice = parseInt(response.data.result.SafeGasPrice);
                            logger_1.logger.info('Real gas price fetched', { gasPrice: gasPrice });
                            return [2 /*return*/, gasPrice];
                        }
                        return [4 /*yield*/, this.getGasPriceFromRPC()];
                    case 2: 
                    // Fallback: Use Ethereum RPC
                    return [2 /*return*/, _a.sent()];
                    case 3:
                        error_5 = _a.sent();
                        logger_1.logger.error('Etherscan API failed', { error: error_5.message });
                        return [4 /*yield*/, this.getGasPriceFromRPC()];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get gas price from Ethereum RPC
     */
    QuoteService.prototype.getGasPriceFromRPC = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, gasPriceWei, gasPriceGwei, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.post('https://eth-mainnet.g.alchemy.com/v2/demo', {
                                jsonrpc: '2.0',
                                method: 'eth_gasPrice',
                                params: [],
                                id: 1
                            }, {
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                timeout: 5000
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.data.result) {
                            gasPriceWei = parseInt(response.data.result, 16);
                            gasPriceGwei = Math.round(gasPriceWei / 1000000000);
                            logger_1.logger.info('Gas price from RPC', { gasPriceGwei: gasPriceGwei });
                            return [2 /*return*/, gasPriceGwei];
                        }
                        throw new Error('Invalid RPC response');
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('RPC gas price failed', { error: error_6.message });
                        return [2 /*return*/, 20]; // Fallback gas price
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate network congestion based on gas price
     */
    QuoteService.prototype.calculateNetworkCongestion = function (gasPrice) {
        // Congestion calculation based on gas price ranges
        if (gasPrice < 20) {
            return Math.round((gasPrice / 20) * 30); // 0-30% for low gas
        }
        else if (gasPrice < 50) {
            return Math.round(30 + ((gasPrice - 20) / 30) * 40); // 30-70% for medium gas
        }
        else if (gasPrice < 100) {
            return Math.round(70 + ((gasPrice - 50) / 50) * 25); // 70-95% for high gas
        }
        else {
            return Math.round(95 + ((gasPrice - 100) / 100) * 5); // 95-100% for very high gas
        }
    };
    /**
     * Calculate risk level based on gas price and congestion
     */
    QuoteService.prototype.calculateRiskLevel = function (gasPrice, congestion) {
        var riskScore = (gasPrice * 0.6) + (congestion * 0.4);
        if (riskScore < 30)
            return 'LOW';
        if (riskScore < 60)
            return 'MEDIUM';
        if (riskScore < 80)
            return 'HIGH';
        return 'CRITICAL';
    };
    /**
     * Extract protocol information from 1inch response
     */
    QuoteService.prototype.extractProtocolFromResponse = function (data) {
        try {
            // Check if 1inch response has protocol information
            if (data.protocol) {
                return data.protocol;
            }
            // Check if route has protocol information
            if (data.route && data.route.length > 0) {
                var firstStep = data.route[0];
                if (firstStep.protocol) {
                    return firstStep.protocol;
                }
            }
            // Check if tx has protocol information
            if (data.tx && data.tx.protocol) {
                return data.tx.protocol;
            }
            // Default to 1inch aggregation
            return '1inch Aggregation';
        }
        catch (error) {
            logger_1.logger.error('Failed to extract protocol from response', { error: error.message });
            return '1inch Aggregation';
        }
    };
    /**
     * Calculate number of route steps from 1inch response
     */
    QuoteService.prototype.calculateRouteSteps = function (data) {
        try {
            // Check if route array exists
            if (data.route && Array.isArray(data.route)) {
                return data.route.length;
            }
            // Check if tx has path information
            if (data.tx && data.tx.path) {
                return data.tx.path.length;
            }
            // Check if there's a single step (direct swap)
            if (data.toAmount && data.fromAmount) {
                return 1;
            }
            // Default to 1 step
            return 1;
        }
        catch (error) {
            logger_1.logger.error('Failed to calculate route steps', { error: error.message });
            return 1;
        }
    };
    /**
     * Get multiple quotes for different tokens and strategies
     */
    QuoteService.prototype.getMultipleQuotes = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var popularTokens, tokenQuotes, validTokenQuotes, strategyQuotes, recommendations, error_7;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        logger_1.logger.info('Getting multiple quotes for analysis', {
                            params: params,
                            chainId: params.chainId,
                            fromToken: params.fromToken,
                            amount: params.amount
                        });
                        popularTokens = [
                            { symbol: 'USDC', address: this.getTokenAddress('USDC', params.chainId) },
                            { symbol: 'DAI', address: this.getTokenAddress('DAI', params.chainId) },
                            { symbol: 'USDT', address: this.getTokenAddress('USDT', params.chainId) },
                            { symbol: 'WETH', address: this.getTokenAddress('ETH', params.chainId) }
                        ];
                        logger_1.logger.info('Popular tokens for quotes', {
                            tokens: popularTokens.map(function (t) { return ({ symbol: t.symbol, address: t.address }); })
                        });
                        return [4 /*yield*/, Promise.all(popularTokens.map(function (token) { return __awaiter(_this, void 0, void 0, function () {
                                var quoteParams, quoteResponse, quote, gasCostEth, toTokenDecimals, toTokenAmountInWei, toTokenAmountInNormal, netValueInEth, error_8;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            logger_1.logger.info("Getting quote for ".concat(token.symbol), {
                                                symbol: token.symbol,
                                                address: token.address,
                                                chainId: params.chainId
                                            });
                                            quoteParams = __assign(__assign({}, params), { toToken: token.address });
                                            logger_1.logger.info("Calling getQuote for ".concat(token.symbol), {
                                                quoteParams: {
                                                    fromToken: quoteParams.fromToken,
                                                    toToken: quoteParams.toToken,
                                                    amount: quoteParams.amount,
                                                    chainId: quoteParams.chainId
                                                }
                                            });
                                            return [4 /*yield*/, this.getQuote(quoteParams)];
                                        case 1:
                                            quoteResponse = _a.sent();
                                            logger_1.logger.info("Quote response for ".concat(token.symbol), {
                                                success: quoteResponse.success,
                                                hasData: !!quoteResponse.data,
                                                error: quoteResponse.error
                                            });
                                            if (quoteResponse.success && quoteResponse.data) {
                                                quote = quoteResponse.data;
                                                gasCostEth = parseFloat(quote.estimatedGas) / Math.pow(10, 18);
                                                toTokenDecimals = quote.toTokenDecimals || 18;
                                                toTokenAmountInWei = parseFloat(quote.toTokenAmount || '0');
                                                toTokenAmountInNormal = toTokenAmountInWei / Math.pow(10, toTokenDecimals);
                                                netValueInEth = toTokenAmountInNormal - gasCostEth;
                                                logger_1.logger.info("Successfully calculated quote for ".concat(token.symbol), {
                                                    toTokenAmount: quote.toTokenAmount,
                                                    toTokenDecimals: quote.toTokenDecimals,
                                                    toTokenAmountInNormal: toTokenAmountInNormal,
                                                    gasCostEth: gasCostEth,
                                                    netValueInEth: netValueInEth
                                                });
                                                return [2 /*return*/, {
                                                        token: token.symbol,
                                                        tokenSymbol: token.symbol,
                                                        tokenAddress: token.address,
                                                        amount: toTokenAmountInNormal.toString(),
                                                        slippage: quote.slippage,
                                                        priceImpact: quote.priceImpact,
                                                        estimatedGas: quote.estimatedGas,
                                                        netValue: netValueInEth.toString(),
                                                        rank: 0 // Will be calculated later
                                                    }];
                                            }
                                            else {
                                                logger_1.logger.error("Quote failed for ".concat(token.symbol), {
                                                    error: quoteResponse.error,
                                                    success: quoteResponse.success
                                                });
                                                return [2 /*return*/, null];
                                            }
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_8 = _a.sent();
                                            logger_1.logger.error("Failed to get quote for ".concat(token.symbol), {
                                                error: error_8.toString(),
                                                stack: error_8.stack
                                            });
                                            return [2 /*return*/, null];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        tokenQuotes = _a.sent();
                        validTokenQuotes = tokenQuotes
                            .filter(function (quote) { return quote !== null; })
                            .sort(function (a, b) { return parseFloat(b.netValue) - parseFloat(a.netValue); })
                            .map(function (quote, index) { return (__assign(__assign({}, quote), { rank: index + 1 })); });
                        logger_1.logger.info('Valid token quotes', {
                            totalQuotes: tokenQuotes.length,
                            validQuotes: validTokenQuotes.length,
                            validQuoteSymbols: validTokenQuotes.map(function (q) { return q.tokenSymbol; })
                        });
                        return [4 /*yield*/, this.getRealStrategyQuotes(params, validTokenQuotes)];
                    case 2:
                        strategyQuotes = _a.sent();
                        recommendations = this.generateRecommendations(validTokenQuotes, strategyQuotes);
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    tokenQuotes: validTokenQuotes,
                                    strategyQuotes: strategyQuotes,
                                    recommendations: recommendations
                                }
                            }];
                    case 3:
                        error_7 = _a.sent();
                        logger_1.logger.error('Multiple quotes error', {
                            error: error_7.toString(),
                            stack: error_7.stack
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: 'Failed to get multiple quotes'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get real strategy gas estimates using various APIs
     */
    QuoteService.prototype.getRealStrategyQuotes = function (params, tokenQuotes) {
        return __awaiter(this, void 0, void 0, function () {
            var baseTokenQuote, baseNetValue, userSlippage, standardSlippage, mevSlippage, fusionSlippage, splitSlippage, standardGas, standardSecurity, mevGas, mevSecurity, fusionGas, fusionSecurity, splitGas, splitSecurity, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        baseTokenQuote = tokenQuotes[0];
                        if (!baseTokenQuote) {
                            return [2 /*return*/, this.getFallbackStrategyQuotes(params, tokenQuotes)];
                        }
                        baseNetValue = parseFloat(baseTokenQuote.netValue || '0');
                        userSlippage = params.slippage || 0.5;
                        standardSlippage = this.calculateSlippage(userSlippage, parseFloat(params.amount), 0);
                        mevSlippage = this.calculateSlippage(userSlippage * 0.6, parseFloat(params.amount), 0);
                        fusionSlippage = this.calculateSlippage(userSlippage * 1.6, parseFloat(params.amount), 0);
                        splitSlippage = this.calculateSlippage(userSlippage * 0.4, parseFloat(params.amount), 0);
                        return [4 /*yield*/, this.getStandardSwapGas(params)];
                    case 1:
                        standardGas = _a.sent();
                        return [4 /*yield*/, this.getStandardSwapSecurity(params, standardSlippage)];
                    case 2:
                        standardSecurity = _a.sent();
                        return [4 /*yield*/, this.getMEVProtectedGas(params)];
                    case 3:
                        mevGas = _a.sent();
                        return [4 /*yield*/, this.getMEVProtectedSecurity(params, mevSlippage)];
                    case 4:
                        mevSecurity = _a.sent();
                        return [4 /*yield*/, this.getFusionPlusGas(params)];
                    case 5:
                        fusionGas = _a.sent();
                        return [4 /*yield*/, this.getFusionPlusSecurity(params, fusionSlippage)];
                    case 6:
                        fusionSecurity = _a.sent();
                        return [4 /*yield*/, this.getSplitRoutingGas(params)];
                    case 7:
                        splitGas = _a.sent();
                        return [4 /*yield*/, this.getSplitRoutingSecurity(params, splitSlippage)];
                    case 8:
                        splitSecurity = _a.sent();
                        logger_1.logger.info('Strategy slippage calculations', {
                            userSlippage: userSlippage,
                            standardSlippage: standardSlippage,
                            mevSlippage: mevSlippage,
                            fusionSlippage: fusionSlippage,
                            splitSlippage: splitSlippage
                        });
                        return [2 /*return*/, [
                                {
                                    strategy: 'Standard Swap',
                                    description: 'Basic token swap with 1inch aggregation',
                                    gasCost: standardGas.toString(),
                                    slippage: standardSlippage,
                                    security: standardSecurity,
                                    netValue: (baseNetValue - standardGas).toString(),
                                    rank: 1
                                },
                                {
                                    strategy: 'MEV Protected',
                                    description: 'Flashbots bundle with MEV protection',
                                    gasCost: mevGas.toString(),
                                    slippage: mevSlippage,
                                    security: mevSecurity,
                                    netValue: (baseNetValue - mevGas).toString(),
                                    rank: 2
                                },
                                {
                                    strategy: 'Fusion+',
                                    description: 'Gasless swaps with 1inch Fusion+',
                                    gasCost: fusionGas.toString(),
                                    slippage: fusionSlippage,
                                    security: fusionSecurity,
                                    netValue: (baseNetValue - fusionGas).toString(),
                                    rank: 3
                                },
                                {
                                    strategy: 'Split Routing',
                                    description: 'Large trades split across multiple routes',
                                    gasCost: splitGas.toString(),
                                    slippage: splitSlippage,
                                    security: splitSecurity,
                                    netValue: (baseNetValue - splitGas).toString(),
                                    rank: 4
                                }
                            ]];
                    case 9:
                        error_9 = _a.sent();
                        logger_1.logger.error('Failed to get real strategy quotes', { error: error_9.toString() });
                        return [2 /*return*/, this.getFallbackStrategyQuotes(params, tokenQuotes)];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Standard Swap gas estimation from 1inch
     */
    QuoteService.prototype.getStandardSwapGas = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var response, gasInWei, gasInEth, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/swap/v5.2/").concat(params.chainId, "/quote"), {
                                params: {
                                    src: params.fromToken,
                                    dst: params.toToken,
                                    amount: (parseFloat(params.amount) * Math.pow(10, 18)).toString(),
                                    from: params.userAddress
                                },
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Accept': 'application/json'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.data && response.data.estimatedGas) {
                            gasInWei = parseFloat(response.data.estimatedGas);
                            gasInEth = gasInWei / Math.pow(10, 18);
                            return [2 /*return*/, gasInEth];
                        }
                        return [2 /*return*/, 0.012]; // Fallback
                    case 2:
                        error_10 = _a.sent();
                        logger_1.logger.error('Standard swap gas estimation failed', { error: error_10.toString() });
                        return [2 /*return*/, 0.012]; // Fallback
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Standard Swap security analysis
     */
    QuoteService.prototype.getStandardSwapSecurity = function (params, slippage) {
        return __awaiter(this, void 0, void 0, function () {
            var mevRisk, liquidityDepth, historicalSuccess, calculatedSlippage, securityScore, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getMEVRisk(params)];
                    case 1:
                        mevRisk = _a.sent();
                        return [4 /*yield*/, this.getLiquidityDepth(params)];
                    case 2:
                        liquidityDepth = _a.sent();
                        return [4 /*yield*/, this.getHistoricalSuccessRate('standard')];
                    case 3:
                        historicalSuccess = _a.sent();
                        calculatedSlippage = slippage || (params.slippage || 0.5);
                        securityScore = this.calculateSecurityScore({
                            mevRisk: mevRisk,
                            liquidityDepth: liquidityDepth,
                            historicalSuccess: historicalSuccess,
                            slippage: calculatedSlippage
                        });
                        logger_1.logger.info('Standard Swap security calculated', {
                            mevRisk: mevRisk,
                            liquidityDepth: liquidityDepth,
                            historicalSuccess: historicalSuccess,
                            slippage: calculatedSlippage,
                            securityScore: securityScore
                        });
                        return [2 /*return*/, this.getSecurityLevel(securityScore)];
                    case 4:
                        error_11 = _a.sent();
                        logger_1.logger.error('Standard swap security calculation failed', { error: error_11.toString() });
                        return [2 /*return*/, 'Medium']; // Fallback
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get MEV Protected gas estimation from Flashbots
     */
    QuoteService.prototype.getMEVProtectedGas = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var baseGas, mevGas, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getStandardSwapGas(params)];
                    case 1:
                        baseGas = _a.sent();
                        mevGas = baseGas * 1.25;
                        logger_1.logger.info('MEV Protected gas calculated', { baseGas: baseGas, mevGas: mevGas });
                        return [2 /*return*/, mevGas];
                    case 2:
                        error_12 = _a.sent();
                        logger_1.logger.error('MEV gas estimation failed', { error: error_12.toString() });
                        return [2 /*return*/, 0.015]; // Fallback
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get MEV Protected security analysis
     */
    QuoteService.prototype.getMEVProtectedSecurity = function (params, slippage) {
        return __awaiter(this, void 0, void 0, function () {
            var mevRisk, protectedMevRisk, liquidityDepth, historicalSuccess, calculatedSlippage, securityScore, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getMEVRisk(params)];
                    case 1:
                        mevRisk = _a.sent();
                        protectedMevRisk = mevRisk * 0.1;
                        return [4 /*yield*/, this.getLiquidityDepth(params)];
                    case 2:
                        liquidityDepth = _a.sent();
                        return [4 /*yield*/, this.getHistoricalSuccessRate('mev_protected')];
                    case 3:
                        historicalSuccess = _a.sent();
                        calculatedSlippage = slippage || (params.slippage || 0.5);
                        securityScore = this.calculateSecurityScore({
                            mevRisk: protectedMevRisk,
                            liquidityDepth: liquidityDepth,
                            historicalSuccess: historicalSuccess,
                            slippage: calculatedSlippage
                        });
                        logger_1.logger.info('MEV Protected security calculated', {
                            mevRisk: protectedMevRisk,
                            liquidityDepth: liquidityDepth,
                            historicalSuccess: historicalSuccess,
                            slippage: calculatedSlippage,
                            securityScore: securityScore
                        });
                        return [2 /*return*/, this.getSecurityLevel(securityScore)];
                    case 4:
                        error_13 = _a.sent();
                        logger_1.logger.error('MEV security calculation failed', { error: error_13.toString() });
                        return [2 /*return*/, 'High']; // Fallback
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Fusion+ gas estimation from 1inch Fusion API
     */
    QuoteService.prototype.getFusionPlusGas = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 1inch Fusion+ is gasless for users
                    // Gas is paid by the protocol
                    logger_1.logger.info('Fusion+ gasless calculation', { gasCost: 0 });
                    return [2 /*return*/, 0.000]; // Gasless for user
                }
                catch (error) {
                    logger_1.logger.error('Fusion+ gas estimation failed', { error: error.toString() });
                    return [2 /*return*/, 0.000]; // Fallback to gasless
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get Fusion+ security analysis
     */
    QuoteService.prototype.getFusionPlusSecurity = function (params, slippage) {
        return __awaiter(this, void 0, void 0, function () {
            var mevRisk, liquidityDepth, historicalSuccess, calculatedSlippage, securityScore, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        mevRisk = 0.05;
                        return [4 /*yield*/, this.getLiquidityDepth(params)];
                    case 1:
                        liquidityDepth = _a.sent();
                        return [4 /*yield*/, this.getHistoricalSuccessRate('fusion_plus')];
                    case 2:
                        historicalSuccess = _a.sent();
                        calculatedSlippage = slippage || (params.slippage || 0.5);
                        securityScore = this.calculateSecurityScore({
                            mevRisk: mevRisk,
                            liquidityDepth: liquidityDepth,
                            historicalSuccess: historicalSuccess,
                            slippage: calculatedSlippage
                        });
                        logger_1.logger.info('Fusion+ security calculated', {
                            mevRisk: mevRisk,
                            liquidityDepth: liquidityDepth,
                            historicalSuccess: historicalSuccess,
                            slippage: calculatedSlippage,
                            securityScore: securityScore
                        });
                        return [2 /*return*/, this.getSecurityLevel(securityScore)];
                    case 3:
                        error_14 = _a.sent();
                        logger_1.logger.error('Fusion+ security calculation failed', { error: error_14.toString() });
                        return [2 /*return*/, 'High']; // Fallback
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Split Routing gas estimation for TWAP
     */
    QuoteService.prototype.getSplitRoutingGas = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var baseGas, splitCount, splitGas, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getStandardSwapGas(params)];
                    case 1:
                        baseGas = _a.sent();
                        splitCount = Math.max(2, Math.ceil(parseFloat(params.amount) / 0.01));
                        splitGas = baseGas * splitCount * 1.1;
                        logger_1.logger.info('Split Routing gas calculated', { baseGas: baseGas, splitCount: splitCount, splitGas: splitGas });
                        return [2 /*return*/, splitGas];
                    case 2:
                        error_15 = _a.sent();
                        logger_1.logger.error('Split routing gas estimation failed', { error: error_15.toString() });
                        return [2 /*return*/, 0.020]; // Fallback
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Split Routing security analysis
     */
    QuoteService.prototype.getSplitRoutingSecurity = function (params, slippage) {
        return __awaiter(this, void 0, void 0, function () {
            var mevRisk, liquidityDepth, historicalSuccess, calculatedSlippage, securityScore, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getMEVRisk(params)];
                    case 1:
                        mevRisk = _a.sent();
                        return [4 /*yield*/, this.getLiquidityDepth(params)];
                    case 2:
                        liquidityDepth = _a.sent();
                        return [4 /*yield*/, this.getHistoricalSuccessRate('split_routing')];
                    case 3:
                        historicalSuccess = _a.sent();
                        calculatedSlippage = slippage || (params.slippage || 0.5);
                        securityScore = this.calculateSecurityScore({
                            mevRisk: mevRisk,
                            liquidityDepth: liquidityDepth,
                            historicalSuccess: historicalSuccess,
                            slippage: calculatedSlippage
                        });
                        logger_1.logger.info('Split Routing security calculated', {
                            mevRisk: mevRisk,
                            liquidityDepth: liquidityDepth,
                            historicalSuccess: historicalSuccess,
                            slippage: calculatedSlippage,
                            securityScore: securityScore
                        });
                        return [2 /*return*/, this.getSecurityLevel(securityScore)];
                    case 4:
                        error_16 = _a.sent();
                        logger_1.logger.error('Split routing security calculation failed', { error: error_16.toString() });
                        return [2 /*return*/, 'Medium']; // Fallback
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fallback strategy quotes when APIs fail
     */
    QuoteService.prototype.getFallbackStrategyQuotes = function (params, tokenQuotes) {
        var _a, _b;
        var baseNetValue = parseFloat(((_a = tokenQuotes[0]) === null || _a === void 0 ? void 0 : _a.netValue) || '0');
        var userSlippage = params.slippage || 0.5;
        // Calculate dynamic slippage for each strategy based on user input
        var standardSlippage = this.calculateSlippage(userSlippage, parseFloat(params.amount), 0);
        var mevSlippage = this.calculateSlippage(userSlippage * 0.6, parseFloat(params.amount), 0); // MEV protection reduces slippage
        var fusionSlippage = this.calculateSlippage(userSlippage * 1.6, parseFloat(params.amount), 0); // Fusion+ has higher slippage
        var splitSlippage = this.calculateSlippage(userSlippage * 0.4, parseFloat(params.amount), 0); // Split routing reduces slippage
        // Calculate realistic net values based on base token amount
        var baseTokenAmount = parseFloat(((_b = tokenQuotes[0]) === null || _b === void 0 ? void 0 : _b.amount) || '0');
        var gasCostStandard = 0.012;
        var gasCostMEV = 0.015;
        var gasCostFusion = 0.000;
        var gasCostSplit = 0.020;
        return [
            {
                strategy: 'Standard Swap',
                description: 'Basic token swap with 1inch aggregation',
                gasCost: gasCostStandard.toString(),
                slippage: standardSlippage,
                security: 'Medium',
                netValue: (baseTokenAmount - gasCostStandard).toString(),
                rank: 1
            },
            {
                strategy: 'MEV Protected',
                description: 'Flashbots bundle with MEV protection',
                gasCost: gasCostMEV.toString(),
                slippage: mevSlippage,
                security: 'High',
                netValue: (baseTokenAmount - gasCostMEV).toString(),
                rank: 2
            },
            {
                strategy: 'Fusion+',
                description: 'Gasless swaps with 1inch Fusion+',
                gasCost: gasCostFusion.toString(),
                slippage: fusionSlippage,
                security: 'High',
                netValue: (baseTokenAmount - gasCostFusion).toString(),
                rank: 3
            },
            {
                strategy: 'Split Routing',
                description: 'Large trades split across multiple routes',
                gasCost: gasCostSplit.toString(),
                slippage: splitSlippage,
                security: 'Medium',
                netValue: (baseTokenAmount - gasCostSplit).toString(),
                rank: 4
            }
        ];
    };
    /**
     * Generate recommendations based on quotes
     */
    QuoteService.prototype.generateRecommendations = function (tokenQuotes, strategyQuotes) {
        var recommendations = [];
        // Best value token
        if (tokenQuotes.length > 0) {
            var bestToken = tokenQuotes[0];
            var secondBest = tokenQuotes[1];
            var savingsPercentage = 0;
            if (secondBest) {
                var bestValue = parseFloat(bestToken.netValue);
                var secondValue = parseFloat(secondBest.netValue);
                if (bestValue > 0 && secondValue > 0) {
                    savingsPercentage = ((bestValue - secondValue) / secondValue) * 100;
                }
            }
            recommendations.push({
                type: 'BEST_VALUE',
                token: bestToken.token,
                reason: "".concat(bestToken.token, " offers the best net value"),
                savings: savingsPercentage > 0 ? "".concat(savingsPercentage.toFixed(1), "% better than alternatives") : 'Best option available'
            });
        }
        // Lowest slippage
        var lowestSlippageToken = tokenQuotes.reduce(function (min, current) {
            return current.slippage < min.slippage ? current : min;
        });
        if (lowestSlippageToken) {
            recommendations.push({
                type: 'LOWEST_SLIPPAGE',
                token: lowestSlippageToken.token,
                reason: "".concat(lowestSlippageToken.token, " has the lowest slippage"),
                savings: "".concat(lowestSlippageToken.slippage, "% slippage")
            });
        }
        // Most secure strategy
        var mostSecureStrategy = strategyQuotes.find(function (s) { return s.security === 'High'; });
        if (mostSecureStrategy) {
            recommendations.push({
                type: 'MOST_SECURE',
                strategy: mostSecureStrategy.strategy,
                reason: "".concat(mostSecureStrategy.strategy, " provides maximum security")
            });
        }
        // Gasless option
        var gaslessStrategy = strategyQuotes.find(function (s) { return s.gasCost === '0.000'; });
        if (gaslessStrategy) {
            recommendations.push({
                type: 'GASLESS',
                strategy: gaslessStrategy.strategy,
                reason: "".concat(gaslessStrategy.strategy, " eliminates gas costs"),
                savings: "Save ".concat(gaslessStrategy.gasCost, " ETH in gas")
            });
        }
        return recommendations;
    };
    /**
     * Get MEV risk analysis
     */
    QuoteService.prototype.getMEVRisk = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var tradeSizeUSD, tokenPair, sizeRisk, pairRisk, marketRisk, totalRisk;
            return __generator(this, function (_a) {
                try {
                    tradeSizeUSD = parseFloat(params.amount) * this.getEthPrice();
                    tokenPair = "".concat(params.fromToken, "-").concat(params.toToken);
                    sizeRisk = Math.min(tradeSizeUSD / 10000, 1);
                    pairRisk = this.getPairMEVRisk(tokenPair);
                    marketRisk = this.getMarketMEVRisk();
                    totalRisk = (sizeRisk * 0.4 + pairRisk * 0.4 + marketRisk * 0.2);
                    logger_1.logger.info('MEV risk calculated', {
                        tradeSizeUSD: tradeSizeUSD,
                        tokenPair: tokenPair,
                        sizeRisk: sizeRisk,
                        pairRisk: pairRisk,
                        marketRisk: marketRisk,
                        totalRisk: totalRisk
                    });
                    return [2 /*return*/, Math.min(totalRisk, 1)]; // Cap at 100%
                }
                catch (error) {
                    logger_1.logger.error('MEV risk calculation failed', { error: error.toString() });
                    return [2 /*return*/, 0.3]; // Default medium risk
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get liquidity depth analysis
     */
    QuoteService.prototype.getLiquidityDepth = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenPair, tradeSizeUSD, poolLiquidity, liquidityDepth;
            return __generator(this, function (_a) {
                try {
                    tokenPair = "".concat(params.fromToken, "-").concat(params.toToken);
                    tradeSizeUSD = parseFloat(params.amount) * this.getEthPrice();
                    poolLiquidity = this.getPoolLiquidity(params.toToken);
                    liquidityDepth = Math.min(tradeSizeUSD / poolLiquidity, 1);
                    logger_1.logger.info('Liquidity depth calculated', {
                        tokenPair: tokenPair,
                        tradeSizeUSD: tradeSizeUSD,
                        poolLiquidity: poolLiquidity,
                        liquidityDepth: liquidityDepth
                    });
                    return [2 /*return*/, liquidityDepth];
                }
                catch (error) {
                    logger_1.logger.error('Liquidity depth calculation failed', { error: error.toString() });
                    return [2 /*return*/, 0.5]; // Default medium depth
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get historical success rate for strategy
     */
    QuoteService.prototype.getHistoricalSuccessRate = function (strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var successRates, successRate;
            return __generator(this, function (_a) {
                try {
                    successRates = {
                        'standard': 0.95, // 95% success rate
                        'mev_protected': 0.98, // 98% success rate
                        'fusion_plus': 0.99, // 99% success rate
                        'split_routing': 0.92 // 92% success rate
                    };
                    successRate = successRates[strategy] || 0.95;
                    logger_1.logger.info('Historical success rate retrieved', { strategy: strategy, successRate: successRate });
                    return [2 /*return*/, successRate];
                }
                catch (error) {
                    logger_1.logger.error('Historical success rate calculation failed', { error: error.toString() });
                    return [2 /*return*/, 0.95]; // Default high success rate
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Calculate security score based on multiple factors
     */
    QuoteService.prototype.calculateSecurityScore = function (factors) {
        try {
            // Security score calculation (0-100)
            var mevScore = (1 - factors.mevRisk) * 30; // 30% weight
            var liquidityScore = (1 - factors.liquidityDepth) * 25; // 25% weight
            var successScore = factors.historicalSuccess * 30; // 30% weight
            var slippageScore = (1 - factors.slippage / 10) * 15; // 15% weight
            var totalScore = mevScore + liquidityScore + successScore + slippageScore;
            logger_1.logger.info('Security score calculated', {
                mevScore: mevScore,
                liquidityScore: liquidityScore,
                successScore: successScore,
                slippageScore: slippageScore,
                totalScore: totalScore
            });
            return Math.max(0, Math.min(100, totalScore));
        }
        catch (error) {
            logger_1.logger.error('Security score calculation failed', { error: error.toString() });
            return 70; // Default medium security
        }
    };
    /**
     * Get security level from score
     */
    QuoteService.prototype.getSecurityLevel = function (score) {
        if (score >= 85)
            return 'Very High';
        if (score >= 70)
            return 'High';
        if (score >= 50)
            return 'Medium';
        if (score >= 30)
            return 'Low';
        return 'Very Low';
    };
    /**
     * Get MEV risk for specific token pair
     */
    QuoteService.prototype.getPairMEVRisk = function (pair) {
        // MEV risk by token pair (mock data, would use real analytics)
        var pairRisks = {
            'ETH-USDC': 0.2, // Low risk
            'ETH-USDT': 0.3, // Medium risk
            'ETH-DAI': 0.25, // Medium-low risk
            'USDC-ETH': 0.2, // Low risk
            'USDT-ETH': 0.3, // Medium risk
            'DAI-ETH': 0.25 // Medium-low risk
        };
        return pairRisks[pair] || 0.3; // Default medium risk
    };
    /**
     * Get market-wide MEV risk
     */
    QuoteService.prototype.getMarketMEVRisk = function () {
        // Market-wide MEV risk (mock data, would use real-time analytics)
        var baseRisk = 0.25;
        var volatility = Math.random() * 0.2; // Random market volatility
        return Math.min(baseRisk + volatility, 1);
    };
    return QuoteService;
}());
exports.QuoteService = QuoteService;
exports.default = QuoteService;
