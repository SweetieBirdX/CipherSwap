import { Request, Response } from 'express';
import { PredicateService } from '../../services/predicateService';
import { logger } from '../../utils/logger';
import { PredicateRequest, PredicateData, ApiResponse } from '../../types/predicate';

export class PredicateController {
  private predicateService: PredicateService;
  
  constructor() {
    this.predicateService = new PredicateService();
  }
  
  /**
   * POST /api/predicate/create - Create a new price predicate
   */
  async createPredicate(req: Request, res: Response): Promise<void> {
    try {
      const { 
        chainId, 
        oracleAddress, 
        tolerance, 
        userAddress,
        tokenAddress,
        priceThreshold,
        deadline 
      } = req.body;
      
      logger.info('Predicate creation request received', { 
        chainId, 
        oracleAddress, 
        tolerance,
        userAddress 
      });
      
      // Validate required parameters
      if (!chainId || !oracleAddress || !tolerance || !userAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: chainId, oracleAddress, tolerance, userAddress',
          timestamp: Date.now()
        });
        return;
      }
      
      // Create predicate request
      const predicateRequest: PredicateRequest = {
        chainId: parseInt(chainId),
        oracleAddress,
        tolerance: parseFloat(tolerance),
        userAddress,
        tokenAddress,
        priceThreshold: priceThreshold ? parseFloat(priceThreshold) : undefined,
        deadline: deadline ? parseInt(deadline) : undefined
      };
      
      // Create predicate
      const predicateResponse = await this.predicateService.createPredicate(predicateRequest);
      
      if (!predicateResponse.success) {
        res.status(400).json({
          success: false,
          error: predicateResponse.error,
          timestamp: Date.now()
        });
        return;
      }
      
      // Return successful response
      const apiResponse: ApiResponse<PredicateData> = {
        success: true,
        data: predicateResponse.data,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Predicate creation controller error', { 
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
   * GET /api/predicate/validate/:id - Validate predicate with current oracle price
   */
  async validatePredicate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Predicate validation request received', { predicateId: id });
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Missing predicate ID',
          timestamp: Date.now()
        });
        return;
      }
      
      // Validate predicate
      const validationResponse = await this.predicateService.validatePredicate(id);
      
      if (!validationResponse.success) {
        res.status(404).json({
          success: false,
          error: validationResponse.error,
          timestamp: Date.now()
        });
        return;
      }
      
      // Return successful response
      const apiResponse: ApiResponse = {
        success: true,
        data: validationResponse.data,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Predicate validation controller error', { 
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
   * GET /api/predicate/history - Get predicate history for user
   */
  async getPredicateHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress, limit = '10', page = '1' } = req.query;
      
      logger.info('Predicate history request received', { userAddress, limit, page });
      
      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing userAddress parameter',
          timestamp: Date.now()
        });
        return;
      }
      
      // Get predicate history
      const history = await this.predicateService.getPredicateHistory(
        userAddress as string,
        parseInt(limit as string),
        parseInt(page as string)
      );
      
      // Return successful response
      const apiResponse: ApiResponse = {
        success: true,
        data: history,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Predicate history controller error', { 
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
   * GET /api/predicate/oracles - Get available Chainlink oracles for chain
   */
  async getAvailableOracles(req: Request, res: Response): Promise<void> {
    try {
      const { chainId = '1' } = req.query;
      
      logger.info('Available oracles request received', { chainId });
      
      // Get available oracles
      const oracles = await this.predicateService.getAvailableOracles(parseInt(chainId as string));
      
      // Return successful response
      const apiResponse: ApiResponse = {
        success: true,
        data: oracles,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Available oracles controller error', { 
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
   * POST /api/predicate/cancel/:id - Cancel active predicate
   */
  async cancelPredicate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userAddress } = req.body;
      
      logger.info('Cancel predicate request received', { predicateId: id, userAddress });
      
      if (!id || !userAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: predicate ID and userAddress',
          timestamp: Date.now()
        });
        return;
      }
      
      // Cancel predicate
      const cancelResponse = await this.predicateService.cancelPredicate(id, userAddress);
      
      if (!cancelResponse.success) {
        res.status(400).json({
          success: false,
          error: cancelResponse.error,
          timestamp: Date.now()
        });
        return;
      }
      
      // Return successful response
      const apiResponse: ApiResponse = {
        success: true,
        data: cancelResponse.data,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Cancel predicate controller error', { 
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
   * GET /api/predicate/status/:id - Get predicate status and details
   */
  async getPredicateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Predicate status request received', { predicateId: id });
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Missing predicate ID',
          timestamp: Date.now()
        });
        return;
      }
      
      // Get predicate status
      const statusResponse = await this.predicateService.getPredicateStatus(id);
      
      if (!statusResponse.success) {
        res.status(404).json({
          success: false,
          error: statusResponse.error,
          timestamp: Date.now()
        });
        return;
      }
      
      // Return successful response
      const apiResponse: ApiResponse = {
        success: true,
        data: statusResponse.data,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Predicate status controller error', { 
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
}

export default PredicateController; 