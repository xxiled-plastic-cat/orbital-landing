/**
 * Example: Fetching multiple markets without wallet connection
 */

import algosdk from 'algosdk';
import { OrbitalSDK } from '../index';

// Example: Initialize SDK
async function initializeSDK() {
  const algodClient = new algosdk.Algodv2(
    '',
    'https://testnet-api.algonode.cloud',
    ''
  );

  const sdk = new OrbitalSDK({
    algodClient,
    network: 'testnet',
    // Optional: specify custom API URL
    // apiBaseUrl: 'https://api.orbitalfinance.io'
  });

  return sdk;
}

// Example 1: Fetch specific markets by ID
async function fetchSpecificMarkets() {
  const sdk = await initializeSDK();
  
  const marketIds = [
    12345678,
    23456789,
    34567890,
  ];
  
  try {
    console.log(`Fetching ${marketIds.length} specific markets...`);
    const markets = await sdk.getMarkets(marketIds);
    
    console.log(`\nSuccessfully fetched ${markets.length} markets:`);
    markets.forEach((market) => {
      console.log(`\nMarket ${market.appId}:`);
      console.log(`  Base Token: ${market.baseTokenId}`);
      console.log(`  Supply APY: ${market.supplyApy.toFixed(2)}%`);
      console.log(`  Borrow APY: ${market.borrowApy.toFixed(2)}%`);
      console.log(`  Total Deposits: ${market.totalDeposits.toFixed(2)}`);
      console.log(`  Utilization: ${market.utilizationRate.toFixed(2)}%`);
    });
    
    return markets;
  } catch (error) {
    console.error('Error fetching specific markets:', error);
    throw error;
  }
}

// Example 2: Fetch ALL markets from backend API
async function fetchAllMarkets() {
  const sdk = await initializeSDK();
  
  try {
    console.log('Fetching all markets for testnet...\n');
    const markets = await sdk.getAllMarkets();
    
    console.log(`Found ${markets.length} total markets\n`);
    
    // Display summary statistics
    const totalTVL = markets.reduce((sum, m) => sum + m.totalDepositsUSD, 0);
    const avgUtilization = markets.reduce((sum, m) => sum + m.utilizationRate, 0) / markets.length;
    const avgSupplyAPY = markets.reduce((sum, m) => sum + m.supplyApy, 0) / markets.length;
    
    console.log('=== Market Statistics ===');
    console.log(`Total TVL: $${totalTVL.toFixed(2)}`);
    console.log(`Average Utilization: ${avgUtilization.toFixed(2)}%`);
    console.log(`Average Supply APY: ${avgSupplyAPY.toFixed(2)}%`);
    console.log('\n=== Individual Markets ===');
    
    markets.forEach((market, index) => {
      console.log(`\n${index + 1}. Market ${market.appId}:`);
      console.log(`   Supply APY: ${market.supplyApy.toFixed(2)}% | Borrow APY: ${market.borrowApy.toFixed(2)}%`);
      console.log(`   TVL: $${market.totalDepositsUSD.toFixed(2)} | Util: ${market.utilizationRate.toFixed(1)}%`);
    });
    
    return markets;
  } catch (error) {
    console.error('Error fetching all markets:', error);
    throw error;
  }
}

// Example 3: Fetch market list (faster, no on-chain data)
async function fetchMarketList() {
  const sdk = await initializeSDK();
  
  try {
    console.log('Fetching market list (basic info only)...\n');
    const marketList = await sdk.getMarketList();
    
    console.log(`Found ${marketList.length} markets:\n`);
    marketList.forEach((market, index) => {
      console.log(`${index + 1}. Market ${market.appId}`);
      console.log(`   Base Token: ${market.baseTokenId}`);
      console.log(`   LST Token: ${market.lstTokenId}`);
      console.log(`   Network: ${market.network}`);
    });
    
    return marketList;
  } catch (error) {
    console.error('Error fetching market list:', error);
    throw error;
  }
}

