# Liquidation Documentation & UI Update

## Summary
Updated the Orbital Lending Protocol documentation and frontend to reflect the finalized liquidation logic, including partial liquidations, safety guards, refunds, and the buyout mechanism.

## Changes Made

### 1. Documentation Updates (`frontend/src/components/docs/LiquidationsSection.tsx`)

#### A. Updated Introduction
- Added support for both **full** and **partial liquidations**
- Clarified that partial liquidations can repay up to the close factor (typically 50% of debt)
- More capital efficient for liquidators, less punishing for borrowers

#### B. Enhanced Smart Contract Mechanics Section
Restructured the liquidation flow into **5 detailed steps**:

**STEP 1: Trigger Checks**
- Verifies loan exists with positive debt
- Confirms repayment amount is positive and within close factor
- Checks collateral ratio (CR) is at or below liquidation threshold using real-time oracle prices
- Validates debt > 0 and loan record exists

**STEP 2: Value Math**
- Pulls current oracle prices
- Translates repayment amount to USD
- Applies liquidation bonus (e.g., 5-10%)
- Computes USD value of collateral to seize
- Converts between USD, underlying value, and LST units
- Ensures seize amount doesn't exceed borrower's balance

**STEP 3: Safety Guard**
- Only blocks partial liquidations when seizure would wipe entire collateral yet still leave debt
- Critical check prevents "all collateral gone but debt remains" scenarios
- Allows smaller partial liquidations to proceed normally
- Implements `FULL_REPAY_REQUIRED` error when necessary

**STEP 4: State Updates**
- Inner transaction transfers seized LST to liquidator
- Automatic refund of excess repayment:
  - ASA markets: Refund via axfer (asset transfer)
  - ALGO markets: Refund via payment transaction
- Updates borrower's loan record (debt, collateral)
- Updates total borrows and market cash tallies
- If debt hits zero:
  - Returns remaining collateral to borrower
  - Deletes loan record

**STEP 5: Market State Update**
- Updates collateral totals
- Reduces total borrows
- Increases cash reserves from repayment

#### C. Added Buyout Branch Documentation
- For healthy positions above liquidation threshold
- Requires CR > liq_threshold_bps
- Third party repays full debt and pays premium
- Premium split between protocol and original borrower
- Uses `buyoutSplitAlgo` / `buyoutSplitASA` methods

#### D. New Front-End Liquidation Interface Section
Comprehensive 5-step guide for liquidators:

**1. Surface Eligibility**
- Marketplace auto-fetches `getLoanStatus` for each position
- Displays CR, health ratio, liquidation threshold
- Shows `eligibleForLiquidation` flag
- Visual indicators for liquidation zone

**2. Prep Data & Calculations**
- Fetches borrower's `LoanRecord` (box read)
- Collateral metadata (token IDs, decimals, prices)
- Real-time oracle prices
- Protocol constants (liqBonusBps, liqThresholdBps, close factor)
- Max partial repay calculation (50% of live debt)
- Estimated seized collateral via `computePartialLiquidationOutcome`

**3. User Input & Preview**
- Partial vs full repayment toggle
- Quick preset buttons (25%, 50%, 100% of max)
- Live preview of seized collateral
- Profit/bonus calculation
- Warnings if amount would seize all collateral
- Display of expected refunds
- Bad debt protection: Auto-locks to full repayment when debt exceeds collateral

**4. Transaction Assembly**
- Asset opt-in transaction for collateral token
- Base-token payment (ALGO payment or ASA transfer)
- Liquidation app call with:
  - Borrower's address
  - Oracle app ID and LST app ID references
  - Collateral box names
  - Asset and app references
- Gas transaction for ALGO markets (localnet)
- Atomic transaction group

**5. Submission & Feedback**
- Submit to Algorand network
- Real-time status updates
- Post-confirmation refresh of loan state
- Display updated balances
- Success summary:
  - Debt repaid amount
  - Collateral seized (with bonus)
  - Refunds received
  - Net profit/loss

#### E. Safety UX Considerations
Added comprehensive warnings for:
- **Asset Opt-In**: Auto-handled by UI
- **Refunds**: ASA markets refund base tokens, ALGO markets use payment
- **Oracle Updates**: Manager role may need to update prices in test environments
- **Multiple Rounds**: Partial liquidations may require multiple transactions
- **Gas Fees**: All Algorand transaction fees displayed before confirmation

