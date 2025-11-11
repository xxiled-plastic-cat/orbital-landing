/**
 * Example: Fetching oracle prices without wallet connection
 */

import algosdk from 'algosdk';
import { OrbitalSDK } from '../index';

// Example: Initialize SDK without wallet
async function initializeSDK() {
  const algodClient = new algosdk.Algodv2(
    '',
    'https://testnet-api.algonode.cloud',
    ''
  );

  const sdk = new OrbitalSDK({
    algodClient,
    network: 'testnet',
  });

  return sdk;
}

// Example: Get single asset price from oracle
async function getSinglePrice() {
  const sdk = await initializeSDK();
  
  // Replace with actual oracle app ID and asset ID
  const oracleAppId = 123456789;
  const assetId = 31566704; // Example: USDCt on testnet
  
  try {
    const price = await sdk.getOraclePrice(oracleAppId, assetId);
    
    console.log('Oracle Price Data:');
    console.log('  Asset ID:', price.assetId);
    console.log('  Price: $' + price.price.toFixed(6));
    console.log('  Price (raw):', price.priceRaw.toString());
    console.log('  Last Updated:', price.lastUpdatedDate.toISOString());
    console.log('  Last Updated (timestamp):', price.lastUpdated);
    
    return price;
  } catch (error) {
    console.error('Error fetching oracle price:', error);
    throw error;
  }
}

// Example: Get multiple asset prices in parallel
async function getMultiplePrices() {
  const sdk = await initializeSDK();
  
  const oracleAppId = 123456789;
  const assetIds = [
    0,          // ALGO
    31566704,   // USDCt
    // Add more asset IDs as needed
  ];
  
  try {
    console.log('Fetching prices for', assetIds.length, 'assets...');
    const priceMap = await sdk.getOraclePrices(oracleAppId, assetIds);
    
    console.log('\nOracle Prices:');
    priceMap.forEach((price, assetId) => {
      console.log(`  Asset ${assetId}: $${price.price.toFixed(6)} (updated: ${price.lastUpdatedDate.toISOString()})`);
    });
    
    return priceMap;
  } catch (error) {
    console.error('Error fetching oracle prices:', error);
    throw error;
  }
}

// Example: Fetch market with real oracle prices
async function getMarketWithPrices() {
  const sdk = await initializeSDK();
  
  const marketAppId = 123456789;
  
  try {
    // 1. Get market data
    const market = await sdk.getMarket(marketAppId);
    console.log('Market:', market.baseTokenId);
    
    // 2. Get oracle price for the base token
    const oraclePrice = await sdk.getOraclePrice(
      market.oracleAppId,
      market.baseTokenId
    );
    
    console.log('\nMarket Data with Oracle Price:');
    console.log('  Base Token Price: $' + oraclePrice.price.toFixed(6));
    console.log('  Total Deposits: $' + (market.totalDeposits * oraclePrice.price).toFixed(2));
    console.log('  Total Borrows: $' + (market.totalBorrows * oraclePrice.price).toFixed(2));
    console.log('  Available to Borrow: $' + (market.availableToBorrow * oraclePrice.price).toFixed(2));
    
    return { market, price: oraclePrice };
  } catch (error) {
    console.error('Error fetching market with prices:', error);
    throw error;
  }
}

// Example: Monitor price updates
async function monitorPriceUpdates() {
  const sdk = await initializeSDK();
  
  const oracleAppId = 123456789;
  const assetId = 31566704;
  
  console.log('Monitoring price updates for asset', assetId);
  console.log('Press Ctrl+C to stop\n');
  
  let lastPrice = 0;
  let lastUpdate = 0;
  
  const checkPrice = async () => {
    try {
      const price = await sdk.getOraclePrice(oracleAppId, assetId);
      
      // Check if price changed
      if (price.price !== lastPrice || price.lastUpdated !== lastUpdate) {
        const change = lastPrice > 0 ? ((price.price - lastPrice) / lastPrice * 100) : 0;
        const changeStr = change > 0 ? `+${change.toFixed(4)}%` : `${change.toFixed(4)}%`;
        
        console.log(`[${new Date().toISOString()}] Price: $${price.price.toFixed(6)} (${changeStr})`);
        
        lastPrice = price.price;
        lastUpdate = price.lastUpdated;
      }
    } catch (error) {
      console.error('Error checking price:', error);
    }
  };
  
  // Check every 10 seconds
  setInterval(checkPrice, 10000);
  
  // Initial check
  await checkPrice();
}

// Main function to run examples
async function main() {
  console.log('=== Orbital Finance SDK - Oracle Price Examples ===\n');
  
  try {
    // Example 1: Single price
    console.log('Example 1: Fetching single asset price');
    await getSinglePrice();
    console.log('\n---\n');
    
    // Example 2: Multiple prices
    console.log('Example 2: Fetching multiple asset prices');
    await getMultiplePrices();
    console.log('\n---\n');
    
    // Example 3: Market with prices
    console.log('Example 3: Market data with oracle prices');
    await getMarketWithPrices();
    console.log('\n---\n');
    
    // Uncomment to monitor prices
    // await monitorPriceUpdates();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export functions for use in other modules
export {
  initializeSDK,
  getSinglePrice,
  getMultiplePrices,
  getMarketWithPrices,
  monitorPriceUpdates,
};

// Run main if this file is executed directly
if (require.main === module) {
  main();
}

