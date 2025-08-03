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
exports.RealOnchainExecutionController = void 0;
var realOnchainExecutionService_1 = require("../../services/realOnchainExecutionService");
var logger_1 = require("../../utils/logger");
var executionService = new realOnchainExecutionService_1.RealOnchainExecutionService();
var RealOnchainExecutionController = /** @class */ (function () {
    function RealOnchainExecutionController() {
    }
    /**
     * Estimate gas for limit order execution
     */
    RealOnchainExecutionController.prototype.estimateGas = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, orderId, userAddress, gasPrice, gasLimit, maxPriorityFeePerGas, maxFeePerGas, CustomOrderbookService, orderbookService, orderResponse, order, gasEstimate, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        _a = req.body, orderId = _a.orderId, userAddress = _a.userAddress, gasPrice = _a.gasPrice, gasLimit = _a.gasLimit, maxPriorityFeePerGas = _a.maxPriorityFeePerGas, maxFeePerGas = _a.maxFeePerGas;
                        logger_1.logger.info('Estimating gas for onchain execution', {
                            orderId: orderId,
                            userAddress: userAddress,
                            gasPrice: gasPrice,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../services/customOrderbookService'); })];
                    case 1:
                        CustomOrderbookService = (_b.sent()).CustomOrderbookService;
                        orderbookService = new CustomOrderbookService();
                        return [4 /*yield*/, orderbookService.getOrder(orderId)];
                    case 2:
                        orderResponse = _b.sent();
                        if (!orderResponse.success || !orderResponse.data) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    error: 'Order not found'
                                })];
                        }
                        order = orderResponse.data;
                        return [4 /*yield*/, executionService.estimateGasForExecution(order, {
                                orderId: orderId,
                                userAddress: userAddress,
                                gasPrice: gasPrice,
                                gasLimit: gasLimit,
                                maxPriorityFeePerGas: maxPriorityFeePerGas,
                                maxFeePerGas: maxFeePerGas
                            })];
                    case 3:
                        gasEstimate = _b.sent();
                        if (!gasEstimate.success) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    error: gasEstimate.error
                                })];
                        }
                        logger_1.logger.info('Gas estimation completed', {
                            orderId: orderId,
                            gasEstimate: gasEstimate.data,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [2 /*return*/, res.json({
                                success: true,
                                data: gasEstimate.data,
                                timestamp: Date.now()
                            })];
                    case 4:
                        error_1 = _b.sent();
                        logger_1.logger.error('Gas estimation error', {
                            error: error_1.message,
                            stack: error_1.stack,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                error: "Gas estimation failed: ".concat(error_1.message)
                            })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute limit order onchain
     */
    RealOnchainExecutionController.prototype.executeOrder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, orderId, userAddress, gasPrice, gasLimit, maxPriorityFeePerGas, maxFeePerGas, result, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.body, orderId = _a.orderId, userAddress = _a.userAddress, gasPrice = _a.gasPrice, gasLimit = _a.gasLimit, maxPriorityFeePerGas = _a.maxPriorityFeePerGas, maxFeePerGas = _a.maxFeePerGas;
                        logger_1.logger.info('Executing limit order onchain', {
                            orderId: orderId,
                            userAddress: userAddress,
                            gasPrice: gasPrice,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [4 /*yield*/, executionService.executeLimitOrderOnchain({
                                orderId: orderId,
                                userAddress: userAddress,
                                gasPrice: gasPrice,
                                gasLimit: gasLimit,
                                maxPriorityFeePerGas: maxPriorityFeePerGas,
                                maxFeePerGas: maxFeePerGas
                            })];
                    case 1:
                        result = _c.sent();
                        if (!result.success) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    error: result.error
                                })];
                        }
                        logger_1.logger.info('Limit order executed successfully onchain', {
                            orderId: orderId,
                            txHash: (_b = result.data) === null || _b === void 0 ? void 0 : _b.txHash,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [2 /*return*/, res.json({
                                success: true,
                                data: result.data,
                                timestamp: Date.now()
                            })];
                    case 2:
                        error_2 = _c.sent();
                        logger_1.logger.error('Onchain execution error', {
                            error: error_2.message,
                            stack: error_2.stack,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                error: "Onchain execution failed: ".concat(error_2.message)
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get transaction status
     */
    RealOnchainExecutionController.prototype.getTransactionStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var txHash, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        txHash = req.params.txHash;
                        logger_1.logger.info('Getting transaction status', {
                            txHash: txHash,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [4 /*yield*/, executionService.getTransactionStatus(txHash)];
                    case 1:
                        result = _a.sent();
                        if (!result.success) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    error: result.error
                                })];
                        }
                        return [2 /*return*/, res.json({
                                success: true,
                                data: result.data,
                                timestamp: Date.now()
                            })];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.logger.error('Get transaction status error', {
                            error: error_3.message,
                            stack: error_3.stack,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                error: "Get transaction status failed: ".concat(error_3.message)
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel limit order onchain
     */
    RealOnchainExecutionController.prototype.cancelOrder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, orderId, userAddress, result, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.body, orderId = _a.orderId, userAddress = _a.userAddress;
                        logger_1.logger.info('Cancelling limit order onchain', {
                            orderId: orderId,
                            userAddress: userAddress,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [4 /*yield*/, executionService.cancelLimitOrderOnchain(orderId, userAddress)];
                    case 1:
                        result = _c.sent();
                        if (!result.success) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    error: result.error
                                })];
                        }
                        logger_1.logger.info('Limit order cancelled successfully onchain', {
                            orderId: orderId,
                            txHash: (_b = result.data) === null || _b === void 0 ? void 0 : _b.txHash,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [2 /*return*/, res.json({
                                success: true,
                                data: result.data,
                                timestamp: Date.now()
                            })];
                    case 2:
                        error_4 = _c.sent();
                        logger_1.logger.error('Cancel order error', {
                            error: error_4.message,
                            stack: error_4.stack,
                            timestamp: Date.now(),
                            service: 'cipherswap-real-onchain-execution'
                        });
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                error: "Cancel order failed: ".concat(error_4.message)
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return RealOnchainExecutionController;
}());
exports.RealOnchainExecutionController = RealOnchainExecutionController;
