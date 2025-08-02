import { Request, Response } from 'express';
import { RealMarketDataService } from '../../services/realMarketDataService';
import { logger } from '../../utils/logger';

const marketDataService = new RealMarketDataService();

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
}