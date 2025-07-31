// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set required environment variables for testing
process.env.INCH_API_KEY = process.env.INCH_API_KEY || 'test-api-key';
process.env.PRIVATE_KEY = process.env.PRIVATE_KEY || '0x1234567890123456789012345678901234567890123456789012345678901234';
process.env.CHAINLINK_ORACLE_ADDRESS = process.env.CHAINLINK_ORACLE_ADDRESS || '0x1234567890123456789012345678901234567890';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configure Jest for better async handling
beforeAll(() => {
  // Set up fake timers globally
  jest.useFakeTimers();
});

afterAll(async () => {
  // Clean up timers
  jest.useRealTimers();
  jest.clearAllMocks();
  
  // Wait for any remaining async operations
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Increase timeout for async operations
jest.setTimeout(60000); 