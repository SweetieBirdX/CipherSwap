# Slippage Tolerance Controls

This document describes the comprehensive slippage tolerance control system implemented in CipherSwap, which allows for configurable slippage tolerance settings via environment variables and API endpoints.

## Overview

The slippage tolerance control system provides:

- **Environment Variable Configuration**: All slippage tolerance settings can be configured via environment variables
- **API Endpoints**: RESTful API endpoints for getting, updating, and calculating slippage tolerance
- **Dynamic Adjustments**: Automatic adjustments based on market conditions, time of day, trade size, and chain-specific factors
- **Risk Assessment**: Comprehensive risk assessment and validation
- **Real-time Recommendations**: Real-time slippage tolerance recommendations for different scenarios

## Environment Variables

### Core Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SLIPPAGE_DEFAULT_TOLERANCE` | `0.5` | Default slippage tolerance percentage |
| `SLIPPAGE_MAX_TOLERANCE` | `5.0` | Maximum allowed slippage tolerance percentage |
| `SLIPPAGE_MIN_TOLERANCE` | `0.1` | Minimum allowed slippage tolerance percentage |
| `SLIPPAGE_WARNING_THRESHOLD` | `2.0` | Warning threshold for slippage tolerance percentage |
| `SLIPPAGE_CRITICAL_THRESHOLD` | `5.0` | Critical threshold for slippage tolerance percentage |

### Feature Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `SLIPPAGE_AUTO_ADJUSTMENT` | `true` | Enable automatic slippage adjustment |
| `SLIPPAGE_MARKET_BASED_ADJUSTMENT` | `true` | Enable market-based adjustments |
| `SLIPPAGE_TIME_BASED_ADJUSTMENT` | `true` | Enable time-based adjustments |
| `SLIPPAGE_TRADE_SIZE_ADJUSTMENT` | `true` | Enable trade size-based adjustments |
| `SLIPPAGE_CHAIN_SPECIFIC` | `true` | Enable chain-specific adjustments |

### Market-Based Adjustment Multipliers

| Variable | Default | Description |
|----------|---------|-------------|
| `SLIPPAGE_VOLATILITY_MULTIPLIER` | `1.5` | Multiplier for volatile markets |
| `SLIPPAGE_LIQUIDITY_MULTIPLIER` | `1.2` | Multiplier for low liquidity markets |

### Time-Based Adjustment Multipliers

| Variable | Default | Description |
|----------|---------|-------------|
| `SLIPPAGE_PEAK_HOURS_MULTIPLIER` | `1.3` | Multiplier during peak hours (9-11 AM, 2-4 PM UTC) |
| `SLIPPAGE_OFF_PEAK_MULTIPLIER` | `0.8` | Multiplier during off-peak hours |

### Trade Size Adjustment

| Variable | Default | Description |
|----------|---------|-------------|
| `SLIPPAGE_LARGE_TRADE_THRESHOLD` | `10000` | USD threshold for large trade classification |
| `SLIPPAGE_LARGE_TRADE_MULTIPLIER` | `1.4` | Multiplier for large trades |

### Chain-Specific Multipliers

| Variable | Default | Description |
|----------|---------|-------------|
| `SLIPPAGE_ETHEREUM_MULTIPLIER` | `1.0` | Multiplier for Ethereum mainnet |
| `SLIPPAGE_ARBITRUM_MULTIPLIER` | `0.8` | Multiplier for Arbitrum |
| `SLIPPAGE_BASE_MULTIPLIER` | `0.9` | Multiplier for Base |
| `SLIPPAGE_ZKSYNC_MULTIPLIER` | `0.7` | Multiplier for zkSync Era |

## API Endpoints

### Get Configuration

```http
GET /api/slippage/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "defaultTolerance": 0.5,
    "maxTolerance": 5.0,
    "minTolerance": 0.1,
    "warningThreshold": 2.0,
    "criticalThreshold": 5.0,
    "autoAdjustment": true,
    "marketBasedAdjustment": true,
    "timeBasedAdjustment": true,
    "tradeSizeAdjustment": true,
    "chainSpecific": true
  },
  "timestamp": 1703123456789
}
```

### Update Configuration

