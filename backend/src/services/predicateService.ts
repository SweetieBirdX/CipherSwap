import axios, { AxiosResponse } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { 
  PredicateRequest, 
  PredicateResponse, 
  PredicateData, 
  PredicateStatus,
  PredicateErrorCodes,
  PREDICATE_CONSTANTS,
  CHAINLINK_ORACLES,
  PredicateHistory,
  OracleData,
  PredicateValidation
} from '../types/predicate';

export class PredicateService {
  private predicateHistory: Map<string, PredicateData> = new Map();
  
  constructor() {
    // Initialize with some mock data for testing
    this.initializeMockData();
  }
  
  /**
   * Create a new price predicate
   */
  async createPredicate(params: PredicateRequest): Promise<PredicateResponse> {
    try {
      logger.info('Creating predicate', { params });
      
      // Validate request
      const validation = this.validatePredicateRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get current oracle price
      const oraclePrice = await this.getOraclePrice(params.oracleAddress, params.chainId);
      if (!oraclePrice.success) {
        return {
          success: false,
          error: 'Failed to get oracle price'
        };
      }
      
      // Create predicate data
      const predicateData = this.formatPredicateData(params, oraclePrice.data);
      
      // Store predicate data
      this.predicateHistory.set(predicateData.predicateId, predicateData);
      
      logger.info('Predicate created successfully', { 
        predicateId: predicateData.predicateId,
        oracleAddress: params.oracleAddress,
        tolerance: params.tolerance
      });
      
      return {
        success: true,
        data: predicateData
      };
      
    } catch (error: any) {
      logger.error('Predicate service error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: this.handlePredicateError(error)
      };
    }
  }
  
  /**
   * Validate predicate with current oracle price
   */
  async validatePredicate(predicateId: string): Promise<PredicateResponse> {
    try {
      logger.info('Validating predicate', { predicateId });
      
      const predicateData = this.predicateHistory.get(predicateId);
      if (!predicateData) {
        return {
          success: false,
          error: 'Predicate not found'
        };
      }
      
      // Get current oracle price
      const oraclePrice = await this.getOraclePrice(predicateData.oracleAddress, predicateData.chainId);
      if (!oraclePrice.success) {
        return {
          success: false,
          error: 'Failed to get oracle price'
        };
      }
      
      // Validate predicate
      const validation = this.validatePredicateLogic(predicateData, oraclePrice.data);
      
      // Update predicate status
      predicateData.currentPrice = oraclePrice.data.price;
      predicateData.isValid = validation.isValid;
      predicateData.status = validation.isValid ? PredicateStatus.ACTIVE : PredicateStatus.INVALID;
      
      this.predicateHistory.set(predicateId, predicateData);
      
      return {
        success: true,
        data: validation as any
      };
      
    } catch (error: any) {
      logger.error('Predicate validation error', { error: error.message, predicateId });
      return {
        success: false,
        error: 'Validation failed'
      };
    }
  }
  
  /**
   * Get predicate history for user
   */
  async getPredicateHistory(userAddress: string, limit: number = 10, page: number = 1): Promise<PredicateHistory[]> {
    try {
      logger.info('Getting predicate history', { userAddress, limit, page });
      
      const userPredicates = Array.from(this.predicateHistory.values())
        .filter(predicate => predicate.userAddress === userAddress)
        .sort((a, b) => b.createdAt - a.createdAt);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return userPredicates.slice(startIndex, endIndex).map(predicate => ({
        id: predicate.predicateId,
        predicateId: predicate.predicateId,
        chainId: predicate.chainId,
        oracleAddress: predicate.oracleAddress,
        tolerance: predicate.tolerance,
        status: predicate.status,
        createdAt: predicate.createdAt,
        userAddress: predicate.userAddress,
        txHash: predicate.txHash
      }));
      
    } catch (error: any) {
      logger.error('Get predicate history error', { error: error.message, userAddress });
      return [];
    }
  }
  
  /**
   * Get available Chainlink oracles for chain
   */
  async getAvailableOracles(chainId: number): Promise<OracleData[]> {
    try {
      logger.info('Getting available oracles', { chainId });
      
      const chainOracles = CHAINLINK_ORACLES[chainId as keyof typeof CHAINLINK_ORACLES];
      if (!chainOracles) {
        return [];
      }
      
      const oracles: OracleData[] = [];
      
      for (const [pair, address] of Object.entries(chainOracles)) {
        // Get current price for each oracle
        const priceResponse = await this.getOraclePrice(address, chainId);
        
        oracles.push({
          address,
          price: priceResponse.success ? priceResponse.data.price : 0,
          timestamp: Date.now(),
          decimals: 8, // Chainlink typically uses 8 decimals
          description: pair
        });
      }
      
      return oracles;
      
    } catch (error: any) {
      logger.error('Get available oracles error', { error: error.message, chainId });
      return [];
    }
  }
  
