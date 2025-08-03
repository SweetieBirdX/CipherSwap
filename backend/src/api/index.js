"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var quoteRoutes_1 = require("./routes/quoteRoutes");
var swapRoutes_1 = require("./routes/swapRoutes");
var predicateRoutes_1 = require("./routes/predicateRoutes");
var oracleRoutes_1 = require("./routes/oracleRoutes");
var slippageRoutes_1 = require("./routes/slippageRoutes");
var orderbookRoutes_1 = require("./routes/orderbookRoutes");
var rfqRoutes_1 = require("./routes/rfqRoutes");
var limitOrderRoutes_1 = require("./routes/limitOrderRoutes");
var realTimeSwapRoutes_1 = require("./routes/realTimeSwapRoutes");
var docsRoutes_1 = require("./routes/docsRoutes");
var realMarketDataRoutes_1 = require("./routes/realMarketDataRoutes");
var realOnchainExecutionRoutes_1 = require("./routes/realOnchainExecutionRoutes");
var frontendLimitOrderRoutes_1 = require("./routes/frontendLimitOrderRoutes");
var apiRouter = (0, express_1.Router)();
// API Documentation
apiRouter.use('/docs', docsRoutes_1.default);
var apiDocs = {
    name: 'CipherSwap API',
    version: '1.0.0',
    description: 'DeFi OTC Swap Platform API',
    endpoints: {
        quote: {
            base: '/api/quote',
            endpoints: {
                'POST /quote': 'Get quote for swap',
                'POST /quote/simulate': 'Simulate swap with current quote',
                'GET /quote/history': 'Get quote history for user',
                'GET /quote/tokens': 'Get supported tokens for chain'
            }
        },
        swap: {
            base: '/api/swap',
            endpoints: {
                'POST /swap': 'Create a new swap transaction',
                'POST /swap/fusion': 'Create a Fusion+ swap transaction',
                'GET /swap/status/:id': 'Get swap transaction status',
                'POST /swap/simulate': 'Simulate swap transaction',
                'GET /swap/history': 'Get swap history for user',
                'POST /swap/cancel/:id': 'Cancel pending swap transaction'
            }
        },
        'real-time-swap': {
            base: '/api/real-time-swap',
            endpoints: {
                'POST /analyze': 'Real-time swap analysis and recommendations',
                'POST /execute': 'Execute optimized swap based on analysis',
                'GET /market-status': 'Get current market conditions and status',
                'POST /simulate': 'Simulate swap with detailed analysis',
                'GET /price/:fromToken/:toToken': 'Get real-time price information',
                'POST /limit-order': 'Create limit order with real-time analysis',
                'GET /order-status/:orderId': 'Get limit order status'
            }
        },
        predicate: {
            base: '/api/predicate',
            endpoints: {
                'POST /predicate/create': 'Create a new price predicate',
                'GET /predicate/validate/:id': 'Validate predicate with current oracle price',
                'GET /predicate/history': 'Get predicate history for user',
                'GET /predicate/oracles': 'Get available Chainlink oracles for chain',
                'POST /predicate/cancel/:id': 'Cancel active predicate',
                'GET /predicate/status/:id': 'Get predicate status and details'
            }
        },
        oracle: {
            base: '/api/oracle',
            endpoints: {
                'GET /oracle/price/:chainId/:pair': 'Get current price from Chainlink Oracle',
                'POST /oracle/price/batch': 'Get multiple prices at once',
                'POST /oracle/price/tolerance': 'Get price with tolerance check',
                'GET /oracle/feeds/:chainId': 'Get available price feeds for a network',
                'GET /oracle/networks': 'Get all supported networks with their price feeds',
                'GET /oracle/health/:chainId/:pair': 'Get price feed health status'
            }
        },
        slippage: {
            base: '/api/slippage',
            endpoints: {
                'GET /slippage/config': 'Get current slippage tolerance configuration',
                'PUT /slippage/config': 'Update slippage tolerance configuration',
                'POST /slippage/calculate': 'Calculate optimal slippage tolerance for scenario',
                'POST /slippage/validate': 'Validate slippage tolerance against limits',
                'GET /slippage/recommended/:chainId': 'Get recommended slippage tolerance for chain',
                'POST /slippage/reset': 'Reset slippage configuration to defaults'
            }
        },
        orderbook: {
            base: '/api/orderbook',
            endpoints: {
                'POST /orderbook/orders': 'Add order to off-chain orderbook',
                'GET /orderbook/orders': 'Query orders with filters',
                'GET /orderbook/orders/:orderId': 'Get order by ID',
                'PUT /orderbook/orders/:orderId/status': 'Update order status',
                'GET /orderbook/resolver/:botAddress/fillable-orders': 'Get fillable orders for resolver bot',
                'GET /orderbook/resolver/:botAddress/validate': 'Validate resolver bot',
                'POST /orderbook/resolver': 'Add resolver bot to whitelist',
                'GET /orderbook/resolver': 'Get all resolver bots',
                'PUT /orderbook/resolver/:botAddress/status': 'Update resolver bot status',
                'GET /orderbook/stats': 'Get orderbook statistics',
                'POST /orderbook/cleanup': 'Clean up expired orders'
            }
        },
        rfq: {
            base: '/api/rfq',
            endpoints: {
                'POST /rfq/request': 'Create a new RFQ request',
                'POST /rfq/quote': 'Submit a quote response from a resolver',
                'GET /rfq/request/:requestId/quotes': 'Get quotes for a request',
                'POST /rfq/quote/:responseId/accept': 'Accept a quote and execute the swap',
                'PUT /rfq/execution/:executionId/status': 'Update execution status',
                'GET /rfq/request/:requestId': 'Get RFQ request by ID',
                'GET /rfq/requests': 'Query RFQ requests with filters',
                'GET /rfq/stats': 'Get RFQ statistics',
                'POST /rfq/cleanup': 'Clean up expired RFQ data'
            }
        },
        limitOrder: {
            base: '/api/limit-order',
            endpoints: {
                'POST /limit-order/create': 'Create a basic limit order',
                'GET /limit-order/:orderId': 'Get order by ID',
                'GET /limit-order/user/:userAddress': 'Get user orders',
                'DELETE /limit-order/:orderId': 'Cancel order',
                'GET /limit-order/:orderId/status': 'Get order status',
                'POST /limit-order/conditional': 'Create conditional order',
                'POST /limit-order/dynamic-pricing': 'Create dynamic pricing order',
                'POST /limit-order/:orderId/execute-strategy': 'Execute custom strategy',
                'POST /limit-order/:orderId/execute': 'Execute order onchain',
                'POST /limit-order/:orderId/cancel-onchain': 'Cancel order onchain',
                'GET /limit-order/transaction/:txHash/status': 'Get transaction status',
                'GET /limit-order/orderbook/stats': 'Get orderbook statistics',
                'GET /limit-order/orderbook/active': 'Get active orders',
                'POST /limit-order/orderbook/cleanup': 'Cleanup expired orders',
                'POST /limit-order/:orderId/estimate-gas': 'Estimate gas for execution'
            }
        }
    },
    features: [
        '1inch DEX Aggregation',
        'Fusion+ MEV Protection',
        'Chainlink Oracle Integration',
        'Cross-chain Support',
        'Slippage Protection',
        'Real-time Price Feeds',
        'Oracle Price Validation',
        'Configurable Slippage Tolerance Controls',
        'Off-chain Orderbook',
        'Resolver Bot Whitelist',
        'MEV-Protected Order Execution',
        'Request for Quote (RFQ) System',
        'Custom Limit Order Strategies',
        'Onchain Order Execution',
        'Conditional Order Logic',
        'Dynamic Pricing Algorithms'
    ],
    chains: [1, 137, 42161, 8453, 324], // Ethereum, Polygon, Arbitrum, Base, zkSync
    hackathon: 'ETHGlobal Unite DeFi'
};
// API Info endpoint
apiRouter.get('/', function (req, res) {
    res.json({
        success: true,
        data: apiDocs,
        timestamp: Date.now()
    });
});
// Health check endpoint
apiRouter.get('/health', function (req, res) {
    res.json({
        success: true,
        message: 'CipherSwap API is healthy',
        version: apiDocs.version,
        timestamp: Date.now(),
        uptime: process.uptime()
    });
});
// Register all routes
apiRouter.use('/quote', quoteRoutes_1.default);
apiRouter.use('/swap', swapRoutes_1.default);
apiRouter.use('/predicate', predicateRoutes_1.default);
apiRouter.use('/oracle', oracleRoutes_1.default);
apiRouter.use('/slippage', slippageRoutes_1.default);
apiRouter.use('/orderbook', orderbookRoutes_1.default);
apiRouter.use('/rfq', rfqRoutes_1.default);
apiRouter.use('/limit-order', limitOrderRoutes_1.default);
apiRouter.use('/real-time-swap', realTimeSwapRoutes_1.default);
apiRouter.use('/real-market-data', realMarketDataRoutes_1.default);
apiRouter.use('/onchain-execution', realOnchainExecutionRoutes_1.default);
apiRouter.use('/frontend-limit-orders', frontendLimitOrderRoutes_1.default);
// API Stats endpoint
apiRouter.get('/stats', function (req, res) {
    res.json({
        success: true,
        data: {
            totalEndpoints: 64,
            activeServices: ['quote', 'swap', 'predicate', 'oracle', 'slippage', 'orderbook', 'rfq', 'limit-order'],
            supportedChains: apiDocs.chains,
            features: apiDocs.features,
            uptime: process.uptime(),
            timestamp: Date.now()
        }
    });
});
// Error handler for API routes
apiRouter.use('*', function (req, res) {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        code: 'API_NOT_FOUND',
        path: req.originalUrl,
        availableEndpoints: Object.keys(apiDocs.endpoints),
        timestamp: Date.now()
    });
});
exports.default = apiRouter;
