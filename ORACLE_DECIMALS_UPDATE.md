# Oracle Service: Asset Decimals Support

## Summary
Updated the oracle service to dynamically fetch and use correct decimal values for each asset instead of hardcoding `1e6` (6 decimals). This ensures accurate price representation for assets with different decimal precision.

## Problem
The previous implementation assumed all assets had 6 decimals:
- Line 143 (old): `const currentPrice = Number(priceValue.price) / 1e6;`
- Line 476 (old): `newPrice: BigInt(newPrice * 1e6),`

This caused incorrect price calculations for assets with different decimal values (e.g., ALGO has 6 decimals, but other assets may have different precision).

## Solution

### 1. Added Asset Metadata API Integration

**New API Endpoint:** `https://api-general.compx.io/api/assets`
- **Method:** POST
- **Body:** `{ "assetIds": ["1284444444", "0"] }`
- **Returns:** Object map with asset ID as key, containing metadata including `decimals`

### 2. New Functions Added

#### `fetchAssetMetadata(assetIds: number[])`
```typescript
export async function fetchAssetMetadata(
  assetIds: number[]
): Promise<Map<number, CompXAssetMetadata>>
```
- Fetches asset metadata from CompX API
- Maps testnet asset IDs to mainnet IDs for API call
- Caches metadata for reuse
- Returns map of asset ID to metadata

**Features:**
- ✅ Testnet to mainnet ID mapping
- ✅ Handles ALGO (asset ID 0)
- ✅ Caches metadata to avoid repeated API calls
- ✅ Logs decimal information for each asset

#### `getAssetDecimals(assetId: number)`
```typescript
function getAssetDecimals(assetId: number): number
```
- Retrieves decimals from cache
- Falls back to 6 decimals with warning if not found
- Used throughout the service for price scaling

### 3. Updated Interfaces

#### `OracleAsset` Interface
```typescript
export interface OracleAsset {
  assetId: number;
  symbol: string;
  currentPrice: number;
  decimals?: number;  // NEW
}
```

#### New `CompXAssetMetadata` Interface
```typescript
interface CompXAssetMetadata {
  assetId: string;
  name: string;
  unitName: string;
  decimals: number;  // Critical field
  total: number;
  [key: string]: any;
}
```

### 4. Updated Price Reading (`getOracleAssets`)

**Before:**
```typescript
const currentPrice = Number(priceValue.price) / 1e6;
```

**After:**
```typescript
// Fetch metadata first
await fetchAssetMetadata(assetIds);

// Then use correct decimals for each asset
const decimals = getAssetDecimals(assetId);
const priceScaleFactor = Math.pow(10, decimals);
const currentPrice = Number(priceValue.price) / priceScaleFactor;
```

**Logging:**
```
✅ Asset ID 31566704 (USDC): $1.000000 [6 decimals]
✅ Asset ID 0 (ALGO): $0.12345678 [6 decimals]
```

### 5. Updated Price Writing (`updateOracleContract`)

**Before:**
```typescript
newPrice: BigInt(newPrice * 1e6),
```

**After:**
```typescript
const decimals = getAssetDecimals(assetId);
const priceScaleFactor = Math.pow(10, decimals);
const scaledPrice = BigInt(Math.round(newPrice * priceScaleFactor));

console.log(`📊 Scaling price: $${newPrice} × 10^${decimals} = ${scaledPrice}`);

await appClient.send.updateTokenPrice({
  args: {
    assetId: BigInt(assetId),
    newPrice: scaledPrice,
  },
  sender: account.addr,
});
```

## Workflow

### 1. Initialization Phase
```
getOracleAssets()
├── Fetch oracle price map
├── Collect all asset IDs
├── fetchAssetMetadata(assetIds) → Populates cache
└── Parse prices using correct decimals
```

### 2. Price Update Phase
```
updateOracleContract(assetId, symbol, newPrice)
├── Get decimals from cache
├── Calculate scale factor (10^decimals)
├── Convert price: newPrice × scale factor
└── Update oracle contract
```

### 3. Testnet to Mainnet Mapping
For testnet environments, asset IDs are automatically mapped to mainnet IDs when fetching metadata:
```typescript
const TESTNET_TO_MAINNET_MAPPING: Record<string, number> = {
  "744427912": 760037151,   // xUSDt
  "744427950": 1732165149,  // COMPXt
  "747008852": 31566704,    // USDCt
  "747008871": 386192725,   // goBTCt
};
```

## Cache Strategy

### Metadata Cache
```typescript
const assetMetadataCache: Map<number, CompXAssetMetadata> = new Map();
```

