import algosdk from "algosdk";
import {
  OrbitalSDKConfig,
  MarketData,
  APYData,
  LSTPrice,
  UserPosition,
  GlobalState,
  OraclePrice,
  OraclePriceMap,
  MarketInfo,
  AssetInfo,
  LoanRecord,
  DebtPosition,
} from "./types";
import {
  currentAprBps,
  calculateLSTPrice,
  microToStandard,
} from "./utils/calculations";
import {
  getApplicationGlobalState,
  getBoxValue,
  decodeDepositRecord,
  decodeLoanRecord,
  createDepositBoxName,
  createLoanBoxName,
  decodeOraclePrice,
  createOraclePriceBoxName,
} from "./utils/state";
import { fetchMarketList } from "./utils/api";

/**
 * Main SDK client for interacting with Orbital Finance
 */
export class OrbitalSDK {
  private algodClient: algosdk.Algodv2;
  private indexerClient?: algosdk.Indexer;
  private network: "mainnet" | "testnet";
  private apiBaseUrl: string;

  constructor(config: OrbitalSDKConfig) {
    this.algodClient = config.algodClient;
    this.indexerClient = config.indexerClient;
    this.network = config.network;
    this.apiBaseUrl = config.apiBaseUrl || "https://api.orbitalfinance.io";
  }

  /**
   * Get comprehensive market data for a lending market
   * @param appId Application ID of the lending market
   * @returns Formatted market data
   */
  async getMarket(appId: number): Promise<MarketData> {
    const globalState = await getApplicationGlobalState(
      this.algodClient,
      appId
    );

    // Extract values from global state
    const baseTokenId = Number(globalState.base_token_id || 0n);
    const lstTokenId = Number(globalState.lst_token_id || 0n);
    const oracleAppId = Number(globalState.oracle_app || 0n);
    const buyoutTokenId = Number(globalState.buyout_token_id || 0n);

    const totalDeposits = globalState.total_deposits || 0n;
    const totalBorrows = globalState.total_borrows || 0n;
    const circulatingLST = globalState.circulating_lst || 0n;
    const borrowIndexWad = globalState.borrow_index_wad || 0n;
    const lastUpdate = Number(globalState.last_update || 0n);

    // Interest rate model parameters
    const baseBps = globalState.base_bps || 200n;
    const utilCapBps = globalState.util_cap_bps || 10000n;
    const kinkNormBps = globalState.kink_norm_bps || 5000n;
    const slope1Bps = globalState.slope1_bps || 1000n;
    const slope2Bps = globalState.slope2_bps || 4000n;
    const maxAprBps = globalState.max_apr_bps || 60000n;
    const rateModelType = globalState.rate_model_type || 0n;

    // Fees and risk parameters
    const protocolShareBps = globalState.protocol_share_bps || 500n;
    const originationFeeBps = globalState.origination_fee_bps || 0n;
    const liqBonusBps = globalState.liq_bonus_bps || 750n;
    const contractState = Number(globalState.contract_state || 1n);

    // Determine decimals based on asset type
    // ALGO (0) has 6 decimals, most ASAs have 6 decimals
    // TODO: Fetch from asset info for accuracy
    const baseTokenDecimals = baseTokenId === 0 ? 6 : 6;
    const lstTokenDecimals = baseTokenDecimals;

    // Calculate APY
    const aprData = currentAprBps({
      totalDeposits,
      totalBorrows,
      base_bps: baseBps,
      util_cap_bps: utilCapBps,
      kink_norm_bps: kinkNormBps,
      slope1_bps: slope1Bps,
      slope2_bps: slope2Bps,
      max_apr_bps: maxAprBps,
      rate_model_type: rateModelType,
    });

    const borrowAprBps = aprData.apr_bps;
    const utilNormBps = aprData.util_norm_bps;

    // Convert APR from basis points to percentage
    const borrowApy = Number(borrowAprBps) / 100;

    // Calculate supply APY: borrowAPR * utilization * (1 - protocolFee)
    const utilizationRate = Number(utilNormBps) / 100; // 0-100
    const netUtilization = utilizationRate / 100; // 0-1
    const feeMultiplier = 1 - Number(protocolShareBps) / 10000;
    const supplyApy = borrowApy * netUtilization * feeMultiplier;

    // Calculate available to borrow
    const capBorrow = (Number(totalDeposits) * Number(utilCapBps)) / 10000;
    const currentBorrows = Number(totalBorrows);
    const availableToBorrow = Math.max(0, capBorrow - currentBorrows);

    // Convert to standard units
    const totalDepositsStd = microToStandard(totalDeposits, baseTokenDecimals);
    const totalBorrowsStd = microToStandard(totalBorrows, baseTokenDecimals);
    const availableToBorrowStd = microToStandard(
      BigInt(Math.floor(availableToBorrow)),
      baseTokenDecimals
    );
    const circulatingLSTStd = microToStandard(circulatingLST, lstTokenDecimals);

    // TODO: Fetch actual prices from oracle
    const baseTokenPrice = 1.0; // Placeholder

    return {
      appId,
      baseTokenId,
      lstTokenId,
      oracleAppId,
      buyoutTokenId,

      supplyApy,
      borrowApy,
      utilizationRate,

      totalDeposits: totalDepositsStd,
      totalBorrows: totalBorrowsStd,
      availableToBorrow: availableToBorrowStd,
      circulatingLST: circulatingLSTStd,

      baseTokenPrice,
      totalDepositsUSD: totalDepositsStd * baseTokenPrice,
      totalBorrowsUSD: totalBorrowsStd * baseTokenPrice,
      availableToBorrowUSD: availableToBorrowStd * baseTokenPrice,

      // Default LTV and liquidation threshold - should be fetched from contract
      ltv: 7500, // 75%
      liquidationThreshold: 8500, // 85%
      liqBonusBps: Number(liqBonusBps),
      originationFeeBps: Number(originationFeeBps),

      baseTokenDecimals,
      lstTokenDecimals,

      rateModel: {
        baseBps: Number(baseBps),
        utilCapBps: Number(utilCapBps),
        kinkNormBps: Number(kinkNormBps),
        slope1Bps: Number(slope1Bps),
        slope2Bps: Number(slope2Bps),
        maxAprBps: Number(maxAprBps),
        rateModelType: Number(rateModelType),
      },

      contractState,
      protocolShareBps: Number(protocolShareBps),
      borrowIndexWad,
      lastUpdateTimestamp: lastUpdate,
    };
  }

