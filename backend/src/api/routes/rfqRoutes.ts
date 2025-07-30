import { Router } from 'express';
import RFQController from '../controllers/rfqController';

const rfqRouter = Router();
const rfqController = new RFQController();

/**
 * @swagger
 * components:
 *   schemas:
 *     RFQRequest:
 *       type: object
 *       required:
 *         - userAddress
 *         - fromToken
 *         - toToken
 *         - amount
 *         - chainId
 *       properties:
 *         userAddress:
 *           type: string
 *           description: User's wallet address
 *         fromToken:
 *           type: string
 *           description: Source token address
 *         toToken:
 *           type: string
 *           description: Destination token address
 *         amount:
 *           type: string
 *           description: Amount to swap (in wei)
 *         chainId:
 *           type: number
 *           description: Chain ID for the swap
 *         useMEVProtection:
 *           type: boolean
 *           description: Whether to use MEV protection
 *         allowedResolvers:
 *           type: array
 *           items:
 *             type: string
 *           description: Whitelist of resolver addresses
 *         maxSlippage:
 *           type: number
 *           description: Maximum allowed slippage percentage
 *         predicateId:
 *           type: string
 *           description: Associated price predicate ID
 *         preferredExecutionTime:
 *           type: number
 *           description: Preferred execution time in seconds
 *         gasOptimization:
 *           type: boolean
 *           description: Whether to optimize for gas
 *         partialFill:
 *           type: boolean
 *           description: Allow partial fills
 *         metadata:
 *           type: object
 *           description: Additional metadata
 *     
 *     RFQResponse:
 *       type: object
 *       required:
 *         - requestId
 *         - resolverAddress
 *         - resolverName
 *         - fromAmount
 *         - toAmount
 *         - priceImpact
 *         - gasEstimate
 *         - gasPrice
 *         - executionTime
 *         - mevProtectionType
 *         - resolverFee
 *         - protocolFee
 *         - totalCost
 *         - resolverReputation
 *         - averageExecutionTime
 *         - successRate
 *       properties:
 *         requestId:
 *           type: string
 *           description: Associated RFQ request ID
 *         resolverAddress:
 *           type: string
 *           description: Resolver bot address
 *         resolverName:
 *           type: string
 *           description: Resolver bot name
 *         fromAmount:
 *           type: string
 *           description: Input amount
 *         toAmount:
 *           type: string
 *           description: Output amount
 *         priceImpact:
 *           type: number
 *           description: Price impact percentage
 *         gasEstimate:
 *           type: string
 *           description: Estimated gas usage
 *         gasPrice:
 *           type: string
 *           description: Gas price in wei
 *         executionTime:
 *           type: number
 *           description: Estimated execution time in seconds
 *         mevProtectionType:
 *           type: string
 *           enum: [flashbots, fusion, none]
 *           description: Type of MEV protection
 *         bundleId:
 *           type: string
 *           description: Flashbots bundle ID
 *         escrowAddress:
 *           type: string
 *           description: Fusion+ escrow address
 *         resolverFee:
 *           type: string
 *           description: Resolver fee in wei
 *         protocolFee:
 *           type: string
 *           description: Protocol fee in wei
 *         totalCost:
 *           type: string
 *           description: Total cost in wei
 *         resolverReputation:
 *           type: number
 *           description: Resolver reputation score
 *         averageExecutionTime:
 *           type: number
 *           description: Average execution time in seconds
 *         successRate:
 *           type: number
 *           description: Success rate percentage
 *     
 *     RFQExecution:
 *       type: object
 *       properties:
 *         executionId:
 *           type: string
 *           description: Execution ID
 *         requestId:
 *           type: string
 *           description: Associated RFQ request ID
 *         responseId:
 *           type: string
 *           description: Associated RFQ response ID
 *         userAddress:
 *           type: string
 *           description: User address
 *         resolverAddress:
 *           type: string
 *           description: Resolver address
 *         fromToken:
 *           type: string
 *           description: Source token
 *         toToken:
 *           type: string
 *           description: Destination token
 *         fromAmount:
 *           type: string
 *           description: Input amount
 *         toAmount:
 *           type: string
 *           description: Output amount
 *         txHash:
 *           type: string
 *           description: Transaction hash
 *         blockNumber:
 *           type: number
 *           description: Block number
 *         gasUsed:
 *           type: string
 *           description: Gas used
 *         gasPrice:
 *           type: string
 *           description: Gas price
 *         status:
 *           type: string
 *           enum: [pending, confirmed, failed, cancelled]
 *           description: Execution status
 *         executionTime:
 *           type: number
 *           description: Actual execution time
 *         timestamp:
 *           type: number
 *           description: Timestamp
 *         error:
 *           type: object
 *           description: Error details if failed
 *     
 *     RFQStats:
 *       type: object
 *       properties:
 *         totalRequests:
 *           type: number
 *           description: Total number of requests
 *         activeRequests:
 *           type: number
 *           description: Number of active requests
 *         totalVolume:
 *           type: string
 *           description: Total volume in wei
 *         averageResponseTime:
 *           type: number
 *           description: Average response time in milliseconds
 *         successRate:
 *           type: number
 *           description: Success rate percentage
 *         mostActivePairs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pair:
 *                 type: string
 *               volume:
 *                 type: string
 *               requestCount:
 *                 type: number
 *         resolverStats:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             active:
 *               type: number
 *             averageReputation:
 *               type: number
 */

