import { Request, Response } from 'express';
import { RealMarketDataService } from '../../services/realMarketDataService';
import { OneInchSpotPriceService } from '../../services/oneInchSpotPriceService';
import { logger } from '../../utils/logger';

const marketDataService = new RealMarketDataService();
const oneInchSpotPriceService = new OneInchSpotPriceService();

export class RealMarketDataController {
  async getPrice(req: Request, res: Response) {
    try {
      const { tokenAddress } = req.params;
      const { symbol } = req.query;
      const priceData = await marketDataService.getRealTimePrice(tokenAddress, symbol as string);
      res.json({ success: true, data: priceData, timestamp: Date.now() });
    } catch (error: any) {
      logger.error('Failed to get real-time price', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getVolatility(req: Request, res: Response) {
    try {
      const { tokenAddress } = req.params;
      const { timeframe = 24 } = req.query;
      const volatilityData = await marketDataService.getVolatility(tokenAddress, Number(timeframe));
      res.json({ success: true, data: volatilityData, timestamp: Date.now() });
    } catch (error: any) {
      logger.error('Failed to get volatility data', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getLiquidity(req: Request, res: Response) {
    try {
      const { tokenAddress } = req.params;
      const liquidityData = await marketDataService.getLiquidity(tokenAddress);
      res.json({ success: true, data: liquidityData, timestamp: Date.now() });
    } catch (error: any) {
      logger.error('Failed to get liquidity data', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getComprehensive(req: Request, res: Response) {
    try {
      const { tokenAddress } = req.params;
      const { symbol } = req.query;
      const marketData = await marketDataService.getMarketData(tokenAddress, symbol as string);
      res.json({ success: true, data: marketData, timestamp: Date.now() });
    } catch (error: any) {
      logger.error('Failed to get comprehensive market data', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAllPrices(req: Request, res: Response) {
    try {
      // Popular tokens for frontend display with correct data
      const tokens = [
        { 
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
          symbol: 'ETH', 
          name: 'Ethereum',
          fallbackPrice: 2650.34,
          fallbackChange: 1.87,
          fallbackVolume: 15200000000,
          fallbackMarketCap: 318000000000,
          icon: 'Ξ',
          color: '#627EEA'
        },
        { 
          address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 
          symbol: 'USDC', 
          name: 'USD Coin',
          fallbackPrice: 1.00,
          fallbackChange: 0.01,
          fallbackVolume: 8500000000,
          fallbackMarketCap: 25000000000,
          icon: '$',
          color: '#2775CA'
        },
        { 
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', 
          symbol: 'USDT', 
          name: 'Tether',
          fallbackPrice: 1.00,
          fallbackChange: 0.02,
          fallbackVolume: 72000000000,
          fallbackMarketCap: 95000000000,
          icon: '₮',
          color: '#26A17B'
        },
        { 
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
          symbol: 'BTC', 
          name: 'Bitcoin',
          fallbackPrice: 43250.67,
          fallbackChange: 2.45,
          fallbackVolume: 28450000000,
          fallbackMarketCap: 850000000000,
          icon: '₿',
          color: '#F7931A'
        },
        { 
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', 
          symbol: 'DAI', 
          name: 'Dai',
          fallbackPrice: 1.00,
          fallbackChange: 0.01,
          fallbackVolume: 1200000000,
          fallbackMarketCap: 5000000000,
          icon: '◈',
          color: '#F5AC37'
        },
        { 
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', 
          symbol: 'LINK', 
          name: 'Chainlink',
          fallbackPrice: 15.45,
          fallbackChange: -1.23,
          fallbackVolume: 850000000,
          fallbackMarketCap: 8500000000,
          icon: '🔗',
          color: '#2A5ADA'
        },
        { 
          address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 
          symbol: 'UNI', 
          name: 'Uniswap',
          fallbackPrice: 8.75,
          fallbackChange: 3.45,
          fallbackVolume: 450000000,
          fallbackMarketCap: 5200000000,
          icon: '🦄',
          color: '#FF007A'
        },
        { 
          address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', 
          symbol: 'AAVE', 
          name: 'Aave',
          fallbackPrice: 245.67,
          fallbackChange: 5.67,
          fallbackVolume: 320000000,
          fallbackMarketCap: 3600000000,
          icon: '⚡',
          color: '#B6509E'
        },
        { 
          address: '0xD533a949740bb3306d119CC777fa900bA034cd52', 
          symbol: 'CRV', 
          name: 'Curve DAO Token',
          fallbackPrice: 0.45,
          fallbackChange: -2.34,
          fallbackVolume: 180000000,
          fallbackMarketCap: 400000000,
          icon: '📈',
          color: '#D53369'
        },
        { 
          address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 
          symbol: 'MKR', 
          name: 'Maker',
          fallbackPrice: 1250.89,
          fallbackChange: 1.89,
          fallbackVolume: 150000000,
          fallbackMarketCap: 1200000000,
          icon: '🏛️',
          color: '#1AAB9B'
        },
        { 
          address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', 
          symbol: 'SNX', 
          name: 'Synthetix',
          fallbackPrice: 2.34,
          fallbackChange: -0.67,
          fallbackVolume: 95000000,
          fallbackMarketCap: 750000000,
          icon: '⚖️',
          color: '#00D1FF'
        },
        { 
          address: '0xc00e94Cb662C3520282E6f5717214004A7f26888', 
          symbol: 'COMP', 
          name: 'Compound',
          fallbackPrice: 65.23,
          fallbackChange: 2.12,
          fallbackVolume: 85000000,
          fallbackMarketCap: 650000000,
          icon: '🏦',
          color: '#00D5FF'
        },
        { 
          address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad9eC', 
          symbol: 'YFI', 
          name: 'yearn.finance',
          fallbackPrice: 8500.12,
          fallbackChange: -1.45,
          fallbackVolume: 45000000,
          fallbackMarketCap: 280000000,
          icon: '🎯',
          color: '#006AE3'
        },
        { 
          address: '0xba100000625a3754423978a60c9317c58a424e3D', 
          symbol: 'BAL', 
          name: 'Balancer',
          fallbackPrice: 3.45,
          fallbackChange: 0.89,
          fallbackVolume: 35000000,
          fallbackMarketCap: 180000000,
          icon: '⚖️',
          color: '#E3E3E3'
        },
        { 
          address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', 
          symbol: 'SUSHI', 
          name: 'SushiSwap',
          fallbackPrice: 1.23,
          fallbackChange: -0.34,
          fallbackVolume: 25000000,
          fallbackMarketCap: 150000000,
          icon: '🍣',
          color: '#FA52A0'
        }
      ];

      const tokensData = [];
      
      for (const token of tokens) {
        try {
          const priceData = await marketDataService.getRealTimePrice(token.address, token.symbol);
          tokensData.push({
            symbol: token.symbol,
            name: token.name,
            price: priceData.price || token.fallbackPrice,
            change24h: token.fallbackChange, // Will be calculated separately
            volume24h: token.fallbackVolume,
            marketCap: token.fallbackMarketCap,
            icon: token.icon,
            color: token.color
          });
        } catch (error: any) {
          logger.warn(`Failed to get price for ${token.symbol}`, { error: error.message });
          // Add fallback data
          tokensData.push({
            symbol: token.symbol,
            name: token.name,
            price: token.fallbackPrice,
            change24h: token.fallbackChange,
            volume24h: token.fallbackVolume,
            marketCap: token.fallbackMarketCap,
            icon: token.icon,
            color: token.color
          });
        }
      }

      res.json({ 
        success: true, 
        data: { tokens: tokensData }, 
        timestamp: Date.now() 
      });
    } catch (error: any) {
      logger.error('Failed to get all prices', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get 1inch Spot Price for a token
   */
  async getOneInchSpotPrice(req: Request, res: Response) {
    try {
      const { tokenAddress } = req.params;
      const { currency = 'USD' } = req.query;
      
      logger.info('Getting 1inch spot price', { tokenAddress, currency });
      
      const spotPriceData = await oneInchSpotPriceService.getSpotPriceWithFallback(tokenAddress, currency as string);
      
      logger.info('1inch spot price result', { 
        address: tokenAddress, 
        price: spotPriceData.price,
        source: spotPriceData.source 
      });
      
      res.json({ 
        success: true, 
        data: spotPriceData, 
        timestamp: Date.now() 
      });
    } catch (error: any) {
      logger.error('Failed to get 1inch spot price', { 
        error: error.message,
        tokenAddress: req.params.tokenAddress,
        currency: req.query.currency
      });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get multiple 1inch Spot Prices
   */
  async getMultipleOneInchSpotPrices(req: Request, res: Response) {
    try {
      const { addresses } = req.body;
      const { currency = 'USD' } = req.query;
      
      if (!addresses || !Array.isArray(addresses)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Addresses array is required' 
        });
      }

      logger.info('Getting multiple 1inch spot prices', { addresses, currency });

      const spotPricesData = await oneInchSpotPriceService.getMultipleSpotPrices(addresses, currency as string);
      
      logger.info('Multiple 1inch spot prices result', { 
        count: spotPricesData.length,
        addresses: addresses.length
      });
      
      res.json({ 
        success: true, 
        data: { prices: spotPricesData }, 
        timestamp: Date.now() 
      });
    } catch (error: any) {
      logger.error('Failed to get multiple 1inch spot prices', { 
        error: error.message,
        addresses: req.body.addresses,
        currency: req.query.currency
      });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get available currencies from 1inch
   */
  async getOneInchCurrencies(req: Request, res: Response) {
    try {
      const currenciesData = await oneInchSpotPriceService.getCurrencies();
      
      res.json({ 
        success: true, 
        data: currenciesData, 
        timestamp: Date.now() 
      });
    } catch (error: any) {
      logger.error('Failed to get 1inch currencies', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}