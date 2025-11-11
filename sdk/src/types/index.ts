import algosdk from 'algosdk';

/**
 * SDK Configuration
 */
export interface OrbitalSDKConfig {
  /** Algod client for interacting with Algorand */
  algodClient: algosdk.Algodv2;
  /** Network type - mainnet or testnet */
  network: 'mainnet' | 'testnet';
  /** Optional indexer client for historical data queries */
  indexerClient?: algosdk.Indexer;
  /** Optional API base URL for Orbital backend (defaults to production API) */
  apiBaseUrl?: string;
}

/**
 * Market Data - Comprehensive information about a lending market
 */
export interface MarketData {
  /** Application ID of the lending market */
  appId: number;
  /** Base asset ID (e.g., ALGO = 0, USDC = 31566704) */
  baseTokenId: number;
  /** LST (Liquid Staking Token) asset ID */
  lstTokenId: number;
  /** Oracle application ID for price feeds */
  oracleAppId: number;
  /** Buyout token asset ID (typically xUSD) */
  buyoutTokenId: number;
  
  /** Supply APY as a percentage (e.g., 5.25 = 5.25%) */
  supplyApy: number;
  /** Borrow APY as a percentage (e.g., 12.5 = 12.5%) */
  borrowApy: number;
  /** Utilization rate as a percentage (0-100) */
  utilizationRate: number;
  
  /** Total deposits in base token units (with decimals) */
  totalDeposits: number;
  /** Total borrows in base token units (with decimals) */
  totalBorrows: number;
  /** Available liquidity to borrow in base token units */
  availableToBorrow: number;
  /** Circulating LST tokens */
  circulatingLST: number;
  
  /** Base token price in USD */
  baseTokenPrice: number;
  /** Total deposits in USD */
  totalDepositsUSD: number;
  /** Total borrows in USD */
  totalBorrowsUSD: number;
  /** Available liquidity in USD */
  availableToBorrowUSD: number;
  
  /** Loan-to-value ratio (e.g., 7500 = 75%) */
  ltv: number;
  /** Liquidation threshold (e.g., 8500 = 85%) */
  liquidationThreshold: number;
  /** Liquidation bonus in basis points (e.g., 750 = 7.5%) */
  liqBonusBps: number;
  /** Origination fee in basis points */
  originationFeeBps: number;
  
  /** Number of decimals for base token */
  baseTokenDecimals: number;
  /** Number of decimals for LST token */
  lstTokenDecimals: number;
  
  /** Interest rate model parameters */
  rateModel: {
    /** Base APR in basis points */
    baseBps: number;
    /** Utilization cap in basis points */
    utilCapBps: number;
    /** Kink point in basis points */
    kinkNormBps: number;
    /** Slope before kink */
    slope1Bps: number;
    /** Slope after kink */
    slope2Bps: number;
    /** Maximum APR cap in basis points */
    maxAprBps: number;
    /** Rate model type (0=kinked, 1=fixed) */
    rateModelType: number;
  };
  
  /** Contract state (0=inactive, 1=active, 2=migrating) */
  contractState: number;
  /** Protocol fee share in basis points */
  protocolShareBps: number;
  /** Current borrow index (WAD format) */
  borrowIndexWad: bigint;
  /** Last update timestamp */
  lastUpdateTimestamp: number;
}

/**
 * APY Data - Supply and borrow annual percentage yields
 */
export interface APYData {
  /** Supply APY as a percentage */
  supplyApy: number;
  /** Borrow APY as a percentage */
  borrowApy: number;
  /** Utilization rate used in calculation */
  utilizationRate: number;
  /** Normalized utilization in basis points */
  utilNormBps: number;
}

/**
 * User Position - Information about a user's position in a market
 */
export interface UserPosition {
  /** User's Algorand address */
  address: string;
  /** Market app ID */
  appId: number;
  
  /** Supplied amount in base token units */
  supplied: number;
  /** LST tokens held */
  lstBalance: number;
  
  /** Borrowed amount in base token units */
  borrowed: number;
  /** Collateral amount */
  collateral: number;
  /** Collateral asset ID */
  collateralAssetId: number;
  
