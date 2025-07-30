// Test setup file for Jest
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set test environment variables if not already set
if (!process.env.INCH_API_KEY || process.env.INCH_API_KEY.startsWith('test-')) {
  // Load from .env file if available
  const envConfig = dotenv.config({ path: '.env' });
  if (envConfig.parsed?.INCH_API_KEY) {
    process.env.INCH_API_KEY = envConfig.parsed.INCH_API_KEY;
  }
}

// Set up test RPC URLs for reliable testing
process.env.ETHEREUM_RPC_URL = 'https://eth-mainnet.g.alchemy.com/v2/demo';
process.env.INFURA_KEY = 'demo-key';


// Mock console methods to reduce noise in tests (only in test environment)
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