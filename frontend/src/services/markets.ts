/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { TransactionSigner } from "algosdk";
import { getContractState } from "../contracts/lending/state";
import {
  LendingMarket,
  AssetMetadata,
  UserAssetInfo,
  UserAssetSummary,
} from "../types/lending";
import { currentAprBps, getAlgod, utilNormBps } from "../utils";
import { getPricing } from "../contracts/oracle/pricing";
import { ORBITAL_BACKEND_URL } from "../constants/constants";
import type { NetworkType } from "../context/networkContext";
import { getOrbitalLendingMarkets } from "./orbitalApi";

// Get the current network from localStorage
function getCurrentNetwork(): NetworkType {
  const stored = localStorage.getItem('orbital-preferred-network');
  return (stored as NetworkType) || 'testnet';
}

function isTestnet(): boolean {
  return getCurrentNetwork() === 'testnet';
}

// Backend response interface
interface BackendMarket {
  appId: string;
  baseTokenId: string;
  lstTokenId: string;
  network: 'mainnet' | 'testnet';
}

// Testnet asset metadata
const TESTNET_ASSET_METADATA: Record<string, AssetMetadata> = {
  "744427912": {
    id: "744427912",
    name: "xUSD Testnet",
    symbol: "xUSDt",
    decimals: 6,
    image: "/xUSDt.svg",
    verified: true,
    frozen: false,
  },
  "744427950": {
    id: "744427950",
    name: "CompX Token Testnet",
    symbol: "COMPXt",
    decimals: 6,
    image: "/COMPXt.svg",
    verified: true,
    frozen: false,
  },
  // Add USDCt and goBTCt when asset IDs are available
  "747008852": {
    id: "747008852",
    name: "USDC Testnet",
    symbol: "USDCt",
    decimals: 6,
    image: "/USDCt-logo.svg", // You'll need to add this image
    verified: true,
    frozen: false,
  },
  "747008871": {
    id: "747008871",
    name: "goBTC Testnet",
    symbol: "goBTCt",
    decimals: 8,
    image: "/goBTCt-logo.svg", // You'll need to add this image
    verified: true,
    frozen: false,
  },
  "748908019": {
    id: "748908019",
    name: "Collateralized COMPX Testnet",
    symbol: "cCOMPXt",
    decimals: 6,
    image: "/cCOMPXt.svg",
    verified: true,
    frozen: false,
  },
  "748908221": {
    id: "748908221",
    name: "Collateralized xUSDt Testnet",
    symbol: "cxUSDt",
    decimals: 6,
    image: "/cxUSDt.svg",
    verified: true,
    frozen: false,
  },
  "747010543": {
    id: "747010543",
    name: "Collateralized ALGO Testnet",
    symbol: "cALGO",
    decimals: 6,
    image: "/cALGO-logo.svg",
    verified: true,
    frozen: false,
  },
  "748119416": {
    id: "748119416",
    name: "Collateralized USDCt Testnet",
    symbol: "cUSDCt",
    decimals: 6,
    image: "/cUSDCt.svg",
    verified: true,
    frozen: false,
  },
  "747010926": {
    id: "747010926",
    name: "Collateralized goBTCt Testnet",
    symbol: "cgoBTCt",
    decimals: 8,
    image: "/cgoBTCt-logo.svg",
    verified: true,
    frozen: false,
  },
};

// Testnet market asset IDs (base and LST tokens)
const TESTNET_MARKET_ASSET_IDS = [
  "744427912", // xUSDt
  "744427950", // COMPXt
  "747008852", // USDCt 
  "747008871", // goBTCt 
  "748908019", // cCOMPXt (collateral token)
  "748908221", // cxUSDt (collateral token)
  "747010543", // cALGO (collateral token)
  "748119416", // cUSDCt (collateral token) - NEW CONTRACT
  "747010926", // cgoBTCt (collateral token)
];

// Token metadata mapping for markets - you can expand this or fetch from another endpoint
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
  747008852: { name: "USDC Testnet", symbol: "USDCt", image: "/USDCt-logo.svg" },
  747008871: { name: "goBTC Testnet", symbol: "goBTCt", image: "/goBTCt-logo.svg" },
  0: { name: "ALGO Testnet", symbol: "ALGO", image: "/algo-icon.svg" },
};

