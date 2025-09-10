// Market data interface
export interface LendingMarket {
  id: string;
  name: string;
  symbol?: string;
  image?: string;
  ltv: number; // Loan-to-value ratio
  liquidationThreshold: number;
  supplyApr: number;
  borrowApr: number;
  utilizationRate: number;
  totalDeposits: number;
  totalDepositsUSD: number;
  totalBorrows: number;
  totalBorrowsUSD: number;
  availableToBorrow: number;
  availableToBorrowUSD: number;
  isActive: boolean;
  baseTokenId: string; // Base token asset ID
  lstTokenId: string; // LST token asset ID
  oracleAppId: number; // Oracle application ID
  baseTokenPrice: number; // Base token price
  circulatingLST: number; // Circulating LST tokens
  borrowIndexWad?: bigint; // Borrow index for interest calculations
  // Interest Rate Model Parameters
  baseBps?: number; // Base APR in basis points
  utilCapBps?: number; // Utilization cap in basis points
  kinkNormBps?: number; // Kink point in basis points
  slope1Bps?: number; // Slope before kink in basis points
  slope2Bps?: number; // Slope after kink in basis points
  maxAprBps?: number; // Maximum APR cap in basis points
  rateModelType?: number; // Rate model type (0=kinked, 1=linear, etc.)
}

// User position interface
export interface UserPosition {
  supplied: number;
  borrowed: number;
  collateralValue: number;
  healthFactor: number;
}

// Collateral relationships interface
export interface CollateralRelationships {
  [marketId: string]: {
    acceptsAsCollateral: string[];
    usableAsCollateralFor: string[];
  };
}

// Asset metadata from backend
export interface AssetMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  image?: string;
  verified?: boolean;
  total?: string;
  frozen?: boolean;
}

// User asset information
export interface UserAssetInfo {
  assetId: string;
  balance: string;
  isOptedIn: boolean;
  metadata?: AssetMetadata;
}

// User asset balance summary
export interface UserAssetSummary {
  algoBalance: string;
  assets: UserAssetInfo[];
}

// Loan record interfaces for debt marketplace
export interface LoanRecordData {
  borrowerAddress: string;
  collateralTokenId: bigint;
  collateralAmount: bigint;
  lastDebtChange: {
    amount: bigint;
    changeType: number;
    timestamp: bigint;
  };
  borrowedTokenId: bigint;
  principal: bigint;
  userIndexWad: bigint;
  marketId: string; // App ID of the lending market
  // Note: Other fields like collateralValueUSD, healthRatio, etc. are calculated in the transformation
}

// Transformed debt position for marketplace UI
export interface DebtPosition {
  id: string; // Unique identifier (borrower + market)
  debtToken: {
    symbol: string;
    name: string;
    id: string;
  };
  collateralToken: {
    symbol: string;
    name: string;
    id: string;
  };
  userAddress: string;
  totalDebt: number; // Debt amount in tokens
  totalDebtUSD: number; // Debt value in USD
  totalCollateral: number; // Collateral value in USD
  totalCollateralTokens: number; // Collateral amount in tokens
  healthRatio: number; // Higher is better (>1.5 healthy, 1.2-1.5 warning, <1.2 liquidation)
  liquidationThreshold: number;
  buyoutCost: number;
  liquidationBonus: number; // Percentage discount for liquidators
  marketId: string;
  lastUpdated: Date;
  liquidationPrice?: number; // Collateral price at which liquidation occurs
}
