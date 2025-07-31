import request from 'supertest';
import express from 'express';
import { QuoteController } from '../src/api/controllers/quoteController';

// Create test app
const app = express();
app.use(express.json());

// Create controller instance
const quoteController = new QuoteController();

// Register routes for testing
app.post('/api/quote', (req, res) => quoteController.getQuote(req, res));
app.post('/api/quote/simulate', (req, res) => quoteController.simulateSwap(req, res));
app.get('/api/quote/history', (req, res) => quoteController.getQuoteHistory(req, res));
app.get('/api/quote/tokens', (req, res) => quoteController.getSupportedTokens(req, res));

describe('Quote API Tests', () => {
  describe('POST /api/quote', () => {
    it('should return 400 for missing required fields', async () => {
      const invalidRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C',
        // missing toToken, amount, chainId, userAddress
      };

      const response = await request(app)
        .post('/api/quote')
        .send(invalidRequest);
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid token addresses', async () => {
      const invalidRequest = {
        fromToken: 'invalid-address',
        toToken: 'invalid-address',
        amount: '1000000000000000000',
        chainId: 1,
        userAddress: '0x1234567890123456789012345678901234567890'
      };

      const response = await request(app)
        .post('/api/quote')
        .send(invalidRequest);
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/quote/simulate', () => {
    it('should return 400 for missing required fields', async () => {
      const invalidRequest = {
        fromToken: '0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C',
        // missing toToken, amount, chainId, userAddress
      };

      const response = await request(app)
        .post('/api/quote/simulate')
        .send(invalidRequest);
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/quote/history', () => {
    it('should return quote history', async () => {
      const response = await request(app)
        .get('/api/quote/history');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/quote/tokens', () => {
    it('should return supported tokens', async () => {
      const response = await request(app)
        .get('/api/quote/tokens');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 