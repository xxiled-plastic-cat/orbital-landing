/**
 * Example: Get all positions for a user across all markets
 * 
 * This example demonstrates how to fetch all deposit and borrow positions
 * for a specific user address across all active lending markets.
 */

import algosdk from 'algosdk';
import { OrbitalSDK } from '../client';

async function getUserAllPositionsExample() {
  // Initialize Algod client
  const algodClient = new algosdk.Algodv2(
    '', // token
    'https://mainnet-api.algonode.cloud', // server
    '' // port
  );

  // Create SDK instance
  const sdk = new OrbitalSDK({
    algodClient,
    network: 'mainnet',
  });

  // User address to check
  const userAddress = 'YOUR_ALGORAND_ADDRESS_HERE';

  try {
    // Get all positions across all markets
    console.log(`\n🔍 Fetching all positions for ${userAddress}...\n`);
    
    const allPositions = await sdk.getAllUserPositions(userAddress);

    // Display summary
    console.log('📊 Position Summary:');
    console.log(`   Active Markets: ${allPositions.activeMarkets}`);
    console.log(`   Total Supplied: ${allPositions.totalSupplied.toFixed(2)}`);
    console.log(`   Total Borrowed: ${allPositions.totalBorrowed.toFixed(2)}`);
    console.log(`   Total Collateral: ${allPositions.totalCollateral.toFixed(2)}`);
    console.log(`   Overall Health Factor: ${
      allPositions.overallHealthFactor === Infinity 
        ? '∞ (No borrows)' 
        : allPositions.overallHealthFactor.toFixed(2)
    }`);

    // Display individual market positions
    if (allPositions.positions.length > 0) {
      console.log('\n📈 Individual Market Positions:');
      
      for (const position of allPositions.positions) {
        console.log(`\n   Market App ID: ${position.appId}`);
        
        if (position.supplied > 0 || position.lstBalance > 0) {
          console.log(`   ├─ Supplied: ${position.supplied.toFixed(2)}`);
          console.log(`   ├─ LST Balance: ${position.lstBalance.toFixed(2)}`);
        }
        
        if (position.borrowed > 0 || position.collateral > 0) {
          console.log(`   ├─ Borrowed: ${position.borrowed.toFixed(2)}`);
          console.log(`   ├─ Collateral: ${position.collateral.toFixed(2)}`);
          console.log(`   ├─ Collateral Asset ID: ${position.collateralAssetId}`);
          console.log(`   ├─ Health Factor: ${
            position.healthFactor === Infinity 
              ? '∞' 
              : position.healthFactor.toFixed(2)
          }`);
          console.log(`   └─ Liquidatable: ${position.isLiquidatable ? '⚠️ YES' : '✅ NO'}`);
        }
      }
    } else {
      console.log('\n   No active positions found.');
    }

    // Example: Get positions for specific markets only
    console.log('\n\n🎯 Fetching positions for specific markets...\n');
    
    const marketAppIds = [123456789, 987654321]; // Replace with actual market IDs
    const specificPositions = await sdk.getUserPositionsForMarkets(
      userAddress, 
      marketAppIds
    );

    console.log('📊 Specific Markets Summary:');
    console.log(`   Active Markets: ${specificPositions.activeMarkets}`);
    console.log(`   Total Supplied: ${specificPositions.totalSupplied.toFixed(2)}`);
    console.log(`   Total Borrowed: ${specificPositions.totalBorrowed.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error fetching user positions:', error);
    throw error;
  }
}

// Example: Monitor positions for liquidation risk
async function monitorUserPositions() {
  const algodClient = new algosdk.Algodv2(
    '',
    'https://mainnet-api.algonode.cloud',
    ''
  );

  const sdk = new OrbitalSDK({
    algodClient,
    network: 'mainnet',
  });

  const userAddress = 'YOUR_ALGORAND_ADDRESS_HERE';

  try {
    const allPositions = await sdk.getAllUserPositions(userAddress);

    // Check for at-risk positions
    const HEALTH_FACTOR_WARNING = 1.2; // 20% safety margin
    const HEALTH_FACTOR_DANGER = 1.05; // 5% from liquidation

    console.log('\n⚠️  Risk Analysis:\n');

    if (allPositions.totalBorrowed === 0) {
      console.log('✅ No borrows - no liquidation risk');
      return;
    }

    allPositions.positions.forEach((pos) => {
      if (pos.borrowed > 0) {
        const riskLevel = 
          pos.healthFactor < HEALTH_FACTOR_DANGER ? '🔴 DANGER' :
          pos.healthFactor < HEALTH_FACTOR_WARNING ? '🟡 WARNING' :
          '🟢 HEALTHY';

        console.log(`   Market ${pos.appId}:`);
        console.log(`   ├─ Health Factor: ${pos.healthFactor.toFixed(3)}`);
        console.log(`   ├─ Risk Level: ${riskLevel}`);
        console.log(`   └─ Borrowed: ${pos.borrowed.toFixed(2)}\n`);
      }
    });

  } catch (error) {
    console.error('❌ Error monitoring positions:', error);
    throw error;
  }
}

// Run the examples
if (require.main === module) {
  getUserAllPositionsExample()
    .then(() => monitorUserPositions())
    .then(() => {
      console.log('\n✨ Examples completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Example failed:', error);
      process.exit(1);
    });
}

export { getUserAllPositionsExample, monitorUserPositions };

