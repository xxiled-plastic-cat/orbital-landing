# New Features Summary - SDK v1.0.0

## Overview

Added comprehensive user position tracking across all markets, including methods to fetch both deposit and borrow positions for any user address.

## New Methods

### 1. `getAllUserPositions(userAddress: string)`

Fetches all positions (deposits and borrows) for a user across all active markets.

**What it does:**
- Queries all active markets from the backend API
- Checks deposit records (deposit boxes) for each market
- Checks loan records (loan boxes) for each market
- Aggregates all data into a single comprehensive view
- Calculates totals and overall health metrics

**Example:**
```typescript
const positions = await sdk.getAllUserPositions('USERADDRESS...');

console.log(`Active in ${positions.activeMarkets} markets`);
console.log(`Total Supplied: ${positions.totalSupplied}`);
console.log(`Total Borrowed: ${positions.totalBorrowed}`);
console.log(`Total Collateral: ${positions.totalCollateral}`);
console.log(`Health Factor: ${positions.overallHealthFactor}`);

// Check individual positions
positions.positions.forEach(pos => {
  console.log(`Market ${pos.appId}:`);
  console.log(`  Supplied: ${pos.supplied}`);
  console.log(`  Borrowed: ${pos.borrowed}`);
  console.log(`  Health Factor: ${pos.healthFactor}`);
});
```

### 2. `getUserPositionsForMarkets(userAddress: string, marketAppIds: number[])`

Fetches user positions for specific markets only (subset of all markets).

**What it does:**
- Same as `getAllUserPositions()` but only checks specified markets
- Useful when you know which markets to check
- Reduces API calls and improves performance

**Example:**
```typescript
const positions = await sdk.getUserPositionsForMarkets(
  'USERADDRESS...',
  [123456, 234567, 345678]
);
```

## New Type

### `UserAllPositions`

```typescript
interface UserAllPositions {
  address: string;                    // User's Algorand address
  positions: UserPosition[];          // Array of individual market positions
  totalSupplied: number;              // Sum of all supplied amounts
  totalBorrowed: number;              // Sum of all borrowed amounts
  totalCollateral: number;            // Sum of all collateral
  overallHealthFactor: number;        // Minimum health factor (most risky)
  activeMarkets: number;              // Number of markets with positions
}
```

## Files Modified

1. **`src/types/index.ts`** - Added `UserAllPositions` type
2. **`src/client.ts`** - Added two new methods to `OrbitalSDK` class
3. **`src/index.ts`** - Exported new type
4. **`README.md`** - Updated with comprehensive documentation
5. **`CHANGELOG.md`** - Added v1.0.0 release notes

## Files Created

1. **`src/examples/user-positions.ts`** - Complete usage examples
2. **`USAGE_WITHOUT_NPM.md`** - Guide for using SDK without npm publish
3. **`NEW_FEATURES_SUMMARY.md`** - This file

## How It Works

The new methods leverage existing SDK functionality:

1. **Fetch Market List**: Uses `getMarketList()` to get all active markets
2. **Parallel Queries**: Calls `getUserPosition()` for each market in parallel
3. **Filter Active**: Filters out markets where user has no position
4. **Aggregate**: Calculates totals and overall metrics
5. **Return**: Returns comprehensive `UserAllPositions` object

## Use Cases

### 1. Portfolio Dashboard
Show all user positions across all markets in one view:
```typescript
const portfolio = await sdk.getAllUserPositions(userAddress);
// Display total supplied, borrowed, health factor, etc.
```

### 2. Risk Monitoring
Monitor health factors across all positions:
```typescript
const positions = await sdk.getAllUserPositions(userAddress);
const atRisk = positions.positions.filter(
  pos => pos.borrowed > 0 && pos.healthFactor < 1.2
);
```

### 3. Liquidation Bot
Find all positions that need liquidation:
```typescript
const positions = await sdk.getAllUserPositions(userAddress);
const liquidatable = positions.positions.filter(pos => pos.isLiquidatable);
```

### 4. Market Analysis
Check user exposure across specific markets:
```typescript
const algoMarkets = [12345, 23456]; // ALGO-based markets
const positions = await sdk.getUserPositionsForMarkets(
  userAddress,
  algoMarkets
);
```

## Performance

- **Parallel Execution**: All markets queried simultaneously
- **Error Handling**: Failed queries don't block other markets
- **Filtering**: Only returns markets with active positions
- **Efficient**: Leverages existing box storage infrastructure

## Installation Without NPM

The SDK can be installed without publishing to npm:

### For Production (Digital Ocean, etc.)
```bash
# Commit the tarball to your repo
mkdir -p packages
cp compx-orbital-lending-sdk-1.0.0.tgz packages/
git add packages/compx-orbital-lending-sdk-1.0.0.tgz

# Add to package.json
{
  "dependencies": {
    "@compx/orbital-lending-sdk": "file:./packages/compx-orbital-lending-sdk-1.0.0.tgz"
  }
}
```

### For Development
```bash
# Option 1: File path
{
  "dependencies": {
    "@compx/orbital-lending-sdk": "file:../orbital-landing/sdk"
  }
}

# Option 2: npm link
cd /path/to/orbital-landing/sdk
npm link

cd /path/to/your-app
npm link @compx/orbital-lending-sdk
```

See `USAGE_WITHOUT_NPM.md` for complete guide.

## Testing

The SDK has been built and packaged:
- ✅ TypeScript compilation successful
- ✅ Types exported correctly
- ✅ Tarball created: `compx-orbital-lending-sdk-1.0.0.tgz` (19KB)
- ✅ Ready for installation

## Next Steps

1. **Test in your app**: Install the tarball and test the new methods
2. **Provide feedback**: Report any issues or suggestions
3. **Update as needed**: Rebuild tarball when changes are made

## Questions?

- See `README.md` for full API documentation
- See `src/examples/user-positions.ts` for usage examples
- See `USAGE_WITHOUT_NPM.md` for installation guides

