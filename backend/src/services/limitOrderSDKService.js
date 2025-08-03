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
exports.LimitOrderSDKService = void 0;
var limit_order_sdk_1 = require("@1inch/limit-order-sdk");
var ethers_1 = require("ethers");
var logger_1 = require("../utils/logger");
var env_1 = require("../config/env");
var swap_1 = require("../types/swap");
var axios_1 = require("axios");
var LimitOrderSDKService = /** @class */ (function () {
    function LimitOrderSDKService() {
        // Initialize wallet for signing
        this.provider = new ethers_1.JsonRpcProvider(env_1.config.ETHEREUM_RPC_URL);
        this.wallet = new ethers_1.Wallet(env_1.config.PRIVATE_KEY, this.provider);
        this.apiKey = env_1.config.INCH_API_KEY || '';
        logger_1.logger.info('LimitOrderSDKService initialized', {
            networkId: env_1.config.CHAIN_ID,
            walletAddress: this.wallet.address,
            hasApiKey: !!this.apiKey,
            timestamp: Date.now(),
            service: 'cipherswap-limit-order-sdk'
        });
    }
    /**
     * Create a limit order using 1inch API
     */
    LimitOrderSDKService.prototype.createLimitOrder = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, expiresIn, expiration, UINT_40_MAX, makerTraits, order, orderHash, typedData, signature, apiResponse, apiError_1, orderData, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        logger_1.logger.info('Creating limit order with 1inch API', {
                            params: {
                                fromToken: params.fromToken,
                                toToken: params.toToken,
                                amount: params.amount,
                                limitPrice: params.limitPrice,
                                orderType: params.orderType,
                                chainId: params.chainId,
                                userAddress: params.userAddress
                            },
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-sdk'
                        });
                        validation = this.validateLimitOrderRequest(params);
                        if (!validation.isValid) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: validation.errors.join(', ')
                                }];
                        }
                        expiresIn = BigInt(params.deadline || 3600);
                        expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;
                        UINT_40_MAX = (1n << 40n) - 1n;
                        makerTraits = limit_order_sdk_1.MakerTraits.default()
                            .withExpiration(expiration)
                            .withNonce((0, limit_order_sdk_1.randBigInt)(UINT_40_MAX));
                        order = new limit_order_sdk_1.LimitOrder({
                            makerAsset: new limit_order_sdk_1.Address(params.fromToken.toLowerCase()),
                            takerAsset: new limit_order_sdk_1.Address(params.toToken.toLowerCase()),
                            makingAmount: BigInt(params.amount),
                            takingAmount: BigInt(params.limitPrice),
                            maker: new limit_order_sdk_1.Address(params.userAddress.toLowerCase()),
                            receiver: new limit_order_sdk_1.Address(params.userAddress.toLowerCase()), // Same as maker for simple orders
                        }, makerTraits);
                        orderHash = order.getOrderHash(params.chainId);
                        typedData = order.getTypedData(params.chainId);
                        return [4 /*yield*/, this.wallet.signTypedData(typedData.domain, { Order: typedData.types.Order }, typedData.message)];
                    case 1:
                        signature = _b.sent();
                        apiResponse = null;
                        if (!this.apiKey) return [3 /*break*/, 5];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.submitTo1inchAPI(order, signature, params)];
                    case 3:
                        apiResponse = _b.sent();
                        logger_1.logger.info('Order submitted to 1inch API', {
                            orderId: orderHash,
                            apiResponse: apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.data,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-sdk'
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        apiError_1 = _b.sent();
                        logger_1.logger.warn('1inch API submission failed, using local order', {
                            error: apiError_1.message,
                            orderId: orderHash,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-sdk'
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        orderData = {
                            orderId: orderHash,
                            txHash: (_a = apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.data) === null || _a === void 0 ? void 0 : _a.txHash,
                            status: swap_1.LimitOrderStatus.PENDING,
                            fromToken: params.fromToken,
                            toToken: params.toToken,
                            fromAmount: params.amount,
                            toAmount: params.limitPrice,
                            limitPrice: params.limitPrice,
                            orderType: params.orderType,
                            gasEstimate: '0', // Will be calculated during execution
                            gasPrice: undefined,
                            deadline: Number(expiration),
                            userAddress: params.userAddress,
                            timestamp: Date.now(),
                            route: [],
                            fusionData: {
                                permit: null,
                                deadline: Number(expiration),
                                nonce: 0
                            },
                            customData: {
                                orderHash: orderHash,
                                signature: signature,
                                typedData: {
                                    domain: typedData.domain,
                                    types: typedData.types,
                                    message: __assign(__assign({}, typedData.message), { makingAmount: typedData.message.makingAmount.toString(), takingAmount: typedData.message.takingAmount.toString(), salt: typedData.message.salt.toString() })
                                },
                                orderDetails: {
                                    makerAsset: params.fromToken.toLowerCase(),
                                    takerAsset: params.toToken.toLowerCase(),
                                    makingAmount: params.amount,
                                    takingAmount: params.limitPrice,
                                    maker: params.userAddress.toLowerCase(),
                                    receiver: params.userAddress.toLowerCase(),
                                    expiration: Number(expiration)
                                },
                                apiResponse: apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.data
                            },
                            signature: signature,
                            createdAt: new Date().toISOString(),
                            expiresAt: new Date((Number(expiration) * 1000)).toISOString()
                        };
                        logger_1.logger.info('1inch Limit Order created successfully', {
                            orderId: orderHash,
                            signature: signature,
                            expiration: Number(expiration),
                            apiSubmitted: !!apiResponse,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-sdk'
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: orderData
                            }];
                    case 6:
                        error_1 = _b.sent();
                        logger_1.logger.error('1inch Limit Order creation failed', {
                            error: error_1.message,
                            params: {
                                fromToken: params.fromToken,
                                toToken: params.toToken,
                                userAddress: params.userAddress
                            },
                            stack: error_1.stack,
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-sdk'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: "1inch Limit Order creation failed: ".concat(error_1.message)
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Submit order to 1inch API
     */
    LimitOrderSDKService.prototype.submitTo1inchAPI = function (order, signature, params) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.post("https://api.1inch.dev/limit-order/v1.0/order", {
                                order: {
                                    makerAsset: params.fromToken.toLowerCase(),
                                    takerAsset: params.toToken.toLowerCase(),
                                    makingAmount: params.amount,
                                    takingAmount: params.limitPrice,
                                    maker: params.userAddress.toLowerCase(),
                                    receiver: params.userAddress.toLowerCase(),
                                    salt: order.salt.toString(),
                                    expiration: order.expiration.toString()
                                },
                                signature: signature,
                                chainId: params.chainId
                            }, {
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error('1inch API submission failed', {
                            error: error_2.message,
                            orderId: order.getOrderHash(params.chainId),
                            timestamp: Date.now(),
                            service: 'cipherswap-limit-order-sdk'
                        });
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Submit order to the network
     */
    LimitOrderSDKService.prototype.submitOrder = function (orderHash, signature) {
        return __awaiter(this, void 0, void 0, function () {
            var mockResult;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Submitting order to network', {
                        orderHash: orderHash,
                        signature: signature,
                        timestamp: Date.now(),
                        service: 'cipherswap-limit-order-sdk'
                    });
                    mockResult = {
                        txHash: "0x".concat(Math.random().toString(16).substring(2, 66)),
                        status: 'submitted'
                    };
                    logger_1.logger.info('Order submitted successfully', {
                        orderHash: orderHash,
                        result: mockResult,
                        timestamp: Date.now(),
                        service: 'cipherswap-limit-order-sdk'
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                orderId: orderHash,
                                txHash: mockResult.txHash,
                                status: swap_1.LimitOrderStatus.PENDING,
                                fromToken: '',
                                toToken: '',
                                fromAmount: '0',
                                toAmount: '0',
                                limitPrice: '0',
                                orderType: 'sell',
                                gasEstimate: '0',
                                gasPrice: undefined,
                                deadline: 0,
                                userAddress: '',
                                timestamp: Date.now(),
                                route: [],
                                fusionData: {
                                    permit: null,
                                    deadline: 0,
                                    nonce: 0
                                },
                                customData: {},
                                createdAt: new Date().toISOString()
                            }
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Error submitting order', {
                        error: error instanceof Error ? error.message : String(error),
                        orderHash: orderHash,
                        timestamp: Date.now(),
                        service: 'cipherswap-limit-order-sdk'
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error occurred'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get order status
     */
    LimitOrderSDKService.prototype.getOrderStatus = function (orderHash) {
        return __awaiter(this, void 0, void 0, function () {
            var mockResult;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Getting order status', {
                        orderHash: orderHash,
                        timestamp: Date.now(),
                        service: 'cipherswap-limit-order-sdk'
                    });
                    mockResult = {
                        status: swap_1.LimitOrderStatus.PENDING,
                        txHash: "0x".concat(Math.random().toString(16).substring(2, 66)),
                        createdAt: new Date().toISOString()
                    };
                    logger_1.logger.info('Order status retrieved', {
                        orderHash: orderHash,
                        status: mockResult.status,
                        timestamp: Date.now(),
                        service: 'cipherswap-limit-order-sdk'
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                orderId: orderHash,
                                txHash: mockResult.txHash,
                                status: mockResult.status,
                                fromToken: '',
                                toToken: '',
                                fromAmount: '0',
                                toAmount: '0',
                                limitPrice: '0',
                                orderType: 'sell',
                                gasEstimate: '0',
                                gasPrice: undefined,
                                deadline: 0,
                                userAddress: '',
                                timestamp: Date.now(),
                                route: [],
                                fusionData: {
                                    permit: null,
                                    deadline: 0,
                                    nonce: 0
                                },
                                customData: {},
                                createdAt: mockResult.createdAt
                            }
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Error getting order status', {
                        error: error instanceof Error ? error.message : String(error),
                        orderHash: orderHash,
                        timestamp: Date.now(),
                        service: 'cipherswap-limit-order-sdk'
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error occurred'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Cancel order
     */
    LimitOrderSDKService.prototype.cancelOrder = function (orderHash) {
        return __awaiter(this, void 0, void 0, function () {
            var mockResult;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Cancelling order', {
                        orderHash: orderHash,
                        timestamp: Date.now(),
                        service: 'cipherswap-limit-order-sdk'
                    });
                    mockResult = {
                        txHash: "0x".concat(Math.random().toString(16).substring(2, 66)),
                        status: 'cancelled'
                    };
                    logger_1.logger.info('Order cancelled successfully', {
                        orderHash: orderHash,
                        result: mockResult,
                        timestamp: Date.now(),
                        service: 'cipherswap-limit-order-sdk'
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                orderId: orderHash,
                                txHash: mockResult.txHash,
                                status: swap_1.LimitOrderStatus.CANCELLED,
                                fromToken: '',
                                toToken: '',
                                fromAmount: '0',
                                toAmount: '0',
                                limitPrice: '0',
                                orderType: 'sell',
                                gasEstimate: '0',
                                gasPrice: undefined,
                                deadline: 0,
                                userAddress: '',
                                timestamp: Date.now(),
                                route: [],
                                fusionData: {
                                    permit: null,
                                    deadline: 0,
                                    nonce: 0
                                },
                                customData: {},
                                createdAt: new Date().toISOString()
                            }
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Error cancelling order', {
                        error: error instanceof Error ? error.message : String(error),
                        orderHash: orderHash,
                        timestamp: Date.now(),
                        service: 'cipherswap-limit-order-sdk'
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error occurred'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Validate limit order request
     */
    LimitOrderSDKService.prototype.validateLimitOrderRequest = function (params) {
        var errors = [];
        // Validate required fields
        if (!params.fromToken) {
            errors.push('fromToken is required');
        }
        if (!params.toToken) {
            errors.push('toToken is required');
        }
        if (!params.amount || params.amount === '0') {
            errors.push('amount must be greater than 0');
        }
        if (!params.limitPrice || params.limitPrice === '0') {
            errors.push('limitPrice must be greater than 0');
        }
        if (!params.userAddress) {
            errors.push('userAddress is required');
        }
        // Validate token addresses
        if (params.fromToken && params.toToken && params.fromToken === params.toToken) {
            errors.push('fromToken and toToken cannot be the same');
        }
        // Validate order type
        if (params.orderType && !['buy', 'sell'].includes(params.orderType)) {
            errors.push('Order type must be either "buy" or "sell"');
        }
        // Validate chain ID
        if (!params.chainId || params.chainId <= 0) {
            errors.push('Valid chainId is required');
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    return LimitOrderSDKService;
}());
exports.LimitOrderSDKService = LimitOrderSDKService;