/**
 * @swagger
 * tags:
 *   name: RFQ
 *   description: Request for Quote (RFQ) API endpoints
 */

/**
 * @swagger
 * /api/rfq/request:
 *   post:
 *     summary: Create a new RFQ request
 *     tags: [RFQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RFQRequest'
 *     responses:
 *       201:
 *         description: RFQ request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RFQRequest'
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
rfqRouter.post('/api/rfq/request', rfqController.createRequest.bind(rfqController));

/**
 * @swagger
 * /api/rfq/quote:
 *   post:
 *     summary: Submit a quote response from a resolver
 *     tags: [RFQ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RFQResponse'
 *     responses:
 *       201:
 *         description: RFQ quote submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RFQResponse'
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
rfqRouter.post('/api/rfq/quote', rfqController.submitQuote.bind(rfqController));

/**
 * @swagger
 * /api/rfq/request/{requestId}/quotes:
 *   get:
 *     summary: Get quotes for a request
 *     tags: [RFQ]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: RFQ request ID
 *     responses:
 *       200:
 *         description: Quotes retrieved successfully
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
 *                     $ref: '#/components/schemas/RFQResponse'
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
rfqRouter.get('/api/rfq/request/:requestId/quotes', rfqController.getQuotes.bind(rfqController));

/**
 * @swagger
 * /api/rfq/quote/{responseId}/accept:
 *   post:
 *     summary: Accept a quote and execute the swap
 *     tags: [RFQ]
 *     parameters:
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *         description: RFQ response ID
 *     responses:
 *       200:
 *         description: RFQ quote accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RFQExecution'
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
rfqRouter.post('/api/rfq/quote/:responseId/accept', rfqController.acceptQuote.bind(rfqController));

/**
 * @swagger
 * /api/rfq/execution/{executionId}/status:
 *   put:
 *     summary: Update execution status
 *     tags: [RFQ]
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *         description: RFQ execution ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, failed, cancelled]
 *               executionData:
 *                 type: object
 *                 properties:
 *                   txHash:
 *                     type: string
 *                   blockNumber:
 *                     type: number
 *                   gasUsed:
 *                     type: string
 *                   executionTime:
 *                     type: number
 *                   error:
 *                     type: object
 *     responses:
 *       200:
 *         description: Execution status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RFQExecution'
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
rfqRouter.put('/api/rfq/execution/:executionId/status', rfqController.updateExecutionStatus.bind(rfqController));

/**
 * @swagger
 * /api/rfq/request/{requestId}:
 *   get:
 *     summary: Get RFQ request by ID
 *     tags: [RFQ]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: RFQ request ID
 *     responses:
 *       200:
 *         description: RFQ request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RFQRequest'
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
rfqRouter.get('/api/rfq/request/:requestId', rfqController.getRequest.bind(rfqController));

/**
 * @swagger
 * /api/rfq/requests:
 *   get:
 *     summary: Query RFQ requests with filters
 *     tags: [RFQ]
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
 *         description: Filter by source token
 *       - in: query
 *         name: toToken
 *         schema:
 *           type: string
 *         description: Filter by destination token
 *       - in: query
 *         name: chainId
 *         schema:
 *           type: number
 *         description: Filter by chain ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: number
 *         description: Filter by start time
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: number
 *         description: Filter by end time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of results to return
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
 *         description: RFQ requests queried successfully
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
 *                     $ref: '#/components/schemas/RFQRequest'
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
rfqRouter.get('/api/rfq/requests', rfqController.queryRequests.bind(rfqController));

/**
 * @swagger
 * /api/rfq/stats:
 *   get:
 *     summary: Get RFQ statistics
 *     tags: [RFQ]
 *     responses:
 *       200:
 *         description: RFQ statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RFQStats'
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
rfqRouter.get('/api/rfq/stats', rfqController.getStats.bind(rfqController));

/**
 * @swagger
 * /api/rfq/cleanup:
 *   post:
 *     summary: Clean up expired RFQ data
 *     tags: [RFQ]
 *     responses:
 *       200:
 *         description: Expired RFQ data cleaned up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
rfqRouter.post('/api/rfq/cleanup', rfqController.cleanupExpired.bind(rfqController));

export default rfqRouter; 