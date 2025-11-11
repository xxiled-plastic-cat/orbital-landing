/**
 * Example: Fetching asset metadata directly from Algorand (no wallet needed)
 */

import algosdk from 'algosdk';
import { OrbitalSDK } from '../index';

// Example: Initialize SDK with custom Algod configuration
async function initializeSDKWithCustomEndpoint() {
  // Option 1: Use default endpoints (algonode.cloud)
  const algodClient = new algosdk.Algodv2(
    '',
    'https://testnet-api.algonode.cloud',
    ''
  );

  // Option 2: Use custom endpoint with authentication
  // const algodClient = new algosdk.Algodv2(
  //   'your-api-token',
  //   'https://your-custom-node.example.com',
  //   443
  // );

  // Option 3: With indexer for historical queries
  // const indexerClient = new algosdk.Indexer(
  //   'your-indexer-token',
  //   'https://your-indexer.example.com',
  //   443
  // );

  const sdk = new OrbitalSDK({
    algodClient,
    network: 'testnet',
    // indexerClient, // Optional
    // apiBaseUrl: 'https://api.orbitalfinance.io' // Optional custom backend
  });

  return sdk;
}

// Example 1: Get single asset info
async function fetchSingleAsset() {
  const sdk = await initializeSDKWithCustomEndpoint();
  
  // Example: Fetch USDC on testnet
  const assetId = 31566704;
  
  try {
    const asset = await sdk.getAssetInfo(assetId);
    
    console.log('Asset Information:');
    console.log('  ID:', asset.id);
    console.log('  Name:', asset.name);
    console.log('  Symbol:', asset.unitName);
    console.log('  Decimals:', asset.decimals);
    console.log('  Total Supply:', asset.total.toString());
    console.log('  Frozen:', asset.frozen);
    console.log('  Creator:', asset.creator);
    if (asset.url) {
      console.log('  URL:', asset.url);
    }
    
    return asset;
  } catch (error) {
    console.error('Error fetching asset info:', error);
    throw error;
  }
}

// Example 2: Get ALGO info (special case, asset ID 0)
async function fetchALGOInfo() {
  const sdk = await initializeSDKWithCustomEndpoint();
  
  try {
    const algo = await sdk.getAssetInfo(0);
    
    console.log('ALGO Information:');
    console.log('  Name:', algo.name);
    console.log('  Symbol:', algo.unitName);
    console.log('  Decimals:', algo.decimals);
    console.log('  Total Supply:', algo.total.toString());
    
    return algo;
  } catch (error) {
    console.error('Error fetching ALGO info:', error);
    throw error;
  }
}

// Example 3: Get multiple assets in parallel
async function fetchMultipleAssets() {
  const sdk = await initializeSDKWithCustomEndpoint();
  
  const assetIds = [
    0,          // ALGO
    31566704,   // USDCt (testnet)
    // Add more asset IDs as needed
  ];
  
  try {
    console.log(`Fetching info for ${assetIds.length} assets...\n`);
    const assets = await sdk.getAssetsInfo(assetIds);
    
    console.log(`Successfully fetched ${assets.length} assets:\n`);
    assets.forEach((asset) => {
      console.log(`Asset ${asset.id}:`);
      console.log(`  ${asset.name} (${asset.unitName})`);
      console.log(`  Decimals: ${asset.decimals}`);
      console.log(`  Supply: ${asset.total.toString()}`);
      console.log('');
    });
    
    return assets;
  } catch (error) {
    console.error('Error fetching multiple assets:', error);
    throw error;
  }
}

