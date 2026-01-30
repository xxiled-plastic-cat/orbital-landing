import { TransactionSigner } from "algosdk";
import { getExistingClient } from "../contracts/lending/getClient";
import { LoanRecordData, DebtPosition, AssetMetadata } from "../types/lending";
import { fetchMarkets, fetchAssetMetadata } from "./markets";
import {
  liveDebtFromSnapshot,
} from "../contracts/lending/testing-utils";
import { getAcceptedCollateral } from "../contracts/lending/state";
import { quoteBuyoutExact } from "./loanRecords";

// Buyout inputs interface (copied from loanRecords.ts)
interface BuyoutInputs {
  collateralAmount: bigint;
  collateralPriceMicroUSD: bigint;
  debtBaseTokens: bigint;
  baseTokenPriceMicroUSD: bigint;
  liqThresholdBps: bigint;
  buyoutTokenPriceMicroUSD: bigint;
}

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
  "748908019": {
    symbol: "cCOMPXt",
    name: "Collateralized COMPX Testnet",
    decimals: 6,
    image: "/COMPXt.svg",
  },
  "748908221": {
    symbol: "cxUSDt",
    name: "Collateralized xUSDt Testnet",
    decimals: 6,
    image: "/xUSDt.svg",
  },
};

// Price fetching interface for dependency injection
interface PriceFetcher {
  getBaseTokenPrice: (tokenId: number, oracleAppId: number) => Promise<number>;
  getLSTTokenPrice: (
    tokenId: string, 
    marketId: string, 
    lstParams: {
      lstAmount: bigint;
      totalDeposits: bigint;
      circulatingLst: bigint;
      baseTokenPrice: number;
    }
  ) => Promise<number>;
}

/**
 * Optimized version of transformLoanRecordsToDebtPositions that uses cached pricing
 */
