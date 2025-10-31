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

    // We'll fetch oracle prices fresh for each position since they're quick to get

    const debtPositions: DebtPosition[] = [];

    // Process each loan record
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

        // Calculate current debt with accrued interest
        const borrowIndexWad = BigInt(market.borrowIndexWad || 0);
        const currentDebtBigInt = liveDebtFromSnapshot(
          record.principal,
          record.userIndexWad,
          borrowIndexWad
        );
        const currentDebt = Number(currentDebtBigInt) / 1e6;

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

        // Get accepted collateral information for this market
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
          const baseTokenId = Number(acceptedCollateralInfo.baseAssetId);
          const originatingAppId = Number(acceptedCollateralInfo.originatingAppId);

          // Find the LST market using the originatingAppId (home market of the LST token)
          const lstMarket = markets.find(
            (m) => Number(m.id) === originatingAppId
          );

          console.log(`Looking for LST market with ID ${originatingAppId}, found:`, lstMarket ? `${lstMarket.name} (${lstMarket.id})` : 'NOT FOUND');

          if (lstMarket) {
            try {
              // Get the LST market data
              const lstMarketClient = await getExistingClient(
                signer,
                address,
                Number(lstMarket.id)
              );
              const lstMarketState =
                await lstMarketClient.state.global.getAll();

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

              console.log(`LST Calculation Debug for ${record.collateralTokenId}:`, {
                baseTokenPrice,
                totalDeposits: lstMarketState.totalDeposits?.toString(),
                circulatingLst: lstMarketState.circulatingLst?.toString(),
                collateralAmount: record.collateralAmount.toString()
              });

              if (
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
                };

                console.log(`Calling getLSTTokenPrice with params:`, lstParams);
                currentCollateralPrice = await priceFetcher.getLSTTokenPrice(
                  record.collateralTokenId.toString(),
                  record.marketId,
                  lstParams
                );
                console.log(`LST price result: ${currentCollateralPrice}`);

                // Calculate total collateral value
                const collateralAmountInTokens = Number(record.collateralAmount) / 1e6;
                collateralValueUSD = collateralAmountInTokens * currentCollateralPrice;
                
                console.log(`Collateral calculation: ${collateralAmountInTokens} tokens * $${currentCollateralPrice} = $${collateralValueUSD}`);
              } else {
                console.warn(
                  "Missing data for LST calculation, using fallback",
                  {
                    baseTokenPrice,
                    hasTotalDeposits: !!lstMarketState.totalDeposits,
                    hasCirculatingLst: !!lstMarketState.circulatingLst
                  }
                );
                collateralValueUSD = debtValueUSD * 1.5;
                // Calculate fallback price based on collateral amount
                const collateralAmountInTokens = Number(record.collateralAmount) / 1e6;
                currentCollateralPrice = collateralAmountInTokens > 0 ? collateralValueUSD / collateralAmountInTokens : 0;
                console.log(`Using fallback collateral price: $${currentCollateralPrice} per token`);
              }
            } catch (error) {
              console.warn("Failed to get LST market data:", error);
              collateralValueUSD = debtValueUSD * 1.5;
              // Calculate fallback price based on collateral amount
              const collateralAmountInTokens = Number(record.collateralAmount) / 1e6;
              currentCollateralPrice = collateralAmountInTokens > 0 ? collateralValueUSD / collateralAmountInTokens : 0;
              console.log(`Using fallback collateral price (error case): $${currentCollateralPrice} per token`);
            }
          } else {
            console.warn(
              `No LST market found for originating app ID ${originatingAppId}, using fallback`
            );
            collateralValueUSD = debtValueUSD * 1.5;
            // Calculate fallback price based on collateral amount
            const collateralAmountInTokens = Number(record.collateralAmount) / 1e6;
            currentCollateralPrice = collateralAmountInTokens > 0 ? collateralValueUSD / collateralAmountInTokens : 0;
            console.log(`Using fallback collateral price (no LST market): $${currentCollateralPrice} per token`);
          }
        } else {
          console.warn("No accepted collateral info found, using fallback");
          collateralValueUSD = debtValueUSD * 1.5;
          // Calculate fallback price based on collateral amount
          const collateralAmountInTokens = Number(record.collateralAmount) / 1e6;
          currentCollateralPrice = collateralAmountInTokens > 0 ? collateralValueUSD / collateralAmountInTokens : 0;
          console.log(`Using fallback collateral price (no collateral info): $${currentCollateralPrice} per token`);
        }

        // Calculate health ratio
        const healthRatio =
          debtValueUSD > 0 ? collateralValueUSD / debtValueUSD : 0;

        // Calculate collateral amount in tokens
        const collateralAmountInTokens = Number(record.collateralAmount) / 1e6;

        // Calculate liquidation price
        // Liquidation occurs when: Debt >= LiquidationThreshold × CollateralValue
        // So: Debt >= LT × (CollateralAmount × Price)
        // Solving for Price: Price = Debt / (LT × CollateralAmount)
        const liquidationPrice =
          collateralAmountInTokens > 0
            ? debtValueUSD / (collateralAmountInTokens * (Number(market.liquidationThreshold) / 100))
            : 0;

        // Calculate buyout cost using the optimized bigint function
        const buyoutInputs: BuyoutInputs = {
          collateralAmount: record.collateralAmount,
          collateralPriceMicroUSD: BigInt(Math.floor(currentCollateralPrice * 1e6)),
          debtBaseTokens: currentDebtBigInt,
          baseTokenPriceMicroUSD: BigInt(Math.floor(debtTokenPrice * 1e6)),
          liqThresholdBps: BigInt(Math.floor(Number(market.liquidationThreshold) * 100)),
          buyoutTokenPriceMicroUSD: 1_000_000n, // Assuming xUSD = $1
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
          buyoutCost: Number(buyoutQuote.totalCostUSD_micro) / 1e6,
          buyoutDebtRepayment: Number(buyoutQuote.debtUSD_micro) / 1e6,
          buyoutDebtRepaymentTokens: Number(buyoutQuote.debtRepaymentTokens) / 1e6,
          buyoutPremium: Number(buyoutQuote.premiumUSD_micro) / 1e6,
          buyoutPremiumTokens: Number(buyoutQuote.premiumTokens) / 1e6,
          liquidationBonus: market.liqBonusBps ? market.liqBonusBps / 100 : 7.5, // Convert basis points to percentage
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

    console.log(`Successfully processed ${debtPositions.length} debt positions with optimized pricing`);
    return debtPositions;
  } catch (error) {
    console.error("Failed to transform loan records:", error);
    throw new Error("Failed to transform loan records to debt positions");
  }
}
