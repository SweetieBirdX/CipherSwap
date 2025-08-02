// ====== RESOLVER_BOT_LOGIC (yahya) ======
import { ethers } from 'ethers';
import { Api, RfqOrder } from '@1inch/limit-order-sdk';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { OrderbookService } from './orderbookService';
import { PredicateService } from './predicateService';
import axios from 'axios';

export class ResolverBot {
  private api: Api;
  private wallet: ethers.Wallet;
  private provider: ethers.Provider;
  private orderbookService: OrderbookService;
  private predicateService: PredicateService;
  private whitelistedAddresses: string[];
  private isRunning: boolean = false;
  private watchInterval: NodeJS.Timeout | null = null;

  constructor(
    authKey: string,
    privateKey: string,
    provider: ethers.Provider,
    orderbookService: OrderbookService,
    predicateService: PredicateService
  ) {
    this.provider = provider;
    this.wallet = new ethers.Wallet(privateKey, provider);
    this.orderbookService = orderbookService;
    this.predicateService = predicateService;
    this.whitelistedAddresses = [];

    // Create HTTP connector for 1inch API
    const httpConnector = {
      get: async <T>(url: string, headers: Record<string, string>): Promise<T> => {
        const response = await axios.get(url, { headers });
        return response.data;
      },
      post: async <T>(url: string, data: unknown, headers: Record<string, string>): Promise<T> => {
        const response = await axios.post(url, data, { headers });
        return response.data;
      }
    };

    this.api = new Api({
      networkId: config.CHAIN_ID,
      authKey,
      httpConnector
    });

    logger.info('ResolverBot initialized', {
      address: this.wallet.address,
      chainId: config.CHAIN_ID,
      timestamp: Date.now(),
      service: 'cipherswap-resolver-bot'
    });
  }

