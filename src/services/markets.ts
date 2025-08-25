/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { TransactionSigner } from "algosdk";
import * as algokit from "@algorandfoundation/algokit-utils";
import { getContractState } from "../contracts/lending/state";
import { LendingMarket, AssetMetadata, UserAssetInfo, UserAssetSummary } from "../types/lending";
import { currentAprBps, utilNormBps } from "../utils";
import { getPricing } from "../contracts/oracle/pricing";
import { GENERAL_BACKEND_URL } from "../constants";

// Backend response interface
interface BackendMarket {
  appId: string;
  baseTokenId: string;
  lstTokenId: string;
}

// Token metadata mapping - you can expand this or fetch from another endpoint
const TOKEN_METADATA: Record<
  number,
  { name: string; symbol: string; image: string }
> = {
  // Add your token mappings here, e.g.:
  744427912: { name: "xUSD Testnet", symbol: "xUSDt", image: "/xUSDt.svg" },
  744427950: {
    name: "CompX Token Testnet",
    symbol: "COMPXt",
    image: "/COMPXt.svg",
  },
};

export async function fetchMarkets(
  signer: TransactionSigner,
  address: string
): Promise<LendingMarket[]> {
  try {
    // 1. Fetch market list from backend
    const response = await axios.get(
      `${GENERAL_BACKEND_URL}/orbital/markets`
    );
    const backendMarkets: BackendMarket[] = response.data;

    const marketStates: LendingMarket[] = [];

    // 2. For each market, get on-chain state and calculate metrics
    for (const market of backendMarkets) {
      try {
        const appGlobalState = await getContractState(
          address,
          Number(market.appId),
          signer
        );

        // Extract values with proper type conversion
        const totalDeposits = appGlobalState.totalDeposits ?? 0n;
        const totalBorrows = appGlobalState.totalBorrows ?? 0n;
        const utilCapBps = appGlobalState.utilCapBps ?? 10000n; // Default 100% if not set
        const ltvBps = appGlobalState.ltvBps ?? 0n;
        const liqThresholdBps = appGlobalState.liqThresholdBps ?? 0n;
        const oracleAppId = appGlobalState.oracleApp ?? 0n;

        // Calculate normalized utilization (0-10000 basis points)
        const utilNormBpsValue = utilNormBps(
          totalDeposits,
          totalBorrows,
          utilCapBps
        );
        const utilizationRate = Number(utilNormBpsValue) / 100; // Convert to percentage (0-100)

        // Calculate APR using the rate model
        const aprData = currentAprBps({
          totalDeposits,
          totalBorrows,
          base_bps: appGlobalState.baseBps ?? 200n, // 2% default base rate
          util_cap_bps: utilCapBps,
          kink_norm_bps: appGlobalState.kinkNormBps ?? 5000n, // 50% default kink
          slope1_bps: appGlobalState.slope1Bps ?? 100n,
          slope2_bps: appGlobalState.slope2Bps ?? 400n,
          max_apr_bps: appGlobalState.maxAprBps ?? 50000n, // 500% max APR
          ema_alpha_bps: appGlobalState.emaAlphaBps ?? 0n,
          max_apr_step_bps: appGlobalState.maxAprStepBps ?? 0n,
          prev_apr_bps: appGlobalState.prevAprBps ?? 0n,
          util_ema_bps: appGlobalState.utilEmaBps ?? 0n,
          rate_model_type: appGlobalState.rateModelType ?? 0n,
          interest_bps_fallback: 50n,
        });

        // Calculate borrow APR (from rate model)
        const borrowApr = Number(aprData.apr_bps) / 100; // Convert basis points to percentage

        // Calculate supply APR (borrow APR * utilization * (1 - fee))
        // Assuming a protocol fee, you might want to fetch this from contract state
        const protocolFeeBps = appGlobalState.protocolShareBps ?? 500n; // 5% default fee
        const netUtilization = utilizationRate / 100; // Convert to decimal
        const feeMultiplier = 1 - Number(protocolFeeBps) / 10000;
        const supplyApr = borrowApr * netUtilization * feeMultiplier;

        // Calculate available to borrow
        const capBorrow = (Number(totalDeposits) * Number(utilCapBps)) / 10000;
        const currentBorrows = Number(totalBorrows);
        

        // Get token metadata - try appId and baseTokenId as keys
        const appIdNum = Number(market.appId);
        const baseTokenIdNum = Number(market.baseTokenId);
        const tokenMeta = TOKEN_METADATA[appIdNum] || 
                         TOKEN_METADATA[baseTokenIdNum] || 
                         TOKEN_METADATA[market.appId as any] || 
                         TOKEN_METADATA[market.baseTokenId as any] || {
          name: `Token ${market.baseTokenId}`,
          symbol: `TKN${market.baseTokenId.slice(-4)}`,
          image: "/default-token.svg",
        };

        const baseTokenPrice = await getPricing({
          tokenId: Number(market.baseTokenId),
          address,
          signer,
          appId: Number(oracleAppId),
        });
        const availableToBorrowUSD = Math.max(0, capBorrow - currentBorrows) * baseTokenPrice / 10 ** 6;
        const availableToBorrow = Math.max(0, capBorrow - currentBorrows) / 10 ** 6;
        const totalDepositsUSD = Number(totalDeposits) * (baseTokenPrice || 0);
        const totalBorrowsUSD = Number(totalBorrows) * (baseTokenPrice || 0);

        const marketState: LendingMarket = {
          id: market.appId,
          name: tokenMeta.name,
          symbol: tokenMeta.symbol,
          image: tokenMeta.image,
          ltv: Number(ltvBps) / 100, // Convert basis points to percentage
          liquidationThreshold: Number(liqThresholdBps) / 100,
          supplyApr: supplyApr,
          borrowApr: borrowApr,
          utilizationRate: utilizationRate,
          totalDeposits: Number(totalDeposits) / 10 ** 6,
          totalDepositsUSD: totalDepositsUSD / 10 ** 6,
          totalBorrows: Number(totalBorrows) / 10 ** 6,
          totalBorrowsUSD: totalBorrowsUSD / 10 ** 6,
          availableToBorrow: availableToBorrow,
          availableToBorrowUSD: availableToBorrowUSD,
          isActive: true,
          baseTokenId: market.baseTokenId,
          lstTokenId: market.lstTokenId,
          oracleAppId: Number(oracleAppId),
          baseTokenPrice: Number(baseTokenPrice),
          circulatingLST: Number(appGlobalState.circulatingLst) / 10 ** 6,
          // Interest Rate Model Parameters
          baseBps: Number(appGlobalState.baseBps ?? 200n), // Default 2%
          utilCapBps: Number(utilCapBps),
          kinkNormBps: Number(appGlobalState.kinkNormBps ?? 5000n), // Default 50%
          slope1Bps: Number(appGlobalState.slope1Bps ?? 100n), // Default 1%
          slope2Bps: Number(appGlobalState.slope2Bps ?? 400n), // Default 4%
          maxAprBps: Number(appGlobalState.maxAprBps ?? 50000n), // Default 500%
          rateModelType: Number(appGlobalState.rateModelType ?? 0n), // Default kinked model
        };

        marketStates.push(marketState);
      } catch (error) {
        console.error(
          `Failed to fetch state for market ${market.appId}:`,
          error
        );
        // Continue with other markets even if one fails
      }
    }

    return marketStates;
  } catch (error) {
    console.error("Failed to fetch markets:", error);
    throw new Error("Failed to fetch market data");
  }
}

