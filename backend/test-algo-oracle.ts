/**
 * Test script to verify ALGO oracle price handling
 * Run with: npx tsx test-algo-oracle.ts
 */

import dotenv from 'dotenv';
import {
  fetchAssetMetadata,
  getOracleAssets,
  getMedianPrice,
  updateOracleContract,
} from './src/services/oracleService.js';

// Load environment variables
dotenv.config();

async function testAlgoOracle() {
  console.log('\n' + '═'.repeat(70));
  console.log('🧪 Testing ALGO Oracle Price Handling');
  console.log('═'.repeat(70) + '\n');

  try {
    // Test 1: Fetch metadata for ALGO
    console.log('📋 Test 1: Fetching ALGO metadata...');
    const metadataMap = await fetchAssetMetadata([0]);
    const algoMetadata = metadataMap.get(0);
    
    if (algoMetadata) {
      console.log('✅ ALGO metadata found:');
      console.log(`   Symbol: ${algoMetadata.params['unit-name']}`);
      console.log(`   Name: ${algoMetadata.params.name}`);
      console.log(`   Decimals: ${algoMetadata.params.decimals}`);
    } else {
      console.log('❌ ALGO metadata NOT found');
      return;
    }

    // Test 2: Get oracle assets (should include ALGO if it's in the oracle)
    console.log('\n📋 Test 2: Getting oracle assets...');
    const oracleAssets = await getOracleAssets();
    const algoAsset = oracleAssets.find(asset => asset.assetId === 0);
    
    if (algoAsset) {
      console.log('✅ ALGO found in oracle:');
      console.log(`   Asset ID: ${algoAsset.assetId}`);
      console.log(`   Symbol: ${algoAsset.symbol}`);
      console.log(`   Current Price: $${algoAsset.currentPrice.toFixed(6)}`);
      console.log(`   Decimals: ${algoAsset.decimals}`);
    } else {
      console.log('⚠️  ALGO not found in oracle (may not be added yet)');
      console.log(`   Found ${oracleAssets.length} assets in oracle`);
      if (oracleAssets.length > 0) {
        console.log('   Sample assets:', oracleAssets.slice(0, 3).map(a => `${a.symbol} (${a.assetId})`).join(', '));
      }
    }

    // Test 3: Fetch median price for ALGO
    console.log('\n📋 Test 3: Fetching ALGO price from sources...');
    const medianPrice = await getMedianPrice('ALGO', 0);
    
    if (medianPrice && medianPrice > 0) {
      console.log(`✅ ALGO median price: $${medianPrice.toFixed(6)}`);
    } else {
      console.log('⚠️  Could not fetch ALGO price from sources');
    }

    // Test 4: Check if we can update oracle (only if price is available)
    if (medianPrice && medianPrice > 0 && algoAsset) {
      console.log('\n📋 Test 4: Testing oracle update (dry run)...');
      console.log(`   Would update ALGO price from $${algoAsset.currentPrice.toFixed(6)} to $${medianPrice.toFixed(6)}`);
      
      const priceDiff = Math.abs(medianPrice - algoAsset.currentPrice);
      const priceDiffPercent = (priceDiff / algoAsset.currentPrice) * 100;
      console.log(`   Price difference: $${priceDiff.toFixed(6)} (${priceDiffPercent.toFixed(2)}%)`);
      
      // Only update if difference is significant (you can adjust this threshold)
      const threshold = 0.05; // 0.05%
      if (priceDiffPercent >= threshold) {
        console.log(`   ✅ Price difference exceeds threshold (${threshold}%), update would proceed`);
        
        // Uncomment the line below to actually update the oracle
        // const updated = await updateOracleContract(0, 'ALGO', medianPrice);
        // console.log(`   ${updated ? '✅' : '❌'} Oracle update: ${updated ? 'SUCCESS' : 'FAILED'}`);
      } else {
        console.log(`   ⏭️  Price difference below threshold (${threshold}%), update would be skipped`);
      }
    } else {
      console.log('\n⚠️  Skipping update test (no price or asset not in oracle)');
    }

    console.log('\n' + '═'.repeat(70));
    console.log('✅ Test completed successfully!');
    console.log('═'.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testAlgoOracle().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

