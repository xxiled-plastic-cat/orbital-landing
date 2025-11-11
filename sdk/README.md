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

// Initialize the SDK with custom Algod configuration
const algodClient = new algosdk.Algodv2(
  'your-token',              // API token (empty string for public nodes)
  'https://testnet-api.algonode.cloud',  // Algod URL
  ''                         // Port (empty for default)
);

// Optional: Initialize indexer for historical queries
const indexerClient = new algosdk.Indexer(
  'your-token',
  'https://testnet-idx.algonode.cloud',
  ''
);

const sdk = new OrbitalSDK({
  algodClient,               // Required: Configured Algod client
  network: 'testnet',        // Required: 'mainnet' or 'testnet'
  indexerClient,             // Optional: For historical data
  apiBaseUrl: 'https://api.orbitalfinance.io' // Optional: Custom backend URL
});

// Get market information (no wallet needed!)
const market = await sdk.getMarket(12345678);
console.log('Supply APY:', market.supplyApy);

// Get asset metadata from Algorand (no wallet needed!)
const asset = await sdk.getAssetInfo(31566704);
console.log('Asset:', asset.name, asset.unitName);
```

### Configuration Options

The SDK accepts pre-configured `algosdk` clients, allowing you to:
- Use custom node providers (AlgoNode, PureStake, your own node)
- Configure authentication tokens
- Set custom ports and endpoints
- Use testnet or mainnet

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

##### `getMarkets(appIds: number[]): Promise<MarketData[]>`

Fetches multiple markets in parallel. **No wallet required.**

**Parameters:**
- `appIds`: Array of market application IDs

**Returns:** Promise resolving to array of `MarketData` objects

**Example:**
```typescript
const markets = await sdk.getMarkets([12345678, 23456789, 34567890]);
markets.forEach(market => {
  console.log(`Market ${market.appId}: ${market.supplyApy}% APY`);
});
```

##### `getAllMarkets(): Promise<MarketData[]>`

Fetches all available markets from the Orbital backend API and enriches with on-chain data. **No wallet required.**

**Returns:** Promise resolving to array of all `MarketData` objects

**Example:**
```typescript
const allMarkets = await sdk.getAllMarkets();
console.log(`Found ${allMarkets.length} markets`);
```

##### `getMarketList(): Promise<MarketInfo[]>`

Fetches basic market information from the backend API without on-chain data. This is faster than `getAllMarkets()` if you only need market IDs and token IDs. **No wallet required.**

**Returns:** Promise resolving to array of `MarketInfo` objects with basic market data

**Example:**
```typescript
const marketList = await sdk.getMarketList();
// Returns: [{ appId, baseTokenId, lstTokenId, network }, ...]
```

##### `getOraclePrice(oracleAppId: number, assetId: number): Promise<OraclePrice>`

Fetches the current price for an asset from the oracle contract. **No wallet required.**

**Parameters:**
- `oracleAppId`: The oracle application ID
- `assetId`: The asset ID to get price for

**Returns:** Promise resolving to `OraclePrice` object with price, timestamp, and metadata

**Example:**
```typescript
const price = await sdk.getOraclePrice(789012, 31566704);
console.log(`Asset price: $${price.price}`);
console.log(`Last updated: ${price.lastUpdatedDate}`);
```

##### `getOraclePrices(oracleAppId: number, assetIds: number[]): Promise<OraclePriceMap>`

Fetches prices for multiple assets in parallel from the oracle contract. **No wallet required.**

**Parameters:**
- `oracleAppId`: The oracle application ID
- `assetIds`: Array of asset IDs to get prices for

**Returns:** Promise resolving to a Map of asset ID to `OraclePrice` objects

**Example:**
```typescript
const prices = await sdk.getOraclePrices(789012, [0, 31566704, 386192725]);
prices.forEach((price, assetId) => {
  console.log(`Asset ${assetId}: $${price.price}`);
});
```

##### `getAssetInfo(assetId: number): Promise<AssetInfo>`

Fetches asset metadata directly from the Algorand blockchain. **No wallet required.**

**Parameters:**
- `assetId`: Asset ID to fetch (use 0 for ALGO)

**Returns:** Promise resolving to `AssetInfo` with name, symbol, decimals, supply, etc.

**Example:**
```typescript
const asset = await sdk.getAssetInfo(31566704);
console.log(`${asset.name} (${asset.unitName})`);
console.log(`Decimals: ${asset.decimals}`);
```

##### `getAssetsInfo(assetIds: number[]): Promise<AssetInfo[]>`

Fetches metadata for multiple assets in parallel from Algorand. **No wallet required.**

**Parameters:**
- `assetIds`: Array of asset IDs to fetch

**Returns:** Promise resolving to array of `AssetInfo` objects

**Example:**
```typescript
const assets = await sdk.getAssetsInfo([0, 31566704, 386192725]);
assets.forEach(asset => {
  console.log(`${asset.name}: ${asset.decimals} decimals`);
});
```

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

