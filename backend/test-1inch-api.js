const axios = require('axios');
require('dotenv').config();

const INCH_API_KEY = process.env.INCH_API_KEY;
const BASE_URL = 'https://api.1inch.dev/price/v1.1/1';

async function test1inchAPI() {
  console.log('Testing 1inch Spot Price API...');
  console.log('API Key:', INCH_API_KEY ? 'Present' : 'Missing');
  
  if (!INCH_API_KEY) {
    console.error('❌ INCH_API_KEY is missing in environment variables');
    return;
  }

  // Test single token price
  const testAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
  console.log(`\nTesting single token price for WETH: ${testAddress}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/${testAddress}`, {
      params: { currency: 'USD' },
      headers: {
        'Authorization': `Bearer ${INCH_API_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Single token API call successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Single token API call failed');
    console.error('Error:', error.response?.data || error.message);
  }

  // Test multiple tokens
  const testAddresses = [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // USDT
  ];
  
  console.log(`\nTesting multiple tokens: ${testAddresses.join(', ')}`);
  
  try {
    const addressesParam = testAddresses.join(',');
    const response = await axios.get(`${BASE_URL}/${addressesParam}`, {
      params: { currency: 'USD' },
      headers: {
        'Authorization': `Bearer ${INCH_API_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Multiple tokens API call successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Multiple tokens API call failed');
    console.error('Error:', error.response?.data || error.message);
  }

  // Test currencies endpoint
  console.log('\nTesting currencies endpoint...');
  
  try {
    const response = await axios.get(`${BASE_URL}/currencies`, {
      headers: {
        'Authorization': `Bearer ${INCH_API_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Currencies API call successful');
    console.log('Available currencies count:', response.data.currencies?.length || 0);
  } catch (error) {
    console.error('❌ Currencies API call failed');
    console.error('Error:', error.response?.data || error.message);
  }
}

test1inchAPI().catch(console.error); 