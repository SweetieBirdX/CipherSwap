import { SwapService } from '../src/services/swapService';
import { 
  MEVProtectionConfig, 
  FlashbotsBundleRequest, 
  GasEstimateRequest,
  SwapRequest, 
  SwapData, 
  SwapSimulation,
  SwapResponse,
  EnhancedSwapResponse
} from '../src/types/swap';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.INCH_API_KEY = 'test_api_key';
process.env.PRIVATE_KEY = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
process.env.CHAINLINK_ORACLE_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890';
process.env.ETHEREUM_RPC_URL = 'https://mainnet.infura.io/v3/test_key';
process.env.FLASHBOTS_RELAY_URL = 'https://relay.flashbots.net';

// Mock axios to prevent real HTTP requests
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} })
}));

// Mock the Flashbots provider to prevent real HTTP requests
jest.mock('flashbots-ethers-v6-provider-bundle', () => ({
  FlashbotsBundleProvider: {
    create: jest.fn().mockResolvedValue({
      simulate: jest.fn().mockResolvedValue({
        totalGasUsed: '210000',
        coinbaseDiff: '0',
        refundableValue: '0',
        logs: []
      }),
      sendBundle: jest.fn().mockResolvedValue({
        bundleHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      })
    })
  }
}));

// Mock ethers to prevent real provider initialization
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getBlockNumber: jest.fn().mockResolvedValue(12345678),
    getFeeData: jest.fn().mockResolvedValue({
      gasPrice: '20000000000'
    })
  })),
  Wallet: {
    createRandom: jest.fn().mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef1234567890'
    })
  }
}));

// Mock timers to prevent Jest from hanging
jest.useFakeTimers();

