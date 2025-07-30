import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
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

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
