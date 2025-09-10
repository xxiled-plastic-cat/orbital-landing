import { TransactionSigner } from "algosdk";
import { getExistingClient } from "../contracts/lending/getClient";
import { LoanRecordData, DebtPosition, AssetMetadata } from "../types/lending";
import { fetchMarkets, fetchAssetMetadata } from "./markets";
import { getPricing } from "../contracts/oracle/pricing";
import { liveDebtFromSnapshot, collateralUSDFromLST } from "../contracts/lending/testing-utils";
import { getAcceptedCollateral } from "../contracts/lending/state";

// Testnet collateral token metadata (matching useCollateralTokens.ts)
const TESTNET_COLLATERAL_TOKENS: Record<string, {
  symbol: string;
  name: string;
  decimals: number;
  image?: string;
}> = {
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
          Number(market.id)
        );
        
        // Add market ID to each record
        const recordsWithMarket = marketLoanRecords.map(record => ({
          ...record,
          marketId: market.id
        }));
        
        allLoanRecords.push(...recordsWithMarket);
      } catch (error) {
        console.warn(`Failed to fetch loan records for market ${market.id}:`, error);
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
): Promise<Omit<LoanRecordData, 'marketId'>[]> {
  try {
    const appClient = await getExistingClient(signer, address, appId);
    
    // Get all loan records from the box map
    const loanRecordsMap = await appClient.state.box.loanRecord.getMap();
    
    const loanRecords: Omit<LoanRecordData, 'marketId'>[] = [];
    
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
    loanRecords.forEach(record => {
      assetIds.add(record.borrowedTokenId.toString());
      assetIds.add(record.collateralTokenId.toString());
    });

    // Fetch asset metadata
    const assetMetadata = await fetchAssetMetadata(Array.from(assetIds));
    const metadataMap = new Map<string, AssetMetadata>();
    
    // First add the fetched metadata
    assetMetadata.forEach(meta => metadataMap.set(meta.id, meta));
    
    // Then override with collateral token metadata for better accuracy
    Object.entries(TESTNET_COLLATERAL_TOKENS).forEach(([assetId, tokenInfo]) => {
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
    });

    // Get markets for additional context
    const markets = await fetchMarkets(signer, address);
    const marketsMap = new Map(markets.map(m => [m.id, m]));

    const debtPositions: DebtPosition[] = [];

    for (const record of loanRecords) {
      try {
        const market = marketsMap.get(record.marketId);
        if (!market) continue;

        // Get asset metadata
        const debtTokenMeta = metadataMap.get(record.borrowedTokenId.toString());
        const collateralTokenMeta = metadataMap.get(record.collateralTokenId.toString());

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
                   console.warn('Failed to get debt token price:', error);
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
            if (collateral.assetId.toString() === record.collateralTokenId.toString()) {
              acceptedCollateralInfo = collateral;
              break;
            }
          }
          
        } catch (error) {
          console.warn('Failed to get accepted collateral info:', error);
        }
        
        if (acceptedCollateralInfo) {
          // All collateral is LST tokens - get the correct base token info and LST market data
          const lstMarketAppId = Number(acceptedCollateralInfo.marketBaseAssetId);
          const baseTokenId = Number(acceptedCollateralInfo.baseAssetId);
          
          
          try {
            // Get the LST market data (where this LST token originated)
            const lstMarketClient = await getExistingClient(signer, address, lstMarketAppId);
            const lstMarketState = await lstMarketClient.state.global.getAll();
            
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
            
            
            if (baseTokenPrice > 0 && lstMarketState.totalDeposits && lstMarketState.circulatingLst) {
              // Calculate LST value using the collateralUSDFromLST helper function
              const collateralValueUSDMicro = collateralUSDFromLST(
                record.collateralAmount, // LST amount in micro units
                lstMarketState.totalDeposits, // Total deposits from LST market
                lstMarketState.circulatingLst, // Circulating LST from LST market
                BigInt(Math.floor(baseTokenPrice * 1e6)) // Base token price in micro USD
              );
              
              collateralValueUSD = Number(collateralValueUSDMicro) / 1e6;
            } else {
              console.warn('Missing data for LST calculation, using fallback');
              collateralValueUSD = currentDebt * 1.5;
            }
          } catch (error) {
            console.warn('Failed to get LST market data:', error);
            collateralValueUSD = currentDebt * 1.5;
          }
        } else {
          // Fallback if we can't find accepted collateral info
          console.warn('No accepted collateral info found, using fallback');
          collateralValueUSD = currentDebt * 1.5;
        }
        
        // Calculate health ratio (collateral ratio)
               const healthRatio = debtValueUSD > 0 ? collateralValueUSD / debtValueUSD : 0;

        // Calculate collateral amount in tokens (convert from micro units)
        const collateralAmountInTokens = Number(record.collateralAmount) / 1e6;
        
        // Calculate liquidation price (price at which collateral value equals debt * liquidation threshold)
        // Formula: liquidationPrice = (debtValueUSD * liquidationThreshold) / collateralAmount
        const liquidationPrice = collateralAmountInTokens > 0
          ? (debtValueUSD * (Number(market.liquidationThreshold) / 100)) / collateralAmountInTokens
          : 0;

        // Calculate buyout cost using the marketplace formula
        const buyoutCost = calculateBuyoutCost(
          debtValueUSD,
          collateralValueUSD,
          healthRatio,
          Number(market.liquidationThreshold) / 100
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
          buyoutCost,
          liquidationBonus: 7.5, // Default liquidation bonus - could be made configurable
          marketId: record.marketId,
          lastUpdated: new Date(),
          liquidationPrice: liquidationPrice,
        };

        debtPositions.push(debtPosition);
      } catch (error) {
        console.warn(`Failed to transform loan record for ${record.borrowerAddress}:`, error);
        // Continue with other records
      }
    }

    return debtPositions;
  } catch (error) {
    console.error("Failed to transform loan records:", error);
    throw new Error("Failed to transform loan records to debt positions");
  }
}



/**
 * Calculates buyout cost using the marketplace formula
 * Price = Debt + (Collateral - Debt) × PremiumRate
 */
function calculateBuyoutCost(
  debt: number,
  collateralValue: number,
  currentCR: number,
  liquidationThreshold: number
): number {
  // Premium rate scales from 0 as CR moves above liquidation threshold
  // This is a simplified version - you may want to adjust the formula
  const premiumRate = Math.max(0, (currentCR - liquidationThreshold) * 0.5);
  
  return debt + (collateralValue - debt) * premiumRate;
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
