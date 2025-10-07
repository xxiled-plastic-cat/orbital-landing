import { TransactionSigner } from "algosdk";
import { getExistingClient } from "../contracts/lending/getClient";
import { LoanRecordData, DebtPosition, AssetMetadata } from "../types/lending";
import { fetchMarkets, fetchAssetMetadata } from "./markets";
import { getPricing } from "../contracts/oracle/pricing";
import {
  liveDebtFromSnapshot,
  collateralUSDFromLST,
} from "../contracts/lending/testing-utils";
import { getAcceptedCollateral } from "../contracts/lending/state";

// Testnet collateral token metadata (matching useCollateralTokens.ts)
const TESTNET_COLLATERAL_TOKENS: Record<
  string,
  {
    symbol: string;
    name: string;
    decimals: number;
    image?: string;
  }
> = {
  "744856057": {
    symbol: "cCOMPXt",
    name: "Collateralized COMPX Testnet",
    decimals: 6,
    image: "/COMPXt.svg",
  },
  "744855936": {
    symbol: "cxUSDt",
    name: "Collateralized xUSDt Testnet",
    decimals: 6,
    image: "/xUSDt.svg",
  },
};

/**
 * Fetches all active loan records across all markets
 */
export async function fetchAllLoanRecords(
  signer: TransactionSigner,
  address: string
): Promise<LoanRecordData[]> {
  try {
    // 1. Get all markets first
    const markets = await fetchMarkets(signer, address);

    const allLoanRecords: LoanRecordData[] = [];

    // 2. For each market, get all loan records
    for (const market of markets) {
      try {
        const marketLoanRecords = await fetchMarketLoanRecords(
          signer,
          address,
          Number(market.id),
        );

        // Add market ID to each record
        const recordsWithMarket = marketLoanRecords.map((record) => ({
          ...record,
          marketId: market.id,
        }));

        allLoanRecords.push(...recordsWithMarket);
      } catch (error) {
        console.warn(
          `Failed to fetch loan records for market ${market.id}:`,
          error
        );
        // Continue with other markets even if one fails
      }
    }

    return allLoanRecords;
  } catch (error) {
    console.error("Failed to fetch loan records:", error);
    throw new Error("Failed to fetch loan records");
  }
}

/**
 * Fetches loan records for a specific market
 */
async function fetchMarketLoanRecords(
  signer: TransactionSigner,
  address: string,
  appId: number
): Promise<Omit<LoanRecordData, "marketId">[]> {
  try {
    const appClient = await getExistingClient(signer, address, appId);

    // Get all loan records from the box map
    const loanRecordsMap = await appClient.state.box.loanRecord.getMap();

    const loanRecords: Omit<LoanRecordData, "marketId">[] = [];

    // Convert Map entries to our LoanRecordData format
    for (const [borrowerAddress, record] of loanRecordsMap.entries()) {
      // Skip empty or invalid records
      if (!record || !record.principal || record.principal === 0n) {
        continue;
      }

      loanRecords.push({
        borrowerAddress,
        collateralTokenId: record.collateralTokenId,
        collateralAmount: record.collateralAmount,
        lastDebtChange: {
          amount: record.lastDebtChange.amount,
          changeType: record.lastDebtChange.changeType,
          timestamp: record.lastDebtChange.timestamp,
        },
        borrowedTokenId: record.borrowedTokenId,
        principal: record.principal,
        userIndexWad: record.userIndexWad,
      });
    }

    return loanRecords;
  } catch (error) {
    console.error(`Failed to fetch loan records for market ${appId}:`, error);
    throw error;
  }
}

/**
 * Transforms loan records into debt positions for the marketplace UI
 */
