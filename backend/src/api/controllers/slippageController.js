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
exports.SlippageController = void 0;
var logger_1 = require("../../utils/logger");
var slippageToleranceService_1 = require("../../services/slippageToleranceService");
var SlippageController = /** @class */ (function () {
    function SlippageController() {
        this.slippageService = new slippageToleranceService_1.default();
    }
    /**
     * GET /api/slippage/config
     * Get current slippage tolerance configuration
     */
    SlippageController.prototype.getConfig = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Slippage config request received');
                    config = this.slippageService.getConfig();
                    res.json({
                        success: true,
                        data: config,
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.logger.error('Slippage config controller error', {
                        error: error.message,
                        stack: error.stack
                    });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error',
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * PUT /api/slippage/config
     * Update slippage tolerance configuration
     */
    SlippageController.prototype.updateConfig = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var configUpdate, validation, updatedConfig;
            return __generator(this, function (_a) {
                try {
                    configUpdate = req.body;
                    logger_1.logger.info('Slippage config update request received', { configUpdate: configUpdate });
                    validation = this.validateConfigUpdate(configUpdate);
                    if (!validation.isValid) {
                        res.status(400).json({
                            success: false,
                            error: 'Invalid configuration',
                            details: validation.errors,
                            timestamp: Date.now()
                        });
                        return [2 /*return*/];
                    }
                    // Update the configuration
                    this.slippageService.updateConfig(configUpdate);
                    updatedConfig = this.slippageService.getConfig();
                    res.json({
                        success: true,
                        data: updatedConfig,
                        message: 'Slippage tolerance configuration updated successfully',
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.logger.error('Slippage config update controller error', {
                        error: error.message,
                        stack: error.stack
                    });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error',
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * POST /api/slippage/calculate
     * Calculate optimal slippage tolerance for a specific scenario
     */
    SlippageController.prototype.calculateTolerance = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, baseTolerance, chainId, tradeSize, _b, marketConditions, volatility, liquidity, timeOfDay, factors, result;
            return __generator(this, function (_c) {
                try {
                    _a = req.body, baseTolerance = _a.baseTolerance, chainId = _a.chainId, tradeSize = _a.tradeSize, _b = _a.marketConditions, marketConditions = _b === void 0 ? 'STABLE' : _b, volatility = _a.volatility, liquidity = _a.liquidity, timeOfDay = _a.timeOfDay;
                    logger_1.logger.info('Slippage tolerance calculation request received', {
                        baseTolerance: baseTolerance,
                        chainId: chainId,
                        tradeSize: tradeSize,
                        marketConditions: marketConditions
                    });
                    // Validate required parameters
                    if (!baseTolerance || !chainId || tradeSize === undefined) {
                        res.status(400).json({
                            success: false,
                            error: 'Missing required parameters: baseTolerance, chainId, tradeSize',
                            timestamp: Date.now()
                        });
                        return [2 /*return*/];
                    }
                    factors = {
                        volatility: volatility || (marketConditions === 'EXTREME' ? 0.9 : marketConditions === 'VOLATILE' ? 0.6 : 0.2),
                        liquidity: liquidity || 0.5,
                        timeOfDay: timeOfDay || (new Date().getUTCHours() / 24),
                        tradeSize: tradeSize,
                        chainId: chainId,
                        marketConditions: marketConditions
                    };
                    result = this.slippageService.calculateOptimalTolerance(baseTolerance, factors);
                    res.json({
                        success: true,
                        data: result,
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.logger.error('Slippage tolerance calculation controller error', {
                        error: error.message,
                        stack: error.stack
                    });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error',
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * POST /api/slippage/validate
     * Validate slippage tolerance against configured limits
     */
    SlippageController.prototype.validateTolerance = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tolerance, validation, warningsAndRecommendations;
            return __generator(this, function (_a) {
                try {
                    tolerance = req.body.tolerance;
                    logger_1.logger.info('Slippage tolerance validation request received', { tolerance: tolerance });
                    if (tolerance === undefined) {
                        res.status(400).json({
                            success: false,
                            error: 'Missing required parameter: tolerance',
                            timestamp: Date.now()
                        });
                        return [2 /*return*/];
                    }
                    validation = this.slippageService.validateTolerance(tolerance);
                    warningsAndRecommendations = this.slippageService.getWarningsAndRecommendations(tolerance);
                    res.json({
                        success: true,
                        data: {
                            isValid: validation.isValid,
                            errors: validation.errors,
                            warnings: warningsAndRecommendations.warnings,
                            recommendations: warningsAndRecommendations.recommendations,
                            requiresConfirmation: this.slippageService.requiresConfirmation(tolerance)
                        },
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.logger.error('Slippage tolerance validation controller error', {
                        error: error.message,
                        stack: error.stack
                    });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error',
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * GET /api/slippage/recommended/:chainId
     * Get recommended slippage tolerance for a specific chain
     */
    SlippageController.prototype.getRecommendedTolerance = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var chainId, _a, tradeSize, _b, marketConditions, recommendedTolerance;
            return __generator(this, function (_c) {
                try {
                    chainId = req.params.chainId;
                    _a = req.query, tradeSize = _a.tradeSize, _b = _a.marketConditions, marketConditions = _b === void 0 ? 'STABLE' : _b;
                    logger_1.logger.info('Recommended slippage tolerance request received', {
                        chainId: chainId,
                        tradeSize: tradeSize,
                        marketConditions: marketConditions
                    });
                    if (!chainId) {
                        res.status(400).json({
                            success: false,
                            error: 'Missing required parameter: chainId',
                            timestamp: Date.now()
                        });
                        return [2 /*return*/];
                    }
                    recommendedTolerance = this.slippageService.getRecommendedTolerance(parseInt(chainId), parseFloat(tradeSize) || 0, marketConditions);
                    res.json({
                        success: true,
                        data: {
                            chainId: parseInt(chainId),
                            tradeSize: parseFloat(tradeSize) || 0,
                            marketConditions: marketConditions,
                            recommendedTolerance: recommendedTolerance
                        },
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.logger.error('Recommended slippage tolerance controller error', {
                        error: error.message,
                        stack: error.stack
                    });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error',
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * POST /api/slippage/reset
     * Reset slippage tolerance configuration to environment variable defaults
     */
    SlippageController.prototype.resetConfig = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('Slippage config reset request received');
                    // Create a new service instance to reset to environment defaults
                    this.slippageService = new slippageToleranceService_1.default();
                    config = this.slippageService.getConfig();
                    res.json({
                        success: true,
                        data: config,
                        message: 'Slippage tolerance configuration reset to environment defaults',
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    logger_1.logger.error('Slippage config reset controller error', {
                        error: error.message,
                        stack: error.stack
                    });
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error',
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Validate configuration update parameters
     */
    SlippageController.prototype.validateConfigUpdate = function (config) {
        var errors = [];
        // Validate numeric values
        if (config.defaultTolerance !== undefined && (config.defaultTolerance < 0 || config.defaultTolerance > 100)) {
            errors.push('defaultTolerance must be between 0 and 100');
        }
        if (config.maxTolerance !== undefined && (config.maxTolerance < 0 || config.maxTolerance > 100)) {
            errors.push('maxTolerance must be between 0 and 100');
        }
        if (config.minTolerance !== undefined && (config.minTolerance < 0 || config.minTolerance > 100)) {
            errors.push('minTolerance must be between 0 and 100');
        }
        if (config.warningThreshold !== undefined && (config.warningThreshold < 0 || config.warningThreshold > 100)) {
            errors.push('warningThreshold must be between 0 and 100');
        }
        if (config.criticalThreshold !== undefined && (config.criticalThreshold < 0 || config.criticalThreshold > 100)) {
            errors.push('criticalThreshold must be between 0 and 100');
        }
        // Validate logical relationships
        if (config.minTolerance !== undefined && config.maxTolerance !== undefined && config.minTolerance > config.maxTolerance) {
            errors.push('minTolerance cannot be greater than maxTolerance');
        }
        if (config.defaultTolerance !== undefined && config.minTolerance !== undefined && config.defaultTolerance < config.minTolerance) {
            errors.push('defaultTolerance cannot be less than minTolerance');
        }
        if (config.defaultTolerance !== undefined && config.maxTolerance !== undefined && config.defaultTolerance > config.maxTolerance) {
            errors.push('defaultTolerance cannot be greater than maxTolerance');
        }
        if (config.warningThreshold !== undefined && config.criticalThreshold !== undefined && config.warningThreshold > config.criticalThreshold) {
            errors.push('warningThreshold cannot be greater than criticalThreshold');
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    return SlippageController;
}());
exports.SlippageController = SlippageController;
