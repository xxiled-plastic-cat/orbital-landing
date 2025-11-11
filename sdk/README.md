# Orbital Finance SDK

TypeScript SDK for interacting with the Orbital Finance lending protocol on Algorand.

## Installation

```bash
npm install @orbital-finance/sdk
# or
pnpm add @orbital-finance/sdk
# or
yarn add @orbital-finance/sdk
```

## Quick Start

```typescript
import { OrbitalSDK } from '@orbital-finance/sdk';
import algosdk from 'algosdk';

// Initialize the SDK
const algodClient = new algosdk.Algodv2(
  'your-token',
  'https://testnet-api.algonode.cloud',
  ''
);

const sdk = new OrbitalSDK({
  algodClient,
  network: 'testnet' // or 'mainnet'
});

// Get market information
const market = await sdk.getMarket(12345678);
console.log('Supply APY:', market.supplyApy);
console.log('Borrow APY:', market.borrowApy);

// Get LST token price
const lstPrice = await sdk.getLSTPrice(12345678);
console.log('LST Price:', lstPrice);
```

## Features

- 📊 **Market Data**: Fetch formatted market information including TVL, utilization, and interest rates
- 💰 **APY Calculations**: Get current supply and borrow APYs using the protocol's interest rate model
- 🪙 **LST Pricing**: Calculate LST token prices based on pool composition
- 🔍 **User Positions**: Query user deposits, borrows, and collateral
- ⚡ **Type-Safe**: Full TypeScript support with detailed type definitions

## API Reference

### OrbitalSDK

Main SDK class for interacting with Orbital Finance.

#### Methods

##### `getMarket(appId: number): Promise<MarketData>`

Fetches comprehensive market data for a specific lending market.

**Parameters:**
- `appId`: The application ID of the lending market

**Returns:** Promise resolving to `MarketData` object containing:
- Supply and borrow APYs
- Total deposits and borrows
- Utilization rate
- Available liquidity
- Interest rate model parameters
- And more...

##### `getAPY(appId: number): Promise<APYData>`

Calculates current supply and borrow APYs for a market.

**Parameters:**
- `appId`: The application ID of the lending market

**Returns:** Promise resolving to `APYData` object with supply and borrow APYs

##### `getLSTPrice(appId: number): Promise<number>`

Calculates the current price of the LST token in terms of the underlying asset.

**Parameters:**
- `appId`: The application ID of the lending market

**Returns:** Promise resolving to the LST price (1 LST = X underlying tokens)

## Development

```bash
# Install dependencies
pnpm install

# Build the SDK
pnpm run build

# Watch mode for development
pnpm run dev

# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with UI
pnpm run test:ui

# Run tests with coverage
pnpm run test:coverage

# Type checking
pnpm run typecheck

# Linting
pnpm run lint
```

## Testing

The SDK includes a comprehensive test suite using Vitest. Tests cover:

- **Calculation utilities** - APY calculations, LST pricing, unit conversions
- **State utilities** - Box encoding/decoding, state fetching
- **Client methods** - Market data, APY, LST price, user positions
- **Integration** - Full SDK workflow tests

Run the tests:

```bash
# Run all tests
pnpm run test

# Watch mode for development
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage

# Interactive UI
pnpm run test:ui
```

## License

MIT

