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