export async function transformLoanRecordsToDebtPositions(
  loanRecords: LoanRecordData[],
  signer: TransactionSigner,
  address: string
): Promise<DebtPosition[]> {
  try {
    // Get all unique asset IDs for metadata
    const assetIds = new Set<string>();
    loanRecords.forEach((record) => {
      assetIds.add(record.borrowedTokenId.toString());
      assetIds.add(record.collateralTokenId.toString());
    });

    // Fetch asset metadata
    const assetMetadata = await fetchAssetMetadata(Array.from(assetIds));
    const metadataMap = new Map<string, AssetMetadata>();

    // First add the fetched metadata
    assetMetadata.forEach((meta) => metadataMap.set(meta.id, meta));

    // Then override with collateral token metadata for better accuracy
    Object.entries(TESTNET_COLLATERAL_TOKENS).forEach(
      ([assetId, tokenInfo]) => {
        if (assetIds.has(assetId)) {
          metadataMap.set(assetId, {
            id: assetId,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals,
            image: tokenInfo.image,
            verified: true,
            frozen: false,
          });
        }
      }
    );

    // Get markets for additional context
    const markets = await fetchMarkets(signer, address);
    const marketsMap = new Map(markets.map((m) => [m.id, m]));

    const debtPositions: DebtPosition[] = [];

    for (const record of loanRecords) {
      try {
        const market = marketsMap.get(record.marketId);
        if (!market) continue;

        // Get asset metadata
        const debtTokenMeta = metadataMap.get(
          record.borrowedTokenId.toString()
        );
        const collateralTokenMeta = metadataMap.get(
          record.collateralTokenId.toString()
        );

        if (!debtTokenMeta || !collateralTokenMeta) continue;

        // Calculate current debt with accrued interest using the helper function
        const borrowIndexWad = BigInt(market.borrowIndexWad || 0); // Get from market global state
        const currentDebtBigInt = liveDebtFromSnapshot(
          record.principal,
          record.userIndexWad,
          borrowIndexWad
        );
        const currentDebt = Number(currentDebtBigInt) / 1e6;

        // Calculate debt value in USD
        const oracleAppId = Number(market.oracleAppId || 0);
        let debtValueUSD = 0;

        if (oracleAppId > 0) {
          try {
            const debtTokenPrice = await getPricing({
              tokenId: Number(record.borrowedTokenId),
              address,
              signer,
              appId: oracleAppId,
            });
            debtValueUSD = currentDebt * debtTokenPrice;
          } catch (error) {
            console.warn("Failed to get debt token price:", error);
            // Fallback: assume debt token is worth $1 (common for stablecoins)
            debtValueUSD = currentDebt;
          }
        } else {
          // Fallback: assume debt token is worth $1
          debtValueUSD = currentDebt;
        } // Convert from micro units

        // Calculate collateral value in USD
        let collateralValueUSD = 0;

        // Get accepted collateral information for this market to determine if it's an LST
        let acceptedCollateralInfo = null;
        try {
          const acceptedCollaterals = await getAcceptedCollateral(
            address,
            Number(record.marketId),
            signer
          );

          // Find the collateral info for this specific token
          for (const [, collateral] of acceptedCollaterals.entries()) {
            if (
              collateral.assetId.toString() ===
              record.collateralTokenId.toString()
            ) {
              acceptedCollateralInfo = collateral;
              break;
            }
          }
        } catch (error) {
          console.warn("Failed to get accepted collateral info:", error);
        }

        if (acceptedCollateralInfo) {
          // Map marketBaseAssetId to the corresponding LST market app ID
          const marketBaseAssetId = Number(
            acceptedCollateralInfo.marketBaseAssetId
          );
          const baseTokenId = Number(acceptedCollateralInfo.baseAssetId);

          // Find the LST market that has this base token
          const lstMarket = markets.find(
            (m) => Number(m.baseTokenId) === marketBaseAssetId
          );

          if (lstMarket) {
            try {
              // Get the LST market data (where this LST token originated)
              const lstMarketClient = await getExistingClient(
                signer,
                address,
                Number(lstMarket.id)
              );
              const lstMarketState =
                await lstMarketClient.state.global.getAll();

              // Get the base token price from oracle
              const oracleAppId = Number(market.oracleAppId || 0);
              let baseTokenPrice = 0;

              if (oracleAppId > 0) {
                baseTokenPrice = await getPricing({
                  tokenId: baseTokenId,
                  address,
                  signer,
                  appId: oracleAppId,
                });
              }

              if (
                baseTokenPrice > 0 &&
                lstMarketState.totalDeposits &&
                lstMarketState.circulatingLst
              ) {
                // Calculate LST value using the collateralUSDFromLST helper function
                const collateralValueUSDMicro = collateralUSDFromLST(
                  record.collateralAmount, // LST amount in micro units
                  lstMarketState.totalDeposits, // Total deposits from LST market
                  lstMarketState.circulatingLst, // Circulating LST from LST market
                  BigInt(Math.floor(baseTokenPrice * 1e6)) // Base token price in micro USD
                );

                collateralValueUSD = Number(collateralValueUSDMicro) / 1e6;
              } else {
                console.warn(
                  "Missing data for LST calculation, using fallback"
                );
                collateralValueUSD = debtValueUSD * 1.5;
              }
            } catch (error) {
              console.warn("Failed to get LST market data:", error);
              collateralValueUSD = debtValueUSD * 1.5;
            }
          } else {
            console.warn(
              `No LST market found for base asset ID ${marketBaseAssetId}, using fallback`
            );
            collateralValueUSD = debtValueUSD * 1.5;
          }
        } else {
          console.warn("No accepted collateral info found, using fallback");
          collateralValueUSD = debtValueUSD * 1.5;
        }

        // Calculate health ratio (collateral ratio)
        const healthRatio =
          debtValueUSD > 0 ? collateralValueUSD / debtValueUSD : 0;

        // Calculate collateral amount in tokens (convert from micro units)
        const collateralAmountInTokens = Number(record.collateralAmount) / 1e6;

        // Calculate current collateral token price (LST price per token)
        let currentCollateralPrice = 0;
        if (acceptedCollateralInfo) {
          // Map marketBaseAssetId to the corresponding LST market app ID
          const marketBaseAssetId = Number(
            acceptedCollateralInfo.marketBaseAssetId
          );
          const baseTokenId = Number(acceptedCollateralInfo.baseAssetId);

          // Find the LST market that has this base token
          const lstMarket = markets.find(
            (m) => Number(m.baseTokenId) === marketBaseAssetId
          );

          if (lstMarket) {
            try {
              // Get the LST market data (where this LST token originated)
              const lstMarketClient = await getExistingClient(
                signer,
                address,
                Number(lstMarket.id),
              );
              const lstMarketState =
                await lstMarketClient.state.global.getAll();

              // Get the base token price from oracle
              const oracleAppId = Number(market.oracleAppId || 0);
              let baseTokenPrice = 0;

              if (oracleAppId > 0) {
                baseTokenPrice = await getPricing({
                  tokenId: baseTokenId,
                  address,
                  signer,
                  appId: oracleAppId,
                });
              }

              // Calculate LST price per token using collateralUSDFromLST for 1 token (1e6 micro units)
              if (
                baseTokenPrice > 0 &&
                lstMarketState.totalDeposits &&
                lstMarketState.circulatingLst
              ) {
                const oneTokenAmount = BigInt(1e6); // 1 token in micro units
                const pricePerTokenUSDMicro = collateralUSDFromLST(
                  oneTokenAmount,
                  lstMarketState.totalDeposits,
                  lstMarketState.circulatingLst,
                  BigInt(Math.floor(baseTokenPrice * 1e6)) // Convert to micro USD
                );
                currentCollateralPrice = Number(pricePerTokenUSDMicro) / 1e6; // Convert back to USD
              }
            } catch (error) {
              console.warn(
                "Failed to calculate current collateral price:",
                error
              );
            }
          }
        }

        // Calculate liquidation price (price at which collateral value equals debt * liquidation threshold)
        // Formula: liquidationPrice = (debtValueUSD * liquidationThreshold) / collateralAmount
        const liquidationPrice =
          collateralAmountInTokens > 0
            ? (debtValueUSD * (Number(market.liquidationThreshold) / 100)) /
              collateralAmountInTokens
            : 0;

        // Calculate buyout cost using the correct contract formula
        const buyoutCalculation = calculateBuyoutCost(
          debtValueUSD,
          collateralValueUSD,
          healthRatio,
          Number(market.liquidationThreshold) / 100,
          currentDebt // Pass the debt token amount
        );

        const debtPosition: DebtPosition = {
          id: `${record.borrowerAddress}-${record.marketId}`,
          debtToken: {
            symbol: debtTokenMeta.symbol,
            name: debtTokenMeta.name,
            id: record.borrowedTokenId.toString(),
          },
          collateralToken: {
            symbol: collateralTokenMeta.symbol,
            name: collateralTokenMeta.name,
            id: record.collateralTokenId.toString(),
          },
          userAddress: record.borrowerAddress,
          totalDebt: currentDebt,
          totalDebtUSD: debtValueUSD,
          totalCollateral: collateralValueUSD,
          totalCollateralTokens: collateralAmountInTokens,
          healthRatio: healthRatio,
          liquidationThreshold: Number(market.liquidationThreshold) / 100,
          buyoutCost: buyoutCalculation.totalCost,
          buyoutDebtRepayment: buyoutCalculation.debtRepayment,
          buyoutDebtRepaymentTokens: buyoutCalculation.debtRepaymentTokens,
          buyoutPremium: buyoutCalculation.premium,
          buyoutPremiumTokens: buyoutCalculation.premiumTokens,
          liquidationBonus: 7.5, // Default liquidation bonus - could be made configurable
          marketId: record.marketId,
          lastUpdated: new Date(),
          liquidationPrice: liquidationPrice,
          currentCollateralPrice: currentCollateralPrice,
        };

        debtPositions.push(debtPosition);
      } catch (error) {
        console.warn(
          `Failed to transform loan record for ${record.borrowerAddress}:`,
          error
        );
        // Continue with other records
      }
    }

    return debtPositions;
  } catch (error) {
    console.error("Failed to transform loan records:", error);
    throw new Error("Failed to transform loan records to debt positions");
  }
}