  /**
   * Get current APY for a market
   * @param appId Application ID of the lending market
   * @returns Supply and borrow APYs
   */
  async getAPY(appId: number): Promise<APYData> {
    const globalState = await getApplicationGlobalState(
      this.algodClient,
      appId
    );

    const totalDeposits = globalState.total_deposits || 0n;
    const totalBorrows = globalState.total_borrows || 0n;
    const baseBps = globalState.base_bps || 200n;
    const utilCapBps = globalState.util_cap_bps || 10000n;
    const kinkNormBps = globalState.kink_norm_bps || 5000n;
    const slope1Bps = globalState.slope1_bps || 1000n;
    const slope2Bps = globalState.slope2_bps || 4000n;
    const maxAprBps = globalState.max_apr_bps || 60000n;
    const rateModelType = globalState.rate_model_type || 0n;
    const protocolShareBps = globalState.protocol_share_bps || 500n;

    const aprData = currentAprBps({
      totalDeposits,
      totalBorrows,
      base_bps: baseBps,
      util_cap_bps: utilCapBps,
      kink_norm_bps: kinkNormBps,
      slope1_bps: slope1Bps,
      slope2_bps: slope2Bps,
      max_apr_bps: maxAprBps,
      rate_model_type: rateModelType,
    });

    const borrowApy = Number(aprData.apr_bps) / 100;
    const utilizationRate = Number(aprData.util_norm_bps) / 100;
    const netUtilization = utilizationRate / 100;
    const feeMultiplier = 1 - Number(protocolShareBps) / 10000;
    const supplyApy = borrowApy * netUtilization * feeMultiplier;

    return {
      supplyApy,
      borrowApy,
      utilizationRate,
      utilNormBps: Number(aprData.util_norm_bps),
    };
  }

