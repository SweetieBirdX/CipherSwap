import api from './api'

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

export interface OneInchSpotPriceResponse {
  success: boolean;
  data: OneInchSpotPriceData;
  timestamp: number;
}

export interface OneInchMultipleSpotPricesResponse {
  success: boolean;
  data: {
    prices: OneInchSpotPriceData[];
  };
  timestamp: number;
}

export interface OneInchCurrenciesResponse {
  success: boolean;
  data: OneInchCurrenciesData;
  timestamp: number;
}

export class OneInchSpotPriceService {
  // Get single spot price
  static async getSpotPrice(tokenAddress: string, currency: string = 'USD'): Promise<OneInchSpotPriceResponse> {
    try {
      const response = await api.get(`/real-market-data/1inch/spot-price/${tokenAddress}`, {
        params: { currency }
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        data: {
          price: 0,
          timestamp: Date.now(),
          source: '1inch-spot-fallback',
          currency,
          address: tokenAddress
        },
        timestamp: Date.now(),
        error: error.response?.data?.error || 'Failed to get 1inch spot price'
      }
    }
  }

  // Get multiple spot prices
  static async getMultipleSpotPrices(addresses: string[], currency: string = 'USD'): Promise<OneInchMultipleSpotPricesResponse> {
    try {
      const response = await api.post('/real-market-data/1inch/spot-prices', {
        addresses
      }, {
        params: { currency }
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        data: {
          prices: addresses.map(address => ({
            price: 0,
            timestamp: Date.now(),
            source: '1inch-spot-fallback',
            currency,
            address
          }))
        },
        timestamp: Date.now(),
        error: error.response?.data?.error || 'Failed to get multiple 1inch spot prices'
      }
    }
  }

  // Get available currencies
  static async getCurrencies(): Promise<OneInchCurrenciesResponse> {
    try {
      const response = await api.get('/real-market-data/1inch/currencies')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        data: {
          currencies: []
        },
        timestamp: Date.now(),
        error: error.response?.data?.error || 'Failed to get 1inch currencies'
      }
    }
  }

  // Get popular tokens with market data
  static async getPopularTokens(): Promise<{
    success: boolean;
    data: {
      tokens: Array<{
        symbol: string;
        name: string;
        price: number;
        change24h: number;
        volume24h: number;
        marketCap: number;
        icon: string;
        color: string;
        address: string;
      }>;
    };
    timestamp: number;
  }> {
    try {
      // Call the backend's /prices endpoint which includes 1inch integration
      const response = await api.get('/real-market-data/prices');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching popular tokens:', error);
      return {
        success: false,
        data: { tokens: [] },
        timestamp: Date.now(),
        error: error.response?.data?.error || 'Failed to get popular tokens'
      }
    }
  }
} 