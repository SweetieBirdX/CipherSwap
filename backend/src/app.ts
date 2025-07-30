import express from 'express';
import cors from 'cors';
import { specs, swaggerUi } from './config/swagger';
import apiRouter from './api';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
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
app.use('/api-docs', [swaggerUi.serve, swaggerSetup]);

// API Routes
app.use('/api', apiRouter);

export default app;