  /**
   * Get LST token price in terms of underlying asset
   * @param appId Application ID of the lending market
   * @returns LST price information
   */
  async getLSTPrice(appId: number): Promise<LSTPrice> {
    const globalState = await getApplicationGlobalState(
      this.algodClient,
      appId
    );

    const totalDeposits = globalState.total_deposits || 0n;
    const circulatingLST = globalState.circulating_lst || 0n;

    const price = calculateLSTPrice(circulatingLST, totalDeposits);

    return {
      price,
      totalDeposits,
      circulatingLST,
      exchangeRate: price,
    };
  }

  /**
   * Get user's position in a market
   * @param appId Application ID of the lending market
   * @param userAddress User's Algorand address
   * @returns User position data
   */
  async getUserPosition(
    appId: number,
    userAddress: string
  ): Promise<UserPosition> {
    const globalState = await getApplicationGlobalState(
      this.algodClient,
      appId
    );
    const baseTokenId = globalState.base_token_id || 0n;
    const lstTokenId = globalState.lst_token_id || 0n;

    const baseTokenDecimals = Number(baseTokenId) === 0 ? 6 : 6;

    // Fetch deposit record
    let depositAmount = 0n;
    try {
      const depositBoxName = createDepositBoxName(userAddress, baseTokenId);
      const depositBoxValue = await getBoxValue(
        this.algodClient,
        appId,
        depositBoxName
      );
      const depositRecord = decodeDepositRecord(depositBoxValue);
      depositAmount = depositRecord.depositAmount;
    } catch (error) {
      // Box doesn't exist or error fetching - user has no deposits
      console.debug("No deposit record found:", error);
    }

    // Fetch LST balance
    let lstBalance = 0n;
    try {
      const accountInfo = await this.algodClient
        .accountInformation(userAddress)
        .do();
      const lstAsset = accountInfo.assets?.find(
        (a: { "asset-id": number }) => a["asset-id"] === Number(lstTokenId)
      );
      lstBalance = BigInt(lstAsset?.amount || 0);
    } catch (error) {
      console.debug("Error fetching LST balance:", error);
    }

    // Fetch loan record
    let borrowed = 0n;
    let collateral = 0n;
    let collateralAssetId = 0n;
    let userIndexWad = 0n;
    let principal = 0n;
    let lastDebtChange = 0;

    try {
      const loanBoxName = createLoanBoxName(userAddress);
      const loanBoxValue = await getBoxValue(
        this.algodClient,
        appId,
        loanBoxName
      );
      const loanRecord = decodeLoanRecord(loanBoxValue);

      collateralAssetId = loanRecord.collateralTokenId;
      collateral = loanRecord.collateralAmount;
      lastDebtChange = Number(loanRecord.lastDebtChange);
      principal = loanRecord.principal;
      userIndexWad = loanRecord.userIndexWad;

      // Calculate current debt with interest
      const currentBorrowIndex = globalState.borrow_index_wad || 0n;
      if (userIndexWad > 0n && currentBorrowIndex > 0n) {
        borrowed = (principal * currentBorrowIndex) / userIndexWad;
      } else {
        borrowed = principal;
      }
    } catch (error) {
      // Box doesn't exist or error fetching - user has no loan
      console.debug("No loan record found:", error);
    }

    // Convert to standard units
    const suppliedStd = microToStandard(depositAmount, baseTokenDecimals);
    const lstBalanceStd = microToStandard(lstBalance, baseTokenDecimals);
    const borrowedStd = microToStandard(borrowed, baseTokenDecimals);
    const collateralStd = microToStandard(collateral, baseTokenDecimals);

    // Calculate health factor (simplified - should use actual LTV and prices)
    const ltv = 0.75; // 75% - should be fetched from contract
    const collateralValue = collateralStd; // Should multiply by price
    const maxBorrowValue = collateralValue * ltv;
    const healthFactor =
      borrowedStd > 0 ? maxBorrowValue / borrowedStd : Infinity;

    return {
      address: userAddress,
      appId,
      supplied: suppliedStd,
      lstBalance: lstBalanceStd,
      borrowed: borrowedStd,
      collateral: collateralStd,
      collateralAssetId: Number(collateralAssetId),
      userIndexWad,
      principal,
      lastDebtChange,
      healthFactor,
      maxBorrow: maxBorrowValue,
      isLiquidatable: healthFactor < 1.0,
    };
  }

