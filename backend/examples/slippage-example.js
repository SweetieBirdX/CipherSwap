#!/usr/bin/env node

/**
 * Slippage Tolerance Controls Example
 * 
 * This example demonstrates how to use the slippage tolerance controls
 * via API endpoints and environment variables.
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function main() {
  console.log('🚀 Slippage Tolerance Controls Example\n');

  try {
    // 1. Get current configuration
    console.log('1. Getting current slippage tolerance configuration...');
    const configResponse = await axios.get(`${API_BASE_URL}/slippage/config`);
    console.log('Current configuration:', JSON.stringify(configResponse.data.data, null, 2));
    console.log('');

    // 2. Calculate optimal tolerance for different scenarios
    console.log('2. Calculating optimal tolerance for different scenarios...');
    
    // Scenario 1: Small trade on Ethereum during stable market
    const scenario1 = await axios.post(`${API_BASE_URL}/slippage/calculate`, {
      baseTolerance: 0.5,
      chainId: 1,
      tradeSize: 1000,
      marketConditions: 'STABLE',
      volatility: 0.2,
      liquidity: 0.8
    });
    console.log('Scenario 1 - Small trade on Ethereum (stable market):');
    console.log(`  Adjusted tolerance: ${scenario1.data.data.adjustedTolerance.toFixed(2)}%`);
    console.log(`  Risk level: ${scenario1.data.data.riskLevel}`);
    console.log(`  Warnings: ${scenario1.data.data.warnings.join(', ')}`);
    console.log('');

    // Scenario 2: Large trade on Arbitrum during volatile market
    const scenario2 = await axios.post(`${API_BASE_URL}/slippage/calculate`, {
      baseTolerance: 0.5,
      chainId: 42161,
      tradeSize: 15000,
      marketConditions: 'VOLATILE',
      volatility: 0.8,
      liquidity: 0.3
    });
    console.log('Scenario 2 - Large trade on Arbitrum (volatile market):');
    console.log(`  Adjusted tolerance: ${scenario2.data.data.adjustedTolerance.toFixed(2)}%`);
    console.log(`  Risk level: ${scenario2.data.data.riskLevel}`);
    console.log(`  Warnings: ${scenario2.data.data.warnings.join(', ')}`);
    console.log('');

    // 3. Validate different tolerance values
    console.log('3. Validating different tolerance values...');
    
    const tolerances = [0.1, 1.0, 3.0, 8.0];
    for (const tolerance of tolerances) {
      const validation = await axios.post(`${API_BASE_URL}/slippage/validate`, {
        tolerance
      });
      const result = validation.data.data;
      console.log(`Tolerance ${tolerance}%:`);
      console.log(`  Valid: ${result.isValid}`);
      console.log(`  Requires confirmation: ${result.requiresConfirmation}`);
      console.log(`  Warnings: ${result.warnings.join(', ')}`);
      console.log(`  Recommendations: ${result.recommendations.join(', ')}`);
      console.log('');
    }

    // 4. Get recommended tolerance for different chains
    console.log('4. Getting recommended tolerance for different chains...');
    
    const chains = [
      { id: 1, name: 'Ethereum' },
      { id: 42161, name: 'Arbitrum' },
      { id: 8453, name: 'Base' },
      { id: 324, name: 'zkSync' }
    ];

    for (const chain of chains) {
      const recommended = await axios.get(`${API_BASE_URL}/slippage/recommended/${chain.id}?tradeSize=5000&marketConditions=STABLE`);
      console.log(`${chain.name}: ${recommended.data.data.recommendedTolerance.toFixed(2)}%`);
    }
    console.log('');

    // 5. Update configuration
    console.log('5. Updating slippage tolerance configuration...');
    const updateResponse = await axios.put(`${API_BASE_URL}/slippage/config`, {
      defaultTolerance: 1.0,
      maxTolerance: 8.0,
      warningThreshold: 3.0,
      criticalThreshold: 6.0
    });
    console.log('Configuration updated successfully!');
    console.log('New configuration:', JSON.stringify(updateResponse.data.data, null, 2));
    console.log('');

    // 6. Reset configuration
    console.log('6. Resetting configuration to environment defaults...');
    await axios.post(`${API_BASE_URL}/slippage/reset`);
    console.log('Configuration reset successfully!');
    console.log('');

    console.log('✅ Example completed successfully!');

  } catch (error) {
    console.error('❌ Error running example:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Environment variable examples
console.log('📋 Environment Variable Examples:');
console.log('');
console.log('# Basic Configuration');
console.log('export SLIPPAGE_DEFAULT_TOLERANCE=0.5');
console.log('export SLIPPAGE_MAX_TOLERANCE=5.0');
console.log('export SLIPPAGE_MIN_TOLERANCE=0.1');
console.log('export SLIPPAGE_WARNING_THRESHOLD=2.0');
console.log('export SLIPPAGE_CRITICAL_THRESHOLD=5.0');
console.log('');
console.log('# Feature Flags');
console.log('export SLIPPAGE_AUTO_ADJUSTMENT=true');
console.log('export SLIPPAGE_MARKET_BASED_ADJUSTMENT=true');
console.log('export SLIPPAGE_TIME_BASED_ADJUSTMENT=true');
console.log('export SLIPPAGE_TRADE_SIZE_ADJUSTMENT=true');
console.log('export SLIPPAGE_CHAIN_SPECIFIC=true');
console.log('');
console.log('# Adjustment Multipliers');
console.log('export SLIPPAGE_VOLATILITY_MULTIPLIER=1.5');
console.log('export SLIPPAGE_LIQUIDITY_MULTIPLIER=1.2');
console.log('export SLIPPAGE_PEAK_HOURS_MULTIPLIER=1.3');
console.log('export SLIPPAGE_OFF_PEAK_MULTIPLIER=0.8');
console.log('export SLIPPAGE_LARGE_TRADE_MULTIPLIER=1.4');
console.log('');
console.log('# Chain-Specific Multipliers');
console.log('export SLIPPAGE_ETHEREUM_MULTIPLIER=1.0');
console.log('export SLIPPAGE_ARBITRUM_MULTIPLIER=0.8');
console.log('export SLIPPAGE_BASE_MULTIPLIER=0.9');
console.log('export SLIPPAGE_ZKSYNC_MULTIPLIER=0.7');
console.log('');

if (require.main === module) {
  main();
}

module.exports = { main }; 