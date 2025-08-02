import { logger } from './logger';
import { ChainConfigUtils } from './chainConfig';
import { 
  QuoteData, 
  RouteStep, 
  QuoteSimulation,
  QuoteRequest 
} from '../types/quote';
import { 
  SwapData, 
  SwapSimulation as SwapSimulationType,
  SwapRequest 
} from '../types/swap';

/**
 * Simulation utilities for CipherSwap
 * Handles slippage calculations, profit/loss analysis, and swap simulations
 */
export class SimulationUtils {
  
  // Constants for simulation
  private static readonly SLIPPAGE_TOLERANCE = 0.5; // 0.5%
  private static readonly HIGH_SLIPPAGE_THRESHOLD = 5; // 5%
  private static readonly EXTREME_SLIPPAGE_THRESHOLD = 10; // 10%
  private static readonly GAS_PRICE_MULTIPLIER = 1.2; // 20% buffer for gas estimation
  private static readonly PRICE_IMPACT_THRESHOLD = 3; // 3% price impact threshold

  /**
   * Calculate slippage percentage between expected and actual amounts
   */
  static calculateSlippage(
    expectedAmount: string,
    actualAmount: string,
    decimals: number = 18
  ): number {
    try {
      const expected = parseFloat(expectedAmount) / Math.pow(10, decimals);
      const actual = parseFloat(actualAmount) / Math.pow(10, decimals);
      
      if (expected === 0) return 0;
      
      // Slippage = ((expected - actual) / expected) * 100
      const slippage = ((expected - actual) / expected) * 100;
      return Math.abs(slippage);
      
    } catch (error: any) {
      logger.error('Error calculating slippage', { error: error.message });
      return 0;
    }
  }

  /**
   * Calculate price impact for a swap
   */
  static calculatePriceImpact(
    inputAmount: string,
    outputAmount: string,
    poolLiquidity: string,
    decimals: number = 18
  ): number {
    try {
      const input = parseFloat(inputAmount) / Math.pow(10, decimals);
      const output = parseFloat(outputAmount) / Math.pow(10, decimals);
      const liquidity = parseFloat(poolLiquidity) / Math.pow(10, decimals);
      
      if (liquidity === 0) return 0;
      
      const priceImpact = (input / liquidity) * 100;
      return Math.min(priceImpact, 100); // Cap at 100%
      
    } catch (error: any) {
      logger.error('Error calculating price impact', { error: error.message });
      return 0;
    }
  }

  /**
   * Calculate estimated gas cost in ETH
   */
  static calculateGasCost(
    gasLimit: string,
    gasPrice: string,
    chainId: number
  ): string {
    try {
      const gasLimitNum = parseFloat(gasLimit);
      const gasPriceNum = parseFloat(gasPrice);
      
      // Check for invalid numbers
      if (isNaN(gasLimitNum) || isNaN(gasPriceNum)) {
        logger.warn('Invalid gas parameters', { gasLimit, gasPrice });
        return '0';
      }
      
      // Apply gas price multiplier for safety
      const adjustedGasPrice = gasPriceNum * this.GAS_PRICE_MULTIPLIER;
      
      const gasCostWei = gasLimitNum * adjustedGasPrice;
      const gasCostEth = gasCostWei / Math.pow(10, 18);
      
      logger.info('Gas cost calculated', {
        gasLimit,
        gasPrice,
        adjustedGasPrice,
        gasCostEth,
        chainId
      });
      
      return gasCostEth.toString();
      
    } catch (error: any) {
      logger.error('Error calculating gas cost', { error: error.message });
      return '0';
    }
  }