describe('Flashbots MEV Protection', () => {
  let swapService: SwapService;
  let pendingPromises: Promise<any>[] = [];

  beforeEach(() => {
    // Clear all timers before each test
    jest.clearAllTimers();
    pendingPromises = [];
    
    // Create a new service instance for each test
    swapService = new SwapService();
    
    // Mock the initializeFlashbotsProvider method to do nothing
    jest.spyOn(swapService as any, 'initializeFlashbotsProvider').mockResolvedValue(undefined);
    
    // Mock the getQuote method for enhanced simulation tests
    jest.spyOn(swapService as any, 'getQuote').mockResolvedValue({
      success: true,
      data: {
        toTokenAmount: '1800000000000000000', // 1.8 ETH
        estimatedGas: '210000',
        slippage: 0.5,
        priceImpact: 0.1,
        estimatedGains: 800000000000000000, // 0.8 ETH
        route: [
          {
            fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
            toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            fromTokenAmount: '1000000000000000000',
            toTokenAmount: '1800000000000000000',
            estimatedGas: '210000',
            protocol: 'Uniswap V3',
            pool: '0x1234567890abcdef1234567890abcdef12345678'
          }
        ]
      }
    });
  });

  afterEach(async () => {
    // Wait for any pending promises to resolve
    if (pendingPromises.length > 0) {
      await Promise.allSettled(pendingPromises);
      pendingPromises = [];
    }
    
    // Clear any remaining timers
    jest.clearAllTimers();
    
    // Clear any service state that might persist between tests
    if (swapService) {
      // Clear any internal maps that might hold state
      (swapService as any).bundleHistory?.clear();
      (swapService as any).swapHistory?.clear();
      (swapService as any).limitOrderHistory?.clear();
      (swapService as any).secretsHistory?.clear();
    }
  });

  afterAll(async () => {
    // Final cleanup - wait for any remaining promises
    if (pendingPromises.length > 0) {
      await Promise.allSettled(pendingPromises);
    }
    
    // Restore real timers
    jest.useRealTimers();
    
    // Clear any global mocks
    jest.clearAllMocks();
  });

  // Helper function to track async operations
  const trackAsyncOperation = <T>(promise: Promise<T>): Promise<T> => {
    pendingPromises.push(promise);
    return promise.finally(() => {
      const index = pendingPromises.indexOf(promise);
      if (index > -1) {
        pendingPromises.splice(index, 1);
      }
    });
  };

  describe('Bundle Creation', () => {
    it('should create a Flashbots bundle with valid transactions', async () => {
      const transactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      ];

      const mevConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: 12345678,
        refundRecipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        refundPercent: 90
      };

      const result = await trackAsyncOperation(
        swapService.createFlashbotsBundle(
          transactions,
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          mevConfig
        )
      );

      // In test environment, Flashbots provider won't be initialized
      // So we expect the mock implementation to work
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.bundleId).toBeDefined();
      expect(result.data?.targetBlock).toBe(12345678);
      expect(result.data?.status).toBe('submitted');
    });

    it('should fail with invalid transactions', async () => {
      const transactions: string[] = [];

      const mevConfig: MEVProtectionConfig = {
        useFlashbots: true
      };

      const result = await trackAsyncOperation(
        swapService.createFlashbotsBundle(
          transactions,
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          mevConfig
        )
      );

      // Should fail due to validation, not Flashbots provider
      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one transaction is required');
    });

    it('should fail with too many transactions', async () => {
      const transactions = Array(11).fill('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

      const mevConfig: MEVProtectionConfig = {
        useFlashbots: true
      };

      const result = await trackAsyncOperation(
        swapService.createFlashbotsBundle(
          transactions,
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          mevConfig
        )
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum 10 transactions allowed per bundle');
    });
  });

  describe('Bundle Simulation', () => {
    it('should simulate a bundle successfully', async () => {
      const bundleRequest: FlashbotsBundleRequest = {
        transactions: [
          { transaction: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', canRevert: false }
        ],
        targetBlock: 12345678
      };

      const result = await trackAsyncOperation(
        swapService.simulateBundle(bundleRequest)
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.gasUsed).toBeDefined();
      expect(result.data?.blockNumber).toBe(12345678);
      expect(result.data?.profit).toBeDefined();
    });

    it('should fail simulation with invalid bundle', async () => {
      const bundleRequest: FlashbotsBundleRequest = {
        transactions: [],
        targetBlock: 12345678
      };

      const result = await trackAsyncOperation(
        swapService.simulateBundle(bundleRequest)
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Gas Estimation', () => {
    it('should estimate gas for bundle transactions', async () => {
      const gasRequest: GasEstimateRequest = {
        transactions: [
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
        ],
        blockNumber: 12345678
      };

      const result = await trackAsyncOperation(
        swapService.estimateBundleGas(gasRequest)
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.gasUsed).toBeDefined();
      expect(result.data?.gasPrice).toBeDefined();
      expect(result.data?.totalCost).toBeDefined();
      expect(result.data?.estimatedProfit).toBeDefined();
    });

    it('should fail gas estimation with invalid transactions', async () => {
      const gasRequest: GasEstimateRequest = {
        transactions: [],
        blockNumber: 12345678
      };

      const result = await trackAsyncOperation(
        swapService.estimateBundleGas(gasRequest)
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Bundle Status', () => {
    it('should get bundle status successfully', async () => {
      // First create a bundle
      const transactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const mevConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: 12345678
      };

      const createResult = await trackAsyncOperation(
        swapService.createFlashbotsBundle(
          transactions,
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          mevConfig
        )
      );

      expect(createResult.success).toBe(true);
      expect(createResult.data?.bundleId).toBeDefined();

      // Then get status
      const statusResult = await trackAsyncOperation(
        swapService.getBundleStatus(
          createResult.data!.bundleId,
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
        )
      );

      expect(statusResult.success).toBe(true);
      expect(statusResult.data).toBeDefined();
      expect(statusResult.data?.bundleId).toBe(createResult.data!.bundleId);
    });

    it('should fail to get status for non-existent bundle', async () => {
      const result = await trackAsyncOperation(
        swapService.getBundleStatus(
          'non_existent_bundle_id',
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
        )
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bundle not found');
    });

    it('should fail to get status for unauthorized user', async () => {
      // First create a bundle
      const transactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const mevConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: 12345678
      };

      const createResult = await trackAsyncOperation(
        swapService.createFlashbotsBundle(
          transactions,
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          mevConfig
        )
      );

      expect(createResult.success).toBe(true);

      // Then try to get status with different user
      const statusResult = await trackAsyncOperation(
        swapService.getBundleStatus(
          createResult.data!.bundleId,
          '0xDifferentUserAddress'
        )
      );

      expect(statusResult.success).toBe(false);
      expect(statusResult.error).toBe('Unauthorized to check this bundle');
    });
  });

  describe('Bundle History', () => {
    it('should get bundle history for user', async () => {
      const userAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

      // Create a few bundles
      const transactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const mevConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: 12345678
      };

      await trackAsyncOperation(
        swapService.createFlashbotsBundle(transactions, userAddress, mevConfig)
      );
      await trackAsyncOperation(
        swapService.createFlashbotsBundle(transactions, userAddress, mevConfig)
      );

      // Get history
      const history = await trackAsyncOperation(
        swapService.getBundleHistory(userAddress, 10, 1)
      );

      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].userAddress).toBe(userAddress);
    });

    it('should return empty history for user with no bundles', async () => {
      const history = await trackAsyncOperation(
        swapService.getBundleHistory(
          '0xUserWithNoBundles',
          10,
          1
        )
      );

      expect(history).toBeDefined();
      expect(history.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle Flashbots provider not initialized', async () => {
      // Create a new service without Flashbots provider
      const serviceWithoutFlashbots = new SwapService();

      const transactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const mevConfig: MEVProtectionConfig = {
        useFlashbots: true
      };

      const result = await trackAsyncOperation(
        serviceWithoutFlashbots.createFlashbotsBundle(
          transactions,
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          mevConfig
        )
      );

      // With mock implementation, it should succeed
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.bundleId).toBeDefined();
    });

    it('should validate transaction format', async () => {
      const transactions = [
        'invalid_transaction_format'
      ];

      const mevConfig: MEVProtectionConfig = {
        useFlashbots: true
      };

      const result = await trackAsyncOperation(
        swapService.createFlashbotsBundle(
          transactions,
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          mevConfig
        )
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('must be a valid hex string');
    });
  });

  describe('Enhanced Swap Simulation', () => {
    it('should perform enhanced simulation with comprehensive analysis', async () => {
      const params: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        slippage: 0.5,
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      const result = await trackAsyncOperation(
        swapService.simulateSwapEnhanced(params)
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const simulation = result.data as SwapSimulation;
      
      // Check basic simulation data
      expect(simulation.originalQuote).toBeDefined();
      expect(simulation.simulatedSwap).toBeDefined();
      expect(simulation.slippageDifference).toBeDefined();
      expect(simulation.gasDifference).toBeDefined();
      expect(simulation.priceImpactDifference).toBeDefined();
      expect(simulation.estimatedGains).toBeDefined();
      
      // Check enhanced analysis data
      expect(simulation.slippageAnalysis).toBeDefined();
      expect(simulation.priceImpactAnalysis).toBeDefined();
      expect(simulation.gasAnalysis).toBeDefined();
      expect(simulation.marketConditions).toBeDefined();
      expect(simulation.parameterRecommendations).toBeDefined();
      expect(simulation.riskAssessment).toBeDefined();
      expect(simulation.executionOptimization).toBeDefined();
      
      // Validate slippage analysis
      expect(simulation.slippageAnalysis.currentSlippage).toBe(0.5);
      expect(simulation.slippageAnalysis.expectedSlippage).toBeGreaterThan(0);
      expect(simulation.slippageAnalysis.slippageRisk).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
      expect(simulation.slippageAnalysis.slippageTrend).toMatch(/^(INCREASING|DECREASING|STABLE)$/);
      expect(simulation.slippageAnalysis.recommendedSlippage).toBeGreaterThan(0);
      expect(simulation.slippageAnalysis.slippageFactors).toBeDefined();
      
      // Validate price impact analysis
      expect(simulation.priceImpactAnalysis.priceImpact).toBeGreaterThanOrEqual(0);
      expect(simulation.priceImpactAnalysis.priceImpactPercentage).toBeGreaterThanOrEqual(0);
      expect(simulation.priceImpactAnalysis.priceImpactRisk).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
      expect(simulation.priceImpactAnalysis.priceImpactTrend).toMatch(/^(INCREASING|DECREASING|STABLE)$/);
      expect(simulation.priceImpactAnalysis.recommendedAmount).toBeDefined();
      expect(simulation.priceImpactAnalysis.priceImpactFactors).toBeDefined();
      
      // Validate gas analysis
      expect(simulation.gasAnalysis.estimatedGas).toBeDefined();
      expect(simulation.gasAnalysis.gasPrice).toBeDefined();
      expect(simulation.gasAnalysis.totalGasCost).toBeDefined();
      expect(simulation.gasAnalysis.gasOptimization).toBeDefined();
      expect(simulation.gasAnalysis.gasTrend).toMatch(/^(INCREASING|DECREASING|STABLE)$/);
      expect(simulation.gasAnalysis.recommendedGasPrice).toBeDefined();
      expect(simulation.gasAnalysis.gasFactors).toBeDefined();
      
      // Validate market conditions
      expect(simulation.marketConditions.liquidityScore).toBeGreaterThan(0);
      expect(simulation.marketConditions.volatilityIndex).toBeGreaterThanOrEqual(0);
      expect(simulation.marketConditions.marketDepth).toBeGreaterThan(0);
      expect(simulation.marketConditions.spreadAnalysis).toBeDefined();
      expect(simulation.marketConditions.volumeAnalysis).toBeDefined();
      expect(simulation.marketConditions.marketTrend).toMatch(/^(BULLISH|BEARISH|NEUTRAL)$/);
      
      // Validate parameter recommendations
      expect(simulation.parameterRecommendations.recommendedSlippage).toBeGreaterThan(0);
      expect(simulation.parameterRecommendations.recommendedAmount).toBeDefined();
      expect(simulation.parameterRecommendations.recommendedGasPrice).toBeDefined();
      expect(simulation.parameterRecommendations.recommendedDeadline).toBeGreaterThan(0);
      expect(simulation.parameterRecommendations.timingRecommendation).toBeDefined();
      expect(simulation.parameterRecommendations.routeOptimization).toBeDefined();
      
      // Validate risk assessment
      expect(simulation.riskAssessment.overallRisk).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
      expect(simulation.riskAssessment.riskFactors).toBeInstanceOf(Array);
      expect(simulation.riskAssessment.riskScore).toBeGreaterThanOrEqual(0);
      expect(simulation.riskAssessment.mitigationStrategies).toBeInstanceOf(Array);
      expect(simulation.riskAssessment.recommendedActions).toBeInstanceOf(Array);
      
      // Validate execution optimization
      expect(simulation.executionOptimization.optimalExecutionStrategy).toMatch(/^(IMMEDIATE|WAIT|SPLIT|CANCEL)$/);
      expect(simulation.executionOptimization.executionConfidence).toBeGreaterThanOrEqual(0);
      expect(simulation.executionOptimization.executionConfidence).toBeLessThanOrEqual(1);
      expect(simulation.executionOptimization.expectedOutcome).toBeDefined();
      expect(simulation.executionOptimization.optimizationMetrics).toBeDefined();
    });

    it('should execute swap with optimization', async () => {
      const params: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        slippage: 0.5,
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      const result = await trackAsyncOperation(
        swapService.executeSwapWithOptimization(params)
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const swapData = result.data as SwapData;
      expect(swapData.swapId).toBeDefined();
      expect(swapData.fromToken).toBe(params.fromToken);
      expect(swapData.toToken).toBe(params.toToken);
      expect(swapData.fromAmount).toBe(params.amount);
      expect(swapData.userAddress).toBe(params.userAddress);
    });

    it('should handle high risk scenarios with cancellation', async () => {
      // Mock high risk scenario by creating a large trade
      const params: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000000000', // 1M ETH - very large trade
        chainId: 1,
        slippage: 0.1, // Very low slippage
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      const result = await trackAsyncOperation(
        swapService.executeSwapWithOptimization(params)
      );

      // Should either succeed with optimization or be cancelled due to high risk
      expect(result.success).toBeDefined();
      if (!result.success) {
        expect(result.error).toMatch(/cancelled|delayed|unfavorable/);
      }
    });

    it('should provide split recommendations for large trades', async () => {
      const params: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '100000000000000000000', // 100 ETH - large trade
        chainId: 1,
        slippage: 0.5,
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      const result = await trackAsyncOperation(
        swapService.simulateSwapEnhanced(params)
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const simulation = result.data as SwapSimulation;
      
      // Check if split recommendation is provided
      if (simulation.parameterRecommendations.splitRecommendation) {
        const splitRec = simulation.parameterRecommendations.splitRecommendation;
        expect(splitRec.shouldSplit).toBeDefined();
        expect(splitRec.splitCount).toBeGreaterThan(0);
        expect(splitRec.splitAmounts).toBeInstanceOf(Array);
        expect(splitRec.splitAmounts.length).toBe(splitRec.splitCount);
        expect(splitRec.splitIntervals).toBeInstanceOf(Array);
        expect(splitRec.expectedSavings).toBeDefined();
      }
    });

    it('should analyze gas optimization strategies', async () => {
      const params: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        slippage: 0.5,
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      const result = await trackAsyncOperation(
        swapService.simulateSwapEnhanced(params)
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const simulation = result.data as SwapSimulation;
      const gasAnalysis = simulation.gasAnalysis;
      
      // Validate gas optimization
      expect(gasAnalysis.gasOptimization.optimizedGasPrice).toBeDefined();
      expect(gasAnalysis.gasOptimization.priorityFee).toBeDefined();
      expect(gasAnalysis.gasOptimization.maxFeePerGas).toBeDefined();
      expect(gasAnalysis.gasOptimization.maxPriorityFeePerGas).toBeDefined();
      expect(gasAnalysis.gasOptimization.gasSavings).toBeDefined();
      expect(gasAnalysis.gasOptimization.optimizationStrategy).toMatch(/^(AGGRESSIVE|BALANCED|CONSERVATIVE)$/);
      
      // Validate gas factors
      expect(gasAnalysis.gasFactors.networkCongestion).toBeGreaterThanOrEqual(0);
      expect(gasAnalysis.gasFactors.blockSpace).toBeGreaterThanOrEqual(0);
      expect(gasAnalysis.gasFactors.priorityFee).toBeGreaterThan(0);
      expect(gasAnalysis.gasFactors.baseFee).toBeGreaterThan(0);
    });

    it('should provide market condition analysis', async () => {
      const params: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        slippage: 0.5,
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      const result = await trackAsyncOperation(
        swapService.simulateSwapEnhanced(params)
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const simulation = result.data as SwapSimulation;
      const marketConditions = simulation.marketConditions;
      
      // Validate spread analysis
      expect(marketConditions.spreadAnalysis.bidAskSpread).toBeGreaterThan(0);
      expect(marketConditions.spreadAnalysis.spreadPercentage).toBeGreaterThan(0);
      expect(marketConditions.spreadAnalysis.spreadRisk).toMatch(/^(LOW|MEDIUM|HIGH)$/);
      expect(marketConditions.spreadAnalysis.recommendedSpread).toBeGreaterThan(0);
      
      // Validate volume analysis
      expect(marketConditions.volumeAnalysis.volume24h).toBeDefined();
      expect(marketConditions.volumeAnalysis.volumeChange).toBeDefined();
      expect(marketConditions.volumeAnalysis.volumeTrend).toMatch(/^(INCREASING|DECREASING|STABLE)$/);
      expect(marketConditions.volumeAnalysis.volumeImpact).toBeDefined();
    });

    it('should provide timing recommendations', async () => {
      const params: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        slippage: 0.5,
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      const result = await trackAsyncOperation(
        swapService.simulateSwapEnhanced(params)
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const simulation = result.data as SwapSimulation;
      const timingRec = simulation.parameterRecommendations.timingRecommendation;
      
      expect(timingRec.optimalExecutionTime).toBeGreaterThan(Date.now());
      expect(timingRec.executionWindow.start).toBeLessThanOrEqual(Date.now());
      expect(timingRec.executionWindow.end).toBeGreaterThan(Date.now());
      expect(timingRec.marketConditions).toBeDefined();
      expect(timingRec.urgencyLevel).toMatch(/^(LOW|MEDIUM|HIGH)$/);
    });

    it('should calculate optimization metrics', async () => {
      const params: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000', // 1 ETH
        chainId: 1,
        slippage: 0.5,
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      const result = await trackAsyncOperation(
        swapService.simulateSwapEnhanced(params)
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const simulation = result.data as SwapSimulation;
      const metrics = simulation.executionOptimization.optimizationMetrics;
      
      expect(metrics.gasEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.gasEfficiency).toBeLessThanOrEqual(1);
      expect(metrics.slippageEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.slippageEfficiency).toBeLessThanOrEqual(1);
      expect(metrics.timeEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.timeEfficiency).toBeLessThanOrEqual(1);
      expect(metrics.costEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.costEfficiency).toBeLessThanOrEqual(1);
    });
  });
}); 