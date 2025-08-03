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
exports.RFQService = void 0;
var logger_1 = require("../utils/logger");
var rfq_1 = require("../types/rfq");
var orderbookService_1 = require("./orderbookService");
var predicateService_1 = require("./predicateService");
var quoteService_1 = require("./quoteService");
var RFQService = /** @class */ (function () {
    function RFQService() {
        this.requests = new Map();
        this.responses = new Map();
        this.executions = new Map();
        this.userRequests = new Map(); // userAddress -> Set<requestId>
        this.requestResponses = new Map(); // requestId -> Set<responseId>
        this.orderbookService = new orderbookService_1.OrderbookService();
        this.predicateService = new predicateService_1.PredicateService();
        this.quoteService = new quoteService_1.QuoteService();
    }
    /**
     * Create a new RFQ request
     */
    RFQService.prototype.createRequest = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, userRequestCount, requestId, deadline, request;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Creating RFQ request', { params: params });
                    validation = this.validateRequestParams(params);
                    if (!validation.isValid) {
                        return [2 /*return*/, {
                                success: false,
                                error: validation.errors.join(', ')
                            }];
                    }
                    userRequestCount = this.getUserRequestCount(params.userAddress);
                    if (userRequestCount >= rfq_1.RFQ_CONSTANTS.MAX_REQUESTS_PER_USER) {
                        return [2 /*return*/, {
                                success: false,
                                error: "Maximum requests per user exceeded (".concat(rfq_1.RFQ_CONSTANTS.MAX_REQUESTS_PER_USER, ")")
                            }];
                    }
                    requestId = "rfq_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                    deadline = Date.now() + rfq_1.RFQ_CONSTANTS.REQUEST_EXPIRY_TIME;
                    request = {
                        requestId: requestId,
                        userAddress: params.userAddress,
                        fromToken: params.fromToken,
                        toToken: params.toToken,
                        amount: params.amount,
                        chainId: params.chainId,
                        deadline: deadline,
                        timestamp: Date.now(),
                        status: rfq_1.RFQStatus.PENDING,
                        useMEVProtection: params.useMEVProtection || false,
                        allowedResolvers: params.allowedResolvers,
                        maxSlippage: params.maxSlippage || rfq_1.RFQ_CONSTANTS.DEFAULT_SLIPPAGE,
                        predicateId: params.predicateId,
                        preferredExecutionTime: params.preferredExecutionTime,
                        gasOptimization: params.gasOptimization,
                        partialFill: params.partialFill,
                        metadata: params.metadata
                    };
                    // Store request
                    this.requests.set(requestId, request);
                    // Update user requests index
                    if (!this.userRequests.has(params.userAddress)) {
                        this.userRequests.set(params.userAddress, new Set());
                    }
                    this.userRequests.get(params.userAddress).add(requestId);
                    // Initialize responses set
                    this.requestResponses.set(requestId, new Set());
                    logger_1.logger.info('RFQ request created successfully', {
                        requestId: requestId,
                        userAddress: params.userAddress,
                        amount: params.amount,
                        chainId: params.chainId
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: request
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Create RFQ request error', {
                        error: error.message,
                        params: params
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to create RFQ request'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Submit a quote response from a resolver
     */
    RFQService.prototype.submitQuote = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var request, validation, responseId, validUntil, response;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Submitting RFQ quote', { params: params });
                    request = this.requests.get(params.requestId);
                    if (!request) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ request not found'
                            }];
                    }
                    if (request.status !== rfq_1.RFQStatus.PENDING) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ request is not active'
                            }];
                    }
                    // Check if request is expired
                    if (Date.now() > request.deadline) {
                        request.status = rfq_1.RFQStatus.EXPIRED;
                        this.requests.set(params.requestId, request);
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ request has expired'
                            }];
                    }
                    // Validate resolver is allowed
                    if (request.allowedResolvers && request.allowedResolvers.length > 0) {
                        if (!request.allowedResolvers.includes(params.resolverAddress)) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Resolver not authorized for this request'
                                }];
                        }
                    }
                    validation = this.validateQuoteParams(params);
                    if (!validation.isValid) {
                        return [2 /*return*/, {
                                success: false,
                                error: validation.errors.join(', ')
                            }];
                    }
                    responseId = "quote_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                    validUntil = Date.now() + rfq_1.RFQ_CONSTANTS.QUOTE_VALIDITY_TIME;
                    response = {
                        responseId: responseId,
                        requestId: params.requestId,
                        resolverAddress: params.resolverAddress,
                        resolverName: params.resolverName,
                        fromAmount: params.fromAmount,
                        toAmount: params.toAmount,
                        priceImpact: params.priceImpact,
                        gasEstimate: params.gasEstimate,
                        gasPrice: params.gasPrice,
                        executionTime: params.executionTime,
                        mevProtectionType: params.mevProtectionType,
                        bundleId: params.bundleId,
                        escrowAddress: params.escrowAddress,
                        resolverFee: params.resolverFee,
                        protocolFee: params.protocolFee,
                        totalCost: params.totalCost,
                        validUntil: validUntil,
                        timestamp: Date.now(),
                        status: rfq_1.RFQResponseStatus.PENDING,
                        resolverReputation: params.resolverReputation,
                        averageExecutionTime: params.averageExecutionTime,
                        successRate: params.successRate
                    };
                    // Store response
                    this.responses.set(responseId, response);
                    // Update request responses index
                    this.requestResponses.get(params.requestId).add(responseId);
                    // Update request status to quoted
                    request.status = rfq_1.RFQStatus.QUOTED;
                    this.requests.set(params.requestId, request);
                    logger_1.logger.info('RFQ quote submitted successfully', {
                        responseId: responseId,
                        requestId: params.requestId,
                        resolverAddress: params.resolverAddress,
                        toAmount: params.toAmount
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: response
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Submit RFQ quote error', {
                        error: error.message,
                        params: params
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to submit RFQ quote'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get quotes for a request
     */
    RFQService.prototype.getQuotes = function (requestId) {
        return __awaiter(this, void 0, void 0, function () {
            var request, responseIds, quotes, now, _i, responseIds_1, responseId, response;
            return __generator(this, function (_a) {
                try {
                    request = this.requests.get(requestId);
                    if (!request) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ request not found'
                            }];
                    }
                    responseIds = this.requestResponses.get(requestId);
                    if (!responseIds || responseIds.size === 0) {
                        return [2 /*return*/, {
                                success: true,
                                data: []
                            }];
                    }
                    quotes = [];
                    now = Date.now();
                    for (_i = 0, responseIds_1 = responseIds; _i < responseIds_1.length; _i++) {
                        responseId = responseIds_1[_i];
                        response = this.responses.get(responseId);
                        if (response && response.validUntil > now && response.status === rfq_1.RFQResponseStatus.PENDING) {
                            quotes.push({
                                resolverAddress: response.resolverAddress,
                                resolverName: response.resolverName,
                                quote: response,
                                performance: {
                                    reputation: response.resolverReputation,
                                    successRate: response.successRate,
                                    averageExecutionTime: response.averageExecutionTime,
                                    totalFills: 0 // Would be populated from resolver stats
                                }
                            });
                        }
                    }
                    // Sort by best quote (lowest total cost)
                    quotes.sort(function (a, b) { return parseFloat(a.quote.totalCost) - parseFloat(b.quote.totalCost); });
                    return [2 /*return*/, {
                            success: true,
                            data: quotes
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Get RFQ quotes error', { error: error.message, requestId: requestId });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to get RFQ quotes'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Accept a quote and execute the swap
     */
    RFQService.prototype.acceptQuote = function (responseId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, request, executionId, execution;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Accepting RFQ quote', { responseId: responseId });
                    response = this.responses.get(responseId);
                    if (!response) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ response not found'
                            }];
                    }
                    if (response.status !== rfq_1.RFQResponseStatus.PENDING) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ response is not available for acceptance'
                            }];
                    }
                    if (Date.now() > response.validUntil) {
                        response.status = rfq_1.RFQResponseStatus.EXPIRED;
                        this.responses.set(responseId, response);
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ response has expired'
                            }];
                    }
                    request = this.requests.get(response.requestId);
                    if (!request) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ request not found'
                            }];
                    }
                    executionId = "exec_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                    execution = {
                        executionId: executionId,
                        requestId: response.requestId,
                        responseId: responseId,
                        userAddress: request.userAddress,
                        resolverAddress: response.resolverAddress,
                        fromToken: request.fromToken,
                        toToken: request.toToken,
                        fromAmount: response.fromAmount,
                        toAmount: response.toAmount,
                        txHash: '',
                        blockNumber: 0,
                        gasUsed: '0',
                        gasPrice: response.gasPrice,
                        status: rfq_1.ExecutionStatus.PENDING,
                        executionTime: 0,
                        timestamp: Date.now()
                    };
                    // Store execution
                    this.executions.set(executionId, execution);
                    // Update response status
                    response.status = rfq_1.RFQResponseStatus.ACCEPTED;
                    this.responses.set(responseId, response);
                    // Update request status
                    request.status = rfq_1.RFQStatus.EXECUTED;
                    this.requests.set(response.requestId, request);
                    logger_1.logger.info('RFQ quote accepted successfully', {
                        executionId: executionId,
                        responseId: responseId,
                        requestId: response.requestId
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: execution
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Accept RFQ quote error', {
                        error: error.message,
                        responseId: responseId
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to accept RFQ quote'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update execution status
     */
    RFQService.prototype.updateExecutionStatus = function (executionId, status, executionData) {
        return __awaiter(this, void 0, void 0, function () {
            var execution, response;
            return __generator(this, function (_a) {
                try {
                    execution = this.executions.get(executionId);
                    if (!execution) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ execution not found'
                            }];
                    }
                    execution.status = status;
                    if (executionData) {
                        if (executionData.txHash)
                            execution.txHash = executionData.txHash;
                        if (executionData.blockNumber)
                            execution.blockNumber = executionData.blockNumber;
                        if (executionData.gasUsed)
                            execution.gasUsed = executionData.gasUsed;
                        if (executionData.executionTime)
                            execution.executionTime = executionData.executionTime;
                        if (executionData.error)
                            execution.error = executionData.error;
                    }
                    this.executions.set(executionId, execution);
                    response = this.responses.get(execution.responseId);
                    if (response) {
                        if (status === rfq_1.ExecutionStatus.CONFIRMED) {
                            response.status = rfq_1.RFQResponseStatus.EXECUTED;
                        }
                        else if (status === rfq_1.ExecutionStatus.FAILED) {
                            response.status = rfq_1.RFQResponseStatus.FAILED;
                        }
                        this.responses.set(execution.responseId, response);
                    }
                    logger_1.logger.info('RFQ execution status updated', {
                        executionId: executionId,
                        status: status,
                        executionData: executionData
                    });
                    return [2 /*return*/, {
                            success: true,
                            data: execution
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Update RFQ execution status error', {
                        error: error.message,
                        executionId: executionId
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to update RFQ execution status'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get RFQ request by ID
     */
    RFQService.prototype.getRequest = function (requestId) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                try {
                    request = this.requests.get(requestId);
                    if (!request) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'RFQ request not found'
                            }];
                    }
                    return [2 /*return*/, {
                            success: true,
                            data: request
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Get RFQ request error', { error: error.message, requestId: requestId });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to get RFQ request'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Query RFQ requests with filters
     */
    RFQService.prototype.queryRequests = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var filteredRequests, limit, page, startIndex, endIndex, paginatedRequests;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Querying RFQ requests', { query: query });
                    filteredRequests = Array.from(this.requests.values());
                    // Apply filters
                    if (query.userAddress) {
                        filteredRequests = filteredRequests.filter(function (request) { return request.userAddress === query.userAddress; });
                    }
                    if (query.fromToken) {
                        filteredRequests = filteredRequests.filter(function (request) { return request.fromToken === query.fromToken; });
                    }
                    if (query.toToken) {
                        filteredRequests = filteredRequests.filter(function (request) { return request.toToken === query.toToken; });
                    }
                    if (query.chainId) {
                        filteredRequests = filteredRequests.filter(function (request) { return request.chainId === query.chainId; });
                    }
                    if (query.status) {
                        filteredRequests = filteredRequests.filter(function (request) { return request.status === query.status; });
                    }
                    if (query.startTime) {
                        filteredRequests = filteredRequests.filter(function (request) { return request.timestamp >= query.startTime; });
                    }
                    if (query.endTime) {
                        filteredRequests = filteredRequests.filter(function (request) { return request.timestamp <= query.endTime; });
                    }
                    // Sort requests
                    if (query.sortBy) {
                        filteredRequests.sort(function (a, b) {
                            var aValue, bValue;
                            switch (query.sortBy) {
                                case 'timestamp':
                                    aValue = a.timestamp;
                                    bValue = b.timestamp;
                                    break;
                                case 'amount':
                                    aValue = parseFloat(a.amount);
                                    bValue = parseFloat(b.amount);
                                    break;
                                case 'price':
                                    // Would need to calculate price impact
                                    aValue = 0;
                                    bValue = 0;
                                    break;
                                default:
                                    aValue = a.timestamp;
                                    bValue = b.timestamp;
                            }
                            if (query.sortOrder === 'desc') {
                                return bValue - aValue;
                            }
                            return aValue - bValue;
                        });
                    }
                    limit = query.limit || 50;
                    page = query.page || 1;
                    startIndex = (page - 1) * limit;
                    endIndex = startIndex + limit;
                    paginatedRequests = filteredRequests.slice(startIndex, endIndex);
                    logger_1.logger.info('RFQ requests queried successfully', {
                        total: filteredRequests.length,
                        returned: paginatedRequests.length,
                        page: page,
                        limit: limit
                    });
                    return [2 /*return*/, paginatedRequests];
                }
                catch (error) {
                    logger_1.logger.error('Query RFQ requests error', { error: error.message, query: query });
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get RFQ statistics
     */
    RFQService.prototype.getRFQStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requests, activeRequests, totalVolume, responseTimes, _i, requests_1, request, responseIds, _a, responseIds_2, responseId, response, averageResponseTime, executedRequests, successRate, pairStats_1, mostActivePairs, responses, uniqueResolvers, activeResolvers, averageReputation, stats;
            return __generator(this, function (_b) {
                try {
                    requests = Array.from(this.requests.values());
                    activeRequests = requests.filter(function (request) {
                        return request.status === rfq_1.RFQStatus.PENDING || request.status === rfq_1.RFQStatus.QUOTED;
                    });
                    totalVolume = requests
                        .filter(function (request) { return request.status === rfq_1.RFQStatus.EXECUTED; })
                        .reduce(function (sum, request) { return sum + parseFloat(request.amount); }, 0)
                        .toString();
                    responseTimes = [];
                    for (_i = 0, requests_1 = requests; _i < requests_1.length; _i++) {
                        request = requests_1[_i];
                        responseIds = this.requestResponses.get(request.requestId);
                        if (responseIds && responseIds.size > 0) {
                            for (_a = 0, responseIds_2 = responseIds; _a < responseIds_2.length; _a++) {
                                responseId = responseIds_2[_a];
                                response = this.responses.get(responseId);
                                if (response) {
                                    responseTimes.push(response.timestamp - request.timestamp);
                                }
                            }
                        }
                    }
                    averageResponseTime = responseTimes.length > 0
                        ? responseTimes.reduce(function (sum, time) { return sum + time; }, 0) / responseTimes.length
                        : 0;
                    executedRequests = requests.filter(function (request) { return request.status === rfq_1.RFQStatus.EXECUTED; });
                    successRate = requests.length > 0 ? (executedRequests.length / requests.length) * 100 : 0;
                    pairStats_1 = new Map();
                    requests.forEach(function (request) {
                        var pair = "".concat(request.fromToken, "-").concat(request.toToken);
                        var current = pairStats_1.get(pair) || { volume: 0, count: 0 };
                        current.volume += parseFloat(request.amount);
                        current.count += 1;
                        pairStats_1.set(pair, current);
                    });
                    mostActivePairs = Array.from(pairStats_1.entries())
                        .map(function (_a) {
                        var pair = _a[0], stats = _a[1];
                        return ({
                            pair: pair,
                            volume: stats.volume.toString(),
                            requestCount: stats.count
                        });
                    })
                        .sort(function (a, b) { return b.requestCount - a.requestCount; })
                        .slice(0, 5);
                    responses = Array.from(this.responses.values());
                    uniqueResolvers = new Set(responses.map(function (r) { return r.resolverAddress; }));
                    activeResolvers = uniqueResolvers.size;
                    averageReputation = responses.length > 0
                        ? responses.reduce(function (sum, r) { return sum + r.resolverReputation; }, 0) / responses.length
                        : 0;
                    stats = {
                        totalRequests: requests.length,
                        activeRequests: activeRequests.length,
                        totalVolume: totalVolume,
                        averageResponseTime: averageResponseTime,
                        successRate: successRate,
                        mostActivePairs: mostActivePairs,
                        resolverStats: {
                            total: uniqueResolvers.size,
                            active: activeResolvers,
                            averageReputation: averageReputation
                        }
                    };
                    return [2 /*return*/, stats];
                }
                catch (error) {
                    logger_1.logger.error('Get RFQ stats error', { error: error.message });
                    return [2 /*return*/, {
                            totalRequests: 0,
                            activeRequests: 0,
                            totalVolume: '0',
                            averageResponseTime: 0,
                            successRate: 0,
                            mostActivePairs: [],
                            resolverStats: {
                                total: 0,
                                active: 0,
                                averageReputation: 0
                            }
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Clean up expired requests and responses
     */
    RFQService.prototype.cleanupExpired = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, expiredRequests, expiredResponses, _i, _a, _b, requestId, request, _c, _d, _e, responseId, response;
            return __generator(this, function (_f) {
                try {
                    now = Date.now();
                    expiredRequests = 0;
                    expiredResponses = 0;
                    // Clean up expired requests
                    for (_i = 0, _a = this.requests.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], requestId = _b[0], request = _b[1];
                        if (request.status === rfq_1.RFQStatus.PENDING && now > request.deadline) {
                            request.status = rfq_1.RFQStatus.EXPIRED;
                            this.requests.set(requestId, request);
                            expiredRequests++;
                        }
                    }
                    // Clean up expired responses
                    for (_c = 0, _d = this.responses.entries(); _c < _d.length; _c++) {
                        _e = _d[_c], responseId = _e[0], response = _e[1];
                        if (response.status === rfq_1.RFQResponseStatus.PENDING && now > response.validUntil) {
                            response.status = rfq_1.RFQResponseStatus.EXPIRED;
                            this.responses.set(responseId, response);
                            expiredResponses++;
                        }
                    }
                    if (expiredRequests > 0 || expiredResponses > 0) {
                        logger_1.logger.info('Cleaned up expired RFQ data', {
                            expiredRequests: expiredRequests,
                            expiredResponses: expiredResponses
                        });
                    }
                }
                catch (error) {
                    logger_1.logger.error('Cleanup expired RFQ error', { error: error.message });
                }
                return [2 /*return*/];
            });
        });
    };
    // Private helper methods
    RFQService.prototype.validateRequestParams = function (params) {
        var errors = [];
        if (!params.userAddress) {
            errors.push('userAddress is required');
        }
        if (!params.fromToken) {
            errors.push('fromToken is required');
        }
        if (!params.toToken) {
            errors.push('toToken is required');
        }
        if (!params.amount) {
            errors.push('amount is required');
        }
        if (!params.chainId) {
            errors.push('chainId is required');
        }
        if (params.amount) {
            var amount = parseFloat(params.amount);
            // Convert wei constants to ETH for comparison
            var minAmountEth = parseFloat(rfq_1.RFQ_CONSTANTS.MIN_AMOUNT) / Math.pow(10, 18);
            var maxAmountEth = parseFloat(rfq_1.RFQ_CONSTANTS.MAX_AMOUNT) / Math.pow(10, 18);
            if (amount < minAmountEth) {
                errors.push("Amount too small. Minimum: ".concat(minAmountEth, " ETH"));
            }
            if (amount > maxAmountEth) {
                errors.push("Amount too large. Maximum: ".concat(maxAmountEth, " ETH"));
            }
        }
        if (params.allowedResolvers && params.allowedResolvers.length > rfq_1.RFQ_CONSTANTS.MAX_ALLOWED_RESOLVERS) {
            errors.push("Too many allowed resolvers. Maximum: ".concat(rfq_1.RFQ_CONSTANTS.MAX_ALLOWED_RESOLVERS));
        }
        if (params.maxSlippage && (params.maxSlippage < 0 || params.maxSlippage > rfq_1.RFQ_CONSTANTS.MAX_SLIPPAGE)) {
            errors.push("Invalid slippage. Must be between 0 and ".concat(rfq_1.RFQ_CONSTANTS.MAX_SLIPPAGE, "%"));
        }
        if (params.preferredExecutionTime && (params.preferredExecutionTime < rfq_1.RFQ_CONSTANTS.MIN_RESPONSE_TIME || params.preferredExecutionTime > rfq_1.RFQ_CONSTANTS.MAX_RESPONSE_TIME)) {
            errors.push("Invalid execution time. Must be between ".concat(rfq_1.RFQ_CONSTANTS.MIN_RESPONSE_TIME, " and ").concat(rfq_1.RFQ_CONSTANTS.MAX_RESPONSE_TIME, " seconds"));
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    RFQService.prototype.validateQuoteParams = function (params) {
        var errors = [];
        if (!params.requestId) {
            errors.push('requestId is required');
        }
        if (!params.resolverAddress) {
            errors.push('resolverAddress is required');
        }
        if (!params.resolverName) {
            errors.push('resolverName is required');
        }
        if (!params.fromAmount) {
            errors.push('fromAmount is required');
        }
        if (!params.toAmount) {
            errors.push('toAmount is required');
        }
        if (typeof params.priceImpact !== 'number') {
            errors.push('priceImpact is required and must be a number');
        }
        if (!params.gasEstimate) {
            errors.push('gasEstimate is required');
        }
        if (!params.gasPrice) {
            errors.push('gasPrice is required');
        }
        if (typeof params.executionTime !== 'number') {
            errors.push('executionTime is required and must be a number');
        }
        if (!params.mevProtectionType) {
            errors.push('mevProtectionType is required');
        }
        if (!params.resolverFee) {
            errors.push('resolverFee is required');
        }
        if (!params.protocolFee) {
            errors.push('protocolFee is required');
        }
        if (!params.totalCost) {
            errors.push('totalCost is required');
        }
        if (typeof params.resolverReputation !== 'number') {
            errors.push('resolverReputation is required and must be a number');
        }
        if (typeof params.averageExecutionTime !== 'number') {
            errors.push('averageExecutionTime is required and must be a number');
        }
        if (typeof params.successRate !== 'number') {
            errors.push('successRate is required and must be a number');
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    RFQService.prototype.getUserRequestCount = function (userAddress) {
        var userRequestSet = this.userRequests.get(userAddress);
        return userRequestSet ? userRequestSet.size : 0;
    };
    return RFQService;
}());
exports.RFQService = RFQService;
