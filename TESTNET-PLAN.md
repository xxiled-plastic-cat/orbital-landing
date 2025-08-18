# Orbital Lending Testnet App Implementation Plan

## Project Overview
Add a fully functional testnet implementation of Orbital Lending as a separate application while keeping the existing landing page completely intact. Users will navigate from the landing page to the testnet app via "Launch App" buttons. The testnet will allow users to interact with debt markets, create loans, and trade debt positions.

## Current State Analysis
- **Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Structure**: Single-page landing site with components
- **No Routing**: Currently uses anchor links for navigation
- **Launch App Buttons**: Present in Navbar and Hero components (currently link to `#launch-app`)
- **Goal**: Keep landing page completely unchanged, add routing to navigate to separate testnet app

---

## Phase 1: Routing Infrastructure

### 1.1 Add React Router
**Dependencies to Add:**
```json
{
  "react-router-dom": "^6.20.0",
  "@types/react-router-dom": "^5.3.3"
}
```

### 1.2 Route Structure
```
/                    - Landing page (current content)
/app                 - Main testnet application
/app/dashboard       - User dashboard with positions
/app/borrow          - Create new loan interface
/app/marketplace     - Browse and trade debt positions
/app/portfolio       - User's active positions
```

### 1.3 Implementation Tasks
- [ ] Install React Router dependencies
- [ ] Create `Router.tsx` with route definitions
- [ ] Update `App.tsx` to use routing while keeping landing page components intact
- [ ] Create `LandingPage.tsx` component containing all existing landing components
- [ ] Create `AppLayout.tsx` for testnet app pages (separate from landing)
- [ ] Update "Launch App" buttons to navigate to `/app` (currently link to `#launch-app`)
- [ ] Add navigation breadcrumbs for app pages only
- [ ] Ensure landing page (`/`) renders exactly as it currently does

---

## Phase 2: Wallet Integration

### 2.1 Add Wallet Dependencies
**Dependencies to Add:**
```json
{
  "@txnlab/use-wallet-react": "^3.0.0",
  "@algorandfoundation/algokit-utils": "^6.0.0",
  "algosdk": "^2.7.0"
}
```

### 2.2 Wallet Provider Setup
- [ ] Create `WalletProvider.tsx` wrapper component
- [ ] Configure supported wallet types (Pera, Defly, Exodus, etc.)
- [ ] Add testnet network configuration
- [ ] Implement wallet connection UI component
- [ ] Add wallet status indicator in app header

### 2.3 Wallet Integration Features
- [ ] Connect/disconnect wallet functionality
- [ ] Display wallet address and balance
- [ ] Network switching (testnet/mainnet)
- [ ] Transaction signing interface
- [ ] Error handling for wallet operations

---

## Phase 2.5: Testnet Faucet Integration

### 2.5.1 Faucet Requirements
**Essential for testnet functionality:**
- Users need test ALGO for transaction fees
- Users need test tokens for collateral (goETH, USDC equivalents)
- Simple one-click token distribution
- Rate limiting to prevent abuse

### 2.5.2 Faucet Implementation Options
**Option A: Built-in Faucet Component**
- [ ] Create `FaucetComponent.tsx` in app header/sidebar
- [ ] Integrate with Algorand testnet faucet API
- [ ] Add rate limiting (once per hour per wallet)
- [ ] Display current testnet balances

**Option B: External Faucet Integration**
- [ ] Link to existing Algorand testnet faucet
- [ ] Create custom faucet smart contract
- [ ] Deploy faucet with test token distribution
- [ ] Add faucet contract interaction methods

### 2.5.3 Faucet Features
- [ ] **ALGO Faucet**: Distribute test ALGO for transaction fees (10-50 ALGO per request)
- [ ] **Collateral Token Faucet**: Distribute test collateral tokens:
  - Test goETH (equivalent to Ethereum on testnet)
  - Test USDC (stablecoin equivalent)
  - Test other supported collateral assets
- [ ] **Rate Limiting**: Prevent spam (1 request per wallet per hour)
- [ ] **Balance Display**: Show current testnet token balances
- [ ] **Transaction History**: Track faucet distributions
- [ ] **Error Handling**: Handle failed distributions gracefully

### 2.5.4 Faucet UI Components
**Create `src/components/faucet/` directory:**
- [ ] `FaucetButton.tsx` - Quick access faucet button
- [ ] `FaucetModal.tsx` - Detailed faucet interface
- [ ] `TokenFaucet.tsx` - Individual token distribution
- [ ] `FaucetHistory.tsx` - Show recent distributions
- [ ] `BalanceDisplay.tsx` - Current testnet balances

### 2.5.5 Faucet Integration Tasks
- [ ] Research Algorand testnet faucet APIs
- [ ] Create faucet smart contract (if needed)
- [ ] Implement faucet UI components
- [ ] Add faucet to app header/dashboard
- [ ] Test rate limiting functionality
- [ ] Add faucet usage instructions
- [ ] Handle edge cases (network errors, insufficient faucet funds)