```http
PUT /api/slippage/config
Content-Type: application/json

{
  "defaultTolerance": 1.0,
  "maxTolerance": 10.0,
  "warningThreshold": 3.0,
  "marketBasedAdjustment": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "defaultTolerance": 1.0,
    "maxTolerance": 10.0,
    "warningThreshold": 3.0,
    "marketBasedAdjustment": true,
    // ... other config values
  },
  "message": "Slippage tolerance configuration updated successfully",
  "timestamp": 1703123456789
}
```

### Calculate Optimal Tolerance

```http
POST /api/slippage/calculate
Content-Type: application/json

{
  "baseTolerance": 0.5,
  "chainId": 1,
  "tradeSize": 5000,
  "marketConditions": "VOLATILE",
  "volatility": 0.8,
  "liquidity": 0.3,
  "timeOfDay": 0.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendedTolerance": 0.5,
    "adjustedTolerance": 1.2,
    "factors": {
      "volatility": 0.8,
      "liquidity": 0.3,
      "timeOfDay": 0.5,
      "tradeSize": 5000,
      "chainId": 1,
      "marketConditions": "VOLATILE"
    },
    "warnings": [
      "Market volatility detected - increased slippage tolerance"
    ],
    "isWithinLimits": true,
    "riskLevel": "MEDIUM"
  },
  "timestamp": 1703123456789
}
```

### Validate Tolerance

```http
POST /api/slippage/validate
Content-Type: application/json

{
  "tolerance": 3.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [
      "High slippage tolerance: 3.00%"
    ],
    "recommendations": [
      "Monitor market conditions before proceeding"
    ],
    "requiresConfirmation": true
  },
  "timestamp": 1703123456789
}
```

### Get Recommended Tolerance

```http
GET /api/slippage/recommended/1?tradeSize=1000&marketConditions=STABLE
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chainId": 1,
    "tradeSize": 1000,
    "marketConditions": "STABLE",
    "recommendedTolerance": 0.8
  },
  "timestamp": 1703123456789
}
```

### Reset Configuration

```http
POST /api/slippage/reset
```

**Response:**
```json
{
  "success": true,
  "data": {
    "defaultTolerance": 0.5,
    "maxTolerance": 5.0,
    // ... environment default values
  },
  "message": "Slippage tolerance configuration reset to environment defaults",
  "timestamp": 1703123456789
}
```

## Adjustment Factors

### Market-Based Adjustments

The system automatically adjusts slippage tolerance based on:

- **Volatility**: Higher volatility increases tolerance
- **Liquidity**: Lower liquidity increases tolerance
- **Market Conditions**: STABLE, VOLATILE, EXTREME

### Time-Based Adjustments

- **Peak Hours** (9-11 AM, 2-4 PM UTC): 1.3x multiplier
- **Off-Peak Hours**: 0.8x multiplier

### Trade Size Adjustments

- **Large Trades** (>$10,000): 1.4x multiplier
- **Medium Trades** (>$5,000): 1.2x multiplier
- **Small Trades**: No adjustment

### Chain-Specific Adjustments

- **Ethereum**: 1.0x (baseline)
- **Arbitrum**: 0.8x (lower tolerance due to faster finality)
- **Base**: 0.9x
- **zkSync**: 0.7x (lowest tolerance due to ZK proofs)

## Risk Levels

| Risk Level | Tolerance Range | Description |
|------------|----------------|-------------|
| LOW | ≤ 2.0% | Safe for most trades |
| MEDIUM | 2.0% - 5.0% | Requires monitoring |
| HIGH | 5.0% - 10.0% | High risk, user confirmation required |
| CRITICAL | > 10.0% | Extremely high risk, not recommended |

## Usage Examples

### Basic Configuration

```bash
# Set environment variables
export SLIPPAGE_DEFAULT_TOLERANCE=0.5
export SLIPPAGE_MAX_TOLERANCE=5.0
export SLIPPAGE_AUTO_ADJUSTMENT=true

# Start the service
npm start
```

### Advanced Configuration

