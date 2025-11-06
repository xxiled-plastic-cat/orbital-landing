import { OrbitalLendingMarket } from '../models/index.js';
import { getApplicationGlobalState, getTokenPriceFromOracle, getAssetInfo } from './algorandService.js';
import { currentAprBps } from '../utils/apyCalculations.js';

export async function getOrbitalLendingMarkets() {
  try {
    const markets = await OrbitalLendingMarket.findAll();
    return markets;
  } catch (error) {
    console.error('Error fetching orbital lending markets:', error);
    throw error;
  }
}

export async function getOrbitalLendingMarketById(id: string | number) {
  try {
    const market = await OrbitalLendingMarket.findByPk(id);
    if (!market) {
      throw new Error(`Orbital lending market with id ${id} not found`);
    }
    return market;
  } catch (error) {
    console.error('Error fetching orbital lending market by ID:', error);
    throw error;
  }
}

export async function addOrbitalLendingMarket(
  appId: number,
  baseTokenId: number,
  lstTokenId: number,
  network: 'mainnet' | 'testnet' = 'mainnet'
) {
  try {
    const marketData = {
      appId,
      baseTokenId,
      lstTokenId,
      network,
    };
    const market = await OrbitalLendingMarket.create(marketData);
    return market;
  } catch (error) {
    console.error('Error adding orbital lending market:', error);
    throw error;
  }
}

/**
 * Interface for enriched market data with on-chain metrics
 */
export interface EnrichedMarketData {
  appId: number;
  baseTokenId: number;
  baseTokenName: string;
  baseTokenSymbol: string;
  lstTokenId: number;
  network: string;
  supplyApy: number;
  borrowApy: number;
  tvl: number; // Total Value Locked in USD
  tvlBaseToken: string; // TVL in base token units (human-readable)
  totalDeposits: string; // in base token units
  totalBorrows: string; // in base token units
  utilizationRate: number; // percentage (0-100)
  availableToBorrow: string; // in base token units
  baseTokenPrice: number; // in USD
  totalBorrowsUSD: number;
  availableToBorrowUSD: number;
}

/**
 * Fetch enriched market data including on-chain state, APY, and TVL
 */
export async function getEnrichedMarketData(appId: number): Promise<EnrichedMarketData> {
  try {
    // 1. Get market from database
    const market = await OrbitalLendingMarket.findByPk(appId);
    if (!market) {
      throw new Error(`Market with app ID ${appId} not found`);
    }

    // 2. Fetch on-chain global state
    const globalState = await getApplicationGlobalState(appId);

    // 3. Extract values from global state
    const totalDeposits = globalState.total_deposits || 0n;
    const totalBorrows = globalState.total_borrows || 0n;
    const utilCapBps = globalState.util_cap_bps || 10000n;
    const baseBps = globalState.base_bps || 200n;
    const kinkNormBps = globalState.kink_norm_bps || 5000n;
    const slope1Bps = globalState.slope1_bps || 1000n;
    const slope2Bps = globalState.slope2_bps || 4000n;
    const maxAprBps = globalState.max_apr_bps || 60000n;
    const rateModelType = globalState.rate_model_type || 0n;
    const oracleAppId = Number(globalState.oracle_app || 0n);
    const protocolShareBps = globalState.protocol_share_bps || 500n;

    // 4. Calculate APY using interest rate model
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

    // 5. Get base token info
    const baseTokenInfo = await getAssetInfo(market.baseTokenId);
    const decimals = baseTokenInfo.decimals;

    // 6. Get token price from oracle
    let baseTokenPrice = 0;
    try {
      if (oracleAppId > 0) {
        const priceData = await getTokenPriceFromOracle(oracleAppId, market.baseTokenId);
        // Price is in micro-USD (6 decimals), convert to USD
        baseTokenPrice = Number(priceData.price) / 1_000_000;
      }
    } catch (error) {
      console.warn(`Could not fetch price for asset ${market.baseTokenId}:`, error);
      baseTokenPrice = 0;
    }

    // 7. Calculate TVL and other metrics
    const totalDepositsNum = Number(totalDeposits) / Math.pow(10, decimals);
    const totalBorrowsNum = Number(totalBorrows) / Math.pow(10, decimals);
    const tvl = totalDepositsNum * baseTokenPrice;
    const totalBorrowsUSD = totalBorrowsNum * baseTokenPrice;

    // Calculate available to borrow (respecting utilization cap)
    const capBorrow = (Number(totalDeposits) * Number(utilCapBps)) / 10000;
    const availableToBorrowRaw = Math.max(0, capBorrow - Number(totalBorrows));
    const availableToBorrowNum = availableToBorrowRaw / Math.pow(10, decimals);
    const availableToBorrowUSD = availableToBorrowNum * baseTokenPrice;

    return {
      appId: market.appId,
      baseTokenId: market.baseTokenId,
      baseTokenName: baseTokenInfo.name,
      baseTokenSymbol: baseTokenInfo.unitName,
      lstTokenId: market.lstTokenId,
      network: market.network,
      supplyApy: Math.round(supplyApy * 100) / 100, // Round to 2 decimals
      borrowApy: Math.round(borrowApy * 100) / 100,
      tvl: Math.round(tvl * 100) / 100,
      tvlBaseToken: totalDepositsNum.toFixed(decimals),
      totalDeposits: totalDepositsNum.toFixed(decimals),
      totalBorrows: totalBorrowsNum.toFixed(decimals),
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      availableToBorrow: availableToBorrowNum.toFixed(decimals),
      baseTokenPrice: Math.round(baseTokenPrice * 1000000) / 1000000, // 6 decimals
      totalBorrowsUSD: Math.round(totalBorrowsUSD * 100) / 100,
      availableToBorrowUSD: Math.round(availableToBorrowUSD * 100) / 100,
    };
  } catch (error) {
    console.error(`Error fetching enriched market data for app ${appId}:`, error);
    throw error;
  }
}

/**
 * Fetch enriched data for all markets
 */
export async function getAllEnrichedMarketData(network?: 'mainnet' | 'testnet'): Promise<EnrichedMarketData[]> {
  try {
    // Get all markets from database
    let markets = await OrbitalLendingMarket.findAll();

    // Filter by network if specified
    if (network) {
      markets = markets.filter((m) => m.network === network);
    }

    // Fetch enriched data for each market in parallel
    const enrichedDataPromises = markets.map((market) => 
      getEnrichedMarketData(market.appId).catch((error) => {
        console.error(`Failed to enrich market ${market.appId}:`, error);
        return null;
      })
    );

    const enrichedData = await Promise.all(enrichedDataPromises);

    // Filter out any failed enrichments
    return enrichedData.filter((data): data is EnrichedMarketData => data !== null);
  } catch (error) {
    console.error('Error fetching all enriched market data:', error);
    throw error;
  }
}

