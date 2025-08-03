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
exports.FrontendLimitOrderService = void 0;
var ethers_1 = require("ethers");
var logger_1 = require("../utils/logger");
var limitOrderConfig_1 = require("../config/limitOrderConfig");
var customOrderbookService_1 = require("./customOrderbookService");
var FrontendLimitOrderService = /** @class */ (function () {
    function FrontendLimitOrderService() {
        this.orderbookService = new customOrderbookService_1.CustomOrderbookService();
        this.provider = new ethers_1.ethers.JsonRpcProvider(limitOrderConfig_1.LIMIT_ORDER_CONFIG.SDK.NETWORK_ID === 1
            ? process.env.ETHEREUM_RPC_URL
            : process.env.POLYGON_RPC_URL || process.env.ETHEREUM_RPC_URL);
    }
    /**
     * Create unsigned transaction for frontend signing
     */
    FrontendLimitOrderService.prototype.createUnsignedTransaction = function (orderParams) {
        return __awaiter(this, void 0, void 0, function () {
            var orderResponse, order, orderId, transactionData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        logger_1.logger.info('Creating unsigned transaction for limit order', {
                            userAddress: orderParams.userAddress,
                            fromToken: orderParams.fromToken,
                            toToken: orderParams.toToken,
                            amount: orderParams.amount,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        return [4 /*yield*/, this.orderbookService.createCustomLimitOrder(orderParams)];
                    case 1:
                        orderResponse = _a.sent();
                        if (!orderResponse.success) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: orderResponse.error
                                }];
                        }
                        order = orderResponse.data;
                        orderId = order.orderId;
                        return [4 /*yield*/, this.createLimitOrderTransactionData(order)];
                    case 2:
                        transactionData = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: __assign(__assign({}, transactionData), { orderId: orderId })
                            }];
                    case 3:
                        error_1 = _a.sent();
                        logger_1.logger.error('Failed to create unsigned transaction', {
                            error: error_1.message,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to create unsigned transaction: ".concat(error_1.message)
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute user-signed transaction
     */
    FrontendLimitOrderService.prototype.executeUserSignedTransaction = function (signedTransaction, orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var txResponse, receipt, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        logger_1.logger.info('Broadcasting user-signed transaction', {
                            orderId: orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        return [4 /*yield*/, this.provider.broadcastTransaction(signedTransaction)
                            // Wait for confirmation
                        ];
                    case 1:
                        txResponse = _a.sent();
                        return [4 /*yield*/, txResponse.wait(limitOrderConfig_1.LIMIT_ORDER_CONFIG.EXECUTION.CONFIRMATION_BLOCKS)];
                    case 2:
                        receipt = _a.sent();
                        if (!receipt || receipt.status === 0) {
                            throw new Error('Transaction failed onchain');
                        }
                        // Update order status
                        return [4 /*yield*/, this.orderbookService.updateOrderStatus(orderId, 'EXECUTED')];
                    case 3:
                        // Update order status
                        _a.sent();
                        logger_1.logger.info('User-signed transaction executed successfully', {
                            orderId: orderId,
                            txHash: receipt.hash,
                            blockNumber: receipt.blockNumber,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    orderId: orderId,
                                    txHash: receipt.hash,
                                    blockNumber: receipt.blockNumber,
                                    status: 'executed'
                                }
                            }];
                    case 4:
                        error_2 = _a.sent();
                        logger_1.logger.error('Failed to execute user-signed transaction', {
                            error: error_2.message,
                            orderId: orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to execute transaction: ".concat(error_2.message)
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get order status
     */
    FrontendLimitOrderService.prototype.getOrderStatus = function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var orderResponse, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.orderbookService.getOrder(orderId)];
                    case 1:
                        orderResponse = _b.sent();
                        if (!orderResponse.success) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Order not found'
                                }];
                        }
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    orderId: orderId,
                                    status: ((_a = orderResponse.data) === null || _a === void 0 ? void 0 : _a.status) || 'unknown',
                                    order: orderResponse.data
                                }
                            }];
                    case 2:
                        error_3 = _b.sent();
                        logger_1.logger.error('Failed to get order status', {
                            error: error_3.message,
                            orderId: orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to get order status: ".concat(error_3.message)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create transaction data for limit order
     */
    FrontendLimitOrderService.prototype.createLimitOrderTransactionData = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var contractAddress, data, gasEstimate, gasPrice;
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        contractAddress = limitOrderConfig_1.LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL[limitOrderConfig_1.LIMIT_ORDER_CONFIG.SDK.NETWORK_ID];
                        data = this.encodeLimitOrderCreation(order);
                        return [4 /*yield*/, this.provider.estimateGas({
                                to: contractAddress,
                                data: data,
                                value: order.value || '0x0'
                            })
                            // Get current gas price
                        ];
                    case 1:
                        gasEstimate = _c.sent();
                        return [4 /*yield*/, this.provider.getFeeData()];
                    case 2:
                        gasPrice = _c.sent();
                        _a = {
                            to: contractAddress,
                            data: data,
                            value: order.value || '0x0',
                            gas: gasEstimate.toString(),
                            gasPrice: ((_b = gasPrice.gasPrice) === null || _b === void 0 ? void 0 : _b.toString()) || '20000000000'
                        };
                        return [4 /*yield*/, this.provider.getTransactionCount(order.userAddress, 'pending')];
                    case 3: return [2 /*return*/, (_a.nonce = _c.sent(),
                            _a.orderId = order.orderId,
                            _a)];
                }
            });
        });
    };
    /**
     * Encode limit order creation data
     */
    FrontendLimitOrderService.prototype.encodeLimitOrderCreation = function (order) {
        // This would encode the actual function call to create the limit order
        // For now, we'll create a placeholder that can be extended
        var iface = new ethers_1.ethers.Interface([
            'function createOrder(address makerAsset, address takerAsset, uint256 makingAmount, uint256 takingAmount, address maker, uint256 deadline)'
        ]);
        return iface.encodeFunctionData('createOrder', [
            order.fromToken,
            order.toToken,
            order.amount,
            order.limitPrice,
            order.userAddress,
            order.deadline
        ]);
    };
    return FrontendLimitOrderService;
}());
exports.FrontendLimitOrderService = FrontendLimitOrderService;
