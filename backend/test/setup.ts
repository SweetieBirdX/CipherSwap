// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.INCH_API_KEY = 'test-api-key';
process.env.PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';

// Global test timeout
const jest = (global as any).jest;
if (jest) {
  jest.setTimeout(10000);
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}; 