export async function fetchMarkets(
  signer: TransactionSigner,
  address: string
): Promise<LendingMarket[]> {
  try {
    // 1. Fetch market list from Orbital backend
    let backendMarkets: BackendMarket[] = [];
    
    try {
      const markets = await getOrbitalLendingMarkets();
      const currentNetwork = getCurrentNetwork();
      
      // Filter markets by network - only fetch data for markets on the current network
      backendMarkets = markets
        .filter((m) => m.network === currentNetwork)
        .map((m) => ({
          appId: m.appId.toString(),
          baseTokenId: m.baseTokenId.toString(),
          lstTokenId: m.lstTokenId.toString(),
          network: m.network,
        }));
      
      console.log(`Filtered ${backendMarkets.length} markets for ${currentNetwork} network`);
    } catch (error) {
      console.warn('Failed to fetch from Orbital backend, using fallback:', error);
      // Fallback to empty array - will fetch from on-chain only
      backendMarkets = [];
    }

    // 2. Fetch asset metadata for all base tokens
    const baseTokenIds = backendMarkets.map(m => m.baseTokenId);
    let assetMetadataMap: Record<string, AssetMetadata> = {};
    
    if (baseTokenIds.length > 0) {
      try {
        const metadata = await fetchAssetMetadata(baseTokenIds);
        // Convert array to map for easy lookup
        metadata.forEach(asset => {
          assetMetadataMap[asset.id] = asset;
        });
        console.log(`Fetched metadata for ${metadata.length} assets`);
      } catch (error) {
        console.warn('Failed to fetch asset metadata, using fallback:', error);
      }
    }

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
        const originationFeeBps = appGlobalState.originationFeeBps ?? 0n;
        const oracleAppId = appGlobalState.oracleApp ?? 0n;
        const buyoutTokenId = appGlobalState.buyoutTokenId ?? 0n;
        const borrowIndexWad = appGlobalState.borrowIndexWad ?? 0n;
        const contractState = appGlobalState.contractState ?? 0n;
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

        // Get token metadata - use fetched metadata first, then fallback to hardcoded
        const baseTokenIdNum = Number(market.baseTokenId);
        const appIdNum = Number(market.appId);
        const currentNetwork = getCurrentNetwork();
        
        // Try to get metadata from API response first
        const fetchedMeta = assetMetadataMap[market.baseTokenId];
        
        // Fallback to hardcoded metadata for testnet or if fetch failed
        const tokenMeta = fetchedMeta ? {
          name: fetchedMeta.name,
          symbol: fetchedMeta.symbol,
          // For mainnet, use local SVG files from public/mainnet-tokens directory
          // For testnet, use the testnet-specific images
          image: currentNetwork === 'mainnet' 
            ? `/mainnet-tokens/${market.baseTokenId}.svg`
            : (TOKEN_METADATA[baseTokenIdNum]?.image || `/mainnet-tokens/${market.baseTokenId}.svg`),
        } : (TOKEN_METADATA[appIdNum] ||
          TOKEN_METADATA[baseTokenIdNum] ||
          TOKEN_METADATA[market.appId as any] ||
          TOKEN_METADATA[market.baseTokenId as any] || {
            name: `Token ${market.baseTokenId}`,
            symbol: `TKN${market.baseTokenId.slice(-4)}`,
            image: currentNetwork === 'mainnet' 
              ? `/mainnet-tokens/${market.baseTokenId}.svg`
              : "/default-token.svg",
          });

        const baseTokenPrice = await getPricing({
          tokenId: Number(market.baseTokenId),
          address,
          signer,
          appId: Number(oracleAppId),
        });
        const availableToBorrowUSD =
          (Math.max(0, capBorrow - currentBorrows) * baseTokenPrice) / 10 ** 6;
        const availableToBorrow =
          Math.max(0, capBorrow - currentBorrows) / 10 ** 6;
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
          buyoutTokenId: Number(buyoutTokenId),
          baseTokenPrice: Number(baseTokenPrice),
          circulatingLST: Number(appGlobalState.circulatingLst) / 10 ** 6,
          borrowIndexWad: borrowIndexWad,
          // Interest Rate Model Parameters
          baseBps: Number(appGlobalState.baseBps ?? 200n), // Default 2%
          utilCapBps: Number(utilCapBps),
          kinkNormBps: Number(appGlobalState.kinkNormBps ?? 5000n), // Default 50%
          slope1Bps: Number(appGlobalState.slope1Bps ?? 100n), // Default 1%
          slope2Bps: Number(appGlobalState.slope2Bps ?? 400n), // Default 4%
          maxAprBps: Number(appGlobalState.maxAprBps ?? 50000n), // Default 500%
          rateModelType: Number(appGlobalState.rateModelType ?? 0n), // Default kinked model
          originationFeeBps: Number(originationFeeBps), // Origination fee in basis points
          liqBonusBps: Number(appGlobalState.liqBonusBps ?? 750n), // Default 7.5% liquidation bonus
          contractState: Number(contractState),
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

// Fetch asset metadata from backend or use testnet mock data
export async function fetchAssetMetadata(
  assetIds: string[]
): Promise<AssetMetadata[]> {
  try {
    if (isTestnet()) {
      // Use hardcoded testnet data
      const metadataArray: AssetMetadata[] = [];
      assetIds.forEach((assetId) => {
        if (TESTNET_ASSET_METADATA[assetId]) {
          metadataArray.push(TESTNET_ASSET_METADATA[assetId]);
        } else {
          // Fallback for unknown testnet assets
          metadataArray.push({
            id: assetId,
            name: `Asset ${assetId}`,
            symbol: `TKN${assetId.slice(-4)}`,
            decimals: 6,
            verified: false,
            frozen: false,
          });
        }
      });
      console.log("Metadata array:", metadataArray);
      return metadataArray;
    }

    // Separate ALGO (asset ID 0) from other assets
    const algoAssets: AssetMetadata[] = [];
    const regularAssets: string[] = [];
    
    assetIds.forEach((assetId) => {
      if (assetId === '0') {
        // Hardcode ALGO metadata
        algoAssets.push({
          id: '0',
          name: 'Algorand',
          symbol: 'ALGO',
          decimals: 6,
          image: '/mainnet-tokens/0.svg',
          verified: true,
          frozen: false,
        });
      } else {
        regularAssets.push(assetId);
      }
    });

    // If there are no regular assets to fetch, just return ALGO
    if (regularAssets.length === 0) {
      return algoAssets;
    }

    // Fetch from backend for mainnet (non-ALGO assets)
    const response = await axios.post(`${ORBITAL_BACKEND_URL}/assets`, {
      assetIds: regularAssets,
    });

    // Backend returns an object with asset IDs as keys, convert to array
    const responseData = response.data;
    if (typeof responseData === "object" && !Array.isArray(responseData)) {
      // Convert object to array of AssetMetadata
      const metadataArray: AssetMetadata[] = [];
      for (const [assetId, assetInfo] of Object.entries(responseData)) {
        const assetData = assetInfo as any;
        metadataArray.push({
          id: assetId,
          name: assetData.name || `Asset ${assetId}`,
          symbol: assetData.symbol || `TKN${assetId.slice(-4)}`,
          decimals: assetData.decimals || 6,
          // Use local mainnet token images from public/mainnet-tokens directory
          image: `/mainnet-tokens/${assetId}.svg`,
          verified: assetData.verified,
          total: assetData.total,
          frozen: assetData.frozen || assetData["is-frozen"],
        });
      }
      // Combine with ALGO metadata
      return [...algoAssets, ...metadataArray];
    }

    // If it's already an array, combine with ALGO and return
    return [...algoAssets, ...responseData];
  } catch (error) {
    console.error("Failed to fetch asset metadata:", error);
    
    if (isTestnet()) {
      // For testnet, return fallback data instead of throwing
      const fallbackArray: AssetMetadata[] = [];
      assetIds.forEach((assetId) => {
        fallbackArray.push({
          id: assetId,
          name: `Asset ${assetId}`,
          symbol: `TKN${assetId.slice(-4)}`,
          decimals: 6,
          verified: false,
          frozen: false,
        });
      });
      return fallbackArray;
    }
    
    throw new Error("Failed to fetch asset metadata");
  }
}

// Get all unique asset IDs from markets (base tokens and LST tokens)
export async function getMarketAssetIds(): Promise<string[]> {
  try {
    if (isTestnet()) {
      // Return hardcoded testnet asset IDs
      return [...TESTNET_MARKET_ASSET_IDS];
    }

    // Fetch from backend
    const markets = await getOrbitalLendingMarkets();
    const currentNetwork = getCurrentNetwork();
    
    // Filter markets by network
    const backendMarkets: BackendMarket[] = markets
      .filter((m) => m.network === currentNetwork)
      .map((m) => ({
        appId: m.appId.toString(),
        baseTokenId: m.baseTokenId.toString(),
        lstTokenId: m.lstTokenId.toString(),
        network: m.network,
      }));

    const assetIds = new Set<string>();

    backendMarkets.forEach((market) => {
      if (market.baseTokenId && market.baseTokenId !== "0") {
        assetIds.add(market.baseTokenId);
      }
      if (market.lstTokenId && market.lstTokenId !== "0") {
        assetIds.add(market.lstTokenId);
      }
    });

    return Array.from(assetIds);
  } catch (error) {
    console.error("Failed to fetch market asset IDs:", error);
    
    if (isTestnet()) {
      // For testnet, return fallback data instead of throwing
      return [...TESTNET_MARKET_ASSET_IDS];
    }
    
    throw new Error("Failed to fetch market asset IDs");
  }
}

// Fetch user asset balances and opt-in status
export async function fetchUserAssetInfo(
  walletAddress: string,
  assetIds: string[]
): Promise<UserAssetSummary> {
  try {
    // Fetch ALGO balance
    const accountInfo = await getAlgod().accountInformation(walletAddress).do();
    const algoBalance = accountInfo.amount.toString();

    // Fetch asset information
    const assets: UserAssetInfo[] = [];

    for (const assetId of assetIds) {
      if (assetId === "0" || assetId === "") continue; // Skip ALGO and empty asset IDs

      try {
        // Check if user is opted into the asset
        const assetHolding = await getAlgod()
          .accountAssetInformation(walletAddress, parseInt(assetId))
          .do();

        assets.push({
          assetId,
          balance: assetHolding?.assetHolding?.amount.toString() ?? "0",
          isOptedIn: true,
        });
      } catch (error) {
        // User is not opted into this asset
        console.log(`User not opted into asset ${assetId}:`, error);
        assets.push({
          assetId,
          balance: "0",
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
