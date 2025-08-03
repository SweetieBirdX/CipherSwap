import { Router } from 'express';
import { specs } from '../../config/swagger';
import * as swaggerUi from 'swagger-ui-express';

const docsRouter = Router();

// Serve swagger documentation
const swaggerSetup = swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true
  }
});

// @ts-ignore: Type issues with swagger-ui-express
docsRouter.use('/', [...swaggerUi.serve, swaggerSetup]);

export default docsRouter;