  /**
   * Get raw global state from a market contract
   * @param appId Application ID of the lending market
   * @returns Raw global state
   */
  async getGlobalState(appId: number): Promise<GlobalState> {
    return await getApplicationGlobalState(this.algodClient, appId);
  }

  /**
   * Get the network type being used
   * @returns Network type ('mainnet' or 'testnet')
   */
  getNetwork(): "mainnet" | "testnet" {
    return this.network;
  }

  /**
   * Get multiple markets in parallel
   * @param appIds Array of market application IDs
   * @returns Array of market data
   */
  async getMarkets(appIds: number[]): Promise<MarketData[]> {
    // Fetch all markets in parallel
    const marketPromises = appIds.map(async (appId) => {
      try {
        return await this.getMarket(appId);
      } catch (error) {
        console.warn(`Failed to fetch market ${appId}:`, error);
        return null;
      }
    });

    const results = await Promise.all(marketPromises);

    // Filter out failed fetches
    return results.filter((market): market is MarketData => market !== null);
  }

  /**
   * Get all markets for the current network from the backend API
   * This fetches the market list from Orbital's API and then retrieves on-chain data
   * @returns Array of all available markets
   */
  async getAllMarkets(): Promise<MarketData[]> {
    try {
      // 1. Fetch market list from backend API
      const marketInfos = await fetchMarketList(this.network, this.apiBaseUrl);

      console.log(`Found ${marketInfos.length} markets on ${this.network}`);

      // 2. Fetch on-chain data for each market in parallel
      const appIds = marketInfos.map((m) => m.appId);
      return await this.getMarkets(appIds);
    } catch (error) {
      console.error("Failed to fetch all markets:", error);
      throw new Error("Failed to fetch all markets");
    }
  }

  /**
   * Get market list (basic info) from backend API without fetching on-chain data
   * This is faster than getAllMarkets() if you only need market IDs and token IDs
   * @returns Array of basic market information
   */
  async getMarketList(): Promise<MarketInfo[]> {
    try {
      return await fetchMarketList(this.network, this.apiBaseUrl);
    } catch (error) {
      console.error("Failed to fetch market list:", error);
      throw new Error("Failed to fetch market list");
    }
  }

  /**
   * Get price for a single asset from oracle contract
   * @param oracleAppId Oracle application ID
   * @param assetId Asset ID to get price for
   * @returns Oracle price data
   */
  async getOraclePrice(
    oracleAppId: number,
    assetId: number
  ): Promise<OraclePrice> {
    try {
      const boxName = createOraclePriceBoxName(assetId);
      const boxValue = await getBoxValue(
        this.algodClient,
        oracleAppId,
        boxName
      );
      const decoded = decodeOraclePrice(boxValue);

      // Oracle stores prices with 6 decimals (e.g., 1.23 = 1230000)
      const price = Number(decoded.price) / 1e6;
      const lastUpdated = Number(decoded.lastUpdated);

      return {
        assetId,
        price,
        priceRaw: decoded.price,
        lastUpdated,
        lastUpdatedDate: new Date(lastUpdated * 1000),
      };
    } catch (error) {
      console.error(
        `Failed to fetch oracle price for asset ${assetId}:`,
        error
      );
      throw new Error(`Failed to fetch oracle price for asset ${assetId}`);
    }
  }

