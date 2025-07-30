import { SwapService } from '../src/services/swapService';
import { 
  MEVProtectionConfig, 
  FlashbotsBundleRequest, 
  GasEstimateRequest,
  SwapRequest, 
  SwapResponse,
  FlashbotsBundleResponse,
  FlashbotsSimulationResponse,
  GasEstimateResponse,
  BundleStatus,
  SwapStatus
} from '../src/types/swap';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.INCH_API_KEY = 'test_api_key';
process.env.FLASHBOTS_RELAY_URL = 'https://relay.flashbots.net';
process.env.ETHEREUM_RPC_URL = 'https://mainnet.infura.io/v3/test_key';
process.env.FLASHBOTS_SIGNER_PRIVATE_KEY = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
process.env.FLASHBOTS_MAX_RETRIES = '3';
process.env.FLASHBOTS_RETRY_BASE_DELAY = '1000';
process.env.FLASHBOTS_ENABLE_FALLBACK = 'true';
process.env.FLASHBOTS_FALLBACK_GAS_PRICE = '25000000000';
process.env.FLASHBOTS_FALLBACK_SLIPPAGE = '1.0';

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

describe('MEV Protection Functions - Unit Tests', () => {
  let swapService: SwapService;

  beforeEach(() => {
    // Clear all timers before each test
    jest.clearAllTimers();
    
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSwapWithMEVProtection', () => {
    const validSwapRequest: SwapRequest = {
      fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
      toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      amount: '1000000000000000000', // 1 ETH
      chainId: 1,
      userAddress: '0x1234567890123456789012345678901234567890',
      slippage: 0.5,
      useMEVProtection: true
    };

    it('should create MEV-protected swap successfully', async () => {
      // Mock successful swap API response
      const mockSwapResponse = {
        status: 200,
        data: {
          tx: { 
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            gasPrice: '20000000000'
          },
          swapId: 'swap_1234567890_xyz789'
        }
      };

      const axios = require('axios');
      axios.post.mockResolvedValueOnce(mockSwapResponse);

      const result = await swapService.createSwap(validSwapRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.swapId).toMatch(/^swap_\d+_[a-z0-9]+$/);
      expect(result.data!.status).toBe(SwapStatus.PENDING);
      expect(result.data!.txHash).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    });

    it('should handle MEV protection configuration correctly', async () => {
      const swapWithCustomMEVConfig: SwapRequest = {
        ...validSwapRequest,
        useMEVProtection: true,
        slippage: 1.0, // Higher slippage for MEV protection
        deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
      };

      const mockSwapResponse = {
        status: 200,
        data: {
          tx: { 
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            gasPrice: '25000000000'
          },
          swapId: 'swap_1234567890_abc123'
        }
      };

      const axios = require('axios');
      axios.post.mockResolvedValueOnce(mockSwapResponse);

      const result = await swapService.createSwap(swapWithCustomMEVConfig);

      expect(result.success).toBe(true);
      expect(result.data!.slippage).toBe(1.0);
      expect(result.data!.deadline).toBe(swapWithCustomMEVConfig.deadline);
    });

    it('should handle Flashbots bundle creation failure', async () => {
      const mockSwapResponse = {
        status: 200,
        data: {
          tx: { 
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
          }
        }
      };

      const axios = require('axios');
      axios.post.mockResolvedValueOnce(mockSwapResponse);

      // Mock bundle creation to fail
      jest.spyOn(swapService as any, 'createFlashbotsBundleWithRetry')
        .mockResolvedValueOnce({
          success: false,
          error: 'Bundle creation failed'
        });

      const result = await swapService.createSwap(validSwapRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('MEV protection failed');
    });

    it('should use fallback when Flashbots bundle fails and fallback is enabled', async () => {
      const mockSwapResponse = {
        status: 200,
        data: {
          tx: { 
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
          }
        }
      };

      const mockFallbackResponse = {
        status: 200,
        data: {
          tx: { 
            hash: '0xfallback1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            gasPrice: '25000000000'
          }
        }
      };

      const axios = require('axios');
      axios.post
        .mockResolvedValueOnce(mockSwapResponse) // Initial swap
        .mockResolvedValueOnce(mockFallbackResponse); // Fallback swap

      // Mock bundle creation to fail
      jest.spyOn(swapService as any, 'createFlashbotsBundleWithRetry')
        .mockResolvedValueOnce({
          success: false,
          error: 'Bundle creation failed'
        });

      const result = await swapService.createSwap(validSwapRequest);

      expect(result.success).toBe(true);
      expect(result.data!.fallbackUsed).toBe(true);
      expect(result.data!.fallbackReason).toBe('Bundle creation failed');
    });
  });

  describe('createFallbackSwap', () => {
    const validSwapRequest: SwapRequest = {
      fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
      toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      amount: '1000000000000000000',
      chainId: 1,
      userAddress: '0x1234567890123456789012345678901234567890',
      slippage: 0.5
    };

    it('should create fallback swap with adjusted parameters', async () => {
      const mockQuoteData = {
        toTokenAmount: '1800000000000000000',
        estimatedGas: '210000'
      };

      const mockFallbackResponse = {
        status: 200,
        data: {
          tx: { 
            hash: '0xfallback1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            gasPrice: '25000000000'
          }
        }
      };

      const axios = require('axios');
      axios.post.mockResolvedValueOnce(mockFallbackResponse);

      const result = await (swapService as any).createFallbackSwap(
        validSwapRequest,
        mockQuoteData,
        'Bundle creation failed'
      );

      expect(result.success).toBe(true);
      expect(result.data!.fallbackUsed).toBe(true);
      expect(result.data!.fallbackReason).toBe('Bundle creation failed');
      expect(result.data!.slippage).toBe(1.0); // Should use fallback slippage
    });

    it('should handle fallback swap creation failure', async () => {
      const mockQuoteData = {
        toTokenAmount: '1800000000000000000',
        estimatedGas: '210000'
      };

      const axios = require('axios');
      axios.post.mockRejectedValueOnce(new Error('Fallback API error'));

      const result = await (swapService as any).createFallbackSwap(
        validSwapRequest,
        mockQuoteData,
        'Bundle creation failed'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Fallback failed');
    });
  });

  describe('createFlashbotsBundleWithRetry', () => {
    const validTransactions = [
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    ];

    const validMEVConfig: MEVProtectionConfig = {
      useFlashbots: true,
      targetBlock: Math.floor(Date.now() / 1000) + 120,
      maxRetries: 3,
      retryDelay: 1000,
      enableFallback: true,
      fallbackGasPrice: '25000000000',
      fallbackSlippage: 1.0
    };

    it('should create bundle successfully on first attempt', async () => {
      const result = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.bundleId).toMatch(/^bundle_\d+_[a-z0-9]+$/);
      expect(result.data!.status).toBe(BundleStatus.SUBMITTED);
      expect(result.data!.submissionAttempts).toBe(1);
    });

    it('should retry bundle creation on failure', async () => {
      // Mock bundle creation to fail twice, then succeed
      const mockCreateBundle = jest.spyOn(swapService as any, 'createFlashbotsBundle')
        .mockResolvedValueOnce({
          success: false,
          error: 'First attempt failed'
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Second attempt failed'
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            bundleId: 'bundle_1234567890_retry_success',
            bundleHash: '0xretry1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            targetBlock: validMEVConfig.targetBlock,
            status: BundleStatus.SUBMITTED,
            transactions: validTransactions.map(tx => ({ transaction: tx, canRevert: false })),
            gasEstimate: '210000',
            gasPrice: '20000000000',
            totalValue: '0',
            timestamp: Date.now(),
            userAddress: '0x1234567890123456789012345678901234567890',
            submissionAttempts: 3,
            lastSubmissionAttempt: Date.now()
          }
        });

      const result = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );

      expect(result.success).toBe(true);
      expect(result.data!.bundleId).toBe('bundle_1234567890_retry_success');
      expect(result.data!.submissionAttempts).toBe(3);
      expect(mockCreateBundle).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries exceeded', async () => {
      // Mock bundle creation to always fail
      jest.spyOn(swapService as any, 'createFlashbotsBundle')
        .mockResolvedValue({
          success: false,
          error: 'Bundle creation failed'
        });

      const result = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bundle creation failed');
    });

    it('should handle different retry configurations', async () => {
      const customRetryConfig: MEVProtectionConfig = {
        ...validMEVConfig,
        maxRetries: 5,
        retryDelay: 2000
      };

      // Mock bundle creation to fail once, then succeed
      jest.spyOn(swapService as any, 'createFlashbotsBundle')
        .mockResolvedValueOnce({
          success: false,
          error: 'First attempt failed'
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            bundleId: 'bundle_1234567890_custom_retry',
            bundleHash: '0xcustom1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            targetBlock: customRetryConfig.targetBlock,
            status: BundleStatus.SUBMITTED,
            transactions: validTransactions.map(tx => ({ transaction: tx, canRevert: false })),
            gasEstimate: '210000',
            gasPrice: '20000000000',
            totalValue: '0',
            timestamp: Date.now(),
            userAddress: '0x1234567890123456789012345678901234567890',
            submissionAttempts: 2,
            lastSubmissionAttempt: Date.now()
          }
        });

      const result = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        '0x1234567890123456789012345678901234567890',
        customRetryConfig
      );

      expect(result.success).toBe(true);
      expect(result.data!.submissionAttempts).toBe(2);
    });
  });

  describe('retryBundle', () => {
    const originalBundleId = 'bundle_1234567890_original';
    const userAddress = '0x1234567890123456789012345678901234567890';

    it('should retry existing bundle successfully', async () => {
      // First create a bundle
      const validTransactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const createResult = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        userAddress,
        validMEVConfig
      );

      expect(createResult.success).toBe(true);
      const originalBundle = createResult.data;

      // Now retry the bundle
      const retryResult = await swapService.retryBundle(
        originalBundle.bundleId,
        userAddress
      );

      expect(retryResult.success).toBe(true);
      expect(retryResult.data!.bundleId).not.toBe(originalBundle.bundleId);
      expect(retryResult.data!.status).toBe(BundleStatus.SUBMITTED);
      expect(retryResult.data!.submissionAttempts).toBe(1);
    });

    it('should handle non-existent bundle retry', async () => {
      const result = await swapService.retryBundle(
        'non_existent_bundle_id',
        userAddress
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bundle not found');
    });

    it('should handle unauthorized bundle retry', async () => {
      // First create a bundle
      const validTransactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const createResult = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        userAddress,
        validMEVConfig
      );

      expect(createResult.success).toBe(true);

      // Try to retry with different user
      const result = await swapService.retryBundle(
        createResult.data!.bundleId,
        '0xDifferentUserAddress123456789012345678901234567890'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized to retry this bundle');
    });

    it('should retry with updated configuration', async () => {
      // First create a bundle
      const validTransactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const originalConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const createResult = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        userAddress,
        originalConfig
      );

      expect(createResult.success).toBe(true);

      // Retry with updated configuration
      const updatedConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 240, // Different target block
        maxRetries: 5,
        retryDelay: 2000
      };

      const retryResult = await swapService.retryBundle(
        createResult.data!.bundleId,
        userAddress,
        updatedConfig
      );

      expect(retryResult.success).toBe(true);
      expect(retryResult.data!.targetBlock).toBe(updatedConfig.targetBlock);
    });
  });

  describe('simulateBundle', () => {
    const validBundleRequest: FlashbotsBundleRequest = {
      transactions: [
        { transaction: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', canRevert: false }
      ],
      targetBlock: 12345678
    };

    it('should simulate bundle successfully', async () => {
      const result = await swapService.simulateBundle(validBundleRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.gasUsed).toBe('210000');
      expect(result.data!.blockNumber).toBe(validBundleRequest.targetBlock);
      expect(result.data!.mevGasPrice).toBe('20000000000');
    });

    it('should handle empty transactions array', async () => {
      const emptyBundleRequest: FlashbotsBundleRequest = {
        ...validBundleRequest,
        transactions: []
      };

      const result = await swapService.simulateBundle(emptyBundleRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No transactions provided for simulation');
    });

    it('should handle simulation with custom parameters', async () => {
      const customBundleRequest: FlashbotsBundleRequest = {
        transactions: [
          { transaction: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', canRevert: false },
          { transaction: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', canRevert: true }
        ],
        targetBlock: 99999999,
        maxBlockNumber: 100000000,
        minTimestamp: Math.floor(Date.now() / 1000),
        maxTimestamp: Math.floor(Date.now() / 1000) + 3600,
        refundRecipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        refundPercent: 90
      };

      const result = await swapService.simulateBundle(customBundleRequest);

      expect(result.success).toBe(true);
      expect(result.data!.blockNumber).toBe(customBundleRequest.targetBlock);
    });
  });

  describe('submitBundle', () => {
    const validBundleRequest: FlashbotsBundleRequest = {
      transactions: [
        { transaction: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', canRevert: false }
      ],
      targetBlock: 12345678,
      refundRecipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      refundPercent: 90
    };

    it('should submit bundle successfully', async () => {
      const result = await swapService.submitBundle(
        validBundleRequest,
        '0x1234567890123456789012345678901234567890'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.bundleId).toMatch(/^bundle_\d+_[a-z0-9]+$/);
      expect(result.data!.bundleHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(result.data!.targetBlock).toBe(validBundleRequest.targetBlock);
      expect(result.data!.status).toBe(BundleStatus.SUBMITTED);
    });

    it('should handle empty transactions', async () => {
      const emptyBundleRequest: FlashbotsBundleRequest = {
        ...validBundleRequest,
        transactions: []
      };

      const result = await swapService.submitBundle(
        emptyBundleRequest,
        '0x1234567890123456789012345678901234567890'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('No transactions provided for simulation');
    });

    it('should handle bundle submission with custom configuration', async () => {
      const customBundleRequest: FlashbotsBundleRequest = {
        transactions: [
          { transaction: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', canRevert: false }
        ],
        targetBlock: 99999999,
        maxBlockNumber: 100000000,
        minTimestamp: Math.floor(Date.now() / 1000),
        maxTimestamp: Math.floor(Date.now() / 1000) + 3600,
        revertingTxHashes: ['0xrevert1234567890abcdef1234567890abcdef1234567890abcdef1234567890'],
        refundRecipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        refundPercent: 95
      };

      const result = await swapService.submitBundle(
        customBundleRequest,
        '0x1234567890123456789012345678901234567890'
      );

      expect(result.success).toBe(true);
      expect(result.data!.targetBlock).toBe(customBundleRequest.targetBlock);
      expect(result.data!.refundRecipient).toBe(customBundleRequest.refundRecipient);
      expect(result.data!.refundPercent).toBe(customBundleRequest.refundPercent);
    });
  });

  describe('estimateBundleGas', () => {
    const validGasRequest: GasEstimateRequest = {
      transactions: [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      ]
    };

    it('should estimate gas successfully', async () => {
      const result = await swapService.estimateBundleGas(validGasRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.gasUsed).toBe('210000');
      expect(result.data!.gasPrice).toBe('20000000000');
      expect(result.data!.totalCost).toBe('4200000000000000');
      expect(result.data!.estimatedProfit).toBe('0');
    });

    it('should handle gas estimation with empty transactions', async () => {
      const emptyGasRequest: GasEstimateRequest = {
        transactions: []
      };

      const result = await swapService.estimateBundleGas(emptyGasRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No transactions provided for gas estimation');
    });

    it('should handle gas estimation with single transaction', async () => {
      const singleGasRequest: GasEstimateRequest = {
        transactions: [
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        ]
      };

      const result = await swapService.estimateBundleGas(singleGasRequest);

      expect(result.success).toBe(true);
      expect(result.data!.gasUsed).toBe('210000');
      expect(result.data!.totalCost).toBe('4200000000000000');
    });
  });

  describe('getBundleStatus', () => {
    it('should get bundle status successfully', async () => {
      // First create a bundle
      const validTransactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const createResult = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );

      expect(createResult.success).toBe(true);
      const bundleId = createResult.data!.bundleId;

      // Then get its status
      const statusResult = await swapService.getBundleStatus(
        bundleId,
        '0x1234567890123456789012345678901234567890'
      );

      expect(statusResult.success).toBe(true);
      expect(statusResult.data).toBeDefined();
      expect(statusResult.data!.bundleId).toBe(bundleId);
      expect(statusResult.data!.status).toBe(BundleStatus.SUBMITTED);
    });

    it('should handle non-existent bundle status', async () => {
      const result = await swapService.getBundleStatus(
        'non_existent_bundle_id',
        '0x1234567890123456789012345678901234567890'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bundle not found');
    });

    it('should handle unauthorized bundle status check', async () => {
      // First create a bundle
      const validTransactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const createResult = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );

      expect(createResult.success).toBe(true);

      // Try to get status with different user
      const result = await swapService.getBundleStatus(
        createResult.data!.bundleId,
        '0xDifferentUserAddress123456789012345678901234567890'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized to check this bundle');
    });
  });

  describe('getBundleHistory', () => {
    it('should get bundle history for user', async () => {
      const result = await swapService.getBundleHistory(
        '0x1234567890123456789012345678901234567890',
        10,
        1
      );

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty history for user with no bundles', async () => {
      const result = await swapService.getBundleHistory(
        '0xUserWithNoBundles',
        10,
        1
      );

      expect(result).toEqual([]);
    });

    it('should handle pagination correctly', async () => {
      // Create multiple bundles first
      const validTransactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const userAddress = '0x1234567890123456789012345678901234567890';

      // Create 3 bundles
      for (let i = 0; i < 3; i++) {
        await (swapService as any).createFlashbotsBundleWithRetry(
          validTransactions,
          userAddress,
          validMEVConfig
        );
      }

      // Get first page with 2 items
      const firstPage = await swapService.getBundleHistory(userAddress, 2, 1);
      expect(firstPage).toHaveLength(2);

      // Get second page with 2 items
      const secondPage = await swapService.getBundleHistory(userAddress, 2, 2);
      expect(secondPage).toHaveLength(1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(new Error('Network Error'));

      const validSwapRequest: SwapRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890',
        slippage: 0.5,
        useMEVProtection: true
      };

      const result = await swapService.createSwap(validSwapRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network Error');
    });

    it('should handle timeout errors', async () => {
      const axios = require('axios');
      axios.post.mockRejectedValueOnce(new Error('Request timeout'));

      const validTransactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const result = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Request timeout');
    });

    it('should handle invalid transaction formats', async () => {
      const invalidTransactions = [
        'invalid_transaction_format',
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const result = await (swapService as any).createFlashbotsBundleWithRetry(
        invalidTransactions,
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Transaction 1 must be a valid hex string');
    });

    it('should handle empty transaction arrays', async () => {
      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const result = await (swapService as any).createFlashbotsBundleWithRetry(
        [],
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one transaction is required');
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent bundle creations', async () => {
      const validTransactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const promises = Array(5).fill(null).map(() =>
        (swapService as any).createFlashbotsBundleWithRetry(
          validTransactions,
          '0x1234567890123456789012345678901234567890',
          validMEVConfig
        )
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.bundleId).toMatch(/^bundle_\d+_[a-z0-9]+$/);
      });
    });

    it('should handle large transaction arrays efficiently', async () => {
      const largeTransactionArray = Array(10).fill('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120
      };

      const startTime = Date.now();
      const result = await (swapService as any).createFlashbotsBundleWithRetry(
        largeTransactionArray,
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data!.transactions).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle rapid retry attempts', async () => {
      const validTransactions = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      ];

      const validMEVConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120,
        maxRetries: 3,
        retryDelay: 100 // Short delay for testing
      };

      // Mock bundle creation to fail twice, then succeed
      jest.spyOn(swapService as any, 'createFlashbotsBundle')
        .mockResolvedValueOnce({
          success: false,
          error: 'First attempt failed'
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Second attempt failed'
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            bundleId: 'bundle_1234567890_rapid_retry',
            bundleHash: '0xrapid1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            targetBlock: validMEVConfig.targetBlock,
            status: BundleStatus.SUBMITTED,
            transactions: validTransactions.map(tx => ({ transaction: tx, canRevert: false })),
            gasEstimate: '210000',
            gasPrice: '20000000000',
            totalValue: '0',
            timestamp: Date.now(),
            userAddress: '0x1234567890123456789012345678901234567890',
            submissionAttempts: 3,
            lastSubmissionAttempt: Date.now()
          }
        });

      const startTime = Date.now();
      const result = await (swapService as any).createFlashbotsBundleWithRetry(
        validTransactions,
        '0x1234567890123456789012345678901234567890',
        validMEVConfig
      );
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data!.submissionAttempts).toBe(3);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });
}); 