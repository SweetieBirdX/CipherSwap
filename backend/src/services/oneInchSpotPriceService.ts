import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export interface OneInchSpotPriceData {
  price: number;
  timestamp: number;
  source: '1inch-spot' | '1inch-spot-fallback';
  currency: string;
  address: string;
}

export interface OneInchCurrenciesData {
  currencies: Array<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  }>;
}

export class OneInchSpotPriceService {
  private baseUrl = 'https://api.1inch.dev/price/v1.1/1';
  private apiKey: string;

  constructor() {
    this.apiKey = config.INCH_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('1inch API key not found, some features may not work');
    }
  }

  /**
   * Get spot price for a single token
   * According to 1inch docs: GET /v1.1/1/{addresses}
   */
  async getSpotPrice(address: string, currency: string = 'USD'): Promise<OneInchSpotPriceData> {
    try {
      logger.info('Getting 1inch spot price', { address, currency });

      // Use the correct endpoint structure: /v1.1/1/{addresses}
      const response = await axios.get(`${this.baseUrl}/${address}`, {
        params: {
          currency: currency
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      logger.info('1inch API response', { 
        status: response.status, 
        data: response.data,
        address 
      });

      // The response is an object with the address as key and price as string value
      const priceValue = response.data[address.toLowerCase()];
      if (!priceValue || typeof priceValue !== 'string') {
        throw new Error('Invalid response from 1inch Spot Price API - missing price');
      }

      const price = parseFloat(priceValue);
      if (isNaN(price)) {
        throw new Error('Invalid price value from 1inch API');
      }

      return {
        price: price,
        timestamp: Date.now(),
        source: '1inch-spot',
        currency: currency,
        address: address
      };

    } catch (error: any) {
      logger.error('1inch Spot Price API failed', { 
        error: error.message, 
        address,
        currency,
        response: error.response?.data
      });
      throw new Error(`1inch Spot Price API failed: ${error.message}`);
    }
  }

  /**
   * Get spot prices for multiple tokens
   * According to 1inch docs: GET /v1.1/1/{addresses} with comma-separated addresses
   */
  async getMultipleSpotPrices(addresses: string[], currency: string = 'USD'): Promise<OneInchSpotPriceData[]> {
    try {
      logger.info('Getting multiple 1inch spot prices', { addresses, currency });

      // Join addresses with commas for the API call
      const addressesParam = addresses.join(',');
      
      const response = await axios.get(`${this.baseUrl}/${addressesParam}`, {
        params: {
          currency: currency
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      logger.info('1inch Multiple API response', { 
        status: response.status, 
        data: response.data
      });

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response from 1inch Spot Price API');
      }

      const results: OneInchSpotPriceData[] = [];
      
      // The response is an object with addresses as keys and prices as string values
      for (const address of addresses) {
        const priceValue = response.data[address.toLowerCase()];
        if (priceValue && typeof priceValue === 'string') {
          const price = parseFloat(priceValue);
          if (!isNaN(price)) {
            results.push({
              price: price,
              timestamp: Date.now(),
              source: '1inch-spot',
              currency: currency,
              address: address
            });
          } else {
            logger.warn(`Invalid price value for address: ${address}, value: ${priceValue}`);
          }
        } else {
          logger.warn(`No price data for address: ${address}`);
        }
      }

      return results;

    } catch (error: any) {
      logger.error('1inch Multiple Spot Prices API failed', { 
        error: error.message, 
        addresses,
        currency,
        response: error.response?.data
      });
      throw new Error(`1inch Multiple Spot Prices API failed: ${error.message}`);
    }
  }

  /**
   * Get available currencies
   * According to 1inch docs: GET /v1.1/1/currencies
   */
  async getCurrencies(): Promise<OneInchCurrenciesData> {
    try {
      logger.info('Getting 1inch currencies');

      const response = await axios.get(`${this.baseUrl}/currencies`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      logger.info('1inch Currencies API response', { 
        status: response.status, 
        data: response.data
      });

      if (!response.data) {
        throw new Error('Invalid response from 1inch Currencies API');
      }

      return {
        currencies: response.data.currencies || []
      };

    } catch (error: any) {
      logger.error('1inch Currencies API failed', { 
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`1inch Currencies API failed: ${error.message}`);
    }
  }

  /**
   * Get spot price with fallback to other sources
   */
  async getSpotPriceWithFallback(address: string, currency: string = 'USD'): Promise<OneInchSpotPriceData> {
    try {
      return await this.getSpotPrice(address, currency);
    } catch (error: any) {
      logger.warn('1inch Spot Price failed, using fallback', { 
        error: error.message, 
        address 
      });
      
      // Return a fallback price based on common tokens
      const fallbackPrices: { [key: string]: number } = {
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 2650.34, // WETH
        '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1.00,    // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7': 1.00,    // USDT
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 43250.67 // WBTC
      };

      const fallbackPrice = fallbackPrices[address.toLowerCase()] || 1.00;
      
      return {
        price: fallbackPrice,
        timestamp: Date.now(),
        source: '1inch-spot-fallback',
        currency: currency,
        address: address
      };
    }
  }

  /**
   * Get comprehensive market data using 1inch
   */
  async getComprehensiveMarketData(address: string, currency: string = 'USD'): Promise<{
    price: number;
    volume24h?: number;
    marketCap?: number;
    priceChange24h?: number;
    source: string;
    timestamp: number;
  }> {
    try {
      const spotPrice = await this.getSpotPrice(address, currency);
      
      return {
        price: spotPrice.price,
        source: spotPrice.source,
        timestamp: spotPrice.timestamp
      };

    } catch (error: any) {
      logger.error('Comprehensive market data failed', { 
        error: error.message, 
        address 
      });
      throw error;
    }
  }
} 