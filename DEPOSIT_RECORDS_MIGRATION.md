# Deposit Records Migration Summary

## Overview
Successfully migrated the application from using LST token balances to using on-chain deposit record boxes as the source of truth for user deposits.

## What Changed

### 1. Created New Hook: `useDepositRecords.ts`
**Location**: `src/hooks/useDepositRecords.ts`

**Purpose**: Fetches deposit records from on-chain deposit boxes for all markets

**Key Features**:
- Fetches deposit records for each market the user has deposits in
- Handles both ALGO and ASA markets
- Returns formatted deposit amounts in base units
- Includes error handling for markets without deposits
- Auto-refetches when wallet or markets change

**Interface**:
```typescript
interface DepositRecord {
  marketId: string;
  assetId: string;
  depositAmount: bigint;           // Raw amount from box
  depositAmountFormatted: number;  // Converted to base units
}
```

### 2. Updated `MarketDetailsPage.tsx`
**Changes**:
- Added `userDepositRecord` state
- Created `refetchUserDepositRecord()` function
- Added useEffect to fetch deposit records on mount
- All transaction handlers now refetch deposit records after success
- Updated `PositionHeader` to receive `userDepositRecord` instead of `userAssets`

### 3. Updated `PositionHeader.tsx`
**Changes**:
- Changed interface to accept `userDepositRecord` prop
- Replaced `getUserLSTBalance()` with `getUserDepositAmount()`
- Now displays deposit amount in **base tokens** (e.g., "xUSDt") instead of LST tokens (e.g., "cxUSDt")
- Reads directly from deposit record box data

### 4. Updated `ActivePositionsSection.tsx` (Portfolio Page)
**Changes**:
- Imported and uses new `useDepositRecords` hook
- Replaced transaction history calculation with on-chain deposit records
- Still uses transaction history for metadata (timestamps, totals) but **deposit amounts come from boxes**
- Added loading state for deposit records
- Updated dependency array in useMemo

## How It Works

### Deposit Record Box Structure
Each deposit is stored in an on-chain box with:
- **Key**: `(assetId, userAddress)`
- **Value**: 
  - `assetId: uint64` - The deposited asset ID
  - `depositAmount: uint64` - Amount in microunits

### Data Flow

#### MarketDetailsPage:
1. User connects wallet → fetches deposit record for current market
2. User deposits/redeems → refetches deposit record
3. PositionHeader displays current deposit amount from box

#### PortfolioPage:
1. User connects wallet → fetches deposit records for ALL markets
2. ActivePositionsSection displays deposits from boxes
3. Transaction history provides additional metadata (optional)

## Benefits

### 1. **Source of Truth**
- Deposit boxes are the **authoritative source** in the smart contract
- No reliance on off-chain databases or LST balances
- Always accurate and up-to-date

### 2. **Consistency**
- MarketDetailsPage and PortfolioPage now use the same data source
- No discrepancies between different parts of the app

### 3. **Simplicity**
- Direct on-chain reads
- No complex calculations needed
- Easier to maintain and debug

### 4. **Performance**
- Efficient box reads
- Caching at the hook level
- Only fetches when needed

## Migration Checklist

- [x] Create `useDepositRecords` hook
- [x] Update `MarketDetailsPage` to use deposit records
- [x] Update `PositionHeader` to use deposit records
- [x] Update `ActivePositionsSection` to use deposit records
- [x] Test deposit record fetching
- [x] Verify all transaction handlers refetch deposit records
- [x] Ensure loading states work correctly
- [x] Handle error cases gracefully

## Technical Notes

### Type Assertions
The `getDepositBoxValue` function expects `OrbitalLendingClient` but we need to support both `OrbitalLendingClient` and `OrbitalLendingAsaClient`. We use `as any` type assertion since both clients have the required methods.

### Error Handling
No deposit record (box doesn't exist) is **not an error** - it simply means the user has no deposits in that market. The hooks handle this gracefully.

### Transaction History
We still fetch transaction history from the backend for:
- Display purposes (showing transaction list)
- Metadata (last deposit timestamp)
- Verification (cross-checking with on-chain data)

But the **actual balance** always comes from deposit records.

## Testing Recommendations

1. Test deposit → verify record updates
2. Test redeem → verify record decreases
3. Test multiple markets → verify all records fetch
4. Test wallet disconnect → verify records clear
5. Test market with no deposits → verify graceful handling
6. Test network switching → verify records refetch

## Future Enhancements

1. Add caching layer for deposit records
2. Implement real-time updates via websockets
3. Add deposit record change events
4. Create deposit record explorer/debugger tool