  /** User's borrow index (WAD format) */
  userIndexWad: bigint;
  /** Principal borrowed amount */
  principal: bigint;
  /** Last debt change timestamp */
  lastDebtChange: number;
  
  /** Current health factor (> 1 is healthy) */
  healthFactor: number;
  /** Maximum amount that can be borrowed */
  maxBorrow: number;
  /** Is position liquidatable */
  isLiquidatable: boolean;
}

/**
 * LST Price Info - Liquid Staking Token price information
 */
export interface LSTPrice {
  /** Price of 1 LST in terms of underlying asset */
  price: number;
  /** Total deposits backing LST */
  totalDeposits: bigint;
  /** Circulating LST supply */
  circulatingLST: bigint;
  /** Exchange rate (totalDeposits / circulatingLST) */
  exchangeRate: number;
}

/**
 * Global State - Raw global state from the contract
 */
export interface GlobalState {
  admin: string;
  oracle_app: bigint;
  buyout_token_id: bigint;
  lst_token_id: bigint;
  base_token_id: bigint;
  total_deposits: bigint;
  total_borrows: bigint;
  circulating_lst: bigint;
  borrow_index_wad: bigint;
  last_update: bigint;
  base_bps: bigint;
  util_cap_bps: bigint;
  kink_norm_bps: bigint;
  slope1_bps: bigint;
  slope2_bps: bigint;
  max_apr_bps: bigint;
  rate_model_type: bigint;
  protocol_share_bps: bigint;
  origination_fee_bps: bigint;
  liq_bonus_bps: bigint;
  contract_state: bigint;
  [key: string]: bigint | string | Uint8Array;
}

/**
 * Deposit Record - User's deposit information
 */
export interface DepositRecord {
  assetId: bigint;
  depositAmount: bigint;
}

/**
 * Loan Record - User's loan/borrow information
 */
export interface LoanRecord {
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
}

/**
 * Debt Position - Formatted debt position for marketplace
 */
export interface DebtPosition {
  /** Unique identifier (borrower + market) */
  id: string;
  /** Market app ID */
  marketId: number;
  /** Borrower's address */
  borrowerAddress: string;
  /** Collateral token ID */
  collateralTokenId: number;
  /** Collateral amount in tokens */
  collateralAmount: number;
  /** Borrowed (debt) token ID */
  borrowedTokenId: number;
  /** Principal debt amount */
  principal: number;
  /** Current total debt (with interest) */
  totalDebt: number;
  /** User's borrow index */
  userIndexWad: bigint;
  /** Health ratio (collateralValue / debtValue) */
  healthRatio: number;
  /** Liquidation threshold */
  liquidationThreshold: number;
  /** Last debt change timestamp */
  lastUpdated: Date;
}

/**
 * Collateral Info - Information about accepted collateral
 */
export interface CollateralInfo {
  assetId: bigint;
  baseAssetId: bigint;
  marketBaseAssetId: bigint;
  totalCollateral: bigint;
  originatingAppId: bigint;
}

/**
 * Oracle Price - Price information from oracle contract
 */
export interface OraclePrice {
  assetId: number;
  price: number;
  priceRaw: bigint;
  lastUpdated: number;
  lastUpdatedDate: Date;
}

/**
 * Oracle Price Map - Multiple prices indexed by asset ID
 */
export type OraclePriceMap = Map<number, OraclePrice>;

/**
 * Market Info - Basic market information from backend API
 */
export interface MarketInfo {
  appId: number;
  baseTokenId: number;
  lstTokenId: number;
  network: 'mainnet' | 'testnet';
}

/**
 * Asset Info - Asset metadata from Algorand blockchain
 */
export interface AssetInfo {
  /** Asset ID */
  id: number;
  /** Asset name */
  name: string;
  /** Asset unit name (symbol) */
  unitName: string;
  /** Asset URL */
  url?: string;
  /** Number of decimals */
  decimals: number;
  /** Total supply */
  total: bigint;
  /** Is the asset frozen */
  frozen: boolean;
  /** Creator address */
  creator: string;
  /** Manager address */
  manager?: string;
  /** Reserve address */
  reserve?: string;
  /** Freeze address */
  freeze?: string;
  /** Clawback address */
  clawback?: string;
}

