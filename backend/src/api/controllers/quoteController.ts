import { Request, Response } from 'express';
import { QuoteService } from '../../services/quoteService';
import { logger } from '../../utils/logger';
import { QuoteRequest, QuoteData, ApiResponse } from '../../types/quote';

export class QuoteController {
  private quoteService: QuoteService;
  
  constructor() {
    this.quoteService = new QuoteService();
  }
  
  /**
   * GET /api/quote - Get quote for swap
   */
  async getQuote(req: Request, res: Response): Promise<void> {
    try {
      const { fromToken, toToken, amount, chainId, slippage, userAddress } = req.body;
      
      logger.info('Quote request received', { 
        fromToken, 
        toToken, 
        amount, 
        chainId,
        userAddress 
      });
      
      // Validate required parameters
      if (!fromToken || !toToken || !amount || !chainId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: fromToken, toToken, amount, chainId',
          timestamp: Date.now()
        });
        return;
      }
      
      // Create quote request
      const quoteRequest: QuoteRequest = {
        fromToken,
        toToken,
        amount,
        chainId: parseInt(chainId),
        slippage: slippage ? parseFloat(slippage) : undefined,
        userAddress
      };
      
      // Get quote from service
      const quoteResponse = await this.quoteService.getQuote(quoteRequest);
      
      if (!quoteResponse.success) {
        res.status(400).json({
          success: false,
          error: quoteResponse.error,
          timestamp: Date.now()
        });
        return;
      }
      
      // Return successful response
      const apiResponse: ApiResponse<QuoteData> = {
        success: true,
        data: quoteResponse.data,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Quote controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * POST /api/quote/simulate - Simulate swap
   */
  async simulateSwap(req: Request, res: Response): Promise<void> {
    try {
      const { quote, userAddress } = req.body;
      
      logger.info('Simulation request received', { userAddress });
      
      // Validate required parameters
      if (!quote || !userAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: quote, userAddress',
          timestamp: Date.now()
        });
        return;
      }
      
      // Simulate swap
      const simulationResponse = await this.quoteService.simulateSwap(quote, userAddress);
      
      if (!simulationResponse.success) {
        res.status(400).json({
          success: false,
          error: simulationResponse.error,
          timestamp: Date.now()
        });
        return;
      }
      
      // Return successful response
      const apiResponse: ApiResponse = {
        success: true,
        data: simulationResponse.data,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Simulation controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * GET /api/quote/history - Get quote history
   */
  async getQuoteHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress, limit = '10', page = '1' } = req.query;
      
      logger.info('Quote history request received', { userAddress, limit, page });
      
      // Get quote history
      const history = await this.quoteService.getQuoteHistory(
        userAddress as string,
        parseInt(limit as string)
      );
      
      // Return array directly for test compatibility
      res.json(history || []);
      
    } catch (error: any) {
      logger.error('Quote history controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * GET /api/quote/tokens - Get supported tokens
   */
  async getSupportedTokens(req: Request, res: Response): Promise<void> {
    try {
      const { chainId = '1' } = req.query;
      
      logger.info('Supported tokens request received', { chainId });
      
      // Get supported tokens
      const tokens = await this.quoteService.getSupportedTokens(parseInt(chainId as string));
      
      // Return array directly for test compatibility
      res.json(tokens || []);
      
    } catch (error: any) {
      logger.error('Supported tokens controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * POST /api/quote/multiple - Get multiple quotes for analysis
   */
  async getMultipleQuotes(req: Request, res: Response): Promise<void> {
    try {
      const { fromToken, amount, chainId, slippage, userAddress } = req.body;
      
      logger.info('Multiple quotes request received', { 
        fromToken, 
        amount, 
        chainId,
        userAddress 
      });
      
      // Validate required parameters
      if (!fromToken || !amount || !chainId || !userAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: fromToken, amount, chainId, userAddress',
          timestamp: Date.now()
        });
        return;
      }
      
      // Create quote request (we'll use a default toToken, service will handle multiple tokens)
      const quoteRequest: QuoteRequest = {
        fromToken,
        toToken: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC as default
        amount,
        chainId: parseInt(chainId),
        slippage: slippage ? parseFloat(slippage) : undefined,
        userAddress
      };
      
      // Get multiple quotes from service
      const multipleQuotesResponse = await this.quoteService.getMultipleQuotes(quoteRequest);
      
      if (!multipleQuotesResponse.success) {
        res.status(400).json({
          success: false,
          error: multipleQuotesResponse.error,
          timestamp: Date.now()
        });
        return;
      }
      
      // Return successful response
      const apiResponse: ApiResponse<any> = {
        success: true,
        data: multipleQuotesResponse.data,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Multiple quotes controller error', { 
        error: error.message, 
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get network analytics
   */
  async getNetworkAnalytics(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Network analytics request received');
      
      const analytics = await this.quoteService.getNetworkAnalytics();
      
      res.json({
        success: true,
        data: analytics,
        timestamp: Date.now()
      });
      
    } catch (error: any) {
      logger.error('Network analytics error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch network analytics',
        timestamp: Date.now()
      });
    }
  }
}

export default QuoteController; 