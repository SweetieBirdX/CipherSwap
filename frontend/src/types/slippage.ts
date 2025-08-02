// Frontend slippage types - Backend ile uyumlu
export interface SlippageConfig {
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
  optimalTolerance: number;
  adjustedTolerance: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warnings: string[];
  recommendations: string[];
}

export interface SlippageRequest {
  baseTolerance: number;
  chainId: number;
  tradeSize: number;
  marketConditions?: 'STABLE' | 'VOLATILE' | 'EXTREME';
  volatility?: number;
  liquidity?: number;
  timeOfDay?: number;
}

export interface SlippageResponse {
  success: boolean;
  data?: SlippageToleranceResult;
  error?: string;
}

export interface SlippageValidationRequest {
  tolerance: number;
  chainId: number;
  tradeSize: number;
  fromToken: string;
  toToken: string;
}

export interface SlippageValidationResult {
  isValid: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warnings: string[];
  recommendations: string[];
  maxRecommendedTolerance: number;
}

export interface SlippageValidationResponse {
  success: boolean;
  data?: SlippageValidationResult;
  error?: string;
} 