// Fetch asset metadata from backend
export async function fetchAssetMetadata(assetIds: string[]): Promise<AssetMetadata[]> {
  try {
    const response = await axios.post(
      `${GENERAL_BACKEND_URL}/assets`,
      { assetIds }
    );
    
    // Backend returns an object with asset IDs as keys, convert to array
    const responseData = response.data;
    if (typeof responseData === 'object' && !Array.isArray(responseData)) {
      // Convert object to array of AssetMetadata
      const metadataArray: AssetMetadata[] = [];
      for (const [assetId, assetInfo] of Object.entries(responseData)) {
        const assetData = assetInfo as any;
        metadataArray.push({
          id: assetId,
          name: assetData.name || `Asset ${assetId}`,
          symbol: assetData.symbol || `TKN${assetId.slice(-4)}`,
          decimals: assetData.decimals || 6,
          image: assetData.image,
          verified: assetData.verified,
          total: assetData.total,
          frozen: assetData.frozen || assetData['is-frozen'],
        });
      }
      return metadataArray;
    }
    
    // If it's already an array, return as-is
    return responseData;
  } catch (error) {
    console.error("Failed to fetch asset metadata:", error);
    throw new Error("Failed to fetch asset metadata");
  }
}

// Get all unique asset IDs from markets (base tokens and LST tokens)
export async function getMarketAssetIds(): Promise<string[]> {
  try {
    const response = await axios.get(
      `${GENERAL_BACKEND_URL}/orbital/markets`
    );
    const backendMarkets: BackendMarket[] = response.data;
    
    const assetIds = new Set<string>();
    
    backendMarkets.forEach(market => {
      if (market.baseTokenId && market.baseTokenId !== '0') {
        assetIds.add(market.baseTokenId);
      }
      if (market.lstTokenId && market.lstTokenId !== '0') {
        assetIds.add(market.lstTokenId);
      }
    });
    
    return Array.from(assetIds);
  } catch (error) {
    console.error("Failed to fetch market asset IDs:", error);
    throw new Error("Failed to fetch market asset IDs");
  }
}

// Fetch user asset balances and opt-in status
export async function fetchUserAssetInfo(
  walletAddress: string,
  assetIds: string[]
): Promise<UserAssetSummary> {
  try {
    // Use testnet for now, but you might want to make this configurable
    const algorand = algokit.AlgorandClient.testNet();
    
    // Fetch ALGO balance
    const accountInfo = await algorand.client.algod.accountInformation(walletAddress).do();
    const algoBalance = accountInfo.amount.toString();
    
    // Fetch asset information
    const assets: UserAssetInfo[] = [];
    
    for (const assetId of assetIds) {
      if (assetId === '0' || assetId === '') continue; // Skip ALGO and empty asset IDs
      
      try {
        // Check if user is opted into the asset
        const assetHolding = await algorand.client.algod
          .accountAssetInformation(walletAddress, parseInt(assetId))
          .do();
        
        assets.push({
          assetId,
          balance: assetHolding?.assetHolding?.amount.toString() ?? '0',
          isOptedIn: true,
        });
      } catch (error) {
        // User is not opted into this asset
        console.log(`User not opted into asset ${assetId}:`, error);
        assets.push({
          assetId,
          balance: '0',
          isOptedIn: false,
        });
      }
    }
    
    return {
      algoBalance,
      assets,
    };
  } catch (error) {
    console.error("Failed to fetch user asset info:", error);
    throw new Error("Failed to fetch user asset information");
  }
}
