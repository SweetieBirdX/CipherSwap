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
exports.FrontendLimitOrderController = void 0;
var frontendLimitOrderService_1 = require("../../services/frontendLimitOrderService");
var logger_1 = require("../../utils/logger");
var FrontendLimitOrderController = /** @class */ (function () {
    function FrontendLimitOrderController() {
        this.service = new frontendLimitOrderService_1.FrontendLimitOrderService();
    }
    /**
     * Create unsigned transaction for frontend signing
     */
    FrontendLimitOrderController.prototype.createUnsignedTransaction = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, fromToken, toToken, amount, limitPrice, deadline, userAddress, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, fromToken = _a.fromToken, toToken = _a.toToken, amount = _a.amount, limitPrice = _a.limitPrice, deadline = _a.deadline, userAddress = _a.userAddress;
                        logger_1.logger.info('Creating unsigned transaction for limit order', {
                            userAddress: userAddress,
                            fromToken: fromToken,
                            toToken: toToken,
                            amount: amount,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        return [4 /*yield*/, this.service.createUnsignedTransaction({
                                fromToken: fromToken,
                                toToken: toToken,
                                amount: amount,
                                limitPrice: limitPrice,
                                deadline: deadline,
                                userAddress: userAddress,
                            })];
                    case 1:
                        result = _b.sent();
                        if (!result.success) {
                            return [2 /*return*/, res.status(400).json(result)];
                        }
                        res.json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('Failed to create unsigned transaction', {
                            error: error_1.message,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Failed to create unsigned transaction'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute user-signed transaction
     */
    FrontendLimitOrderController.prototype.executeUserSignedTransaction = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, signedTransaction, orderId, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, signedTransaction = _a.signedTransaction, orderId = _a.orderId;
                        logger_1.logger.info('Executing user-signed transaction', {
                            orderId: orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        return [4 /*yield*/, this.service.executeUserSignedTransaction(signedTransaction, orderId)];
                    case 1:
                        result = _b.sent();
                        res.json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.logger.error('Failed to execute user-signed transaction', {
                            error: error_2.message,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Failed to execute transaction'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get order status
     */
    FrontendLimitOrderController.prototype.getOrderStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var orderId, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        orderId = req.params.orderId;
                        logger_1.logger.info('Getting order status', {
                            orderId: orderId,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        return [4 /*yield*/, this.service.getOrderStatus(orderId)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.logger.error('Failed to get order status', {
                            error: error_3.message,
                            timestamp: Date.now(),
                            service: 'cipherswap-frontend-limit-order'
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Failed to get order status'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FrontendLimitOrderController;
}());
exports.FrontendLimitOrderController = FrontendLimitOrderController;
