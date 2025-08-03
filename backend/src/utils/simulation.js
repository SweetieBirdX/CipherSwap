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
exports.generateSimulationReport = exports.compareQuotes = exports.calculateTWAP = exports.calculateOptimalTradeSize = exports.validateSwapSafety = exports.simulateSwap = exports.calculateProfitLoss = exports.calculateGasCost = exports.calculatePriceImpact = exports.calculateSlippage = exports.SimulationUtils = void 0;
var logger_1 = require("./logger");
/**
 * Simulation utilities for CipherSwap
 * Handles slippage calculations, profit/loss analysis, and swap simulations
 */
var SimulationUtils = /** @class */ (function () {
    function SimulationUtils() {
    }
    /**
     * Calculate slippage percentage between expected and actual amounts
     */
    SimulationUtils.calculateSlippage = function (expectedAmount, actualAmount, decimals) {
        if (decimals === void 0) { decimals = 18; }
        try {
            var expected = parseFloat(expectedAmount) / Math.pow(10, decimals);
            var actual = parseFloat(actualAmount) / Math.pow(10, decimals);
            if (expected === 0)
                return 0;
            // Slippage = ((expected - actual) / expected) * 100
            var slippage = ((expected - actual) / expected) * 100;
            return Math.abs(slippage);
        }
        catch (error) {
            logger_1.logger.error('Error calculating slippage', { error: error.message });
            return 0;
        }
    };
    /**
     * Calculate price impact for a swap
     */
    SimulationUtils.calculatePriceImpact = function (inputAmount, outputAmount, poolLiquidity, decimals) {
        if (decimals === void 0) { decimals = 18; }
        try {
            var input = parseFloat(inputAmount) / Math.pow(10, decimals);
            var output = parseFloat(outputAmount) / Math.pow(10, decimals);
            var liquidity = parseFloat(poolLiquidity) / Math.pow(10, decimals);
            if (liquidity === 0)
                return 0;
            var priceImpact = (input / liquidity) * 100;
            return Math.min(priceImpact, 100); // Cap at 100%
        }
        catch (error) {
            logger_1.logger.error('Error calculating price impact', { error: error.message });
            return 0;
        }
    };
    /**
     * Calculate estimated gas cost in ETH
     */
    SimulationUtils.calculateGasCost = function (gasLimit, gasPrice, chainId) {
        try {
            var gasLimitNum = parseFloat(gasLimit);
            var gasPriceNum = parseFloat(gasPrice);
            // Check for invalid numbers
            if (isNaN(gasLimitNum) || isNaN(gasPriceNum)) {
                logger_1.logger.warn('Invalid gas parameters', { gasLimit: gasLimit, gasPrice: gasPrice });
                return '0';
            }
            // Apply gas price multiplier for safety
            var adjustedGasPrice = gasPriceNum * this.GAS_PRICE_MULTIPLIER;
            var gasCostWei = gasLimitNum * adjustedGasPrice;
            var gasCostEth = gasCostWei / Math.pow(10, 18);
            logger_1.logger.info('Gas cost calculated', {
                gasLimit: gasLimit,
                gasPrice: gasPrice,
                adjustedGasPrice: adjustedGasPrice,
                gasCostEth: gasCostEth,
                chainId: chainId
            });
            return gasCostEth.toString();
        }
        catch (error) {
            logger_1.logger.error('Error calculating gas cost', { error: error.message });
            return '0';
        }
    };
    /**
     * Calculate profit/loss for a swap
     */
    SimulationUtils.calculateProfitLoss = function (inputAmount, outputAmount, expectedOutput, gasCost, inputTokenPrice, outputTokenPrice) {
        try {
            var input = parseFloat(inputAmount);
            var output = parseFloat(outputAmount);
            var expected = parseFloat(expectedOutput);
            var gas = parseFloat(gasCost);
            // Calculate values in USD
            var inputValueUSD = input * inputTokenPrice;
            var outputValueUSD = output * outputTokenPrice;
            var expectedValueUSD = expected * outputTokenPrice;
            var gasValueUSD = gas * inputTokenPrice; // Assuming gas paid in input token
            // Calculate profit/loss
            var actualProfitLoss = outputValueUSD - inputValueUSD - gasValueUSD;
            var expectedProfitLoss = expectedValueUSD - inputValueUSD - gasValueUSD;
            // Calculate ROI
            var totalCost = inputValueUSD + gasValueUSD;
            var roi = totalCost > 0 ? (actualProfitLoss / totalCost) * 100 : 0;
            var result = {
                profitLoss: actualProfitLoss,
                profitLossUSD: actualProfitLoss,
                roi: roi,
                isProfitable: actualProfitLoss > 0
            };
            logger_1.logger.info('Profit/loss calculated', {
                inputValueUSD: inputValueUSD,
                outputValueUSD: outputValueUSD,
                expectedValueUSD: expectedValueUSD,
                gasValueUSD: gasValueUSD,
                actualProfitLoss: actualProfitLoss,
                roi: roi,
                isProfitable: result.isProfitable
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error calculating profit/loss', { error: error.message });
            return {
                profitLoss: 0,
                profitLossUSD: 0,
                roi: 0,
                isProfitable: false
            };
        }
    };
    /**
     * Simulate a swap with different parameters
     */
    SimulationUtils.simulateSwap = function (originalQuote, simulationParams) {
        if (simulationParams === void 0) { simulationParams = {}; }
        try {
            var _a = simulationParams.slippageTolerance, slippageTolerance = _a === void 0 ? this.SLIPPAGE_TOLERANCE : _a, _b = simulationParams.gasPriceMultiplier, gasPriceMultiplier = _b === void 0 ? this.GAS_PRICE_MULTIPLIER : _b, _c = simulationParams.priceImpactThreshold, priceImpactThreshold = _c === void 0 ? this.PRICE_IMPACT_THRESHOLD : _c;
            // Calculate simulated slippage
            var simulatedSlippage = Math.min(originalQuote.slippage + slippageTolerance, this.HIGH_SLIPPAGE_THRESHOLD);
            // Calculate simulated gas cost
            var originalGasCost = parseFloat(originalQuote.estimatedGas);
            var simulatedGasCost = originalGasCost * gasPriceMultiplier;
            // Calculate simulated price impact
            var simulatedPriceImpact = Math.min(originalQuote.priceImpact + 0.5, // Add 0.5% buffer
            priceImpactThreshold);
            // Create simulated quote data
            var simulatedQuote = __assign(__assign({}, originalQuote), { slippage: simulatedSlippage, estimatedGas: simulatedGasCost.toString(), priceImpact: simulatedPriceImpact, estimatedGains: (parseFloat(originalQuote.estimatedGains) * (1 - simulatedSlippage / 100)).toString() });
            // Calculate differences
            var slippageDifference = simulatedSlippage - originalQuote.slippage;
            var gasDifference = (simulatedGasCost - originalGasCost).toString();
            var priceImpactDifference = simulatedPriceImpact - originalQuote.priceImpact;
            var simulation = {
                originalQuote: originalQuote,
                simulatedQuote: simulatedQuote,
                slippageDifference: slippageDifference,
                gasDifference: gasDifference,
                priceImpactDifference: priceImpactDifference
            };
            logger_1.logger.info('Swap simulation completed', {
                originalSlippage: originalQuote.slippage,
                simulatedSlippage: simulatedSlippage,
                slippageDifference: slippageDifference,
                gasDifference: gasDifference,
                priceImpactDifference: priceImpactDifference
            });
            return simulation;
        }
        catch (error) {
            logger_1.logger.error('Error simulating swap', { error: error.message });
            throw new Error('Failed to simulate swap');
        }
    };
    /**
     * Validate if a swap is safe to execute
     */
    SimulationUtils.validateSwapSafety = function (quote, userSlippageTolerance) {
        if (userSlippageTolerance === void 0) { userSlippageTolerance = 1; }
        var warnings = [];
        var risks = [];
        var recommendations = [];
        // Check slippage
        if (quote.slippage > this.EXTREME_SLIPPAGE_THRESHOLD) {
            risks.push("Extreme slippage detected: ".concat(quote.slippage.toFixed(2), "%"));
            recommendations.push('Consider reducing trade size or waiting for better liquidity');
        }
        else if (quote.slippage > this.HIGH_SLIPPAGE_THRESHOLD) {
            warnings.push("High slippage detected: ".concat(quote.slippage.toFixed(2), "%"));
            recommendations.push('Consider reducing trade size');
        }
        // Check price impact
        if (quote.priceImpact > this.PRICE_IMPACT_THRESHOLD) {
            risks.push("High price impact: ".concat(quote.priceImpact.toFixed(2), "%"));
            recommendations.push('Consider splitting the trade into smaller amounts');
        }
        // Check if slippage exceeds user tolerance
        if (quote.slippage > userSlippageTolerance) {
            risks.push("Slippage (".concat(quote.slippage.toFixed(2), "%) exceeds your tolerance (").concat(userSlippageTolerance, "%)"));
            recommendations.push('Review slippage settings or reduce trade size');
        }
        // Check gas cost
        var gasCost = parseFloat(quote.estimatedGas);
        if (gasCost > 0.1) { // More than 0.1 ETH
            warnings.push("High gas cost: ".concat(gasCost.toFixed(4), " ETH"));
            recommendations.push('Consider using L2 networks for lower gas costs');
        }
        var isSafe = risks.length === 0;
        return {
            isSafe: isSafe,
            warnings: warnings,
            risks: risks,
            recommendations: recommendations
        };
    };
    /**
     * Calculate optimal trade size to minimize slippage
     */
    SimulationUtils.calculateOptimalTradeSize = function (poolLiquidity, currentPrice, maxSlippage) {
        if (maxSlippage === void 0) { maxSlippage = 1; }
        try {
            var liquidity = parseFloat(poolLiquidity);
            var maxSlippageDecimal = maxSlippage / 100;
            // Calculate optimal amount based on slippage formula
            // Slippage = (trade_size / liquidity) * 100
            // Therefore: trade_size = (slippage / 100) * liquidity
            var optimalAmount = (maxSlippageDecimal * liquidity) / 2; // Use half for safety
            var maxSafeAmount = maxSlippageDecimal * liquidity;
            // Calculate recommended number of splits for large trades
            var recommendedSplits = Math.max(1, Math.ceil(maxSafeAmount / optimalAmount));
            return {
                optimalAmount: optimalAmount.toString(),
                maxSafeAmount: maxSafeAmount.toString(),
                recommendedSplits: recommendedSplits
            };
        }
        catch (error) {
            logger_1.logger.error('Error calculating optimal trade size', { error: error.message });
            return {
                optimalAmount: '0',
                maxSafeAmount: '0',
                recommendedSplits: 1
            };
        }
    };
    /**
     * Calculate TWAP (Time-Weighted Average Price) for large trades
     */
    SimulationUtils.calculateTWAP = function (totalAmount, timeWindow, // 1 hour in seconds
    numberOfSplits) {
        if (timeWindow === void 0) { timeWindow = 3600; }
        if (numberOfSplits === void 0) { numberOfSplits = 10; }
        try {
            var total = parseFloat(totalAmount);
            var splitAmount = total / numberOfSplits;
            var timeInterval = timeWindow / numberOfSplits;
            var splits = [];
            var now = Math.floor(Date.now() / 1000);
            for (var i = 0; i < numberOfSplits; i++) {
                var timestamp = now + (i * timeInterval);
                splits.push({
                    amount: splitAmount.toString(),
                    timestamp: timestamp,
                    expectedPrice: 0 // Will be filled by price oracle
                });
            }
            return {
                splitAmount: splitAmount.toString(),
                timeInterval: timeInterval,
                totalTime: timeWindow,
                splits: splits
            };
        }
        catch (error) {
            logger_1.logger.error('Error calculating TWAP', { error: error.message });
            return {
                splitAmount: '0',
                timeInterval: 0,
                totalTime: 0,
                splits: []
            };
        }
    };
    /**
     * Compare multiple quotes and find the best one
     */
    SimulationUtils.compareQuotes = function (quotes, userPreferences) {
        var _a;
        if (userPreferences === void 0) { userPreferences = {}; }
        try {
            var _b = userPreferences.prioritizeLowSlippage, prioritizeLowSlippage_1 = _b === void 0 ? true : _b, _c = userPreferences.prioritizeLowGas, prioritizeLowGas_1 = _c === void 0 ? false : _c, _d = userPreferences.maxSlippage, maxSlippage_1 = _d === void 0 ? 5 : _d, _e = userPreferences.maxGasCost, maxGasCost_1 = _e === void 0 ? 0.1 : _e;
            var ranking = quotes.map(function (quote) {
                var score = 0;
                var reasons = [];
                // Score based on slippage (lower is better)
                var slippageScore = Math.max(0, 100 - (quote.slippage * 10));
                score += prioritizeLowSlippage_1 ? slippageScore * 2 : slippageScore;
                reasons.push("Slippage: ".concat(quote.slippage.toFixed(2), "%"));
                // Score based on gas cost (lower is better)
                var gasCost = parseFloat(quote.estimatedGas);
                var gasScore = Math.max(0, 100 - (gasCost * 1000)); // Convert to reasonable scale
                score += prioritizeLowGas_1 ? gasScore * 2 : gasScore;
                reasons.push("Gas: ".concat(gasCost.toFixed(4), " ETH"));
                // Score based on price impact (lower is better)
                var impactScore = Math.max(0, 100 - (quote.priceImpact * 10));
                score += impactScore;
                reasons.push("Price Impact: ".concat(quote.priceImpact.toFixed(2), "%"));
                // Penalize if over limits
                if (quote.slippage > maxSlippage_1) {
                    score -= 50;
                    reasons.push('⚠️ Slippage over limit');
                }
                if (gasCost > maxGasCost_1) {
                    score -= 50;
                    reasons.push('⚠️ Gas cost over limit');
                }
                return {
                    quote: quote,
                    score: score,
                    reasons: reasons
                };
            });
            // Sort by score (highest first)
            ranking.sort(function (a, b) { return b.score - a.score; });
            var bestQuote = ranking.length > 0 ? ranking[0].quote : null;
            logger_1.logger.info('Quote comparison completed', {
                totalQuotes: quotes.length,
                bestScore: (_a = ranking[0]) === null || _a === void 0 ? void 0 : _a.score,
                bestSlippage: bestQuote === null || bestQuote === void 0 ? void 0 : bestQuote.slippage
            });
            return {
                bestQuote: bestQuote,
                ranking: ranking
            };
        }
        catch (error) {
            logger_1.logger.error('Error comparing quotes', { error: error.message });
            return {
                bestQuote: null,
                ranking: []
            };
        }
    };
    /**
     * Generate simulation report for frontend
     */
    SimulationUtils.generateSimulationReport = function (simulation, userPreferences) {
        try {
            var maxSlippage = userPreferences.maxSlippage, maxGasCost = userPreferences.maxGasCost, priority = userPreferences.priority;
            // Analyze slippage
            var slippageAnalysis = {
                original: simulation.originalQuote.slippage,
                simulated: simulation.simulatedQuote.slippage,
                difference: simulation.slippageDifference,
                isAcceptable: simulation.simulatedQuote.slippage <= maxSlippage
            };
            // Analyze gas
            var gasAnalysis = {
                original: simulation.originalQuote.estimatedGas,
                simulated: simulation.simulatedQuote.estimatedGas,
                difference: simulation.gasDifference,
                isAcceptable: parseFloat(simulation.simulatedQuote.estimatedGas) <= maxGasCost
            };
            // Determine risk level
            var riskLevel = 'low';
            if (slippageAnalysis.simulated > 5 || gasAnalysis.simulated > '0.05') {
                riskLevel = 'high';
            }
            else if (slippageAnalysis.simulated > 2 || gasAnalysis.simulated > '0.02') {
                riskLevel = 'medium';
            }
            // Calculate estimated savings
            var estimatedSavings = parseFloat(simulation.originalQuote.estimatedGains) - parseFloat(simulation.simulatedQuote.estimatedGains);
            // Generate recommendations
            var recommendations = [];
            if (!slippageAnalysis.isAcceptable) {
                recommendations.push('Consider reducing trade size to lower slippage');
            }
            if (!gasAnalysis.isAcceptable) {
                recommendations.push('Consider using L2 networks for lower gas costs');
            }
            if (priority === 'slippage' && slippageAnalysis.simulated > 2) {
                recommendations.push('High slippage detected - consider waiting for better liquidity');
            }
            if (priority === 'gas' && parseFloat(gasAnalysis.simulated) > 0.02) {
                recommendations.push('High gas costs - consider batching transactions');
            }
            var isRecommended = slippageAnalysis.isAcceptable && gasAnalysis.isAcceptable;
            return {
                summary: {
                    isRecommended: isRecommended,
                    riskLevel: riskLevel,
                    estimatedSavings: estimatedSavings
                },
                details: {
                    slippageAnalysis: slippageAnalysis,
                    gasAnalysis: gasAnalysis,
                    recommendations: recommendations
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating simulation report', { error: error.message });
            throw new Error('Failed to generate simulation report');
        }
    };
    // Constants for simulation
    SimulationUtils.SLIPPAGE_TOLERANCE = 0.5; // 0.5%
    SimulationUtils.HIGH_SLIPPAGE_THRESHOLD = 5; // 5%
    SimulationUtils.EXTREME_SLIPPAGE_THRESHOLD = 10; // 10%
    SimulationUtils.GAS_PRICE_MULTIPLIER = 1.2; // 20% buffer for gas estimation
    SimulationUtils.PRICE_IMPACT_THRESHOLD = 3; // 3% price impact threshold
    return SimulationUtils;
}());
exports.SimulationUtils = SimulationUtils;
// Export utility functions for easy access
exports.calculateSlippage = SimulationUtils.calculateSlippage, exports.calculatePriceImpact = SimulationUtils.calculatePriceImpact, exports.calculateGasCost = SimulationUtils.calculateGasCost, exports.calculateProfitLoss = SimulationUtils.calculateProfitLoss, exports.simulateSwap = SimulationUtils.simulateSwap, exports.validateSwapSafety = SimulationUtils.validateSwapSafety, exports.calculateOptimalTradeSize = SimulationUtils.calculateOptimalTradeSize, exports.calculateTWAP = SimulationUtils.calculateTWAP, exports.compareQuotes = SimulationUtils.compareQuotes, exports.generateSimulationReport = SimulationUtils.generateSimulationReport;
