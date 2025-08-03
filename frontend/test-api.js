// Test script to debug API connection
const API_BASE_URL = 'http://localhost:3001';

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Connection...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: Create unsigned transaction with proper data
    console.log('\n2. Testing create unsigned transaction...');
    const orderData = {
      fromToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      toToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC (lowercase)
      amount: '1000000000000000000', // 1 ETH in wei
      limitPrice: '1800000000', // $1800 per ETH
      deadline: 3600, // 1 hour
      userAddress: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6', // Test address (lowercase)
      chainId: 1, // Ethereum mainnet
      orderType: 'sell' // Sell order type
    };

    const createResponse = await fetch(`${API_BASE_URL}/api/frontend-limit-orders/create-unsigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const createData = await createResponse.json();
    console.log('✅ Create unsigned transaction response:', createData);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFrontendAPI(); 