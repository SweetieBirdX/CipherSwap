import { Request, Response } from 'express';
import { SwapService } from '../../services/swapService';
import { logger } from '../../utils/logger';
import { SwapRequest, SwapData, ApiResponse } from '../../types/swap';

export class SwapController {
  private swapService: SwapService;
  
  constructor() {
    this.swapService = new SwapService();
  }
  
  /**
   * POST /api/swap - Create a new swap transaction
   */
  async createSwap(req: Request, res: Response): Promise<void> {
    try {
      const { 
        fromToken, 
        toToken, 
        amount, 
        chainId, 
        slippage, 
        userAddress,
        deadline 
      } = req.body;
      
      logger.info('Swap request received', { 
        fromToken, 
        toToken, 
        amount, 
        chainId,
        userAddress 
      });
      
      // Validate required parameters
      if (!fromToken || !toToken || !amount || !chainId || !userAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: fromToken, toToken, amount, chainId, userAddress',
          timestamp: Date.now()
        });
        return;
      }
      
      // Create swap request
      const swapRequest: SwapRequest = {
        fromToken,
        toToken,
        amount,
        chainId: parseInt(chainId),
        slippage: slippage ? parseFloat(slippage) : undefined,
        userAddress,
        deadline: deadline ? parseInt(deadline) : undefined
      };
      
      // Create swap transaction
      const swapResponse = await this.swapService.createSwap(swapRequest);
      
      if (!swapResponse.success) {
        res.status(400).json({
          success: false,
          error: swapResponse.error,
          timestamp: Date.now()
        });
        return;
      }
      
      // Return successful response
      const apiResponse: ApiResponse<SwapData> = {
        success: true,
        data: swapResponse.data,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Swap controller error', { 
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
   * POST /api/swap/fusion - Create a Fusion+ swap transaction
   */
  async createFusionSwap(req: Request, res: Response): Promise<void> {
    try {
      const { 
        fromToken, 
        toToken, 
        amount, 
        chainId, 
        slippage, 
        userAddress,
        deadline,
        permit 
      } = req.body;
      
      logger.info('Fusion swap request received', { 
        fromToken, 
        toToken, 
        amount, 
        chainId,
        userAddress 
      });
      
      // Validate required parameters
      if (!fromToken || !toToken || !amount || !chainId || !userAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: fromToken, toToken, amount, chainId, userAddress',
          timestamp: Date.now()
        });
        return;
      }
      
      // Create fusion swap request
      const swapRequest: SwapRequest = {
        fromToken,
        toToken,
        amount,
        chainId: parseInt(chainId),
        slippage: slippage ? parseFloat(slippage) : undefined,
        userAddress,
        deadline: deadline ? parseInt(deadline) : undefined,
        permit
      };
      
      // Create fusion swap transaction
      const swapResponse = await this.swapService.createFusionSwap(swapRequest);
      
      if (!swapResponse.success) {
        res.status(400).json({
          success: false,
          error: swapResponse.error,
          timestamp: Date.now()
        });
        return;
      }
      
      // Return successful response
      const apiResponse: ApiResponse<SwapData> = {
        success: true,
        data: swapResponse.data,
        timestamp: Date.now()
      };
      
      res.json(apiResponse);
      
    } catch (error: any) {
      logger.error('Fusion swap controller error', { 
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
   * GET /api/swap/status/:id - Get swap transaction status
   */
  async getSwapStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Swap status request received', { swapId: id });
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Missing swap ID',
          timestamp: Date.now()
        });
        return;
      }
      
      // Get swap status
      const statusResponse = await this.swapService.getSwapStatus(id);
      
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
      logger.error('Swap status controller error', { 
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
   * POST /api/swap/simulate - Simulate swap transaction
   */
  async simulateSwap(req: Request, res: Response): Promise<void> {
    try {
      const { 
        fromToken, 
        toToken, 
        amount, 
        chainId, 
        slippage, 
        userAddress 
      } = req.body;
      
      logger.info('Swap simulation request received', { 
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
      
      // Create swap request for simulation
      const swapRequest: SwapRequest = {
        fromToken,
        toToken,
        amount,
        chainId: parseInt(chainId),
        slippage: slippage ? parseFloat(slippage) : undefined,
        userAddress
      };
      
      // Simulate swap
      const simulationResponse = await this.swapService.simulateSwap(swapRequest);
      
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
      logger.error('Swap simulation controller error', { 
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
   * GET /api/swap/history - Get swap history for user
   */
  async getSwapHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress, limit = '10', page = '1' } = req.query;
      
      logger.info('Swap history request received', { userAddress, limit, page });
      
      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing userAddress parameter',
          timestamp: Date.now()
        });
        return;
      }
      
      // Get swap history
      const history = await this.swapService.getSwapHistory(
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
      logger.error('Swap history controller error', { 
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
   * POST /api/swap/cancel/:id - Cancel pending swap transaction
   */
  async cancelSwap(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userAddress } = req.body;
      
      logger.info('Cancel swap request received', { swapId: id, userAddress });
      
      if (!id || !userAddress) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: swap ID and userAddress',
          timestamp: Date.now()
        });
        return;
      }
      
      // Cancel swap
      const cancelResponse = await this.swapService.cancelSwap(id, userAddress);
      
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
      logger.error('Cancel swap controller error', { 
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

export default SwapController; 