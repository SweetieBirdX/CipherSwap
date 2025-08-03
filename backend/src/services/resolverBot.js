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
exports.ResolverBot = void 0;
// ====== RESOLVER_BOT_LOGIC (yahya) ======
var ethers_1 = require("ethers");
var limit_order_sdk_1 = require("@1inch/limit-order-sdk");
var logger_1 = require("../utils/logger");
var env_1 = require("../config/env");
var axios_1 = require("axios");
var ResolverBot = /** @class */ (function () {
    function ResolverBot(authKey, privateKey, provider, orderbookService, predicateService) {
        var _this = this;
        this.isRunning = false;
        this.watchInterval = null;
        this.provider = provider;
        this.wallet = new ethers_1.ethers.Wallet(privateKey, provider);
        this.orderbookService = orderbookService;
        this.predicateService = predicateService;
        this.whitelistedAddresses = [];
        // Create HTTP connector for 1inch API
        var httpConnector = {
            get: function (url, headers) { return __awaiter(_this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, axios_1.default.get(url, { headers: headers })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, response.data];
                    }
                });
            }); },
            post: function (url, data, headers) { return __awaiter(_this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, axios_1.default.post(url, data, { headers: headers })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, response.data];
                    }
                });
            }); }
        };
        this.api = new limit_order_sdk_1.Api({
            networkId: env_1.config.CHAIN_ID,
            authKey: authKey,
            httpConnector: httpConnector
        });
        logger_1.logger.info('ResolverBot initialized', {
            address: this.wallet.address,
            chainId: env_1.config.CHAIN_ID,
            timestamp: Date.now(),
            service: 'cipherswap-resolver-bot'
        });
    }
    /**
     * Resolver bot'u başlat
     */
    ResolverBot.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isRunning) {
                    logger_1.logger.warn('ResolverBot is already running');
                    return [2 /*return*/];
                }
                this.isRunning = true;
                logger_1.logger.info('Starting ResolverBot', {
                    address: this.wallet.address,
                    timestamp: Date.now(),
                    service: 'cipherswap-resolver-bot'
                });
                // RFQ order'ları izlemeye başla
                this.watchRFQOrders();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Resolver bot'u durdur
     */
    ResolverBot.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.isRunning) {
                    logger_1.logger.warn('ResolverBot is not running');
                    return [2 /*return*/];
                }
                this.isRunning = false;
                if (this.watchInterval) {
                    clearInterval(this.watchInterval);
                    this.watchInterval = null;
                }
                logger_1.logger.info('ResolverBot stopped', {
                    address: this.wallet.address,
                    timestamp: Date.now(),
                    service: 'cipherswap-resolver-bot'
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * RFQ order'ları izle ve fill et
     */
    ResolverBot.prototype.watchRFQOrders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var intervalMs;
            var _this = this;
            return __generator(this, function (_a) {
                intervalMs = 10000;
                this.watchInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                    var fillableOrders, _i, fillableOrders_1, order, result, error_1;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!this.isRunning)
                                    return [2 /*return*/];
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 8, , 9]);
                                return [4 /*yield*/, this.orderbookService.getFillableOrders(this.wallet.address)];
                            case 2:
                                fillableOrders = _b.sent();
                                _i = 0, fillableOrders_1 = fillableOrders;
                                _b.label = 3;
                            case 3:
                                if (!(_i < fillableOrders_1.length)) return [3 /*break*/, 7];
                                order = fillableOrders_1[_i];
                                return [4 /*yield*/, this.orderIsFillable(order)];
                            case 4:
                                if (!_b.sent()) return [3 /*break*/, 6];
                                return [4 /*yield*/, this.fillOrder(order)];
                            case 5:
                                result = _b.sent();
                                if (result.success) {
                                    logger_1.logger.info('Order filled successfully', {
                                        orderId: order.orderId,
                                        txHash: (_a = result.data) === null || _a === void 0 ? void 0 : _a.hash,
                                        timestamp: Date.now(),
                                        service: 'cipherswap-resolver-bot'
                                    });
                                }
                                else {
                                    logger_1.logger.error('Order fill failed', {
                                        orderId: order.orderId,
                                        error: result.error,
                                        timestamp: Date.now(),
                                        service: 'cipherswap-resolver-bot'
                                    });
                                }
                                _b.label = 6;
                            case 6:
                                _i++;
                                return [3 /*break*/, 3];
                            case 7: return [3 /*break*/, 9];
                            case 8:
                                error_1 = _b.sent();
                                logger_1.logger.error('RFQ watching error', {
                                    error: error_1.message,
                                    timestamp: Date.now(),
                                    service: 'cipherswap-resolver-bot'
                                });
                                return [3 /*break*/, 9];
                            case 9: return [2 /*return*/];
                        }
                    });
                }); }, intervalMs);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Order'ın fill edilebilir olup olmadığını kontrol et
     */
    ResolverBot.prototype.orderIsFillable = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var predicateResult, orderSize, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Whitelist kontrolü
                        if (this.whitelistedAddresses.length > 0) {
                            if (!this.whitelistedAddresses.includes(this.wallet.address)) {
                                logger_1.logger.debug('Bot not in whitelist', {
                                    orderId: order.orderId,
                                    botAddress: this.wallet.address,
                                    service: 'cipherswap-resolver-bot'
                                });
                                return [2 /*return*/, false];
                            }
                        }
                        // Expiration kontrolü
                        if (Date.now() > order.deadline) {
                            logger_1.logger.debug('Order expired', {
                                orderId: order.orderId,
                                deadline: order.deadline,
                                service: 'cipherswap-resolver-bot'
                            });
                            return [2 /*return*/, false];
                        }
                        if (!order.predicateId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.validateOrderPredicate(order)];
                    case 1:
                        predicateResult = _a.sent();
                        if (!predicateResult.success || !predicateResult.isValid) {
                            logger_1.logger.debug('Predicate validation failed', {
                                orderId: order.orderId,
                                predicateId: order.predicateId,
                                error: predicateResult.error,
                                service: 'cipherswap-resolver-bot'
                            });
                            return [2 /*return*/, false];
                        }
                        _a.label = 2;
                    case 2:
                        orderSize = parseFloat(order.fromAmount);
                        if (orderSize < 0.001) { // Minimum order size
                            logger_1.logger.debug('Order size too small', {
                                orderId: order.orderId,
                                size: orderSize,
                                service: 'cipherswap-resolver-bot'
                            });
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 3:
                        error_2 = _a.sent();
                        logger_1.logger.error('Order fillability check error', {
                            orderId: order.orderId,
                            error: error_2.message,
                            service: 'cipherswap-resolver-bot'
                        });
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Order'ın predicate'ini validate et
     */
    ResolverBot.prototype.validateOrderPredicate = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!order.predicateId) {
                        return [2 /*return*/, { success: true, isValid: true }];
                    }
                    // Bu kısım predicate service ile entegre edilecek
                    // Şimdilik basit bir kontrol
                    return [2 /*return*/, { success: true, isValid: true }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            isValid: false,
                            error: error.message
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Order'ı fill et - Gerçek onchain execution
     */
    ResolverBot.prototype.fillOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var OnchainExecutionService, onchainService, executionResult, executedOrder, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        logger_1.logger.info('Attempting to fill order onchain', {
                            orderId: order.orderId,
                            fromToken: order.fromToken,
                            toToken: order.toToken,
                            amount: order.fromAmount,
                            service: 'cipherswap-resolver-bot'
                        });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./onchainExecutionService'); })];
                    case 1:
                        OnchainExecutionService = (_a.sent()).OnchainExecutionService;
                        onchainService = new OnchainExecutionService();
                        return [4 /*yield*/, onchainService.executeLimitOrderOnchain({
                                orderId: order.orderId,
                                userAddress: order.userAddress,
                                gasPrice: undefined, // Use network gas price
                                gasLimit: undefined, // Use estimated gas limit
                                maxPriorityFeePerGas: undefined, // Use network priority fee
                                maxFeePerGas: undefined // Use network max fee
                            })];
                    case 2:
                        executionResult = _a.sent();
                        if (!executionResult.success) {
                            throw new Error(executionResult.error);
                        }
                        executedOrder = executionResult.data;
                        // Order status'u güncelle
                        return [4 /*yield*/, this.orderbookService.updateOrderStatus(order.orderId, 'executed', {
                                executedBy: this.wallet.address,
                                executionTxHash: executedOrder.txHash,
                                executionTimestamp: Date.now()
                                // gasUsed and gasPrice removed as they're not in the interface
                            })];
                    case 3:
                        // Order status'u güncelle
                        _a.sent();
                        logger_1.logger.info('Order filled successfully onchain', {
                            orderId: order.orderId,
                            txHash: executedOrder.txHash,
                            gasUsed: executedOrder.gasEstimate,
                            service: 'cipherswap-resolver-bot'
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    hash: executedOrder.txHash,
                                    orderId: order.orderId,
                                    executedBy: this.wallet.address,
                                    gasUsed: executedOrder.gasEstimate,
                                    gasPrice: executedOrder.gasPrice
                                }
                            }];
                    case 4:
                        error_3 = _a.sent();
                        logger_1.logger.error('Fill order error', {
                            orderId: order.orderId,
                            error: error_3.message,
                            service: 'cipherswap-resolver-bot'
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: error_3.message
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Whitelist'e address ekle
     */
    ResolverBot.prototype.addToWhitelist = function (address) {
        if (!this.whitelistedAddresses.includes(address)) {
            this.whitelistedAddresses.push(address);
            logger_1.logger.info('Address added to whitelist', {
                address: address,
                service: 'cipherswap-resolver-bot'
            });
        }
    };
    /**
     * Whitelist'ten address çıkar
     */
    ResolverBot.prototype.removeFromWhitelist = function (address) {
        this.whitelistedAddresses = this.whitelistedAddresses.filter(function (addr) { return addr !== address; });
        logger_1.logger.info('Address removed from whitelist', {
            address: address,
            service: 'cipherswap-resolver-bot'
        });
    };
    /**
     * Bot durumunu al
     */
    ResolverBot.prototype.getStatus = function () {
        return {
            isRunning: this.isRunning,
            address: this.wallet.address,
            whitelistedAddresses: this.whitelistedAddresses,
            lastActivity: Date.now()
        };
    };
    return ResolverBot;
}());
exports.ResolverBot = ResolverBot;
// ====== END RESOLVER_BOT_LOGIC ====== 
