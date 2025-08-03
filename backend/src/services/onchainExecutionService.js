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
exports.OnchainExecutionService = void 0;
var logger_1 = require("../utils/logger");
var swap_1 = require("../types/swap");
var limitOrderSDKService_1 = require("./limitOrderSDKService");
var customOrderbookService_1 = require("./customOrderbookService");
var limitOrderConfig_1 = require("../config/limitOrderConfig");
var ethers_1 = require("ethers");
var OnchainExecutionService = /** @class */ (function () {
    function OnchainExecutionService() {
        this.sdkService = new limitOrderSDKService_1.LimitOrderSDKService();
        this.orderbookService = new customOrderbookService_1.CustomOrderbookService();
        // Initialize provider and wallet
        this.provider = new ethers_1.ethers.JsonRpcProvider(limitOrderConfig_1.LIMIT_ORDER_CONFIG.SDK.NETWORK_ID === 1
            ? process.env.ETHEREUM_RPC_URL
            : process.env.POLYGON_RPC_URL || process.env.ETHEREUM_RPC_URL);
        this.wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        logger_1.logger.info('OnchainExecutionService initialized', {
            networkId: limitOrderConfig_1.LIMIT_ORDER_CONFIG.SDK.NETWORK_ID,
            walletAddress: this.wallet.address,
            timestamp: Date.now(),
            service: 'cipherswap-onchain-execution'
        });
    }
    /**
     * Execute limit order onchain with real transaction
     */
    OnchainExecutionService.prototype.executeLimitOrderOnchain = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var orderResponse, order, gasEstimate, transactionResult, updatedOrder, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        logger_1.logger.info('Executing limit order onchain', {
                            orderId: params.orderId,
                            userAddress: params.userAddress,
                            gasPrice: params.gasPrice,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [4 /*yield*/, this.orderbookService.getOrder(params.orderId)];
                    case 1:
                        orderResponse = _a.sent();
                        if (!orderResponse.success || !orderResponse.data) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Order not found'
                                }];
                        }
                        order = orderResponse.data;
                        // Validate order can be executed
                        if (order.status !== swap_1.LimitOrderStatus.PENDING) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Order cannot be executed. Current status: ".concat(order.status)
                                }];
                        }
                        if (!(Date.now() > order.deadline)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.orderbookService.updateOrderStatus(params.orderId, swap_1.LimitOrderStatus.EXPIRED)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: 'Order has expired'
                            }];
                    case 3: return [4 /*yield*/, this.estimateGasForExecution(order, params)];
                    case 4:
                        gasEstimate = _a.sent();
                        if (!gasEstimate.success) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Gas estimation failed: ".concat(gasEstimate.error)
                                }];
                        }
                        return [4 /*yield*/, this.executeTransaction(order, gasEstimate.data, params)];
                    case 5:
                        transactionResult = _a.sent();
                        if (!transactionResult.success) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Transaction execution failed: ".concat(transactionResult.error)
                                }];
                        }
                        updatedOrder = __assign(__assign({}, order), { txHash: transactionResult.data.txHash, status: swap_1.LimitOrderStatus.EXECUTED, gasEstimate: transactionResult.data.gasUsed, gasPrice: transactionResult.data.gasPrice });
                        return [4 /*yield*/, this.orderbookService.updateOrder(params.orderId, updatedOrder)];
                    case 6:
                        _a.sent();
                        logger_1.logger.info('Limit order executed successfully onchain', {
                            orderId: params.orderId,
                            txHash: transactionResult.data.txHash,
                            blockNumber: transactionResult.data.blockNumber,
                            gasUsed: transactionResult.data.gasUsed,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: updatedOrder
                            }];
                    case 7:
                        error_1 = _a.sent();
                        logger_1.logger.error('Onchain execution error', {
                            error: error_1.message,
                            stack: error_1.stack,
                            orderId: params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Onchain execution failed: ".concat(error_1.message)
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Estimate gas for limit order execution
     */
    OnchainExecutionService.prototype.estimateGasForExecution = function (order, params) {
        return __awaiter(this, void 0, void 0, function () {
            var feeData, baseGasLimit, complexityMultiplier, estimatedGasLimit, gasPrice, maxPriorityFeePerGas, maxFeePerGas, gasEstimate, error_2;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Estimating gas for limit order execution', {
                            orderId: params.orderId,
                            fromToken: order.fromToken,
                            toToken: order.toToken,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [4 /*yield*/, this.provider.getFeeData()];
                    case 1:
                        feeData = _d.sent();
                        baseGasLimit = limitOrderConfig_1.LIMIT_ORDER_CONFIG.GAS.DEFAULT_GAS_LIMIT;
                        complexityMultiplier = this.calculateComplexityMultiplier(order);
                        estimatedGasLimit = Math.floor(baseGasLimit * complexityMultiplier);
                        gasPrice = params.gasPrice || ((_a = feeData.gasPrice) === null || _a === void 0 ? void 0 : _a.toString()) || limitOrderConfig_1.LIMIT_ORDER_CONFIG.GAS.DEFAULT_GAS_PRICE;
                        maxPriorityFeePerGas = params.maxPriorityFeePerGas || ((_b = feeData.maxPriorityFeePerGas) === null || _b === void 0 ? void 0 : _b.toString()) || '2000000000';
                        maxFeePerGas = params.maxFeePerGas || ((_c = feeData.maxFeePerGas) === null || _c === void 0 ? void 0 : _c.toString()) || gasPrice;
                        gasEstimate = {
                            gasLimit: estimatedGasLimit.toString(),
                            gasPrice: gasPrice,
                            maxPriorityFeePerGas: maxPriorityFeePerGas,
                            maxFeePerGas: maxFeePerGas,
                            totalCost: (BigInt(estimatedGasLimit) * BigInt(gasPrice)).toString()
                        };
                        logger_1.logger.info('Gas estimation completed', {
                            orderId: params.orderId,
                            gasEstimate: gasEstimate,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: gasEstimate
                            }];
                    case 2:
                        error_2 = _d.sent();
                        logger_1.logger.error('Gas estimation error', {
                            error: error_2.message,
                            orderId: params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Gas estimation failed: ".concat(error_2.message)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute the actual transaction onchain
     */
    OnchainExecutionService.prototype.executeTransaction = function (order, gasEstimate, params) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionData, signedTx, txResponse, receipt, transactionResult, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        logger_1.logger.info('Executing transaction onchain', {
                            orderId: params.orderId,
                            gasLimit: gasEstimate.gasLimit,
                            gasPrice: gasEstimate.gasPrice,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [4 /*yield*/, this.createLimitOrderTransaction(order, gasEstimate)];
                    case 1:
                        transactionData = _b.sent();
                        return [4 /*yield*/, this.wallet.signTransaction(transactionData)];
                    case 2:
                        signedTx = _b.sent();
                        return [4 /*yield*/, this.provider.broadcastTransaction(signedTx)];
                    case 3:
                        txResponse = _b.sent();
                        return [4 /*yield*/, txResponse.wait(limitOrderConfig_1.LIMIT_ORDER_CONFIG.EXECUTION.CONFIRMATION_BLOCKS)];
                    case 4:
                        receipt = _b.sent();
                        // Check transaction status
                        if (!receipt || receipt.status === 0) {
                            throw new Error('Transaction failed onchain');
                        }
                        transactionResult = {
                            txHash: receipt.hash,
                            blockNumber: receipt.blockNumber,
                            gasUsed: receipt.gasUsed.toString(),
                            gasPrice: ((_a = receipt.gasPrice) === null || _a === void 0 ? void 0 : _a.toString()) || gasEstimate.gasPrice,
                            status: 'success',
                            confirmations: Number(receipt.confirmations)
                        };
                        logger_1.logger.info('Transaction executed successfully', {
                            orderId: params.orderId,
                            txHash: transactionResult.txHash,
                            blockNumber: transactionResult.blockNumber,
                            gasUsed: transactionResult.gasUsed,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: transactionResult
                            }];
                    case 5:
                        error_3 = _b.sent();
                        logger_1.logger.error('Transaction execution error', {
                            error: error_3.message,
                            orderId: params.orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Transaction execution failed: ".concat(error_3.message)
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create transaction data for limit order execution
     */
    OnchainExecutionService.prototype.createLimitOrderTransaction = function (order, gasEstimate) {
        return __awaiter(this, void 0, void 0, function () {
            var contractAddress, transactionData;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contractAddress = limitOrderConfig_1.LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL[limitOrderConfig_1.LIMIT_ORDER_CONFIG.SDK.NETWORK_ID];
                        _a = {
                            to: contractAddress
                        };
                        return [4 /*yield*/, this.encodeLimitOrderExecution(order)];
                    case 1:
                        _a.data = _b.sent(),
                            _a.gasLimit = BigInt(gasEstimate.gasLimit),
                            _a.gasPrice = BigInt(gasEstimate.gasPrice),
                            _a.maxPriorityFeePerGas = BigInt(gasEstimate.maxPriorityFeePerGas),
                            _a.maxFeePerGas = BigInt(gasEstimate.maxFeePerGas);
                        return [4 /*yield*/, this.wallet.getNonce()];
                    case 2:
                        transactionData = (_a.nonce = _b.sent(),
                            _a);
                        return [2 /*return*/, transactionData];
                }
            });
        });
    };
    /**
     * Encode limit order execution data
     */
    OnchainExecutionService.prototype.encodeLimitOrderExecution = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var mockExecutionData, functionSelector;
            return __generator(this, function (_a) {
                mockExecutionData = ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['address', 'address', 'uint256', 'uint256', 'address'], [
                    order.fromToken,
                    order.toToken,
                    order.fromAmount,
                    order.limitPrice,
                    order.userAddress
                ]);
                functionSelector = '0x12345678';
                return [2 /*return*/, functionSelector + mockExecutionData.slice(2)];
            });
        });
    };
    /**
     * Calculate complexity multiplier for gas estimation
     */
    OnchainExecutionService.prototype.calculateComplexityMultiplier = function (order) {
        var multiplier = 1.0;
        // Base complexity
        multiplier += 0.2;
        // Amount complexity
        var amount = parseFloat(order.fromAmount);
        if (amount > 1000000) { // Large amounts
            multiplier += 0.3;
        }
        // Route complexity
        if (order.route && order.route.length > 2) {
            multiplier += 0.2 * (order.route.length - 2);
        }
        // Custom strategy complexity
        if (order.customData) {
            multiplier += 0.1;
        }
        return Math.min(multiplier, 2.0); // Cap at 2x
    };
    /**
     * Get transaction status and confirmations
     */
    OnchainExecutionService.prototype.getTransactionStatus = function (txHash) {
        return __awaiter(this, void 0, void 0, function () {
            var receipt, transactionResult, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Getting transaction status', {
                            txHash: txHash,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [4 /*yield*/, this.provider.getTransactionReceipt(txHash)];
                    case 1:
                        receipt = _b.sent();
                        if (!receipt) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Transaction not found'
                                }];
                        }
                        transactionResult = {
                            txHash: receipt.hash,
                            blockNumber: receipt.blockNumber,
                            gasUsed: receipt.gasUsed.toString(),
                            gasPrice: ((_a = receipt.gasPrice) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                            status: receipt.status === 1 ? 'success' : 'failed',
                            confirmations: Number(receipt.confirmations),
                            error: receipt.status === 0 ? 'Transaction failed' : undefined
                        };
                        return [2 /*return*/, {
                                success: true,
                                data: transactionResult
                            }];
                    case 2:
                        error_4 = _b.sent();
                        logger_1.logger.error('Get transaction status error', {
                            error: error_4.message,
                            txHash: txHash,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Get transaction status failed: ".concat(error_4.message)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel limit order onchain
     */
    OnchainExecutionService.prototype.cancelLimitOrderOnchain = function (orderId, userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var orderResponse, order, cancellationData, signedTx, txResponse, receipt, updatedOrder, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        logger_1.logger.info('Cancelling limit order onchain', {
                            orderId: orderId,
                            userAddress: userAddress,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [4 /*yield*/, this.orderbookService.getOrder(orderId)];
                    case 1:
                        orderResponse = _a.sent();
                        if (!orderResponse.success || !orderResponse.data) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Order not found'
                                }];
                        }
                        order = orderResponse.data;
                        // Validate order can be cancelled
                        if (order.status !== swap_1.LimitOrderStatus.PENDING) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Order cannot be cancelled. Current status: ".concat(order.status)
                                }];
                        }
                        return [4 /*yield*/, this.createCancellationTransaction(order)];
                    case 2:
                        cancellationData = _a.sent();
                        return [4 /*yield*/, this.wallet.signTransaction(cancellationData)];
                    case 3:
                        signedTx = _a.sent();
                        return [4 /*yield*/, this.provider.broadcastTransaction(signedTx)];
                    case 4:
                        txResponse = _a.sent();
                        return [4 /*yield*/, txResponse.wait(limitOrderConfig_1.LIMIT_ORDER_CONFIG.EXECUTION.CONFIRMATION_BLOCKS)];
                    case 5:
                        receipt = _a.sent();
                        if (!receipt || receipt.status === 0) {
                            throw new Error('Cancellation transaction failed');
                        }
                        updatedOrder = __assign(__assign({}, order), { txHash: receipt.hash, status: swap_1.LimitOrderStatus.CANCELLED });
                        return [4 /*yield*/, this.orderbookService.updateOrder(orderId, updatedOrder)];
                    case 6:
                        _a.sent();
                        logger_1.logger.info('Limit order cancelled successfully onchain', {
                            orderId: orderId,
                            txHash: receipt.hash,
                            blockNumber: receipt.blockNumber,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: updatedOrder
                            }];
                    case 7:
                        error_5 = _a.sent();
                        logger_1.logger.error('Cancel limit order error', {
                            error: error_5.message,
                            orderId: orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-onchain-execution'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Cancel limit order failed: ".concat(error_5.message)
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create cancellation transaction data
     */
    OnchainExecutionService.prototype.createCancellationTransaction = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var contractAddress, cancellationData, functionSelector, transactionData;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contractAddress = limitOrderConfig_1.LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL[limitOrderConfig_1.LIMIT_ORDER_CONFIG.SDK.NETWORK_ID];
                        cancellationData = ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['bytes32'], [order.orderId]);
                        functionSelector = '0x87654321';
                        _a = {
                            to: contractAddress,
                            data: functionSelector + cancellationData.slice(2),
                            gasLimit: BigInt(limitOrderConfig_1.LIMIT_ORDER_CONFIG.GAS.DEFAULT_GAS_LIMIT),
                            gasPrice: BigInt(limitOrderConfig_1.LIMIT_ORDER_CONFIG.GAS.DEFAULT_GAS_PRICE)
                        };
                        return [4 /*yield*/, this.wallet.getNonce()];
                    case 1:
                        transactionData = (_a.nonce = _b.sent(),
                            _a);
                        return [2 /*return*/, transactionData];
                }
            });
        });
    };
    return OnchainExecutionService;
}());
exports.OnchainExecutionService = OnchainExecutionService;
