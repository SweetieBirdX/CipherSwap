import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface SlippageToleranceConfig {
  defaultTolerance: number;
  maxTolerance: number;
  minTolerance: number;
  warningThreshold: number;
  criticalThreshold: number;
  autoAdjustment: boolean;
  marketBasedAdjustment: boolean;
  timeBasedAdjustment: boolean;
  tradeSizeAdjustment: boolean;
  chainSpecific: boolean;
}

export interface SlippageAdjustmentFactors {
  volatility: number;
  liquidity: number;
  timeOfDay: number;
  tradeSize: number;
  chainId: number;
  marketConditions: 'STABLE' | 'VOLATILE' | 'EXTREME';
}

export interface SlippageToleranceResult {
  recommendedTolerance: number;
  adjustedTolerance: number;
  factors: SlippageAdjustmentFactors;
  warnings: string[];
  isWithinLimits: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class SlippageToleranceService {
  private readonly config: SlippageToleranceConfig;

  constructor() {
    this.config = {
      defaultTolerance: config.SLIPPAGE_DEFAULT_TOLERANCE,
      maxTolerance: config.SLIPPAGE_MAX_TOLERANCE,
      minTolerance: config.SLIPPAGE_MIN_TOLERANCE,
      warningThreshold: config.SLIPPAGE_WARNING_THRESHOLD,
      criticalThreshold: config.SLIPPAGE_CRITICAL_THRESHOLD,
      autoAdjustment: config.SLIPPAGE_AUTO_ADJUSTMENT,
      marketBasedAdjustment: config.SLIPPAGE_MARKET_BASED_ADJUSTMENT,
      timeBasedAdjustment: config.SLIPPAGE_TIME_BASED_ADJUSTMENT,
      tradeSizeAdjustment: config.SLIPPAGE_TRADE_SIZE_ADJUSTMENT,
      chainSpecific: config.SLIPPAGE_CHAIN_SPECIFIC,
    };
  }

  /**
   * Calculate optimal slippage tolerance based on various factors
   */
  calculateOptimalTolerance(
    baseTolerance: number,
    factors: SlippageAdjustmentFactors
  ): SlippageToleranceResult {
    let adjustedTolerance = baseTolerance;
    const warnings: string[] = [];
    const adjustments: number[] = [];

    // Apply market-based adjustments
    if (this.config.marketBasedAdjustment) {
      const volatilityAdjustment = this.calculateVolatilityAdjustment(factors.volatility);
      const liquidityAdjustment = this.calculateLiquidityAdjustment(factors.liquidity);
      
      adjustedTolerance *= volatilityAdjustment;
      adjustedTolerance *= liquidityAdjustment;
      
      adjustments.push(volatilityAdjustment, liquidityAdjustment);
      
      if (factors.marketConditions === 'VOLATILE') {
        warnings.push('Market volatility detected - increased slippage tolerance');
      } else if (factors.marketConditions === 'EXTREME') {
        warnings.push('Extreme market volatility - significantly increased slippage tolerance');
      }
    }

    // Apply time-based adjustments
    if (this.config.timeBasedAdjustment) {
      const timeAdjustment = this.calculateTimeBasedAdjustment(factors.timeOfDay);
      adjustedTolerance *= timeAdjustment;
      adjustments.push(timeAdjustment);
      
      if (timeAdjustment > 1.2) {
        warnings.push('Peak hours detected - increased slippage tolerance');
      } else if (timeAdjustment < 0.9) {
        warnings.push('Off-peak hours - reduced slippage tolerance');
      }
    }

    // Apply trade size adjustments
    if (this.config.tradeSizeAdjustment) {
      const sizeAdjustment = this.calculateTradeSizeAdjustment(factors.tradeSize);
      adjustedTolerance *= sizeAdjustment;
      adjustments.push(sizeAdjustment);
      
      if (sizeAdjustment > 1.3) {
        warnings.push('Large trade detected - increased slippage tolerance');
      }
    }

    // Apply chain-specific adjustments
    if (this.config.chainSpecific) {
      const chainAdjustment = this.calculateChainSpecificAdjustment(factors.chainId);
      adjustedTolerance *= chainAdjustment;
      adjustments.push(chainAdjustment);
    }

    // Ensure tolerance is within configured limits
    adjustedTolerance = Math.max(this.config.minTolerance, adjustedTolerance);
    adjustedTolerance = Math.min(this.config.maxTolerance, adjustedTolerance);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(adjustedTolerance);

    // Check if tolerance exceeds warning thresholds
    if (adjustedTolerance > this.config.criticalThreshold) {
      warnings.push(`Critical slippage tolerance: ${adjustedTolerance.toFixed(2)}%`);
    } else if (adjustedTolerance > this.config.warningThreshold) {
      warnings.push(`High slippage tolerance: ${adjustedTolerance.toFixed(2)}%`);
    }

    return {
      recommendedTolerance: baseTolerance,
      adjustedTolerance,
      factors,
      warnings,
      isWithinLimits: adjustedTolerance <= this.config.maxTolerance,
      riskLevel,
    };
  }

  /**
   * Calculate volatility-based adjustment
   */
  private calculateVolatilityAdjustment(volatility: number): number {
    if (volatility > 0.8) {
      return config.SLIPPAGE_VOLATILITY_MULTIPLIER;
    } else if (volatility > 0.5) {
      return 1.2;
    } else if (volatility > 0.2) {
      return 1.1;
    }
    return 1.0;
  }

  /**
   * Calculate liquidity-based adjustment
   */
  private calculateLiquidityAdjustment(liquidity: number): number {
    if (liquidity < 0.3) {
      return config.SLIPPAGE_LIQUIDITY_MULTIPLIER;
    } else if (liquidity < 0.6) {
      return 1.1;
    }
    return 1.0;
  }

  /**
   * Calculate time-based adjustment
   */
  private calculateTimeBasedAdjustment(timeOfDay: number): number {
    // Peak hours: 9-11 AM and 2-4 PM UTC
    const hour = new Date().getUTCHours();
    const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
    
    if (isPeakHour) {
      return config.SLIPPAGE_PEAK_HOURS_MULTIPLIER;
    } else {
      return config.SLIPPAGE_OFF_PEAK_MULTIPLIER;
    }
  }

  /**
   * Calculate trade size adjustment
   */
  private calculateTradeSizeAdjustment(tradeSize: number): number {
    if (tradeSize > config.SLIPPAGE_LARGE_TRADE_THRESHOLD) {
      return config.SLIPPAGE_LARGE_TRADE_MULTIPLIER;
    } else if (tradeSize > config.SLIPPAGE_LARGE_TRADE_THRESHOLD * 0.5) {
      return 1.2;
    }
    return 1.0;
  }

  /**
   * Calculate chain-specific adjustment
   */
  private calculateChainSpecificAdjustment(chainId: number): number {
    switch (chainId) {
      case 1: // Ethereum
        return config.SLIPPAGE_ETHEREUM_MULTIPLIER;
      case 42161: // Arbitrum
        return config.SLIPPAGE_ARBITRUM_MULTIPLIER;
      case 8453: // Base
        return config.SLIPPAGE_BASE_MULTIPLIER;
      case 324: // zkSync
        return config.SLIPPAGE_ZKSYNC_MULTIPLIER;
      default:
        return 1.0;
    }
  }

  /**
   * Determine risk level based on slippage tolerance
   */
  private determineRiskLevel(tolerance: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (tolerance <= this.config.warningThreshold) {
      return 'LOW';
    } else if (tolerance <= this.config.criticalThreshold) {
      return 'MEDIUM';
    } else if (tolerance <= this.config.maxTolerance) {
      return 'HIGH';
    } else {
      return 'CRITICAL';
    }
  }

  /**
   * Validate slippage tolerance against configured limits
   */
  validateTolerance(tolerance: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (tolerance < this.config.minTolerance) {
      errors.push(`Slippage tolerance too low. Minimum: ${this.config.minTolerance}%`);
    }

    if (tolerance > this.config.maxTolerance) {
      errors.push(`Slippage tolerance too high. Maximum: ${this.config.maxTolerance}%`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get slippage tolerance configuration
   */
  getConfig(): SlippageToleranceConfig {
    return { ...this.config };
  }

  /**
   * Update slippage tolerance configuration
   */
  updateConfig(newConfig: Partial<SlippageToleranceConfig>): void {
    // Validate the new configuration before applying
    const validation = this.validateConfigUpdate(newConfig);
    if (!validation.isValid) {
      logger.warn('Invalid slippage tolerance configuration update rejected', { 
        newConfig, 
        errors: validation.errors 
      });
      return;
    }
    
    Object.assign(this.config, newConfig);
    logger.info('Slippage tolerance configuration updated', { config: this.config });
  }

  /**
   * Validate configuration update parameters
   */
  private validateConfigUpdate(config: Partial<SlippageToleranceConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
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
      errors
    };
  }

  /**
   * Get recommended slippage tolerance for a specific scenario
   */
  getRecommendedTolerance(
    chainId: number,
    tradeSize: number,
    marketConditions: 'STABLE' | 'VOLATILE' | 'EXTREME' = 'STABLE'
  ): number {
    const factors: SlippageAdjustmentFactors = {
      volatility: marketConditions === 'EXTREME' ? 0.9 : marketConditions === 'VOLATILE' ? 0.6 : 0.2,
      liquidity: 0.5, // Default medium liquidity
      timeOfDay: new Date().getUTCHours() / 24,
      tradeSize,
      chainId,
      marketConditions,
    };

    const result = this.calculateOptimalTolerance(this.config.defaultTolerance, factors);
    return result.adjustedTolerance;
  }

  /**
   * Check if slippage tolerance requires user confirmation
   */
  requiresConfirmation(tolerance: number): boolean {
    return tolerance > this.config.warningThreshold;
  }

  /**
   * Get slippage tolerance warnings and recommendations
   */
  getWarningsAndRecommendations(tolerance: number): {
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (tolerance > this.config.criticalThreshold) {
      warnings.push(`Critical slippage tolerance: ${tolerance.toFixed(2)}%`);
      recommendations.push('Consider reducing trade size or waiting for better market conditions');
      recommendations.push('Review token liquidity and market volatility');
    } else if (tolerance > this.config.warningThreshold) {
      warnings.push(`High slippage tolerance: ${tolerance.toFixed(2)}%`);
      recommendations.push('Monitor market conditions before proceeding');
    }

    if (tolerance < this.config.minTolerance) {
      warnings.push(`Very low slippage tolerance: ${tolerance.toFixed(2)}%`);
      recommendations.push('Consider increasing tolerance to avoid failed transactions');
    }

    return { warnings, recommendations };
  }
}

export default SlippageToleranceService; 