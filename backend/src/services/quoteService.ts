import axios, { AxiosResponse } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { SimulationUtils } from '../utils/simulation';
import { 
  QuoteRequest, 
  QuoteResponse, 
  QuoteData, 
  QuoteValidation,
  QUOTE_CONSTANTS,
  QuoteErrorCodes,
  QuoteHistory
} from '../types/quote';

export class QuoteService {
  private readonly baseUrl = 'https://api.1inch.dev';
  private readonly apiKey: string;
  private quoteHistory: Map<string, QuoteHistory> = new Map();
  
  constructor() {
    this.apiKey = config.INCH_API_KEY;
    if (!this.apiKey) {
      throw new Error('1inch API key is required');
    }
    logger.info('QuoteService initialized', { 
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey.length,
      apiKeyPrefix: this.apiKey.substring(0, 10) + '...'
    });
  }
  
  /**
   * Get spot price from 1inch API
   */
  async getSpotPrice(fromToken: string, toToken: string, chainId: number): Promise<{
    success: boolean;
    data?: {
      price: string;
      fromToken: string;
      toToken: string;
    };
    error?: string;
  }> {
    try {
      logger.info('Getting spot price from 1inch API', { 
        fromToken,
        toToken,
        chainId
      });
      
      // Use the 1inch spot price endpoint
      const apiUrl = `${this.baseUrl}/spot/v1/quote`;
      
      const requestParams = {
        src: fromToken,
        dst: toToken,
        amount: '1000000000000000000', // 1 ETH in wei
        chainId: chainId
      };
      
      logger.info('Calling 1inch spot API', {
        url: apiUrl,
        params: requestParams
      });
      
      // Call 1inch spot API
      const response: AxiosResponse = await axios.get(apiUrl, {
        params: requestParams,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      logger.info('1inch spot API response received', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });
      
      if (response.status === 200 && response.data) {
        const price = response.data.toTokenAmount;
        
        logger.info('Spot price fetched successfully', {
          fromToken,
          toToken,
          price
        });
        
        return {
          success: true,
          data: {
            price,
            fromToken,
            toToken
          }
        };
      } else {
        logger.error('1inch spot API error', {
          status: response.status,
          data: response.data
        });
        return {
          success: false,
          error: 'Failed to get spot price from 1inch API'
        };
      }
      
    } catch (error: any) {
      logger.error('Spot price fetch error', { 
        error: error.toString(),
        stack: error.stack 
      });
      
      const errorMessage = this.handleQuoteError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get quote from 1inch API
   */
  async getQuote(params: QuoteRequest): Promise<QuoteResponse> {
    try {
      logger.info('Getting quote from 1inch API', { 
        params,
        amountType: typeof params.amount,
        amountValue: params.amount,
        parsedAmount: parseFloat(params.amount)
      });
      
      // Validate request
      const validation = this.validateQuoteRequest(params);
      if (!validation.isValid) {
        logger.error('Quote validation failed', { errors: validation.errors });
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Use token addresses directly (frontend sends correct addresses)
      const fromTokenAddress = params.fromToken;
      const toTokenAddress = params.toToken;
      
      logger.info('Using token addresses directly', { 
        fromToken: params.fromToken, 
        fromTokenAddress,
        toToken: params.toToken, 
        toTokenAddress 
      });
      
      // Convert ETH amount to wei for 1inch API
      const amountInWei = (parseFloat(params.amount) * Math.pow(10, 18)).toString();
      
      // Use the correct 1inch API endpoint (chainId as path param)
      const apiUrl = `${this.baseUrl}/swap/v5.2/${params.chainId}/quote`;
      
      const requestParams = {
        src: fromTokenAddress,
        dst: toTokenAddress,
        amount: amountInWei,
        from: params.userAddress
      };
      
      logger.info('Calling 1inch API', {
        url: apiUrl,
        params: requestParams,
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey.substring(0, 10) + '...'
      });
      
      // Call 1inch API
      const response: AxiosResponse = await axios.get(apiUrl, {
        params: requestParams,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });
      
      logger.info('1inch API response received', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });
      
      // Format response
      const quoteData = this.formatQuoteResponse(response.data, params);
      
      // Store quote in history
      this.storeQuoteHistory(params, quoteData);
      
      logger.info('Quote received successfully', { 
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        slippage: quoteData.slippage
      });
      
      return {
        success: true,
        data: quoteData
      };
      
    } catch (error: any) {
      logger.error('Quote service error', { 
        error: error.message, 
        params,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        responseHeaders: error.response?.headers,
        stack: error.stack
      });
      
      return {
        success: false,
        error: this.handleQuoteError(error)
      };
    }
  }
  
  /**
   * Simulate swap with current quote
   */
  async simulateSwap(quoteData: QuoteData, userAddress: string): Promise<any> {
    try {
      logger.info('Simulating swap', { userAddress });
      
      const simulation = SimulationUtils.simulateSwap(quoteData);
      
      return {
        success: true,
        data: {
          ...simulation,
          userAddress,
          timestamp: Date.now()
        }
      };
      
    } catch (error: any) {
      logger.error('Simulation error', { error: error.message });
      return {
        success: false,
        error: 'Simulation failed'
      };
    }
  }
  
  /**
   * Get quote history for user
   */
  async getQuoteHistory(userAddress?: string, limit: number = 10): Promise<QuoteHistory[]> {
    try {
      logger.info('Getting quote history', { userAddress, limit });
      
      let quotes = Array.from(this.quoteHistory.values());
      
      // Filter by user address if provided
      if (userAddress) {
        quotes = quotes.filter(quote => quote.userAddress === userAddress);
      }
      
      // Sort by timestamp (newest first)
      quotes.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply limit
      quotes = quotes.slice(0, limit);
      
      logger.info('Quote history retrieved', { 
        count: quotes.length,
        userAddress 
      });
      
      return quotes;
      
    } catch (error: any) {
      logger.error('Get quote history error', { error: error.message });
      return [];
    }
  }
  
  /**
   * Store quote in history
   */
  private storeQuoteHistory(params: QuoteRequest, quoteData: QuoteData): void {
    const historyId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const quoteHistory: QuoteHistory = {
      id: historyId,
      fromToken: params.fromToken,
      toToken: params.toToken,
      amount: params.amount,
      quote: quoteData,
      timestamp: Date.now(),
      userAddress: params.userAddress
    };
    
    this.quoteHistory.set(historyId, quoteHistory);
    
    // Clean up old quotes (keep only last 100)
    if (this.quoteHistory.size > QUOTE_CONSTANTS.MAX_QUOTE_HISTORY) {
      const sortedQuotes = Array.from(this.quoteHistory.entries())
        .sort(([,a], [,b]) => b.timestamp - a.timestamp)
        .slice(0, QUOTE_CONSTANTS.MAX_QUOTE_HISTORY);
      
      this.quoteHistory.clear();
      sortedQuotes.forEach(([id, quote]) => {
        this.quoteHistory.set(id, quote);
      });
    }
  }
  
  /**
   * Validate quote request parameters
   */
  private validateQuoteRequest(params: QuoteRequest): QuoteValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    
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
    
         // Amount validation
     if (params.amount) {
       const amount = parseFloat(params.amount);
       // QUOTE_CONSTANTS values are already in ETH units, not wei
       const minAmountEth = parseFloat(QUOTE_CONSTANTS.MIN_AMOUNT);
       const maxAmountEth = parseFloat(QUOTE_CONSTANTS.MAX_AMOUNT);
       
       logger.info('Amount validation DEBUG', {
         inputAmount: params.amount,
         parsedAmount: amount,
         minAmountEth,
         maxAmountEth,
         QUOTE_CONSTANTS_MIN: QUOTE_CONSTANTS.MIN_AMOUNT,
         QUOTE_CONSTANTS_MAX: QUOTE_CONSTANTS.MAX_AMOUNT,
         isAmountValid: amount >= minAmountEth && amount <= maxAmountEth
       });
       
       if (amount < minAmountEth) {
         errors.push(`Amount too small. Minimum: ${minAmountEth} ETH`);
       }
       if (amount > maxAmountEth) {
         errors.push(`Amount too large. Maximum: ${maxAmountEth} ETH`);
       }
     }
    
    // Slippage validation
    if (params.slippage && params.slippage > QUOTE_CONSTANTS.MAX_SLIPPAGE) {
      errors.push(`Slippage too high. Maximum: ${QUOTE_CONSTANTS.MAX_SLIPPAGE}%`);
    }
    
    // Token validation (basic)
    if (params.fromToken === params.toToken) {
      errors.push('fromToken and toToken cannot be the same');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Format 1inch API response
   */
  private formatQuoteResponse(data: any, params: QuoteRequest): QuoteData {
    logger.info('Formatting quote response', { 
      dataKeys: Object.keys(data),
      hasToAmount: !!data.toAmount,
      toAmount: data.toAmount
    });
    
    // Extract amounts from 1inch response
    const fromTokenAmount = params.amount; // User input amount in ETH
    const toTokenAmount = data.toAmount || '0'; // 1inch response amount in wei
    
    // Convert amounts to numbers for calculations
    const fromAmountEth = parseFloat(fromTokenAmount);
    const toAmountWei = parseFloat(toTokenAmount);
    
    // 1. DYNAMIC PRICE IMPACT CALCULATION
    const priceImpact = this.calculatePriceImpact(fromAmountEth, toAmountWei, params.toToken);
    
    // 2. DYNAMIC SLIPPAGE CALCULATION
    const slippage = this.calculateSlippage(params.slippage || 0.5, fromAmountEth, toAmountWei);
    
    // 3. DYNAMIC ESTIMATED GAINS CALCULATION
    const estimatedGains = this.calculateEstimatedGains(fromAmountEth, toAmountWei, params.fromToken, params.toToken);
    
    // Calculate gas estimate
    const gasEstimate = SimulationUtils.calculateGasCost(
      data.estimatedGas || '500000',
      '20000000000', // 20 gwei
      1 // Ethereum mainnet
    );
    
    // Extract protocol and route steps from 1inch response
    const protocol = this.extractProtocolFromResponse(data);
    const routeSteps = this.calculateRouteSteps(data);
    
    // Get token decimals for proper formatting
    const toTokenDecimals = this.getTokenDecimals(params.toToken);
    
    // Create a properly formatted quote response
    const formattedQuote = {
      quote: data,
      fromTokenAmount: fromTokenAmount,
      toTokenAmount: toTokenAmount,
      toTokenDecimals: toTokenDecimals,
      estimatedGas: gasEstimate,
      slippage: slippage,
      priceImpact: priceImpact,
      estimatedGains: estimatedGains.toString(), // Convert to string
      route: data.route || [],
      protocol: protocol,
      routeSteps: routeSteps,
      timestamp: Date.now()
    };
    
    logger.info('Formatted quote response', { 
      fromTokenAmount: formattedQuote.fromTokenAmount,
      toTokenAmount: formattedQuote.toTokenAmount,
      toTokenDecimals: formattedQuote.toTokenDecimals,
      priceImpact: formattedQuote.priceImpact,
      slippage: formattedQuote.slippage,
      estimatedGains: formattedQuote.estimatedGains
    });
    
    return formattedQuote;
  }
  
  /**
   * Calculate dynamic price impact based on trade size and liquidity
   */
  private calculatePriceImpact(fromAmountEth: number, toAmountWei: number, toToken: string): number {
    try {
      // Convert toAmount from wei to token units
      const toTokenDecimals = this.getTokenDecimals(toToken);
      const toAmountTokens = toAmountWei / Math.pow(10, toTokenDecimals);
      
      // Calculate price per ETH
      const pricePerEth = toAmountTokens / fromAmountEth;
      
      // Mock pool liquidity (in real scenario, this would come from DEX APIs)
      const poolLiquidity = this.getPoolLiquidity(toToken);
      
      // Calculate price impact using square root formula
      // Price Impact = (Trade Size / Pool Liquidity) * 100
      const tradeSizeUSD = fromAmountEth * this.getEthPrice(); // Convert to USD
      const priceImpact = (tradeSizeUSD / poolLiquidity) * 100;
      
      // Cap price impact at reasonable levels
      const cappedPriceImpact = Math.min(priceImpact, 10); // Max 10%
      
      logger.info('Price impact calculation', {
        fromAmountEth,
        toAmountTokens,
        pricePerEth,
        tradeSizeUSD,
        poolLiquidity,
        priceImpact: cappedPriceImpact
      });
      
      return Math.round(cappedPriceImpact * 100) / 100; // Round to 2 decimal places
    } catch (error: any) {
      logger.error('Price impact calculation failed', { error: error.message });
      return 0.1; // Fallback to 0.1%
    }
  }
  
  /**
   * Calculate dynamic slippage based on user input and market conditions
   */
  private calculateSlippage(userSlippage: number, fromAmountEth: number, toAmountWei: number): number {
    try {
      // Base slippage from user input
      let slippage = userSlippage;
      
      // Adjust based on trade size
      if (fromAmountEth > 10) {
        slippage += 0.2; // Large trades get higher slippage
      } else if (fromAmountEth > 1) {
        slippage += 0.1; // Medium trades get moderate slippage
      }
      
      // Adjust based on market volatility (mock)
      const marketVolatility = this.getMarketVolatility();
      slippage += marketVolatility;
      
      // Cap slippage at reasonable levels
      const cappedSlippage = Math.min(slippage, 5); // Max 5%
      
      logger.info('Slippage calculation', {
        userSlippage,
        fromAmountEth,
        marketVolatility,
        finalSlippage: cappedSlippage
      });
      
      return Math.round(cappedSlippage * 10) / 10; // Round to 1 decimal place
    } catch (error: any) {
      logger.error('Slippage calculation failed', { error: error.message });
      return userSlippage; // Fallback to user input
    }
  }
  
  /**
   * Calculate estimated gains based on price differences and arbitrage opportunities
   */
  private calculateEstimatedGains(fromAmountEth: number, toAmountWei: number, fromToken: string, toToken: string): number {
    try {
      // Get current market prices
      const fromTokenPrice = this.getTokenPrice(fromToken);
      const toTokenPrice = this.getTokenPrice(toToken);
      
      // Calculate expected vs actual amounts
      const expectedToAmount = (fromAmountEth * fromTokenPrice) / toTokenPrice;
      const actualToAmount = toAmountWei / Math.pow(10, this.getTokenDecimals(toToken));
      
      // Calculate gains as percentage
      const gainsPercentage = ((actualToAmount - expectedToAmount) / expectedToAmount) * 100;
      
      // Check for arbitrage opportunities
      const arbitrageGains = this.calculateArbitrageGains(fromToken, toToken, fromAmountEth);
      
      // Total gains
      const totalGains = gainsPercentage + arbitrageGains;
      
      logger.info('Estimated gains calculation', {
        fromTokenPrice,
        toTokenPrice,
        expectedToAmount,
        actualToAmount,
        gainsPercentage,
        arbitrageGains,
        totalGains
      });
      
      return Math.round(totalGains * 1000000) / 1000000; // Round to 6 decimal places
    } catch (error: any) {
      logger.error('Estimated gains calculation failed', { error: error.message });
      return 0.002; // Fallback to 0.2%
    }
  }
  
  /**
   * Helper methods for price and liquidity data
   */
  private getTokenDecimals(token: string): number {
    // Token address to decimals mapping
    const tokenDecimals = {
      // Ethereum mainnet addresses
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 18, // WETH
      '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6,  // USDC
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,  // USDT
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 18, // DAI
      // Sepolia testnet addresses
      '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9': 18, // WETH
      '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238': 6,  // USDC
      '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0': 6,  // USDT
      '0x68194a729C2450ad26072b3D33ADaCbcef39D574': 18, // DAI
      // Token symbols (fallback)
      'ETH': 18,
      'USDC': 6,
      'USDT': 6,
      'DAI': 18
    };
    return tokenDecimals[token as keyof typeof tokenDecimals] || 18;
  }
  
  private getEthPrice(): number {
    // Mock ETH price (in real scenario, this would come from price feeds)
    return 2000; // $2000 per ETH
  }
  
  private getTokenPrice(token: string): number {
    const prices = {
      'ETH': 2000,
      'USDC': 1,
      'USDT': 1,
      'DAI': 1
    };
    return prices[token as keyof typeof prices] || 1;
  }
  
  private getPoolLiquidity(token: string): number {
    // Mock pool liquidity in USD
    const liquidity = {
      'USDC': 10000000, // $10M liquidity
      'USDT': 8000000,  // $8M liquidity
      'DAI': 5000000    // $5M liquidity
    };
    return liquidity[token as keyof typeof liquidity] || 1000000;
  }
  
  private getMarketVolatility(): number {
    // Mock market volatility (in real scenario, this would come from market data)
    return Math.random() * 0.3; // 0-0.3% random volatility
  }
  
  private calculateArbitrageGains(fromToken: string, toToken: string, amount: number): number {
    // Mock arbitrage calculation
    // In real scenario, this would check multiple DEXes for price differences
    const priceDifferences = {
      'ETH-USDC': 0.05,  // 0.05% arbitrage opportunity
      'ETH-USDT': 0.03,  // 0.03% arbitrage opportunity
      'ETH-DAI': 0.02    // 0.02% arbitrage opportunity
    };
    
    const pair = `${fromToken}-${toToken}`;
    return priceDifferences[pair as keyof typeof priceDifferences] || 0;
  }
  
  /**
   * Handle different types of errors
   */
  private handleQuoteError(error: any): string {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Invalid request parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'API key rate limit exceeded';
        case 404:
          return 'Quote not found';
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
   * Get supported tokens for a chain
   */
  async getSupportedTokens(chainId: number): Promise<any[]> {
    try {
      logger.info('Fetching supported tokens', { chainId });
      
      const response = await axios.get(`${this.baseUrl}/swap/v5.2/tokens`, {
        params: {
          chain: chainId
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      const tokens = response.data.tokens || [];
      
      logger.info('Supported tokens fetched successfully', { 
        chainId, 
        tokenCount: tokens.length 
      });
      
      return tokens;
      
    } catch (error: any) {
      logger.error('Error fetching supported tokens', { 
        error: error.message, 
        chainId,
        status: error.response?.status 
      });
      
      // Return common tokens as fallback
      return this.getFallbackTokens(chainId);
    }
  }
  
  /**
   * Get fallback tokens when API fails
   */
  private getFallbackTokens(chainId: number): any[] {
    const commonTokens = {
      1: [ // Ethereum Mainnet
        { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
        { address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
        { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 }
      ],
      137: [ // Polygon
        { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC', name: 'Wrapped MATIC', decimals: 18 },
        { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
        { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6 }
      ],
      42161: [ // Arbitrum
        { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
        { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
        { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', symbol: 'USDC', name: 'USD Coin', decimals: 6 }
      ]
    };
    
    return commonTokens[chainId as keyof typeof commonTokens] || [];
  }

  /**
   * Convert token symbol to address
   */
  private getTokenAddress(symbol: string, chainId: number): string {
    const tokenMap = {
      11155111: { // Sepolia testnet
        'ETH': '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // WETH on Sepolia
        'USDC': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
        'USDT': '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // USDT on Sepolia
        'DAI': '0x68194a729C2450ad26072b3D33ADaCbcef39D574'   // DAI on Sepolia
      },
      1: { // Ethereum mainnet
        'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        'USDC': '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',   // DAI
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeEe': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // ETH alias
        '0xA0b86a33E6441b8c4C8C1d1BecBfC3AC09A21E70': '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC alias
      }
    };
    
    const chainTokens = tokenMap[chainId as keyof typeof tokenMap];
    if (!chainTokens) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    
    const address = chainTokens[symbol as keyof typeof chainTokens];
    if (!address) {
      throw new Error(`Unsupported token: ${symbol} on chain ${chainId}`);
    }
    
    return address;
  }

  /**
   * Get real-time network analytics
   */
  async getNetworkAnalytics(): Promise<{
    gasPrice: string;
    networkCongestion: number;
    riskLevel: string;
    chain: string;
  }> {
    try {
      // Get real gas price from Etherscan API
      const gasPrice = await this.getRealGasPrice();
      
      // Calculate network congestion based on gas price
      const networkCongestion = this.calculateNetworkCongestion(gasPrice);
      
      // Calculate risk level based on gas price and congestion
      const riskLevel = this.calculateRiskLevel(gasPrice, networkCongestion);
      
      logger.info('Network analytics fetched', {
        gasPrice,
        networkCongestion,
        riskLevel
      });
      
      return {
        gasPrice: `${gasPrice} Gwei`,
        networkCongestion,
        riskLevel,
        chain: 'Ethereum Mainnet'
      };
      
    } catch (error: any) {
      logger.error('Network analytics fetch failed', { error: error.message });
      
      // Fallback to mock data
      return {
        gasPrice: '20 Gwei',
        networkCongestion: 15,
        riskLevel: 'LOW',
        chain: 'Ethereum Mainnet'
      };
    }
  }
  
  /**
   * Get real gas price from Etherscan API
   */
  private async getRealGasPrice(): Promise<number> {
    try {
      // Use Etherscan API to get current gas price
      const response = await axios.get('https://api.etherscan.io/api', {
        params: {
          module: 'gastracker',
          action: 'gasoracle',
          apikey: 'YourApiKeyToken' // You'll need to get a free API key from Etherscan
        },
        timeout: 5000
      });
      
      if (response.data.status === '1' && response.data.result) {
        const gasPrice = parseInt(response.data.result.SafeGasPrice);
        logger.info('Real gas price fetched', { gasPrice });
        return gasPrice;
      }
      
      // Fallback: Use Ethereum RPC
      return await this.getGasPriceFromRPC();
      
    } catch (error: any) {
      logger.error('Etherscan API failed', { error: error.message });
      return await this.getGasPriceFromRPC();
    }
  }
  
  /**
   * Get gas price from Ethereum RPC
   */
  private async getGasPriceFromRPC(): Promise<number> {
    try {
      // Use public Ethereum RPC endpoint
      const response = await axios.post('https://eth-mainnet.g.alchemy.com/v2/demo', {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      if (response.data.result) {
        const gasPriceWei = parseInt(response.data.result, 16);
        const gasPriceGwei = Math.round(gasPriceWei / 1000000000); // Convert wei to gwei
        logger.info('Gas price from RPC', { gasPriceGwei });
        return gasPriceGwei;
      }
      
      throw new Error('Invalid RPC response');
      
    } catch (error: any) {
      logger.error('RPC gas price failed', { error: error.message });
      return 20; // Fallback gas price
    }
  }
  
  /**
   * Calculate network congestion based on gas price
   */
  private calculateNetworkCongestion(gasPrice: number): number {
    // Congestion calculation based on gas price ranges
    if (gasPrice < 20) {
      return Math.round((gasPrice / 20) * 30); // 0-30% for low gas
    } else if (gasPrice < 50) {
      return Math.round(30 + ((gasPrice - 20) / 30) * 40); // 30-70% for medium gas
    } else if (gasPrice < 100) {
      return Math.round(70 + ((gasPrice - 50) / 50) * 25); // 70-95% for high gas
    } else {
      return Math.round(95 + ((gasPrice - 100) / 100) * 5); // 95-100% for very high gas
    }
  }
  
  /**
   * Calculate risk level based on gas price and congestion
   */
  private calculateRiskLevel(gasPrice: number, congestion: number): string {
    const riskScore = (gasPrice * 0.6) + (congestion * 0.4);
    
    if (riskScore < 30) return 'LOW';
    if (riskScore < 60) return 'MEDIUM';
    if (riskScore < 80) return 'HIGH';
    return 'CRITICAL';
  }
  
  /**
   * Extract protocol information from 1inch response
   */
  private extractProtocolFromResponse(data: any): string {
    try {
      // Check if 1inch response has protocol information
      if (data.protocol) {
        return data.protocol;
      }
      
      // Check if route has protocol information
      if (data.route && data.route.length > 0) {
        const firstStep = data.route[0];
        if (firstStep.protocol) {
          return firstStep.protocol;
        }
      }
      
      // Check if tx has protocol information
      if (data.tx && data.tx.protocol) {
        return data.tx.protocol;
      }
      
      // Default to 1inch aggregation
      return '1inch Aggregation';
    } catch (error: any) {
      logger.error('Failed to extract protocol from response', { error: error.message });
      return '1inch Aggregation';
    }
  }
  
  /**
   * Calculate number of route steps from 1inch response
   */
  private calculateRouteSteps(data: any): number {
    try {
      // Check if route array exists
      if (data.route && Array.isArray(data.route)) {
        return data.route.length;
      }
      
      // Check if tx has path information
      if (data.tx && data.tx.path) {
        return data.tx.path.length;
      }
      
      // Check if there's a single step (direct swap)
      if (data.toAmount && data.fromAmount) {
        return 1;
      }
      
      // Default to 1 step
      return 1;
    } catch (error: any) {
      logger.error('Failed to calculate route steps', { error: error.message });
      return 1;
    }
  }

  /**
   * Get multiple quotes for different tokens and strategies
   */
  async getMultipleQuotes(params: QuoteRequest): Promise<{
    success: boolean;
    data?: {
      tokenQuotes: Array<{
        token: string;
        tokenSymbol: string;
        tokenAddress: string;
        amount: string;
        slippage: number;
        priceImpact: number;
        estimatedGas: string;
        netValue: string;
        rank: number;
      }>;
      strategyQuotes: Array<{
        strategy: string;
        description: string;
        gasCost: string;
        slippage: number;
        security: string;
        netValue: string;
        rank: number;
      }>;
      recommendations: Array<{
        type: 'BEST_VALUE' | 'LOWEST_SLIPPAGE' | 'MOST_SECURE' | 'GASLESS';
        token?: string;
        strategy?: string;
        reason: string;
        savings?: string;
      }>;
    };
    error?: string;
  }> {
    try {
      logger.info('Getting multiple quotes for analysis', { 
        params,
        chainId: params.chainId,
        fromToken: params.fromToken,
        amount: params.amount
      });

      // Popular tokens to compare - use correct addresses for the chain
      const popularTokens = [
        { symbol: 'USDC', address: this.getTokenAddress('USDC', params.chainId) },
        { symbol: 'DAI', address: this.getTokenAddress('DAI', params.chainId) },
        { symbol: 'USDT', address: this.getTokenAddress('USDT', params.chainId) },
        { symbol: 'WETH', address: this.getTokenAddress('ETH', params.chainId) }
      ];

      logger.info('Popular tokens for quotes', {
        tokens: popularTokens.map(t => ({ symbol: t.symbol, address: t.address }))
      });

      // Get quotes for all tokens
      const tokenQuotes = await Promise.all(
        popularTokens.map(async (token) => {
          try {
            logger.info(`Getting quote for ${token.symbol}`, {
              symbol: token.symbol,
              address: token.address,
              chainId: params.chainId
            });

            // Use regular quote API for all tokens (including USDC and USDT)
            const quoteParams = {
              ...params,
              toToken: token.address
            };
            
            logger.info(`Calling getQuote for ${token.symbol}`, {
              quoteParams: {
                fromToken: quoteParams.fromToken,
                toToken: quoteParams.toToken,
                amount: quoteParams.amount,
                chainId: quoteParams.chainId
              }
            });
            
            const quoteResponse = await this.getQuote(quoteParams);
            
            logger.info(`Quote response for ${token.symbol}`, {
              success: quoteResponse.success,
              hasData: !!quoteResponse.data,
              error: quoteResponse.error
            });
            
            if (quoteResponse.success && quoteResponse.data) {
              const quote = quoteResponse.data;
              const gasCostEth = parseFloat(quote.estimatedGas) / Math.pow(10, 18);
              
              // Convert toTokenAmount to proper decimal format
              const toTokenDecimals = quote.toTokenDecimals || 18;
              const toTokenAmountInWei = parseFloat(quote.toTokenAmount || '0');
              const toTokenAmountInNormal = toTokenAmountInWei / Math.pow(10, toTokenDecimals);
              
              // Calculate net value: received amount minus gas cost
              const netValueInEth = toTokenAmountInNormal - gasCostEth;
              
              logger.info(`Successfully calculated quote for ${token.symbol}`, {
                toTokenAmount: quote.toTokenAmount,
                toTokenDecimals: quote.toTokenDecimals,
                toTokenAmountInNormal,
                gasCostEth,
                netValueInEth
              });
              
              return {
                token: token.symbol,
                tokenSymbol: token.symbol,
                tokenAddress: token.address,
                amount: toTokenAmountInNormal.toString(),
                slippage: quote.slippage,
                priceImpact: quote.priceImpact,
                estimatedGas: quote.estimatedGas,
                netValue: netValueInEth.toString(),
                rank: 0 // Will be calculated later
              };
            } else {
              logger.error(`Quote failed for ${token.symbol}`, {
                error: quoteResponse.error,
                success: quoteResponse.success
              });
              return null;
            }
          } catch (error: any) {
            logger.error(`Failed to get quote for ${token.symbol}`, { 
              error: error.toString(),
              stack: error.stack 
            });
            return null;
          }
        })
      );

      // Filter out failed quotes and calculate rankings
      const validTokenQuotes = tokenQuotes
        .filter(quote => quote !== null)
        .sort((a, b) => parseFloat(b.netValue) - parseFloat(a.netValue))
        .map((quote, index) => ({ ...quote, rank: index + 1 }));

      logger.info('Valid token quotes', {
        totalQuotes: tokenQuotes.length,
        validQuotes: validTokenQuotes.length,
        validQuoteSymbols: validTokenQuotes.map(q => q.tokenSymbol)
      });

      // Get real strategy gas estimates
      const strategyQuotes = await this.getRealStrategyQuotes(params, validTokenQuotes);

      // Generate recommendations
      const recommendations = this.generateRecommendations(validTokenQuotes, strategyQuotes);

      return {
        success: true,
        data: {
          tokenQuotes: validTokenQuotes,
          strategyQuotes,
          recommendations
        }
      };

    } catch (error: any) {
      logger.error('Multiple quotes error', { 
        error: error.toString(),
        stack: error.stack 
      });
      return {
        success: false,
        error: 'Failed to get multiple quotes'
      };
    }
  }

  /**
   * Get real strategy gas estimates using various APIs
   */
  private async getRealStrategyQuotes(params: QuoteRequest, tokenQuotes: any[]): Promise<any[]> {
    try {
      const baseTokenQuote = tokenQuotes[0];
      if (!baseTokenQuote) {
        return this.getFallbackStrategyQuotes(params, tokenQuotes);
      }

      const baseNetValue = parseFloat(baseTokenQuote.netValue || '0');
      const userSlippage = params.slippage || 0.5;
      
      // Calculate dynamic slippage for each strategy based on user input
      const standardSlippage = this.calculateSlippage(userSlippage, parseFloat(params.amount), 0);
      const mevSlippage = this.calculateSlippage(userSlippage * 0.6, parseFloat(params.amount), 0); // MEV protection reduces slippage
      const fusionSlippage = this.calculateSlippage(userSlippage * 1.6, parseFloat(params.amount), 0); // Fusion+ has higher slippage
      const splitSlippage = this.calculateSlippage(userSlippage * 0.4, parseFloat(params.amount), 0); // Split routing reduces slippage
      
      // 1. Standard Swap - Use 1inch gas estimation
      const standardGas = await this.getStandardSwapGas(params);
      const standardSecurity = await this.getStandardSwapSecurity(params, standardSlippage);
      
      // 2. MEV Protected - Use Flashbots gas estimation
      const mevGas = await this.getMEVProtectedGas(params);
      const mevSecurity = await this.getMEVProtectedSecurity(params, mevSlippage);
      
      // 3. Fusion+ - Use 1inch Fusion+ gas estimation
      const fusionGas = await this.getFusionPlusGas(params);
      const fusionSecurity = await this.getFusionPlusSecurity(params, fusionSlippage);
      
      // 4. Split Routing - Use TWAP gas estimation
      const splitGas = await this.getSplitRoutingGas(params);
      const splitSecurity = await this.getSplitRoutingSecurity(params, splitSlippage);

      logger.info('Strategy slippage calculations', {
        userSlippage,
        standardSlippage,
        mevSlippage,
        fusionSlippage,
        splitSlippage
      });

      // Create strategies array with calculated net values
      const strategies = [
        {
          strategy: 'Standard Swap',
          description: 'Basic token swap with 1inch aggregation',
          gasCost: standardGas.toString(),
          slippage: standardSlippage,
          security: standardSecurity,
          netValue: (baseNetValue - standardGas).toString(),
          rank: 0 // Will be assigned dynamically
        },
        {
          strategy: 'MEV Protected',
          description: 'Flashbots bundle with MEV protection',
          gasCost: mevGas.toString(),
          slippage: mevSlippage,
          security: mevSecurity,
          netValue: (baseNetValue - mevGas).toString(),
          rank: 0 // Will be assigned dynamically
        },
        {
          strategy: 'Fusion+',
          description: 'Gasless swaps with 1inch Fusion+',
          gasCost: fusionGas.toString(),
          slippage: fusionSlippage,
          security: fusionSecurity,
          netValue: (baseNetValue - fusionGas).toString(),
          rank: 0 // Will be assigned dynamically
        },
        {
          strategy: 'Split Routing',
          description: 'Large trades split across multiple routes',
          gasCost: splitGas.toString(),
          slippage: splitSlippage,
          security: splitSecurity,
          netValue: (baseNetValue - splitGas).toString(),
          rank: 0 // Will be assigned dynamically
        }
      ];

      // Sort strategies by net value (highest first) and assign ranks
      strategies.sort((a, b) => parseFloat(b.netValue) - parseFloat(a.netValue));
      strategies.forEach((strategy, index) => {
        strategy.rank = index + 1;
      });

      logger.info('Strategy ranking completed', {
        strategies: strategies.map(s => ({
          strategy: s.strategy,
          netValue: s.netValue,
          gasCost: s.gasCost,
          rank: s.rank
        }))
      });

      // Log comprehensive analysis summary
      this.logAnalysisSummary(strategies, params);

      return strategies;

    } catch (error: any) {
      logger.error('Failed to get real strategy quotes', { error: error.toString() });
      return this.getFallbackStrategyQuotes(params, tokenQuotes);
    }
  }

  /**
   * Get Standard Swap gas estimation from 1inch
   */
  private async getStandardSwapGas(params: QuoteRequest): Promise<number> {
    try {
      // Use 1inch gas estimation API
      const response = await axios.get(`${this.baseUrl}/swap/v5.2/${params.chainId}/quote`, {
        params: {
          src: params.fromToken,
          dst: params.toToken,
          amount: (parseFloat(params.amount) * Math.pow(10, 18)).toString(),
          from: params.userAddress
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.estimatedGas) {
        const gasInWei = parseFloat(response.data.estimatedGas);
        const gasInEth = gasInWei / Math.pow(10, 18);
        
        // Apply dynamic adjustment based on network conditions
        const networkAnalytics = await this.getNetworkAnalytics();
        const networkCongestion = networkAnalytics.networkCongestion;
        
        // Adjust gas based on network congestion
        let adjustedGas = gasInEth;
        if (networkCongestion > 0.7) {
          adjustedGas = gasInEth * 1.2; // High congestion: 20% increase
        } else if (networkCongestion > 0.5) {
          adjustedGas = gasInEth * 1.1; // Medium congestion: 10% increase
        } else if (networkCongestion < 0.2) {
          adjustedGas = gasInEth * 0.95; // Low congestion: 5% decrease
        }
        
        logger.info('Standard Swap gas calculated', {
          originalGas: gasInEth,
          adjustedGas,
          networkCongestion
        });
        
        return adjustedGas;
      }

      return 0.012; // Fallback
    } catch (error: any) {
      logger.error('Standard swap gas estimation failed', { error: error.toString() });
      return 0.012; // Fallback
    }
  }

  /**
   * Get Standard Swap security analysis
   */
  private async getStandardSwapSecurity(params: QuoteRequest, slippage?: number): Promise<string> {
    try {
      // Analyze MEV risk, liquidity depth, and historical success
      const mevRisk = await this.getMEVRisk(params);
      const liquidityDepth = await this.getLiquidityDepth(params);
      const historicalSuccess = await this.getHistoricalSuccessRate('standard');
      
      // Use provided slippage or default to user's input slippage
      const calculatedSlippage = slippage || (params.slippage || 0.5);
      
      // Calculate security score (0-100)
      const securityScore = this.calculateSecurityScore({
        mevRisk,
        liquidityDepth,
        historicalSuccess,
        slippage: calculatedSlippage
      });
      
      logger.info('Standard Swap security calculated', { 
        mevRisk, 
        liquidityDepth, 
        historicalSuccess,
        slippage: calculatedSlippage,
        securityScore 
      });
      
      return this.getSecurityLevel(securityScore);
    } catch (error: any) {
      logger.error('Standard swap security calculation failed', { error: error.toString() });
      return 'Medium'; // Fallback
    }
  }

  /**
   * Get MEV Protected gas estimation from Flashbots
   */
  private async getMEVProtectedGas(params: QuoteRequest): Promise<number> {
    try {
      // Flashbots bundle gas estimation
      // In real implementation, this would call Flashbots API
      const baseGas = await this.getStandardSwapGas(params);
      
      // Get current network conditions for dynamic MEV gas calculation
      const networkAnalytics = await this.getNetworkAnalytics();
      const networkCongestion = networkAnalytics.networkCongestion;
      
      // MEV protection gas varies based on network congestion
      // Higher congestion = higher MEV risk = higher protection cost
      let mevMultiplier = 1.25; // Base 25% overhead
      
      if (networkCongestion > 0.7) {
        mevMultiplier = 1.4; // High congestion: 40% overhead
      } else if (networkCongestion > 0.5) {
        mevMultiplier = 1.3; // Medium congestion: 30% overhead
      } else if (networkCongestion < 0.2) {
        mevMultiplier = 1.15; // Low congestion: 15% overhead
      }
      
      const mevGas = baseGas * mevMultiplier;
      
      logger.info('MEV Protected gas calculated', { 
        baseGas, 
        mevGas, 
        networkCongestion, 
        mevMultiplier 
      });
      return mevGas;
    } catch (error: any) {
      logger.error('MEV gas estimation failed', { error: error.toString() });
      return 0.015; // Fallback
    }
  }

  /**
   * Get MEV Protected security analysis
   */
  private async getMEVProtectedSecurity(params: QuoteRequest, slippage?: number): Promise<string> {
    try {
      // MEV protection significantly reduces risk
      const mevRisk = await this.getMEVRisk(params);
      const protectedMevRisk = mevRisk * 0.1; // 90% reduction with Flashbots
      const liquidityDepth = await this.getLiquidityDepth(params);
      const historicalSuccess = await this.getHistoricalSuccessRate('mev_protected');
      
      // Use provided slippage or default to user's input slippage
      const calculatedSlippage = slippage || (params.slippage || 0.5);
      
      const securityScore = this.calculateSecurityScore({
        mevRisk: protectedMevRisk,
        liquidityDepth,
        historicalSuccess,
        slippage: calculatedSlippage
      });
      
      logger.info('MEV Protected security calculated', { 
        mevRisk: protectedMevRisk, 
        liquidityDepth, 
        historicalSuccess,
        slippage: calculatedSlippage,
        securityScore 
      });
      
      return this.getSecurityLevel(securityScore);
    } catch (error: any) {
      logger.error('MEV security calculation failed', { error: error.toString() });
      return 'High'; // Fallback
    }
  }

  /**
   * Get Fusion+ gas estimation from 1inch Fusion API
   */
  private async getFusionPlusGas(params: QuoteRequest): Promise<number> {
    try {
      // 1inch Fusion+ is gasless for users
      // Gas is paid by the protocol
      logger.info('Fusion+ gasless calculation', { gasCost: 0 });
      return 0.000; // Gasless for user
    } catch (error: any) {
      logger.error('Fusion+ gas estimation failed', { error: error.toString() });
      return 0.000; // Fallback to gasless
    }
  }

  /**
   * Get Fusion+ security analysis
   */
  private async getFusionPlusSecurity(params: QuoteRequest, slippage?: number): Promise<string> {
    try {
      // Fusion+ has high security due to intent-based execution
      const mevRisk = 0.05; // Very low with intent-based
      const liquidityDepth = await this.getLiquidityDepth(params);
      const historicalSuccess = await this.getHistoricalSuccessRate('fusion_plus');
      
      // Use provided slippage or default to user's input slippage
      const calculatedSlippage = slippage || (params.slippage || 0.5);
      
      const securityScore = this.calculateSecurityScore({
        mevRisk,
        liquidityDepth,
        historicalSuccess,
        slippage: calculatedSlippage
      });
      
      logger.info('Fusion+ security calculated', { 
        mevRisk, 
        liquidityDepth, 
        historicalSuccess,
        slippage: calculatedSlippage,
        securityScore 
      });
      
      return this.getSecurityLevel(securityScore);
    } catch (error: any) {
      logger.error('Fusion+ security calculation failed', { error: error.toString() });
      return 'High'; // Fallback
    }
  }

  /**
   * Get Split Routing gas estimation for TWAP
   */
  private async getSplitRoutingGas(params: QuoteRequest): Promise<number> {
    try {
      // TWAP (Time-Weighted Average Price) gas estimation
      const baseGas = await this.getStandardSwapGas(params);
      
      // Get current network conditions for dynamic split routing calculation
      const networkAnalytics = await this.getNetworkAnalytics();
      const networkCongestion = networkAnalytics.networkCongestion;
      
      // Split routing requires multiple transactions
      // Each split adds gas cost
      const tradeAmount = parseFloat(params.amount);
      const splitCount = Math.max(2, Math.ceil(tradeAmount / 0.01)); // Split based on amount
      
      // Coordination overhead varies based on network conditions
      let coordinationOverhead = 1.1; // Base 10% overhead
      
      if (networkCongestion > 0.7) {
        coordinationOverhead = 1.2; // High congestion: 20% overhead
      } else if (networkCongestion > 0.5) {
        coordinationOverhead = 1.15; // Medium congestion: 15% overhead
      } else if (networkCongestion < 0.2) {
        coordinationOverhead = 1.05; // Low congestion: 5% overhead
      }
      
      const splitGas = baseGas * splitCount * coordinationOverhead;
      
      logger.info('Split Routing gas calculated', { 
        baseGas, 
        splitCount, 
        splitGas, 
        networkCongestion, 
        coordinationOverhead,
        tradeAmount 
      });
      return splitGas;
    } catch (error: any) {
      logger.error('Split routing gas estimation failed', { error: error.toString() });
      return 0.020; // Fallback
    }
  }

  /**
   * Get Split Routing security analysis
   */
  private async getSplitRoutingSecurity(params: QuoteRequest, slippage?: number): Promise<string> {
    try {
      // Split routing reduces price impact but increases complexity
      const mevRisk = await this.getMEVRisk(params);
      const liquidityDepth = await this.getLiquidityDepth(params);
      const historicalSuccess = await this.getHistoricalSuccessRate('split_routing');
      
      // Use provided slippage or default to user's input slippage
      const calculatedSlippage = slippage || (params.slippage || 0.5);
      
      const securityScore = this.calculateSecurityScore({
        mevRisk,
        liquidityDepth,
        historicalSuccess,
        slippage: calculatedSlippage
      });
      
      logger.info('Split Routing security calculated', { 
        mevRisk, 
        liquidityDepth, 
        historicalSuccess,
        slippage: calculatedSlippage,
        securityScore 
      });
      
      return this.getSecurityLevel(securityScore);
    } catch (error: any) {
      logger.error('Split routing security calculation failed', { error: error.toString() });
      return 'Medium'; // Fallback
    }
  }

  /**
   * Fallback strategy quotes when APIs fail
   */
  private getFallbackStrategyQuotes(params: QuoteRequest, tokenQuotes: any[]): any[] {
    const baseNetValue = parseFloat(tokenQuotes[0]?.netValue || '0');
    const userSlippage = params.slippage || 0.5;
    
    // Calculate dynamic slippage for each strategy based on user input
    const standardSlippage = this.calculateSlippage(userSlippage, parseFloat(params.amount), 0);
    const mevSlippage = this.calculateSlippage(userSlippage * 0.6, parseFloat(params.amount), 0); // MEV protection reduces slippage
    const fusionSlippage = this.calculateSlippage(userSlippage * 1.6, parseFloat(params.amount), 0); // Fusion+ has higher slippage
    const splitSlippage = this.calculateSlippage(userSlippage * 0.4, parseFloat(params.amount), 0); // Split routing reduces slippage
    
    // Calculate realistic net values based on base token amount
    const baseTokenAmount = parseFloat(tokenQuotes[0]?.amount || '0');
    const gasCostStandard = 0.012;
    const gasCostMEV = 0.015;
    const gasCostFusion = 0.000;
    const gasCostSplit = 0.020;
    
    // Create strategies array with calculated net values
    const strategies = [
      {
        strategy: 'Standard Swap',
        description: 'Basic token swap with 1inch aggregation',
        gasCost: gasCostStandard.toString(),
        slippage: standardSlippage,
        security: 'Medium',
        netValue: (baseTokenAmount - gasCostStandard).toString(),
        rank: 0 // Will be assigned dynamically
      },
      {
        strategy: 'MEV Protected',
        description: 'Flashbots bundle with MEV protection',
        gasCost: gasCostMEV.toString(),
        slippage: mevSlippage,
        security: 'High',
        netValue: (baseTokenAmount - gasCostMEV).toString(),
        rank: 0 // Will be assigned dynamically
      },
      {
        strategy: 'Fusion+',
        description: 'Gasless swaps with 1inch Fusion+',
        gasCost: gasCostFusion.toString(),
        slippage: fusionSlippage,
        security: 'High',
        netValue: (baseTokenAmount - gasCostFusion).toString(),
        rank: 0 // Will be assigned dynamically
      },
      {
        strategy: 'Split Routing',
        description: 'Large trades split across multiple routes',
        gasCost: gasCostSplit.toString(),
        slippage: splitSlippage,
        security: 'Medium',
        netValue: (baseTokenAmount - gasCostSplit).toString(),
        rank: 0 // Will be assigned dynamically
      }
    ];

    // Sort strategies by net value (highest first) and assign ranks
    strategies.sort((a, b) => parseFloat(b.netValue) - parseFloat(a.netValue));
    strategies.forEach((strategy, index) => {
      strategy.rank = index + 1;
    });

    logger.info('Fallback strategy ranking completed', {
      strategies: strategies.map(s => ({
        strategy: s.strategy,
        netValue: s.netValue,
        gasCost: s.gasCost,
        rank: s.rank
      }))
    });

    // Log comprehensive analysis summary for fallback
    this.logAnalysisSummary(strategies, params);

    return strategies;
  }

  /**
   * Generate recommendations based on quotes
   */
  private generateRecommendations(
    tokenQuotes: any[],
    strategyQuotes: any[]
  ): Array<{
    type: 'BEST_VALUE' | 'LOWEST_SLIPPAGE' | 'MOST_SECURE' | 'GASLESS';
    token?: string;
    strategy?: string;
    reason: string;
    savings?: string;
  }> {
    const recommendations: Array<{
      type: 'BEST_VALUE' | 'LOWEST_SLIPPAGE' | 'MOST_SECURE' | 'GASLESS';
      token?: string;
      strategy?: string;
      reason: string;
      savings?: string;
    }> = [];

    // Best value token (dynamically calculated)
    if (tokenQuotes.length > 0) {
      const bestToken = tokenQuotes[0]; // Already sorted by netValue
      const secondBest = tokenQuotes[1];
      
      let savingsPercentage = 0;
      if (secondBest) {
        const bestValue = parseFloat(bestToken.netValue);
        const secondValue = parseFloat(secondBest.netValue);
        if (bestValue > 0 && secondValue > 0) {
          savingsPercentage = ((bestValue - secondValue) / secondValue) * 100;
        }
      }
      
      recommendations.push({
        type: 'BEST_VALUE',
        token: bestToken.token,
        reason: `${bestToken.token} offers the best net value`,
        savings: savingsPercentage > 0 ? `${savingsPercentage.toFixed(1)}% better than alternatives` : 'Best option available'
      });
    }

    // Best value strategy (dynamically calculated)
    if (strategyQuotes.length > 0) {
      const bestStrategy = strategyQuotes[0]; // Already sorted by netValue
      const secondBestStrategy = strategyQuotes[1];
      
      let strategySavingsPercentage = 0;
      if (secondBestStrategy) {
        const bestValue = parseFloat(bestStrategy.netValue);
        const secondValue = parseFloat(secondBestStrategy.netValue);
        if (bestValue > 0 && secondValue > 0) {
          strategySavingsPercentage = ((bestValue - secondValue) / secondValue) * 100;
        }
      }
      
      recommendations.push({
        type: 'BEST_VALUE',
        strategy: bestStrategy.strategy,
        reason: `${bestStrategy.strategy} offers the best net value`,
        savings: strategySavingsPercentage > 0 ? `${strategySavingsPercentage.toFixed(1)}% better than alternatives` : 'Best option available'
      });
    }

    // Lowest slippage token
    if (tokenQuotes.length > 0) {
      const lowestSlippageToken = tokenQuotes.reduce((min, current) => 
        current.slippage < min.slippage ? current : min
      );
      
      if (lowestSlippageToken) {
        recommendations.push({
          type: 'LOWEST_SLIPPAGE',
          token: lowestSlippageToken.token,
          reason: `${lowestSlippageToken.token} has the lowest slippage`,
          savings: `${lowestSlippageToken.slippage.toFixed(2)}% slippage`
        });
      }
    }

    // Lowest slippage strategy
    if (strategyQuotes.length > 0) {
      const lowestSlippageStrategy = strategyQuotes.reduce((min, current) => 
        current.slippage < min.slippage ? current : min
      );
      
      if (lowestSlippageStrategy) {
        recommendations.push({
          type: 'LOWEST_SLIPPAGE',
          strategy: lowestSlippageStrategy.strategy,
          reason: `${lowestSlippageStrategy.strategy} has the lowest slippage`,
          savings: `${lowestSlippageStrategy.slippage.toFixed(2)}% slippage`
        });
      }
    }

    // Most secure strategy (dynamically find highest security)
    if (strategyQuotes.length > 0) {
      const securityLevels = ['High', 'Medium', 'Low'];
      let mostSecureStrategy = null;
      
      for (const level of securityLevels) {
        mostSecureStrategy = strategyQuotes.find(s => s.security === level);
        if (mostSecureStrategy) break;
      }
      
      if (mostSecureStrategy) {
        recommendations.push({
          type: 'MOST_SECURE',
          strategy: mostSecureStrategy.strategy,
          reason: `${mostSecureStrategy.strategy} provides maximum security (${mostSecureStrategy.security})`
        });
      }
    }

    // Gasless option (dynamically find gasless strategies)
    if (strategyQuotes.length > 0) {
      const gaslessStrategies = strategyQuotes.filter(s => parseFloat(s.gasCost) === 0);
      
      if (gaslessStrategies.length > 0) {
        // If multiple gasless strategies, pick the one with best net value
        const bestGaslessStrategy = gaslessStrategies[0];
        
        recommendations.push({
          type: 'GASLESS',
          strategy: bestGaslessStrategy.strategy,
          reason: `${bestGaslessStrategy.strategy} eliminates gas costs`,
          savings: `Save ${bestGaslessStrategy.gasCost} ETH in gas`
        });
      }
    }

    // Add dynamic recommendation based on current market conditions
    if (strategyQuotes.length > 0 && tokenQuotes.length > 0) {
      const bestStrategy = strategyQuotes[0];
      const bestToken = tokenQuotes[0];
      
      // If Fusion+ is available and has good net value, recommend it
      const fusionStrategy = strategyQuotes.find(s => s.strategy === 'Fusion+');
      if (fusionStrategy && parseFloat(fusionStrategy.netValue) > parseFloat(bestStrategy.netValue) * 0.95) {
        recommendations.push({
          type: 'GASLESS',
          strategy: 'Fusion+',
          reason: 'Fusion+ offers gasless trading with excellent value',
          savings: '100% gas savings'
        });
      }
      
      // If MEV Protected has significantly better security, recommend it
      const mevStrategy = strategyQuotes.find(s => s.strategy === 'MEV Protected');
      if (mevStrategy && mevStrategy.security === 'High' && parseFloat(mevStrategy.netValue) > parseFloat(bestStrategy.netValue) * 0.9) {
        recommendations.push({
          type: 'MOST_SECURE',
          strategy: 'MEV Protected',
          reason: 'MEV Protected offers maximum security with good value',
          savings: 'Enhanced protection against MEV attacks'
        });
      }
    }

    logger.info('Dynamic recommendations generated', {
      totalRecommendations: recommendations.length,
      recommendations: recommendations.map(r => ({
        type: r.type,
        token: r.token,
        strategy: r.strategy,
        reason: r.reason
      }))
    });

    return recommendations;
  }

  /**
   * Get MEV risk analysis
   */
  private async getMEVRisk(params: QuoteRequest): Promise<number> {
    try {
      // Analyze MEV risk based on trade size, token pair, and market conditions
      const tradeSizeUSD = parseFloat(params.amount) * this.getEthPrice();
      const tokenPair = `${params.fromToken}-${params.toToken}`;
      
      // MEV risk factors
      const sizeRisk = Math.min(tradeSizeUSD / 10000, 1); // Higher risk for larger trades
      const pairRisk = this.getPairMEVRisk(tokenPair);
      const marketRisk = this.getMarketMEVRisk();
      
      const totalRisk = (sizeRisk * 0.4 + pairRisk * 0.4 + marketRisk * 0.2);
      
      logger.info('MEV risk calculated', { 
        tradeSizeUSD, 
        tokenPair, 
        sizeRisk, 
        pairRisk, 
        marketRisk, 
        totalRisk 
      });
      
      return Math.min(totalRisk, 1); // Cap at 100%
    } catch (error: any) {
      logger.error('MEV risk calculation failed', { error: error.toString() });
      return 0.3; // Default medium risk
    }
  }

  /**
   * Get liquidity depth analysis
   */
  private async getLiquidityDepth(params: QuoteRequest): Promise<number> {
    try {
      // Analyze liquidity depth for the token pair
      const tokenPair = `${params.fromToken}-${params.toToken}`;
      const tradeSizeUSD = parseFloat(params.amount) * this.getEthPrice();
      
      // Get pool liquidity (mock for now, would use DEX APIs)
      const poolLiquidity = this.getPoolLiquidity(params.toToken);
      const liquidityDepth = Math.min(tradeSizeUSD / poolLiquidity, 1);
      
      logger.info('Liquidity depth calculated', { 
        tokenPair, 
        tradeSizeUSD, 
        poolLiquidity, 
        liquidityDepth 
      });
      
      return liquidityDepth;
    } catch (error: any) {
      logger.error('Liquidity depth calculation failed', { error: error.toString() });
      return 0.5; // Default medium depth
    }
  }

  /**
   * Get historical success rate for strategy
   */
  private async getHistoricalSuccessRate(strategy: string): Promise<number> {
    try {
      // Historical success rates (mock data, would come from analytics)
      const successRates = {
        'standard': 0.95,      // 95% success rate
        'mev_protected': 0.98, // 98% success rate
        'fusion_plus': 0.99,   // 99% success rate
        'split_routing': 0.92  // 92% success rate
      };
      
      const successRate = successRates[strategy as keyof typeof successRates] || 0.95;
      
      logger.info('Historical success rate retrieved', { strategy, successRate });
      return successRate;
    } catch (error: any) {
      logger.error('Historical success rate calculation failed', { error: error.toString() });
      return 0.95; // Default high success rate
    }
  }

  /**
   * Calculate security score based on multiple factors
   */
  private calculateSecurityScore(factors: {
    mevRisk: number;
    liquidityDepth: number;
    historicalSuccess: number;
    slippage: number;
  }): number {
    try {
      // Security score calculation (0-100)
      const mevScore = (1 - factors.mevRisk) * 30; // 30% weight
      const liquidityScore = (1 - factors.liquidityDepth) * 25; // 25% weight
      const successScore = factors.historicalSuccess * 30; // 30% weight
      const slippageScore = (1 - factors.slippage / 10) * 15; // 15% weight
      
      const totalScore = mevScore + liquidityScore + successScore + slippageScore;
      
      logger.info('Security score calculated', { 
        mevScore, 
        liquidityScore, 
        successScore, 
        slippageScore, 
        totalScore 
      });
      
      return Math.max(0, Math.min(100, totalScore));
    } catch (error: any) {
      logger.error('Security score calculation failed', { error: error.toString() });
      return 70; // Default medium security
    }
  }

  /**
   * Get security level from score
   */
  private getSecurityLevel(score: number): string {
    if (score >= 85) return 'Very High';
    if (score >= 70) return 'High';
    if (score >= 50) return 'Medium';
    if (score >= 30) return 'Low';
    return 'Very Low';
  }

  /**
   * Get MEV risk for specific token pair
   */
  private getPairMEVRisk(pair: string): number {
    // MEV risk by token pair (mock data, would use real analytics)
    const pairRisks = {
      'ETH-USDC': 0.2,  // Low risk
      'ETH-USDT': 0.3,  // Medium risk
      'ETH-DAI': 0.25,  // Medium-low risk
      'USDC-ETH': 0.2,  // Low risk
      'USDT-ETH': 0.3,  // Medium risk
      'DAI-ETH': 0.25   // Medium-low risk
    };
    
    return pairRisks[pair as keyof typeof pairRisks] || 0.3; // Default medium risk
  }

  /**
   * Get market-wide MEV risk
   */
  private getMarketMEVRisk(): number {
    // Market-wide MEV risk (mock data, would use real-time analytics)
    const baseRisk = 0.25;
    const volatility = Math.random() * 0.2; // Random market volatility
    return Math.min(baseRisk + volatility, 1);
  }

  /**
   * Log comprehensive analysis summary for debugging and monitoring
   */
  private logAnalysisSummary(strategies: any[], params: QuoteRequest): void {
    const bestStrategy = strategies[0];
    const worstStrategy = strategies[strategies.length - 1];
    
    const analysis = {
      tradeDetails: {
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        chainId: params.chainId,
        userAddress: params.userAddress
      },
      strategyComparison: {
        totalStrategies: strategies.length,
        bestStrategy: {
          name: bestStrategy.strategy,
          netValue: bestStrategy.netValue,
          gasCost: bestStrategy.gasCost,
          security: bestStrategy.security,
          rank: bestStrategy.rank
        },
        worstStrategy: {
          name: worstStrategy.strategy,
          netValue: worstStrategy.netValue,
          gasCost: worstStrategy.gasCost,
          security: worstStrategy.security,
          rank: worstStrategy.rank
        },
        valueSpread: parseFloat(bestStrategy.netValue) - parseFloat(worstStrategy.netValue)
      },
      allStrategies: strategies.map(s => ({
        strategy: s.strategy,
        netValue: s.netValue,
        gasCost: s.gasCost,
        security: s.security,
        rank: s.rank
      }))
    };
    
    logger.info('Dynamic Analysis Summary', analysis);
    
    // Log specific insights
    if (bestStrategy.strategy === 'Fusion+') {
      logger.info('Fusion+ selected as best option - gasless advantage', {
        gasCost: bestStrategy.gasCost,
        netValue: bestStrategy.netValue
      });
    }
    
    if (bestStrategy.strategy === 'MEV Protected') {
      logger.info('MEV Protected selected as best option - security advantage', {
        security: bestStrategy.security,
        netValue: bestStrategy.netValue
      });
    }
    
    if (bestStrategy.strategy === 'Standard Swap') {
      logger.info('Standard Swap selected as best option - cost efficiency', {
        gasCost: bestStrategy.gasCost,
        netValue: bestStrategy.netValue
      });
    }
  }
}

export default QuoteService; 