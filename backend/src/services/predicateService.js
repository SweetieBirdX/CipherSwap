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
exports.PredicateService = void 0;
exports.buildPriceGuardPredicate = buildPriceGuardPredicate;
exports.validateLimitOrderPredicate = validateLimitOrderPredicate;
var logger_1 = require("../utils/logger");
var predicate_1 = require("../types/predicate");
var PredicateService = /** @class */ (function () {
    function PredicateService() {
        this.predicateHistory = new Map();
        // Initialize with some mock data for testing
        this.initializeMockData();
    }
    /**
     * Create a new price predicate
     */
    PredicateService.prototype.createPredicate = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, oraclePrice, predicateData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Creating predicate', { params: params });
                        validation = this.validatePredicateRequest(params);
                        if (!validation.isValid) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: validation.errors.join(', ')
                                }];
                        }
                        return [4 /*yield*/, this.getOraclePrice(params.oracleAddress, params.chainId)];
                    case 1:
                        oraclePrice = _a.sent();
                        if (!oraclePrice.success) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Failed to get oracle price'
                                }];
                        }
                        predicateData = this.formatPredicateData(params, oraclePrice.data);
                        // Store predicate data
                        this.predicateHistory.set(predicateData.predicateId, predicateData);
                        logger_1.logger.info('Predicate created successfully', {
                            predicateId: predicateData.predicateId,
                            oracleAddress: params.oracleAddress,
                            tolerance: params.tolerance
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: predicateData
                            }];
                    case 2:
                        error_1 = _a.sent();
                        logger_1.logger.error('Predicate service error', {
                            error: error_1.message,
                            params: params
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: this.handlePredicateError(error_1)
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate predicate with current oracle price
     */
    PredicateService.prototype.validatePredicate = function (predicateId) {
        return __awaiter(this, void 0, void 0, function () {
            var predicateData, oraclePrice, validation, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        logger_1.logger.info('Validating predicate', { predicateId: predicateId });
                        predicateData = this.predicateHistory.get(predicateId);
                        if (!predicateData) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Predicate not found'
                                }];
                        }
                        return [4 /*yield*/, this.getOraclePrice(predicateData.oracleAddress, predicateData.chainId)];
                    case 1:
                        oraclePrice = _a.sent();
                        if (!oraclePrice.success) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Failed to get oracle price'
                                }];
                        }
                        validation = this.validatePredicateLogic(predicateData, oraclePrice.data);
                        // Update predicate status
                        predicateData.currentPrice = oraclePrice.data.price;
                        predicateData.isValid = validation.isValid;
                        predicateData.status = validation.isValid ? predicate_1.PredicateStatus.ACTIVE : predicate_1.PredicateStatus.INVALID;
                        this.predicateHistory.set(predicateId, predicateData);
                        return [2 /*return*/, {
                                success: true,
                                data: validation
                            }];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error('Predicate validation error', { error: error_2.message, predicateId: predicateId });
                        return [2 /*return*/, {
                                success: false,
                                error: 'Validation failed'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get predicate history for user
     */
    PredicateService.prototype.getPredicateHistory = function (userAddress_1) {
        return __awaiter(this, arguments, void 0, function (userAddress, limit, page) {
            var userPredicates, startIndex, endIndex;
            if (limit === void 0) { limit = 10; }
            if (page === void 0) { page = 1; }
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Getting predicate history', { userAddress: userAddress, limit: limit, page: page });
                    userPredicates = Array.from(this.predicateHistory.values())
                        .filter(function (predicate) { return predicate.userAddress === userAddress; })
                        .sort(function (a, b) { return b.createdAt - a.createdAt; });
                    startIndex = (page - 1) * limit;
                    endIndex = startIndex + limit;
                    return [2 /*return*/, userPredicates.slice(startIndex, endIndex).map(function (predicate) { return ({
                            id: predicate.predicateId,
                            predicateId: predicate.predicateId,
                            chainId: predicate.chainId,
                            oracleAddress: predicate.oracleAddress,
                            tolerance: predicate.tolerance,
                            status: predicate.status,
                            createdAt: predicate.createdAt,
                            userAddress: predicate.userAddress,
                            txHash: predicate.txHash
                        }); })];
                }
                catch (error) {
                    logger_1.logger.error('Get predicate history error', { error: error.message, userAddress: userAddress });
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get available Chainlink oracles for chain
     */
    PredicateService.prototype.getAvailableOracles = function (chainId) {
        return __awaiter(this, void 0, void 0, function () {
            var chainOracles, oracles, _i, _a, _b, pair, address, priceResponse, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        logger_1.logger.info('Getting available oracles', { chainId: chainId });
                        chainOracles = predicate_1.CHAINLINK_ORACLES[chainId];
                        if (!chainOracles) {
                            return [2 /*return*/, []];
                        }
                        oracles = [];
                        _i = 0, _a = Object.entries(chainOracles);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], pair = _b[0], address = _b[1];
                        return [4 /*yield*/, this.getOraclePrice(address, chainId)];
                    case 2:
                        priceResponse = _c.sent();
                        oracles.push({
                            address: address,
                            price: priceResponse.success ? priceResponse.data.price : 0,
                            timestamp: Date.now(),
                            decimals: 8, // Chainlink typically uses 8 decimals
                            description: pair
                        });
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, oracles];
                    case 5:
                        error_3 = _c.sent();
                        logger_1.logger.error('Get available oracles error', { error: error_3.message, chainId: chainId });
                        return [2 /*return*/, []];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel active predicate
     */
    PredicateService.prototype.cancelPredicate = function (predicateId, userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var predicateData;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Cancelling predicate', { predicateId: predicateId, userAddress: userAddress });
                    predicateData = this.predicateHistory.get(predicateId);
                    if (!predicateData) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Predicate not found'
                            }];
                    }
                    // Check if user is authorized to cancel
                    if (predicateData.userAddress !== userAddress) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Unauthorized to cancel this predicate'
                            }];
                    }
                    // Check if predicate can be cancelled
                    if (predicateData.status !== predicate_1.PredicateStatus.ACTIVE) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Predicate cannot be cancelled'
                            }];
                    }
                    // Update predicate status
                    predicateData.status = predicate_1.PredicateStatus.CANCELLED;
                    this.predicateHistory.set(predicateId, predicateData);
                    logger_1.logger.info('Predicate cancelled successfully', { predicateId: predicateId });
                    return [2 /*return*/, {
                            success: true,
                            data: predicateData
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Cancel predicate error', { error: error.message, predicateId: predicateId });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to cancel predicate'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get predicate status and details
     */
    PredicateService.prototype.getPredicateStatus = function (predicateId) {
        return __awaiter(this, void 0, void 0, function () {
            var predicateData;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Getting predicate status', { predicateId: predicateId });
                    predicateData = this.predicateHistory.get(predicateId);
                    if (!predicateData) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Predicate not found'
                            }];
                    }
                    // Check if predicate is expired
                    if (predicateData.expiresAt && predicateData.expiresAt < Date.now()) {
                        predicateData.status = predicate_1.PredicateStatus.EXPIRED;
                        this.predicateHistory.set(predicateId, predicateData);
                    }
                    return [2 /*return*/, {
                            success: true,
                            data: predicateData
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Get predicate status error', { error: error.message, predicateId: predicateId });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to get predicate status'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get oracle price from Chainlink
     */
    PredicateService.prototype.getOraclePrice = function (oracleAddress, chainId) {
        return __awaiter(this, void 0, void 0, function () {
            var mockPrice;
            return __generator(this, function (_a) {
                try {
                    mockPrice = this.getMockOraclePrice(oracleAddress, chainId);
                    return [2 /*return*/, {
                            success: true,
                            data: {
                                price: mockPrice,
                                timestamp: Date.now(),
                                decimals: 8
                            }
                        }];
                }
                catch (error) {
                    logger_1.logger.error('Get oracle price error', { error: error.message, oracleAddress: oracleAddress });
                    return [2 /*return*/, {
                            success: false,
                            error: 'Failed to get oracle price'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Validate predicate request parameters
     */
    PredicateService.prototype.validatePredicateRequest = function (params) {
        var errors = [];
        // Required fields
        if (!params.chainId) {
            errors.push('chainId is required');
        }
        if (!params.oracleAddress) {
            errors.push('oracleAddress is required');
        }
        if (!params.tolerance) {
            errors.push('tolerance is required');
        }
        if (!params.userAddress) {
            errors.push('userAddress is required');
        }
        // Tolerance validation
        if (params.tolerance) {
            if (params.tolerance < predicate_1.PREDICATE_CONSTANTS.MIN_TOLERANCE) {
                errors.push("Tolerance too low. Minimum: ".concat(predicate_1.PREDICATE_CONSTANTS.MIN_TOLERANCE, "%"));
            }
            if (params.tolerance > predicate_1.PREDICATE_CONSTANTS.MAX_TOLERANCE) {
                errors.push("Tolerance too high. Maximum: ".concat(predicate_1.PREDICATE_CONSTANTS.MAX_TOLERANCE, "%"));
            }
        }
        // Chain ID validation
        if (params.chainId && !predicate_1.CHAINLINK_ORACLES[params.chainId]) {
            errors.push('Unsupported chain ID');
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    /**
     * Format predicate data
     */
    PredicateService.prototype.formatPredicateData = function (params, oracleData) {
        var predicateId = "predicate_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        return {
            predicateId: predicateId,
            chainId: params.chainId,
            oracleAddress: params.oracleAddress,
            tolerance: params.tolerance,
            userAddress: params.userAddress,
            tokenAddress: params.tokenAddress,
            priceThreshold: params.priceThreshold,
            currentPrice: oracleData.price,
            isValid: true,
            status: predicate_1.PredicateStatus.ACTIVE,
            createdAt: Date.now(),
            expiresAt: params.deadline ? params.deadline * 1000 : undefined
        };
    };
    /**
     * Validate predicate logic
     */
    PredicateService.prototype.validatePredicateLogic = function (predicateData, oracleData) {
        var currentPrice = oracleData.price;
        var thresholdPrice = predicateData.priceThreshold || predicateData.currentPrice;
        var deviation = Math.abs((currentPrice - thresholdPrice) / thresholdPrice) * 100;
        var isValid = deviation <= predicateData.tolerance;
        return {
            predicateId: predicateData.predicateId,
            currentPrice: currentPrice,
            thresholdPrice: thresholdPrice,
            tolerance: predicateData.tolerance,
            isValid: isValid,
            deviation: deviation,
            timestamp: Date.now()
        };
    };
    /**
     * Get mock oracle price for testing
     */
    PredicateService.prototype.getMockOraclePrice = function (oracleAddress, chainId) {
        // Mock prices for testing
        var mockPrices = {
            '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419': 2500, // ETH/USD
            '0xF4030086522a5bEEa5E49b0311D971b50Ff9b538': 45000, // BTC/USD
            '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6': 1, // USDC/USD
            '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9': 1, // DAI/USD
        };
        return mockPrices[oracleAddress] || 100;
    };
    /**
     * Initialize mock data for testing
     */
    PredicateService.prototype.initializeMockData = function () {
        var mockPredicate = {
            predicateId: 'predicate_test_001',
            chainId: 1,
            oracleAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
            tolerance: 1,
            userAddress: '0x1234567890123456789012345678901234567890',
            currentPrice: 2500,
            isValid: true,
            status: predicate_1.PredicateStatus.ACTIVE,
            createdAt: Date.now() - 3600000 // 1 hour ago
        };
        this.predicateHistory.set(mockPredicate.predicateId, mockPredicate);
    };
    /**
     * Handle different types of errors
     */
    PredicateService.prototype.handlePredicateError = function (error) {
        if (error.response) {
            var status_1 = error.response.status;
            var data = error.response.data;
            switch (status_1) {
                case 400:
                    return 'Invalid predicate parameters';
                case 404:
                    return 'Oracle not found';
                case 500:
                    return 'Oracle server error';
                default:
                    return (data === null || data === void 0 ? void 0 : data.message) || 'Unknown oracle error';
            }
        }
        if (error.code === 'ECONNABORTED') {
            return 'Oracle request timeout';
        }
        if (error.code === 'ENOTFOUND') {
            return 'Oracle network error';
        }
        return error.message || 'Unknown error';
    };
    return PredicateService;
}());
exports.PredicateService = PredicateService;
// ====== LIMIT_ORDER_PREDICATE_LOGIC (tolga) ======
/**
 * 1inch Limit Order için fiyat guard predicate'i
 * Chainlink oracle tabanlı fiyat sapma kontrolü
 */
function buildPriceGuardPredicate(currentPrice_1, minPrice_1, maxPrice_1) {
    return __awaiter(this, arguments, void 0, function (currentPrice, minPrice, maxPrice, tolerancePercent) {
        var isWithinRange, deviation, expectedPrice, deviation;
        if (tolerancePercent === void 0) { tolerancePercent = 1.0; }
        return __generator(this, function (_a) {
            try {
                isWithinRange = currentPrice >= minPrice && currentPrice <= maxPrice;
                if (!isWithinRange) {
                    deviation = Math.abs(Number(currentPrice - minPrice) / Number(minPrice)) * 100;
                    return [2 /*return*/, {
                            success: true,
                            isValid: false,
                            deviation: deviation
                        }];
                }
                // Tolerans kontrolü (opsiyonel)
                if (tolerancePercent > 0) {
                    expectedPrice = (minPrice + maxPrice) / 2n;
                    deviation = Math.abs(Number(currentPrice - expectedPrice) / Number(expectedPrice)) * 100;
                    if (deviation > tolerancePercent) {
                        return [2 /*return*/, {
                                success: true,
                                isValid: false,
                                deviation: deviation
                            }];
                    }
                }
                return [2 /*return*/, {
                        success: true,
                        isValid: true,
                        deviation: 0
                    }];
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
}
/**
 * 1inch Limit Order için predicate validation
 * Bu fonksiyon, limit order'ın predicate koşullarını kontrol eder
 */
function validateLimitOrderPredicate(predicateId, currentPrice, predicateService) {
    return __awaiter(this, void 0, void 0, function () {
        var predicateResponse, predicateData, thresholdPrice, tolerance, deviation, isValid, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, predicateService.getPredicateStatus(predicateId)];
                case 1:
                    predicateResponse = _a.sent();
                    if (!predicateResponse.success || !predicateResponse.data) {
                        return [2 /*return*/, {
                                success: false,
                                isValid: false,
                                error: 'Predicate not found or invalid'
                            }];
                    }
                    predicateData = predicateResponse.data;
                    thresholdPrice = BigInt(Math.floor(predicateData.currentPrice * 1e8));
                    tolerance = predicateData.tolerance;
                    deviation = Math.abs(Number(currentPrice - thresholdPrice) / Number(thresholdPrice)) * 100;
                    isValid = deviation <= tolerance;
                    return [2 /*return*/, {
                            success: true,
                            isValid: isValid,
                            error: isValid ? undefined : "Price deviation ".concat(deviation.toFixed(2), "% exceeds tolerance ").concat(tolerance, "%")
                        }];
                case 2:
                    error_4 = _a.sent();
                    return [2 /*return*/, {
                            success: false,
                            isValid: false,
                            error: error_4.message
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// ====== END LIMIT_ORDER_PREDICATE_LOGIC ======
exports.default = PredicateService;