// All amounts/prices are integers; NEVER use floats.
// Units:
// - Prices are in micro-USD per token (µUSD/token), same as on-chain oracle
// - USD_MICRO_UNITS = 1_000_000
// - BASIS_POINTS = 10_000
// - debtBaseTokens, collateralAmount, premiumTokens are in token base units (uint64-scale on-chain)

type BuyoutInputs = {
  collateralAmount: bigint;             // collateral token amount (units)
  collateralPriceMicroUSD: bigint;      // µUSD per collateral token
  debtBaseTokens: bigint;               // live debt in base token units (must match post-accrual snapshot)
  baseTokenPriceMicroUSD: bigint;       // µUSD per base token
  liqThresholdBps: bigint;              // e.g., 8500n
  buyoutTokenPriceMicroUSD: bigint;     // µUSD per buyout token (xUSD likely 1_000_000n, but use oracle!)
};

type BuyoutQuote = {
  collateralUSD_micro: bigint;   // µUSD
  debtUSD_micro: bigint;         // µUSD
  CR_bps: bigint;                // basis points
  premiumRateBps: bigint;        // basis points
  premiumUSD_micro: bigint;      // µUSD
  premiumTokens: bigint;         // buyout token units (floored)
  debtRepaymentTokens: bigint;   // base token units (exact debtBaseTokens)
  totalCostUSD_micro: bigint;    // µUSD (debt + premium) for display if needed
};

