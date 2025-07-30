import { Router } from 'express';
import { OrderbookController } from '../controllers/orderbookController';

const router = Router();
const orderbookController = new OrderbookController();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderbookRequest:
 *       type: object
 *       required:
 *         - userAddress
 *         - fromToken
 *         - toToken
 *         - amount
 *         - orderType
 *         - orderSide
 *         - chainId
 *       properties:
 *         userAddress:
 *           type: string
 *           description: User's wallet address
 *         fromToken:
 *           type: string
 *           description: Token address to swap from
 *         toToken:
 *           type: string
 *           description: Token address to swap to
 *         amount:
 *           type: string
 *           description: Amount to swap
 *         orderType:
 *           type: string
 *           enum: [swap, limit]
 *           description: Type of order
 *         orderSide:
 *           type: string
 *           enum: [buy, sell]
 *           description: Order side
 *         chainId:
 *           type: number
 *           description: Chain ID
 *         limitPrice:
 *           type: string
 *           description: Limit price for limit orders
 *         deadline:
 *           type: number
 *           description: Order deadline timestamp
 *         useMEVProtection:
 *           type: boolean
 *           description: Whether to use MEV protection
 *         allowedSenders:
 *           type: array
 *           items:
 *             type: string
 *           description: Whitelist of resolver bot addresses
 *         maxSlippage:
 *           type: number
 *           description: Maximum allowed slippage percentage
 *     
 *     OrderData:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *         userAddress:
 *           type: string
 *         fromToken:
 *           type: string
 *         toToken:
 *           type: string
 *         fromAmount:
 *           type: string
 *         toAmount:
 *           type: string
 *         orderType:
 *           type: string
 *         orderSide:
 *           type: string
 *         chainId:
 *           type: number
 *         status:
 *           type: string
 *         timestamp:
 *           type: number
 *         useMEVProtection:
 *           type: boolean
 *         allowedSenders:
 *           type: array
 *           items:
 *             type: string
 *         predicateId:
 *           type: string
 *         maxSlippage:
 *           type: number
 *     
 *     ResolverBot:
 *       type: object
 *       properties:
 *         address:
 *           type: string
 *         name:
 *           type: string
 *         isWhitelisted:
 *           type: boolean
 *         allowedPairs:
 *           type: array
 *           items:
 *             type: string
 *         maxOrderSize:
 *           type: number
 *         minOrderSize:
 *           type: number
 *         isOnline:
 *           type: boolean
 *         lastActive:
 *           type: number
 *     
 *     OrderbookStats:
 *       type: object
 *       properties:
 *         totalOrders:
 *           type: number
 *         activeOrders:
 *           type: number
 *         totalVolume:
 *           type: string
 *         averageOrderSize:
 *           type: string
 *         mostActivePairs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pair:
 *                 type: string
 *               volume:
 *                 type: string
 *               orderCount:
 *                 type: number
 *         resolverBots:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             online:
 *               type: number
 *             whitelisted:
 *               type: number
 */

/**
 * @swagger
 * /api/orderbook/orders:
 *   post:
 *     summary: Add order to off-chain orderbook
 *     tags: [Orderbook]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderbookRequest'
 *     responses:
 *       201:
 *         description: Order added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/OrderData'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/orders', orderbookController.addOrder.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/orders:
 *   get:
 *     summary: Query orders with filters
 *     tags: [Orderbook]
 *     parameters:
 *       - in: query
 *         name: userAddress
 *         schema:
 *           type: string
 *         description: Filter by user address
 *       - in: query
 *         name: fromToken
 *         schema:
 *           type: string
 *         description: Filter by from token
 *       - in: query
 *         name: toToken
 *         schema:
 *           type: string
 *         description: Filter by to token
 *       - in: query
 *         name: orderType
 *         schema:
 *           type: string
 *           enum: [swap, limit]
 *         description: Filter by order type
 *       - in: query
 *         name: orderSide
 *         schema:
 *           type: string
 *           enum: [buy, sell]
 *         description: Filter by order side
 *       - in: query
 *         name: chainId
 *         schema:
 *           type: number
 *         description: Filter by chain ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of orders to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [timestamp, amount, price]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderData'
 *                 count:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/orders', orderbookController.queryOrders.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orderbook]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/OrderData'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/orders/:orderId', orderbookController.getOrder.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orderbook]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, active, filled, cancelled, expired, failed]
 *               executionData:
 *                 type: object
 *                 properties:
 *                   executedBy:
 *                     type: string
 *                   executionTxHash:
 *                     type: string
 *                   executionTimestamp:
 *                     type: number
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/orders/:orderId/status', orderbookController.updateOrderStatus.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/resolver/{botAddress}/fillable-orders:
 *   get:
 *     summary: Get fillable orders for resolver bot
 *     tags: [Orderbook]
 *     parameters:
 *       - in: path
 *         name: botAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Resolver bot address
 *     responses:
 *       200:
 *         description: Fillable orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderData'
 *                 count:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/resolver/:botAddress/fillable-orders', orderbookController.getFillableOrders.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/resolver/{botAddress}/validate:
 *   get:
 *     summary: Validate resolver bot
 *     tags: [Orderbook]
 *     parameters:
 *       - in: path
 *         name: botAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Resolver bot address
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     botAddress:
 *                       type: string
 *                     isValid:
 *                       type: boolean
 *       500:
 *         description: Internal server error
 */
router.get('/resolver/:botAddress/validate', orderbookController.validateResolver.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/resolver:
 *   post:
 *     summary: Add resolver bot to whitelist
 *     tags: [Orderbook]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - name
 *               - allowedPairs
 *               - maxOrderSize
 *               - minOrderSize
 *             properties:
 *               address:
 *                 type: string
 *               name:
 *                 type: string
 *               allowedPairs:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxOrderSize:
 *                 type: number
 *               minOrderSize:
 *                 type: number
 *     responses:
 *       201:
 *         description: Resolver bot added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ResolverBot'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/resolver', orderbookController.addResolverBot.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/resolver:
 *   get:
 *     summary: Get all resolver bots
 *     tags: [Orderbook]
 *     responses:
 *       200:
 *         description: Resolver bots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ResolverBot'
 *                 count:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/resolver', orderbookController.getResolverBots.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/resolver/{botAddress}/status:
 *   put:
 *     summary: Update resolver bot status
 *     tags: [Orderbook]
 *     parameters:
 *       - in: path
 *         name: botAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Resolver bot address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isOnline
 *             properties:
 *               isOnline:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Resolver bot status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resolver bot not found
 *       500:
 *         description: Internal server error
 */
router.put('/resolver/:botAddress/status', orderbookController.updateResolverBotStatus.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/stats:
 *   get:
 *     summary: Get orderbook statistics
 *     tags: [Orderbook]
 *     responses:
 *       200:
 *         description: Orderbook statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/OrderbookStats'
 *       500:
 *         description: Internal server error
 */
router.get('/stats', orderbookController.getOrderbookStats.bind(orderbookController));

/**
 * @swagger
 * /api/orderbook/cleanup:
 *   post:
 *     summary: Clean up expired orders
 *     tags: [Orderbook]
 *     responses:
 *       200:
 *         description: Expired orders cleaned up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/cleanup', orderbookController.cleanupExpiredOrders.bind(orderbookController));

export default router; 