// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.INCH_API_KEY = 'test-api-key';
process.env.PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';

// Set up test RPC URLs for reliable testing
process.env.ETHEREUM_RPC_URL = 'https://eth-mainnet.g.alchemy.com/v2/demo';
process.env.INFURA_KEY = 'demo-key';


if (process.env.NODE_ENV === 'test') {
  const originalConsole = { ...console };
  
  global.console = {
    ...originalConsole,
    log: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
} 