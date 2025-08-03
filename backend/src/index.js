"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var express_rate_limit_1 = require("express-rate-limit");
var env_1 = require("./config/env");
var logger_1 = require("./utils/logger");
var errorHandler_1 = require("./api/middleware/errorHandler");
// Import API router
var index_1 = require("./api/index");
// Create Express app
var app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: env_1.config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Rate limiting
var limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.config.RATE_LIMIT_WINDOW,
    max: env_1.config.RATE_LIMIT_MAX,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging middleware
app.use(function (req, res, next) {
    logger_1.logger.info("".concat(req.method, " ").concat(req.url), {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});
// Health check endpoint
app.get('/health', function (req, res) {
    res.json({
        success: true,
        message: 'CipherSwap API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: env_1.config.NODE_ENV,
        uptime: process.uptime()
    });
});
// API routes
app.use('/api', index_1.default);
// 404 handler
app.use('*', function (req, res) {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        code: 'NOT_FOUND',
        path: req.originalUrl,
        timestamp: Date.now()
    });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
var PORT = env_1.config.PORT;
app.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
    var ResolverBot, OrderbookService, PredicateService, ethers, orderbookService, predicateService, provider, resolverBot, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger_1.logger.info("\uD83D\uDE80 CipherSwap API server started", {
                    port: PORT,
                    environment: env_1.config.NODE_ENV,
                    timestamp: new Date().toISOString()
                });
                if (!env_1.config.ENABLE_RESOLVER_BOT) return [3 /*break*/, 8];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('./services/resolverBot'); })];
            case 2:
                ResolverBot = (_a.sent()).ResolverBot;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('./services/orderbookService'); })];
            case 3:
                OrderbookService = (_a.sent()).OrderbookService;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('./services/predicateService'); })];
            case 4:
                PredicateService = (_a.sent()).PredicateService;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('ethers'); })];
            case 5:
                ethers = (_a.sent()).ethers;
                orderbookService = new OrderbookService();
                predicateService = new PredicateService();
                provider = new ethers.JsonRpcProvider(env_1.config.ETHEREUM_RPC_URL);
                resolverBot = new ResolverBot(env_1.config.INCH_LIMIT_ORDER_AUTH_KEY, env_1.config.PRIVATE_KEY, provider, orderbookService, predicateService);
                // Start resolver bot
                return [4 /*yield*/, resolverBot.start()];
            case 6:
                // Start resolver bot
                _a.sent();
                logger_1.logger.info('🤖 Resolver bot started successfully', {
                    botAddress: resolverBot.getStatus().address,
                    timestamp: new Date().toISOString(),
                    service: 'cipherswap-resolver-bot'
                });
                // Store bot instance for potential future use
                global.resolverBot = resolverBot;
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                logger_1.logger.error('Failed to start resolver bot', {
                    error: error_1.message,
                    timestamp: new Date().toISOString(),
                    service: 'cipherswap-resolver-bot'
                });
                return [3 /*break*/, 8];
            case 8:
                // ====== END RESOLVER_BOT_STARTUP ======
                console.log("\n  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n  \u2551                    CipherSwap API                            \u2551\n  \u2551                                                              \u2551\n  \u2551  \uD83D\uDE80 Server running on port ".concat(PORT, "                          \u2551\n  \u2551  \uD83C\uDF0D Environment: ").concat(env_1.config.NODE_ENV, "                         \u2551\n  \u2551  \uD83D\uDCCA Health check: http://localhost:").concat(PORT, "/health           \u2551\n  \u2551  \uD83D\uDCDA API docs: http://localhost:").concat(PORT, "/api                  \u2551\n  \u2551  \uD83E\uDD16 Resolver Bot: ").concat(env_1.config.ENABLE_RESOLVER_BOT ? 'Enabled' : 'Disabled', " \u2551\n  \u2551  \uD83D\uDCCB Limit Orders: ").concat(env_1.config.ENABLE_LIMIT_ORDERS ? 'Enabled' : 'Disabled', " \u2551\n  \u2551                                                              \u2551\n  \u2551  ETHGlobal Unite DeFi Hackathon                             \u2551\n  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n  "));
                return [2 /*return*/];
        }
    });
}); });
// Graceful shutdown
process.on('SIGTERM', function () {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', function () {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
// Handle uncaught exceptions
process.on('uncaughtException', function (error) {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', function (reason, promise) {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
exports.default = app;
