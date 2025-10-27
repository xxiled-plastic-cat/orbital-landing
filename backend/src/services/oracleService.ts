/**
 * Oracle Service
 * Responsible for fetching prices from multiple sources and updating oracle contracts
 */

import { OracleClient } from "../clients/oracleClient";
import {
  calculateMedian,
  shouldUpdatePrice,
  isValidPrice,
  formatPrice,
} from "../utils/priceCalculations.js";
import * as algokit from "@algorandfoundation/algokit-utils";

// Testnet to Mainnet Asset ID Mapping
// Only used when ALGORAND_NETWORK is 'testnet'
const TESTNET_TO_MAINNET_MAPPING: Record<string, number> = {
  "744427912": 760037151, // Testnet -> Mainnet
  "744427950": 1732165149, // Testnet -> Mainnet
  "747008852": 31566704, // Testnet -> Mainnet
  "747008871": 386192725, // Testnet -> Mainnet
};

/**
 * Get the mainnet asset ID for a testnet asset if mapping exists
 * Returns the original asset ID if not on testnet or no mapping exists
 */
function getMainnetAssetId(assetId: number): number {
  const isTestnet = process.env.ALGORAND_NETWORK === "testnet";

  if (!isTestnet) {
    return assetId;
  }

  const mainnetId = TESTNET_TO_MAINNET_MAPPING[assetId.toString()];
  if (mainnetId) {
    console.log(
      `  🔄 Mapping testnet asset ${assetId} -> mainnet asset ${mainnetId}`
    );
    return mainnetId;
  }

  return assetId;
}

// Type definitions
export interface OracleAsset {
  assetId: number;
  symbol: string;
  currentPrice: number;
}

export interface PriceSource {
  source: string;
  price: number;
  weight: number;
}

export interface UpdateResult {
  asset: string;
  success: boolean;
  reason: string;
  updated: boolean;
  currentPrice?: number;
  newPrice?: number;
  changePercent?: number;
  error?: string;
}

export interface UpdateSummary {
  success: boolean;
  totalAssets?: number;
  updated?: number;
  skipped?: number;
  failed?: number;
  duration: number;
  results?: UpdateResult[];
  error?: string;
}

interface CompXPriceMap {
  [assetId: string]: {
    max: number;
    [key: string]: any;
  };
}

interface VestigePriceData {
  network_id: number;
  asset_id: number;
  denominating_asset_id: number;
  price: number;
  confidence: number;
  total_lockup: number;
}

/**
 * Fetch asset IDs from the oracle application
 * @returns Promise with array of oracle assets
 */
export async function getOracleAssets(): Promise<OracleAsset[]> {
  // TODO: Implement actual oracle application reading
  // This should read from the Algorand oracle application to get:
  // - Asset IDs that need price updates
  // - Current prices stored in the oracle
  // - Asset metadata (symbol, decimals, etc.)

  console.log("📋 Fetching assets from oracle application...");

  try {
    const algorand = algokit.AlgorandClient.fromConfig({
      algodConfig: {
        server:
          process.env.ALGORAND_NODE_URL ||
          "https://testnet-api.4160.nodely.dev",
        token: process.env.ALGORAND_NETWORK_TOKEN || "",
      },
    });

    const oracleAppId = process.env.ORACLE_APP_ID;
    if (!oracleAppId) {
      throw new Error("ORACLE_APP_ID environment variable not set");
    }

    const appClient = new OracleClient({
      algorand,
      appId: BigInt(oracleAppId),
    });

    const prices = await appClient.state.box.tokenPrices.getMap();
    console.log("Oracle prices map:", prices);

    // Parse the prices map and convert to OracleAsset[]
    const assets: OracleAsset[] = [];

    for (const [assetIdKey, priceValue] of prices) {
      try {
        // Keys are always BigInt from the oracle
        // Values are also BigInt representing price with 6 decimals
        const assetId = Number(assetIdKey.assetId);
        console.log(`Asset ID: ${assetId}`);
        const currentPrice = Number(priceValue.price) / 1e6;

        if (isNaN(assetId) || isNaN(currentPrice) || currentPrice < 0) {
          console.warn(`⚠️  Invalid asset ID (${assetId}) or price (${currentPrice}), skipping`);
          continue;
        }

        console.log(`✅ Asset ID ${assetId}: $${currentPrice.toFixed(6)}`);

        assets.push({
          assetId,
          symbol: `Asset-${assetId}`,
          currentPrice,
        });
      } catch (err) {
        console.error(`Error processing entry:`, err);
        continue;
      }
    }

    console.log(`✅ Loaded ${assets.length} assets from oracle`);
    return assets;
  } catch (error) {
    console.error("Error fetching oracle assets:", error);
    console.warn("⚠️  Returning empty asset list");
    return [];
  }
}

