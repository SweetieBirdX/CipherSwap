import { OrderbookService } from '../src/services/orderbookService';
import { 
  OrderbookRequest, 
  OrderStatus, 
  ResolverBotRequest,
  ORDERBOOK_CONSTANTS 
} from '../src/types/orderbook';

// Set test environment
process.env.NODE_ENV = 'test';

describe('OrderbookService', () => {
  let orderbookService: OrderbookService;

  beforeEach(() => {
    orderbookService = new OrderbookService();
  });

  describe('addOrder', () => {
    it('should add a valid order to the orderbook', async () => {
      const orderRequest: OrderbookRequest = {
        userAddress: '0x1234567890123456789012345678901234567890',
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000',
        orderType: 'swap',
        orderSide: 'buy',
        chainId: 1,
        useMEVProtection: true,
        allowedSenders: ['0xResolverBot1'],
        maxSlippage: 1.0
      };

      const result = await orderbookService.addOrder(orderRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.orderId).toBeDefined();
      expect(result.data!.userAddress).toBe(orderRequest.userAddress);
      expect(result.data!.fromToken).toBe(orderRequest.fromToken);
      expect(result.data!.toToken).toBe(orderRequest.toToken);
      expect(result.data!.orderType).toBe(orderRequest.orderType);
      expect(result.data!.orderSide).toBe(orderRequest.orderSide);
      expect(result.data!.chainId).toBe(orderRequest.chainId);
      expect(result.data!.useMEVProtection).toBe(orderRequest.useMEVProtection);
      expect(result.data!.allowedSenders).toEqual(orderRequest.allowedSenders);
      expect(result.data!.maxSlippage).toBe(orderRequest.maxSlippage);
      expect(result.data!.status).toBe(OrderStatus.PENDING);
    });

    it('should reject order with missing required fields', async () => {
      const orderRequest = {
        userAddress: '0x1234567890123456789012345678901234567890',
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        // Missing toToken, amount, orderType, orderSide, chainId
      } as OrderbookRequest;

      const result = await orderbookService.addOrder(orderRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('toToken is required');
      expect(result.error).toContain('amount is required');
      expect(result.error).toContain('orderType is required');
      expect(result.error).toContain('orderSide is required');
      expect(result.error).toContain('chainId is required');
    });

    it('should reject order with amount too small', async () => {
      const orderRequest: OrderbookRequest = {
        userAddress: '0x1234567890123456789012345678901234567890',
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '100000000000000000', // Too small
        orderType: 'swap',
        orderSide: 'buy',
        chainId: 1
      };

      const result = await orderbookService.addOrder(orderRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Amount too small');
    });

    it('should reject order with amount too large', async () => {
      const orderRequest: OrderbookRequest = {
        userAddress: '0x1234567890123456789012345678901234567890',
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '2000000000000000000000000', // Too large
        orderType: 'swap',
        orderSide: 'buy',
        chainId: 1
      };

      const result = await orderbookService.addOrder(orderRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Amount too large');
    });

    it('should reject order with too many allowed senders', async () => {
      const orderRequest: OrderbookRequest = {
        userAddress: '0x1234567890123456789012345678901234567890',
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000',
        orderType: 'swap',
        orderSide: 'buy',
        chainId: 1,
        allowedSenders: Array(ORDERBOOK_CONSTANTS.MAX_ALLOWED_SENDERS + 1).fill('0xBot').map((addr, i) => `${addr}${i}`)
      };

      const result = await orderbookService.addOrder(orderRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many allowed senders');
    });

    it('should reject order with invalid slippage', async () => {
      const orderRequest: OrderbookRequest = {
        userAddress: '0x1234567890123456789012345678901234567890',
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000',
        orderType: 'swap',
        orderSide: 'buy',
        chainId: 1,
        maxSlippage: 10.0 // Too high
      };

      const result = await orderbookService.addOrder(orderRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid slippage');
    });
  });

  describe('getOrder', () => {
    it('should get an existing order', async () => {
      // First add an order
      const orderRequest: OrderbookRequest = {
        userAddress: '0x1234567890123456789012345678901234567890',
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000',
        orderType: 'swap',
        orderSide: 'buy',
        chainId: 1
      };

      const addResult = await orderbookService.addOrder(orderRequest);
      expect(addResult.success).toBe(true);

      // Then get the order
      const getResult = await orderbookService.getOrder(addResult.data!.orderId);

      expect(getResult.success).toBe(true);
      expect(getResult.data).toEqual(addResult.data);
    });

    it('should return error for non-existent order', async () => {
      const result = await orderbookService.getOrder('non-existent-order');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });
  });

  describe('queryOrders', () => {
    beforeEach(async () => {
      // Add some test orders
      const orders = [
        {
          userAddress: '0xUser1',
          fromToken: '0xTokenA',
          toToken: '0xTokenB',
          amount: '1000000000000000000',
          orderType: 'swap' as const,
          orderSide: 'buy' as const,
          chainId: 1
        },
        {
          userAddress: '0xUser2',
          fromToken: '0xTokenB',
          toToken: '0xTokenC',
          amount: '2000000000000000000',
          orderType: 'limit' as const,
          orderSide: 'sell' as const,
          chainId: 1
        },
        {
          userAddress: '0xUser1',
          fromToken: '0xTokenA',
          toToken: '0xTokenC',
          amount: '3000000000000000000',
          orderType: 'swap' as const,
          orderSide: 'buy' as const,
          chainId: 137
        }
      ];

      for (const order of orders) {
        await orderbookService.addOrder(order);
      }
    });

    it('should query orders by user address', async () => {
      const orders = await orderbookService.queryOrders({ userAddress: '0xUser1' });

      expect(orders.length).toBe(2);
      expect(orders.every(order => order.userAddress === '0xUser1')).toBe(true);
    });

    it('should query orders by token pair', async () => {
      const orders = await orderbookService.queryOrders({ 
        fromToken: '0xTokenA',
        toToken: '0xTokenB'
      });

      expect(orders.length).toBe(1);
      expect(orders[0].fromToken).toBe('0xTokenA');
      expect(orders[0].toToken).toBe('0xTokenB');
    });

    it('should query orders by order type', async () => {
      const swapOrders = await orderbookService.queryOrders({ orderType: 'swap' });
      const limitOrders = await orderbookService.queryOrders({ orderType: 'limit' });

      expect(swapOrders.length).toBe(2);
      expect(limitOrders.length).toBe(1);
    });

    it('should query orders by chain ID', async () => {
      const ethereumOrders = await orderbookService.queryOrders({ chainId: 1 });
      const polygonOrders = await orderbookService.queryOrders({ chainId: 137 });

      expect(ethereumOrders.length).toBe(2);
      expect(polygonOrders.length).toBe(1);
    });

    it('should apply pagination', async () => {
      const orders = await orderbookService.queryOrders({ limit: 2, page: 1 });

      expect(orders.length).toBeLessThanOrEqual(2);
    });

    it('should sort orders by timestamp', async () => {
      const orders = await orderbookService.queryOrders({ 
        sortBy: 'timestamp', 
        sortOrder: 'desc' 
      });

      expect(orders.length).toBeGreaterThan(0);
      for (let i = 0; i < orders.length - 1; i++) {
        expect(orders[i].timestamp).toBeGreaterThanOrEqual(orders[i + 1].timestamp);
      }
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      // First add an order
      const orderRequest: OrderbookRequest = {
        userAddress: '0x1234567890123456789012345678901234567890',
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000',
        orderType: 'swap',
        orderSide: 'buy',
        chainId: 1
      };

      const addResult = await orderbookService.addOrder(orderRequest);
      expect(addResult.success).toBe(true);

      // Update the order status
      const updateResult = await orderbookService.updateOrderStatus(
        addResult.data!.orderId,
        OrderStatus.FILLED,
        {
          executedBy: '0xResolverBot1',
          executionTxHash: '0xTxHash123',
          executionTimestamp: Date.now()
        }
      );

      expect(updateResult.success).toBe(true);
      expect(updateResult.data!.status).toBe(OrderStatus.FILLED);
      expect(updateResult.data!.executedBy).toBe('0xResolverBot1');
      expect(updateResult.data!.executionTxHash).toBe('0xTxHash123');
      expect(updateResult.data!.executionAttempts).toBe(1);
    });

    it('should return error for non-existent order', async () => {
      const result = await orderbookService.updateOrderStatus(
        'non-existent-order',
        OrderStatus.FILLED
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });
  });

  describe('getFillableOrders', () => {
    beforeEach(async () => {
      // Add some test orders
      const orders = [
        {
          userAddress: '0xUser1',
          fromToken: '0xTokenA',
          toToken: '0xTokenB',
          amount: '1000000000000000000',
          orderType: 'swap' as const,
          orderSide: 'buy' as const,
          chainId: 1,
          allowedSenders: ['0xResolverBot1']
        },
        {
          userAddress: '0xUser2',
          fromToken: '0xTokenB',
          toToken: '0xTokenC',
          amount: '2000000000000000000',
          orderType: 'limit' as const,
          orderSide: 'sell' as const,
          chainId: 1,
          allowedSenders: ['0xResolverBot2']
        }
      ];

      for (const order of orders) {
        const result = await orderbookService.addOrder(order);
        if (result.success) {
          // Activate the order
          await orderbookService.updateOrderStatus(result.data!.orderId, OrderStatus.ACTIVE);
        }
      }
    });

    it('should get fillable orders for whitelisted bot', async () => {
      const orders = await orderbookService.getFillableOrders('0xResolverBot1');

      expect(orders.length).toBeGreaterThan(0);
      expect(orders.every(order => 
        order.allowedSenders?.includes('0xResolverBot1') || 
        !order.allowedSenders || 
        order.allowedSenders.length === 0
      )).toBe(true);
    });

    it('should return empty array for non-whitelisted bot', async () => {
      const orders = await orderbookService.getFillableOrders('0xNonWhitelistedBot');

      expect(orders.length).toBe(0);
    });

    it('should return empty array for offline bot', async () => {
      // First add the bot
      await orderbookService.addResolverBot({
        address: '0xOfflineBot',
        name: 'Offline Bot',
        allowedPairs: ['0xTokenA-0xTokenB'],
        maxOrderSize: 1000000,
        minOrderSize: 100
      });

      // Set bot offline
      await orderbookService.updateResolverBotStatus('0xOfflineBot', false);

      const orders = await orderbookService.getFillableOrders('0xOfflineBot');

      expect(orders.length).toBe(0);
    });
  });

  describe('validateResolver', () => {
    it('should validate whitelisted and online bot', async () => {
      const isValid = await orderbookService.validateResolver('0xResolverBot1');

      expect(isValid).toBe(true);
    });

    it('should reject non-whitelisted bot', async () => {
      const isValid = await orderbookService.validateResolver('0xNonWhitelistedBot');

      expect(isValid).toBe(false);
    });
  });

  describe('addResolverBot', () => {
    it('should add resolver bot successfully', async () => {
      const botRequest: ResolverBotRequest = {
        address: '0xNewBot',
        name: 'New Resolver Bot',
        allowedPairs: ['0xTokenA-0xTokenB', '0xTokenB-0xTokenC'],
        maxOrderSize: 500000,
        minOrderSize: 50
      };

      const result = await orderbookService.addResolverBot(botRequest);

      expect(result.success).toBe(true);
      expect(result.data!.address).toBe(botRequest.address);
      expect(result.data!.name).toBe(botRequest.name);
      expect(result.data!.allowedPairs).toEqual(botRequest.allowedPairs);
      expect(result.data!.maxOrderSize).toBe(botRequest.maxOrderSize);
      expect(result.data!.minOrderSize).toBe(botRequest.minOrderSize);
      expect(result.data!.isWhitelisted).toBe(true);
      expect(result.data!.isOnline).toBe(true);
    });

    it('should reject bot with missing required fields', async () => {
      const botRequest = {
        address: '0xNewBot',
        name: 'New Resolver Bot'
        // Missing allowedPairs, maxOrderSize, minOrderSize
      } as ResolverBotRequest;

      const result = await orderbookService.addResolverBot(botRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });
  });

  describe('updateResolverBotStatus', () => {
    it('should update bot status successfully', async () => {
      // First add a bot
      const botRequest: ResolverBotRequest = {
        address: '0xTestBot',
        name: 'Test Bot',
        allowedPairs: ['0xTokenA-0xTokenB'],
        maxOrderSize: 100000,
        minOrderSize: 100
      };

      await orderbookService.addResolverBot(botRequest);

      // Update status
      const result = await orderbookService.updateResolverBotStatus('0xTestBot', false);

      expect(result.success).toBe(true);
      expect(result.data!.isOnline).toBe(false);
    });

    it('should return error for non-existent bot', async () => {
      const result = await orderbookService.updateResolverBotStatus('0xNonExistentBot', false);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Resolver bot not found');
    });
  });

  describe('getResolverBots', () => {
    it('should return all resolver bots', async () => {
      const bots = await orderbookService.getResolverBots();

      expect(bots.length).toBeGreaterThan(0);
      expect(bots.every(bot => 
        bot.address && 
        bot.name && 
        typeof bot.isWhitelisted === 'boolean' &&
        typeof bot.isOnline === 'boolean'
      )).toBe(true);
    });
  });

  describe('getOrderbookStats', () => {
    it('should return orderbook statistics', async () => {
      const stats = await orderbookService.getOrderbookStats();

      expect(stats).toBeDefined();
      expect(typeof stats.totalOrders).toBe('number');
      expect(typeof stats.activeOrders).toBe('number');
      expect(typeof stats.totalVolume).toBe('string');
      expect(typeof stats.averageOrderSize).toBe('string');
      expect(Array.isArray(stats.mostActivePairs)).toBe(true);
      expect(stats.resolverBots).toBeDefined();
      expect(typeof stats.resolverBots.total).toBe('number');
      expect(typeof stats.resolverBots.online).toBe('number');
      expect(typeof stats.resolverBots.whitelisted).toBe('number');
    });
  });

  describe('cleanupExpiredOrders', () => {
    it('should clean up expired orders', async () => {
      // Add an order with short deadline
      const orderRequest: OrderbookRequest = {
        userAddress: '0x1234567890123456789012345678901234567890',
        fromToken: '0xA0b86a33E6441b8c4C8C0b4b8C0b4b8C0b4b8C0b',
        toToken: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000',
        orderType: 'swap',
        orderSide: 'buy',
        chainId: 1,
        deadline: Date.now() - 1000 // Expired
      };

      const addResult = await orderbookService.addOrder(orderRequest);
      expect(addResult.success).toBe(true);

      // Activate the order
      await orderbookService.updateOrderStatus(addResult.data!.orderId, OrderStatus.ACTIVE);

      // Clean up expired orders
      await orderbookService.cleanupExpiredOrders();

      // Check that the order is now expired
      const getResult = await orderbookService.getOrder(addResult.data!.orderId);
      expect(getResult.success).toBe(true);
      expect(getResult.data!.status).toBe(OrderStatus.EXPIRED);
    });
  });
}); 