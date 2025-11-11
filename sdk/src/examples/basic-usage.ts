/**
 * Basic usage examples for the Orbital Finance SDK
 */

import algosdk from 'algosdk';
import { OrbitalSDK } from '../index';

// Example: Initialize SDK
async function initializeSDK() {
  // Create Algod client
  const algodClient = new algosdk.Algodv2(
    '',
    'https://testnet-api.algonode.cloud',
    ''
  );

  // Initialize SDK
  const sdk = new OrbitalSDK({
    algodClient,
    network: 'testnet',
  });

  return sdk;
}

// Example: Fetch market data
async function fetchMarketData() {
  const sdk = await initializeSDK();
  
  // Replace with actual market app ID
  const marketAppId = 123456789;
  
  try {
    const market = await sdk.getMarket(marketAppId);
    
    console.log('Market Data:');
    console.log('  Supply APY:', market.supplyApy.toFixed(2) + '%');
    console.log('  Borrow APY:', market.borrowApy.toFixed(2) + '%');
    console.log('  Utilization:', market.utilizationRate.toFixed(2) + '%');
    console.log('  Total Deposits:', market.totalDeposits.toFixed(6));
    console.log('  Total Borrows:', market.totalBorrows.toFixed(6));
    console.log('  Available to Borrow:', market.availableToBorrow.toFixed(6));
    console.log('  Circulating LST:', market.circulatingLST.toFixed(6));
    
    return market;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}

// Example: Get APY
async function getAPY() {
  const sdk = await initializeSDK();
  const marketAppId = 123456789;
  
  try {
    const apy = await sdk.getAPY(marketAppId);
    
    console.log('APY Information:');
    console.log('  Supply APY:', apy.supplyApy.toFixed(2) + '%');
    console.log('  Borrow APY:', apy.borrowApy.toFixed(2) + '%');
    console.log('  Utilization Rate:', apy.utilizationRate.toFixed(2) + '%');
    
    return apy;
  } catch (error) {
    console.error('Error fetching APY:', error);
    throw error;
  }
}

// Example: Get LST Price
async function getLSTPrice() {
  const sdk = await initializeSDK();
  const marketAppId = 123456789;
  
  try {
    const lstPrice = await sdk.getLSTPrice(marketAppId);
    
    console.log('LST Price Information:');
    console.log('  Price (1 LST =', lstPrice.price.toFixed(6), 'underlying tokens)');
    console.log('  Total Deposits:', lstPrice.totalDeposits.toString());
    console.log('  Circulating LST:', lstPrice.circulatingLST.toString());
    console.log('  Exchange Rate:', lstPrice.exchangeRate.toFixed(6));
    
    return lstPrice;
  } catch (error) {
    console.error('Error fetching LST price:', error);
    throw error;
  }
}

// Example: Get user position
async function getUserPosition() {
  const sdk = await initializeSDK();
  const marketAppId = 123456789;
  const userAddress = 'YOUR_ALGORAND_ADDRESS';
  
  try {
    const position = await sdk.getUserPosition(marketAppId, userAddress);
    
    console.log('User Position:');
    console.log('  Supplied:', position.supplied.toFixed(6));
    console.log('  LST Balance:', position.lstBalance.toFixed(6));
    console.log('  Borrowed:', position.borrowed.toFixed(6));
    console.log('  Collateral:', position.collateral.toFixed(6));
    console.log('  Health Factor:', position.healthFactor.toFixed(2));
    console.log('  Is Liquidatable:', position.isLiquidatable);
    
    return position;
  } catch (error) {
    console.error('Error fetching user position:', error);
    throw error;
  }
}

// Main function to run examples
async function main() {
  console.log('=== Orbital Finance SDK Examples ===\n');
  
  try {
    await fetchMarketData();
    console.log('\n---\n');
    await getAPY();
    console.log('\n---\n');
    await getLSTPrice();
    console.log('\n---\n');
    // Uncomment to test user position
    // await getUserPosition();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export functions for use in other modules
export {
  initializeSDK,
  fetchMarketData,
  getAPY,
  getLSTPrice,
  getUserPosition,
};

// Run main if this file is executed directly
if (require.main === module) {
  main();
}