  /**
   * Get prices for multiple assets from oracle contract
   * @param oracleAppId Oracle application ID
   * @param assetIds Array of asset IDs to get prices for
   * @returns Map of asset ID to oracle price data
   */
  async getOraclePrices(
    oracleAppId: number,
    assetIds: number[]
  ): Promise<OraclePriceMap> {
    const priceMap = new Map<number, OraclePrice>();

    // Fetch prices in parallel
    const pricePromises = assetIds.map(async (assetId) => {
      try {
        const price = await this.getOraclePrice(oracleAppId, assetId);
        return { assetId, price };
      } catch (error) {
        console.warn(`Failed to fetch price for asset ${assetId}:`, error);
        return null;
      }
    });

    const results = await Promise.all(pricePromises);

    // Add successful results to map
    results.forEach((result) => {
      if (result) {
        priceMap.set(result.assetId, result.price);
      }
    });

    return priceMap;
  }

  /**
   * Get asset information from Algorand blockchain
   * @param assetId Asset ID to get info for (use 0 for ALGO)
   * @returns Asset information
   */
  async getAssetInfo(assetId: number): Promise<AssetInfo> {
    try {
      // Special case for ALGO (asset ID 0)
      if (assetId === 0) {
        return {
          id: 0,
          name: "Algorand",
          unitName: "ALGO",
          decimals: 6,
          total: 10000000000000000n, // 10 billion ALGO
          frozen: false,
          creator: "",
          url: "https://algorand.com",
        };
      }

      // Fetch asset info from Algorand
      const assetInfo = await this.algodClient.getAssetByID(assetId).do();
      const params = assetInfo.params;

      return {
        id: assetId,
        name: params.name || "",
        unitName: params["unit-name"] || params.unitName || "",
        url: params.url,
        decimals: params.decimals,
        total: BigInt(params.total),
        frozen: params["default-frozen"] || params.defaultFrozen || false,
        creator: params.creator,
        manager: params.manager,
        reserve: params.reserve,
        freeze: params.freeze,
        clawback: params.clawback,
      };
    } catch (error) {
      console.error(`Failed to fetch asset info for ${assetId}:`, error);
      throw new Error(`Failed to fetch asset info for ${assetId}`);
    }
  }

  /**
   * Get information for multiple assets in parallel
   * @param assetIds Array of asset IDs to get info for
   * @returns Array of asset information
   */
  async getAssetsInfo(assetIds: number[]): Promise<AssetInfo[]> {
    // Fetch all assets in parallel
    const assetPromises = assetIds.map(async (assetId) => {
      try {
        return await this.getAssetInfo(assetId);
      } catch (error) {
        console.warn(`Failed to fetch asset info for ${assetId}:`, error);
        return null;
      }
    });

    const results = await Promise.all(assetPromises);

    // Filter out failed fetches
    return results.filter((asset): asset is AssetInfo => asset !== null);
  }

  /**
   * Get all loan records for a specific market
   * @param appId Market application ID
   * @returns Array of loan records
   */
  async getMarketLoanRecords(appId: number): Promise<LoanRecord[]> {
    try {
      // Get all boxes for the application
      const boxesResponse = await this.algodClient
        .getApplicationBoxes(appId)
        .do();
      const boxes = boxesResponse.boxes || [];

      const loanRecords: LoanRecord[] = [];
      const loanRecordPrefix = new TextEncoder().encode("loan_record");

      // Filter and fetch loan record boxes in parallel
      const loanBoxPromises = boxes
        .filter((box: { name: Uint8Array }) => {
          // Check if box name starts with 'loan_record' prefix
          const boxName = Buffer.from(box.name);
          const prefixBuffer = Buffer.from(loanRecordPrefix);
          return boxName.subarray(0, prefixBuffer.length).equals(prefixBuffer);
        })
        .map(async (box: { name: Uint8Array }) => {
          try {
            const boxValue = await getBoxValue(
              this.algodClient,
              appId,
              box.name
            );
            const decoded = decodeLoanRecord(boxValue);

            // Skip empty or zero principal records
            if (!decoded.principal || decoded.principal === 0n) {
              return null;
            }

            return decoded;
          } catch (error) {
            console.warn(`Failed to decode loan record box:`, error);
            return null;
          }
        });

      const results = await Promise.all(loanBoxPromises);

      // Filter out null values
      results.forEach((record) => {
        if (record) {
          loanRecords.push(record);
        }
      });

      return loanRecords;
    } catch (error) {
      console.error(`Failed to fetch loan records for market ${appId}:`, error);
      throw new Error(`Failed to fetch loan records for market ${appId}`);
    }
  }

