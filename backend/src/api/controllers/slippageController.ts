import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import SlippageToleranceService, { SlippageToleranceConfig } from '../../services/slippageToleranceService';

export class SlippageController {
  private slippageService: SlippageToleranceService;
  
  constructor() {
    this.slippageService = new SlippageToleranceService();
  }
  
  /**
   * GET /api/slippage/config
   * Get current slippage tolerance configuration
   */
  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Slippage config request received');
      
      const config = this.slippageService.getConfig();
      
      res.json({
        success: true,
        data: config,
        timestamp: Date.now()
      });
      
    } catch (error: any) {
      logger.error('Slippage config controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * PUT /api/slippage/config
   * Update slippage tolerance configuration
   */
  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const configUpdate: Partial<SlippageToleranceConfig> = req.body;
      
      logger.info('Slippage config update request received', { configUpdate });
      
      // Validate the configuration update
      const validation = this.validateConfigUpdate(configUpdate);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid configuration',
          details: validation.errors,
          timestamp: Date.now()
        });
        return;
      }
      
      // Update the configuration
      this.slippageService.updateConfig(configUpdate);
      
      // Get the updated configuration
      const updatedConfig = this.slippageService.getConfig();
      
      res.json({
        success: true,
        data: updatedConfig,
        message: 'Slippage tolerance configuration updated successfully',
        timestamp: Date.now()
      });
      
    } catch (error: any) {
      logger.error('Slippage config update controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * POST /api/slippage/calculate
   * Calculate optimal slippage tolerance for a specific scenario
   */
  async calculateTolerance(req: Request, res: Response): Promise<void> {
    try {
      const { 
        baseTolerance, 
        chainId, 
        tradeSize, 
        marketConditions = 'STABLE',
        volatility,
        liquidity,
        timeOfDay
      } = req.body;
      
      logger.info('Slippage tolerance calculation request received', { 
        baseTolerance, 
        chainId, 
        tradeSize, 
        marketConditions 
      });
      
      // Validate required parameters
      if (!baseTolerance || !chainId || tradeSize === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: baseTolerance, chainId, tradeSize',
          timestamp: Date.now()
        });
        return;
      }
      
      // Create adjustment factors
      const factors = {
        volatility: volatility || (marketConditions === 'EXTREME' ? 0.9 : marketConditions === 'VOLATILE' ? 0.6 : 0.2),
        liquidity: liquidity || 0.5,
        timeOfDay: timeOfDay || (new Date().getUTCHours() / 24),
        tradeSize,
        chainId,
        marketConditions: marketConditions as 'STABLE' | 'VOLATILE' | 'EXTREME'
      };
      
      // Calculate optimal tolerance
      const result = this.slippageService.calculateOptimalTolerance(baseTolerance, factors);
      
      res.json({
        success: true,
        data: result,
        timestamp: Date.now()
      });
      
    } catch (error: any) {
      logger.error('Slippage tolerance calculation controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * POST /api/slippage/validate
   * Validate slippage tolerance against configured limits
   */
  async validateTolerance(req: Request, res: Response): Promise<void> {
    try {
      const { tolerance } = req.body;
      
      logger.info('Slippage tolerance validation request received', { tolerance });
      
      if (tolerance === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: tolerance',
          timestamp: Date.now()
        });
        return;
      }
      
      // Validate tolerance
      const validation = this.slippageService.validateTolerance(tolerance);
      
      // Get warnings and recommendations
      const warningsAndRecommendations = this.slippageService.getWarningsAndRecommendations(tolerance);
      
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
      
    } catch (error: any) {
      logger.error('Slippage tolerance validation controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * GET /api/slippage/recommended/:chainId
   * Get recommended slippage tolerance for a specific chain
   */
  async getRecommendedTolerance(req: Request, res: Response): Promise<void> {
    try {
      const { chainId } = req.params;
      const { tradeSize, marketConditions = 'STABLE' } = req.query;
      
      logger.info('Recommended slippage tolerance request received', { 
        chainId, 
        tradeSize, 
        marketConditions 
      });
      
      if (!chainId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: chainId',
          timestamp: Date.now()
        });
        return;
      }
      
      const recommendedTolerance = this.slippageService.getRecommendedTolerance(
        parseInt(chainId),
        parseFloat(tradeSize as string) || 0,
        marketConditions as 'STABLE' | 'VOLATILE' | 'EXTREME'
      );
      
      res.json({
        success: true,
        data: {
          chainId: parseInt(chainId),
          tradeSize: parseFloat(tradeSize as string) || 0,
          marketConditions,
          recommendedTolerance
        },
        timestamp: Date.now()
      });
      
    } catch (error: any) {
      logger.error('Recommended slippage tolerance controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * POST /api/slippage/reset
   * Reset slippage tolerance configuration to environment variable defaults
   */
  async resetConfig(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Slippage config reset request received');
      
      // Create a new service instance to reset to environment defaults
      this.slippageService = new SlippageToleranceService();
      
      const config = this.slippageService.getConfig();
      
      res.json({
        success: true,
        data: config,
        message: 'Slippage tolerance configuration reset to environment defaults',
        timestamp: Date.now()
      });
      
    } catch (error: any) {
      logger.error('Slippage config reset controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
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
} 