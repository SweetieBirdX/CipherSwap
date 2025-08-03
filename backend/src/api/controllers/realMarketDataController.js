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
exports.RealMarketDataController = void 0;
var realMarketDataService_1 = require("../../services/realMarketDataService");
var oneInchSpotPriceService_1 = require("../../services/oneInchSpotPriceService");
var logger_1 = require("../../utils/logger");
var marketDataService = new realMarketDataService_1.RealMarketDataService();
var oneInchSpotPriceService = new oneInchSpotPriceService_1.OneInchSpotPriceService();
var RealMarketDataController = /** @class */ (function () {
    function RealMarketDataController() {
    }
    RealMarketDataController.prototype.getPrice = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress, symbol, priceData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        tokenAddress = req.params.tokenAddress;
                        symbol = req.query.symbol;
                        return [4 /*yield*/, marketDataService.getRealTimePrice(tokenAddress, symbol)];
                    case 1:
                        priceData = _a.sent();
                        res.json({ success: true, data: priceData, timestamp: Date.now() });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error('Failed to get real-time price', { error: error_1.message });
                        res.status(500).json({ success: false, error: error_1.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RealMarketDataController.prototype.getVolatility = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress, _a, timeframe, volatilityData, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        tokenAddress = req.params.tokenAddress;
                        _a = req.query.timeframe, timeframe = _a === void 0 ? 24 : _a;
                        return [4 /*yield*/, marketDataService.getVolatility(tokenAddress, Number(timeframe))];
                    case 1:
                        volatilityData = _b.sent();
                        res.json({ success: true, data: volatilityData, timestamp: Date.now() });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.logger.error('Failed to get volatility data', { error: error_2.message });
                        res.status(500).json({ success: false, error: error_2.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RealMarketDataController.prototype.getLiquidity = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress, liquidityData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        tokenAddress = req.params.tokenAddress;
                        return [4 /*yield*/, marketDataService.getLiquidity(tokenAddress)];
                    case 1:
                        liquidityData = _a.sent();
                        res.json({ success: true, data: liquidityData, timestamp: Date.now() });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.logger.error('Failed to get liquidity data', { error: error_3.message });
                        res.status(500).json({ success: false, error: error_3.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RealMarketDataController.prototype.getComprehensive = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress, symbol, marketData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        tokenAddress = req.params.tokenAddress;
                        symbol = req.query.symbol;
                        return [4 /*yield*/, marketDataService.getMarketData(tokenAddress, symbol)];
                    case 1:
                        marketData = _a.sent();
                        res.json({ success: true, data: marketData, timestamp: Date.now() });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('Failed to get comprehensive market data', { error: error_4.message });
                        res.status(500).json({ success: false, error: error_4.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RealMarketDataController.prototype.getAllPrices = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tokens, tokensData, _i, tokens_1, token, priceData, error_5, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        tokens = [
                            {
                                address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
                                symbol: 'ETH',
                                name: 'Ethereum',
                                fallbackPrice: 2650.34,
                                fallbackChange: 1.87,
                                fallbackVolume: 15200000000,
                                fallbackMarketCap: 318000000000,
                                icon: 'Ξ',
                                color: '#627EEA'
                            },
                            {
                                address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                                symbol: 'USDC',
                                name: 'USD Coin',
                                fallbackPrice: 1.00,
                                fallbackChange: 0.01,
                                fallbackVolume: 8500000000,
                                fallbackMarketCap: 25000000000,
                                icon: '$',
                                color: '#2775CA'
                            },
                            {
                                address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                                symbol: 'USDT',
                                name: 'Tether',
                                fallbackPrice: 1.00,
                                fallbackChange: 0.02,
                                fallbackVolume: 72000000000,
                                fallbackMarketCap: 95000000000,
                                icon: '₮',
                                color: '#26A17B'
                            },
                            {
                                address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
                                symbol: 'BTC',
                                name: 'Bitcoin',
                                fallbackPrice: 43250.67,
                                fallbackChange: 2.45,
                                fallbackVolume: 28450000000,
                                fallbackMarketCap: 850000000000,
                                icon: '₿',
                                color: '#F7931A'
                            },
                            {
                                address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                                symbol: 'DAI',
                                name: 'Dai',
                                fallbackPrice: 1.00,
                                fallbackChange: 0.01,
                                fallbackVolume: 1200000000,
                                fallbackMarketCap: 5000000000,
                                icon: '◈',
                                color: '#F5AC37'
                            },
                            {
                                address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
                                symbol: 'LINK',
                                name: 'Chainlink',
                                fallbackPrice: 15.45,
                                fallbackChange: -1.23,
                                fallbackVolume: 850000000,
                                fallbackMarketCap: 8500000000,
                                icon: '🔗',
                                color: '#2A5ADA'
                            },
                            {
                                address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
                                symbol: 'UNI',
                                name: 'Uniswap',
                                fallbackPrice: 8.75,
                                fallbackChange: 3.45,
                                fallbackVolume: 450000000,
                                fallbackMarketCap: 5200000000,
                                icon: '🦄',
                                color: '#FF007A'
                            },
                            {
                                address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
                                symbol: 'AAVE',
                                name: 'Aave',
                                fallbackPrice: 245.67,
                                fallbackChange: 5.67,
                                fallbackVolume: 320000000,
                                fallbackMarketCap: 3600000000,
                                icon: '⚡',
                                color: '#B6509E'
                            },
                            {
                                address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
                                symbol: 'CRV',
                                name: 'Curve DAO Token',
                                fallbackPrice: 0.45,
                                fallbackChange: -2.34,
                                fallbackVolume: 180000000,
                                fallbackMarketCap: 400000000,
                                icon: '📈',
                                color: '#D53369'
                            },
                            {
                                address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
                                symbol: 'MKR',
                                name: 'Maker',
                                fallbackPrice: 1250.89,
                                fallbackChange: 1.89,
                                fallbackVolume: 150000000,
                                fallbackMarketCap: 1200000000,
                                icon: '🏛️',
                                color: '#1AAB9B'
                            },
                            {
                                address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
                                symbol: 'SNX',
                                name: 'Synthetix',
                                fallbackPrice: 2.34,
                                fallbackChange: -0.67,
                                fallbackVolume: 95000000,
                                fallbackMarketCap: 750000000,
                                icon: '⚖️',
                                color: '#00D1FF'
                            },
                            {
                                address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
                                symbol: 'COMP',
                                name: 'Compound',
                                fallbackPrice: 65.23,
                                fallbackChange: 2.12,
                                fallbackVolume: 85000000,
                                fallbackMarketCap: 650000000,
                                icon: '🏦',
                                color: '#00D5FF'
                            },
                            {
                                address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad9eC',
                                symbol: 'YFI',
                                name: 'yearn.finance',
                                fallbackPrice: 8500.12,
                                fallbackChange: -1.45,
                                fallbackVolume: 45000000,
                                fallbackMarketCap: 280000000,
                                icon: '🎯',
                                color: '#006AE3'
                            },
                            {
                                address: '0xba100000625a3754423978a60c9317c58a424e3D',
                                symbol: 'BAL',
                                name: 'Balancer',
                                fallbackPrice: 3.45,
                                fallbackChange: 0.89,
                                fallbackVolume: 35000000,
                                fallbackMarketCap: 180000000,
                                icon: '⚖️',
                                color: '#E3E3E3'
                            },
                            {
                                address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
                                symbol: 'SUSHI',
                                name: 'SushiSwap',
                                fallbackPrice: 1.23,
                                fallbackChange: -0.34,
                                fallbackVolume: 25000000,
                                fallbackMarketCap: 150000000,
                                icon: '🍣',
                                color: '#FA52A0'
                            }
                        ];
                        tokensData = [];
                        _i = 0, tokens_1 = tokens;
                        _a.label = 1;
                    case 1:
                        if (!(_i < tokens_1.length)) return [3 /*break*/, 6];
                        token = tokens_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, marketDataService.getRealTimePrice(token.address, token.symbol)];
                    case 3:
                        priceData = _a.sent();
                        tokensData.push({
                            symbol: token.symbol,
                            name: token.name,
                            price: priceData.price || token.fallbackPrice,
                            change24h: token.fallbackChange, // Will be calculated separately
                            volume24h: token.fallbackVolume,
                            marketCap: token.fallbackMarketCap,
                            icon: token.icon,
                            color: token.color
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        logger_1.logger.warn("Failed to get price for ".concat(token.symbol), { error: error_5.message });
                        // Add fallback data
                        tokensData.push({
                            symbol: token.symbol,
                            name: token.name,
                            price: token.fallbackPrice,
                            change24h: token.fallbackChange,
                            volume24h: token.fallbackVolume,
                            marketCap: token.fallbackMarketCap,
                            icon: token.icon,
                            color: token.color
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        res.json({
                            success: true,
                            data: { tokens: tokensData },
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_6 = _a.sent();
                        logger_1.logger.error('Failed to get all prices', { error: error_6.message });
                        res.status(500).json({ success: false, error: error_6.message });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get 1inch Spot Price for a token
     */
    RealMarketDataController.prototype.getOneInchSpotPrice = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress, _a, currency, spotPriceData, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        tokenAddress = req.params.tokenAddress;
                        _a = req.query.currency, currency = _a === void 0 ? 'USD' : _a;
                        logger_1.logger.info('Getting 1inch spot price', { tokenAddress: tokenAddress, currency: currency });
                        return [4 /*yield*/, oneInchSpotPriceService.getSpotPriceWithFallback(tokenAddress, currency)];
                    case 1:
                        spotPriceData = _b.sent();
                        logger_1.logger.info('1inch spot price result', {
                            address: tokenAddress,
                            price: spotPriceData.price,
                            source: spotPriceData.source
                        });
                        res.json({
                            success: true,
                            data: spotPriceData,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        logger_1.logger.error('Failed to get 1inch spot price', {
                            error: error_7.message,
                            tokenAddress: req.params.tokenAddress,
                            currency: req.query.currency
                        });
                        res.status(500).json({ success: false, error: error_7.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get multiple 1inch Spot Prices
     */
    RealMarketDataController.prototype.getMultipleOneInchSpotPrices = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var addresses, _a, currency, spotPricesData, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        addresses = req.body.addresses;
                        _a = req.query.currency, currency = _a === void 0 ? 'USD' : _a;
                        if (!addresses || !Array.isArray(addresses)) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    error: 'Addresses array is required'
                                })];
                        }
                        logger_1.logger.info('Getting multiple 1inch spot prices', { addresses: addresses, currency: currency });
                        return [4 /*yield*/, oneInchSpotPriceService.getMultipleSpotPrices(addresses, currency)];
                    case 1:
                        spotPricesData = _b.sent();
                        logger_1.logger.info('Multiple 1inch spot prices result', {
                            count: spotPricesData.length,
                            addresses: addresses.length
                        });
                        res.json({
                            success: true,
                            data: { prices: spotPricesData },
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        logger_1.logger.error('Failed to get multiple 1inch spot prices', {
                            error: error_8.message,
                            addresses: req.body.addresses,
                            currency: req.query.currency
                        });
                        res.status(500).json({ success: false, error: error_8.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get available currencies from 1inch
     */
    RealMarketDataController.prototype.getOneInchCurrencies = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var currenciesData, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, oneInchSpotPriceService.getCurrencies()];
                    case 1:
                        currenciesData = _a.sent();
                        res.json({
                            success: true,
                            data: currenciesData,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        logger_1.logger.error('Failed to get 1inch currencies', { error: error_9.message });
                        res.status(500).json({ success: false, error: error_9.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return RealMarketDataController;
}());
exports.RealMarketDataController = RealMarketDataController;
