const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testFrontendLimitOrderAPI() {
  console.log('🧪 Testing Frontend Limit Order API...\n');

  try {
    // Test 1: Create unsigned transaction
    console.log('1. Testing create unsigned transaction...');
    const createResponse = await axios.post(`${API_BASE_URL}/frontend-limit-orders/create-unsigned`, {
      fromToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      toToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC (lowercase)
      amount: '1000000000000000000', // 1 ETH in wei
      limitPrice: '1800000000', // $1800 per ETH
      deadline: 3600, // 1 hour
      userAddress: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6', // Test address (lowercase)
      chainId: 1, // Ethereum mainnet
      orderType: 'sell' // Sell order type
    });

    console.log('✅ Create unsigned transaction response:', createResponse.data);

    if (createResponse.data.success) {
      const orderId = createResponse.data.data.orderId;
      
      // Test 2: Get order status
      console.log('\n2. Testing get order status...');
      const statusResponse = await axios.get(`${API_BASE_URL}/frontend-limit-orders/${orderId}`);
      console.log('✅ Get order status response:', statusResponse.data);

      // Test 3: Health check
      console.log('\n3. Testing health check...');
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Health check response:', healthResponse.data);

    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testFrontendLimitOrderAPI(); 