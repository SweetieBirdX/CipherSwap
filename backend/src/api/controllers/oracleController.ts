import { Request, Response } from 'express';
import { oracleService } from '../../services/oracleService';
import { logger } from '../../utils/logger';

export class OracleController {
  /**
   * GET /api/oracle/price/:chainId/:pair
   * Get current price from Chainlink Oracle
   */
  async getPrice(req: Request, res: Response): Promise<void> {
    try {
      const chainId = parseInt(req.params.chainId);
      const pair = req.params.pair;

      logger.info('Oracle price request received', { chainId, pair });

      const response = await oracleService.getPrice(chainId, pair);

      if (response.success && response.data) {
        res.json({
          success: true,
          data: response.data,
          timestamp: Date.now()
        });
      } else {
        res.status(400).json({
          success: false,
          error: response.error,
          timestamp: Date.now()
        });
      }

    } catch (error: any) {
      logger.error('Oracle controller error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * POST /api/oracle/price/batch
   * Get multiple prices at once
   */
  async getMultiplePrices(req: Request, res: Response): Promise<void> {
    try {
      const { prices } = req.body;

      if (!prices || !Array.isArray(prices)) {
        res.status(400).json({
          success: false,
          error: 'Invalid request: prices array required',
          timestamp: Date.now()
        });
        return;
      }

      logger.info('Oracle batch price request received', { prices });

      const results = [];
      
      for (const priceRequest of prices) {
        const { chainId, pair } = priceRequest;
        
        if (!chainId || !pair) {
          results.push({
            chainId,
            pair,
            success: false,
            error: 'Missing chainId or pair'
          });
          continue;
        }

        const response = await oracleService.getPrice(chainId, pair);
        
        if (response.success && response.data) {
          results.push({
            chainId,
            pair,
            price: response.data.price.toString(),
            timestamp: response.data.timestamp,
            decimals: response.data.decimals,
            feedAddress: response.data.oracleAddress,
            description: `${pair} Price Feed`
          });
        } else {
          results.push({
            chainId,
            pair,
            success: false,
            error: response.error
          });
        }
      }

      res.json({
        success: true,
        data: results,
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('Oracle batch controller error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * POST /api/oracle/price/tolerance
   * Get price with tolerance check
   */
  async getPriceWithTolerance(req: Request, res: Response): Promise<void> {
    try {
      const { chainId, pair, expectedPrice, tolerance = 1.0 } = req.body;

      if (!chainId || !pair || expectedPrice === undefined) {
        res.status(400).json({
          success: false,
          error: 'Invalid request: chainId, pair, and expectedPrice required',
          timestamp: Date.now()
        });
        return;
      }

      logger.info('Oracle tolerance check request received', { 
        chainId, 
        pair, 
        expectedPrice, 
        tolerance 
      });

      const response = await oracleService.getPriceWithTolerance(
        chainId, 
        pair, 
        expectedPrice, 
        tolerance
      );

      if (response.success && response.data) {
        res.json({
          success: true,
          data: response.data,
          tolerance,
          timestamp: Date.now()
        });
      } else {
        res.status(400).json({
          success: false,
          error: response.error,
          tolerance,
          timestamp: Date.now()
        });
      }

    } catch (error: any) {
      logger.error('Oracle tolerance controller error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * GET /api/oracle/feeds/:chainId
   * Get available price feeds for a network
   */
  async getAvailableFeeds(req: Request, res: Response): Promise<void> {
    try {
      const chainId = parseInt(req.params.chainId);

      logger.info('Oracle feeds request received', { chainId });

      const feeds = oracleService.getAvailablePriceFeeds(chainId);

      res.json({
        success: true,
        data: {
          chainId,
          feeds,
          count: feeds.length
        },
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('Oracle feeds controller error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * GET /api/oracle/networks
   * Get all supported networks with their price feeds
   */
  async getSupportedNetworks(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Oracle networks request received');

      const networks = oracleService.getAllSupportedNetworks();

      res.json({
        success: true,
        data: networks,
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('Oracle networks controller error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * GET /api/oracle/health/:chainId/:pair
   * Get price feed health status
   */
  async getPriceFeedHealth(req: Request, res: Response): Promise<void> {
    try {
      const chainId = parseInt(req.params.chainId);
      const pair = req.params.pair;

      logger.info('Oracle health check request received', { chainId, pair });

      const health = await oracleService.getPriceFeedHealth(chainId, pair);

      res.json({
        success: true,
        data: health,
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('Oracle health controller error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }
}

// Export singleton instance
export const oracleController = new OracleController(); 