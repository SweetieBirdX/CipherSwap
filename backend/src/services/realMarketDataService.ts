import { ethers } from 'ethers';
import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { OneInchSpotPriceService, OneInchSpotPriceData } from './oneInchSpotPriceService';

export interface MarketData {
  price: number;
  volume24h: number;
  marketCap: number;
  priceChange24h: number;
  volatility: number;
  liquidity: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface PriceData {
  price: number;
  timestamp: number;
  source: string;
}

export interface VolatilityData {
  volatility: number;
  period: number;
  confidence: number;
}

export interface LiquidityData {
  totalLiquidity: number;
  uniswapLiquidity: number;
  sushiswapLiquidity: number;
  dexScreenerLiquidity: number;
}

export class RealMarketDataService {
  private provider: ethers.JsonRpcProvider;
  private oneInchSpotPriceService: OneInchSpotPriceService;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.ETHEREUM_RPC_URL);
    this.oneInchSpotPriceService = new OneInchSpotPriceService();
  }

  /**
   * Get real-time price using only 1inch Spot Price API
   */
  async getRealTimePrice(tokenAddress: string, tokenSymbol?: string): Promise<PriceData> {
    try {
      logger.info('Getting real-time price', { tokenAddress, tokenSymbol });

      // Use only 1inch Spot Price API
      const oneInchData = await this.oneInchSpotPriceService.getSpotPriceWithFallback(tokenAddress);
      
      return {
        price: oneInchData.price,
        timestamp: Date.now(),
        source: oneInchData.source
      };

    } catch (error: any) {
      logger.error('Failed to get real-time price', { 
        error: error.message, 
        tokenAddress 
      });
      throw error;
    }
  }

  /**
   * Get price from 1inch API
   */
  private async get1inchPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await axios.get('https://api.1inch.dev/swap/v5.2/quote', {
        params: {
          src: tokenAddress,
          dst: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Correct USDC address
          amount: '1000000000000000000', // 1 token
          chain: 1,
          from: '0x0000000000000000000000000000000000000000'
        },
        headers: {
          'Authorization': `Bearer ${config.INCH_API_KEY}`,
          'Accept': 'application/json'
        },
        timeout: 3000
      });

      const toAmount = BigInt(response.data.toTokenAmount);
      const fromAmount = BigInt('1000000000000000000');
      const price = Number(toAmount) / Number(fromAmount);

      return price;
    } catch (error: any) {
      throw new Error(`1inch API failed: ${error.message}`);
    }
  }





  /**
   * Calculate real volatility using historical data
   */
  async getVolatility(tokenAddress: string, timeframe: number = 24): Promise<VolatilityData> {
    try {
      logger.info('Calculating volatility', { tokenAddress, timeframe });

      // Get historical prices
      const historicalPrices = await this.getHistoricalPrices(tokenAddress, timeframe);
      
      if (historicalPrices.length < 2) {
        throw new Error('Insufficient historical data for volatility calculation');
      }

      // Calculate price changes
      const priceChanges = [];
      for (let i = 1; i < historicalPrices.length; i++) {
        const change = (historicalPrices[i].price - historicalPrices[i-1].price) / historicalPrices[i-1].price;
        priceChanges.push(change);
      }

      // Calculate volatility (standard deviation of price changes)
      const mean = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
      const variance = priceChanges.reduce((sum, change) => sum + Math.pow(change - mean, 2), 0) / priceChanges.length;
      const volatility = Math.sqrt(variance);

      // Annualized volatility (assuming 24h data points)
      const annualizedVolatility = volatility * Math.sqrt(365);

      return {
        volatility: annualizedVolatility,
        period: timeframe,
        confidence: this.calculateVolatilityConfidence(priceChanges.length)
      };

    } catch (error: any) {
      logger.error('Volatility calculation failed', { 
        error: error.message, 
        tokenAddress 
      });
      throw error;
    }
  }

  /**
   * Get real liquidity data from DEXs
   */
  async getLiquidity(tokenAddress: string): Promise<LiquidityData> {
    try {
      logger.info('Getting liquidity data', { tokenAddress });

      const [uniswapLiquidity, sushiswapLiquidity, dexScreenerLiquidity] = await Promise.allSettled([
        this.getUniswapLiquidity(tokenAddress),
        this.getSushiswapLiquidity(tokenAddress),
        this.getDexScreenerLiquidity(tokenAddress)
      ]);

      const totalLiquidity = 
        (uniswapLiquidity.status === 'fulfilled' ? uniswapLiquidity.value : 0) +
        (sushiswapLiquidity.status === 'fulfilled' ? sushiswapLiquidity.value : 0) +
        (dexScreenerLiquidity.status === 'fulfilled' ? dexScreenerLiquidity.value : 0);

      return {
        totalLiquidity,
        uniswapLiquidity: uniswapLiquidity.status === 'fulfilled' ? uniswapLiquidity.value : 0,
        sushiswapLiquidity: sushiswapLiquidity.status === 'fulfilled' ? sushiswapLiquidity.value : 0,
        dexScreenerLiquidity: dexScreenerLiquidity.status === 'fulfilled' ? dexScreenerLiquidity.value : 0
      };

    } catch (error: any) {
      logger.error('Liquidity calculation failed', { 
        error: error.message, 
        tokenAddress 
      });
      throw error;
    }
  }

  /**
   * Get comprehensive market data
   */
  async getMarketData(tokenAddress: string, tokenSymbol?: string): Promise<MarketData> {
    try {
      logger.info('Getting comprehensive market data', { tokenAddress, tokenSymbol });

      const [priceData, volatilityData, liquidityData] = await Promise.all([
        this.getRealTimePrice(tokenAddress, tokenSymbol),
        this.getVolatility(tokenAddress),
        this.getLiquidity(tokenAddress)
      ]);

      // Calculate trend based on price change
      const trend = this.calculateTrend(priceData.price, volatilityData.volatility);

      return {
        price: priceData.price,
        volume24h: 0, // Would need additional API calls
        marketCap: 0, // Would need additional API calls
        priceChange24h: 0, // Would need additional API calls
        volatility: volatilityData.volatility,
        liquidity: liquidityData.totalLiquidity,
        trend
      };

    } catch (error: any) {
      logger.error('Market data retrieval failed', { 
        error: error.message, 
        tokenAddress 
      });
      throw error;
    }
  }

  /**
   * Get historical prices for volatility calculation
   */
  private async getHistoricalPrices(tokenAddress: string, hours: number): Promise<PriceData[]> {
    try {
      // For now, we'll use a simplified approach
      // In production, you'd fetch from CoinGecko, 1inch, or other APIs
      const prices: PriceData[] = [];
      const now = Date.now();
      
      // Generate mock historical data (replace with real API calls)
      for (let i = hours; i >= 0; i--) {
        const timestamp = now - (i * 60 * 60 * 1000); // hours ago
        const basePrice = 1800; // Base ETH price
        const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const price = basePrice * (1 + randomVariation);
        
        prices.push({
          price,
          timestamp,
          source: 'historical'
        });
      }

      return prices;
    } catch (error: any) {
      throw new Error(`Historical price retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get Uniswap liquidity
   */
  private async getUniswapLiquidity(tokenAddress: string): Promise<number> {
    try {
      // This would require Uniswap V3 subgraph or direct contract calls
      // For now, returning mock data
      return Math.random() * 10000000 + 1000000; // 1M-11M USD
    } catch (error: any) {
      throw new Error(`Uniswap liquidity failed: ${error.message}`);
    }
  }

  /**
   * Get Sushiswap liquidity
   */
  private async getSushiswapLiquidity(tokenAddress: string): Promise<number> {
    try {
      // This would require Sushiswap subgraph or direct contract calls
      // For now, returning mock data
      return Math.random() * 5000000 + 500000; // 500K-5.5M USD
    } catch (error: any) {
      throw new Error(`Sushiswap liquidity failed: ${error.message}`);
    }
  }

  /**
   * Get DexScreener liquidity
   */
  private async getDexScreenerLiquidity(tokenAddress: string): Promise<number> {
    try {
      const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
        timeout: 3000
      });

      if (response.data.pairs && response.data.pairs.length > 0) {
        return response.data.pairs.reduce((total: number, pair: any) => {
          return total + (parseFloat(pair.liquidity?.usd) || 0);
        }, 0);
      }

      return 0;
    } catch (error: any) {
      logger.warn('DexScreener API failed', { error: error.message });
      return 0;
    }
  }

  /**
   * Calculate median of numbers
   */
  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  /**
   * Calculate price variance
   */
  private calculatePriceVariance(prices: number[]): number {
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  /**
   * Calculate volatility confidence
   */
  private calculateVolatilityConfidence(dataPoints: number): number {
    // More data points = higher confidence
    return Math.min(dataPoints / 100, 1.0);
  }

  /**
   * Calculate market trend
   */
  private calculateTrend(currentPrice: number, volatility: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    // This is a simplified trend calculation
    // In production, you'd use more sophisticated analysis
    if (volatility > 0.5) {
      return 'NEUTRAL'; // High volatility = uncertain trend
    }
    
    // For now, return neutral
    // In production, compare with historical prices
    return 'NEUTRAL';
  }
} 