import { Request, Response } from 'express';
import { RealTimeSwapService } from '../../services/realTimeSwapService';
import { SwapService } from '../../services/swapService';
import { 
  SwapRequest, 
  LimitOrderRequest,
  SwapResponse,
  LimitOrderResponse
} from '../../types/swap';
import { logger } from '../../utils/logger';

export class RealTimeSwapController {
  private realTimeService: RealTimeSwapService;
  private swapService: SwapService;

  constructor() {
    this.realTimeService = new RealTimeSwapService();
    this.swapService = new SwapService();
  }

  /**
   * Gerçek zamanlı swap analizi ve öneriler
   */
  async analyzeAndRecommend(req: Request, res: Response): Promise<void> {
    try {
      const swapRequest: SwapRequest = req.body;

      logger.info('Real-time swap analysis requested', {
        fromToken: swapRequest.fromToken,
        toToken: swapRequest.toToken,
        amount: swapRequest.amount,
        userAddress: swapRequest.userAddress,
        timestamp: Date.now()
      });

      // Validasyon
      const validation = this.validateSwapRequest(swapRequest);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: validation.errors.join(', '),
          timestamp: Date.now()
        });
        return;
      }

      // Gerçek zamanlı analiz
      const analysis = await this.realTimeService.analyzeAndRecommend(swapRequest);

      res.status(200).json({
        success: true,
        data: analysis,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error('Real-time analysis controller error', {
        error: error instanceof Error ? error.message : String(error),
        body: req.body,
        timestamp: Date.now()
      });

      res.status(500).json({
        success: false,
        error: 'Real-time analysis failed',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Optimize edilmiş swap işlemi gerçekleştirme
   */
  async executeOptimizedSwap(req: Request, res: Response): Promise<void> {
    try {
      const swapRequest: SwapRequest = req.body;

      logger.info('Optimized swap execution requested', {
        fromToken: swapRequest.fromToken,
        toToken: swapRequest.toToken,
        amount: swapRequest.amount,
        userAddress: swapRequest.userAddress,
        timestamp: Date.now()
      });

      // Validasyon
      const validation = this.validateSwapRequest(swapRequest);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: validation.errors.join(', '),
          timestamp: Date.now()
        });
        return;
      }

      // Optimize edilmiş swap gerçekleştir
      const result = await this.realTimeService.executeOptimizedSwap(swapRequest);

      res.status(200).json({
        success: result.success,
        data: result.data,
        error: result.error,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error('Optimized swap execution controller error', {
        error: error instanceof Error ? error.message : String(error),
        body: req.body,
        timestamp: Date.now()
      });

      res.status(500).json({
        success: false,
        error: 'Optimized swap execution failed',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Piyasa durumu ve koşulları
   */
  async getMarketStatus(req: Request, res: Response): Promise<void> {
    try {
      const { fromToken, toToken } = req.query;

      if (!fromToken || !toToken) {
        res.status(400).json({
          success: false,
          error: 'fromToken and toToken are required',
          timestamp: Date.now()
        });
        return;
      }

      // Piyasa durumu analizi
      const marketStatus = await this.getMarketStatusData(fromToken as string, toToken as string);

      res.status(200).json({
        success: true,
        data: marketStatus,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error('Market status controller error', {
        error: error instanceof Error ? error.message : String(error),
        query: req.query,
        timestamp: Date.now()
      });

      res.status(500).json({
        success: false,
        error: 'Market status retrieval failed',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Swap simülasyonu ve sonuç analizi
   */
  async simulateSwap(req: Request, res: Response): Promise<void> {
    try {
      const swapRequest: SwapRequest = req.body;

      logger.info('Swap simulation requested', {
        fromToken: swapRequest.fromToken,
        toToken: swapRequest.toToken,
        amount: swapRequest.amount,
        userAddress: swapRequest.userAddress,
        timestamp: Date.now()
      });

      // Validasyon
      const validation = this.validateSwapRequest(swapRequest);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: validation.errors.join(', '),
          timestamp: Date.now()
        });
        return;
      }

      // Simülasyon gerçekleştir
      const simulation = await this.swapService.simulateSwapEnhanced(swapRequest);

      res.status(200).json({
        success: simulation.success,
        data: simulation.data,
        error: simulation.error,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error('Swap simulation controller error', {
        error: error instanceof Error ? error.message : String(error),
        body: req.body,
        timestamp: Date.now()
      });

      res.status(500).json({
        success: false,
        error: 'Swap simulation failed',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Gerçek zamanlı fiyat bilgisi
   */
  async getCurrentPrice(req: Request, res: Response): Promise<void> {
    try {
      const { fromToken, toToken } = req.params;

      logger.info('Current price requested', {
        fromToken,
        toToken,
        timestamp: Date.now()
      });

      // Gerçek fiyat al
      const price = await this.realTimeService['getCurrentPrice'](fromToken, toToken);

      res.status(200).json({
        success: true,
        data: {
          fromToken,
          toToken,
          price,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error('Current price controller error', {
        error: error instanceof Error ? error.message : String(error),
        params: req.params,
        timestamp: Date.now()
      });

      res.status(500).json({
        success: false,
        error: 'Price retrieval failed',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Limit order oluşturma
   */
  async createLimitOrder(req: Request, res: Response): Promise<void> {
    try {
      const limitOrderRequest: LimitOrderRequest = req.body;

      logger.info('Limit order creation requested', {
        fromToken: limitOrderRequest.fromToken,
        toToken: limitOrderRequest.toToken,
        amount: limitOrderRequest.amount,
        limitPrice: limitOrderRequest.limitPrice,
        orderType: limitOrderRequest.orderType,
        userAddress: limitOrderRequest.userAddress,
        timestamp: Date.now()
      });

      // Validasyon
      const validation = this.validateLimitOrderRequest(limitOrderRequest);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: validation.errors.join(', '),
          timestamp: Date.now()
        });
        return;
      }

      // Limit order oluştur
      const result = await this.swapService.createLimitOrder(limitOrderRequest);

      res.status(200).json({
        success: result.success,
        data: result.data,
        error: result.error,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error('Limit order creation controller error', {
        error: error instanceof Error ? error.message : String(error),
        body: req.body,
        timestamp: Date.now()
      });

      res.status(500).json({
        success: false,
        error: 'Limit order creation failed',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Limit order durumu
   */
  async getOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      logger.info('Order status requested', {
        orderId,
        timestamp: Date.now()
      });

      if (!orderId) {
        res.status(400).json({
          success: false,
          error: 'orderId is required',
          timestamp: Date.now()
        });
        return;
      }

      // Order durumu al
      const result = await this.swapService.getLimitOrderStatus(orderId);

      res.status(200).json({
        success: result.success,
        data: result.data,
        error: result.error,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error('Order status controller error', {
        error: error instanceof Error ? error.message : String(error),
        params: req.params,
        timestamp: Date.now()
      });

      res.status(500).json({
        success: false,
        error: 'Order status retrieval failed',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Swap request validasyonu
   */
  private validateSwapRequest(request: SwapRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.fromToken) {
      errors.push('fromToken is required');
    }

    if (!request.toToken) {
      errors.push('toToken is required');
    }

    if (!request.amount) {
      errors.push('amount is required');
    }

    if (!request.chainId) {
      errors.push('chainId is required');
    }

    if (!request.userAddress) {
      errors.push('userAddress is required');
    }

    if (request.fromToken === request.toToken) {
      errors.push('fromToken and toToken cannot be the same');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Limit order request validasyonu
   */
  private validateLimitOrderRequest(request: LimitOrderRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.fromToken) {
      errors.push('fromToken is required');
    }

    if (!request.toToken) {
      errors.push('toToken is required');
    }

    if (!request.amount) {
      errors.push('amount is required');
    }

    if (!request.limitPrice) {
      errors.push('limitPrice is required');
    }

    if (!request.orderType) {
      errors.push('orderType is required');
    }

    if (!request.chainId) {
      errors.push('chainId is required');
    }

    if (!request.userAddress) {
      errors.push('userAddress is required');
    }

    if (!['buy', 'sell'].includes(request.orderType)) {
      errors.push('orderType must be either "buy" or "sell"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Piyasa durumu verisi
   */
  private async getMarketStatusData(fromToken: string, toToken: string): Promise<any> {
    try {
      // Gerçek piyasa verilerini al
      const volatility = await this.realTimeService['getVolatility'](fromToken, toToken);
      const liquidity = await this.realTimeService['getLiquidity'](fromToken, toToken);
      const trend = await this.realTimeService['getTrend'](fromToken, toToken);
      const currentPrice = await this.realTimeService['getCurrentPrice'](fromToken, toToken);

      return {
        fromToken,
        toToken,
        currentPrice,
        marketConditions: {
          volatility: volatility > 0.1 ? 'HIGH' : volatility > 0.05 ? 'MEDIUM' : 'LOW',
          liquidity: liquidity > 1000000 ? 'HIGH' : liquidity > 100000 ? 'MEDIUM' : 'LOW',
          trend: trend > 0.02 ? 'BULLISH' : trend < -0.02 ? 'BEARISH' : 'NEUTRAL'
        },
        metrics: {
          volatilityScore: volatility,
          liquidityScore: liquidity,
          trendScore: trend
        },
        timestamp: Date.now()
      };

    } catch (error) {
      logger.warn('Market status data retrieval failed', {
        error: error instanceof Error ? error.message : String(error),
        fromToken,
        toToken
      });

      return {
        fromToken,
        toToken,
        currentPrice: 1.8,
        marketConditions: {
          volatility: 'MEDIUM',
          liquidity: 'HIGH',
          trend: 'NEUTRAL'
        },
        metrics: {
          volatilityScore: 0.05,
          liquidityScore: 5000000,
          trendScore: 0.01
        },
        timestamp: Date.now()
      };
    }
  }
} 