  /**
   * Calculate profit/loss for a swap
   */
  static calculateProfitLoss(
    inputAmount: string,
    outputAmount: string,
    expectedOutput: string,
    gasCost: string,
    inputTokenPrice: number,
    outputTokenPrice: number
  ): {
    profitLoss: number;
    profitLossUSD: number;
    roi: number;
    isProfitable: boolean;
  } {
    try {
      const input = parseFloat(inputAmount);
      const output = parseFloat(outputAmount);
      const expected = parseFloat(expectedOutput);
      const gas = parseFloat(gasCost);
      
      // Calculate values in USD
      const inputValueUSD = input * inputTokenPrice;
      const outputValueUSD = output * outputTokenPrice;
      const expectedValueUSD = expected * outputTokenPrice;
      const gasValueUSD = gas * inputTokenPrice; // Assuming gas paid in input token
      
      // Calculate profit/loss
      const actualProfitLoss = outputValueUSD - inputValueUSD - gasValueUSD;
      const expectedProfitLoss = expectedValueUSD - inputValueUSD - gasValueUSD;
      
      // Calculate ROI
      const totalCost = inputValueUSD + gasValueUSD;
      const roi = totalCost > 0 ? (actualProfitLoss / totalCost) * 100 : 0;
      
      const result = {
        profitLoss: actualProfitLoss,
        profitLossUSD: actualProfitLoss,
        roi,
        isProfitable: actualProfitLoss > 0
      };
      
      logger.info('Profit/loss calculated', {
        inputValueUSD,
        outputValueUSD,
        expectedValueUSD,
        gasValueUSD,
        actualProfitLoss,
        roi,
        isProfitable: result.isProfitable
      });
      
      return result;
      
    } catch (error: any) {
      logger.error('Error calculating profit/loss', { error: error.message });
      return {
        profitLoss: 0,
        profitLossUSD: 0,
        roi: 0,
        isProfitable: false
      };
    }
  }

  /**
   * Simulate a swap with different parameters
   */
  static simulateSwap(
    originalQuote: QuoteData,
    simulationParams: {
      slippageTolerance?: number;
      gasPriceMultiplier?: number;
      priceImpactThreshold?: number;
    } = {}
  ): QuoteSimulation {
    try {
      const {
        slippageTolerance = this.SLIPPAGE_TOLERANCE,
        gasPriceMultiplier = this.GAS_PRICE_MULTIPLIER,
        priceImpactThreshold = this.PRICE_IMPACT_THRESHOLD
      } = simulationParams;

      // Calculate simulated slippage
      const simulatedSlippage = Math.min(
        originalQuote.slippage + slippageTolerance,
        this.HIGH_SLIPPAGE_THRESHOLD
      );

      // Calculate simulated gas cost
      const originalGasCost = parseFloat(originalQuote.estimatedGas);
      const simulatedGasCost = originalGasCost * gasPriceMultiplier;

      // Calculate simulated price impact
      const simulatedPriceImpact = Math.min(
        originalQuote.priceImpact + 0.5, // Add 0.5% buffer
        priceImpactThreshold
      );

      // Create simulated quote data
      const simulatedQuote: QuoteData = {
        ...originalQuote,
        slippage: simulatedSlippage,
        estimatedGas: simulatedGasCost.toString(),
        priceImpact: simulatedPriceImpact,
        estimatedGains: (parseFloat(originalQuote.estimatedGains) * (1 - simulatedSlippage / 100)).toString()
      };

      // Calculate differences
      const slippageDifference = simulatedSlippage - originalQuote.slippage;
      const gasDifference = (simulatedGasCost - originalGasCost).toString();
      const priceImpactDifference = simulatedPriceImpact - originalQuote.priceImpact;

      const simulation: QuoteSimulation = {
        originalQuote,
        simulatedQuote,
        slippageDifference,
        gasDifference,
        priceImpactDifference
      };

      logger.info('Swap simulation completed', {
        originalSlippage: originalQuote.slippage,
        simulatedSlippage,
        slippageDifference,
        gasDifference,
        priceImpactDifference
      });

      return simulation;

    } catch (error: any) {
      logger.error('Error simulating swap', { error: error.message });
      throw new Error('Failed to simulate swap');
    }
  }

  /**
   * Validate if a swap is safe to execute
   */
  static validateSwapSafety(
    quote: QuoteData,
    userSlippageTolerance: number = 1
  ): {
    isSafe: boolean;
    warnings: string[];
    risks: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];

    // Check slippage
    if (quote.slippage > this.EXTREME_SLIPPAGE_THRESHOLD) {
      risks.push(`Extreme slippage detected: ${quote.slippage.toFixed(2)}%`);
      recommendations.push('Consider reducing trade size or waiting for better liquidity');
    } else if (quote.slippage > this.HIGH_SLIPPAGE_THRESHOLD) {
      warnings.push(`High slippage detected: ${quote.slippage.toFixed(2)}%`);
      recommendations.push('Consider reducing trade size');
    }

    // Check price impact
    if (quote.priceImpact > this.PRICE_IMPACT_THRESHOLD) {
      risks.push(`High price impact: ${quote.priceImpact.toFixed(2)}%`);
      recommendations.push('Consider splitting the trade into smaller amounts');
    }

