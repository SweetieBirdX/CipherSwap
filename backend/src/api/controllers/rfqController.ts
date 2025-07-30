import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { RFQService } from '../../services/rfqService';
import { 
  RFQRequest, 
  RFQResponse, 
  RFQExecution,
  RFQQuery,
  RFQStats,
  ResolverQuote
} from '../../types/rfq';

export class RFQController {
  private rfqService: RFQService;

  constructor() {
    this.rfqService = new RFQService();
  }

  /**
   * Create a new RFQ request
   * POST /api/rfq/request
   */
  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info('RFQ Controller: Creating RFQ request', { 
        body: req.body,
        userAddress: req.body.userAddress 
      });

      const {
        userAddress,
        fromToken,
        toToken,
        amount,
        chainId,
        useMEVProtection,
        allowedResolvers,
        maxSlippage,
        predicateId,
        preferredExecutionTime,
        gasOptimization,
        partialFill,
        metadata
      } = req.body;

      const result = await this.rfqService.createRequest({
        userAddress,
        fromToken,
        toToken,
        amount,
        chainId,
        useMEVProtection,
        allowedResolvers,
        maxSlippage,
        predicateId,
        preferredExecutionTime,
        gasOptimization,
        partialFill,
        metadata
      });

      if (!result.success) {
        logger.error('RFQ Controller: Failed to create RFQ request', { 
          error: result.error,
          userAddress 
        });
        
        res.status(400).json({
          success: false,
          error: result.error,
          code: 'RFQ_CREATE_FAILED',
          timestamp: Date.now()
        });
        return;
      }

