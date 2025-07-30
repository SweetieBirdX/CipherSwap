// Global teardown for Jest tests
export default async function globalTeardown() {
  // Wait a bit to ensure all async operations complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Clear any remaining timers
  if (typeof jest !== 'undefined') {
    jest.clearAllTimers();
    jest.useRealTimers();
  }
  
  // Clear any global mocks
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks();
  }
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
} 