#### F. Updated Example Scenarios
Added side-by-side comparison:

**Option A: Partial Liquidation (50% close factor)**
- Liquidator pays 50% of debt
- Receives proportional collateral + 5% bonus
- Borrower retains remaining collateral and debt
- Position may still be at risk (requires monitoring)

**Option B: Full Liquidation**
- Liquidator pays 100% of debt
- Receives all collateral
- Borrower loses entire collateral
- Debt fully cleared
- Higher liquidation penalty for borrower

### 2. UI Components (Already Implemented)

#### Verified Working Components:

**`LiquidationActionPanel.tsx`**
- ✅ Displays live debt and max repayment
- ✅ Input for partial vs full liquidation amounts
- ✅ Bad debt scenario detection and forced full repayment
- ✅ Live calculation of seized collateral
- ✅ Profit/loss preview
- ✅ Warnings for near-collateral-limit scenarios
- ✅ Smart liquidation process explanation

**`DebtPositionCard.tsx`**
- ✅ Health status indicators (HEALTHY, NEAR LIQUIDATION, LIQUIDATION ZONE)
- ✅ Color-coded badges (green, amber, red)
- ✅ Displays health ratio and liquidation threshold
- ✅ Shows collateral and debt values

**`DebtPositionDetailPage.tsx`**
- ✅ Full liquidation transaction logic
- ✅ Partial liquidation with auto-retry on failure
- ✅ Handles both ALGO and ASA markets
- ✅ Proper error handling and user feedback
- ✅ Asset opt-in management

**`MarketplacePage.tsx`**
- ✅ Lists all debt positions
- ✅ Sortable by health ratio
- ✅ Search/filter functionality
- ✅ Grid and table view modes

### 3. Contract Integration

#### Verified Contract Methods:
- ✅ `liquidatePartialAlgo(debtor, paymentTxn, repayAmount, lstAppId)`
- ✅ `liquidatePartialASA(debtor, axferTxn, repayBaseAmount, lstAppId)`
- ✅ `buyoutSplitAlgo(...)` - for healthy positions
- ✅ `buyoutSplitASA(...)` - for healthy positions
- ✅ `getLoanStatus(borrower)` - returns eligibility flags

## Key Features Highlighted

### Partial Liquidations
- More capital efficient for liquidators
- Less punishing for borrowers (retain some collateral)
- Supports close factor (typically 50% max)
- May require multiple rounds for heavily underwater positions

### Safety Mechanisms
- Bad debt prevention (forces full repay when debt > collateral)
- Automatic refunds for excess payments
- Collateral exhaustion protection
- Oracle price verification

### User Experience
- Clear visual indicators for liquidation eligibility
- Real-time profit/bonus calculations
- Preset amount buttons for easy selection
- Comprehensive warnings and safety checks
- Automatic retry logic for edge cases

## Testing Recommendations

1. **Partial Liquidation Flow**
   - Test with amounts below close factor
   - Verify proportional collateral seizure
   - Confirm bonus calculations

2. **Full Liquidation Flow**
   - Test complete debt repayment
   - Verify all collateral transfer
   - Confirm loan record deletion

3. **Bad Debt Scenarios**
   - Test when debt exceeds collateral
   - Verify forced full repayment
   - Confirm UI locks input appropriately

4. **Refund Mechanisms**
   - Test excess payment refunds (ALGO markets)
   - Test excess payment refunds (ASA markets)
   - Verify refund amounts are accurate

5. **Edge Cases**
   - Near-collateral-limit scenarios
   - Multiple partial liquidations on same position
   - Oracle price staleness
   - Concurrent liquidation attempts

## Files Modified

1. `/frontend/src/components/docs/LiquidationsSection.tsx` - Complete rewrite of liquidation documentation
2. Created: `/LIQUIDATION_DOCS_UPDATE.md` - This summary document

## No Breaking Changes

All UI components were already properly implemented and aligned with the liquidation logic. No modifications to existing UI code were necessary.

## Next Steps

1. Review documentation on the Docs page (`/app/docs` → Liquidations section)
2. Test liquidation flows on testnet
3. Monitor for any edge cases during testing
4. Consider adding liquidation analytics/history page
5. Add notifications/alerts for positions approaching liquidation

---

**Status**: ✅ Complete
**Date**: 2025-10-27
**Author**: AI Assistant (Claude)