const BASIS_POINTS = 10_000n;
const USD_MICRO_UNITS = 1_000_000n;

export function quoteBuyoutExact(i: BuyoutInputs): BuyoutQuote {
  // collateralUSD = collateralAmount * price / 1e6
  const collateralUSD_micro = (i.collateralAmount * i.collateralPriceMicroUSD) / USD_MICRO_UNITS;

  // debtUSD = debtTokens * price / 1e6
  const debtUSD_micro = (i.debtBaseTokens * i.baseTokenPriceMicroUSD) / USD_MICRO_UNITS;

  if (debtUSD_micro <= 0n) {
    throw new Error("BAD_DEBT_USD");
  }

  // CR_bps = (collateralUSD * 10_000) / debtUSD
  const CR_bps = (collateralUSD_micro * BASIS_POINTS) / debtUSD_micro;

  // premiumRateBps = max(0, (CR_bps * 10_000 / liqThresh) - 10_000)
  let premiumRateBps = 0n;
  if (CR_bps > i.liqThresholdBps) {
    premiumRateBps = ((CR_bps * BASIS_POINTS) / i.liqThresholdBps) - BASIS_POINTS;
  }

  // premiumUSD = collateralUSD * premiumRateBps / 10_000
  const premiumUSD_micro = (collateralUSD_micro * premiumRateBps) / BASIS_POINTS;

  // premiumTokens = premiumUSD * 1e6 / buyoutTokenPrice_µUSD
  const premiumTokens =
    i.buyoutTokenPriceMicroUSD === 0n
      ? 0n
      : (premiumUSD_micro * USD_MICRO_UNITS) / i.buyoutTokenPriceMicroUSD; // floor

  const totalCostUSD_micro = debtUSD_micro + premiumUSD_micro;

  return {
    collateralUSD_micro,
    debtUSD_micro,
    CR_bps,
    premiumRateBps,
    premiumUSD_micro,
    premiumTokens,
    debtRepaymentTokens: i.debtBaseTokens,
    totalCostUSD_micro,
  };
}