/**
 * Fetch price from CompX source
 * @param symbol - Asset symbol
 * @param assetId - Asset ID (testnet ID, will be mapped to mainnet if needed)
 * @returns Price or null if unavailable
 */
export async function fetchCompXPrice(
  symbol: string,
  assetId: number
): Promise<number | null> {
  console.log(`  🔍 Fetching ${symbol} price from CompX...`);

  try {
    // Map testnet asset to mainnet for price fetching
    const priceAssetId = getMainnetAssetId(assetId);

    const response = await fetch("https://api-general.compx.io/api/prices");

    if (!response.ok) {
      console.error(
        `  ❌ CompX API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const priceMap = (await response.json()) as CompXPriceMap;

    // Access price by asset ID and get the .max property
    if (
      priceMap &&
      priceMap[priceAssetId] &&
      priceMap[priceAssetId].max !== undefined
    ) {
      const price = priceMap[priceAssetId].max;

      // Validate the price
      if (isValidPrice(price)) {
        return price;
      } else {
        console.error(`  ⚠️  Invalid price from CompX for ${symbol}: ${price}`);
        return null;
      }
    }

    console.log(
      `  ⚠️  No price data available for ${symbol} (Asset ID: ${priceAssetId}) from CompX`
    );
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `  ❌ Error fetching CompX price for ${symbol}:`,
      errorMessage
    );
    return null;
  }
}

/**
 * Fetch price from Vestige source
 * @param symbol - Asset symbol
 * @param assetId - Asset ID (testnet ID, will be mapped to mainnet if needed)
 * @returns Price or null if unavailable
 */
export async function fetchVestigePrice(
  symbol: string,
  assetId: number
): Promise<number | null> {
  console.log(`  🔍 Fetching ${symbol} price from Vestige...`);

  try {
    // Map testnet asset to mainnet for price fetching
    const priceAssetId = getMainnetAssetId(assetId);

    // Vestige API configuration
    const VESTIGE_API_BASE = "https://api.vestigelabs.org/assets/price";
    // Always use mainnet (0) for price data when we have a mapping, otherwise use actual network
    const NETWORK_ID =
      process.env.ALGORAND_NETWORK === "testnet" && priceAssetId !== assetId
        ? 0
        : process.env.ALGORAND_NETWORK === "mainnet"
        ? 0
        : 1;
    const DENOMINATING_ASSET_ID = 31566704; // ALGO as the denominating asset

    // Build API URL with query parameters
    const url = new URL(VESTIGE_API_BASE);
    url.searchParams.append("asset_ids", priceAssetId.toString());
    url.searchParams.append("network_id", NETWORK_ID.toString());
    url.searchParams.append(
      "denominating_asset_id",
      DENOMINATING_ASSET_ID.toString()
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `  ❌ Vestige API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const priceData = (await response.json()) as VestigePriceData[];

    // Response is an array of price objects
    if (Array.isArray(priceData) && priceData.length > 0) {
      // Find the price data for our specific asset (use the mapped mainnet ID)
      const assetPrice = priceData.find(
        (item) => item.asset_id === priceAssetId
      );

      if (assetPrice && assetPrice.price !== undefined) {
        const price = assetPrice.price;

        // Validate the price
        if (isValidPrice(price)) {
          // Log confidence if available
          if (assetPrice.confidence !== undefined) {
            console.log(
              `  📊 Confidence: ${(assetPrice.confidence * 100).toFixed(2)}%`
            );
          }
          return price;
        } else {
          console.error(
            `  ⚠️  Invalid price from Vestige for ${symbol}: ${price}`
          );
          return null;
        }
      }
    }

    console.log(
      `  ⚠️  No price data available for ${symbol} (Asset ID: ${priceAssetId}) from Vestige`
    );
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `  ❌ Error fetching Vestige price for ${symbol}:`,
      errorMessage
    );
    return null;
  }
}

/**
 * Fetch prices from all sources for a given asset
 * @param symbol - Asset symbol
 * @param assetId - Asset ID
 * @returns Array of valid prices with sources
 */
export async function fetchPricesFromAllSources(
  symbol: string,
  assetId: number
): Promise<PriceSource[]> {
  const prices: PriceSource[] = [];

  // Fetch from Vestige (primary source - higher weight)
  const vestigePrice = await fetchVestigePrice(symbol, assetId);
  if (isValidPrice(vestigePrice)) {
    prices.push({ source: "Vestige", price: vestigePrice, weight: 0.85 });
    console.log(`  ✅ Vestige price: $${formatPrice(vestigePrice)} (weight: 0.85)`);
  } else {
    console.log(`  ❌ Vestige price unavailable`);
  }

  // Fetch from CompX (backup source - lower weight)
  const compxPrice = await fetchCompXPrice(symbol, assetId);
  if (isValidPrice(compxPrice)) {
    prices.push({ source: "CompX", price: compxPrice, weight: 0.15 });
    console.log(`  ✅ CompX price: $${formatPrice(compxPrice)} (weight: 0.15)`);
  } else {
    console.log(`  ❌ CompX price unavailable`);
  }

  // Add more price sources here as needed

  return prices;
}

/**
 * Calculate the median price from multiple sources
 * @param symbol - Asset symbol
 * @param assetId - Asset ID
 * @returns Median price or null if no valid prices
 */
export async function getMedianPrice(
  symbol: string,
  assetId: number
): Promise<number | null> {
  try {
    const pricesWithSources = await fetchPricesFromAllSources(symbol, assetId);

    if (pricesWithSources.length === 0) {
      console.log(`  ⚠️  No valid prices found for ${symbol}`);
      return null;
    }

    console.log(`\n  💰 Price Sources (${pricesWithSources.length}):`);
    pricesWithSources.forEach(({ source, price, weight }) => {
      console.log(`     ${source.padEnd(10)} → $${formatPrice(price, 8)} (weight: ${weight})`);
    });

    // Calculate weighted average
    if (pricesWithSources.length === 1) {
      const finalPrice = pricesWithSources[0].price;
      console.log(
        `  📊 Final Price: $${formatPrice(finalPrice, 8)} (single source)`
      );
      console.log("");
      return finalPrice;
    }

    // Weighted average calculation
    const totalWeight = pricesWithSources.reduce((sum, p) => sum + p.weight, 0);
    const weightedSum = pricesWithSources.reduce(
      (sum, p) => sum + p.price * p.weight,
      0
    );
    const weightedPrice = weightedSum / totalWeight;

    console.log(`  📊 Calculation:`);
    pricesWithSources.forEach(({ source, price, weight }) => {
      const contribution = (price * weight) / totalWeight;
      console.log(
        `     ${source}: $${formatPrice(price, 8)} × ${weight} = $${formatPrice(contribution, 8)}`
      );
    });
    console.log(
      `  📊 Weighted Average: $${formatPrice(weightedPrice, 8)}`
    );
    console.log("");

    return weightedPrice;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `  ❌ Error calculating weighted price for ${symbol}:`,
      errorMessage
    );
    return null;
  }
}

