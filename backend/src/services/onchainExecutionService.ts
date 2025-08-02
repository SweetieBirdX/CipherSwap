import { logger } from '../utils/logger';
import { 
  LimitOrderRequest, 
  LimitOrderResponse, 
  LimitOrderData, 
  LimitOrderStatus 
} from '../types/swap';
import { LimitOrderSDKService } from './limitOrderSDKService';
import { CustomOrderbookService } from './customOrderbookService';
import { LIMIT_ORDER_CONFIG } from '../config/limitOrderConfig';
import { ethers } from 'ethers';

export interface OnchainExecutionParams {
  orderId: string;
  userAddress: string;
  gasPrice?: string;
  gasLimit?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
}

export interface TransactionResult {
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failed';
  error?: string;
  confirmations: number;
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
  totalCost: string;
}

export class OnchainExecutionService {
  private sdkService: LimitOrderSDKService;
  private orderbookService: CustomOrderbookService;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  
  constructor() {
    this.sdkService = new LimitOrderSDKService();
    this.orderbookService = new CustomOrderbookService();
    
    // Initialize provider and wallet
    this.provider = new ethers.JsonRpcProvider(LIMIT_ORDER_CONFIG.SDK.NETWORK_ID === 1 
      ? process.env.ETHEREUM_RPC_URL 
      : process.env.POLYGON_RPC_URL || process.env.ETHEREUM_RPC_URL);
    
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    
    logger.info('OnchainExecutionService initialized', {
      networkId: LIMIT_ORDER_CONFIG.SDK.NETWORK_ID,
      walletAddress: this.wallet.address,
      timestamp: Date.now(),
      service: 'cipherswap-onchain-execution'
    });
  }
  