  /**
   * Cancel active predicate
   */
  async cancelPredicate(predicateId: string, userAddress: string): Promise<PredicateResponse> {
    try {
      logger.info('Cancelling predicate', { predicateId, userAddress });
      
      const predicateData = this.predicateHistory.get(predicateId);
      if (!predicateData) {
        return {
          success: false,
          error: 'Predicate not found'
        };
      }
      
      // Check if user is authorized to cancel
      if (predicateData.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to cancel this predicate'
        };
      }
      
      // Check if predicate can be cancelled
      if (predicateData.status !== PredicateStatus.ACTIVE) {
        return {
          success: false,
          error: 'Predicate cannot be cancelled'
        };
      }
      
      // Update predicate status
      predicateData.status = PredicateStatus.CANCELLED;
      this.predicateHistory.set(predicateId, predicateData);
      
      logger.info('Predicate cancelled successfully', { predicateId });
      
      return {
        success: true,
        data: predicateData
      };
      
    } catch (error: any) {
      logger.error('Cancel predicate error', { error: error.message, predicateId });
      return {
        success: false,
        error: 'Failed to cancel predicate'
      };
    }
  }
  
  /**
   * Get predicate status and details
   */
  async getPredicateStatus(predicateId: string): Promise<PredicateResponse> {
    try {
      logger.info('Getting predicate status', { predicateId });
      
      const predicateData = this.predicateHistory.get(predicateId);
      if (!predicateData) {
        return {
          success: false,
          error: 'Predicate not found'
        };
      }
      
      // Check if predicate is expired
      if (predicateData.expiresAt && predicateData.expiresAt < Date.now()) {
        predicateData.status = PredicateStatus.EXPIRED;
        this.predicateHistory.set(predicateId, predicateData);
      }
      
      return {
        success: true,
        data: predicateData
      };
      
    } catch (error: any) {
      logger.error('Get predicate status error', { error: error.message, predicateId });
      return {
        success: false,
        error: 'Failed to get predicate status'
      };
    }
  }
  
  /**
   * Get oracle price from Chainlink
   */
  private async getOraclePrice(oracleAddress: string, chainId: number): Promise<any> {
    try {
      // Mock implementation - in real app this would call Chainlink oracle
      const mockPrice = this.getMockOraclePrice(oracleAddress, chainId);
      
      return {
        success: true,
        data: {
          price: mockPrice,
          timestamp: Date.now(),
          decimals: 8
        }
      };
      
    } catch (error: any) {
      logger.error('Get oracle price error', { error: error.message, oracleAddress });
      return {
        success: false,
        error: 'Failed to get oracle price'
      };
    }
  }
  
  /**
   * Validate predicate request parameters
   */
  private validatePredicateRequest(params: PredicateRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
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
      if (params.tolerance < PREDICATE_CONSTANTS.MIN_TOLERANCE) {
        errors.push(`Tolerance too low. Minimum: ${PREDICATE_CONSTANTS.MIN_TOLERANCE}%`);
      }
      if (params.tolerance > PREDICATE_CONSTANTS.MAX_TOLERANCE) {
        errors.push(`Tolerance too high. Maximum: ${PREDICATE_CONSTANTS.MAX_TOLERANCE}%`);
      }
    }
    
    // Chain ID validation
    if (params.chainId && !CHAINLINK_ORACLES[params.chainId as keyof typeof CHAINLINK_ORACLES]) {
      errors.push('Unsupported chain ID');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Format predicate data
   */
  private formatPredicateData(params: PredicateRequest, oracleData: any): PredicateData {
    const predicateId = `predicate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      predicateId,
      chainId: params.chainId,
      oracleAddress: params.oracleAddress,
      tolerance: params.tolerance,
      userAddress: params.userAddress,
      tokenAddress: params.tokenAddress,
      priceThreshold: params.priceThreshold,
      currentPrice: oracleData.price,
      isValid: true,
      status: PredicateStatus.ACTIVE,
      createdAt: Date.now(),
      expiresAt: params.deadline ? params.deadline * 1000 : undefined
    };
  }
  
  /**
   * Validate predicate logic
   */
  private validatePredicateLogic(predicateData: PredicateData, oracleData: any): PredicateValidation {
    const currentPrice = oracleData.price;
    const thresholdPrice = predicateData.priceThreshold || predicateData.currentPrice;
    const deviation = Math.abs((currentPrice - thresholdPrice) / thresholdPrice) * 100;
    const isValid = deviation <= predicateData.tolerance;
    
    return {
      predicateId: predicateData.predicateId,
      currentPrice,
      thresholdPrice,
      tolerance: predicateData.tolerance,
      isValid,
      deviation,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get mock oracle price for testing
   */
  private getMockOraclePrice(oracleAddress: string, chainId: number): number {
    // Mock prices for testing
    const mockPrices: { [key: string]: number } = {
      '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419': 2500, // ETH/USD
      '0xF4030086522a5bEEa5E49b0311D971b50Ff9b538': 45000, // BTC/USD
      '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6': 1, // USDC/USD
      '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9': 1, // DAI/USD
    };
    
    return mockPrices[oracleAddress] || 100;
  }
  
  /**
   * Initialize mock data for testing
   */
  private initializeMockData(): void {
    const mockPredicate: PredicateData = {
      predicateId: 'predicate_test_001',
      chainId: 1,
      oracleAddress: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      tolerance: 1,
      userAddress: '0x1234567890123456789012345678901234567890',
      currentPrice: 2500,
      isValid: true,
      status: PredicateStatus.ACTIVE,
      createdAt: Date.now() - 3600000 // 1 hour ago
    };
    
    this.predicateHistory.set(mockPredicate.predicateId, mockPredicate);
  }
  
  /**
   * Handle different types of errors
   */
  private handlePredicateError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid predicate parameters';
        case 404:
          return 'Oracle not found';
        case 500:
          return 'Oracle server error';
        default:
          return data?.message || 'Unknown oracle error';
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Oracle request timeout';
    }
    
    if (error.code === 'ENOTFOUND') {
      return 'Oracle network error';
    }
    
    return error.message || 'Unknown error';
  }
}

// ====== LIMIT_ORDER_PREDICATE_LOGIC (tolga) ======
/**
 * 1inch Limit Order için fiyat guard predicate'i
 * Chainlink oracle tabanlı fiyat sapma kontrolü
 */
export async function buildPriceGuardPredicate(
  currentPrice: bigint,
  minPrice: bigint,
  maxPrice: bigint,
  tolerancePercent: number = 1.0
): Promise<{ success: boolean; isValid: boolean; error?: string; deviation?: number }> {
  try {
    // Fiyat aralığı kontrolü
    const isWithinRange = currentPrice >= minPrice && currentPrice <= maxPrice;
    
    if (!isWithinRange) {
      const deviation = Math.abs(Number(currentPrice - minPrice) / Number(minPrice)) * 100;
      return {
        success: true,
        isValid: false,
        deviation
      };
    }
    
    // Tolerans kontrolü (opsiyonel)
    if (tolerancePercent > 0) {
      const expectedPrice = (minPrice + maxPrice) / 2n;
      const deviation = Math.abs(Number(currentPrice - expectedPrice) / Number(expectedPrice)) * 100;
      
      if (deviation > tolerancePercent) {
        return {
          success: true,
          isValid: false,
          deviation
        };
      }
    }
    
    return {
      success: true,
      isValid: true,
      deviation: 0
    };
  } catch (error: any) {
    return {
      success: false,
      isValid: false,
      error: error.message
    };
  }
}

/**
 * 1inch Limit Order için predicate validation
 * Bu fonksiyon, limit order'ın predicate koşullarını kontrol eder
 */
export async function validateLimitOrderPredicate(
  predicateId: string,
  currentPrice: bigint,
  predicateService: PredicateService
): Promise<{ success: boolean; isValid: boolean; error?: string }> {
  try {
    const predicateResponse = await predicateService.getPredicateStatus(predicateId);
    
    if (!predicateResponse.success || !predicateResponse.data) {
      return {
        success: false,
        isValid: false,
        error: 'Predicate not found or invalid'
      };
    }
    
    const predicateData = predicateResponse.data;
    const thresholdPrice = BigInt(Math.floor(predicateData.currentPrice * 1e8)); // Chainlink 8 decimal
    const tolerance = predicateData.tolerance;
    
    // Fiyat sapma hesaplama
    const deviation = Math.abs(Number(currentPrice - thresholdPrice) / Number(thresholdPrice)) * 100;
    const isValid = deviation <= tolerance;
    
    return {
      success: true,
      isValid,
      error: isValid ? undefined : `Price deviation ${deviation.toFixed(2)}% exceeds tolerance ${tolerance}%`
    };
  } catch (error: any) {
    return {
      success: false,
      isValid: false,
      error: error.message
    };
  }
}
// ====== END LIMIT_ORDER_PREDICATE_LOGIC ======

export default PredicateService; 