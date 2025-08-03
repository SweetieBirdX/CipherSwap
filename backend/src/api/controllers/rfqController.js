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
exports.RFQController = void 0;
var logger_1 = require("../../utils/logger");
var rfqService_1 = require("../../services/rfqService");
var RFQController = /** @class */ (function () {
    function RFQController() {
        this.rfqService = new rfqService_1.RFQService();
    }
    /**
     * Create a new RFQ request
     * POST /api/rfq/request
     */
    RFQController.prototype.createRequest = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userAddress, fromToken, toToken, amount, chainId, useMEVProtection, allowedResolvers, maxSlippage, predicateId, preferredExecutionTime, gasOptimization, partialFill, metadata, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('RFQ Controller: Creating RFQ request', {
                            body: req.body,
                            userAddress: req.body.userAddress
                        });
                        _a = req.body, userAddress = _a.userAddress, fromToken = _a.fromToken, toToken = _a.toToken, amount = _a.amount, chainId = _a.chainId, useMEVProtection = _a.useMEVProtection, allowedResolvers = _a.allowedResolvers, maxSlippage = _a.maxSlippage, predicateId = _a.predicateId, preferredExecutionTime = _a.preferredExecutionTime, gasOptimization = _a.gasOptimization, partialFill = _a.partialFill, metadata = _a.metadata;
                        return [4 /*yield*/, this.rfqService.createRequest({
                                userAddress: userAddress,
                                fromToken: fromToken,
                                toToken: toToken,
                                amount: amount,
                                chainId: chainId,
                                useMEVProtection: useMEVProtection,
                                allowedResolvers: allowedResolvers,
                                maxSlippage: maxSlippage,
                                predicateId: predicateId,
                                preferredExecutionTime: preferredExecutionTime,
                                gasOptimization: gasOptimization,
                                partialFill: partialFill,
                                metadata: metadata
                            })];
                    case 1:
                        result = _b.sent();
                        if (!result.success) {
                            logger_1.logger.error('RFQ Controller: Failed to create RFQ request', {
                                error: result.error,
                                userAddress: userAddress
                            });
                            res.status(400).json({
                                success: false,
                                error: result.error,
                                code: 'RFQ_CREATE_FAILED',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('RFQ Controller: RFQ request created successfully', {
                            requestId: result.data.requestId,
                            userAddress: userAddress
                        });
                        res.status(201).json({
                            success: true,
                            data: result.data,
                            message: 'RFQ request created successfully',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('RFQ Controller: Create request error', {
                            error: error_1.message,
                            stack: error_1.stack
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            code: 'RFQ_CREATE_ERROR',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Submit a quote response from a resolver
     * POST /api/rfq/quote
     */
    RFQController.prototype.submitQuote = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, requestId, resolverAddress, resolverName, fromAmount, toAmount, priceImpact, gasEstimate, gasPrice, executionTime, mevProtectionType, bundleId, escrowAddress, resolverFee, protocolFee, totalCost, resolverReputation, averageExecutionTime, successRate, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        logger_1.logger.info('RFQ Controller: Submitting RFQ quote', {
                            body: req.body,
                            resolverAddress: req.body.resolverAddress
                        });
                        _a = req.body, requestId = _a.requestId, resolverAddress = _a.resolverAddress, resolverName = _a.resolverName, fromAmount = _a.fromAmount, toAmount = _a.toAmount, priceImpact = _a.priceImpact, gasEstimate = _a.gasEstimate, gasPrice = _a.gasPrice, executionTime = _a.executionTime, mevProtectionType = _a.mevProtectionType, bundleId = _a.bundleId, escrowAddress = _a.escrowAddress, resolverFee = _a.resolverFee, protocolFee = _a.protocolFee, totalCost = _a.totalCost, resolverReputation = _a.resolverReputation, averageExecutionTime = _a.averageExecutionTime, successRate = _a.successRate;
                        return [4 /*yield*/, this.rfqService.submitQuote({
                                requestId: requestId,
                                resolverAddress: resolverAddress,
                                resolverName: resolverName,
                                fromAmount: fromAmount,
                                toAmount: toAmount,
                                priceImpact: priceImpact,
                                gasEstimate: gasEstimate,
                                gasPrice: gasPrice,
                                executionTime: executionTime,
                                mevProtectionType: mevProtectionType,
                                bundleId: bundleId,
                                escrowAddress: escrowAddress,
                                resolverFee: resolverFee,
                                protocolFee: protocolFee,
                                totalCost: totalCost,
                                resolverReputation: resolverReputation,
                                averageExecutionTime: averageExecutionTime,
                                successRate: successRate
                            })];
                    case 1:
                        result = _b.sent();
                        if (!result.success) {
                            logger_1.logger.error('RFQ Controller: Failed to submit RFQ quote', {
                                error: result.error,
                                requestId: requestId,
                                resolverAddress: resolverAddress
                            });
                            res.status(400).json({
                                success: false,
                                error: result.error,
                                code: 'RFQ_QUOTE_SUBMIT_FAILED',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('RFQ Controller: RFQ quote submitted successfully', {
                            responseId: result.data.responseId,
                            requestId: requestId,
                            resolverAddress: resolverAddress
                        });
                        res.status(201).json({
                            success: true,
                            data: result.data,
                            message: 'RFQ quote submitted successfully',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.logger.error('RFQ Controller: Submit quote error', {
                            error: error_2.message,
                            stack: error_2.stack
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            code: 'RFQ_QUOTE_SUBMIT_ERROR',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get quotes for a request
     * GET /api/rfq/request/:requestId/quotes
     */
    RFQController.prototype.getQuotes = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        requestId = req.params.requestId;
                        logger_1.logger.info('RFQ Controller: Getting quotes for request', { requestId: requestId });
                        return [4 /*yield*/, this.rfqService.getQuotes(requestId)];
                    case 1:
                        result = _a.sent();
                        if (!result.success) {
                            logger_1.logger.error('RFQ Controller: Failed to get quotes', {
                                error: result.error,
                                requestId: requestId
                            });
                            res.status(400).json({
                                success: false,
                                error: result.error,
                                code: 'RFQ_GET_QUOTES_FAILED',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('RFQ Controller: Quotes retrieved successfully', {
                            requestId: requestId,
                            quoteCount: result.data.length
                        });
                        res.status(200).json({
                            success: true,
                            data: result.data,
                            message: 'Quotes retrieved successfully',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.logger.error('RFQ Controller: Get quotes error', {
                            error: error_3.message,
                            stack: error_3.stack
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            code: 'RFQ_GET_QUOTES_ERROR',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Accept a quote and execute the swap
     * POST /api/rfq/quote/:responseId/accept
     */
    RFQController.prototype.acceptQuote = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var responseId, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        responseId = req.params.responseId;
                        logger_1.logger.info('RFQ Controller: Accepting RFQ quote', { responseId: responseId });
                        return [4 /*yield*/, this.rfqService.acceptQuote(responseId)];
                    case 1:
                        result = _a.sent();
                        if (!result.success) {
                            logger_1.logger.error('RFQ Controller: Failed to accept quote', {
                                error: result.error,
                                responseId: responseId
                            });
                            res.status(400).json({
                                success: false,
                                error: result.error,
                                code: 'RFQ_ACCEPT_QUOTE_FAILED',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('RFQ Controller: RFQ quote accepted successfully', {
                            executionId: result.data.executionId,
                            responseId: responseId
                        });
                        res.status(200).json({
                            success: true,
                            data: result.data,
                            message: 'RFQ quote accepted successfully',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        logger_1.logger.error('RFQ Controller: Accept quote error', {
                            error: error_4.message,
                            stack: error_4.stack
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            code: 'RFQ_ACCEPT_QUOTE_ERROR',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update execution status
     * PUT /api/rfq/execution/:executionId/status
     */
    RFQController.prototype.updateExecutionStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var executionId, _a, status_1, executionData, result, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        executionId = req.params.executionId;
                        _a = req.body, status_1 = _a.status, executionData = _a.executionData;
                        logger_1.logger.info('RFQ Controller: Updating execution status', {
                            executionId: executionId,
                            status: status_1,
                            executionData: executionData
                        });
                        return [4 /*yield*/, this.rfqService.updateExecutionStatus(executionId, status_1, executionData)];
                    case 1:
                        result = _b.sent();
                        if (!result.success) {
                            logger_1.logger.error('RFQ Controller: Failed to update execution status', {
                                error: result.error,
                                executionId: executionId
                            });
                            res.status(400).json({
                                success: false,
                                error: result.error,
                                code: 'RFQ_UPDATE_EXECUTION_FAILED',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('RFQ Controller: Execution status updated successfully', {
                            executionId: executionId,
                            status: status_1
                        });
                        res.status(200).json({
                            success: true,
                            data: result.data,
                            message: 'Execution status updated successfully',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        logger_1.logger.error('RFQ Controller: Update execution status error', {
                            error: error_5.message,
                            stack: error_5.stack
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            code: 'RFQ_UPDATE_EXECUTION_ERROR',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get RFQ request by ID
     * GET /api/rfq/request/:requestId
     */
    RFQController.prototype.getRequest = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        requestId = req.params.requestId;
                        logger_1.logger.info('RFQ Controller: Getting RFQ request', { requestId: requestId });
                        return [4 /*yield*/, this.rfqService.getRequest(requestId)];
                    case 1:
                        result = _a.sent();
                        if (!result.success) {
                            logger_1.logger.error('RFQ Controller: Failed to get RFQ request', {
                                error: result.error,
                                requestId: requestId
                            });
                            res.status(404).json({
                                success: false,
                                error: result.error,
                                code: 'RFQ_REQUEST_NOT_FOUND',
                                timestamp: Date.now()
                            });
                            return [2 /*return*/];
                        }
                        logger_1.logger.info('RFQ Controller: RFQ request retrieved successfully', { requestId: requestId });
                        res.status(200).json({
                            success: true,
                            data: result.data,
                            message: 'RFQ request retrieved successfully',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('RFQ Controller: Get request error', {
                            error: error_6.message,
                            stack: error_6.stack
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            code: 'RFQ_GET_REQUEST_ERROR',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Query RFQ requests with filters
     * GET /api/rfq/requests
     */
    RFQController.prototype.queryRequests = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var query, requests, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        query = req.query;
                        logger_1.logger.info('RFQ Controller: Querying RFQ requests', { query: query });
                        return [4 /*yield*/, this.rfqService.queryRequests(query)];
                    case 1:
                        requests = _a.sent();
                        logger_1.logger.info('RFQ Controller: RFQ requests queried successfully', {
                            count: requests.length
                        });
                        res.status(200).json({
                            success: true,
                            data: requests,
                            message: 'RFQ requests queried successfully',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        logger_1.logger.error('RFQ Controller: Query requests error', {
                            error: error_7.message,
                            stack: error_7.stack
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            code: 'RFQ_QUERY_REQUESTS_ERROR',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get RFQ statistics
     * GET /api/rfq/stats
     */
    RFQController.prototype.getStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('RFQ Controller: Getting RFQ statistics');
                        return [4 /*yield*/, this.rfqService.getRFQStats()];
                    case 1:
                        stats = _a.sent();
                        logger_1.logger.info('RFQ Controller: RFQ statistics retrieved successfully');
                        res.status(200).json({
                            success: true,
                            data: stats,
                            message: 'RFQ statistics retrieved successfully',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        logger_1.logger.error('RFQ Controller: Get stats error', {
                            error: error_8.message,
                            stack: error_8.stack
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            code: 'RFQ_GET_STATS_ERROR',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up expired RFQ data
     * POST /api/rfq/cleanup
     */
    RFQController.prototype.cleanupExpired = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('RFQ Controller: Cleaning up expired RFQ data');
                        return [4 /*yield*/, this.rfqService.cleanupExpired()];
                    case 1:
                        _a.sent();
                        logger_1.logger.info('RFQ Controller: Expired RFQ data cleaned up successfully');
                        res.status(200).json({
                            success: true,
                            message: 'Expired RFQ data cleaned up successfully',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        logger_1.logger.error('RFQ Controller: Cleanup error', {
                            error: error_9.message,
                            stack: error_9.stack
                        });
                        res.status(500).json({
                            success: false,
                            error: 'Internal server error',
                            code: 'RFQ_CLEANUP_ERROR',
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return RFQController;
}());
exports.RFQController = RFQController;
exports.default = RFQController;
