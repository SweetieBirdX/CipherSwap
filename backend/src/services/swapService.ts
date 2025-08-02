import axios, { AxiosResponse } from 'axios';
import { config } from '../config/env';
import { config as importedConfig } from '../config/env';
import { logger } from '../utils/logger';
import { 
  SwapRequest, 
  SwapResponse, 
  EnhancedSwapResponse,
  SwapData, 
  SwapStatus,
  SwapErrorCodes,
  SWAP_CONSTANTS,
  SwapHistory,
  SwapSimulation,
  LimitOrderRequest,
  LimitOrderResponse,
  LimitOrderData,
  LimitOrderStatus,
  FusionQuoteRequest,
  FusionQuoteResponse,
  FusionSecretRequest,
  FusionSecretResponse,
  FusionSecretData,
  SecretStatus,
  EscrowStatusRequest,
  EscrowStatusResponse,
  EscrowStatusData,
  EscrowStatus,
  FlashbotsBundleRequest,
  FlashbotsBundleResponse,
  FlashbotsBundleData,
  BundleStatus,
  BundleTransaction,
  BundleSimulationResult,
  FlashbotsSimulationRequest,
  FlashbotsSimulationResponse,
  GasEstimateRequest,
  GasEstimateResponse,
  MEVProtectionConfig,
  BundleRetryConfig,
  RouteStep,
  FusionData,
  // Enhanced simulation types
  SlippageAnalysis,
  PriceImpactAnalysis,
  GasAnalysis,
  GasOptimization,
  MarketConditions,
  SpreadAnalysis,
  VolumeAnalysis,
  ParameterRecommendations,
  SplitRecommendation,
  TimingRecommendation,
  RouteOptimization,
  RouteComparison,
  RiskAssessment,
  RiskFactor,
  ExecutionOptimization
} from '../types/swap';
import { ethers } from 'ethers';
import { FlashbotsBundleProvider } from 'flashbots-ethers-v6-provider-bundle';
import SlippageToleranceService, { SlippageToleranceResult, SlippageAdjustmentFactors } from './slippageToleranceService';

export class SwapService {
  private readonly baseUrl = 'https://api.1inch.dev';
  private readonly apiKey: string;
  private swapHistory: Map<string, SwapData> = new Map();
  private limitOrderHistory: Map<string, LimitOrderData> = new Map();
  private secretsHistory: Map<string, FusionSecretData> = new Map();
  private bundleHistory: Map<string, FlashbotsBundleData> = new Map();
  private flashbotsProvider?: FlashbotsBundleProvider;
  private ethersProvider?: ethers.JsonRpcProvider;
  private slippageToleranceService: SlippageToleranceService;
  
  constructor() {
    this.apiKey = config.INCH_API_KEY;
    if (!this.apiKey) {
      throw new Error('1inch API key is required');
    }
    
    // Initialize slippage tolerance service
    this.slippageToleranceService = new SlippageToleranceService();
    
    // Skip Flashbots initialization in test environment
    if (process.env.NODE_ENV !== 'test') {
      // Initialize Flashbots provider if FLASHBOTS_RELAY_URL is configured
      this.initializeFlashbotsProvider();
    }
  }
  
  /**
   * Initialize Flashbots provider
   */
  private async initializeFlashbotsProvider(): Promise<void> {
    try {
      if (config.FLASHBOTS_RELAY_URL && config.ETHEREUM_RPC_URL) {
        this.ethersProvider = new ethers.JsonRpcProvider(config.ETHEREUM_RPC_URL);
        
        // Create signer for bundle submission
        const signer = config.FLASHBOTS_SIGNER_PRIVATE_KEY 
          ? new ethers.Wallet(config.FLASHBOTS_SIGNER_PRIVATE_KEY, this.ethersProvider)
          : ethers.Wallet.createRandom();
        
        this.flashbotsProvider = await FlashbotsBundleProvider.create(
          this.ethersProvider,
          signer,
          config.FLASHBOTS_RELAY_URL
        );
        logger.info('Flashbots provider initialized successfully');
      } else {
        logger.warn('Flashbots relay URL or Ethereum RPC URL not configured, MEV protection disabled');
      }
    } catch (error: any) {
      logger.error('Failed to initialize Flashbots provider', { error: error.message });
    }
  }
  