// Example 4: Compare markets
async function compareMarkets() {
  const sdk = await initializeSDK();
  
  try {
    const markets = await sdk.getAllMarkets();
    
    console.log('=== Market Comparison ===\n');
    
    // Find highest yield
    const highestSupplyAPY = markets.reduce((max, m) => 
      m.supplyApy > max.supplyApy ? m : max
    );
    
    console.log(`Highest Supply APY: ${highestSupplyAPY.supplyApy.toFixed(2)}% (Market ${highestSupplyAPY.appId})`);
    
    // Find most utilized
    const mostUtilized = markets.reduce((max, m) => 
      m.utilizationRate > max.utilizationRate ? m : max
    );
    
    console.log(`Highest Utilization: ${mostUtilized.utilizationRate.toFixed(2)}% (Market ${mostUtilized.appId})`);
    
    // Find largest by TVL
    const largestTVL = markets.reduce((max, m) => 
      m.totalDepositsUSD > max.totalDepositsUSD ? m : max
    );
    
    console.log(`Largest TVL: $${largestTVL.totalDepositsUSD.toFixed(2)} (Market ${largestTVL.appId})`);
    
    // Sort by supply APY
    console.log('\n=== Markets by Supply APY ===');
    const sortedByAPY = [...markets].sort((a, b) => b.supplyApy - a.supplyApy);
    sortedByAPY.forEach((market, index) => {
      console.log(`${index + 1}. ${market.supplyApy.toFixed(2)}% - Market ${market.appId}`);
    });
    
    return {
      highestSupplyAPY,
      mostUtilized,
      largestTVL,
    };
  } catch (error) {
    console.error('Error comparing markets:', error);
    throw error;
  }
}

// Example 5: Fetch markets with prices
async function fetchMarketsWithPrices() {
  const sdk = await initializeSDK();
  
  try {
    const markets = await sdk.getAllMarkets();
    
    console.log('Fetching oracle prices for all markets...\n');
    
    // Group markets by oracle
    const marketsByOracle = new Map<number, typeof markets>();
    markets.forEach((market) => {
      const existing = marketsByOracle.get(market.oracleAppId) || [];
      existing.push(market);
      marketsByOracle.set(market.oracleAppId, existing);
    });
    
    // Fetch prices for each oracle
    for (const [oracleAppId, oracleMarkets] of marketsByOracle) {
      const assetIds = oracleMarkets.map((m) => m.baseTokenId);
      const prices = await sdk.getOraclePrices(oracleAppId, assetIds);
      
      console.log(`\nOracle ${oracleAppId} prices:`);
      oracleMarkets.forEach((market) => {
        const price = prices.get(market.baseTokenId);
        if (price) {
          console.log(`  Market ${market.appId}: $${price.price.toFixed(6)}`);
        }
      });
    }
    
    return markets;
  } catch (error) {
    console.error('Error fetching markets with prices:', error);
    throw error;
  }
}

// Main function to run examples
async function main() {
  console.log('=== Orbital Finance SDK - Batch Market Examples ===\n');
  
  try {
    // Example 1: Specific markets
    console.log('Example 1: Fetching specific markets');
    await fetchSpecificMarkets();
    console.log('\n---\n');
    
    // Example 2: All markets
    console.log('Example 2: Fetching all markets');
    await fetchAllMarkets();
    console.log('\n---\n');
    
    // Example 3: Market list only
    console.log('Example 3: Fetching market list (fast)');
    await fetchMarketList();
    console.log('\n---\n');
    
    // Example 4: Compare markets
    console.log('Example 4: Comparing markets');
    await compareMarkets();
    console.log('\n---\n');
    
    // Example 5: Markets with prices
    console.log('Example 5: Fetching markets with oracle prices');
    await fetchMarketsWithPrices();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export functions for use in other modules
export {
  initializeSDK,
  fetchSpecificMarkets,
  fetchAllMarkets,
  fetchMarketList,
  compareMarkets,
  fetchMarketsWithPrices,
};

// Run main if this file is executed directly
if (require.main === module) {
  main();
}

