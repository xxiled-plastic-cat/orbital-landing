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
  totalBorrows: number;
  availableToBorrow: number;
  isActive: boolean;
  baseTokenId?: string; // Base token asset ID
  lstTokenId?: string; // LST token asset ID
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