  /**
   * Resolver bot'u başlat
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('ResolverBot is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting ResolverBot', {
      address: this.wallet.address,
      timestamp: Date.now(),
      service: 'cipherswap-resolver-bot'
    });

    // RFQ order'ları izlemeye başla
    this.watchRFQOrders();
  }

  /**
   * Resolver bot'u durdur
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('ResolverBot is not running');
      return;
    }

    this.isRunning = false;
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }

    logger.info('ResolverBot stopped', {
      address: this.wallet.address,
      timestamp: Date.now(),
      service: 'cipherswap-resolver-bot'
    });
  }

  /**
   * RFQ order'ları izle ve fill et
   */
  private async watchRFQOrders(): Promise<void> {
    const intervalMs = 10000; // 10 saniye

    this.watchInterval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        // Off-chain orderbook'dan fillable order'ları al
        const fillableOrders = await this.orderbookService.getFillableOrders(this.wallet.address);
        
        for (const order of fillableOrders) {
          if (await this.orderIsFillable(order)) {
            const result = await this.fillOrder(order);
            if (result.success) {
              logger.info('Order filled successfully', {
                orderId: order.orderId,
                txHash: result.data?.hash,
                timestamp: Date.now(),
                service: 'cipherswap-resolver-bot'
              });
            } else {
              logger.error('Order fill failed', {
                orderId: order.orderId,
                error: result.error,
                timestamp: Date.now(),
                service: 'cipherswap-resolver-bot'
              });
            }
          }
        }
      } catch (error: any) {
        logger.error('RFQ watching error', {
          error: error.message,
          timestamp: Date.now(),
          service: 'cipherswap-resolver-bot'
        });
      }
    }, intervalMs);
  }

  /**
   * Order'ın fill edilebilir olup olmadığını kontrol et
   */
  private async orderIsFillable(order: any): Promise<boolean> {
    try {
      // Whitelist kontrolü
      if (this.whitelistedAddresses.length > 0) {
        if (!this.whitelistedAddresses.includes(this.wallet.address)) {
          logger.debug('Bot not in whitelist', {
            orderId: order.orderId,
            botAddress: this.wallet.address,
            service: 'cipherswap-resolver-bot'
          });
          return false;
        }
      }

      // Expiration kontrolü
      if (Date.now() > order.deadline) {
        logger.debug('Order expired', {
          orderId: order.orderId,
          deadline: order.deadline,
          service: 'cipherswap-resolver-bot'
        });
        return false;
      }

      // Predicate kontrolü (eğer varsa)
      if (order.predicateId) {
        const predicateResult = await this.validateOrderPredicate(order);
        if (!predicateResult.success || !predicateResult.isValid) {
          logger.debug('Predicate validation failed', {
            orderId: order.orderId,
            predicateId: order.predicateId,
            error: predicateResult.error,
            service: 'cipherswap-resolver-bot'
          });
          return false;
        }
      }

      // Order size kontrolü
      const orderSize = parseFloat(order.fromAmount);
      if (orderSize < 0.001) { // Minimum order size
        logger.debug('Order size too small', {
          orderId: order.orderId,
          size: orderSize,
          service: 'cipherswap-resolver-bot'
        });
        return false;
      }

      return true;
    } catch (error: any) {
      logger.error('Order fillability check error', {
        orderId: order.orderId,
        error: error.message,
        service: 'cipherswap-resolver-bot'
      });
      return false;
    }
  }

  /**
   * Order'ın predicate'ini validate et
   */
  private async validateOrderPredicate(order: any): Promise<{ success: boolean; isValid: boolean; error?: string }> {
    try {
      if (!order.predicateId) {
        return { success: true, isValid: true };
      }

      // Bu kısım predicate service ile entegre edilecek
      // Şimdilik basit bir kontrol
      return { success: true, isValid: true };
    } catch (error: any) {
      return {
        success: false,
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Order'ı fill et - Gerçek onchain execution
   */
  private async fillOrder(order: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      logger.info('Attempting to fill order onchain', {
        orderId: order.orderId,
        fromToken: order.fromToken,
        toToken: order.toToken,
        amount: order.fromAmount,
        service: 'cipherswap-resolver-bot'
      });

      // Import OnchainExecutionService
      const { OnchainExecutionService } = await import('./onchainExecutionService');
      const onchainService = new OnchainExecutionService();

      // Execute order onchain
      const executionResult = await onchainService.executeLimitOrderOnchain({
        orderId: order.orderId,
        userAddress: order.userAddress,
        gasPrice: undefined, // Use network gas price
        gasLimit: undefined, // Use estimated gas limit
        maxPriorityFeePerGas: undefined, // Use network priority fee
        maxFeePerGas: undefined // Use network max fee
      });

      if (!executionResult.success) {
        throw new Error(executionResult.error);
      }

      const executedOrder = executionResult.data!;
      
      // Order status'u güncelle
      await this.orderbookService.updateOrderStatus(
        order.orderId,
        'executed' as any,
        {
          executedBy: this.wallet.address,
          executionTxHash: executedOrder.txHash,
          executionTimestamp: Date.now(),
          gasUsed: executedOrder.gasEstimate,
          gasPrice: executedOrder.gasPrice
        }
      );

      logger.info('Order filled successfully onchain', {
        orderId: order.orderId,
        txHash: executedOrder.txHash,
        gasUsed: executedOrder.gasEstimate,
        service: 'cipherswap-resolver-bot'
      });

      return {
        success: true,
        data: {
          hash: executedOrder.txHash,
          orderId: order.orderId,
          executedBy: this.wallet.address,
          gasUsed: executedOrder.gasEstimate,
          gasPrice: executedOrder.gasPrice
        }
      };
    } catch (error: any) {
      logger.error('Fill order error', {
        orderId: order.orderId,
        error: error.message,
        service: 'cipherswap-resolver-bot'
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Whitelist'e address ekle
   */
  addToWhitelist(address: string): void {
    if (!this.whitelistedAddresses.includes(address)) {
      this.whitelistedAddresses.push(address);
      logger.info('Address added to whitelist', {
        address,
        service: 'cipherswap-resolver-bot'
      });
    }
  }

  /**
   * Whitelist'ten address çıkar
   */
  removeFromWhitelist(address: string): void {
    this.whitelistedAddresses = this.whitelistedAddresses.filter(addr => addr !== address);
    logger.info('Address removed from whitelist', {
      address,
      service: 'cipherswap-resolver-bot'
    });
  }

  /**
   * Bot durumunu al
   */
  getStatus(): {
    isRunning: boolean;
    address: string;
    whitelistedAddresses: string[];
    lastActivity?: number;
  } {
    return {
      isRunning: this.isRunning,
      address: this.wallet.address,
      whitelistedAddresses: this.whitelistedAddresses,
      lastActivity: Date.now()
    };
  }
}
// ====== END RESOLVER_BOT_LOGIC ====== 