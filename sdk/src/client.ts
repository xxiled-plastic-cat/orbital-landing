import algosdk from 'algosdk';
import {
  OrbitalSDKConfig,
  MarketData,
  APYData,
  LSTPrice,
  UserPosition,
  GlobalState,
} from './types';
import {
  currentAprBps,
  calculateLSTPrice,
  microToStandard,
} from './utils/calculations';
import {
  getApplicationGlobalState,
  getBoxValue,
  decodeDepositRecord,
  decodeLoanRecord,
  createDepositBoxName,
  createLoanBoxName,
} from './utils/state';

/**
 * Main SDK client for interacting with Orbital Finance
 */
export class OrbitalSDK {
  private algodClient: algosdk.Algodv2;
  private indexerClient?: algosdk.Indexer;
  private network: 'mainnet' | 'testnet';

  constructor(config: OrbitalSDKConfig) {
    this.algodClient = config.algodClient;
    this.indexerClient = config.indexerClient;
    this.network = config.network;
  }

  /**
   * Get comprehensive market data for a lending market
   * @param appId Application ID of the lending market
   * @returns Formatted market data
   */
  async getMarket(appId: number): Promise<MarketData> {
    const globalState = await getApplicationGlobalState(this.algodClient, appId);

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
    const globalState = await getApplicationGlobalState(this.algodClient, appId);

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
    const globalState = await getApplicationGlobalState(this.algodClient, appId);

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
  async getUserPosition(appId: number, userAddress: string): Promise<UserPosition> {
    const globalState = await getApplicationGlobalState(this.algodClient, appId);
    const baseTokenId = globalState.base_token_id || 0n;
    const lstTokenId = globalState.lst_token_id || 0n;
    
    const baseTokenDecimals = Number(baseTokenId) === 0 ? 6 : 6;

    // Fetch deposit record
    let depositAmount = 0n;
    try {
      const depositBoxName = createDepositBoxName(userAddress, baseTokenId);
      const depositBoxValue = await getBoxValue(this.algodClient, appId, depositBoxName);
      const depositRecord = decodeDepositRecord(depositBoxValue);
      depositAmount = depositRecord.depositAmount;
    } catch (error) {
      // Box doesn't exist or error fetching - user has no deposits
      console.debug('No deposit record found:', error);
    }

    // Fetch LST balance
    let lstBalance = 0n;
    try {
      const accountInfo = await this.algodClient.accountInformation(userAddress).do();
      const lstAsset = accountInfo.assets?.find(
        (a: { 'asset-id': number }) => a['asset-id'] === Number(lstTokenId)
      );
      lstBalance = BigInt(lstAsset?.amount || 0);
    } catch (error) {
      console.debug('Error fetching LST balance:', error);
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
      const loanBoxValue = await getBoxValue(this.algodClient, appId, loanBoxName);
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
      console.debug('No loan record found:', error);
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
    const healthFactor = borrowedStd > 0 ? maxBorrowValue / borrowedStd : Infinity;

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
  getNetwork(): 'mainnet' | 'testnet' {
    return this.network;
  }
}