export async function transformLoanRecordsToDebtPositionsOptimized(
  loanRecords: LoanRecordData[],
  signer: TransactionSigner,
  address: string,
  priceFetcher: PriceFetcher
): Promise<DebtPosition[]> {
  try {
    console.log(`Processing ${loanRecords.length} loan records with optimized pricing`);
    
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

    // OPTIMIZATION: Pre-fetch accepted collateral for all markets in parallel
    console.log('Pre-fetching accepted collateral for all markets...');
    const acceptedCollateralCache = new Map<string, Map<string, any>>();
    const collateralPromises = Array.from(marketsMap.keys()).map(async (marketId) => {
      try {
        const acceptedCollaterals = await getAcceptedCollateral(
          address,
          Number(marketId),
          signer
        );
        acceptedCollateralCache.set(marketId, acceptedCollaterals);
      } catch (error) {
        console.warn(`Failed to fetch accepted collateral for market ${marketId}:`, error);
        acceptedCollateralCache.set(marketId, new Map());
      }
    });
    await Promise.allSettled(collateralPromises);
    console.log(`Cached accepted collateral for ${acceptedCollateralCache.size} markets`);

    // OPTIMIZATION: Pre-fetch LST market states for all unique LST markets
    console.log('Pre-fetching LST market states...');
    const lstMarketStateCache = new Map<string, any>();
    const uniqueLstMarketIds = new Set<string>();
    
    // Collect all unique LST market IDs from accepted collateral
    acceptedCollateralCache.forEach((collaterals) => {
      collaterals.forEach((collateral) => {
        const originatingAppId = collateral.originatingAppId?.toString();
        if (originatingAppId) {
          uniqueLstMarketIds.add(originatingAppId);
        }
      });
    });

    const lstStatePromises = Array.from(uniqueLstMarketIds).map(async (lstMarketId) => {
      try {
        const lstMarketClient = await getExistingClient(
          signer,
          address,
          Number(lstMarketId)
        );
        const lstMarketState = await lstMarketClient.state.global.getAll();
        lstMarketStateCache.set(lstMarketId, lstMarketState);
      } catch (error) {
        console.warn(`Failed to fetch LST market state for ${lstMarketId}:`, error);
      }
    });
    await Promise.allSettled(lstStatePromises);
    console.log(`Cached LST market states for ${lstMarketStateCache.size} markets`);

    // OPTIMIZATION: Process positions in parallel batches (batch size of 10 to avoid overwhelming)
    const BATCH_SIZE = 10;
    const debtPositions: DebtPosition[] = [];

    // Process loan records in batches
    for (let i = 0; i < loanRecords.length; i += BATCH_SIZE) {
      const batch = loanRecords.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (record) => {
      try {
        const market = marketsMap.get(record.marketId);
        if (!market) return null;

        // Get asset metadata
        const debtTokenMeta = metadataMap.get(
          record.borrowedTokenId.toString()
        );
        const collateralTokenMeta = metadataMap.get(
          record.collateralTokenId.toString()
        );

        if (!debtTokenMeta || !collateralTokenMeta) return null;

        // Calculate current debt with accrued interest
        const borrowIndexWad = BigInt(market.borrowIndexWad || 0);
        const currentDebtBigInt = liveDebtFromSnapshot(
          record.principal,
          record.userIndexWad,
          borrowIndexWad
        );
        const currentDebt = Number(currentDebtBigInt) / Math.pow(10, market.baseTokenDecimals ?? 6);

        // Get fresh debt token price from oracle
        let debtTokenPrice = 0;
        const oracleAppId = Number(market.oracleAppId || 0);
        
        if (oracleAppId > 0) {
          try {
            debtTokenPrice = await priceFetcher.getBaseTokenPrice(
              Number(record.borrowedTokenId),
              oracleAppId
            );
          } catch (error) {
            console.warn(`Failed to get debt token price for ${record.borrowedTokenId}:`, error);
          }
        }
        
        const debtValueUSD = currentDebt * debtTokenPrice;

        // Calculate collateral value in USD
        let collateralValueUSD = 0;
        let currentCollateralPrice = 0;

        // Get accepted collateral information from cache
        let acceptedCollateralInfo = null;
        const cachedCollaterals = acceptedCollateralCache.get(record.marketId);
        if (cachedCollaterals) {
          // Find the collateral info for this specific token
          for (const [, collateral] of cachedCollaterals.entries()) {
            if (
              collateral.assetId.toString() ===
              record.collateralTokenId.toString()
            ) {
              acceptedCollateralInfo = collateral;
              break;
            }
          }
        }

        if (acceptedCollateralInfo) {
          const baseTokenId = Number(acceptedCollateralInfo.baseAssetId);
          const originatingAppId = Number(acceptedCollateralInfo.originatingAppId);

          // Find the LST market using the originatingAppId (home market of the LST token)
          const lstMarket = markets.find(
            (m) => Number(m.id) === originatingAppId
          );

          if (lstMarket) {
            // Get the LST market data from cache
            const lstMarketState = lstMarketStateCache.get(originatingAppId.toString());

            // Get fresh base token price from oracle
            let baseTokenPrice = 0;
            if (oracleAppId > 0) {
              try {
                baseTokenPrice = await priceFetcher.getBaseTokenPrice(
                  baseTokenId,
                  oracleAppId
                );
              } catch (error) {
                console.warn(`Failed to get base token price for ${baseTokenId}:`, error);
              }
            }

            if (
              lstMarketState &&
              baseTokenPrice > 0 &&
              lstMarketState.totalDeposits &&
              lstMarketState.circulatingLst
            ) {
              // Use cached LST price calculation
              const lstParams = {
                lstAmount: record.collateralAmount,
                totalDeposits: lstMarketState.totalDeposits,
                circulatingLst: lstMarketState.circulatingLst,
                baseTokenPrice: baseTokenPrice,
                lstTokenDecimals: lstMarket.lstTokenDecimals,
                baseTokenDecimals: lstMarket.baseTokenDecimals,
              };

              currentCollateralPrice = await priceFetcher.getLSTTokenPrice(
                record.collateralTokenId.toString(),
                record.marketId,
                lstParams
              );

              // Calculate total collateral value
              const collateralAmountInTokens = Number(record.collateralAmount) / Math.pow(10, lstMarket.lstTokenDecimals ?? 6);
              collateralValueUSD = collateralAmountInTokens * currentCollateralPrice;
            } else {
              // Fallback if missing LST market state or price data
              collateralValueUSD = debtValueUSD * 1.5;
              const lstDecimals = lstMarket?.lstTokenDecimals ?? 6;
              const collateralAmountInTokens = Number(record.collateralAmount) / Math.pow(10, lstDecimals);
              currentCollateralPrice = collateralAmountInTokens > 0 ? collateralValueUSD / collateralAmountInTokens : 0;
            }
          } else {
            // Fallback if LST market not found
            collateralValueUSD = debtValueUSD * 1.5;
            const collateralAmountInTokens = Number(record.collateralAmount) / Math.pow(10, 6); // Default to 6 if market not found
            currentCollateralPrice = collateralAmountInTokens > 0 ? collateralValueUSD / collateralAmountInTokens : 0;
          }
        } else {
          // Fallback if no accepted collateral info
          collateralValueUSD = debtValueUSD * 1.5;
          const collateralAmountInTokens = Number(record.collateralAmount) / Math.pow(10, 6); // Default to 6 if no info
          currentCollateralPrice = collateralAmountInTokens > 0 ? collateralValueUSD / collateralAmountInTokens : 0;
        }

        // Calculate health ratio
        const healthRatio =
          debtValueUSD > 0 ? collateralValueUSD / debtValueUSD : 0;

        // Calculate collateral amount in tokens (use lstMarket decimals if available)
        const lstMarket = markets.find((m) => {
          const cachedCollaterals = acceptedCollateralCache.get(record.marketId);
          if (cachedCollaterals) {
            for (const [, collateral] of cachedCollaterals.entries()) {
              if (collateral.assetId.toString() === record.collateralTokenId.toString()) {
                return Number(m.id) === Number(collateral.originatingAppId);
              }
            }
          }
          return false;
        });
        const collateralAmountInTokens = Number(record.collateralAmount) / Math.pow(10, lstMarket?.lstTokenDecimals ?? 6);

        // Calculate liquidation price
        // Liquidation occurs when: Debt >= LiquidationThreshold × CollateralValue
        // So: Debt >= LT × (CollateralAmount × Price)
        // Solving for Price: Price = Debt / (LT × CollateralAmount)
        const liquidationPrice =
          collateralAmountInTokens > 0
            ? debtValueUSD / (collateralAmountInTokens * (Number(market.liquidationThreshold) / 100))
            : 0;

        // Fetch live buyout token price from oracle (typically xUSD, but could be other stable tokens)
        let buyoutTokenPrice = 1.0; // Default fallback
        if (oracleAppId > 0 && market.buyoutTokenId) {
          try {
            buyoutTokenPrice = await priceFetcher.getBaseTokenPrice(
              market.buyoutTokenId,
              oracleAppId
            );
          } catch (error) {
            console.warn(`Failed to get buyout token price for ${market.buyoutTokenId}, using fallback $1:`, error);
          }
        }

        // Calculate buyout cost using the optimized bigint function
        // USD prices are always in micro USD (6 decimals)
        const buyoutInputs: BuyoutInputs = {
          collateralAmount: record.collateralAmount,
          collateralPriceMicroUSD: BigInt(Math.floor(currentCollateralPrice * 1e6)),
          debtBaseTokens: currentDebtBigInt,
          baseTokenPriceMicroUSD: BigInt(Math.floor(debtTokenPrice * 1e6)),
          liqThresholdBps: BigInt(Math.floor(Number(market.liquidationThreshold) * 100)),
          buyoutTokenPriceMicroUSD: BigInt(Math.floor(buyoutTokenPrice * 1e6)), // Use live oracle price (USD always 6 decimals)
        };

        const buyoutQuote = quoteBuyoutExact(buyoutInputs);

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
          buyoutCost: Number(buyoutQuote.totalCostUSD_micro) / 1e6, // USD always 6 decimals
          buyoutDebtRepayment: Number(buyoutQuote.debtUSD_micro) / 1e6, // USD always 6 decimals
          buyoutDebtRepaymentTokens: Number(buyoutQuote.debtRepaymentTokens) / Math.pow(10, market.baseTokenDecimals ?? 6),
          buyoutPremium: Number(buyoutQuote.premiumUSD_micro) / 1e6, // USD always 6 decimals
          buyoutPremiumTokens: Number(buyoutQuote.premiumTokens) / 1e6, // xUSD typically has 6 decimals
          liquidationBonus: market.liqBonusBps ? market.liqBonusBps / 100 : 7.5, // Convert basis points to percentage
          marketId: record.marketId,
          lastUpdated: new Date(),
          liquidationPrice: liquidationPrice,
          currentCollateralPrice: currentCollateralPrice,
        };

        return debtPosition;
      } catch (error) {
        console.warn(
          `Failed to transform loan record for ${record.borrowerAddress}:`,
          error
        );
        // Return null for failed records
        return null;
      }
      });

      // Wait for batch to complete and filter out nulls
      const batchResults = await Promise.allSettled(batchPromises);
      const successfulPositions = batchResults
        .map((result) => result.status === 'fulfilled' ? result.value : null)
        .filter((pos): pos is DebtPosition => pos !== null);
      
      debtPositions.push(...successfulPositions);
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(loanRecords.length / BATCH_SIZE)}: ${successfulPositions.length}/${batch.length} positions`);
    }

    console.log(`Successfully processed ${debtPositions.length} debt positions with optimized pricing`);
    return debtPositions;
  } catch (error) {
    console.error("Failed to transform loan records:", error);
    throw new Error("Failed to transform loan records to debt positions");
  }
}
