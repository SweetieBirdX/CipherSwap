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
exports.oracleController = exports.OracleController = void 0;
var oracleService_1 = require("../../services/oracleService");
var logger_1 = require("../../utils/logger");
var OracleController = /** @class */ (function () {
    function OracleController() {
    }
    /**
     * GET /api/oracle/price/:chainId/:pair
     * Get current price from Chainlink Oracle
     */
    OracleController.prototype.getPrice = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var chainId, pair, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        chainId = parseInt(req.params.chainId);
                        pair = req.params.pair;
                        logger_1.logger.info('Oracle price request received', { chainId: chainId, pair: pair });
                        return [4 /*yield*/, oracleService_1.oracleService.getPrice(chainId, pair)];
                    case 1:
                        response = _a.sent();
                        if (response.success && response.data) {
                            res.json({
                                success: true,
                                data: response.data,
                                timestamp: Date.now()
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: response.error,
                                timestamp: Date.now()
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error('Oracle controller error', { error: error_1.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * POST /api/oracle/price/batch
     * Get multiple prices at once
     */
    OracleController.prototype.getMultiplePrices = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var prices, results, _i, prices_1, priceRequest, chainId, pair, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        prices = req.body.prices;
                        if (!prices || !Array.isArray(prices)) {
                            res.status(400).json({
                                success: false,
                                error: 'Invalid request: prices array required',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('Oracle batch price request received', { prices: prices });
                        results = [];
                        _i = 0, prices_1 = prices;
                        _a.label = 1;
                    case 1:
                        if (!(_i < prices_1.length)) return [3 /*break*/, 4];
                        priceRequest = prices_1[_i];
                        chainId = priceRequest.chainId, pair = priceRequest.pair;
                        if (!chainId || !pair) {
                            results.push({
                                chainId: chainId,
                                pair: pair,
                                success: false,
                                error: 'Missing chainId or pair'
                            });
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, oracleService_1.oracleService.getPrice(chainId, pair)];
                    case 2:
                        response = _a.sent();
                        if (response.success && response.data) {
                            results.push({
                                chainId: chainId,
                                pair: pair,
                                price: response.data.price.toString(),
                                timestamp: response.data.timestamp,
                                decimals: response.data.decimals,
                                feedAddress: response.data.oracleAddress,
                                description: "".concat(pair, " Price Feed")
                            });
                        }
                        else {
                            results.push({
                                chainId: chainId,
                                pair: pair,
                                success: false,
                                error: response.error
                            });
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        res.json({
                            success: true,
                            data: results,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        logger_1.logger.error('Oracle batch controller error', { error: error_2.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * POST /api/oracle/price/tolerance
     * Get price with tolerance check
     */
    OracleController.prototype.getPriceWithTolerance = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, chainId, pair, expectedPrice, _b, tolerance, response, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.body, chainId = _a.chainId, pair = _a.pair, expectedPrice = _a.expectedPrice, _b = _a.tolerance, tolerance = _b === void 0 ? 1.0 : _b;
                        if (!chainId || !pair || expectedPrice === undefined) {
                            res.status(400).json({
                                success: false,
                                error: 'Invalid request: chainId, pair, and expectedPrice required',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('Oracle tolerance check request received', {
                            chainId: chainId,
                            pair: pair,
                            expectedPrice: expectedPrice,
                            tolerance: tolerance
                        });
                        return [4 /*yield*/, oracleService_1.oracleService.getPriceWithTolerance(chainId, pair, expectedPrice, tolerance)];
                    case 1:
                        response = _c.sent();
                        if (response.success && response.data) {
                            res.json({
                                success: true,
                                data: response.data,
                                tolerance: tolerance,
                                timestamp: Date.now()
                            });
                        }
                        else {
                            res.status(400).json({
                                success: false,
                                error: response.error,
                                tolerance: tolerance,
                                timestamp: Date.now()
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _c.sent();
                        logger_1.logger.error('Oracle tolerance controller error', { error: error_3.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * GET /api/oracle/feeds/:chainId
     * Get available price feeds for a network
     */
    OracleController.prototype.getAvailableFeeds = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var chainId, feeds;
            return __generator(this, function (_a) {
                try {
                    chainId = parseInt(req.params.chainId);
                    logger_1.logger.info('Oracle feeds request received', { chainId: chainId });
                    feeds = oracleService_1.oracleService.getAvailablePriceFeeds(chainId);
                    res.json({
                        success: true,
                        data: {
                            chainId: chainId,
                            feeds: feeds,
                            count: feeds.length
                        },
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.logger.error('Oracle feeds controller error', { error: error.message });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error',
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * GET /api/oracle/networks
     * Get all supported networks with their price feeds
     */
    OracleController.prototype.getSupportedNetworks = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var networks;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Oracle networks request received');
                    networks = oracleService_1.oracleService.getAllSupportedNetworks();
                    res.json({
                        success: true,
                        data: networks,
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.logger.error('Oracle networks controller error', { error: error.message });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error',
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * GET /api/oracle/health/:chainId/:pair
     * Get price feed health status
     */
    OracleController.prototype.getPriceFeedHealth = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var chainId, pair, health, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        chainId = parseInt(req.params.chainId);
                        pair = req.params.pair;
                        logger_1.logger.info('Oracle health check request received', { chainId: chainId, pair: pair });
                        return [4 /*yield*/, oracleService_1.oracleService.getPriceFeedHealth(chainId, pair)];
                    case 1:
                        health = _a.sent();
                        res.json({
                            success: true,
                            data: health,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('Oracle health controller error', { error: error_4.message });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return OracleController;
}());
exports.OracleController = OracleController;
// Export singleton instance
exports.oracleController = new OracleController();