/**
 * Legacy wrapper function to maintain compatibility with existing code
 * Converts float inputs to bigint and calls the new quoteBuyoutExact function
 */
function calculateBuyoutCost(
  _debt: number, // Unused - calculated from debtTokenAmount and price
  collateralValue: number,
  _currentCR: number, // Unused - calculated from collateral and debt values
  liquidationThreshold: number,
  debtTokenAmount: number,
  xUSDPrice: number = 1.0 // Assuming xUSD is $1, can be passed as parameter
): { 
  totalCost: number; 
  debtRepayment: number; 
  debtRepaymentTokens: number;
  premium: number;
  premiumTokens: number;
} {
  // Convert inputs to bigint format
  const inputs: BuyoutInputs = {
    collateralAmount: BigInt(Math.floor(collateralValue * 1e6)), // Convert USD to micro-USD as collateral amount
    collateralPriceMicroUSD: 1_000_000n, // $1 per unit since collateralValue is already in USD
    debtBaseTokens: BigInt(Math.floor(debtTokenAmount * 1e6)), // Convert to micro units
    baseTokenPriceMicroUSD: BigInt(Math.floor(xUSDPrice * 1e6)), // Convert to micro-USD
    liqThresholdBps: BigInt(Math.floor(liquidationThreshold * 10000)), // Convert to basis points
    buyoutTokenPriceMicroUSD: BigInt(Math.floor(xUSDPrice * 1e6)), // Convert to micro-USD
  };

  const quote = quoteBuyoutExact(inputs);

  return {
    totalCost: Number(quote.totalCostUSD_micro) / 1e6,
    debtRepayment: Number(quote.debtUSD_micro) / 1e6,
    debtRepaymentTokens: Number(quote.debtRepaymentTokens) / 1e6,
    premium: Number(quote.premiumUSD_micro) / 1e6,
    premiumTokens: Number(quote.premiumTokens) / 1e6
  };
}

/**
 * Fetches debt positions ready for marketplace display
 */
export async function fetchDebtPositions(
  signer: TransactionSigner,
  address: string
): Promise<DebtPosition[]> {
  try {
    // 1. Fetch all loan records
    const loanRecords = await fetchAllLoanRecords(signer, address);

    // 2. Transform to debt positions
    const debtPositions = await transformLoanRecordsToDebtPositions(
      loanRecords,
      signer,
      address
    );

    return debtPositions;
  } catch (error) {
    console.error("Failed to fetch debt positions:", error);
    throw new Error("Failed to fetch debt positions");
  }
}
