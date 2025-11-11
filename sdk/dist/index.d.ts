import algosdk from 'algosdk';

/**
 * SDK Configuration
 */
interface OrbitalSDKConfig {
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
interface MarketData {
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
interface APYData {
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
interface UserPosition {
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
interface LSTPrice {
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
interface GlobalState {
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
interface DepositRecord {
    assetId: bigint;
    depositAmount: bigint;
}
/**
 * Loan Record - User's loan/borrow information
 */
interface LoanRecord {
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
interface DebtPosition {
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
interface CollateralInfo {
    assetId: bigint;
    baseAssetId: bigint;
    marketBaseAssetId: bigint;
    totalCollateral: bigint;
    originatingAppId: bigint;
}
/**
 * Oracle Price - Price information from oracle contract
 */
interface OraclePrice {
    assetId: number;
    price: number;
    priceRaw: bigint;
    lastUpdated: number;
    lastUpdatedDate: Date;
}
/**
 * Oracle Price Map - Multiple prices indexed by asset ID
 */
type OraclePriceMap = Map<number, OraclePrice>;
/**
 * Market Info - Basic market information from backend API
 */
interface MarketInfo {
    appId: number;
    baseTokenId: number;
    lstTokenId: number;
    network: 'mainnet' | 'testnet';
}
/**
 * Asset Info - Asset metadata from Algorand blockchain
 */
interface AssetInfo {
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

/**
 * Main SDK client for interacting with Orbital Finance
 */
declare class OrbitalSDK {
    private algodClient;
    private network;
    private apiBaseUrl;
    constructor(config: OrbitalSDKConfig);
    /**
     * Get comprehensive market data for a lending market
     * @param appId Application ID of the lending market
     * @returns Formatted market data
     */
    getMarket(appId: number): Promise<MarketData>;
    /**
     * Get current APY for a market
     * @param appId Application ID of the lending market
     * @returns Supply and borrow APYs
     */
    getAPY(appId: number): Promise<APYData>;
    /**
     * Get LST token price in terms of underlying asset
     * @param appId Application ID of the lending market
     * @returns LST price information
     */
    getLSTPrice(appId: number): Promise<LSTPrice>;
    /**
     * Get user's position in a market
     * @param appId Application ID of the lending market
     * @param userAddress User's Algorand address
     * @returns User position data
     */
    getUserPosition(appId: number, userAddress: string): Promise<UserPosition>;
    /**
     * Get raw global state from a market contract
     * @param appId Application ID of the lending market
     * @returns Raw global state
     */
    getGlobalState(appId: number): Promise<GlobalState>;
    /**
     * Get the network type being used
     * @returns Network type ('mainnet' or 'testnet')
     */
    getNetwork(): "mainnet" | "testnet";
    /**
     * Get multiple markets in parallel
     * @param appIds Array of market application IDs
     * @returns Array of market data
     */
    getMarkets(appIds: number[]): Promise<MarketData[]>;
    /**
     * Get all markets for the current network from the backend API
     * This fetches the market list from Orbital's API and then retrieves on-chain data
     * @returns Array of all available markets
     */
    getAllMarkets(): Promise<MarketData[]>;
    /**
     * Get market list (basic info) from backend API without fetching on-chain data
     * This is faster than getAllMarkets() if you only need market IDs and token IDs
     * @returns Array of basic market information
     */
    getMarketList(): Promise<MarketInfo[]>;
    /**
     * Get price for a single asset from oracle contract
     * @param oracleAppId Oracle application ID
     * @param assetId Asset ID to get price for
     * @returns Oracle price data
     */
    getOraclePrice(oracleAppId: number, assetId: number): Promise<OraclePrice>;
    /**
     * Get prices for multiple assets from oracle contract
     * @param oracleAppId Oracle application ID
     * @param assetIds Array of asset IDs to get prices for
     * @returns Map of asset ID to oracle price data
     */
    getOraclePrices(oracleAppId: number, assetIds: number[]): Promise<OraclePriceMap>;
    /**
     * Get asset information from Algorand blockchain
     * @param assetId Asset ID to get info for (use 0 for ALGO)
     * @returns Asset information
     */
    getAssetInfo(assetId: number): Promise<AssetInfo>;
    /**
     * Get information for multiple assets in parallel
     * @param assetIds Array of asset IDs to get info for
     * @returns Array of asset information
     */
    getAssetsInfo(assetIds: number[]): Promise<AssetInfo[]>;
    /**
     * Get all loan records for a specific market
     * @param appId Market application ID
     * @returns Array of loan records
     */
    getMarketLoanRecords(appId: number): Promise<LoanRecord[]>;
    /**
     * Get all debt positions across multiple markets
     * @param marketAppIds Array of market application IDs
     * @returns Array of debt positions with calculated metrics
     */
    getAllDebtPositions(marketAppIds: number[]): Promise<DebtPosition[]>;
    /**
     * Get all debt positions across all markets from backend API
     * This is a convenience method that fetches the market list and then gets all positions
     * @returns Array of all debt positions
     */
    getAllDebtPositionsFromAllMarkets(): Promise<DebtPosition[]>;
}

/**
 * Utility functions for APY and LST calculations
 */
/**
 * Calculate normalized utilization in basis points (0-10000)
 * @param totalDeposits Total deposits in the market
 * @param totalBorrows Total borrows in the market
 * @param utilCapBps Utilization cap in basis points
 * @returns Normalized utilization in basis points
 */
declare function utilNormBps(totalDeposits: bigint, totalBorrows: bigint, utilCapBps: bigint): bigint;
/**
 * Calculate APR using kinked interest rate model
 * @param U_norm_bps Normalized utilization in basis points
 * @param params Interest rate model parameters
 * @returns APR in basis points
 */
declare function aprBpsKinked(U_norm_bps: bigint, params: {
    base_bps: bigint;
    kink_norm_bps: bigint;
    slope1_bps: bigint;
    slope2_bps: bigint;
    max_apr_bps: bigint;
}): bigint;
/**
 * Calculate current APR for a market
 * @param state Market state parameters
 * @returns Object with APR in basis points and utilization
 */
declare function currentAprBps(state: {
    totalDeposits: bigint;
    totalBorrows: bigint;
    base_bps: bigint;
    util_cap_bps: bigint;
    kink_norm_bps: bigint;
    slope1_bps: bigint;
    slope2_bps: bigint;
    max_apr_bps: bigint;
    rate_model_type: bigint;
}): {
    apr_bps: bigint;
    util_norm_bps: bigint;
};
/**
 * Calculate the amount of LST tokens due when making a deposit
 * @param amountIn The deposit amount in microunits
 * @param circulatingLST Total circulating LST tokens in microunits
 * @param totalDeposits Total deposits in the pool in microunits
 * @returns Amount of LST tokens to mint for the depositor in microunits
 */
declare function calculateLSTDue(amountIn: bigint, circulatingLST: bigint, totalDeposits: bigint): bigint;
/**
 * Calculate the amount of underlying asset to return when redeeming LST tokens
 * @param lstAmount The amount of LST tokens being redeemed in microunits
 * @param circulatingLST Total circulating LST tokens in microunits
 * @param totalDeposits Total deposits in the pool in microunits
 * @returns Amount of underlying asset to return to the redeemer in microunits
 */
declare function calculateAssetDue(lstAmount: bigint, circulatingLST: bigint, totalDeposits: bigint): bigint;
/**
 * Calculate LST price (how much underlying asset 1 LST is worth)
 * @param circulatingLST Total circulating LST tokens
 * @param totalDeposits Total deposits in the pool
 * @returns Exchange rate (totalDeposits / circulatingLST)
 */
declare function calculateLSTPrice(circulatingLST: bigint, totalDeposits: bigint): number;
/**
 * Convert microunits to standard units with decimals
 * @param amount Amount in microunits (bigint)
 * @param decimals Number of decimals
 * @returns Amount in standard units (number)
 */
declare function microToStandard(amount: bigint, decimals: number): number;
/**
 * Convert standard units to microunits
 * @param amount Amount in standard units (number)
 * @param decimals Number of decimals
 * @returns Amount in microunits (bigint)
 */
declare function standardToMicro(amount: number, decimals: number): bigint;

/**
 * Fetch and parse global state from an Algorand application
 * @param algodClient Algod client instance
 * @param appId Application ID
 * @returns Parsed global state
 */
declare function getApplicationGlobalState(algodClient: algosdk.Algodv2, appId: number): Promise<GlobalState>;
/**
 * Fetch box value from an Algorand application
 * @param algodClient Algod client instance
 * @param appId Application ID
 * @param boxName Box name as Uint8Array
 * @returns Box value as Uint8Array
 */
declare function getBoxValue(algodClient: algosdk.Algodv2, appId: number, boxName: Uint8Array): Promise<Uint8Array>;
/**
 * Decode deposit record box
 * @param boxValue Raw box value
 * @returns Decoded deposit record
 */
declare function decodeDepositRecord(boxValue: Uint8Array): {
    assetId: bigint;
    depositAmount: bigint;
};
/**
 * Decode loan record box
 * @param boxValue Raw box value
 * @returns Decoded loan record
 */
declare function decodeLoanRecord(boxValue: Uint8Array): {
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
};
/**
 * Create deposit record box name
 * @param userAddress User's Algorand address
 * @param assetId Asset ID
 * @returns Box name as Uint8Array
 */
declare function createDepositBoxName(userAddress: string, assetId: bigint): Uint8Array;
/**
 * Create loan record box name
 * @param userAddress User's Algorand address
 * @returns Box name as Uint8Array
 */
declare function createLoanBoxName(userAddress: string): Uint8Array;
/**
 * Decode oracle price box
 * @param boxValue Raw box value
 * @returns Decoded oracle price data
 */
declare function decodeOraclePrice(boxValue: Uint8Array): {
    assetId: bigint;
    price: bigint;
    lastUpdated: bigint;
};
/**
 * Create oracle price box name
 * @param assetId Asset ID to get price for
 * @returns Box name as Uint8Array
 */
declare function createOraclePriceBoxName(assetId: number): Uint8Array;

/**
 * API utilities for fetching data from Orbital backend
 */

/**
 * Fetch market list from Orbital backend API
 * @param network Network to filter by
 * @param apiBaseUrl Optional API base URL (defaults to production)
 * @returns Array of market info
 */
declare function fetchMarketList(network: 'mainnet' | 'testnet', apiBaseUrl?: string): Promise<MarketInfo[]>;
/**
 * Fetch single market info from backend API
 * @param appId Market application ID
 * @param apiBaseUrl Optional API base URL
 * @returns Market info
 */
declare function fetchMarketInfo(appId: number, apiBaseUrl?: string): Promise<MarketInfo>;

export { type APYData, type AssetInfo, type CollateralInfo, type DebtPosition, type DepositRecord, type GlobalState, type LSTPrice, type LoanRecord, type MarketData, type MarketInfo, type OraclePrice, type OraclePriceMap, OrbitalSDK, type OrbitalSDKConfig, type UserPosition, aprBpsKinked, calculateAssetDue, calculateLSTDue, calculateLSTPrice, createDepositBoxName, createLoanBoxName, createOraclePriceBoxName, currentAprBps, decodeDepositRecord, decodeLoanRecord, decodeOraclePrice, fetchMarketInfo, fetchMarketList, getApplicationGlobalState, getBoxValue, microToStandard, standardToMicro, utilNormBps };
