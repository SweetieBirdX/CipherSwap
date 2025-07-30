import { Router } from 'express';
import { specs, swaggerUi } from '../../config/swagger';

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