    // Check if slippage exceeds user tolerance
    if (quote.slippage > userSlippageTolerance) {
      risks.push(`Slippage (${quote.slippage.toFixed(2)}%) exceeds your tolerance (${userSlippageTolerance}%)`);
      recommendations.push('Review slippage settings or reduce trade size');
    }

    // Check gas cost
    const gasCost = parseFloat(quote.estimatedGas);
    if (gasCost > 0.1) { // More than 0.1 ETH
      warnings.push(`High gas cost: ${gasCost.toFixed(4)} ETH`);
      recommendations.push('Consider using L2 networks for lower gas costs');
    }

    const isSafe = risks.length === 0;

    return {
      isSafe,
      warnings,
      risks,
      recommendations
    };
  }

  /**
   * Calculate optimal trade size to minimize slippage
   */
  static calculateOptimalTradeSize(
    poolLiquidity: string,
    currentPrice: number,
    maxSlippage: number = 1
  ): {
    optimalAmount: string;
    maxSafeAmount: string;
    recommendedSplits: number;
  } {
    try {
      const liquidity = parseFloat(poolLiquidity);
      const maxSlippageDecimal = maxSlippage / 100;
      
      // Calculate optimal amount based on slippage formula
      // Slippage = (trade_size / liquidity) * 100
      // Therefore: trade_size = (slippage / 100) * liquidity
      const optimalAmount = (maxSlippageDecimal * liquidity) / 2; // Use half for safety
      const maxSafeAmount = maxSlippageDecimal * liquidity;
      
      // Calculate recommended number of splits for large trades
      const recommendedSplits = Math.max(1, Math.ceil(maxSafeAmount / optimalAmount));
      
      return {
        optimalAmount: optimalAmount.toString(),
        maxSafeAmount: maxSafeAmount.toString(),
        recommendedSplits
      };
      
    } catch (error: any) {
      logger.error('Error calculating optimal trade size', { error: error.message });
      return {
        optimalAmount: '0',
        maxSafeAmount: '0',
        recommendedSplits: 1
      };
    }
  }

  /**
   * Calculate TWAP (Time-Weighted Average Price) for large trades
   */
  static calculateTWAP(
    totalAmount: string,
    timeWindow: number = 3600, // 1 hour in seconds
    numberOfSplits: number = 10
  ): {
    splitAmount: string;
    timeInterval: number;
    totalTime: number;
    splits: Array<{
      amount: string;
      timestamp: number;
      expectedPrice: number;
    }>;
  } {
    try {
      const total = parseFloat(totalAmount);
      const splitAmount = total / numberOfSplits;
      const timeInterval = timeWindow / numberOfSplits;
      
      const splits = [];
      const now = Math.floor(Date.now() / 1000);
      
      for (let i = 0; i < numberOfSplits; i++) {
        const timestamp = now + (i * timeInterval);
        splits.push({
          amount: splitAmount.toString(),
          timestamp,
          expectedPrice: 0 // Will be filled by price oracle
        });
      }
      
      return {
        splitAmount: splitAmount.toString(),
        timeInterval,
        totalTime: timeWindow,
        splits
      };
      
    } catch (error: any) {
      logger.error('Error calculating TWAP', { error: error.message });
      return {
        splitAmount: '0',
        timeInterval: 0,
        totalTime: 0,
        splits: []
      };
    }
  }

  /**
   * Compare multiple quotes and find the best one
   */
  static compareQuotes(
    quotes: QuoteData[],
    userPreferences: {
      prioritizeLowSlippage?: boolean;
      prioritizeLowGas?: boolean;
      maxSlippage?: number;
      maxGasCost?: number;
    } = {}
  ): {
    bestQuote: QuoteData | null;
    ranking: Array<{
      quote: QuoteData;
      score: number;
      reasons: string[];
    }>;
  } {
    try {
      const {
        prioritizeLowSlippage = true,
        prioritizeLowGas = false,
        maxSlippage = 5,
        maxGasCost = 0.1
      } = userPreferences;

      const ranking = quotes.map(quote => {
        let score = 0;
        const reasons: string[] = [];

        // Score based on slippage (lower is better)
        const slippageScore = Math.max(0, 100 - (quote.slippage * 10));
        score += prioritizeLowSlippage ? slippageScore * 2 : slippageScore;
        reasons.push(`Slippage: ${quote.slippage.toFixed(2)}%`);

        // Score based on gas cost (lower is better)
        const gasCost = parseFloat(quote.estimatedGas);
        const gasScore = Math.max(0, 100 - (gasCost * 1000)); // Convert to reasonable scale
        score += prioritizeLowGas ? gasScore * 2 : gasScore;
        reasons.push(`Gas: ${gasCost.toFixed(4)} ETH`);

        // Score based on price impact (lower is better)
        const impactScore = Math.max(0, 100 - (quote.priceImpact * 10));
        score += impactScore;
        reasons.push(`Price Impact: ${quote.priceImpact.toFixed(2)}%`);

        // Penalize if over limits
        if (quote.slippage > maxSlippage) {
          score -= 50;
          reasons.push('⚠️ Slippage over limit');
        }

        if (gasCost > maxGasCost) {
          score -= 50;
          reasons.push('⚠️ Gas cost over limit');
        }

        return {
          quote,
          score,
          reasons
        };
      });

      // Sort by score (highest first)
      ranking.sort((a, b) => b.score - a.score);

      const bestQuote = ranking.length > 0 ? ranking[0].quote : null;

      logger.info('Quote comparison completed', {
        totalQuotes: quotes.length,
        bestScore: ranking[0]?.score,
        bestSlippage: bestQuote?.slippage
      });

      return {
        bestQuote,
        ranking
      };

    } catch (error: any) {
      logger.error('Error comparing quotes', { error: error.message });
      return {
        bestQuote: null,
        ranking: []
      };
    }
  }

  /**
   * Generate simulation report for frontend
   */
  static generateSimulationReport(
    simulation: QuoteSimulation,
    userPreferences: {
      maxSlippage: number;
      maxGasCost: number;
      priority: 'slippage' | 'gas' | 'balanced';
    }
  ): {
    summary: {
      isRecommended: boolean;
      riskLevel: 'low' | 'medium' | 'high';
      estimatedSavings: number;
    };
    details: {
      slippageAnalysis: {
        original: number;
        simulated: number;
        difference: number;
        isAcceptable: boolean;
      };
      gasAnalysis: {
        original: string;
        simulated: string;
        difference: string;
        isAcceptable: boolean;
      };
      recommendations: string[];
    };
  } {
    try {
      const { maxSlippage, maxGasCost, priority } = userPreferences;
      
      // Analyze slippage
      const slippageAnalysis = {
        original: simulation.originalQuote.slippage,
        simulated: simulation.simulatedQuote.slippage,
        difference: simulation.slippageDifference,
        isAcceptable: simulation.simulatedQuote.slippage <= maxSlippage
      };

      // Analyze gas
      const gasAnalysis = {
        original: simulation.originalQuote.estimatedGas,
        simulated: simulation.simulatedQuote.estimatedGas,
        difference: simulation.gasDifference,
        isAcceptable: parseFloat(simulation.simulatedQuote.estimatedGas) <= maxGasCost
      };

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (slippageAnalysis.simulated > 5 || gasAnalysis.simulated > '0.05') {
        riskLevel = 'high';
      } else if (slippageAnalysis.simulated > 2 || gasAnalysis.simulated > '0.02') {
        riskLevel = 'medium';
      }

      // Calculate estimated savings
      const estimatedSavings = parseFloat(simulation.originalQuote.estimatedGains) - parseFloat(simulation.simulatedQuote.estimatedGains);

      // Generate recommendations
      const recommendations: string[] = [];
      
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

      const isRecommended = slippageAnalysis.isAcceptable && gasAnalysis.isAcceptable;

      return {
        summary: {
          isRecommended,
          riskLevel,
          estimatedSavings
        },
        details: {
          slippageAnalysis,
          gasAnalysis,
          recommendations
        }
      };

    } catch (error: any) {
      logger.error('Error generating simulation report', { error: error.message });
      throw new Error('Failed to generate simulation report');
    }
  }
}

// Export utility functions for easy access
export const {
  calculateSlippage,
  calculatePriceImpact,
  calculateGasCost,
  calculateProfitLoss,
  simulateSwap,
  validateSwapSafety,
  calculateOptimalTradeSize,
  calculateTWAP,
  compareQuotes,
  generateSimulationReport
} = SimulationUtils; 