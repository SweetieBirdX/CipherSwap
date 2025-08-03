"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var swagger_1 = require("./config/swagger");
var api_1 = require("./api");
var env_1 = require("./config/env");
var app = (0, express_1.default)();
// CORS Configuration
var corsOptions = {
    origin: [
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:4173', // Vite preview port
        env_1.default.CORS_ORIGIN
    ].filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Swagger Documentation
var swaggerSetup = swagger_1.swaggerUi.setup(swagger_1.specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true
    }
});
// @ts-ignore: Type issues with swagger-ui-express
app.use('/api-docs', [swagger_1.swaggerUi.serve, swaggerSetup]);
// API Routes
app.use('/api', api_1.default);
exports.default = app;