/**
 * Update oracle contract with new price
 * @param assetId - Asset ID
 * @param symbol - Asset symbol
 * @param newPrice - New price to update
 * @returns True if update successful
 */
export async function updateOracleContract(
  assetId: number,
  symbol: string,
  newPrice: number
): Promise<boolean> {
  // TODO: Implement actual oracle contract update
  // This should:
  // 1. Create and sign transaction to update oracle contract
  // 2. Submit transaction to Algorand network
  // 3. Wait for confirmation
  // 4. Return success status

  console.log(`  🔄 Updating oracle contract for ${symbol}...`);

  try {
    // Stubbed implementation
    // In reality, this would:
    // - Connect to Algorand node
    // - Create transaction to call oracle update method
    // - Sign with oracle service account
    // - Submit and wait for confirmation

    // Simulated transaction delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    console.log(
      `  ✅ Successfully updated ${symbol} to $${formatPrice(newPrice)}`
    );
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `  ❌ Error updating oracle contract for ${symbol}:`,
      errorMessage
    );
    return false;
  }
}

/**
 * Process price update for a single asset
 * @param asset - Asset information
 * @param threshold - Price change threshold percentage (default: 0.05%)
 * @returns Update result
 */
export async function processPriceUpdate(
  asset: OracleAsset,
  threshold: number = 0.05
): Promise<UpdateResult> {
  const { assetId, symbol, currentPrice } = asset;

  console.log(`\n🔍 Processing ${symbol} (Asset ID: ${assetId})`);
  console.log(`  Current oracle price: $${formatPrice(currentPrice)}`);

  try {
    // Fetch median price from all sources
    const newPrice = await getMedianPrice(symbol, assetId);

    if (!newPrice) {
      return {
        asset: symbol,
        success: false,
        reason: "No valid prices available",
        updated: false,
      };
    }

    // Check if update is needed
    if (!shouldUpdatePrice(currentPrice, newPrice, threshold)) {
      const change = Math.abs(((newPrice - currentPrice) / currentPrice) * 100);
      console.log(
        `  ℹ️  Price change (${change.toFixed(
          4
        )}%) below threshold (${threshold}%) - no update needed`
      );

      return {
        asset: symbol,
        success: true,
        reason: "Price change below threshold",
        updated: false,
        currentPrice,
        newPrice,
      };
    }

    // Update needed
    const change = Math.abs(((newPrice - currentPrice) / currentPrice) * 100);
    console.log(
      `  📈 Price change (${change.toFixed(
        4
      )}%) exceeds threshold - updating...`
    );

    const updateSuccess = await updateOracleContract(assetId, symbol, newPrice);

    return {
      asset: symbol,
      success: updateSuccess,
      reason: updateSuccess ? "Price updated successfully" : "Update failed",
      updated: updateSuccess,
      currentPrice,
      newPrice,
      changePercent: change,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ Error processing ${symbol}:`, errorMessage);

    return {
      asset: symbol,
      success: false,
      reason: errorMessage,
      updated: false,
      error: errorMessage,
    };
  }
}

/**
 * Update all oracle prices
 * Main function that orchestrates the entire price update process
 * @param threshold - Price change threshold percentage (default: 0.05%)
 * @returns Summary of all updates
 */
export async function updateAllOraclePrices(
  threshold: number = 0.05
): Promise<UpdateSummary> {
  const startTime = Date.now();

  console.log("\n🚀 Starting oracle price update cycle...");
  console.log(`📊 Update threshold: ${threshold}%\n`);

  try {
    // Step 1: Get all assets from oracle
    const assets = await getOracleAssets();
    console.log(`\n✅ Found ${assets.length} assets to process\n`);

    if (assets.length === 0) {
      return {
        success: true,
        totalAssets: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        duration: Date.now() - startTime,
        results: [],
      };
    }

    // Step 2: Process each asset
    const results: UpdateResult[] = [];
    for (const asset of assets) {
      const result = await processPriceUpdate(asset, threshold);
      results.push(result);
    }

    // Step 3: Compile summary
    const updated = results.filter((r) => r.updated).length;
    const skipped = results.filter((r) => r.success && !r.updated).length;
    const failed = results.filter((r) => !r.success).length;

    const duration = Date.now() - startTime;

    console.log("\n" + "=".repeat(60));
    console.log("📊 Oracle Update Summary");
    console.log("=".repeat(60));
    console.log(`Total Assets: ${assets.length}`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log("=".repeat(60) + "\n");

    return {
      success: true,
      totalAssets: assets.length,
      updated,
      skipped,
      failed,
      duration,
      results,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("\n❌ Fatal error during oracle update:", errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}
