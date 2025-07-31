import express from 'express';
import cors from 'cors';
import { specs, swaggerUi } from './config/swagger';
import apiRouter from './api';
import config from './config/env';

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173', // Vite preview port
    config.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
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