```bash
# Conservative settings for high-frequency trading
export SLIPPAGE_DEFAULT_TOLERANCE=0.3
export SLIPPAGE_MAX_TOLERANCE=2.0
export SLIPPAGE_WARNING_THRESHOLD=1.0
export SLIPPAGE_CRITICAL_THRESHOLD=2.0
export SLIPPAGE_AUTO_ADJUSTMENT=true
export SLIPPAGE_MARKET_BASED_ADJUSTMENT=true
export SLIPPAGE_VOLATILITY_MULTIPLIER=1.2
export SLIPPAGE_LIQUIDITY_MULTIPLIER=1.1

# Aggressive settings for large trades
export SLIPPAGE_DEFAULT_TOLERANCE=1.0
export SLIPPAGE_MAX_TOLERANCE=10.0
export SLIPPAGE_WARNING_THRESHOLD=3.0
export SLIPPAGE_CRITICAL_THRESHOLD=8.0
export SLIPPAGE_LARGE_TRADE_MULTIPLIER=1.5
```

### API Usage Examples

```javascript
// Get current configuration
const config = await fetch('/api/slippage/config').then(r => r.json());

// Calculate optimal tolerance for a trade
const calculation = await fetch('/api/slippage/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    baseTolerance: 0.5,
    chainId: 1,
    tradeSize: 5000,
    marketConditions: 'VOLATILE'
  })
}).then(r => r.json());

// Validate user-provided tolerance
const validation = await fetch('/api/slippage/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tolerance: 2.5 })
}).then(r => r.json());

// Get recommended tolerance for Ethereum
const recommended = await fetch('/api/slippage/recommended/1?tradeSize=1000&marketConditions=STABLE')
  .then(r => r.json());
```

## Integration with Swap Service

The slippage tolerance system is integrated with the main swap service:

```typescript
import { SwapService } from './services/swapService';
import SlippageToleranceService from './services/slippageToleranceService';

const swapService = new SwapService();
const slippageService = new SlippageToleranceService();

// Calculate optimal slippage for a swap
const factors = {
  volatility: 0.6,
  liquidity: 0.4,
  timeOfDay: new Date().getUTCHours() / 24,
  tradeSize: 5000,
  chainId: 1,
  marketConditions: 'VOLATILE'
};

const slippageResult = slippageService.calculateOptimalTolerance(0.5, factors);

// Use the calculated tolerance in the swap
const swapParams = {
  fromToken: '0x...',
  toToken: '0x...',
  amount: '1000000000000000000',
  chainId: 1,
  slippage: slippageResult.adjustedTolerance,
  userAddress: '0x...'
};

const swapResult = await swapService.createSwap(swapParams);
```

## Testing

Run the slippage tolerance tests:

```bash
npm test -- slippageTolerance.test.ts
```

The tests cover:
- Environment variable configuration
- Configuration updates and validation
- Tolerance calculation with various factors
- Risk assessment and validation
- Edge cases and error handling

## Monitoring and Logging

The system provides comprehensive logging:

```typescript
// Log slippage tolerance calculations
logger.info('Slippage tolerance calculated', {
  baseTolerance: 0.5,
  adjustedTolerance: 1.2,
  factors: factors,
  warnings: result.warnings,
  riskLevel: result.riskLevel
});

// Log configuration updates
logger.info('Slippage tolerance configuration updated', {
  config: updatedConfig
});
```

## Security Considerations

1. **Input Validation**: All API inputs are validated to prevent invalid configurations
2. **Range Limits**: Tolerance values are constrained to reasonable ranges
3. **Logical Validation**: Configuration updates are validated for logical consistency
4. **Environment Isolation**: Test environment uses separate configuration
5. **Audit Logging**: All configuration changes are logged for audit purposes

## Performance Considerations

1. **Caching**: Configuration is cached in memory for fast access
2. **Lazy Loading**: Services are initialized only when needed
3. **Efficient Calculations**: Adjustment calculations are optimized
4. **Minimal Dependencies**: Lightweight implementation with minimal external dependencies

## Future Enhancements

1. **Machine Learning**: ML-based slippage prediction
2. **Historical Analysis**: Historical slippage analysis for better predictions
3. **Real-time Market Data**: Integration with real-time market data feeds
4. **User Preferences**: Per-user slippage tolerance preferences
5. **Advanced Analytics**: Advanced analytics and reporting features 