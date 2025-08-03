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
exports.QuoteController = void 0;
var quoteService_1 = require("../../services/quoteService");
var logger_1 = require("../../utils/logger");
var QuoteController = /** @class */ (function () {
    function QuoteController() {
        this.quoteService = new quoteService_1.QuoteService();
    }
    /**
     * GET /api/quote - Get quote for swap
     */
    QuoteController.prototype.getQuote = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fromToken, toToken, amount, chainId, slippage, userAddress, quoteRequest, quoteResponse, apiResponse, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, fromToken = _a.fromToken, toToken = _a.toToken, amount = _a.amount, chainId = _a.chainId, slippage = _a.slippage, userAddress = _a.userAddress;
                        logger_1.logger.info('Quote request received', {
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            chainId: chainId,
                            userAddress: userAddress
                        });
                        // Validate required parameters
                        if (!fromToken || !toToken || !amount || !chainId) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing required parameters: fromToken, toToken, amount, chainId',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        quoteRequest = {
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            chainId: parseInt(chainId),
                            slippage: slippage ? parseFloat(slippage) : undefined,
                            userAddress: userAddress
                        };
                        return [4 /*yield*/, this.quoteService.getQuote(quoteRequest)];
                    case 1:
                        quoteResponse = _b.sent();
                        if (!quoteResponse.success) {
                            res.status(400).json({
                                success: false,
                                error: quoteResponse.error,
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        apiResponse = {
                            success: true,
                            data: quoteResponse.data,
                            timestamp: Date.now()
                        };
                        res.json(apiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('Quote controller error', {
                            error: error_1.message,
                            stack: error_1.stack
                        });
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
     * POST /api/quote/simulate - Simulate swap
     */
    QuoteController.prototype.simulateSwap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, quote, userAddress, simulationResponse, apiResponse, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, quote = _a.quote, userAddress = _a.userAddress;
                        logger_1.logger.info('Simulation request received', { userAddress: userAddress });
                        // Validate required parameters
                        if (!quote || !userAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing required parameters: quote, userAddress',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.quoteService.simulateSwap(quote, userAddress)];
                    case 1:
                        simulationResponse = _b.sent();
                        if (!simulationResponse.success) {
                            res.status(400).json({
                                success: false,
                                error: simulationResponse.error,
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        apiResponse = {
                            success: true,
                            data: simulationResponse.data,
                            timestamp: Date.now()
                        };
                        res.json(apiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.logger.error('Simulation controller error', {
                            error: error_2.message,
                            stack: error_2.stack
                        });
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
     * GET /api/quote/history - Get quote history
     */
    QuoteController.prototype.getQuoteHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userAddress, _b, limit, _c, page, history_1, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = req.query, userAddress = _a.userAddress, _b = _a.limit, limit = _b === void 0 ? '10' : _b, _c = _a.page, page = _c === void 0 ? '1' : _c;
                        logger_1.logger.info('Quote history request received', { userAddress: userAddress, limit: limit, page: page });
                        return [4 /*yield*/, this.quoteService.getQuoteHistory(userAddress, parseInt(limit))];
                    case 1:
                        history_1 = _d.sent();
                        // Return array directly for test compatibility
                        res.json(history_1 || []);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _d.sent();
                        logger_1.logger.error('Quote history controller error', {
                            error: error_3.message,
                            stack: error_3.stack
                        });
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
     * GET /api/quote/tokens - Get supported tokens
     */
    QuoteController.prototype.getSupportedTokens = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, chainId, tokens, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query.chainId, chainId = _a === void 0 ? '1' : _a;
                        logger_1.logger.info('Supported tokens request received', { chainId: chainId });
                        return [4 /*yield*/, this.quoteService.getSupportedTokens(parseInt(chainId))];
                    case 1:
                        tokens = _b.sent();
                        // Return array directly for test compatibility
                        res.json(tokens || []);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        logger_1.logger.error('Supported tokens controller error', {
                            error: error_4.message,
                            stack: error_4.stack
                        });
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
     * POST /api/quote/multiple - Get multiple quotes for analysis
     */
    QuoteController.prototype.getMultipleQuotes = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fromToken, amount, chainId, slippage, userAddress, quoteRequest, multipleQuotesResponse, apiResponse, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, fromToken = _a.fromToken, amount = _a.amount, chainId = _a.chainId, slippage = _a.slippage, userAddress = _a.userAddress;
                        logger_1.logger.info('Multiple quotes request received', {
                            fromToken: fromToken,
                            amount: amount,
                            chainId: chainId,
                            userAddress: userAddress
                        });
                        // Validate required parameters
                        if (!fromToken || !amount || !chainId || !userAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing required parameters: fromToken, amount, chainId, userAddress',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        quoteRequest = {
                            fromToken: fromToken,
                            toToken: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC as default
                            amount: amount,
                            chainId: parseInt(chainId),
                            slippage: slippage ? parseFloat(slippage) : undefined,
                            userAddress: userAddress
                        };
                        return [4 /*yield*/, this.quoteService.getMultipleQuotes(quoteRequest)];
                    case 1:
                        multipleQuotesResponse = _b.sent();
                        if (!multipleQuotesResponse.success) {
                            res.status(400).json({
                                success: false,
                                error: multipleQuotesResponse.error,
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        apiResponse = {
                            success: true,
                            data: multipleQuotesResponse.data,
                            timestamp: Date.now()
                        };
                        res.json(apiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        logger_1.logger.error('Multiple quotes controller error', {
                            error: error_5.message,
                            stack: error_5.stack
                        });
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
     * Get network analytics
     */
    QuoteController.prototype.getNetworkAnalytics = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var analytics, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Network analytics request received');
                        return [4 /*yield*/, this.quoteService.getNetworkAnalytics()];
                    case 1:
                        analytics = _a.sent();
                        res.json({
                            success: true,
                            data: analytics,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('Network analytics error', { error: error_6.message });
                        res.status(500).json({
                            success: false,
                            error: 'Failed to fetch network analytics',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return QuoteController;
}());
exports.QuoteController = QuoteController;
exports.default = QuoteController;
