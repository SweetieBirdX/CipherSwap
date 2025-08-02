import { Request, Response } from 'express';
import { RealOnchainExecutionService } from '../../services/realOnchainExecutionService';
import { logger } from '../../utils/logger';

const executionService = new RealOnchainExecutionService();

export class RealOnchainExecutionController {
  
  /**
   * Estimate gas for limit order execution
   */
  async estimateGas(req: Request, res: Response) {
    try {
      const { orderId, userAddress, gasPrice, gasLimit, maxPriorityFeePerGas, maxFeePerGas } = req.body;
      
      logger.info('Estimating gas for onchain execution', {
        orderId,
        userAddress,
        gasPrice,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      // Get order from orderbook first
      const { CustomOrderbookService } = await import('../../services/customOrderbookService');
      const orderbookService = new CustomOrderbookService();
      
      const orderResponse = await orderbookService.getOrder(orderId);
      if (!orderResponse.success || !orderResponse.data) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      const order = orderResponse.data;
      
      // Estimate gas using real onchain execution service
      const gasEstimate = await executionService.estimateGasForExecution(order, {
        orderId,
        userAddress,
        gasPrice,
        gasLimit,
        maxPriorityFeePerGas,
        maxFeePerGas
      });

      if (!gasEstimate.success) {
        return res.status(400).json({
          success: false,
          error: gasEstimate.error
        });
      }

      logger.info('Gas estimation completed', {
        orderId,
        gasEstimate: gasEstimate.data,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      return res.json({
        success: true,
        data: gasEstimate.data,
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('Gas estimation error', {
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      return res.status(500).json({
        success: false,
        error: `Gas estimation failed: ${error.message}`
      });
    }
  }

  /**
   * Execute limit order onchain
   */
  async executeOrder(req: Request, res: Response) {
    try {
      const { orderId, userAddress, gasPrice, gasLimit, maxPriorityFeePerGas, maxFeePerGas } = req.body;
      
      logger.info('Executing limit order onchain', {
        orderId,
        userAddress,
        gasPrice,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      const result = await executionService.executeLimitOrderOnchain({
        orderId,
        userAddress,
        gasPrice,
        gasLimit,
        maxPriorityFeePerGas,
        maxFeePerGas
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      logger.info('Limit order executed successfully onchain', {
        orderId,
        txHash: result.data?.txHash,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      return res.json({
        success: true,
        data: result.data,
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('Onchain execution error', {
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      return res.status(500).json({
        success: false,
        error: `Onchain execution failed: ${error.message}`
      });
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(req: Request, res: Response) {
    try {
      const { txHash } = req.params;
      
      logger.info('Getting transaction status', {
        txHash,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      const result = await executionService.getTransactionStatus(txHash);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('Get transaction status error', {
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      return res.status(500).json({
        success: false,
        error: `Get transaction status failed: ${error.message}`
      });
    }
  }

  /**
   * Cancel limit order onchain
   */
  async cancelOrder(req: Request, res: Response) {
    try {
      const { orderId, userAddress } = req.body;
      
      logger.info('Cancelling limit order onchain', {
        orderId,
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      const result = await executionService.cancelLimitOrderOnchain(orderId, userAddress);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      logger.info('Limit order cancelled successfully onchain', {
        orderId,
        txHash: result.data?.txHash,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      return res.json({
        success: true,
        data: result.data,
        timestamp: Date.now()
      });

    } catch (error: any) {
      logger.error('Cancel order error', {
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        service: 'cipherswap-real-onchain-execution'
      });

      return res.status(500).json({
        success: false,
        error: `Cancel order failed: ${error.message}`
      });
    }
  }
} 