  /**
   * Execute limit order onchain with real transaction
   */
  async executeLimitOrderOnchain(params: OnchainExecutionParams): Promise<LimitOrderResponse> {
    try {
      logger.info('Executing limit order onchain', { 
        orderId: params.orderId,
        userAddress: params.userAddress,
        gasPrice: params.gasPrice,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      // Get order from orderbook
      const orderResponse = await this.orderbookService.getOrder(params.orderId);
      if (!orderResponse.success || !orderResponse.data) {
        return {
          success: false,
          error: 'Order not found'
        };
      }
      
      const order = orderResponse.data;
      
      // Validate order can be executed
      if (order.status !== LimitOrderStatus.PENDING) {
        return {
          success: false,
          error: `Order cannot be executed. Current status: ${order.status}`
        };
      }
      
      // Check if order is expired
      if (Date.now() > order.deadline) {
        await this.orderbookService.updateOrderStatus(params.orderId, LimitOrderStatus.EXPIRED);
        return {
          success: false,
          error: 'Order has expired'
        };
      }
      
      // Estimate gas for the transaction
      const gasEstimate = await this.estimateGasForExecution(order, params);
      if (!gasEstimate.success) {
        return {
          success: false,
          error: `Gas estimation failed: ${gasEstimate.error}`
        };
      }
      
      // Execute the transaction
      const transactionResult = await this.executeTransaction(order, gasEstimate.data as unknown as GasEstimate, params);
      if (!transactionResult.success) {
        return {
          success: false,
          error: `Transaction execution failed: ${transactionResult.error}`
        };
      }
      
      // Update order with transaction details
      const updatedOrder: LimitOrderData = {
        ...order,
        txHash: (transactionResult.data as unknown as TransactionResult).txHash,
        status: LimitOrderStatus.EXECUTED,
        gasEstimate: (transactionResult.data as unknown as TransactionResult).gasUsed,
        gasPrice: (transactionResult.data as unknown as TransactionResult).gasPrice
      };
      
      await this.orderbookService.updateOrder(params.orderId, updatedOrder);
      
      logger.info('Limit order executed successfully onchain', { 
        orderId: params.orderId,
        txHash: (transactionResult.data as unknown as TransactionResult).txHash,
        blockNumber: (transactionResult.data as unknown as TransactionResult).blockNumber,
        gasUsed: (transactionResult.data as unknown as TransactionResult).gasUsed,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      return {
        success: true,
        data: updatedOrder
      };
      
    } catch (error: any) {
      logger.error('Onchain execution error', { 
        error: error.message, 
        stack: error.stack,
        orderId: params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      return {
        success: false,
        error: `Onchain execution failed: ${error.message}`
      };
    }
  }
  
  /**
   * Estimate gas for limit order execution
   */
  async estimateGasForExecution(order: LimitOrderData, params: OnchainExecutionParams): Promise<LimitOrderResponse> {
    try {
      logger.info('Estimating gas for limit order execution', { 
        orderId: params.orderId,
        fromToken: order.fromToken,
        toToken: order.toToken,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      // Get current gas price
      const feeData = await this.provider.getFeeData();
      
      // Calculate gas estimate based on order complexity
      const baseGasLimit = LIMIT_ORDER_CONFIG.GAS.DEFAULT_GAS_LIMIT;
      const complexityMultiplier = this.calculateComplexityMultiplier(order);
      const estimatedGasLimit = Math.floor(baseGasLimit * complexityMultiplier);
      
      // Use provided gas price or current network gas price
      const gasPrice = params.gasPrice || feeData.gasPrice?.toString() || LIMIT_ORDER_CONFIG.GAS.DEFAULT_GAS_PRICE;
      const maxPriorityFeePerGas = params.maxPriorityFeePerGas || feeData.maxPriorityFeePerGas?.toString() || '2000000000'; // 2 gwei
      const maxFeePerGas = params.maxFeePerGas || feeData.maxFeePerGas?.toString() || gasPrice;
      
      const gasEstimate: GasEstimate = {
        gasLimit: estimatedGasLimit.toString(),
        gasPrice,
        maxPriorityFeePerGas,
        maxFeePerGas,
        totalCost: (BigInt(estimatedGasLimit) * BigInt(gasPrice)).toString()
      };
      
      logger.info('Gas estimation completed', { 
        orderId: params.orderId,
        gasEstimate,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      return {
        success: true,
        data: gasEstimate as unknown as LimitOrderData
      };
      
    } catch (error: any) {
      logger.error('Gas estimation error', { 
        error: error.message, 
        orderId: params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      return {
        success: false,
        error: `Gas estimation failed: ${error.message}`
      };
    }
  }
  
  /**
   * Execute the actual transaction onchain
   */
  private async executeTransaction(order: LimitOrderData, gasEstimate: GasEstimate, params: OnchainExecutionParams): Promise<LimitOrderResponse> {
    try {
      logger.info('Executing transaction onchain', { 
        orderId: params.orderId,
        gasLimit: gasEstimate.gasLimit,
        gasPrice: gasEstimate.gasPrice,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      // Create transaction data for limit order execution
      const transactionData = await this.createLimitOrderTransaction(order, gasEstimate);
      
      // Sign and send transaction
      const signedTx = await this.wallet.signTransaction(transactionData);
      const txResponse = await this.provider.broadcastTransaction(signedTx);
      
      // Wait for transaction confirmation
      const receipt = await txResponse.wait(LIMIT_ORDER_CONFIG.EXECUTION.CONFIRMATION_BLOCKS);
      
      // Check transaction status
      if (!receipt || receipt.status === 0) {
        throw new Error('Transaction failed onchain');
      }
      
      const transactionResult: TransactionResult = {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber!,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.gasPrice?.toString() || gasEstimate.gasPrice,
        status: 'success',
        confirmations: Number(receipt.confirmations)
      };
      
      logger.info('Transaction executed successfully', { 
        orderId: params.orderId,
        txHash: transactionResult.txHash,
        blockNumber: transactionResult.blockNumber,
        gasUsed: transactionResult.gasUsed,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      return {
        success: true,
        data: transactionResult as any
      };
      
    } catch (error: any) {
      logger.error('Transaction execution error', { 
        error: error.message, 
        orderId: params.orderId,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      return {
        success: false,
        error: `Transaction execution failed: ${error.message}`
      };
    }
  }
  
  /**
   * Create transaction data for limit order execution
   */
  private async createLimitOrderTransaction(order: LimitOrderData, gasEstimate: GasEstimate): Promise<ethers.TransactionRequest> {
    // Get the limit order contract address
    const contractAddress = LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL[LIMIT_ORDER_CONFIG.SDK.NETWORK_ID as keyof typeof LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL];
    
    // Create the transaction data for executing the limit order
    const transactionData: ethers.TransactionRequest = {
      to: contractAddress,
      data: await this.encodeLimitOrderExecution(order),
      gasLimit: BigInt(gasEstimate.gasLimit),
      gasPrice: BigInt(gasEstimate.gasPrice),
      maxPriorityFeePerGas: BigInt(gasEstimate.maxPriorityFeePerGas),
      maxFeePerGas: BigInt(gasEstimate.maxFeePerGas),
      nonce: await this.wallet.getNonce()
    };
    
    return transactionData;
  }
  
  /**
   * Encode limit order execution data
   */
  private async encodeLimitOrderExecution(order: LimitOrderData): Promise<string> {
    // This would encode the actual limit order execution call
    // For now, we'll use a mock implementation
    // In real implementation, this would call the 1inch Limit Order Protocol contract
    
    const mockExecutionData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'address', 'uint256', 'uint256', 'address'],
      [
        order.fromToken,
        order.toToken,
        order.fromAmount,
        order.limitPrice,
        order.userAddress
      ]
    );
    
    // Function selector for executeOrder (mock)
    const functionSelector = '0x12345678'; // This would be the actual function selector
    
    return functionSelector + mockExecutionData.slice(2);
  }
  
  /**
   * Calculate complexity multiplier for gas estimation
   */
  private calculateComplexityMultiplier(order: LimitOrderData): number {
    let multiplier = 1.0;
    
    // Base complexity
    multiplier += 0.2;
    
    // Amount complexity
    const amount = parseFloat(order.fromAmount);
    if (amount > 1000000) { // Large amounts
      multiplier += 0.3;
    }
    
    // Route complexity
    if (order.route && order.route.length > 2) {
      multiplier += 0.2 * (order.route.length - 2);
    }
    
    // Custom strategy complexity
    if (order.customData) {
      multiplier += 0.1;
    }
    
    return Math.min(multiplier, 2.0); // Cap at 2x
  }
  
  /**
   * Get transaction status and confirmations
   */
  async getTransactionStatus(txHash: string): Promise<LimitOrderResponse> {
    try {
      logger.info('Getting transaction status', { 
        txHash,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }
      
      const transactionResult: TransactionResult = {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber!,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.gasPrice?.toString() || '0',
        status: receipt.status === 1 ? 'success' : 'failed',
        confirmations: Number(receipt.confirmations),
        error: receipt.status === 0 ? 'Transaction failed' : undefined
      };
      
      return {
        success: true,
        data: transactionResult as any
      };
      
    } catch (error: any) {
      logger.error('Get transaction status error', { 
        error: error.message, 
        txHash,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      return {
        success: false,
        error: `Get transaction status failed: ${error.message}`
      };
    }
  }
  
  /**
   * Cancel limit order onchain
   */
  async cancelLimitOrderOnchain(orderId: string, userAddress: string): Promise<LimitOrderResponse> {
    try {
      logger.info('Cancelling limit order onchain', { 
        orderId,
        userAddress,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      // Get order from orderbook
      const orderResponse = await this.orderbookService.getOrder(orderId);
      if (!orderResponse.success || !orderResponse.data) {
        return {
          success: false,
          error: 'Order not found'
        };
      }
      
      const order = orderResponse.data;
      
      // Validate order can be cancelled
      if (order.status !== LimitOrderStatus.PENDING) {
        return {
          success: false,
          error: `Order cannot be cancelled. Current status: ${order.status}`
        };
      }
      
      // Create cancellation transaction
      const cancellationData = await this.createCancellationTransaction(order);
      
      // Sign and send transaction
      const signedTx = await this.wallet.signTransaction(cancellationData);
      const txResponse = await this.provider.broadcastTransaction(signedTx);
      
      // Wait for confirmation
      const receipt = await txResponse.wait(LIMIT_ORDER_CONFIG.EXECUTION.CONFIRMATION_BLOCKS);
      
      if (!receipt || receipt.status === 0) {
        throw new Error('Cancellation transaction failed');
      }
      
      // Update order status
      const updatedOrder: LimitOrderData = {
        ...order,
        txHash: receipt.hash,
        status: LimitOrderStatus.CANCELLED
      };
      
      await this.orderbookService.updateOrder(orderId, updatedOrder);
      
      logger.info('Limit order cancelled successfully onchain', { 
        orderId,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      return {
        success: true,
        data: updatedOrder
      };
      
    } catch (error: any) {
      logger.error('Cancel limit order error', { 
        error: error.message, 
        orderId,
        timestamp: Date.now(),
        service: 'cipherswap-onchain-execution'
      });
      
      return {
        success: false,
        error: `Cancel limit order failed: ${error.message}`
      };
    }
  }
  
  /**
   * Create cancellation transaction data
   */
  private async createCancellationTransaction(order: LimitOrderData): Promise<ethers.TransactionRequest> {
    const contractAddress = LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL[LIMIT_ORDER_CONFIG.SDK.NETWORK_ID as keyof typeof LIMIT_ORDER_CONFIG.CONTRACTS.LIMIT_ORDER_PROTOCOL];
    
    // Mock cancellation data
    const cancellationData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes32'],
      [order.orderId]
    );
    
    const functionSelector = '0x87654321'; // Mock function selector for cancelOrder
    
    const transactionData: ethers.TransactionRequest = {
      to: contractAddress,
      data: functionSelector + cancellationData.slice(2),
      gasLimit: BigInt(LIMIT_ORDER_CONFIG.GAS.DEFAULT_GAS_LIMIT),
      gasPrice: BigInt(LIMIT_ORDER_CONFIG.GAS.DEFAULT_GAS_PRICE),
      nonce: await this.wallet.getNonce()
    };
    
    return transactionData;
  }
} 