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
exports.OneInchSpotPriceService = void 0;
var axios_1 = require("axios");
var logger_1 = require("../utils/logger");
var env_1 = require("../config/env");
var OneInchSpotPriceService = /** @class */ (function () {
    function OneInchSpotPriceService() {
        this.baseUrl = 'https://api.1inch.dev/price/v1.1/1';
        this.apiKey = env_1.config.INCH_API_KEY || '';
        if (!this.apiKey) {
            logger_1.logger.warn('1inch API key not found, some features may not work');
        }
    }
    /**
     * Get spot price for a single token
     * According to 1inch docs: GET /v1.1/1/{addresses}
     */
    OneInchSpotPriceService.prototype.getSpotPrice = function (address_1) {
        return __awaiter(this, arguments, void 0, function (address, currency) {
            var response, priceValue, price, error_1;
            var _a;
            if (currency === void 0) { currency = 'USD'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Getting 1inch spot price', { address: address, currency: currency });
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/").concat(address), {
                                params: {
                                    currency: currency
                                },
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Accept': 'application/json'
                                },
                                timeout: 10000
                            })];
                    case 1:
                        response = _b.sent();
                        logger_1.logger.info('1inch API response', {
                            status: response.status,
                            data: response.data,
                            address: address
                        });
                        priceValue = response.data[address.toLowerCase()];
                        if (!priceValue || typeof priceValue !== 'string') {
                            throw new Error('Invalid response from 1inch Spot Price API - missing price');
                        }
                        price = parseFloat(priceValue);
                        if (isNaN(price)) {
                            throw new Error('Invalid price value from 1inch API');
                        }
                        return [2 /*return*/, {
                                price: price,
                                timestamp: Date.now(),
                                source: '1inch-spot',
                                currency: currency,
                                address: address
                            }];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('1inch Spot Price API failed', {
                            error: error_1.message,
                            address: address,
                            currency: currency,
                            response: (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data
                        });
                        throw new Error("1inch Spot Price API failed: ".concat(error_1.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get spot prices for multiple tokens
     * According to 1inch docs: GET /v1.1/1/{addresses} with comma-separated addresses
     */
    OneInchSpotPriceService.prototype.getMultipleSpotPrices = function (addresses_1) {
        return __awaiter(this, arguments, void 0, function (addresses, currency) {
            var addressesParam, response, results, _i, addresses_2, address, priceValue, price, error_2;
            var _a;
            if (currency === void 0) { currency = 'USD'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Getting multiple 1inch spot prices', { addresses: addresses, currency: currency });
                        addressesParam = addresses.join(',');
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/").concat(addressesParam), {
                                params: {
                                    currency: currency
                                },
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Accept': 'application/json'
                                },
                                timeout: 15000
                            })];
                    case 1:
                        response = _b.sent();
                        logger_1.logger.info('1inch Multiple API response', {
                            status: response.status,
                            data: response.data
                        });
                        if (!response.data || typeof response.data !== 'object') {
                            throw new Error('Invalid response from 1inch Spot Price API');
                        }
                        results = [];
                        // The response is an object with addresses as keys and prices as string values
                        for (_i = 0, addresses_2 = addresses; _i < addresses_2.length; _i++) {
                            address = addresses_2[_i];
                            priceValue = response.data[address.toLowerCase()];
                            if (priceValue && typeof priceValue === 'string') {
                                price = parseFloat(priceValue);
                                if (!isNaN(price)) {
                                    results.push({
                                        price: price,
                                        timestamp: Date.now(),
                                        source: '1inch-spot',
                                        currency: currency,
                                        address: address
                                    });
                                }
                                else {
                                    logger_1.logger.warn("Invalid price value for address: ".concat(address, ", value: ").concat(priceValue));
                                }
                            }
                            else {
                                logger_1.logger.warn("No price data for address: ".concat(address));
                            }
                        }
                        return [2 /*return*/, results];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.logger.error('1inch Multiple Spot Prices API failed', {
                            error: error_2.message,
                            addresses: addresses,
                            currency: currency,
                            response: (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data
                        });
                        throw new Error("1inch Multiple Spot Prices API failed: ".concat(error_2.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get available currencies
     * According to 1inch docs: GET /v1.1/1/currencies
     */
    OneInchSpotPriceService.prototype.getCurrencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Getting 1inch currencies');
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/currencies"), {
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Accept': 'application/json'
                                },
                                timeout: 10000
                            })];
                    case 1:
                        response = _b.sent();
                        logger_1.logger.info('1inch Currencies API response', {
                            status: response.status,
                            data: response.data
                        });
                        if (!response.data) {
                            throw new Error('Invalid response from 1inch Currencies API');
                        }
                        return [2 /*return*/, {
                                currencies: response.data.currencies || []
                            }];
                    case 2:
                        error_3 = _b.sent();
                        logger_1.logger.error('1inch Currencies API failed', {
                            error: error_3.message,
                            response: (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data
                        });
                        throw new Error("1inch Currencies API failed: ".concat(error_3.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get spot price with fallback to other sources
     */
    OneInchSpotPriceService.prototype.getSpotPriceWithFallback = function (address_1) {
        return __awaiter(this, arguments, void 0, function (address, currency) {
            var error_4, fallbackPrices, fallbackPrice;
            if (currency === void 0) { currency = 'USD'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getSpotPrice(address, currency)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.warn('1inch Spot Price failed, using fallback', {
                            error: error_4.message,
                            address: address
                        });
                        fallbackPrices = {
                            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 2650.34, // WETH
                            '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1.00, // USDC
                            '0xdAC17F958D2ee523a2206206994597C13D831ec7': 1.00, // USDT
                            '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 43250.67, // WBTC
                            '0x6B175474E89094C44Da98b954EedeAC495271d0F': 1.00, // DAI
                            '0x514910771AF9Ca656af840dff83E8264EcF986CA': 15.45, // LINK
                            '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 8.75, // UNI
                            '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9': 245.67, // AAVE
                            '0xD533a949740bb3306d119CC777fa900bA034cd52': 0.45, // CRV
                            '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2': 1250.89, // MKR
                            '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F': 2.34, // SNX
                            '0xc00e94Cb662C3520282E6f5717214004A7f26888': 65.23, // COMP
                            '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad9eC': 8500.12, // YFI
                            '0xba100000625a3754423978a60c9317c58a424e3D': 3.45, // BAL
                            '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2': 1.23 // SUSHI
                        };
                        fallbackPrice = fallbackPrices[address.toLowerCase()] || 1.00;
                        return [2 /*return*/, {
                                price: fallbackPrice,
                                timestamp: Date.now(),
                                source: '1inch-spot-fallback',
                                currency: currency,
                                address: address
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get comprehensive market data using 1inch
     */
    OneInchSpotPriceService.prototype.getComprehensiveMarketData = function (address_1) {
        return __awaiter(this, arguments, void 0, function (address, currency) {
            var spotPrice, error_5;
            if (currency === void 0) { currency = 'USD'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getSpotPrice(address, currency)];
                    case 1:
                        spotPrice = _a.sent();
                        return [2 /*return*/, {
                                price: spotPrice.price,
                                source: spotPrice.source,
                                timestamp: spotPrice.timestamp
                            }];
                    case 2:
                        error_5 = _a.sent();
                        logger_1.logger.error('Comprehensive market data failed', {
                            error: error_5.message,
                            address: address
                        });
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return OneInchSpotPriceService;
}());
exports.OneInchSpotPriceService = OneInchSpotPriceService;