### 2.5.6 Faucet Smart Contract (Optional)
**If creating custom faucet:**
```python
# FaucetContract.py
- distribute_algo(recipient_address, amount)
- distribute_token(recipient_address, token_id, amount)
- check_rate_limit(recipient_address)
- get_faucet_balance(token_id)
- admin_refill_faucet(token_id, amount)
```

### 2.5.7 Faucet Configuration
**Environment Variables:**
```env
VITE_FAUCET_CONTRACT_ID=123456789
VITE_FAUCET_API_URL=https://testnet-api.algonode.cloud/faucet
VITE_FAUCET_RATE_LIMIT_HOURS=1
VITE_FAUCET_ALGO_AMOUNT=25
VITE_FAUCET_TOKEN_AMOUNTS={"goETH": 5, "USDC": 1000}
```

---

## Phase 3: Smart Contract Integration

### 3.1 Contract Architecture
**Core Contracts Needed:**
- `LendingPool.py` - Main lending logic
- `DebtPosition.py` - Debt position management
- `Marketplace.py` - Trading functionality
- `PriceOracle.py` - Asset pricing

### 3.2 Contract Methods Implementation
**Create `src/contracts/` directory with:**

#### 3.2.1 Lending Operations (`lendingContract.ts`)
```typescript
// Core lending functions
- createLoan(collateralAmount, borrowAmount, collateralAsset)
- repayLoan(positionId, repayAmount)
- liquidatePosition(positionId)
- calculateCollateralRatio(positionId)
```

#### 3.2.2 Marketplace Operations (`marketplaceContract.ts`)
```typescript
// Trading functions
- listPosition(positionId, askPrice)
- buyPosition(positionId, offerPrice)
- cancelListing(positionId)
- getMarketplaceListings()
```

#### 3.2.3 Position Management (`positionContract.ts`)
```typescript
// Position tracking
- getUserPositions(walletAddress)
- getPositionDetails(positionId)
- getPositionHealth(positionId)
- calculateLiquidationPrice(positionId)
```

### 3.3 Contract Integration Tasks
- [ ] Set up Algorand SDK integration
- [ ] Create contract interaction utilities
- [ ] Implement transaction building helpers
- [ ] Add contract address configuration
- [ ] Create mock contract responses for development
- [ ] Add transaction status tracking
- [ ] Implement error handling for contract calls

---

## Phase 4: Core UI Components

### 4.1 App Layout Components
**Create `src/components/app/` directory:**

#### 4.1.1 Layout Components
- [ ] `AppHeader.tsx` - Navigation with wallet connection
- [ ] `AppSidebar.tsx` - Navigation menu for app sections
- [ ] `AppLayout.tsx` - Main layout wrapper
- [ ] `LoadingSpinner.tsx` - Loading states
- [ ] `ErrorBoundary.tsx` - Error handling

#### 4.1.2 Wallet Components
- [ ] `WalletButton.tsx` - Connect/disconnect button
- [ ] `WalletModal.tsx` - Wallet selection modal
- [ ] `WalletInfo.tsx` - Display wallet details
- [ ] `NetworkSelector.tsx` - Switch between networks

### 4.2 Dashboard Components
**Create `src/components/dashboard/`:**
- [ ] `DashboardOverview.tsx` - Summary cards and stats
- [ ] `PositionsList.tsx` - User's active positions
- [ ] `RecentActivity.tsx` - Transaction history
- [ ] `HealthMetrics.tsx` - Portfolio health indicators

### 4.3 Borrowing Interface
**Create `src/components/borrow/`:**
- [ ] `BorrowForm.tsx` - Loan creation form
- [ ] `CollateralSelector.tsx` - Choose collateral asset
- [ ] `LoanCalculator.tsx` - Calculate loan terms
- [ ] `RiskIndicator.tsx` - Show liquidation risk
- [ ] `ConfirmBorrow.tsx` - Transaction confirmation

### 4.4 Marketplace Components
**Create `src/components/marketplace/`:**
- [ ] `MarketplaceGrid.tsx` - Browse available positions
- [ ] `PositionCard.tsx` - Individual position display
- [ ] `FilterBar.tsx` - Filter and sort options
- [ ] `BuyModal.tsx` - Purchase confirmation
- [ ] `PriceChart.tsx` - Position price history

---

## Phase 5: Page Implementation

### 5.1 App Pages
**Create `src/pages/` directory:**

#### 5.1.1 Main App Page (`AppPage.tsx`)
- [ ] Dashboard overview
- [ ] Quick actions (Borrow, Browse Marketplace)
- [ ] Portfolio summary
- [ ] Recent activity feed

#### 5.1.2 Borrow Page (`BorrowPage.tsx`)
- [ ] Collateral deposit interface
- [ ] Loan amount calculator
- [ ] Terms and conditions
- [ ] Risk warnings
- [ ] Transaction execution

#### 5.1.3 Marketplace Page (`MarketplacePage.tsx`)
- [ ] Position listings grid
- [ ] Search and filter functionality
- [ ] Sorting options (price, health, etc.)
- [ ] Position details modal
- [ ] Buy/sell interface