**Behavior:**
- Populated once per oracle update cycle
- Persists in memory for the lifetime of the process
- Automatically repopulated if process restarts
- Reduces API calls to CompX

**Cache Hit:**
```typescript
const cached = assetMetadataCache.get(assetId);
if (cached) {
  return cached.decimals; // Fast lookup
}
```

**Cache Miss:**
```typescript
console.warn(`⚠️ Using default 6 decimals for asset ${assetId}`);
return 6; // Fallback
```

## Example Execution Flow

### Console Output Example
```
📋 Fetching assets from oracle application...
Oracle prices map: Map(3) { ... }

📡 Fetching metadata for 3 assets...
📋 Fetching metadata for 3 assets from CompX...
  🔄 Mapping testnet asset 747008852 -> mainnet asset 31566704
  ✅ USDCt: 6 decimals
  ✅ ALGO: 6 decimals
  ✅ xUSDt: 6 decimals

Asset ID: 31566704
✅ Asset ID 31566704 (USDCt): $1.000000 [6 decimals]
Asset ID: 0
✅ Asset ID 0 (ALGO): $0.123456 [6 decimals]

✅ Loaded 2 assets from oracle

🔍 Processing USDCt (Asset ID: 31566704)
  Current oracle price: $1.000000
  🔍 Fetching USDCt price from Vestige...
  ✅ Vestige price: $1.000123 (weight: 0.85)
  🔄 Updating oracle contract for USDCt...
  📊 Scaling price: $1.000123 × 10^6 = 1000123
  ✅ Successfully updated USDCt to $1.000123 [6 decimals]
```

## Error Handling

### Missing Metadata
If metadata fetch fails, the system:
1. Logs a warning
2. Falls back to 6 decimals (standard Algorand default)
3. Continues processing other assets

### Invalid Asset IDs
- Skips assets with invalid IDs
- Logs warning with details
- Continues processing remaining assets

### API Errors
- CompX Assets API failure returns empty map
- System continues with cached data or defaults
- Error logged for monitoring

## Benefits

### ✅ Accuracy
- Correct price representation for all asset types
- No more rounding errors from incorrect decimals
- Proper precision for high-value or low-value assets

### ✅ Flexibility
- Supports any number of decimals (0-18+)
- Works with native ALGO (0) and ASAs
- Future-proof for new assets

### ✅ Performance
- Metadata fetched once per update cycle
- Cached for subsequent lookups
- Minimal API overhead

### ✅ Reliability
- Graceful fallback to 6 decimals
- Continues operation even if metadata unavailable
- Detailed logging for debugging

## Testing Considerations

### Mainnet Assets
- ALGO (0): 6 decimals
- USDCt (31566704): 6 decimals
- Other standard ASAs: typically 6 decimals

### Testnet Assets
- All testnet IDs automatically mapped to mainnet
- Metadata fetched for mainnet equivalent
- Decimals applied to testnet asset

### Edge Cases to Test
1. **Asset with non-6 decimals**: Verify correct scaling
2. **ALGO (asset ID 0)**: Special handling
3. **Missing metadata**: Fallback to 6 decimals
4. **API unavailable**: Cache reuse or defaults
5. **Very large/small prices**: Precision handling

## Future Enhancements

### Potential Improvements
1. **Persistent cache**: Store metadata in database
2. **Batch metadata refresh**: Update cache periodically
3. **Decimal validation**: Compare oracle decimals with metadata
4. **Multi-source metadata**: Fallback to Algorand indexer if CompX unavailable

## Files Modified

1. `/backend/src/services/oracleService.ts`
   - Added `fetchAssetMetadata()` function
   - Added `getAssetDecimals()` helper
   - Updated `getOracleAssets()` to fetch and use metadata
   - Updated `updateOracleContract()` to use correct decimals
   - Added new interfaces for metadata handling
   - Added metadata cache

## Migration Notes

### No Breaking Changes
- Existing oracle data remains valid
- Backward compatible with 6-decimal assets
- No database schema changes required

### Deployment Steps
1. Deploy updated backend code
2. Restart oracle service
3. Monitor first update cycle for metadata fetching
4. Verify prices are correctly scaled in logs

### Rollback Plan
If issues occur:
1. The fallback to 6 decimals ensures continued operation
2. Previous version can be deployed without data corruption
3. Oracle prices remain valid (just may lose precision for non-6-decimal assets)

---

**Status**: ✅ Complete
**Date**: 2025-10-27
**Impact**: All assets now handled with correct decimal precision
**Risk**: Low - graceful fallback ensures continued operation

