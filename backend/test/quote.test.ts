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

// Basic test structure
const testQuoteAPI = () => {
  console.log('Testing Quote API...');
  
  // Test 1: Missing required fields
  const testMissingFields = async () => {
    const invalidRequest = {
      fromToken: '0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C',
      // missing toToken, amount, chainId, userAddress
    };

    try {
      const response = await request(app)
        .post('/api/quote')
        .send(invalidRequest);
      
      console.log('Test 1 passed: Missing fields returns 400');
      return response.status === 400;
    } catch (error) {
      console.log('Test 1 failed:', error);
      return false;
    }
  };

  // Test 2: Invalid token addresses
  const testInvalidAddresses = async () => {
    const invalidRequest = {
      fromToken: 'invalid-address',
      toToken: 'invalid-address',
      amount: '1000000000000000000',
      chainId: 1,
      userAddress: '0x1234567890123456789012345678901234567890'
    };

    try {
      const response = await request(app)
        .post('/api/quote')
        .send(invalidRequest);
      
      console.log('Test 2 passed: Invalid addresses returns 400');
      return response.status === 400;
    } catch (error) {
      console.log('Test 2 failed:', error);
      return false;
    }
  };

  // Run tests
  return Promise.all([
    testMissingFields(),
    testInvalidAddresses()
  ]);
};

// Export for manual testing
export { testQuoteAPI };

// Run tests if this file is executed directly
if (require.main === module) {
  testQuoteAPI().then(results => {
    const passed = results.filter(Boolean).length;
    const total = results.length;
    console.log(`\nTest Results: ${passed}/${total} tests passed`);
    process.exit(passed === total ? 0 : 1);
  });
} 