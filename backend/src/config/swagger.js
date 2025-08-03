"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = exports.specs = void 0;
var swagger_jsdoc_1 = require("swagger-jsdoc");
var swagger_ui_express_1 = require("swagger-ui-express");
exports.swaggerUi = swagger_ui_express_1.default;
var options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CipherSwap API Documentation',
            version: '1.0.0',
            description: 'API documentation for CipherSwap DEX Aggregator',
            contact: {
                name: 'CipherSwap Team'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
            // Production URL will be added later
            // {
            //   url: 'https://api.cipherswap.com',
            //   description: 'Production server'
            // }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/api/routes/*.ts'] // API rotalarının yolu
};
var specs = swagger_jsdoc_1(options);
exports.specs = specs;
