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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageToleranceService = void 0;
var env_1 = require("../config/env");
var logger_1 = require("../utils/logger");
var SlippageToleranceService = /** @class */ (function () {
    function SlippageToleranceService() {
        this.config = {
            defaultTolerance: env_1.config.SLIPPAGE_DEFAULT_TOLERANCE,
            maxTolerance: env_1.config.SLIPPAGE_MAX_TOLERANCE,
            minTolerance: env_1.config.SLIPPAGE_MIN_TOLERANCE,
            warningThreshold: env_1.config.SLIPPAGE_WARNING_THRESHOLD,
            criticalThreshold: env_1.config.SLIPPAGE_CRITICAL_THRESHOLD,
            autoAdjustment: env_1.config.SLIPPAGE_AUTO_ADJUSTMENT,
            marketBasedAdjustment: env_1.config.SLIPPAGE_MARKET_BASED_ADJUSTMENT,
            timeBasedAdjustment: env_1.config.SLIPPAGE_TIME_BASED_ADJUSTMENT,
            tradeSizeAdjustment: env_1.config.SLIPPAGE_TRADE_SIZE_ADJUSTMENT,
            chainSpecific: env_1.config.SLIPPAGE_CHAIN_SPECIFIC,
        };
    }
    /**
     * Calculate optimal slippage tolerance based on various factors
     */
    SlippageToleranceService.prototype.calculateOptimalTolerance = function (baseTolerance, factors) {
        var adjustedTolerance = baseTolerance;
        var warnings = [];
        var adjustments = [];
        // Apply market-based adjustments
        if (this.config.marketBasedAdjustment) {
            var volatilityAdjustment = this.calculateVolatilityAdjustment(factors.volatility);
            var liquidityAdjustment = this.calculateLiquidityAdjustment(factors.liquidity);
            adjustedTolerance *= volatilityAdjustment;
            adjustedTolerance *= liquidityAdjustment;
            adjustments.push(volatilityAdjustment, liquidityAdjustment);
            if (factors.marketConditions === 'VOLATILE') {
                warnings.push('Market volatility detected - increased slippage tolerance');
            }
            else if (factors.marketConditions === 'EXTREME') {
                warnings.push('Extreme market volatility - significantly increased slippage tolerance');
            }
        }
        // Apply time-based adjustments
        if (this.config.timeBasedAdjustment) {
            var timeAdjustment = this.calculateTimeBasedAdjustment(factors.timeOfDay);
            adjustedTolerance *= timeAdjustment;
            adjustments.push(timeAdjustment);
            if (timeAdjustment > 1.2) {
                warnings.push('Peak hours detected - increased slippage tolerance');
            }
            else if (timeAdjustment < 0.9) {
                warnings.push('Off-peak hours - reduced slippage tolerance');
            }
        }
        // Apply trade size adjustments
        if (this.config.tradeSizeAdjustment) {
            var sizeAdjustment = this.calculateTradeSizeAdjustment(factors.tradeSize);
            adjustedTolerance *= sizeAdjustment;
            adjustments.push(sizeAdjustment);
            if (sizeAdjustment > 1.3) {
                warnings.push('Large trade detected - increased slippage tolerance');
            }
        }
        // Apply chain-specific adjustments
        if (this.config.chainSpecific) {
            var chainAdjustment = this.calculateChainSpecificAdjustment(factors.chainId);
            adjustedTolerance *= chainAdjustment;
            adjustments.push(chainAdjustment);
        }
        // Ensure tolerance is within configured limits
        adjustedTolerance = Math.max(this.config.minTolerance, adjustedTolerance);
        adjustedTolerance = Math.min(this.config.maxTolerance, adjustedTolerance);
        // Determine risk level
        var riskLevel = this.determineRiskLevel(adjustedTolerance);
        // Check if tolerance exceeds warning thresholds
        if (adjustedTolerance > this.config.criticalThreshold) {
            warnings.push("Critical slippage tolerance: ".concat(adjustedTolerance.toFixed(2), "%"));
        }
        else if (adjustedTolerance > this.config.warningThreshold) {
            warnings.push("High slippage tolerance: ".concat(adjustedTolerance.toFixed(2), "%"));
        }
        return {
            recommendedTolerance: baseTolerance,
            adjustedTolerance: adjustedTolerance,
            factors: factors,
            warnings: warnings,
            isWithinLimits: adjustedTolerance <= this.config.maxTolerance,
            riskLevel: riskLevel,
        };
    };
    /**
     * Calculate volatility-based adjustment
     */
    SlippageToleranceService.prototype.calculateVolatilityAdjustment = function (volatility) {
        if (volatility > 0.8) {
            return env_1.config.SLIPPAGE_VOLATILITY_MULTIPLIER;
        }
        else if (volatility > 0.5) {
            return 1.2;
        }
        else if (volatility > 0.2) {
            return 1.1;
        }
        return 1.0;
    };
    /**
     * Calculate liquidity-based adjustment
     */
    SlippageToleranceService.prototype.calculateLiquidityAdjustment = function (liquidity) {
        if (liquidity < 0.3) {
            return env_1.config.SLIPPAGE_LIQUIDITY_MULTIPLIER;
        }
        else if (liquidity < 0.6) {
            return 1.1;
        }
        return 1.0;
    };
    /**
     * Calculate time-based adjustment
     */
    SlippageToleranceService.prototype.calculateTimeBasedAdjustment = function (timeOfDay) {
        // Peak hours: 9-11 AM and 2-4 PM UTC
        var hour = new Date().getUTCHours();
        var isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
        if (isPeakHour) {
            return env_1.config.SLIPPAGE_PEAK_HOURS_MULTIPLIER;
        }
        else {
            return env_1.config.SLIPPAGE_OFF_PEAK_MULTIPLIER;
        }
    };
    /**
     * Calculate trade size adjustment
     */
    SlippageToleranceService.prototype.calculateTradeSizeAdjustment = function (tradeSize) {
        if (tradeSize > env_1.config.SLIPPAGE_LARGE_TRADE_THRESHOLD) {
            return env_1.config.SLIPPAGE_LARGE_TRADE_MULTIPLIER;
        }
        else if (tradeSize > env_1.config.SLIPPAGE_LARGE_TRADE_THRESHOLD * 0.5) {
            return 1.2;
        }
        return 1.0;
    };
    /**
     * Calculate chain-specific adjustment
     */
    SlippageToleranceService.prototype.calculateChainSpecificAdjustment = function (chainId) {
        switch (chainId) {
            case 1: // Ethereum
                return env_1.config.SLIPPAGE_ETHEREUM_MULTIPLIER;
            case 42161: // Arbitrum
                return env_1.config.SLIPPAGE_ARBITRUM_MULTIPLIER;
            case 8453: // Base
                return env_1.config.SLIPPAGE_BASE_MULTIPLIER;
            case 324: // zkSync
                return env_1.config.SLIPPAGE_ZKSYNC_MULTIPLIER;
            default:
                return 1.0;
        }
    };
    /**
     * Determine risk level based on slippage tolerance
     */
    SlippageToleranceService.prototype.determineRiskLevel = function (tolerance) {
        if (tolerance <= this.config.warningThreshold) {
            return 'LOW';
        }
        else if (tolerance <= this.config.criticalThreshold) {
            return 'MEDIUM';
        }
        else if (tolerance <= this.config.maxTolerance) {
            return 'HIGH';
        }
        else {
            return 'CRITICAL';
        }
    };
    /**
     * Validate slippage tolerance against configured limits
     */
    SlippageToleranceService.prototype.validateTolerance = function (tolerance) {
        var errors = [];
        if (tolerance < this.config.minTolerance) {
            errors.push("Slippage tolerance too low. Minimum: ".concat(this.config.minTolerance, "%"));
        }
        if (tolerance > this.config.maxTolerance) {
            errors.push("Slippage tolerance too high. Maximum: ".concat(this.config.maxTolerance, "%"));
        }
        return {
            isValid: errors.length === 0,
            errors: errors,
        };
    };
    /**
     * Get slippage tolerance configuration
     */
    SlippageToleranceService.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * Update slippage tolerance configuration
     */
    SlippageToleranceService.prototype.updateConfig = function (newConfig) {
        // Validate the new configuration before applying
        var validation = this.validateConfigUpdate(newConfig);
        if (!validation.isValid) {
            logger_1.logger.warn('Invalid slippage tolerance configuration update rejected', {
                newConfig: newConfig,
                errors: validation.errors
            });
            return;
        }
        Object.assign(this.config, newConfig);
        logger_1.logger.info('Slippage tolerance configuration updated', { config: this.config });
    };
    /**
     * Validate configuration update parameters
     */
    SlippageToleranceService.prototype.validateConfigUpdate = function (config) {
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
    /**
     * Get recommended slippage tolerance for a specific scenario
     */
    SlippageToleranceService.prototype.getRecommendedTolerance = function (chainId, tradeSize, marketConditions) {
        if (marketConditions === void 0) { marketConditions = 'STABLE'; }
        var factors = {
            volatility: marketConditions === 'EXTREME' ? 0.9 : marketConditions === 'VOLATILE' ? 0.6 : 0.2,
            liquidity: 0.5, // Default medium liquidity
            timeOfDay: new Date().getUTCHours() / 24,
            tradeSize: tradeSize,
            chainId: chainId,
            marketConditions: marketConditions,
        };
        var result = this.calculateOptimalTolerance(this.config.defaultTolerance, factors);
        return result.adjustedTolerance;
    };
    /**
     * Check if slippage tolerance requires user confirmation
     */
    SlippageToleranceService.prototype.requiresConfirmation = function (tolerance) {
        return tolerance > this.config.warningThreshold;
    };
    /**
     * Get slippage tolerance warnings and recommendations
     */
    SlippageToleranceService.prototype.getWarningsAndRecommendations = function (tolerance) {
        var warnings = [];
        var recommendations = [];
        if (tolerance > this.config.criticalThreshold) {
            warnings.push("Critical slippage tolerance: ".concat(tolerance.toFixed(2), "%"));
            recommendations.push('Consider reducing trade size or waiting for better market conditions');
            recommendations.push('Review token liquidity and market volatility');
        }
        else if (tolerance > this.config.warningThreshold) {
            warnings.push("High slippage tolerance: ".concat(tolerance.toFixed(2), "%"));
            recommendations.push('Monitor market conditions before proceeding');
        }
        if (tolerance < this.config.minTolerance) {
            warnings.push("Very low slippage tolerance: ".concat(tolerance.toFixed(2), "%"));
            recommendations.push('Consider increasing tolerance to avoid failed transactions');
        }
        return { warnings: warnings, recommendations: recommendations };
    };
    return SlippageToleranceService;
}());
exports.SlippageToleranceService = SlippageToleranceService;
exports.default = SlippageToleranceService;