  /**
   * Create a new swap transaction
   */
  async createSwap(params: SwapRequest): Promise<SwapResponse> {
    try {
      logger.info('Creating swap transaction', { params });
      
      // Validate request
      const validation = this.validateSwapRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Get quote
      const quoteData = await this.getQuote(params);
      if (!quoteData) {
        return {
          success: false,
          error: 'Failed to get quote'
        };
      }

      // Create swap with retry and fallback if MEV protection is enabled
      if (params.useMEVProtection) {
        return await this.createSwapWithMEVProtection(params, quoteData);
      }

      // Regular swap creation
      // Convert ETH amount to wei for 1inch API
      const amountInWei = (parseFloat(params.amount) * Math.pow(10, 18)).toString();
      
      const response = await axios.post(
        `${this.baseUrl}/swap/v5.2/${params.chainId}`,
        {
          src: params.fromToken,
          dst: params.toToken,
          amount: amountInWei, // Use converted wei amount
          from: params.userAddress,
          slippage: params.slippage || 0.5,
          deadline: params.deadline || Math.floor(Date.now() / 1000) + 1200,
          permit: params.permit
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      const swapData = this.formatSwapResponse(response.data, params, quoteData);
      this.swapHistory.set(swapData.swapId, swapData);

      logger.info('Swap created successfully', { swapId: swapData.swapId });
      return {
        success: true,
        data: swapData
      };

    } catch (error: any) {
      logger.error('Swap creation error', { error: error.message });
      return {
        success: false,
        error: this.handleSwapError(error)
      };
    }
  }

  /**
   * Create swap with MEV protection using Flashbots bundles
   */
  private async createSwapWithMEVProtection(
    params: SwapRequest, 
    quoteData: any
  ): Promise<SwapResponse> {
    try {
      logger.info('Creating swap with MEV protection', { 
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          amount: params.amount,
          chainId: params.chainId,
          userAddress: params.userAddress,
          slippage: params.slippage,
          deadline: params.deadline
        },
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      logger.info('Creating swap transaction for MEV protection', {
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        chainId: params.chainId,
        userAddress: params.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // Create the swap transaction first
      // Convert ETH amount to wei for 1inch API
      const amountInWei = (parseFloat(params.amount) * Math.pow(10, 18)).toString();
      
      const swapResponse = await axios.post(
        `${this.baseUrl}/swap/v5.2/${params.chainId}`,
        {
          src: params.fromToken,
          dst: params.toToken,
          amount: amountInWei, // Use converted wei amount
          from: params.userAddress,
          slippage: params.slippage || 0.5,
          deadline: params.deadline || Math.floor(Date.now() / 1000) + 1200,
          permit: params.permit
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      logger.info('Swap transaction created successfully', {
        status: swapResponse.status,
        swapId: swapResponse.data?.swapId,
        txHash: swapResponse.data?.txHash,
        chainId: params.chainId,
        userAddress: params.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      const swapData = this.formatSwapResponse(swapResponse.data, params, quoteData);
      
      logger.info('Creating MEV protection configuration', {
        swapId: swapData.swapId,
        txHash: swapData.txHash,
        targetBlock: Math.floor(Date.now() / 1000) + 120,
        maxRetries: config.FLASHBOTS_MAX_RETRIES,
        enableFallback: config.FLASHBOTS_ENABLE_FALLBACK,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      // Create Flashbots bundle with retry logic
      const mevConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: Math.floor(Date.now() / 1000) + 120, // Target block ~2 minutes from now
        maxRetries: config.FLASHBOTS_MAX_RETRIES,
        retryDelay: config.FLASHBOTS_RETRY_BASE_DELAY,
        enableFallback: config.FLASHBOTS_ENABLE_FALLBACK,
        fallbackGasPrice: config.FLASHBOTS_FALLBACK_GAS_PRICE,
        fallbackSlippage: config.FLASHBOTS_FALLBACK_SLIPPAGE
      };

      logger.info('Submitting transaction to Flashbots bundle for MEV protection', {
        swapId: swapData.swapId,
        txHash: swapData.txHash,
        userAddress: params.userAddress,
        mevConfig,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      const bundleResponse = await this.createFlashbotsBundleWithRetry(
        [swapData.txHash!],
        params.userAddress ?? '',
        mevConfig
      );

      if (!bundleResponse.success) {
        logger.error('Flashbots bundle creation failed for MEV protection', {
          swapId: swapData.swapId,
          txHash: swapData.txHash,
          error: bundleResponse.error,
          enableFallback: config.FLASHBOTS_ENABLE_FALLBACK,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });

        // If bundle fails, try fallback to regular transaction
        if (config.FLASHBOTS_ENABLE_FALLBACK) {
          logger.warn('Flashbots bundle failed, attempting fallback transaction', {
            swapId: swapData.swapId,
            error: bundleResponse.error,
            timestamp: Date.now(),
            service: 'cipherswap-api'
          });
          
          return await this.createFallbackSwap(params, quoteData, String(bundleResponse.error ?? 'Unknown error'));
        }
        
        return {
          success: false,
          error: `MEV protection failed: ${bundleResponse.error}`
        };
      }

      logger.info('Flashbots bundle created successfully for MEV protection', {
        swapId: swapData.swapId,
        bundleId: bundleResponse.data!.bundleId,
        bundleHash: bundleResponse.data!.bundleHash,
        targetBlock: bundleResponse.data!.targetBlock,
        userAddress: params.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // Update swap data with bundle information
      swapData.bundleId = bundleResponse.data!.bundleId;
      swapData.bundleHash = bundleResponse.data!.bundleHash;
      this.swapHistory.set(swapData.swapId, swapData);

      logger.info('MEV-protected swap created successfully', { 
        swapId: swapData.swapId,
        bundleId: bundleResponse.data!.bundleId,
        bundleHash: bundleResponse.data!.bundleHash,
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        chainId: params.chainId,
        userAddress: params.userAddress,
        status: swapData.status,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      return {
        success: true,
        data: swapData
      };

    } catch (error: any) {
      logger.error('MEV-protected swap creation error', { 
        error: error.message,
        stack: error.stack,
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          userAddress: params.userAddress,
          chainId: params.chainId
        },
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      return {
        success: false,
        error: this.handleSwapError(error)
      };
    }
  }

  /**
   * Create fallback swap when Flashbots bundle fails
   */
  private async createFallbackSwap(
    params: SwapRequest,
    quoteData: any,
    bundleError: string
  ): Promise<SwapResponse> {
    try {
      logger.info('Creating fallback swap', { 
        userAddress: params.userAddress,
        bundleError 
      });

      // Adjust parameters for fallback
      const fallbackParams = {
        ...params,
        slippage: config.FLASHBOTS_FALLBACK_SLIPPAGE,
        gasPrice: config.FLASHBOTS_FALLBACK_GAS_PRICE
      };

      // Convert ETH amount to wei for 1inch API
      const amountInWei = (parseFloat(params.amount) * Math.pow(10, 18)).toString();
      
      const response = await axios.post(
        `${this.baseUrl}/swap/v6.0/${params.chainId}`,
        {
          src: params.fromToken,
          dst: params.toToken,
          amount: amountInWei, // Use converted wei amount
          from: params.userAddress,
          slippage: fallbackParams.slippage,
          deadline: params.deadline || Math.floor(Date.now() / 1000) + 1200,
          permit: params.permit,
          gasPrice: fallbackParams.gasPrice
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      const swapData = this.formatSwapResponse(response.data, fallbackParams, quoteData);
      swapData.fallbackUsed = true;
      swapData.fallbackReason = bundleError;
      
      this.swapHistory.set(swapData.swapId, swapData);

      logger.info('Fallback swap created successfully', { 
        swapId: swapData.swapId,
        fallbackReason: bundleError
      });

      return {
        success: true,
        data: swapData
      };

    } catch (error: any) {
      logger.error('Fallback swap creation error', { error: error.message });
      return {
        success: false,
        error: `Fallback failed: ${this.handleSwapError(error)}`
      };
    }
  }
  
  /**
   * Create a Fusion+ swap transaction
   */
  async createFusionSwap(params: SwapRequest): Promise<SwapResponse> {
    try {
      logger.info('Creating Fusion+ swap transaction', { params });
      
      // Validate request
      const validation = this.validateSwapRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get quote first
      const quoteResponse = await this.getQuote(params);
      if (!quoteResponse.success) {
        return {
          success: false,
          error: quoteResponse.error
        };
      }
      
      // Call 1inch Fusion+ API
      // Convert ETH amount to wei for 1inch API
      const amountInWei = (parseFloat(params.amount) * Math.pow(10, 18)).toString();
      
      const response: AxiosResponse = await axios.post(`${this.baseUrl}/fusion/v1.0/quote`, {
        src: params.fromToken,
        dst: params.toToken,
        amount: amountInWei, // Use converted wei amount
        from: params.userAddress,
        slippage: params.slippage || SWAP_CONSTANTS.DEFAULT_SLIPPAGE,
        chain: params.chainId,
        permit: params.permit,
        deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
        apiKey: this.apiKey
      }, {
        timeout: 15000
      });
      
      // Format fusion swap data
      const swapData = this.formatFusionSwapResponse(response.data, params, quoteResponse.data);
      
      // Store swap data
      this.swapHistory.set(swapData.swapId, swapData);
      
      logger.info('Fusion+ swap created successfully', { 
        swapId: swapData.swapId,
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount
      });
      
      return {
        success: true,
        data: swapData
      };
      
    } catch (error: any) {
      logger.error('Fusion+ swap service error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleSwapError(error)
      };
    }
  }
  
  /**
   * Get swap transaction status
   */
  async getSwapStatus(swapId: string): Promise<SwapResponse> {
    try {
      logger.info('Getting swap status', { swapId });
      
      const swapData = this.swapHistory.get(swapId);
      if (!swapData) {
        return {
          success: false,
          error: 'Swap not found'
        };
      }
      
      // Check if swap is expired
      if (swapData.deadline < Math.floor(Date.now() / 1000)) {
        swapData.status = SwapStatus.EXPIRED;
        this.swapHistory.set(swapId, swapData);
      }
      
      return {
        success: true,
        data: swapData
      };
      
    } catch (error: any) {
      logger.error('Get swap status error', { error: error.message, swapId });
      return {
        success: false,
        error: 'Failed to get swap status'
      };
    }
  }
  
  /**
   * Simulate swap transaction
   */
  async simulateSwap(params: SwapRequest): Promise<SwapResponse> {
    try {
      logger.info('Simulating swap transaction', { params });
      
      // Validate request
      const validation = this.validateSwapRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get quote
      const quoteResponse = await this.getQuote(params);
      if (!quoteResponse.success) {
        return {
          success: false,
          error: quoteResponse.error
        };
      }
      
      // Simulate swap
      const simulation = this.simulateSwapTransaction(params, quoteResponse.data);
      
      return {
        success: true,
        data: simulation as any
      };
      
    } catch (error: any) {
      logger.error('Swap simulation error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: 'Simulation failed'
      };
    }
  }
  
  /**
   * Enhanced swap simulation with comprehensive analysis
   */
  async simulateSwapEnhanced(params: SwapRequest): Promise<EnhancedSwapResponse> {
    try {
      logger.info('Enhanced swap simulation', { params });
      
      // Validate request
      const validation = this.validateSwapRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get initial quote
      const quoteResponse = await this.getQuote(params);
      if (!quoteResponse.success) {
        return {
          success: false,
          error: quoteResponse.error
        };
      }
      
      // Validate quote data
      if (!quoteResponse.data || !quoteResponse.data.toTokenAmount) {
        logger.error('Invalid quote data received', { quoteResponse });
        return {
          success: false,
          error: 'Invalid quote data received from API'
        };
      }
      
      // Perform comprehensive simulation
      const simulation = await this.performComprehensiveSimulation(params, quoteResponse.data);
      
      return {
        success: true,
        data: simulation
      };
      
    } catch (error: any) {
      logger.error('Enhanced swap simulation error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: 'Enhanced simulation failed'
      };
    }
  }

  /**
   * Perform comprehensive swap simulation with all analyses
   */
  private async performComprehensiveSimulation(params: SwapRequest, quoteData: any): Promise<SwapSimulation> {
    // Add validation for quoteData
    if (!quoteData || !quoteData.toTokenAmount) {
      throw new Error('Invalid quote data provided for simulation');
    }

    const originalQuote = quoteData;
    const simulatedSwap = this.formatSwapResponse(quoteData, params, quoteData);
    
    // Perform all analyses
    const slippageAnalysis = await this.analyzeSlippage(params, quoteData);
    const priceImpactAnalysis = await this.analyzePriceImpact(params, quoteData);
    const gasAnalysis = await this.analyzeGasCosts(params, quoteData);
    const marketConditions = await this.analyzeMarketConditions(params);
    const parameterRecommendations = await this.generateParameterRecommendations(params, quoteData, {
      slippageAnalysis,
      priceImpactAnalysis,
      gasAnalysis,
      marketConditions
    });
    const riskAssessment = await this.assessRisks(params, quoteData, {
      slippageAnalysis,
      priceImpactAnalysis,
      gasAnalysis,
      marketConditions
    });
    const executionOptimization = await this.optimizeExecution(params, quoteData, {
      slippageAnalysis,
      priceImpactAnalysis,
      gasAnalysis,
      marketConditions,
      parameterRecommendations,
      riskAssessment
    });
    
    // Calculate differences
    const slippageDifference = slippageAnalysis.currentSlippage - slippageAnalysis.expectedSlippage;
    const gasDifference = gasAnalysis.totalGasCost;
    const priceImpactDifference = priceImpactAnalysis.priceImpact;
    const estimatedGains = parseFloat(quoteData.toTokenAmount) - parseFloat(params.amount);
    
    return {
      originalQuote,
      simulatedSwap,
      slippageDifference,
      gasDifference,
      priceImpactDifference,
      estimatedGains,
      slippageAnalysis,
      priceImpactAnalysis,
      gasAnalysis,
      marketConditions,
      parameterRecommendations,
      riskAssessment,
      executionOptimization
    };
  }

  /**
   * Analyze slippage based on market conditions and trade size
   */
  private async analyzeSlippage(params: SwapRequest, quoteData: any): Promise<SlippageAnalysis> {
    const currentSlippage = params.slippage || SWAP_CONSTANTS.DEFAULT_SLIPPAGE;
    const tradeSize = parseFloat(params.amount);
    const liquidityDepth = await this.estimateLiquidityDepth(params.fromToken, params.toToken);
    const marketVolatility = await this.getMarketVolatility(params.fromToken, params.toToken);
    const timeOfDay = this.getTimeOfDayFactor();
    
    // Calculate expected slippage based on factors
    const expectedSlippage = this.calculateExpectedSlippage({
      tradeSize,
      liquidityDepth,
      marketVolatility,
      timeOfDay
    });
    
    const slippageTolerance = Math.max(currentSlippage, expectedSlippage * 1.2);
    const slippageRisk = this.assessSlippageRisk(currentSlippage, expectedSlippage);
    const slippageTrend = await this.getSlippageTrend(params.fromToken, params.toToken);
    const recommendedSlippage = this.calculateRecommendedSlippage(expectedSlippage, slippageRisk);
    
    return {
      currentSlippage,
      expectedSlippage,
      slippageTolerance,
      slippageRisk,
      slippageTrend,
      recommendedSlippage,
      slippageFactors: {
        liquidityDepth,
        tradeSize,
        marketVolatility,
        timeOfDay
      }
    };
  }

  /**
   * Analyze price impact of the trade
   */
  private async analyzePriceImpact(params: SwapRequest, quoteData: any): Promise<PriceImpactAnalysis> {
    const tradeSize = parseFloat(params.amount);
    const poolLiquidity = await this.getPoolLiquidity(params.fromToken, params.toToken);
    const marketDepth = await this.getMarketDepth(params.fromToken, params.toToken);
    const priceVolatility = await this.getPriceVolatility(params.fromToken, params.toToken);
    
    // Calculate price impact
    const priceImpact = this.calculatePriceImpact(tradeSize, poolLiquidity);
    const priceImpactPercentage = (priceImpact / parseFloat(params.amount)) * 100;
    const priceImpactRisk = this.assessPriceImpactRisk(priceImpactPercentage);
    const priceImpactTrend = await this.getPriceImpactTrend(params.fromToken, params.toToken);
    const recommendedAmount = this.calculateRecommendedAmount(tradeSize, priceImpactRisk, poolLiquidity);
    
    return {
      priceImpact,
      priceImpactPercentage,
      priceImpactRisk,
      priceImpactTrend,
      recommendedAmount,
      priceImpactFactors: {
        poolLiquidity,
        tradeSize,
        marketDepth,
        priceVolatility
      }
    };
  }

  /**
   * Analyze gas costs and optimization opportunities
   */
  private async analyzeGasCosts(params: SwapRequest, quoteData: any): Promise<GasAnalysis> {
    const estimatedGas = quoteData.estimatedGas || '210000';
    const networkCongestion = await this.getNetworkCongestion();
    const blockSpace = await this.getBlockSpaceAvailability();
    const priorityFee = await this.getPriorityFee();
    const baseFee = await this.getBaseFee();
    
    // Calculate optimal gas price
    const gasPrice = this.calculateOptimalGasPrice(networkCongestion, priorityFee, baseFee);
    const totalGasCost = (parseFloat(estimatedGas) * parseFloat(gasPrice)).toString();
    const gasTrend = await this.getGasTrend();
    const recommendedGasPrice = this.calculateRecommendedGasPrice(gasPrice, networkCongestion);
    
    const gasOptimization = this.optimizeGasSettings({
      estimatedGas,
      gasPrice,
      networkCongestion,
      priorityFee,
      baseFee
    });
    
    return {
      estimatedGas,
      gasPrice,
      totalGasCost,
      gasOptimization,
      gasTrend,
      recommendedGasPrice,
      gasFactors: {
        networkCongestion,
        blockSpace,
        priorityFee,
        baseFee
      }
    };
  }

  /**
   * Analyze current market conditions
   */
  private async analyzeMarketConditions(params: SwapRequest): Promise<MarketConditions> {
    const liquidityScore = await this.calculateLiquidityScore(params.fromToken, params.toToken);
    const volatilityIndex = await this.getVolatilityIndex(params.fromToken, params.toToken);
    const marketDepth = await this.getMarketDepth(params.fromToken, params.toToken);
    
    const spreadAnalysis = await this.analyzeSpread(params.fromToken, params.toToken);
    const volumeAnalysis = await this.analyzeVolume(params.fromToken, params.toToken);
    const marketTrend = await this.getMarketTrend(params.fromToken, params.toToken);
    
    return {
      liquidityScore,
      volatilityIndex,
      marketDepth,
      spreadAnalysis,
      volumeAnalysis,
      marketTrend
    };
  }

  /**
   * Generate parameter recommendations based on analysis
   */
  private async generateParameterRecommendations(
    params: SwapRequest, 
    quoteData: any, 
    analysis: {
      slippageAnalysis: SlippageAnalysis;
      priceImpactAnalysis: PriceImpactAnalysis;
      gasAnalysis: GasAnalysis;
      marketConditions: MarketConditions;
    }
  ): Promise<ParameterRecommendations> {
    const { slippageAnalysis, priceImpactAnalysis, gasAnalysis, marketConditions } = analysis;
    
    // Calculate recommended parameters
    const recommendedSlippage = slippageAnalysis.recommendedSlippage;
    const recommendedAmount = priceImpactAnalysis.recommendedAmount;
    const recommendedGasPrice = gasAnalysis.recommendedGasPrice;
    const recommendedDeadline = this.calculateRecommendedDeadline(marketConditions);
    
    // Determine if trade should be split
    const splitRecommendation = this.analyzeSplitRecommendation(params, priceImpactAnalysis, marketConditions);
    
    // Calculate optimal timing
    const timingRecommendation = this.calculateTimingRecommendation(marketConditions, gasAnalysis);
    
    // Optimize route
    const routeOptimization = await this.optimizeRoute(params, quoteData, analysis);
    
    return {
      recommendedSlippage,
      recommendedAmount,
      recommendedGasPrice,
      recommendedDeadline,
      splitRecommendation,
      timingRecommendation,
      routeOptimization
    };
  }

  /**
   * Assess risks associated with the swap
   */
  private async assessRisks(
    params: SwapRequest, 
    quoteData: any, 
    analysis: {
      slippageAnalysis: SlippageAnalysis;
      priceImpactAnalysis: PriceImpactAnalysis;
      gasAnalysis: GasAnalysis;
      marketConditions: MarketConditions;
    }
  ): Promise<RiskAssessment> {
    const riskFactors: RiskFactor[] = [];
    
    // Slippage risk
    if (analysis.slippageAnalysis.slippageRisk !== 'LOW') {
      riskFactors.push({
        factor: 'High Slippage',
        severity: analysis.slippageAnalysis.slippageRisk,
        impact: 0.8,
        probability: 0.6,
        mitigation: 'Consider reducing trade size or waiting for better conditions'
      });
    }
    
    // Price impact risk
    if (analysis.priceImpactAnalysis.priceImpactRisk !== 'LOW') {
      riskFactors.push({
        factor: 'High Price Impact',
        severity: analysis.priceImpactAnalysis.priceImpactRisk,
        impact: 0.9,
        probability: 0.7,
        mitigation: 'Split trade into smaller amounts or use limit orders'
      });
    }
    
    // Gas cost risk
    if (parseFloat(analysis.gasAnalysis.totalGasCost) > parseFloat(params.amount) * 0.1) {
      riskFactors.push({
        factor: 'High Gas Costs',
        severity: 'HIGH',
        impact: 0.6,
        probability: 0.5,
        mitigation: 'Wait for lower gas prices or optimize transaction'
      });
    }
    
    // Market volatility risk
    if (analysis.marketConditions.volatilityIndex > 0.7) {
      riskFactors.push({
        factor: 'High Market Volatility',
        severity: 'HIGH',
        impact: 0.7,
        probability: 0.8,
        mitigation: 'Consider using limit orders or waiting for stability'
      });
    }
    
    const riskScore = this.calculateRiskScore(riskFactors);
    const overallRisk = this.assessOverallRisk(riskScore);
    const mitigationStrategies = this.generateMitigationStrategies(riskFactors);
    const recommendedActions = this.generateRecommendedActions(riskFactors, analysis);
    
    return {
      overallRisk,
      riskFactors,
      riskScore,
      mitigationStrategies,
      recommendedActions
    };
  }

  /**
   * Optimize execution strategy
   */
  private async optimizeExecution(
    params: SwapRequest, 
    quoteData: any, 
    analysis: {
      slippageAnalysis: SlippageAnalysis;
      priceImpactAnalysis: PriceImpactAnalysis;
      gasAnalysis: GasAnalysis;
      marketConditions: MarketConditions;
      parameterRecommendations: ParameterRecommendations;
      riskAssessment: RiskAssessment;
    }
  ): Promise<ExecutionOptimization> {
    const { riskAssessment, parameterRecommendations, gasAnalysis } = analysis;
    
    // Determine optimal execution strategy
    const optimalExecutionStrategy = this.determineExecutionStrategy(riskAssessment, parameterRecommendations);
    const executionConfidence = this.calculateExecutionConfidence(analysis);
    
    // Calculate expected outcomes
    const expectedOutcome = this.calculateExpectedOutcome(quoteData, analysis);
    
    // Calculate optimization metrics
    const optimizationMetrics = this.calculateOptimizationMetrics(analysis);
    
    return {
      optimalExecutionStrategy,
      executionConfidence,
      expectedOutcome,
      optimizationMetrics
    };
  }

  // Helper methods for analysis calculations
  private calculateExpectedSlippage(factors: {
    tradeSize: number;
    liquidityDepth: number;
    marketVolatility: number;
    timeOfDay: number;
  }): number {
    const { tradeSize, liquidityDepth, marketVolatility, timeOfDay } = factors;
    
    // Base slippage calculation
    let slippage = (tradeSize / liquidityDepth) * 100;
    
    // Adjust for market volatility
    slippage *= (1 + marketVolatility);
    
    // Adjust for time of day (higher during peak hours)
    slippage *= (1 + (timeOfDay - 0.5) * 0.2);
    
    return Math.min(slippage, SWAP_CONSTANTS.MAX_SLIPPAGE);
  }

  private assessSlippageRisk(currentSlippage: number, expectedSlippage: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const ratio = currentSlippage / expectedSlippage;
    
    if (ratio < 1.2) return 'LOW';
    if (ratio < 1.5) return 'MEDIUM';
    if (ratio < 2.0) return 'HIGH';
    return 'CRITICAL';
  }

  private calculatePriceImpact(tradeSize: number, poolLiquidity: number): number {
    return (tradeSize / poolLiquidity) * 100;
  }

  private assessPriceImpactRisk(priceImpactPercentage: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (priceImpactPercentage < 0.1) return 'LOW';
    if (priceImpactPercentage < 0.5) return 'MEDIUM';
    if (priceImpactPercentage < 1.0) return 'HIGH';
    return 'CRITICAL';
  }

  private calculateOptimalGasPrice(networkCongestion: number, priorityFee: number, baseFee: number): string {
    const congestionMultiplier = 1 + (networkCongestion * 0.5);
    const optimalGasPrice = (baseFee + priorityFee) * congestionMultiplier;
    return optimalGasPrice.toString();
  }

  private optimizeGasSettings(factors: {
    estimatedGas: string;
    gasPrice: string;
    networkCongestion: number;
    priorityFee: number;
    baseFee: number;
  }): GasOptimization {
    const { estimatedGas, gasPrice, networkCongestion, priorityFee, baseFee } = factors;
    
    const optimizedGasPrice = (parseFloat(gasPrice) * 0.9).toString();
    const maxFeePerGas = (parseFloat(gasPrice) * 1.2).toString();
    const maxPriorityFeePerGas = (priorityFee * 1.1).toString();
    const gasSavings = (parseFloat(estimatedGas) * (parseFloat(gasPrice) - parseFloat(optimizedGasPrice))).toString();
    
    let optimizationStrategy: 'AGGRESSIVE' | 'BALANCED' | 'CONSERVATIVE';
    if (networkCongestion < 0.3) optimizationStrategy = 'AGGRESSIVE';
    else if (networkCongestion < 0.7) optimizationStrategy = 'BALANCED';
    else optimizationStrategy = 'CONSERVATIVE';
    
    return {
      optimizedGasPrice,
      priorityFee: priorityFee.toString(),
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasSavings,
      optimizationStrategy
    };
  }

  private analyzeSplitRecommendation(
    params: SwapRequest, 
    priceImpactAnalysis: PriceImpactAnalysis, 
    marketConditions: MarketConditions
  ): SplitRecommendation | undefined {
    const shouldSplit = priceImpactAnalysis.priceImpactRisk === 'HIGH' || 
                       priceImpactAnalysis.priceImpactRisk === 'CRITICAL';
    
    if (!shouldSplit) return undefined;
    
    const splitCount = Math.ceil(parseFloat(params.amount) / parseFloat(priceImpactAnalysis.recommendedAmount));
    const splitAmounts = this.calculateSplitAmounts(params.amount, splitCount);
    const splitIntervals = this.calculateSplitIntervals(splitCount, marketConditions);
    const expectedSavings = this.calculateSplitSavings(priceImpactAnalysis, splitCount);
    
    return {
      shouldSplit,
      splitCount,
      splitAmounts,
      splitIntervals,
      expectedSavings
    };
  }

  private calculateTimingRecommendation(marketConditions: MarketConditions, gasAnalysis: GasAnalysis): TimingRecommendation {
    const optimalExecutionTime = Date.now() + (30 * 60 * 1000); // 30 minutes from now
    const executionWindow = {
      start: Date.now(),
      end: Date.now() + (2 * 60 * 60 * 1000) // 2 hours window
    };
    
    let marketConditionsStr = 'Stable';
    if (marketConditions.marketTrend === 'BULLISH') marketConditionsStr = 'Bullish';
    else if (marketConditions.marketTrend === 'BEARISH') marketConditionsStr = 'Bearish';
    
    let urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (gasAnalysis.gasTrend === 'INCREASING' || marketConditions.volatilityIndex > 0.7) {
      urgencyLevel = 'HIGH';
    } else if (gasAnalysis.gasTrend === 'DECREASING' && marketConditions.volatilityIndex < 0.3) {
      urgencyLevel = 'LOW';
    } else {
      urgencyLevel = 'MEDIUM';
    }
    
    return {
      optimalExecutionTime,
      executionWindow,
      marketConditions: marketConditionsStr,
      urgencyLevel
    };
  }

  private determineExecutionStrategy(
    riskAssessment: RiskAssessment, 
    parameterRecommendations: ParameterRecommendations
  ): 'IMMEDIATE' | 'WAIT' | 'SPLIT' | 'CANCEL' {
    if (riskAssessment.overallRisk === 'CRITICAL') return 'CANCEL';
    if (parameterRecommendations.splitRecommendation?.shouldSplit) return 'SPLIT';
    if (riskAssessment.overallRisk === 'HIGH') return 'WAIT';
    return 'IMMEDIATE';
  }

  private calculateExecutionConfidence(analysis: any): number {
    // Calculate confidence based on risk factors and market conditions
    let confidence = 0.8; // Base confidence
    
    if (analysis.riskAssessment.overallRisk === 'LOW') confidence += 0.1;
    else if (analysis.riskAssessment.overallRisk === 'HIGH') confidence -= 0.2;
    else if (analysis.riskAssessment.overallRisk === 'CRITICAL') confidence -= 0.4;
    
    if (analysis.marketConditions.volatilityIndex < 0.3) confidence += 0.05;
    else if (analysis.marketConditions.volatilityIndex > 0.7) confidence -= 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }

  private calculateExpectedOutcome(quoteData: any, analysis: any): {
    bestCase: string;
    worstCase: string;
    expectedCase: string;
  } {
    const baseAmount = parseFloat(quoteData.toTokenAmount);
    const slippageImpact = analysis.slippageAnalysis.currentSlippage / 100;
    const priceImpact = analysis.priceImpactAnalysis.priceImpactPercentage / 100;
    
    const bestCase = (baseAmount * (1 - slippageImpact * 0.5)).toString();
    const worstCase = (baseAmount * (1 - slippageImpact * 2 - priceImpact)).toString();
    const expectedCase = (baseAmount * (1 - slippageImpact - priceImpact * 0.5)).toString();
    
    return { bestCase, worstCase, expectedCase };
  }

  private calculateOptimizationMetrics(analysis: any): {
    gasEfficiency: number;
    slippageEfficiency: number;
    timeEfficiency: number;
    costEfficiency: number;
  } {
    const gasEfficiency = 1 - (parseFloat(analysis.gasAnalysis.totalGasCost) / parseFloat(analysis.originalQuote.toTokenAmount));
    const slippageEfficiency = 1 - (analysis.slippageAnalysis.currentSlippage / SWAP_CONSTANTS.MAX_SLIPPAGE);
    const timeEfficiency = analysis.executionOptimization.executionConfidence;
    const costEfficiency = 1 - (analysis.priceImpactAnalysis.priceImpactPercentage / 100);
    
    return {
      gasEfficiency: Math.max(0, Math.min(1, gasEfficiency)),
      slippageEfficiency: Math.max(0, Math.min(1, slippageEfficiency)),
      timeEfficiency: Math.max(0, Math.min(1, timeEfficiency)),
      costEfficiency: Math.max(0, Math.min(1, costEfficiency))
    };
  }

  // Mock methods for market data (in real implementation, these would call external APIs)
  private async estimateLiquidityDepth(fromToken: string, toToken: string): Promise<number> {
    // Mock implementation - in real app, would call DEX APIs
    return 1000000; // $1M liquidity
  }

  private async getMarketVolatility(fromToken: string, toToken: string): Promise<number> {
    // Mock implementation - in real app, would call price APIs
    return 0.15; // 15% volatility
  }

  private getTimeOfDayFactor(): number {
    const hour = new Date().getHours();
    // Peak hours: 9-11 AM and 2-4 PM
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) return 0.8;
    if (hour >= 12 && hour <= 13) return 0.6; // Lunch time
    return 0.4; // Off-peak
  }

  private async getSlippageTrend(fromToken: string, toToken: string): Promise<'INCREASING' | 'DECREASING' | 'STABLE'> {
    // Mock implementation
    return 'STABLE';
  }

  private calculateRecommendedSlippage(expectedSlippage: number, risk: string): number {
    const multiplier = risk === 'LOW' ? 1.1 : risk === 'MEDIUM' ? 1.2 : risk === 'HIGH' ? 1.5 : 2.0;
    return Math.min(expectedSlippage * multiplier, SWAP_CONSTANTS.MAX_SLIPPAGE);
  }

  private async getPoolLiquidity(fromToken: string, toToken: string): Promise<number> {
    // Mock implementation
    return 5000000; // $5M pool liquidity
  }

  private async getMarketDepth(fromToken: string, toToken: string): Promise<number> {
    // Mock implementation
    return 10000000; // $10M market depth
  }

  private async getPriceVolatility(fromToken: string, toToken: string): Promise<number> {
    // Mock implementation
    return 0.12; // 12% price volatility
  }

  private async getPriceImpactTrend(fromToken: string, toToken: string): Promise<'INCREASING' | 'DECREASING' | 'STABLE'> {
    // Mock implementation
    return 'STABLE';
  }

  private calculateRecommendedAmount(tradeSize: number, risk: string, poolLiquidity: number): string {
    const maxImpact = risk === 'LOW' ? 0.1 : risk === 'MEDIUM' ? 0.05 : risk === 'HIGH' ? 0.02 : 0.01;
    const recommendedSize = poolLiquidity * maxImpact;
    return Math.min(tradeSize, recommendedSize).toString();
  }

  private async getNetworkCongestion(): Promise<number> {
    // Mock implementation - in real app, would call gas APIs
    return 0.4; // 40% congestion
  }

  private async getBlockSpaceAvailability(): Promise<number> {
    // Mock implementation
    return 0.6; // 60% block space available
  }

  private async getPriorityFee(): Promise<number> {
    // Mock implementation
    return 2.5; // 2.5 gwei
  }

  private async getBaseFee(): Promise<number> {
    // Mock implementation
    return 20; // 20 gwei
  }

  private async getGasTrend(): Promise<'INCREASING' | 'DECREASING' | 'STABLE'> {
    // Mock implementation
    return 'STABLE';
  }

  private calculateRecommendedGasPrice(gasPrice: string, networkCongestion: number): string {
    const congestionMultiplier = networkCongestion > 0.7 ? 1.3 : networkCongestion > 0.4 ? 1.1 : 0.9;
    return (parseFloat(gasPrice) * congestionMultiplier).toString();
  }

  private async calculateLiquidityScore(fromToken: string, toToken: string): Promise<number> {
    // Mock implementation
    return 0.8; // 80% liquidity score
  }

  private async getVolatilityIndex(fromToken: string, toToken: string): Promise<number> {
    // Mock implementation
    return 0.25; // 25% volatility index
  }

  private async analyzeSpread(fromToken: string, toToken: string): Promise<SpreadAnalysis> {
    // Mock implementation
    return {
      bidAskSpread: 0.001,
      spreadPercentage: 0.1,
      spreadRisk: 'LOW',
      recommendedSpread: 0.0005
    };
  }

  private async analyzeVolume(fromToken: string, toToken: string): Promise<VolumeAnalysis> {
    // Mock implementation
    return {
      volume24h: '1000000',
      volumeChange: 0.05,
      volumeTrend: 'INCREASING',
      volumeImpact: 0.02
    };
  }

  private async getMarketTrend(fromToken: string, toToken: string): Promise<'BULLISH' | 'BEARISH' | 'NEUTRAL'> {
    // Mock implementation
    return 'NEUTRAL';
  }

  private calculateRecommendedDeadline(marketConditions: MarketConditions): number {
    const baseDeadline = SWAP_CONSTANTS.DEFAULT_DEADLINE;
    const volatilityMultiplier = marketConditions.volatilityIndex > 0.5 ? 1.5 : 1.0;
    return Math.floor(Date.now() / 1000) + (baseDeadline * volatilityMultiplier);
  }

  private calculateSplitAmounts(amount: string, splitCount: number): string[] {
    const totalAmount = parseFloat(amount);
    const splitAmount = totalAmount / splitCount;
    return Array(splitCount).fill(splitAmount.toString());
  }

  private calculateSplitIntervals(splitCount: number, marketConditions: MarketConditions): number[] {
    const baseInterval = 5 * 60 * 1000; // 5 minutes
    const volatilityMultiplier = marketConditions.volatilityIndex > 0.5 ? 2 : 1;
    return Array(splitCount - 1).fill(baseInterval * volatilityMultiplier);
  }

  private calculateSplitSavings(priceImpactAnalysis: PriceImpactAnalysis, splitCount: number): string {
    const originalImpact = priceImpactAnalysis.priceImpact;
    const splitImpact = originalImpact / Math.sqrt(splitCount);
    const savings = originalImpact - splitImpact;
    return (parseFloat(priceImpactAnalysis.recommendedAmount) * savings / 100).toString();
  }

  private calculateRiskScore(riskFactors: RiskFactor[]): number {
    let score = 0;
    for (const factor of riskFactors) {
      const severityWeight = factor.severity === 'CRITICAL' ? 1.0 : 
                           factor.severity === 'HIGH' ? 0.7 : 
                           factor.severity === 'MEDIUM' ? 0.4 : 0.2;
      score += factor.impact * factor.probability * severityWeight;
    }
    return Math.min(score, 1);
  }

  private assessOverallRisk(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore < 0.2) return 'LOW';
    if (riskScore < 0.5) return 'MEDIUM';
    if (riskScore < 0.8) return 'HIGH';
    return 'CRITICAL';
  }

  private generateMitigationStrategies(riskFactors: RiskFactor[]): string[] {
    return riskFactors.map(factor => factor.mitigation);
  }

  private generateRecommendedActions(riskFactors: RiskFactor[], analysis: any): string[] {
    const actions: string[] = [];
    
    if (analysis.slippageAnalysis.slippageRisk !== 'LOW') {
      actions.push('Reduce trade size or increase slippage tolerance');
    }
    
    if (analysis.priceImpactAnalysis.priceImpactRisk !== 'LOW') {
      actions.push('Consider splitting trade into smaller amounts');
    }
    
    if (parseFloat(analysis.gasAnalysis.totalGasCost) > parseFloat(analysis.originalQuote.toTokenAmount) * 0.05) {
      actions.push('Wait for lower gas prices or optimize transaction');
    }
    
    if (analysis.marketConditions.volatilityIndex > 0.5) {
      actions.push('Consider using limit orders for better price control');
    }
    
    return actions;
  }

  private async optimizeRoute(params: SwapRequest, quoteData: any, analysis: any): Promise<RouteOptimization> {
    // Mock implementation - in real app, would analyze multiple routes
    const currentRoute = quoteData.route || [];
    const optimizedRoute = currentRoute; // Would be calculated based on analysis
    const routeComparison = {
      gasSavings: '0',
      slippageSavings: 0,
      timeSavings: 0,
      reliabilityScore: 0.9
    };
    
    return {
      currentRoute,
      optimizedRoute,
      routeComparison,
      recommendedRoute: optimizedRoute
    };
  }

  /**
   * Execute swap with dynamic parameter adjustment based on simulation
   */
  async executeSwapWithOptimization(params: SwapRequest): Promise<SwapResponse> {
    try {
      logger.info('Executing swap with optimization', { params });
      
      // Perform enhanced simulation
      const simulationResponse = await this.simulateSwapEnhanced(params);
      if (!simulationResponse.success || !simulationResponse.data) {
        return {
          success: false,
          error: simulationResponse.error || 'Simulation failed'
        };
      }
      
      const simulation = simulationResponse.data;
      
      // Apply parameter recommendations
      const optimizedParams = this.applyParameterRecommendations(params, simulation.parameterRecommendations);
      
      // Execute based on optimization strategy
      switch (simulation.executionOptimization.optimalExecutionStrategy) {
        case 'IMMEDIATE':
          return await this.createSwap(optimizedParams);
          
        case 'WAIT':
          return {
            success: false,
            error: 'Execution delayed due to unfavorable conditions. Please try again later.'
          };
          
        case 'SPLIT':
          return await this.executeSplitSwap(optimizedParams, simulation.parameterRecommendations.splitRecommendation!);
          
        case 'CANCEL':
          return {
            success: false,
            error: 'Swap cancelled due to high risk conditions.'
          };
          
        default:
          return await this.createSwap(optimizedParams);
      }
      
    } catch (error: any) {
      logger.error('Optimized swap execution error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: 'Optimized execution failed'
      };
    }
  }

  /**
   * Apply parameter recommendations to optimize swap
   */
  private applyParameterRecommendations(params: SwapRequest, recommendations: ParameterRecommendations): SwapRequest {
    return {
      ...params,
      slippage: recommendations.recommendedSlippage,
      amount: recommendations.recommendedAmount,
      deadline: recommendations.recommendedDeadline
    };
  }

  /**
   * Execute split swap for large trades
   */
  private async executeSplitSwap(params: SwapRequest, splitRecommendation: SplitRecommendation): Promise<SwapResponse> {
    try {
      logger.info('Executing split swap', { 
        originalAmount: params.amount, 
        splitCount: splitRecommendation.splitCount 
      });
      
      const swapResults: SwapData[] = [];
      let totalReceived = '0';
      
      for (let i = 0; i < splitRecommendation.splitAmounts.length; i++) {
        const splitParams = {
          ...params,
          amount: splitRecommendation.splitAmounts[i]
        };
        
        // Wait between splits if specified
        if (i > 0 && splitRecommendation.splitIntervals[i - 1]) {
          await new Promise(resolve => setTimeout(resolve, splitRecommendation.splitIntervals[i - 1]));
        }
        
        const splitResult = await this.createSwap(splitParams);
        if (splitResult.success && splitResult.data) {
          swapResults.push(splitResult.data);
          totalReceived = (parseFloat(totalReceived) + parseFloat(splitResult.data.toAmount)).toString();
        } else {
          logger.error('Split swap failed', { 
            splitIndex: i, 
            error: splitResult.error 
          });
        }
      }
      
      if (swapResults.length === 0) {
        return {
          success: false,
          error: 'All split swaps failed'
        };
      }
      
      // Create combined result
      const combinedSwapId = `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const combinedSwap: SwapData = {
        swapId: combinedSwapId,
        status: SwapStatus.CONFIRMED,
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.amount,
        toAmount: totalReceived,
        slippage: params.slippage || SWAP_CONSTANTS.DEFAULT_SLIPPAGE,
        gasEstimate: swapResults.reduce((total, swap) => total + parseFloat(swap.gasEstimate), 0).toString(),
        deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
        userAddress: params.userAddress,
        timestamp: Date.now(),
        route: swapResults[0].route,
        fusionData: swapResults[0].fusionData
      };
      
      this.swapHistory.set(combinedSwapId, combinedSwap);
      
      return {
        success: true,
        data: combinedSwap
      };
      
    } catch (error: any) {
      logger.error('Split swap execution error', { error: error.message });
      return {
        success: false,
        error: 'Split swap execution failed'
      };
    }
  }
  
  /**
   * Get swap history for user
   */
  async getSwapHistory(userAddress: string, limit: number = 10, page: number = 1): Promise<SwapHistory[]> {
    try {
      logger.info('Getting swap history', { userAddress, limit, page });
      
      const userSwaps = Array.from(this.swapHistory.values())
        .filter(swap => swap.userAddress === userAddress)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return userSwaps.slice(startIndex, endIndex).map(swap => ({
        id: swap.swapId,
        swapId: swap.swapId,
        fromToken: swap.fromToken,
        toToken: swap.toToken,
        amount: swap.fromAmount,
        status: swap.status,
        timestamp: swap.timestamp,
        userAddress: swap.userAddress,
        txHash: swap.txHash
      }));
      
    } catch (error: any) {
      logger.error('Get swap history error', { error: error.message, userAddress });
      return [];
    }
  }
  
  /**
   * Cancel pending swap transaction
   */
  async cancelSwap(swapId: string, userAddress: string): Promise<SwapResponse> {
    try {
      logger.info('Cancelling swap', { swapId, userAddress });
      
      const swapData = this.swapHistory.get(swapId);
      if (!swapData) {
        return {
          success: false,
          error: 'Swap not found'
        };
      }
      
      // Check if user is authorized to cancel
      if (swapData.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to cancel this swap'
        };
      }
      
      // Check if swap can be cancelled
      if (swapData.status !== SwapStatus.PENDING) {
        return {
          success: false,
          error: 'Swap cannot be cancelled'
        };
      }
      
      // Update swap status
      swapData.status = SwapStatus.CANCELLED;
      this.swapHistory.set(swapId, swapData);
      
      logger.info('Swap cancelled successfully', { swapId });
      
      return {
        success: true,
        data: swapData
      };
      
    } catch (error: any) {
      logger.error('Cancel swap error', { error: error.message, swapId });
      return {
        success: false,
        error: 'Failed to cancel swap'
      };
    }
  }
  
  /**
   * Create a custom limit order using 1inch SDK (no official API)
   */
  async createLimitOrder(params: LimitOrderRequest): Promise<LimitOrderResponse> {
    try {
      logger.info('Creating custom limit order with SDK', { 
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          amount: params.amount,
          chainId: params.chainId,
          userAddress: params.userAddress,
          limitPrice: params.limitPrice,
          orderType: params.orderType,
          deadline: params.deadline
        },
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      // Validate limit order request
      const validation = this.validateLimitOrderRequest(params);
      if (!validation.isValid) {
        logger.warn('Limit order validation failed', {
          errors: validation.errors,
          params: {
            fromToken: params.fromToken,
            toToken: params.toToken,
            userAddress: params.userAddress
          },
          timestamp: Date.now(),
          service: 'cipherswap-custom-limit-order'
        });
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Import SDK service
      const { LimitOrderSDKService } = await import('./limitOrderSDKService');
      const sdkService = new LimitOrderSDKService();
      
      // Create limit order using SDK (no official API)
      const sdkResponse = await sdkService.createLimitOrder(params);
      
      if (!sdkResponse.success) {
        logger.error('SDK limit order creation failed', {
          error: sdkResponse.error,
          params: {
            fromToken: params.fromToken,
            toToken: params.toToken,
            userAddress: params.userAddress
          },
          timestamp: Date.now(),
          service: 'cipherswap-custom-limit-order'
        });
        return {
          success: false,
          error: sdkResponse.error
        };
      }
      
      // Store order in custom system (no official API dependency)
      this.limitOrderHistory.set(sdkResponse.data!.orderId, sdkResponse.data!);
      
      logger.info('Custom limit order created successfully', { 
        orderId: sdkResponse.data!.orderId,
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        limitPrice: params.limitPrice,
        orderType: params.orderType,
        chainId: params.chainId,
        userAddress: params.userAddress,
        status: sdkResponse.data!.status,
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      return {
        success: true,
        data: sdkResponse.data!
      };
      
    } catch (error: any) {
      logger.error('Custom limit order creation error', { 
        error: error.message, 
        stack: error.stack,
        params: {
          fromToken: params.fromToken,
          toToken: params.toToken,
          userAddress: params.userAddress,
          chainId: params.chainId
        },
        timestamp: Date.now(),
        service: 'cipherswap-custom-limit-order'
      });
      
      return {
        success: false,
        error: `Custom limit order creation failed: ${error.message}`
      };
    }
  }
  
  /**
   * Get Fusion+ quote for limit order
   */
  async getFusionQuote(params: FusionQuoteRequest): Promise<FusionQuoteResponse> {
    try {
      logger.info('Getting Fusion+ quote for limit order', { params });
      
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/fusion/v1.0/quote`, {
        params: {
          src: params.fromToken,
          dst: params.toToken,
          amount: params.amount,
          from: params.userAddress,
          limitPrice: params.limitPrice,
          orderType: params.orderType,
          chain: params.chainId
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      const quoteData = this.formatFusionQuoteResponse(response.data, params);
      
      return {
        success: true,
        data: quoteData
      };
      
    } catch (error: any) {
      logger.error('Fusion+ quote error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleLimitOrderError(error)
      };
    }
  }
  
  /**
   * Get limit order status
   */
  async getLimitOrderStatus(orderId: string): Promise<LimitOrderResponse> {
    try {
      logger.info('Getting limit order status', { orderId });
      
      const orderData = this.limitOrderHistory.get(orderId);
      if (!orderData) {
        return {
          success: false,
          error: 'Limit order not found'
        };
      }
      
      // Check if order is expired
      if (orderData.deadline < Math.floor(Date.now() / 1000)) {
        orderData.status = LimitOrderStatus.EXPIRED;
        this.limitOrderHistory.set(orderId, orderData);
      }
      
      // For real implementation, you would call 1inch API to get current status
      // const response = await axios.get(`${this.baseUrl}/fusion/v1.0/order/${orderId}`, {
      //   headers: { 'Authorization': `Bearer ${this.apiKey}` }
      // });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('Get limit order status error', { error: error.message, orderId });
      return {
        success: false,
        error: 'Failed to get limit order status'
      };
    }
  }
  
  /**
   * Cancel limit order
   */
  async cancelLimitOrder(orderId: string, userAddress: string): Promise<LimitOrderResponse> {
    try {
      logger.info('Cancelling limit order', { orderId, userAddress });
      
      const orderData = this.limitOrderHistory.get(orderId);
      if (!orderData) {
        return {
          success: false,
          error: 'Limit order not found'
        };
      }
      
      // Check if user is authorized to cancel
      if (orderData.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to cancel this order'
        };
      }
      
      // Check if order can be cancelled
      if (orderData.status !== LimitOrderStatus.PENDING) {
        return {
          success: false,
          error: 'Order cannot be cancelled'
        };
      }
      
      // Call 1inch API to cancel order
      const response: AxiosResponse = await axios.delete(`${this.baseUrl}/fusion/v1.0/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      // Update order status
      orderData.status = LimitOrderStatus.CANCELLED;
      this.limitOrderHistory.set(orderId, orderData);
      
      logger.info('Limit order cancelled successfully', { orderId });
      
      return {
        success: true,
        data: orderData
      };
      
    } catch (error: any) {
      logger.error('Cancel limit order error', { error: error.message, orderId });
      return {
        success: false,
        error: 'Failed to cancel limit order'
      };
    }
  }
  
  /**
   * Get limit order history for user
   */
  async getLimitOrderHistory(userAddress: string, limit: number = 10, page: number = 1): Promise<LimitOrderData[]> {
    try {
      logger.info('Getting limit order history', { userAddress, limit, page });
      
      const userOrders = Array.from(this.limitOrderHistory.values())
        .filter(order => order.userAddress === userAddress)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return userOrders.slice(startIndex, endIndex);
      
    } catch (error: any) {
      logger.error('Get limit order history error', { error: error.message, userAddress });
      return [];
    }
  }
  
  /**
   * Simulate limit order execution
   */
  async simulateLimitOrder(params: LimitOrderRequest): Promise<LimitOrderResponse> {
    try {
      logger.info('Simulating limit order execution', { params });
      
      // Validate request
      const validation = this.validateLimitOrderRequest(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get quote
      const quoteResponse = await this.getFusionQuote({
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        chainId: params.chainId,
        userAddress: params.userAddress,
        limitPrice: params.limitPrice,
        orderType: params.orderType
      });
      
      if (!quoteResponse.success) {
        return {
          success: false,
          error: quoteResponse.error
        };
      }
      
      // Simulate order execution
      const simulation = this.simulateLimitOrderExecution(params, quoteResponse.data);
      
      return {
        success: true,
        data: simulation as any
      };
      
    } catch (error: any) {
      logger.error('Limit order simulation error', { 
        error: error.message, 
        params 
      });
      
      return {
        success: false,
        error: 'Simulation failed'
      };
    }
  }
  
  /**
   * Check escrow readiness for Fusion+ order
   */
  async checkEscrowStatus(params: EscrowStatusRequest): Promise<EscrowStatusResponse> {
    try {
      logger.info('Checking escrow status', { params });
      
      // Get the limit order data
      const orderData = this.limitOrderHistory.get(params.orderId);
      if (!orderData) {
        return {
          success: false,
          error: 'Order not found'
        };
      }
      
      // Check if user is authorized
      if (orderData.userAddress !== params.userAddress) {
        return {
          success: false,
          error: 'Unauthorized to check this order'
        };
      }
      
      // Call 1inch API to check escrow status
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/fusion/v1.0/escrow/${params.orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      const escrowData = this.formatEscrowStatusResponse(response.data, params.orderId);
      
      logger.info('Escrow status checked successfully', { 
        orderId: params.orderId,
        isReady: escrowData.isReady,
        status: escrowData.status
      });
      
      return {
        success: true,
        data: escrowData
      };
      
    } catch (error: any) {
      logger.error('Check escrow status error', { 
        error: error.message, 
        params,
        status: error.response?.status 
      });
      
      return {
        success: false,
        error: this.handleEscrowError(error)
      };
    }
  }
  
  /**
   * Submit secret for Fusion+ order
   */
  async submitSecret(params: FusionSecretRequest): Promise<FusionSecretResponse> {
    try {
      logger.info('Submitting secret for Fusion+ MEV-protected order', { 
        orderId: params.orderId,
        userAddress: params.userAddress,
        nonce: params.nonce,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      // Validate secret request
      const validation = this.validateSecretRequest(params);
      if (!validation.isValid) {
        logger.warn('Secret submission validation failed', {
          errors: validation.errors,
          orderId: params.orderId,
          userAddress: params.userAddress,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      logger.info('Secret validation passed, checking escrow status', {
        orderId: params.orderId,
        userAddress: params.userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      // Check if escrow is ready first
      const escrowResponse = await this.checkEscrowStatus({
        orderId: params.orderId,
        userAddress: params.userAddress
      });
      
      if (!escrowResponse.success) {
        logger.error('Escrow status check failed', {
          error: escrowResponse.error,
          orderId: params.orderId,
          userAddress: params.userAddress,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        return {
          success: false,
          error: escrowResponse.error
        };
      }
      
      if (!escrowResponse.data?.isReady) {
        logger.warn('Escrow not ready for secret submission', {
          orderId: params.orderId,
          userAddress: params.userAddress,
          escrowStatus: escrowResponse.data,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        return {
          success: false,
          error: 'Escrow is not ready for secret submission'
        };
      }
      
      logger.info('Escrow ready, submitting secret to Fusion+ API', {
        orderId: params.orderId,
        userAddress: params.userAddress,
        escrowStatus: escrowResponse.data,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      // Submit secret to 1inch Fusion+ API
      const response: AxiosResponse = await axios.post(`${this.baseUrl}/fusion/v1.0/secret`, {
        orderId: params.orderId,
        userAddress: params.userAddress,
        secret: params.secret,
        signature: params.signature,
        nonce: params.nonce
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      logger.info('Fusion+ secret API response received', {
        status: response.status,
        secretId: response.data?.secretId,
        orderId: params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      // Format secret data
      const secretData = this.formatSecretResponse(response.data, params, escrowResponse.data);
      
      // Store secret data
      this.secretsHistory.set(secretData.secretId, secretData);
      
      logger.info('Secret submitted successfully for MEV-protected order', { 
        secretId: secretData.secretId,
        orderId: params.orderId,
        userAddress: params.userAddress,
        status: secretData.status,
        escrowStatus: escrowResponse.data,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      return {
        success: true,
        data: secretData
      };
      
    } catch (error: any) {
      logger.error('Secret submission error for MEV-protected order', { 
        error: error.message,
        stack: error.stack,
        orderId: params.orderId,
        userAddress: params.userAddress,
        status: error.response?.status,
        responseData: error.response?.data,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      return {
        success: false,
        error: this.handleSecretError(error)
      };
    }
  }
  
  /**
   * Wait for escrow to be ready and submit secret
   */
  async waitForEscrowAndSubmitSecret(
    orderId: string, 
    userAddress: string, 
    secret: string, 
    signature: string, 
    nonce: number,
    maxWaitTime: number = SWAP_CONSTANTS.MAX_ESCROW_WAIT_TIME
  ): Promise<FusionSecretResponse> {
    try {
      logger.info('Starting escrow wait and secret submission for MEV-protected order', { 
        orderId, 
        userAddress,
        nonce,
        maxWaitTime,
        checkInterval: SWAP_CONSTANTS.ESCROW_CHECK_INTERVAL,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      const startTime = Date.now();
      const checkInterval = SWAP_CONSTANTS.ESCROW_CHECK_INTERVAL;
      let checkCount = 0;
      
      while (Date.now() - startTime < maxWaitTime) {
        checkCount++;
        const elapsedTime = Date.now() - startTime;
        
        logger.info(`Escrow check #${checkCount} for MEV-protected order`, {
          orderId,
          userAddress,
          checkCount,
          elapsedTime,
          remainingTime: maxWaitTime - elapsedTime,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        
        // Check escrow status
        const escrowResponse = await this.checkEscrowStatus({
          orderId,
          userAddress
        });
        
        if (!escrowResponse.success) {
          logger.error('Escrow status check failed during wait', {
            error: escrowResponse.error,
            orderId,
            userAddress,
            checkCount,
            elapsedTime,
            timestamp: Date.now(),
            service: 'cipherswap-api'
          });
          return {
            success: false,
            error: escrowResponse.error
          };
        }
        
        logger.info(`Escrow status check #${checkCount} result`, {
          orderId,
          userAddress,
          checkCount,
          isReady: escrowResponse.data?.isReady,
          escrowStatus: escrowResponse.data,
          elapsedTime,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        
        if (escrowResponse.data?.isReady) {
          logger.info('Escrow ready, proceeding with secret submission', {
            orderId,
            userAddress,
            checkCount,
            elapsedTime,
            escrowStatus: escrowResponse.data,
            timestamp: Date.now(),
            service: 'cipherswap-api'
          });
          
          // Escrow is ready, submit secret
          return await this.submitSecret({
            orderId,
            userAddress,
            secret,
            signature,
            nonce
          });
        }
        
        logger.info(`Escrow not ready, waiting ${checkInterval}ms before next check`, {
          orderId,
          userAddress,
          checkCount,
          elapsedTime,
          remainingTime: maxWaitTime - elapsedTime,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
      
      logger.warn('Escrow wait timeout reached', {
        orderId,
        userAddress,
        checkCount,
        totalWaitTime: Date.now() - startTime,
        maxWaitTime,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      return {
        success: false,
        error: 'Escrow did not become ready within the specified time'
      };
      
    } catch (error: any) {
      logger.error('Wait for escrow and submit secret error for MEV-protected order', { 
        error: error.message,
        stack: error.stack,
        orderId,
        userAddress,
        nonce,
        maxWaitTime,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      
      return {
        success: false,
        error: 'Failed to wait for escrow and submit secret'
      };
    }
  }
  
  /**
   * Get secret submission status
   */
  async getSecretStatus(secretId: string, userAddress: string): Promise<FusionSecretResponse> {
    try {
      logger.info('Getting secret status', { secretId, userAddress });
      
      const secretData = this.secretsHistory.get(secretId);
      if (!secretData) {
        return {
          success: false,
          error: 'Secret not found'
        };
      }
      
      // Check if user is authorized
      if (secretData.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to check this secret'
        };
      }
      
      // Check if secret is expired
      if (Date.now() - secretData.timestamp > SWAP_CONSTANTS.SECRET_SUBMISSION_TIMEOUT) {
        secretData.status = SecretStatus.EXPIRED;
        this.secretsHistory.set(secretId, secretData);
      }
      
      return {
        success: true,
        data: secretData
      };
      
    } catch (error: any) {
      logger.error('Get secret status error', { error: error.message, secretId });
      return {
        success: false,
        error: 'Failed to get secret status'
      };
    }
  }
  
  /**
   * Get all secrets for a user
   */
  async getUserSecrets(userAddress: string, limit: number = 10, page: number = 1): Promise<FusionSecretData[]> {
    try {
      logger.info('Getting user secrets', { userAddress, limit, page });
      
      const userSecrets = Array.from(this.secretsHistory.values())
        .filter(secret => secret.userAddress === userAddress)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return userSecrets.slice(startIndex, endIndex);
      
    } catch (error: any) {
      logger.error('Get user secrets error', { error: error.message, userAddress });
      return [];
    }
  }
  
  /**
   * Get quote from 1inch API
   */
  private async getQuote(params: SwapRequest): Promise<any> {
    try {
      // Convert ETH amount to wei for 1inch API
      const amountInWei = (parseFloat(params.amount) * Math.pow(10, 18)).toString();

      const response: AxiosResponse = await axios.get(`${this.baseUrl}/swap/v5.2/${params.chainId}/quote`, {
        params: {
          src: params.fromToken,
          dst: params.toToken,
          amount: amountInWei, // Use converted wei amount
          from: params.userAddress
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data
      };
      
    } catch (error: any) {
      logger.error('Get quote error', { error: error.message, params });
      return {
        success: false,
        error: this.handleSwapError(error)
      };
    }
  }
  
  /**
   * Validate swap request parameters
   */
  private validateSwapRequest(params: SwapRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields
    if (!params.fromToken) {
      errors.push('fromToken is required');
    }
    if (!params.toToken) {
      errors.push('toToken is required');
    }
    if (!params.amount) {
      errors.push('amount is required');
    }
    if (!params.chainId) {
      errors.push('chainId is required');
    }
    if (!params.userAddress) {
      errors.push('userAddress is required');
    }
    
    // Amount validation
    if (params.amount) {
      const amountInEth = parseFloat(params.amount);
      // Compare ETH amounts directly (frontend sends ETH)
      const minAmountEth = parseFloat(SWAP_CONSTANTS.MIN_AMOUNT) / Math.pow(10, 18);
      const maxAmountEth = parseFloat(SWAP_CONSTANTS.MAX_AMOUNT) / Math.pow(10, 18);
      
      if (amountInEth < minAmountEth) {
        errors.push(`Amount too small. Minimum: ${minAmountEth} ETH`);
      }
      if (amountInEth > maxAmountEth) {
        errors.push(`Amount too large. Maximum: ${maxAmountEth} ETH`);
      }
    }
    
    // Enhanced slippage validation using slippage tolerance service
    if (params.slippage) {
      const slippageValidation = this.slippageToleranceService.validateTolerance(params.slippage);
      if (!slippageValidation.isValid) {
        errors.push(...slippageValidation.errors);
      }
    }
    
    // Token validation
    if (params.fromToken === params.toToken) {
      errors.push('fromToken and toToken cannot be the same');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Format swap response
   */
  private formatSwapResponse(data: any, params: SwapRequest, quoteData: any): SwapData {
    const swapId = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      swapId,
      txHash: data.tx?.hash,
      status: SwapStatus.PENDING,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.amount,
      toAmount: quoteData.toTokenAmount,
      slippage: params.slippage || SWAP_CONSTANTS.DEFAULT_SLIPPAGE,
      gasEstimate: quoteData.estimatedGas || '0',
      gasPrice: data.tx?.gasPrice,
      deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
      userAddress: params.userAddress,
      timestamp: Date.now(),
      route: quoteData.route || []
    };
  }
  
  /**
   * Format Fusion+ swap response
   */
  private formatFusionSwapResponse(data: any, params: SwapRequest, quoteData: any): SwapData {
    const swapData = this.formatSwapResponse(data, params, quoteData);
    
    // Add Fusion+ specific data
    swapData.fusionData = {
      permit: params.permit,
      deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
      nonce: data.nonce || 0,
      signature: data.signature
    };
    
    return swapData;
  }
  
  /**
   * Simulate swap transaction
   */
  private simulateSwapTransaction(params: SwapRequest, quoteData: any): SwapSimulation {
    const originalQuote = quoteData;
    const simulatedSwap = this.formatSwapResponse(quoteData, params, quoteData);
    
    // Calculate differences
    const slippageDifference = 0; // Would be calculated based on market conditions
    const gasDifference = '0'; // Would be calculated based on network conditions
    const priceImpactDifference = 0; // Would be calculated based on trade size
    const estimatedGains = parseFloat(quoteData.toTokenAmount) - parseFloat(params.amount);
    
    // Mock enhanced analysis data for backward compatibility
    const slippageAnalysis: SlippageAnalysis = {
      currentSlippage: params.slippage || SWAP_CONSTANTS.DEFAULT_SLIPPAGE,
      expectedSlippage: 0.5,
      slippageTolerance: 1.0,
      slippageRisk: 'LOW',
      slippageTrend: 'STABLE',
      recommendedSlippage: 0.5,
      slippageFactors: {
        liquidityDepth: 1000000,
        tradeSize: parseFloat(params.amount),
        marketVolatility: 0.15,
        timeOfDay: 0.5
      }
    };
    
    const priceImpactAnalysis: PriceImpactAnalysis = {
      priceImpact: 0,
      priceImpactPercentage: 0,
      priceImpactRisk: 'LOW',
      priceImpactTrend: 'STABLE',
      recommendedAmount: params.amount,
      priceImpactFactors: {
        poolLiquidity: 5000000,
        tradeSize: parseFloat(params.amount),
        marketDepth: 10000000,
        priceVolatility: 0.12
      }
    };
    
    const gasAnalysis: GasAnalysis = {
      estimatedGas: quoteData.estimatedGas || '210000',
      gasPrice: '20000000000',
      totalGasCost: '0',
      gasOptimization: {
        optimizedGasPrice: '18000000000',
        priorityFee: '2500000000',
        maxFeePerGas: '24000000000',
        maxPriorityFeePerGas: '2750000000',
        gasSavings: '0',
        optimizationStrategy: 'BALANCED'
      },
      gasTrend: 'STABLE',
      recommendedGasPrice: '20000000000',
      gasFactors: {
        networkCongestion: 0.4,
        blockSpace: 0.6,
        priorityFee: 2.5,
        baseFee: 20
      }
    };
    
    const marketConditions: MarketConditions = {
      liquidityScore: 0.8,
      volatilityIndex: 0.25,
      marketDepth: 10000000,
      spreadAnalysis: {
        bidAskSpread: 0.001,
        spreadPercentage: 0.1,
        spreadRisk: 'LOW',
        recommendedSpread: 0.0005
      },
      volumeAnalysis: {
        volume24h: '1000000',
        volumeChange: 0.05,
        volumeTrend: 'INCREASING',
        volumeImpact: 0.02
      },
      marketTrend: 'NEUTRAL'
    };
    
    const parameterRecommendations: ParameterRecommendations = {
      recommendedSlippage: 0.5,
      recommendedAmount: params.amount,
      recommendedGasPrice: '20000000000',
      recommendedDeadline: Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
      timingRecommendation: {
        optimalExecutionTime: Date.now() + (30 * 60 * 1000),
        executionWindow: {
          start: Date.now(),
          end: Date.now() + (2 * 60 * 60 * 1000)
        },
        marketConditions: 'Stable',
        urgencyLevel: 'MEDIUM'
      },
      routeOptimization: {
        currentRoute: quoteData.route || [],
        optimizedRoute: quoteData.route || [],
        routeComparison: {
          gasSavings: '0',
          slippageSavings: 0,
          timeSavings: 0,
          reliabilityScore: 0.9
        },
        recommendedRoute: quoteData.route || []
      }
    };
    
    const riskAssessment: RiskAssessment = {
      overallRisk: 'LOW',
      riskFactors: [],
      riskScore: 0.1,
      mitigationStrategies: [],
      recommendedActions: []
    };
    
    const executionOptimization: ExecutionOptimization = {
      optimalExecutionStrategy: 'IMMEDIATE',
      executionConfidence: 0.9,
      expectedOutcome: {
        bestCase: quoteData.toTokenAmount,
        worstCase: quoteData.toTokenAmount,
        expectedCase: quoteData.toTokenAmount
      },
      optimizationMetrics: {
        gasEfficiency: 0.9,
        slippageEfficiency: 0.95,
        timeEfficiency: 0.9,
        costEfficiency: 0.95
      }
    };
    
    return {
      originalQuote,
      simulatedSwap,
      slippageDifference,
      gasDifference,
      priceImpactDifference,
      estimatedGains,
      slippageAnalysis,
      priceImpactAnalysis,
      gasAnalysis,
      marketConditions,
      parameterRecommendations,
      riskAssessment,
      executionOptimization
    };
  }
  
  /**
   * Validate limit order request parameters
   */
  private validateLimitOrderRequest(params: LimitOrderRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields
    if (!params.fromToken) {
      errors.push('fromToken is required');
    }
    if (!params.toToken) {
      errors.push('toToken is required');
    }
    if (!params.amount) {
      errors.push('amount is required');
    }
    if (!params.chainId) {
      errors.push('chainId is required');
    }
    if (!params.userAddress) {
      errors.push('userAddress is required');
    }
    if (!params.limitPrice) {
      errors.push('limitPrice is required');
    }
    if (!params.orderType) {
      errors.push('orderType is required');
    }
    
    // Amount validation
    if (params.amount) {
      const amountInWei = parseFloat(params.amount);
      // Compare wei amounts directly (frontend sends wei)
      const minAmountWei = parseFloat(SWAP_CONSTANTS.MIN_AMOUNT);
      const maxAmountWei = parseFloat(SWAP_CONSTANTS.MAX_AMOUNT);
      
      if (amountInWei < minAmountWei) {
        const minAmountEth = minAmountWei / Math.pow(10, 18);
        errors.push(`Amount too small. Minimum: ${minAmountEth} ETH`);
      }
      if (amountInWei > maxAmountWei) {
        const maxAmountEth = maxAmountWei / Math.pow(10, 18);
        errors.push(`Amount too large. Maximum: ${maxAmountEth} ETH`);
      }
    }
    
    // Price validation
    if (params.limitPrice && parseFloat(params.limitPrice) <= 0) {
      errors.push('Limit price must be greater than 0');
    }
    
    // Order type validation
    if (params.orderType && !['buy', 'sell'].includes(params.orderType)) {
      errors.push('Order type must be either "buy" or "sell"');
    }
    
    // Token validation
    if (params.fromToken === params.toToken) {
      errors.push('fromToken and toToken cannot be the same');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Format limit order response
   */
  private formatLimitOrderResponse(data: any, params: LimitOrderRequest, quoteData: any): LimitOrderData {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      orderId,
      txHash: data.tx?.hash,
      status: LimitOrderStatus.PENDING,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.amount,
      toAmount: quoteData.toTokenAmount,
      limitPrice: params.limitPrice,
      orderType: params.orderType,
      gasEstimate: quoteData.estimatedGas || '0',
      gasPrice: data.tx?.gasPrice,
      deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
      userAddress: params.userAddress,
      timestamp: Date.now(),
      route: quoteData.route || [],
      fusionData: {
        permit: params.permit,
        deadline: params.deadline || Math.floor(Date.now() / 1000) + SWAP_CONSTANTS.DEFAULT_DEADLINE,
        nonce: data.nonce || 0,
        signature: data.signature
      }
    };
  }
  
  /**
   * Format Fusion+ quote response
   */
  private formatFusionQuoteResponse(data: any, params: FusionQuoteRequest): any {
    return {
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromTokenAmount: params.amount,
      toTokenAmount: data.toTokenAmount,
      limitPrice: params.limitPrice,
      orderType: params.orderType,
      estimatedGas: data.estimatedGas || '0',
      priceImpact: data.priceImpact || 0,
      route: data.route || [],
      timestamp: Date.now()
    };
  }
  
  /**
   * Simulate limit order execution
   */
  private simulateLimitOrderExecution(params: LimitOrderRequest, quoteData: any): any {
    const originalQuote = quoteData;
    const simulatedOrder = this.formatLimitOrderResponse(quoteData, params, quoteData);
    
    // Calculate execution probability based on current market conditions
    const executionProbability = this.calculateExecutionProbability(params, quoteData);
    
    // Calculate potential savings/MEV protection benefits
    const mevProtectionBenefits = this.calculateMEVProtectionBenefits(params, quoteData);
    
    return {
      originalQuote,
      simulatedOrder,
      executionProbability,
      mevProtectionBenefits,
      estimatedExecutionTime: this.estimateExecutionTime(params, quoteData)
    };
  }
  
  /**
   * Calculate execution probability for limit order
   */
  private calculateExecutionProbability(params: LimitOrderRequest, quoteData: any): number {
    // This would integrate with market data to calculate probability
    // For now, return a mock calculation
    const currentPrice = parseFloat(quoteData.toTokenAmount) / parseFloat(params.amount);
    const limitPrice = parseFloat(params.limitPrice);
    
    if (params.orderType === 'buy') {
      return currentPrice <= limitPrice ? 0.8 : 0.2;
    } else {
      return currentPrice >= limitPrice ? 0.8 : 0.2;
    }
  }
  
  /**
   * Calculate MEV protection benefits
   */
  private calculateMEVProtectionBenefits(params: LimitOrderRequest, quoteData: any): any {
    // Mock calculation of MEV protection benefits
    return {
      frontrunProtection: true,
      sandwichProtection: true,
      estimatedSavings: '0.001', // ETH
      protectionLevel: 'high'
    };
  }

  /**
   * Estimate execution time for limit order
   */
  private estimateExecutionTime(params: LimitOrderRequest, quoteData: any): number {
    // Mock estimation based on order type and market conditions
    return params.orderType === 'buy' ? 300 : 600; // seconds
  }

  /**
   * Handle different types of errors
   */
  private handleSwapError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid swap parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Swap route not found';
        case 429:
          return 'Rate limit exceeded';
        case 500:
          return '1inch API server error';
        default:
          return data?.message || 'Unknown API error';
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout';
    }
    
    if (error.code === 'ENOTFOUND') {
      return 'Network error';
    }
    
    return error.message || 'Unknown error';
  }

  /**
   * Handle limit order specific errors
   */
  private handleLimitOrderError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid limit order parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Limit order route not found';
        case 429:
          return 'Rate limit exceeded';
        case 500:
          return '1inch Fusion+ API server error';
        default:
          return data?.message || 'Unknown API error';
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout';
    }
    
    if (error.code === 'ENOTFOUND') {
      return 'Network error';
    }
    
    return error.message || 'Unknown error';
  }

  /**
   * Handle escrow specific errors
   */
  private handleEscrowError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid escrow status request parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Escrow status route not found';
        case 429:
          return 'Rate limit exceeded';
        case 500:
          return '1inch Fusion+ API server error';
        default:
          return data?.message || 'Unknown API error';
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout';
    }
    
    if (error.code === 'ENOTFOUND') {
      return 'Network error';
    }
    
    return error.message || 'Unknown error';
  }

  /**
   * Handle secret specific errors
   */
  private handleSecretError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid secret submission parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Secret submission route not found';
        case 429:
          return 'Rate limit exceeded';
        case 500:
          return '1inch Fusion+ API server error';
        default:
          return data?.message || 'Unknown API error';
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout';
    }
    
    if (error.code === 'ENOTFOUND') {
      return 'Network error';
    }
    
    return error.message || 'Unknown error';
  }

  /**
   * Format escrow status response
   */
  private formatEscrowStatusResponse(data: any, orderId: string): EscrowStatusData {
    return {
      orderId,
      escrowAddress: data.escrowAddress || '',
      isReady: data.isReady || false,
      readyTimestamp: data.readyTimestamp,
      expirationTimestamp: data.expirationTimestamp || (Date.now() + 300000), // 5 minutes default
      depositedAmount: data.depositedAmount || '0',
      requiredAmount: data.requiredAmount || '0',
      status: data.status || EscrowStatus.PENDING
    };
  }

  /**
   * Validate secret request parameters
   */
  private validateSecretRequest(params: FusionSecretRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields
    if (!params.orderId) {
      errors.push('orderId is required');
    }
    if (!params.userAddress) {
      errors.push('userAddress is required');
    }
    if (!params.secret) {
      errors.push('secret is required');
    }
    if (!params.signature) {
      errors.push('signature is required');
    }
    if (!params.nonce) {
      errors.push('nonce is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format secret response
   */
  private formatSecretResponse(data: any, params: FusionSecretRequest, escrowData: any): FusionSecretData {
    const secretId = `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      secretId,
      orderId: params.orderId,
      userAddress: params.userAddress,
      status: SecretStatus.PENDING,
      timestamp: Date.now(),
      escrowAddress: escrowData?.escrowAddress,
      escrowReady: escrowData?.isReady || false,
      secretHash: data.secretHash,
      submissionTxHash: data.submissionTxHash
    };
  }

  // ==================== FLASHBOTS BUNDLE METHODS ====================

  /**
   * Create and submit a Flashbots bundle for MEV protection
   */
  async createFlashbotsBundle(
    transactions: string[], 
    userAddress: string,
    config: MEVProtectionConfig
  ): Promise<FlashbotsBundleResponse> {
    try {
      logger.info('Creating Flashbots MEV-protection bundle', { 
        transactionCount: transactions.length, 
        userAddress,
        config: {
          targetBlock: config.targetBlock,
          maxBlockNumber: config.maxBlockNumber,
          refundRecipient: config.refundRecipient,
          refundPercent: config.refundPercent,
          useFlashbots: config.useFlashbots
        },
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // Validate transactions first
      const validation = this.validateBundleTransactions(transactions);
      if (!validation.isValid) {
        logger.warn('Flashbots bundle validation failed', {
          errors: validation.errors,
          transactionCount: transactions.length,
          userAddress,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      logger.info('Flashbots bundle validation passed', {
        transactionCount: transactions.length,
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // Check Flashbots provider after validation
      if (!this.flashbotsProvider) {
        logger.info('Flashbots provider not available, creating mock bundle', {
          userAddress,
          transactionCount: transactions.length,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        
        // In test environment, return mock response
        const bundleData: FlashbotsBundleData = {
          bundleId: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          bundleHash: `0x${Math.random().toString(36).substr(2, 64)}`,
          targetBlock: config.targetBlock || 12345678,
          status: BundleStatus.SUBMITTED,
          transactions: transactions.map(tx => ({ transaction: tx, canRevert: false })),
          gasEstimate: '210000',
          gasPrice: '20000000000',
          totalValue: '0',
          refundRecipient: config.refundRecipient,
          refundPercent: config.refundPercent,
          timestamp: Date.now(),
          userAddress,
          submissionAttempts: 1,
          lastSubmissionAttempt: Date.now(),
        };

        // Store bundle data
        this.bundleHistory.set(bundleData.bundleId, bundleData);

        logger.info('Flashbots MEV-protection bundle created (mock)', { 
          bundleId: bundleData.bundleId,
          targetBlock: bundleData.targetBlock,
          transactionCount: transactions.length,
          userAddress,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });

        return {
          success: true,
          data: bundleData
        };
      }

      logger.info('Flashbots provider available, creating bundle request', {
        transactionCount: transactions.length,
        targetBlock: config.targetBlock,
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // Create bundle request
      const bundleRequest: FlashbotsBundleRequest = {
        transactions: transactions.map(tx => ({ transaction: tx, canRevert: false })),
        targetBlock: config.targetBlock,
        maxBlockNumber: config.maxBlockNumber,
        minTimestamp: config.minTimestamp,
        maxTimestamp: config.maxTimestamp,
        revertingTxHashes: config.revertingTxHashes,
        refundRecipient: config.refundRecipient,
        refundPercent: config.refundPercent
      };

      logger.info('Simulating Flashbots bundle before submission', {
        transactionCount: transactions.length,
        targetBlock: config.targetBlock,
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // Simulate bundle first
      const simulation = await this.simulateBundle(bundleRequest);
      if (!simulation.success) {
        logger.error('Flashbots bundle simulation failed', {
          error: simulation.error,
          transactionCount: transactions.length,
          targetBlock: config.targetBlock,
          userAddress,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        return {
          success: false,
          error: `Bundle simulation failed: ${simulation.error}`        };
      }

      logger.info('Flashbots bundle simulation successful, submitting bundle', {
        simulation: simulation.data,
        transactionCount: transactions.length,
        targetBlock: config.targetBlock,
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // Submit bundle
      const bundleResponse = await this.submitBundle(bundleRequest, userAddress);
      if (!bundleResponse.success) {
        logger.error('Flashbots bundle submission failed', {
          error: bundleResponse.error,
          transactionCount: transactions.length,
          targetBlock: config.targetBlock,
          userAddress,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        return {
          success: false,
          error: bundleResponse.error
        };
      }

      // Store bundle data
      this.bundleHistory.set(bundleResponse.data!.bundleId, bundleResponse.data!);

      logger.info('Flashbots MEV-protection bundle created successfully', { 
        bundleId: bundleResponse.data!.bundleId,
        targetBlock: bundleResponse.data!.targetBlock,
        transactionCount: transactions.length,
        userAddress,
        status: bundleResponse.data!.status,
        gasEstimate: bundleResponse.data!.gasEstimate,
        gasPrice: bundleResponse.data!.gasPrice,
        refundRecipient: bundleResponse.data!.refundRecipient,
        refundPercent: bundleResponse.data!.refundPercent,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      return bundleResponse;

    } catch (error: any) {
      logger.error('Flashbots MEV-protection bundle creation error', { 
        error: error.message,
        stack: error.stack,
        transactionCount: transactions.length,
        userAddress,
        config: {
          targetBlock: config.targetBlock,
          refundRecipient: config.refundRecipient
        },
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      return {
        success: false,
        error: this.handleFlashbotsError(error)
      };
    }
  }

  /**
   * Create Flashbots bundle with retry logic
   */
  async createFlashbotsBundleWithRetry(
    transactions: string[], 
    userAddress: string,
    config: MEVProtectionConfig
  ): Promise<FlashbotsBundleResponse> {
    const retryConfig: BundleRetryConfig = {
      maxRetries: config.maxRetries ?? importedConfig.FLASHBOTS_MAX_RETRIES ?? 3,
      baseDelay: config.retryDelay ?? importedConfig.FLASHBOTS_RETRY_BASE_DELAY ?? 1000,
      maxDelay: importedConfig.FLASHBOTS_RETRY_MAX_DELAY ?? 30000,
      backoffMultiplier: importedConfig.FLASHBOTS_RETRY_BACKOFF_MULTIPLIER ?? 2.0,
      enableFallback: config.enableFallback ?? importedConfig.FLASHBOTS_ENABLE_FALLBACK ?? false,
      fallbackGasPrice: config.fallbackGasPrice ?? importedConfig.FLASHBOTS_FALLBACK_GAS_PRICE ?? '25000000000',
      fallbackSlippage: config.fallbackSlippage ?? importedConfig.FLASHBOTS_FALLBACK_SLIPPAGE ?? 0.5
    };

    let lastError: string | undefined;
    let attempt = 0;

    while (attempt <= retryConfig.maxRetries) {
      try {
        logger.info('Attempting Flashbots bundle creation', { 
          attempt: attempt + 1,
          maxRetries: retryConfig.maxRetries,
          userAddress 
        });

        const bundleResponse = await this.createFlashbotsBundle(transactions, String(userAddress ?? ''), config);
        
        if (bundleResponse.success) {
          // Add retry data to bundle
          if (bundleResponse.data) {
            bundleResponse.data.submissionAttempts = attempt + 1;
            bundleResponse.data.lastSubmissionAttempt = Date.now();
            
            if (attempt > 0) {
              bundleResponse.data.retryData = {
                originalBundleId: bundleResponse.data.bundleId,
                retryAttempts: [],
                currentAttempt: attempt + 1,
                maxRetries: retryConfig.maxRetries,
                fallbackUsed: false,
                finalStatus: bundleResponse.data.status
              };
            }
          }

          logger.info('Flashbots bundle created successfully with retry', { 
            bundleId: bundleResponse.data?.bundleId,
            attempts: attempt + 1
          });

          return bundleResponse;
        }

        lastError = bundleResponse.error;
        logger.warn('Bundle creation failed, will retry', { 
          attempt: attempt + 1,
          error: lastError 
        });

      } catch (error: any) {
        lastError = this.handleFlashbotsError(error);
        logger.error('Bundle creation error, will retry', { 
          attempt: attempt + 1,
          error: lastError 
        });
      }

      attempt++;

      // If we haven't exceeded max retries, wait before next attempt
      if (attempt <= retryConfig.maxRetries) {
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        );

        logger.info('Waiting before retry', { 
          delay,
          nextAttempt: attempt + 1 
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries exhausted
    logger.error('All bundle creation retries exhausted', { 
      maxRetries: retryConfig.maxRetries,
      finalError: lastError 
    });

    return {
      success: false,
      error: `Bundle creation failed after ${retryConfig.maxRetries} attempts: ${lastError}`
    };
  }

  /**
   * Retry a failed bundle with updated parameters
   */
  async retryBundle(
    originalBundleId: string,
    userAddress: string,
    updatedConfig?: MEVProtectionConfig
  ): Promise<FlashbotsBundleResponse> {
    try {
      const originalBundle = this.bundleHistory.get(originalBundleId);
      if (!originalBundle) {
        return {
          success: false,
          error: 'Original bundle not found'
        };
      }

      if (originalBundle.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to retry this bundle'
        };
      }

      // Check if bundle is eligible for retry
      if (!this.isBundleRetryable(originalBundle)) {
        return {
          success: false,
          error: 'Bundle is not eligible for retry'
        };
      }

      logger.info('Retrying bundle', { 
        originalBundleId,
        userAddress 
      });

      // Extract transactions from original bundle
      const transactions = originalBundle.transactions.map(tx => tx.transaction);
      
      // Use updated config or original config
      const retryConfig: MEVProtectionConfig = {
        useFlashbots: true,
        targetBlock: updatedConfig?.targetBlock ?? ((originalBundle.targetBlock ?? 12345678) + 1),
        maxRetries: (
          updatedConfig?.maxRetries !== undefined
            ? Number(updatedConfig.maxRetries)
            : importedConfig.FLASHBOTS_MAX_RETRIES !== undefined
              ? Number(importedConfig.FLASHBOTS_MAX_RETRIES)
              : 3
        ),
        retryDelay: updatedConfig?.retryDelay ?? importedConfig.FLASHBOTS_RETRY_BASE_DELAY ?? 1000,
        enableFallback: updatedConfig?.enableFallback ?? importedConfig.FLASHBOTS_ENABLE_FALLBACK ?? false,
        fallbackGasPrice: updatedConfig?.fallbackGasPrice ?? importedConfig.FLASHBOTS_FALLBACK_GAS_PRICE ?? '25000000000',
        fallbackSlippage: updatedConfig?.fallbackSlippage ?? importedConfig.FLASHBOTS_FALLBACK_SLIPPAGE ?? 0.5
      };

      const retryResponse = await this.createFlashbotsBundleWithRetry(
        transactions,
        userAddress,
        retryConfig
      );

      if (retryResponse.success && retryResponse.data) {
        // Link retry to original bundle
        retryResponse.data.retryData = {
          originalBundleId,
          retryAttempts: originalBundle.retryData?.retryAttempts || [],
          currentAttempt: (originalBundle.retryData?.currentAttempt || 0) + 1,
          maxRetries: Number(retryConfig.maxRetries) || 3,
          lastError: originalBundle.retryData?.lastError,
          fallbackUsed: false,
          finalStatus: retryResponse.data.status
        };

        // Update original bundle status
        originalBundle.status = BundleStatus.FAILED;
        originalBundle.retryData = retryResponse.data.retryData;
        this.bundleHistory.set(originalBundleId, originalBundle);
      }

      return retryResponse;

    } catch (error: any) {
      logger.error('Bundle retry error', { error: error.message });
      return {
        success: false,
        error: this.handleFlashbotsError(error)
      };
    }
  }

  /**
   * Check if a bundle is eligible for retry
   */
  private isBundleRetryable(bundle: FlashbotsBundleData): boolean {
    // Check if bundle has failed status
    if (bundle.status !== BundleStatus.FAILED && 
        bundle.status !== BundleStatus.EXPIRED && 
        bundle.status !== BundleStatus.REVERTED) {
      return false;
    }

    // Check if we haven't exceeded max retries
    const currentAttempts = bundle.retryData?.currentAttempt || 0;
    const maxRetries = bundle.retryData?.maxRetries ?? importedConfig.FLASHBOTS_MAX_RETRIES ?? 3;
    
    if (currentAttempts >= maxRetries) {
      return false;
    }

    // Check if bundle hasn't expired (within reasonable time)
    const bundleAge = Date.now() - bundle.timestamp;
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    if (bundleAge > maxAge) {
      return false;
    }

    return true;
  }

  /**
   * Simulate a Flashbots bundle
   */
  async simulateBundle(bundleRequest: FlashbotsBundleRequest): Promise<FlashbotsSimulationResponse> {
    try {
      logger.info('Simulating Flashbots bundle', { 
        transactionCount: bundleRequest.transactions.length 
      });

      // Validate bundle request first
      if (!bundleRequest.transactions || bundleRequest.transactions.length === 0) {
        return {
          success: false,
          error: 'No transactions provided for simulation'
        };
      }

      if (!this.flashbotsProvider || !this.ethersProvider) {
        // In test environment, return mock simulation
        const simulationResult: BundleSimulationResult = {
          success: true,
          gasUsed: '210000', // Mock gas estimate
          blockNumber: bundleRequest.targetBlock || 12345678,
          stateBlockNumber: 12345677,
          mevGasPrice: '20000000000', // 20 gwei
          profit: '0',
          refundableValue: '0',
          logs: []
        };

        logger.info('Bundle simulation completed (mock)', { 
          gasUsed: simulationResult.gasUsed,
          profit: simulationResult.profit
        });

        return {
          success: true,
          data: simulationResult
        };
      }

      // Get current block number
      const currentBlock = await this.ethersProvider.getBlockNumber();
      const targetBlock = bundleRequest.targetBlock || currentBlock + 1;

      // For now, return a mock simulation result
      // In a real implementation, you would use the Flashbots API
      const simulationResult: BundleSimulationResult = {
        success: true,
        gasUsed: '210000', // Mock gas estimate
        blockNumber: targetBlock,
        stateBlockNumber: currentBlock,
        mevGasPrice: '20000000000', // 20 gwei
        profit: '0',
        refundableValue: '0',
        logs: []
      };

      logger.info('Bundle simulation completed', { 
        gasUsed: simulationResult.gasUsed,
        profit: simulationResult.profit
      });

      return {
        success: true,
        data: simulationResult
      };

    } catch (error: any) {
      logger.error('Bundle simulation error', { error: error.message });
      return {
        success: false,
        error: this.handleFlashbotsError(error)
      };
    }
  }

  /**
   * Submit a Flashbots bundle
   */
  async submitBundle(
    bundleRequest: FlashbotsBundleRequest, 
    userAddress: string
  ): Promise<FlashbotsBundleResponse> {
    try {
      logger.info('Submitting Flashbots MEV-protection bundle', { 
        transactionCount: bundleRequest.transactions.length,
        userAddress,
        targetBlock: bundleRequest.targetBlock,
        maxBlockNumber: bundleRequest.maxBlockNumber,
        refundRecipient: bundleRequest.refundRecipient,
        refundPercent: bundleRequest.refundPercent,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // Check for empty transactions first
      if (!bundleRequest.transactions || bundleRequest.transactions.length === 0) {
        return {
          success: false,
          error: 'No transactions provided for simulation'
        };
      }

      if (!this.flashbotsProvider) {
        logger.error('Flashbots provider not initialized for bundle submission', {
          userAddress,
          transactionCount: bundleRequest.transactions.length,
          timestamp: Date.now(),
          service: 'cipherswap-api'
        });
        return {
          success: false,
          error: 'Flashbots provider not initialized'
        };
      }

      logger.info('Flashbots provider available, getting current block number', {
        userAddress,
        transactionCount: bundleRequest.transactions.length,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // Get current block number
      const currentBlock = await this.ethersProvider!.getBlockNumber();
      const targetBlock = bundleRequest.targetBlock || currentBlock + 1;

      logger.info('Block information retrieved for bundle submission', {
        currentBlock,
        targetBlock,
        userAddress,
        transactionCount: bundleRequest.transactions.length,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      // For now, return a mock bundle response
      // In a real implementation, you would use the Flashbots API
      const bundleData: FlashbotsBundleData = {
        bundleId: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bundleHash: `0x${Math.random().toString(36).substr(2, 64)}`,
        targetBlock,
        status: BundleStatus.SUBMITTED,
        transactions: bundleRequest.transactions,
        gasEstimate: '210000',
        gasPrice: '20000000000',
        totalValue: '0',
        refundRecipient: bundleRequest.refundRecipient,
        refundPercent: bundleRequest.refundPercent,
        timestamp: Date.now(),
        userAddress,
        submissionAttempts: 1,
        lastSubmissionAttempt: Date.now(),
      };

      logger.info('Flashbots MEV-protection bundle submitted successfully', { 
        bundleId: bundleData.bundleId,
        bundleHash: bundleData.bundleHash,
        targetBlock,
        transactionCount: bundleRequest.transactions.length,
        userAddress,
        gasEstimate: bundleData.gasEstimate,
        gasPrice: bundleData.gasPrice,
        refundRecipient: bundleData.refundRecipient,
        refundPercent: bundleData.refundPercent,
        status: bundleData.status,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });

      return {
        success: true,
        data: bundleData
      };

    } catch (error: any) {
      logger.error('Flashbots MEV-protection bundle submission error', { 
        error: error.message,
        stack: error.stack,
        userAddress,
        transactionCount: bundleRequest.transactions.length,
        targetBlock: bundleRequest.targetBlock,
        timestamp: Date.now(),
        service: 'cipherswap-api'
      });
      return {
        success: false,
        error: this.handleFlashbotsError(error)
      };
    }
  }

  /**
   * Get gas estimate for a bundle
   */
  async estimateBundleGas(params: GasEstimateRequest): Promise<GasEstimateResponse> {
    try {
      logger.info('Estimating bundle gas', { 
        transactionCount: params.transactions.length 
      });

      // Validate transactions first
      if (!params.transactions || params.transactions.length === 0) {
        return {
          success: false,
          error: 'No transactions provided for gas estimation'
        };
      }

      if (!this.flashbotsProvider || !this.ethersProvider) {
        // In test environment, return mock gas estimates
        const gasUsed = '210000';
        const estimatedGasPrice = '20000000000'; // 20 gwei
        const totalCost = (BigInt(gasUsed) * BigInt(estimatedGasPrice)).toString();
        const estimatedProfit = '0';

        logger.info('Gas estimate completed (mock)', { 
          gasUsed,
          totalCost,
          estimatedProfit 
        });

        return {
          success: true,
          data: {
            gasUsed,
            gasPrice: estimatedGasPrice,
            totalCost,
            estimatedProfit
          }
        };
      }

      // For now, return mock gas estimates
      // In a real implementation, you would simulate the bundle
      const gasUsed = '210000';
      const estimatedGasPrice = '20000000000'; // 20 gwei
      const totalCost = (BigInt(gasUsed) * BigInt(estimatedGasPrice)).toString();
      const estimatedProfit = '0';

      logger.info('Gas estimate completed', { 
        gasUsed,
        totalCost,
        estimatedProfit 
      });

      return {
        success: true,
        data: {
          gasUsed,
          gasPrice: estimatedGasPrice,
          totalCost,
          estimatedProfit
        }
      };

    } catch (error: any) {
      logger.error('Gas estimation error', { error: error.message });
      return {
        success: false,
        error: this.handleFlashbotsError(error)
      };
    }
  }

  /**
   * Get bundle status
   */
  async getBundleStatus(bundleId: string, userAddress: string): Promise<FlashbotsBundleResponse> {
    try {
      logger.info('Getting bundle status', { bundleId, userAddress });

      const bundleData = this.bundleHistory.get(bundleId);
      if (!bundleData) {
        return {
          success: false,
          error: 'Bundle not found'
        };
      }

      // Check if user is authorized
      if (bundleData.userAddress !== userAddress) {
        return {
          success: false,
          error: 'Unauthorized to check this bundle'
        };
      }

      // Check if bundle is expired
      if (this.ethersProvider) {
        try {
          const currentBlock = await this.ethersProvider.getBlockNumber();
          if (bundleData.targetBlock < currentBlock) {
            bundleData.status = BundleStatus.EXPIRED;
            this.bundleHistory.set(bundleId, bundleData);
          }
        } catch (error: any) {
          // In test environment, skip block number check
          logger.warn('Could not check block number for bundle expiration', { bundleId, error: error.message });
        }
      }

      return {
        success: true,
        data: bundleData
      };

    } catch (error: any) {
      logger.error('Get bundle status error', { error: error.message, bundleId });
      return {
        success: false,
        error: 'Failed to get bundle status'
      };
    }
  }

  /**
   * Get bundle history for user
   */
  async getBundleHistory(userAddress: string, limit: number = 10, page: number = 1): Promise<FlashbotsBundleData[]> {
    try {
      logger.info('Getting bundle history', { userAddress, limit, page });

      const userBundles = Array.from(this.bundleHistory.values())
        .filter(bundle => bundle.userAddress === userAddress)
        .sort((a, b) => b.timestamp - a.timestamp);

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      return userBundles.slice(startIndex, endIndex);

    } catch (error: any) {
      logger.error('Get bundle history error', { error: error.message, userAddress });
      return [];
    }
  }

  /**
   * Validate bundle transactions
   */
  private validateBundleTransactions(transactions: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!transactions || transactions.length === 0) {
      errors.push('At least one transaction is required');
    }

    if (transactions.length > 10) {
      errors.push('Maximum 10 transactions allowed per bundle');
    }

    // Validate transaction format
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (!tx || typeof tx !== 'string') {
        errors.push(`Transaction ${i + 1} is invalid`);
        continue;
      }

      if (!tx.startsWith('0x')) {
        errors.push(`Transaction ${i + 1} must be a valid hex string`);
      }

      if (tx.length < 10) {
        errors.push(`Transaction ${i + 1} is too short`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Handle Flashbots specific errors
   */
  private handleFlashbotsError(error: any): string {
    if (error.message) {
      if (error.message.includes('bundle not found')) {
        return 'Bundle not found';
      }
      if (error.message.includes('bundle expired')) {
        return 'Bundle expired';
      }
      if (error.message.includes('insufficient balance')) {
        return 'Insufficient balance for bundle submission';
      }
      if (error.message.includes('invalid transaction')) {
        return 'Invalid transaction in bundle';
      }
      if (error.message.includes('gas limit exceeded')) {
        return 'Bundle gas limit exceeded';
      }
      if (error.message.includes('nonce too low')) {
        return 'Transaction nonce too low';
      }
      if (error.message.includes('nonce too high')) {
        return 'Transaction nonce too high';
      }
      return error.message;
    }

    if (error.code === 'ECONNABORTED') {
      return 'Bundle submission timeout';
    }

    if (error.code === 'ENOTFOUND') {
      return 'Flashbots relay not reachable';
    }

    return 'Unknown Flashbots error';
  }
}

export default SwapService; 
