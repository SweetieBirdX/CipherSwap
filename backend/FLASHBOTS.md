# Flashbots MEV Protection Implementation

This document describes the Flashbots bundle implementation for MEV protection in the CipherSwap backend.

## Overview

The Flashbots implementation provides MEV (Maximal Extractable Value) protection for swap transactions by submitting them as bundles to the Flashbots relay. This prevents front-running and sandwich attacks by keeping transactions private until they are included in a block.

## Features

- **Bundle Creation**: Create Flashbots bundles with multiple transactions
- **Bundle Simulation**: Simulate bundles before submission to estimate gas and profitability
- **Gas Estimation**: Estimate gas costs for bundle transactions
- **Bundle Submission**: Submit bundles to Flashbots relay
- **Bundle Tracking**: Track bundle status and history
- **Error Handling**: Comprehensive error handling for Flashbots-specific errors

## Configuration

Add the following environment variables to your `.env` file:

```env
# Flashbots Configuration
FLASHBOTS_RELAY_URL=https://relay.flashbots.net
FLASHBOTS_SIGNER_PRIVATE_KEY=your_private_key_here
FLASHBOTS_BUNDLE_TIMEOUT=120000
FLASHBOTS_MAX_RETRIES=3

# Ethereum RPC (required for Flashbots)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_infura_key

# Enable MEV protection
ENABLE_MEV_PROTECTION=true
```

## API Usage

### 1. Create Flashbots Bundle

```typescript
const swapService = new SwapService();

const transactions = [
  '0x...', // Signed transaction hex
  '0x...'  // Another signed transaction
];

const mevConfig: MEVProtectionConfig = {
  useFlashbots: true,
  targetBlock: 12345678,
  refundRecipient: '0x...',
  refundPercent: 90
};

const result = await swapService.createFlashbotsBundle(
  transactions,
  '0xuserAddress',
  mevConfig
);

if (result.success) {
  console.log('Bundle created:', result.data);
} else {
  console.error('Bundle creation failed:', result.error);
}
```

### 2. Simulate Bundle

```typescript
const bundleRequest: FlashbotsBundleRequest = {
  transactions: [
    { transaction: '0x...', canRevert: false }
  ],
  targetBlock: 12345678
};

const simulation = await swapService.simulateBundle(bundleRequest);

if (simulation.success) {
  console.log('Simulation result:', simulation.data);
  console.log('Gas used:', simulation.data?.gasUsed);
  console.log('Profit:', simulation.data?.profit);
} else {
  console.error('Simulation failed:', simulation.error);
}
```

### 3. Estimate Bundle Gas

```typescript
const gasRequest: GasEstimateRequest = {
  transactions: ['0x...', '0x...'],
  blockNumber: 12345678
};

const gasEstimate = await swapService.estimateBundleGas(gasRequest);

if (gasEstimate.success) {
  console.log('Gas estimate:', gasEstimate.data);
  console.log('Total cost:', gasEstimate.data?.totalCost);
} else {
  console.error('Gas estimation failed:', gasEstimate.error);
}
```

### 4. Get Bundle Status

```typescript
const status = await swapService.getBundleStatus(
  'bundle_1234567890_abc123',
  '0xuserAddress'
);

if (status.success) {
  console.log('Bundle status:', status.data?.status);
  console.log('Target block:', status.data?.targetBlock);
} else {
  console.error('Failed to get status:', status.error);
}
```

### 5. Get Bundle History

```typescript
const history = await swapService.getBundleHistory(
  '0xuserAddress',
  10, // limit
  1   // page
);

console.log('Bundle history:', history);
```

## Types

### MEVProtectionConfig

```typescript
interface MEVProtectionConfig {
  useFlashbots: boolean;
  targetBlock?: number;
  maxBlockNumber?: number;
  refundRecipient?: string;
  refundPercent?: number;
  minTimestamp?: number;
  maxTimestamp?: number;
  revertingTxHashes?: string[];
}
```

### FlashbotsBundleRequest

```typescript
interface FlashbotsBundleRequest {
  transactions: BundleTransaction[];
  targetBlock?: number;
  maxBlockNumber?: number;
  minTimestamp?: number;
  maxTimestamp?: number;
  revertingTxHashes?: string[];
  replacementUuid?: string;
  refundRecipient?: string;
  refundPercent?: number;
}
```

### BundleTransaction

```typescript
interface BundleTransaction {
  transaction: string; // Signed transaction hex
  canRevert?: boolean;
}
```

## Error Handling

The implementation includes comprehensive error handling for Flashbots-specific errors:

- **Bundle not found**: Bundle was not found in the relay
- **Bundle expired**: Bundle target block has passed
- **Insufficient balance**: Not enough balance for bundle submission
- **Invalid transaction**: Transaction format is invalid
- **Gas limit exceeded**: Bundle gas limit exceeded
- **Nonce errors**: Transaction nonce issues
- **Network errors**: Connection issues with Flashbots relay

## Security Considerations

1. **Private Key Management**: Store Flashbots signer private keys securely
2. **Transaction Validation**: Always validate transactions before bundling
3. **Gas Limits**: Set appropriate gas limits to prevent failed bundles
4. **Block Targeting**: Choose appropriate target blocks for bundle inclusion
5. **Refund Configuration**: Configure refund recipients and percentages carefully

## Best Practices

1. **Simulate First**: Always simulate bundles before submission
2. **Gas Estimation**: Use gas estimation to optimize bundle costs
3. **Error Handling**: Implement proper error handling for all Flashbots operations
4. **Monitoring**: Monitor bundle status and track failed submissions
5. **Testing**: Test with small amounts before large transactions

## Integration with Swap Service

The Flashbots functionality is integrated with the existing swap service:

```typescript
// Create a swap with MEV protection
const swapRequest: SwapRequest = {
  fromToken: '0x...',
  toToken: '0x...',
  amount: '1000000000000000000',
  chainId: 1,
  userAddress: '0x...',
  slippage: 0.5
};

// Get swap quote
const quote = await swapService.getQuote(swapRequest);

// Create MEV-protected bundle
const mevConfig: MEVProtectionConfig = {
  useFlashbots: true,
  targetBlock: await provider.getBlockNumber() + 1,
  refundRecipient: '0x...',
  refundPercent: 90
};

const bundle = await swapService.createFlashbotsBundle(
  [quote.data.tx], // Include swap transaction
  swapRequest.userAddress,
  mevConfig
);
```

## Future Enhancements

1. **Real Flashbots API Integration**: Replace mock implementations with real Flashbots API calls
2. **Bundle Optimization**: Implement bundle optimization algorithms
3. **Multi-chain Support**: Extend to support multiple chains
4. **Advanced MEV Strategies**: Implement more sophisticated MEV protection strategies
5. **Analytics**: Add bundle analytics and performance tracking

## Dependencies

- `flashbots-ethers-v6-provider-bundle`: Flashbots provider for ethers v6
- `ethers`: Ethereum library for transaction handling
- `axios`: HTTP client for API calls

## Installation

```bash
npm install flashbots-ethers-v6-provider-bundle ethers
```

## Testing

```bash
npm test
```

The Flashbots functionality includes comprehensive tests for:
- Bundle creation and validation
- Bundle simulation
- Gas estimation
- Error handling
- Bundle status tracking 