  /**
   * Get all debt positions across multiple markets
   * @param marketAppIds Array of market application IDs
   * @returns Array of debt positions with calculated metrics
   */
  async getAllDebtPositions(marketAppIds: number[]): Promise<DebtPosition[]> {
    const allPositions: DebtPosition[] = [];

    // Fetch loan records for all markets in parallel
    const marketPromises = marketAppIds.map(async (appId) => {
      try {
        const loanRecords = await this.getMarketLoanRecords(appId);
        const marketData = await this.getMarket(appId);

        // Transform loan records to debt positions
        return loanRecords.map((record) => {
          // Calculate current debt with interest
          const currentBorrowIndex = marketData.borrowIndexWad;
          let totalDebt = Number(record.principal);

          if (record.userIndexWad > 0n && currentBorrowIndex > 0n) {
            totalDebt = Number(
              (record.principal * currentBorrowIndex) / record.userIndexWad
            );
          }

          // Convert to standard units
          const principal = microToStandard(
            record.principal,
            marketData.baseTokenDecimals
          );
          const totalDebtStd = microToStandard(
            BigInt(Math.floor(totalDebt)),
            marketData.baseTokenDecimals
          );
          const collateralAmount = microToStandard(
            record.collateralAmount,
            marketData.baseTokenDecimals
          );

          // Calculate health ratio (simplified - would need oracle prices for accurate calculation)
          // healthRatio = collateralValue / debtValue
          // For now, using token amounts as proxy
          const healthRatio =
            collateralAmount > 0 && totalDebtStd > 0
              ? collateralAmount / totalDebtStd
              : Infinity;

          const position: DebtPosition = {
            id: `${record.borrowerAddress}-${appId}`,
            marketId: appId,
            borrowerAddress: record.borrowerAddress,
            collateralTokenId: Number(record.collateralTokenId),
            collateralAmount,
            borrowedTokenId: Number(record.borrowedTokenId),
            principal,
            totalDebt: totalDebtStd,
            userIndexWad: record.userIndexWad,
            healthRatio,
            liquidationThreshold: marketData.liquidationThreshold / 10000, // Convert from bps
            lastUpdated: new Date(
              Number(record.lastDebtChange.timestamp) * 1000
            ),
          };

          return position;
        });
      } catch (error) {
        console.warn(
          `Failed to fetch debt positions for market ${appId}:`,
          error
        );
        return [];
      }
    });

    const results = await Promise.all(marketPromises);

    // Flatten results
    results.forEach((positions) => {
      allPositions.push(...positions);
    });

    return allPositions;
  }

  /**
   * Get all debt positions across all markets from backend API
   * This is a convenience method that fetches the market list and then gets all positions
   * @returns Array of all debt positions
   */
  async getAllDebtPositionsFromAllMarkets(): Promise<DebtPosition[]> {
    try {
      const marketList = await this.getMarketList();
      const marketAppIds = marketList.map((m) => m.appId);
      return await this.getAllDebtPositions(marketAppIds);
    } catch (error) {
      console.error("Failed to fetch all debt positions:", error);
      throw new Error("Failed to fetch all debt positions");
    }
  }
}
