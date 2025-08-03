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
exports.SwapController = void 0;
var swapService_1 = require("../../services/swapService");
var logger_1 = require("../../utils/logger");
var SwapController = /** @class */ (function () {
    function SwapController() {
        this.swapService = new swapService_1.SwapService();
    }
    /**
     * POST /api/swap - Create a new swap transaction
     */
    SwapController.prototype.createSwap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fromToken, toToken, amount, chainId, slippage, userAddress, deadline, swapRequest, swapResponse, apiResponse, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, fromToken = _a.fromToken, toToken = _a.toToken, amount = _a.amount, chainId = _a.chainId, slippage = _a.slippage, userAddress = _a.userAddress, deadline = _a.deadline;
                        logger_1.logger.info('Swap request received', {
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            chainId: chainId,
                            userAddress: userAddress
                        });
                        // Validate required parameters
                        if (!fromToken || !toToken || !amount || !chainId || !userAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing required parameters: fromToken, toToken, amount, chainId, userAddress',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        swapRequest = {
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            chainId: parseInt(chainId),
                            slippage: slippage ? parseFloat(slippage) : undefined,
                            userAddress: userAddress,
                            deadline: deadline ? parseInt(deadline) : undefined
                        };
                        return [4 /*yield*/, this.swapService.createSwap(swapRequest)];
                    case 1:
                        swapResponse = _b.sent();
                        if (!swapResponse.success) {
                            res.status(400).json({
                                success: false,
                                error: swapResponse.error,
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        apiResponse = {
                            success: true,
                            data: swapResponse.data,
                            timestamp: Date.now()
                        };
                        res.json(apiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('Swap controller error', {
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
     * POST /api/swap/fusion - Create a Fusion+ swap transaction
     */
    SwapController.prototype.createFusionSwap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fromToken, toToken, amount, chainId, slippage, userAddress, deadline, permit, swapRequest, swapResponse, apiResponse, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, fromToken = _a.fromToken, toToken = _a.toToken, amount = _a.amount, chainId = _a.chainId, slippage = _a.slippage, userAddress = _a.userAddress, deadline = _a.deadline, permit = _a.permit;
                        logger_1.logger.info('Fusion swap request received', {
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            chainId: chainId,
                            userAddress: userAddress
                        });
                        // Validate required parameters
                        if (!fromToken || !toToken || !amount || !chainId || !userAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing required parameters: fromToken, toToken, amount, chainId, userAddress',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        swapRequest = {
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            chainId: parseInt(chainId),
                            slippage: slippage ? parseFloat(slippage) : undefined,
                            userAddress: userAddress,
                            deadline: deadline ? parseInt(deadline) : undefined,
                            permit: permit
                        };
                        return [4 /*yield*/, this.swapService.createFusionSwap(swapRequest)];
                    case 1:
                        swapResponse = _b.sent();
                        if (!swapResponse.success) {
                            res.status(400).json({
                                success: false,
                                error: swapResponse.error,
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        apiResponse = {
                            success: true,
                            data: swapResponse.data,
                            timestamp: Date.now()
                        };
                        res.json(apiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.logger.error('Fusion swap controller error', {
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
     * GET /api/swap/status/:id - Get swap transaction status
     */
    SwapController.prototype.getSwapStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, statusResponse, apiResponse, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        logger_1.logger.info('Swap status request received', { swapId: id });
                        if (!id) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing swap ID',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.swapService.getSwapStatus(id)];
                    case 1:
                        statusResponse = _a.sent();
                        if (!statusResponse.success) {
                            res.status(404).json({
                                success: false,
                                error: statusResponse.error,
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        apiResponse = {
                            success: true,
                            data: statusResponse.data,
                            timestamp: Date.now()
                        };
                        res.json(apiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.logger.error('Swap status controller error', {
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
     * POST /api/swap/simulate - Simulate swap transaction
     */
    SwapController.prototype.simulateSwap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fromToken, toToken, amount, chainId, slippage, userAddress, swapRequest, simulationResponse, apiResponse, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, fromToken = _a.fromToken, toToken = _a.toToken, amount = _a.amount, chainId = _a.chainId, slippage = _a.slippage, userAddress = _a.userAddress;
                        logger_1.logger.info('Swap simulation request received', {
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
                        swapRequest = {
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            chainId: parseInt(chainId),
                            slippage: slippage ? parseFloat(slippage) : undefined,
                            userAddress: userAddress
                        };
                        return [4 /*yield*/, this.swapService.simulateSwap(swapRequest)];
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
                        error_4 = _b.sent();
                        logger_1.logger.error('Swap simulation controller error', {
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
     * GET /api/swap/history - Get swap history for user
     */
    SwapController.prototype.getSwapHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userAddress, _b, limit, _c, page, history_1, apiResponse, error_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = req.query, userAddress = _a.userAddress, _b = _a.limit, limit = _b === void 0 ? '10' : _b, _c = _a.page, page = _c === void 0 ? '1' : _c;
                        logger_1.logger.info('Swap history request received', { userAddress: userAddress, limit: limit, page: page });
                        if (!userAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing userAddress parameter',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.swapService.getSwapHistory(userAddress, parseInt(limit), parseInt(page))];
                    case 1:
                        history_1 = _d.sent();
                        apiResponse = {
                            success: true,
                            data: history_1,
                            timestamp: Date.now()
                        };
                        res.json(apiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _d.sent();
                        logger_1.logger.error('Swap history controller error', {
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
     * POST /api/swap/cancel/:id - Cancel pending swap transaction
     */
    SwapController.prototype.cancelSwap = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, userAddress, cancelResponse, apiResponse, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userAddress = req.body.userAddress;
                        logger_1.logger.info('Cancel swap request received', { swapId: id, userAddress: userAddress });
                        // Validate required parameters
                        if (!id || !userAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing required parameters: id, userAddress',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.swapService.cancelSwap(id, userAddress)];
                    case 1:
                        cancelResponse = _a.sent();
                        if (!cancelResponse.success) {
                            res.status(400).json({
                                success: false,
                                error: cancelResponse.error,
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        apiResponse = {
                            success: true,
                            data: cancelResponse.data,
                            timestamp: Date.now()
                        };
                        res.json(apiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('Cancel swap controller error', {
                            error: error_6.message,
                            stack: error_6.stack
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
     * POST /api/swap/optimize - Execute swap with optimization (split routing, etc.)
     */
    SwapController.prototype.executeSwapWithOptimization = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fromToken, toToken, amount, chainId, slippage, userAddress, deadline, useMEVProtection, swapRequest, swapResponse, apiResponse, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, fromToken = _a.fromToken, toToken = _a.toToken, amount = _a.amount, chainId = _a.chainId, slippage = _a.slippage, userAddress = _a.userAddress, deadline = _a.deadline, useMEVProtection = _a.useMEVProtection;
                        logger_1.logger.info('Optimized swap request received', {
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            chainId: chainId,
                            userAddress: userAddress,
                            useMEVProtection: useMEVProtection
                        });
                        // Validate required parameters
                        if (!fromToken || !toToken || !amount || !chainId || !userAddress) {
                            res.status(400).json({
                                success: false,
                                error: 'Missing required parameters: fromToken, toToken, amount, chainId, userAddress',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        swapRequest = {
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            chainId: parseInt(chainId),
                            slippage: slippage ? parseFloat(slippage) : undefined,
                            userAddress: userAddress,
                            deadline: deadline ? parseInt(deadline) : undefined,
                            useMEVProtection: useMEVProtection || false
                        };
                        return [4 /*yield*/, this.swapService.executeSwapWithOptimization(swapRequest)];
                    case 1:
                        swapResponse = _b.sent();
                        if (!swapResponse.success) {
                            res.status(400).json({
                                success: false,
                                error: swapResponse.error,
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        apiResponse = {
                            success: true,
                            data: swapResponse.data,
                            timestamp: Date.now()
                        };
                        res.json(apiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        logger_1.logger.error('Optimized swap controller error', {
                            error: error_7.message,
                            stack: error_7.stack
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
    return SwapController;
}());
exports.SwapController = SwapController;
exports.default = SwapController;