#### 5.1.4 Portfolio Page (`PortfolioPage.tsx`)
- [ ] Active positions list
- [ ] Position management actions
- [ ] Health monitoring
- [ ] Repayment interface
- [ ] Transaction history

### 5.2 Page Implementation Tasks
- [ ] Create page components with proper routing
- [ ] Implement responsive design
- [ ] Add loading states and error handling
- [ ] Integrate with contract methods
- [ ] Add proper SEO meta tags
- [ ] Implement breadcrumb navigation

---

## Phase 6: Data Management

### 6.1 State Management
**Choose between:**
- **Option A**: React Context + useReducer (simpler)
- **Option B**: Zustand (recommended for scalability)

### 6.2 Data Layer
**Create `src/store/` directory:**
- [ ] `walletStore.ts` - Wallet connection state
- [ ] `positionsStore.ts` - User positions data
- [ ] `marketplaceStore.ts` - Marketplace listings
- [ ] `transactionsStore.ts` - Transaction history

### 6.3 API Integration
**Create `src/api/` directory:**
- [ ] `algorand.ts` - Algorand network utilities
- [ ] `contracts.ts` - Contract interaction layer
- [ ] `pricing.ts` - Asset price fetching
- [ ] `indexer.ts` - Blockchain data queries

---

## Phase 7: Testing & Development Tools

### 7.1 Development Environment
- [ ] Add environment variables for testnet configuration
- [ ] Create mock data for development
- [ ] Set up local testnet connection
- [ ] Add development-only features (reset buttons, etc.)

### 7.2 Testing Setup
**Add Testing Dependencies:**
```json
{
  "@testing-library/react": "^13.4.0",
  "@testing-library/jest-dom": "^5.16.5",
  "vitest": "^0.34.0"
}
```

### 7.3 Testing Tasks
- [ ] Unit tests for contract interactions
- [ ] Component testing for UI elements
- [ ] Integration tests for user flows
- [ ] Mock wallet for testing
- [ ] E2E testing setup

---

## Phase 8: Deployment & Configuration

### 8.1 Build Configuration
- [ ] Update Vite config for routing
- [ ] Add environment-specific builds
- [ ] Configure asset optimization
- [ ] Set up source maps for debugging

### 8.2 Deployment Setup
- [ ] Configure testnet deployment
- [ ] Set up CI/CD pipeline
- [ ] Add deployment scripts
- [ ] Configure domain routing

---

## Implementation Timeline

### Week 1: Foundation
- Set up routing infrastructure
- Add wallet integration
- Create basic layout components

### Week 2: Core Functionality
- Implement contract methods
- Build borrowing interface
- Create dashboard components

### Week 3: Marketplace & Trading
- Implement marketplace functionality
- Add position management
- Create trading interfaces

### Week 4: Polish & Testing
- Add comprehensive testing
- Implement error handling
- Performance optimization
- Deployment preparation

---

## File Structure After Implementation

```
src/
├── components/
│   ├── (existing)           # Keep all current landing page components unchanged
│   ├── app/                # New app-specific components
│   │   ├── layout/         # Layout components for testnet app
│   │   ├── wallet/         # Wallet components
│   │   └── common/         # Shared app components
│   ├── dashboard/          # Dashboard components
│   ├── borrow/            # Borrowing interface
│   ├── marketplace/       # Marketplace components
│   └── faucet/            # Testnet faucet components
├── pages/                 # Page components
│   ├── LandingPage.tsx    # Wrapper for existing landing components
│   └── app/               # Testnet app pages
├── contracts/             # Smart contract interactions
├── store/                # State management
├── api/                  # API utilities
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
├── types/                # TypeScript definitions
└── constants/            # App constants
```

---

## Success Criteria

### Functional Requirements
- [ ] Users can connect Algorand wallets
- [ ] Users can obtain testnet tokens via integrated faucet
- [ ] Users can create loans with collateral
- [ ] Debt positions are automatically listed
- [ ] Users can buy/sell positions on marketplace
- [ ] Real-time position health monitoring
- [ ] Transaction history and portfolio tracking

### Technical Requirements
- [ ] Responsive design across all devices
- [ ] Fast loading times (<3s initial load)
- [ ] Proper error handling and user feedback
- [ ] Secure wallet integration
- [ ] Comprehensive testing coverage (>80%)

### User Experience Requirements
- [ ] Intuitive navigation between landing and app
- [ ] Clear onboarding for new users
- [ ] Helpful tooltips and explanations
- [ ] Smooth animations and transitions
- [ ] Accessible design (WCAG 2.1 AA)

---

## Next Steps

1. **Review and approve this plan** with the development team
2. **Set up development environment** with required dependencies
3. **Begin Phase 1** with routing infrastructure
4. **Establish regular check-ins** to track progress against timeline
5. **Prepare testnet contracts** for integration testing

This plan provides a comprehensive roadmap for implementing the testnet functionality while maintaining the existing landing page and ensuring a smooth user experience transition from marketing site to functional application.