      logger.info('RFQ Controller: RFQ request created successfully', { 
        requestId: result.data!.requestId,
        userAddress 
      });

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'RFQ request created successfully',
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('RFQ Controller: Create request error', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'RFQ_CREATE_ERROR',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Submit a quote response from a resolver
   * POST /api/rfq/quote
   */
  async submitQuote(req: Request, res: Response): Promise<void> {
    try {
      logger.info('RFQ Controller: Submitting RFQ quote', { 
        body: req.body,
        resolverAddress: req.body.resolverAddress 
      });

      const {
        requestId,
        resolverAddress,
        resolverName,
        fromAmount,
        toAmount,
        priceImpact,
        gasEstimate,
        gasPrice,
        executionTime,
        mevProtectionType,
        bundleId,
        escrowAddress,
        resolverFee,
        protocolFee,
        totalCost,
        resolverReputation,
        averageExecutionTime,
        successRate
      } = req.body;

      const result = await this.rfqService.submitQuote({
        requestId,
        resolverAddress,
        resolverName,
        fromAmount,
        toAmount,
        priceImpact,
        gasEstimate,
        gasPrice,
        executionTime,
        mevProtectionType,
        bundleId,
        escrowAddress,
        resolverFee,
        protocolFee,
        totalCost,
        resolverReputation,
        averageExecutionTime,
        successRate
      });

      if (!result.success) {
        logger.error('RFQ Controller: Failed to submit RFQ quote', { 
          error: result.error,
          requestId,
          resolverAddress 
        });
        
        res.status(400).json({
          success: false,
          error: result.error,
          code: 'RFQ_QUOTE_SUBMIT_FAILED',
          timestamp: Date.now()
        });
        return;
      }

      logger.info('RFQ Controller: RFQ quote submitted successfully', { 
        responseId: result.data!.responseId,
        requestId,
        resolverAddress 
      });

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'RFQ quote submitted successfully',
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('RFQ Controller: Submit quote error', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'RFQ_QUOTE_SUBMIT_ERROR',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get quotes for a request
   * GET /api/rfq/request/:requestId/quotes
   */
  async getQuotes(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;

      logger.info('RFQ Controller: Getting quotes for request', { requestId });

      const result = await this.rfqService.getQuotes(requestId);

      if (!result.success) {
        logger.error('RFQ Controller: Failed to get quotes', { 
          error: result.error,
          requestId 
        });
        
        res.status(400).json({
          success: false,
          error: result.error,
          code: 'RFQ_GET_QUOTES_FAILED',
          timestamp: Date.now()
        });
        return;
      }

      logger.info('RFQ Controller: Quotes retrieved successfully', { 
        requestId,
        quoteCount: result.data!.length 
      });

      res.status(200).json({
        success: true,
        data: result.data,
        message: 'Quotes retrieved successfully',
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('RFQ Controller: Get quotes error', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'RFQ_GET_QUOTES_ERROR',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Accept a quote and execute the swap
   * POST /api/rfq/quote/:responseId/accept
   */
  async acceptQuote(req: Request, res: Response): Promise<void> {
    try {
      const { responseId } = req.params;

      logger.info('RFQ Controller: Accepting RFQ quote', { responseId });

      const result = await this.rfqService.acceptQuote(responseId);

      if (!result.success) {
        logger.error('RFQ Controller: Failed to accept quote', { 
          error: result.error,
          responseId 
        });
        
        res.status(400).json({
          success: false,
          error: result.error,
          code: 'RFQ_ACCEPT_QUOTE_FAILED',
          timestamp: Date.now()
        });
        return;
      }

      logger.info('RFQ Controller: RFQ quote accepted successfully', { 
        executionId: result.data!.executionId,
        responseId 
      });

      res.status(200).json({
        success: true,
        data: result.data,
        message: 'RFQ quote accepted successfully',
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('RFQ Controller: Accept quote error', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'RFQ_ACCEPT_QUOTE_ERROR',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Update execution status
   * PUT /api/rfq/execution/:executionId/status
   */
  async updateExecutionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { executionId } = req.params;
      const { status, executionData } = req.body;

      logger.info('RFQ Controller: Updating execution status', { 
        executionId,
        status,
        executionData 
      });

      const result = await this.rfqService.updateExecutionStatus(executionId, status, executionData);

      if (!result.success) {
        logger.error('RFQ Controller: Failed to update execution status', { 
          error: result.error,
          executionId 
        });
        
        res.status(400).json({
          success: false,
          error: result.error,
          code: 'RFQ_UPDATE_EXECUTION_FAILED',
          timestamp: Date.now()
        });
        return;
      }

      logger.info('RFQ Controller: Execution status updated successfully', { 
        executionId,
        status 
      });

      res.status(200).json({
        success: true,
        data: result.data,
        message: 'Execution status updated successfully',
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('RFQ Controller: Update execution status error', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'RFQ_UPDATE_EXECUTION_ERROR',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get RFQ request by ID
   * GET /api/rfq/request/:requestId
   */
  async getRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;

      logger.info('RFQ Controller: Getting RFQ request', { requestId });

      const result = await this.rfqService.getRequest(requestId);

      if (!result.success) {
        logger.error('RFQ Controller: Failed to get RFQ request', { 
          error: result.error,
          requestId 
        });
        
        res.status(404).json({
          success: false,
          error: result.error,
          code: 'RFQ_REQUEST_NOT_FOUND',
          timestamp: Date.now()
        });
        return;
      }

      logger.info('RFQ Controller: RFQ request retrieved successfully', { requestId });

      res.status(200).json({
        success: true,
        data: result.data,
        message: 'RFQ request retrieved successfully',
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('RFQ Controller: Get request error', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'RFQ_GET_REQUEST_ERROR',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Query RFQ requests with filters
   * GET /api/rfq/requests
   */
  async queryRequests(req: Request, res: Response): Promise<void> {
    try {
      const query: RFQQuery = req.query as any;

      logger.info('RFQ Controller: Querying RFQ requests', { query });

      const requests = await this.rfqService.queryRequests(query);

      logger.info('RFQ Controller: RFQ requests queried successfully', { 
        count: requests.length 
      });

      res.status(200).json({
        success: true,
        data: requests,
        message: 'RFQ requests queried successfully',
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('RFQ Controller: Query requests error', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'RFQ_QUERY_REQUESTS_ERROR',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get RFQ statistics
   * GET /api/rfq/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('RFQ Controller: Getting RFQ statistics');

      const stats = await this.rfqService.getRFQStats();

      logger.info('RFQ Controller: RFQ statistics retrieved successfully');

      res.status(200).json({
        success: true,
        data: stats,
        message: 'RFQ statistics retrieved successfully',
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('RFQ Controller: Get stats error', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'RFQ_GET_STATS_ERROR',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Clean up expired RFQ data
   * POST /api/rfq/cleanup
   */
  async cleanupExpired(req: Request, res: Response): Promise<void> {
    try {
      logger.info('RFQ Controller: Cleaning up expired RFQ data');

      await this.rfqService.cleanupExpired();

      logger.info('RFQ Controller: Expired RFQ data cleaned up successfully');

      res.status(200).json({
        success: true,
        message: 'Expired RFQ data cleaned up successfully',
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('RFQ Controller: Cleanup error', { 
        error: error.message,
        stack: error.stack 
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'RFQ_CLEANUP_ERROR',
        timestamp: Date.now()
      });
    }
  }
}

export default RFQController; 