// Example 4: Get market assets metadata
async function fetchMarketAssetsMetadata() {
  const sdk = await initializeSDKWithCustomEndpoint();
  
  try {
    // 1. Get all markets
    console.log('Fetching all markets...');
    const markets = await sdk.getAllMarkets();
    
    // 2. Collect all unique asset IDs (base and LST tokens)
    const assetIds = new Set<number>();
    markets.forEach((market) => {
      assetIds.add(market.baseTokenId);
      assetIds.add(market.lstTokenId);
    });
    
    console.log(`\nFetching metadata for ${assetIds.size} unique assets...\n`);
    
    // 3. Fetch all asset metadata
    const assets = await sdk.getAssetsInfo(Array.from(assetIds));
    
    // 4. Create a map for easy lookup
    const assetMap = new Map(assets.map((a) => [a.id, a]));
    
    // 5. Display markets with asset info
    console.log('=== Markets with Asset Metadata ===\n');
    markets.forEach((market) => {
      const baseAsset = assetMap.get(market.baseTokenId);
      const lstAsset = assetMap.get(market.lstTokenId);
      
      console.log(`Market ${market.appId}:`);
      console.log(`  Base: ${baseAsset?.name} (${baseAsset?.unitName})`);
      console.log(`  LST: ${lstAsset?.name} (${lstAsset?.unitName})`);
      console.log(`  Supply APY: ${market.supplyApy.toFixed(2)}%`);
      console.log('');
    });
    
    return { markets, assets };
  } catch (error) {
    console.error('Error fetching market assets:', error);
    throw error;
  }
}

// Example 5: Format asset amounts with decimals
async function formatAssetAmounts() {
  const sdk = await initializeSDKWithCustomEndpoint();
  
  // Example amounts in microunits
  const amounts = [
    { assetId: 0, microAmount: 1500000n },      // 1.5 ALGO
    { assetId: 31566704, microAmount: 5000000n }, // 5 USDC
  ];
  
  try {
    console.log('Formatting asset amounts:\n');
    
    for (const { assetId, microAmount } of amounts) {
      const asset = await sdk.getAssetInfo(assetId);
      const formattedAmount = Number(microAmount) / Math.pow(10, asset.decimals);
      
      console.log(`${formattedAmount.toFixed(asset.decimals)} ${asset.unitName}`);
      console.log(`  (${microAmount.toString()} micro-units)`);
      console.log('');
    }
  } catch (error) {
    console.error('Error formatting amounts:', error);
    throw error;
  }
}

// Example 6: Compare asset info from backend vs blockchain
async function compareMetadataSources() {
  const sdk = await initializeSDKWithCustomEndpoint();
  
  const assetId = 31566704;
  
  try {
    console.log('Fetching from Algorand blockchain...');
    const blockchainInfo = await sdk.getAssetInfo(assetId);
    
    console.log('\n=== Blockchain Data ===');
    console.log('Name:', blockchainInfo.name);
    console.log('Symbol:', blockchainInfo.unitName);
    console.log('Decimals:', blockchainInfo.decimals);
    console.log('Total:', blockchainInfo.total.toString());
    
    // Note: Additional data like images, verified status, etc.
    // would come from backend API or curated lists
    console.log('\n=== Additional Frontend Data (not on blockchain) ===');
    console.log('Image: Would come from local assets or backend');
    console.log('Verified: Would come from curated list/backend');
    console.log('Description: Would come from backend or asset URL');
    
    return blockchainInfo;
  } catch (error) {
    console.error('Error comparing metadata sources:', error);
    throw error;
  }
}

// Main function to run examples
async function main() {
  console.log('=== Orbital Finance SDK - Asset Metadata Examples ===\n');
  
  try {
    // Example 1: Single asset
    console.log('Example 1: Fetching single asset');
    await fetchSingleAsset();
    console.log('\n---\n');
    
    // Example 2: ALGO
    console.log('Example 2: Fetching ALGO info');
    await fetchALGOInfo();
    console.log('\n---\n');
    
    // Example 3: Multiple assets
    console.log('Example 3: Fetching multiple assets');
    await fetchMultipleAssets();
    console.log('\n---\n');
    
    // Example 4: Market assets
    console.log('Example 4: Fetching market assets metadata');
    await fetchMarketAssetsMetadata();
    console.log('\n---\n');
    
    // Example 5: Format amounts
    console.log('Example 5: Formatting asset amounts');
    await formatAssetAmounts();
    console.log('\n---\n');
    
    // Example 6: Compare sources
    console.log('Example 6: Comparing metadata sources');
    await compareMetadataSources();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export functions for use in other modules
export {
  initializeSDKWithCustomEndpoint,
  fetchSingleAsset,
  fetchALGOInfo,
  fetchMultipleAssets,
  fetchMarketAssetsMetadata,
  formatAssetAmounts,
  compareMetadataSources,
};

// Run main if this file is executed directly
if (require.main === module) {
  main();
}

