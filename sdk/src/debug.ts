/**
 * Debug script for interactive SDK testing
 * 
 * Usage:
 *   - Set breakpoints in this file or in client.ts
 *   - Run: npm run debug [-- --user <address>] [-- --network mainnet|testnet] [-- --method <method>]
 *   - Or use VS Code debugger with "Debug SDK" configuration
 * 
 * Examples:
 *   pnpm run debug -- --user ABC123...
 *   pnpm run debug -- --user ABC123... --network testnet
 *   pnpm run debug -- --user ABC123... --method getUserPosition
 *   pnpm run debug -- --user ABC123... --method getAllUserPositions
 */

import algosdk from 'algosdk';
import { OrbitalSDK } from './client';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config: {
    userAddress?: string;
    network: 'mainnet' | 'testnet';
    method?: string;
  } = {
    network: 'mainnet',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--user' && i + 1 < args.length) {
      config.userAddress = args[++i];
    } else if (arg === '--network' && i + 1 < args.length) {
      const network = args[++i];
      if (network === 'mainnet' || network === 'testnet') {
        config.network = network;
      } else {
        console.warn(`⚠️  Invalid network: ${network}. Using mainnet.`);
      }
    } else if (arg === '--method' && i + 1 < args.length) {
      config.method = args[++i];
    }
  }

  return config;
}

async function debugSDK() {
  const config = parseArgs();
  
  console.log('🔍 Starting SDK debug session...');
  console.log(`   Network: ${config.network}`);
  if (config.userAddress) {
    console.log(`   User Address: ${config.userAddress}`);
  }
  if (config.method) {
    console.log(`   Method: ${config.method}`);
  }
  console.log('');

  // Initialize Algod client
  const algodUrl = config.network === 'mainnet' 
    ? 'https://mainnet-api.algonode.cloud'
    : 'https://testnet-api.algonode.cloud';
  
  const algodClient = new algosdk.Algodv2(
    '', // token (empty for public nodes)
    algodUrl,
    '' // port
  );

  // Create SDK instance
  const sdk = new OrbitalSDK({
    algodClient,
    network: config.network,
    // apiBaseUrl: 'https://orbital-backend-nssb4.ondigitalocean.app', // optional
  });

  try {
    // ============================================
    // SET BREAKPOINTS BELOW TO DEBUG
    // ============================================

    // Fetch market list first (needed for most operations)
    console.log('📋 Fetching market list...');
    const marketList = await sdk.getMarketList();
    console.log(`Found ${marketList.length} markets`);
    
    if (marketList.length === 0) {
      console.log('⚠️  No markets found. Exiting.');
      return;
    }

    const firstMarket = marketList[0];
    console.log(`\n🎯 Using market: ${firstMarket.appId} (base token: ${firstMarket.baseTokenId})`);

    // Run specific method if requested, otherwise run all
    if (config.method) {
      await runSpecificMethod(sdk, config.method, firstMarket.appId, config.userAddress);
    } else {
      await runAllMethods(sdk, firstMarket.appId, config.userAddress);
    }

    console.log('\n✅ Debug session completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during debug session:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    throw error;
  }
}

async function runAllMethods(
  sdk: OrbitalSDK,
  marketAppId: number,
  userAddress?: string
) {
  // 1. Get Market Data
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1️⃣  Testing: getMarket()');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const marketData = await sdk.getMarket(marketAppId);
  console.log('Market Data:', {
    appId: marketData.appId,
    baseTokenId: marketData.baseTokenId,
    lstTokenId: marketData.lstTokenId,
    supplyApy: `${marketData.supplyApy.toFixed(2)}%`,
    borrowApy: `${marketData.borrowApy.toFixed(2)}%`,
    utilizationRate: `${marketData.utilizationRate.toFixed(2)}%`,
    totalDeposits: marketData.totalDeposits.toFixed(2),
    totalBorrows: marketData.totalBorrows.toFixed(2),
    availableToBorrow: marketData.availableToBorrow.toFixed(2),
  });

  // 2. Get APY
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2️⃣  Testing: getAPY()');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const apy = await sdk.getAPY(marketAppId);
  console.log('APY:', {
    supplyApy: `${apy.supplyApy.toFixed(2)}%`,
    borrowApy: `${apy.borrowApy.toFixed(2)}%`,
    utilizationRate: `${apy.utilizationRate.toFixed(2)}%`,
    utilNormBps: apy.utilNormBps,
  });

  // 3. Get LST Price
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3️⃣  Testing: getLSTPrice()');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const lstPrice = await sdk.getLSTPrice(marketAppId);
  console.log('LST Price:', {
    price: lstPrice.price.toFixed(6),
    totalDeposits: lstPrice.totalDeposits.toString(),
    circulatingLST: lstPrice.circulatingLST.toString(),
    exchangeRate: lstPrice.exchangeRate.toFixed(6),
  });

  // 4. Get Global State
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('4️⃣  Testing: getGlobalState()');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const globalState = await sdk.getGlobalState(marketAppId);
  console.log('Global State Keys:', Object.keys(globalState).length);
  console.log('Sample values:', {
    total_deposits: globalState.total_deposits?.toString(),
    total_borrows: globalState.total_borrows?.toString(),
    borrow_index_wad: globalState.borrow_index_wad?.toString(),
  });

  // 5. Get Oracle Price (if oracle is configured)
  if (marketData.oracleAppId) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('5️⃣  Testing: getOraclePrice()');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const oraclePrice = await sdk.getOraclePrice(marketData.oracleAppId, marketData.baseTokenId);
      console.log('Oracle Price:', {
        assetId: oraclePrice.assetId,
        price: `$${oraclePrice.price.toFixed(2)}`,
        priceRaw: oraclePrice.priceRaw.toString(),
        lastUpdated: oraclePrice.lastUpdatedDate.toISOString(),
      });
    } catch (error) {
      console.warn('⚠️  Could not fetch oracle price:', error instanceof Error ? error.message : error);
    }
  }

  // 6. Get User Position (if address provided)
  if (userAddress) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('6️⃣  Testing: getUserPosition()');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Fetching position for ${userAddress} in market ${marketAppId}...`);
    const position = await sdk.getUserPosition(marketAppId, userAddress);
    console.log('User Position:', {
      address: position.address,
      appId: position.appId,
      supplied: position.supplied.toFixed(6),
      lstBalance: position.lstBalance.toFixed(6),
      borrowed: position.borrowed.toFixed(6),
      collateral: position.collateral.toFixed(6),
      collateralAssetId: position.collateralAssetId,
      healthFactor: position.healthFactor === Infinity ? '∞' : position.healthFactor.toFixed(4),
      maxBorrow: position.maxBorrow.toFixed(6),
      isLiquidatable: position.isLiquidatable,
      userIndexWad: position.userIndexWad.toString(),
      principal: position.principal.toString(),
      lastDebtChange: position.lastDebtChange,
    });
  } else {
    console.log('\n⚠️  Skipping getUserPosition() - no user address provided');
    console.log('   Use: pnpm run debug -- --user <address>');
  }

  // 7. Get All User Positions (if address provided)
  if (userAddress) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('7️⃣  Testing: getAllUserPositions()');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Fetching all positions for ${userAddress} across all markets...`);
    const allPositions = await sdk.getAllUserPositions(userAddress);
    console.log('\n📊 All Positions Summary:');
    console.log('   Active Markets:', allPositions.activeMarkets);
    console.log('   Total Supplied:', allPositions.totalSupplied.toFixed(6));
    console.log('   Total Borrowed:', allPositions.totalBorrowed.toFixed(6));
    console.log('   Total Collateral:', allPositions.totalCollateral.toFixed(6));
    console.log('   Total Value USD:', `$${allPositions.totalValueUSD.toFixed(2)}`);
    console.log('   Overall Health Factor:', 
      allPositions.overallHealthFactor === Infinity 
        ? '∞ (No borrows)' 
        : allPositions.overallHealthFactor.toFixed(4)
    );
    
    if (allPositions.positions.length > 0) {
      console.log('\n📈 Individual Market Positions:');
      allPositions.positions.forEach((pos, idx) => {
        console.log(`\n   Position ${idx + 1}:`);
        console.log(`   ├─ Market App ID: ${pos.appId}`);
        if (pos.supplied > 0 || pos.lstBalance > 0) {
          console.log(`   ├─ Supplied: ${pos.supplied.toFixed(6)}`);
          console.log(`   ├─ LST Balance: ${pos.lstBalance.toFixed(6)}`);
        }
        if (pos.borrowed > 0 || pos.collateral > 0) {
          console.log(`   ├─ Borrowed: ${pos.borrowed.toFixed(6)}`);
          console.log(`   ├─ Collateral: ${pos.collateral.toFixed(6)}`);
          console.log(`   ├─ Collateral Asset ID: ${pos.collateralAssetId}`);
          console.log(`   ├─ Health Factor: ${
            pos.healthFactor === Infinity 
              ? '∞' 
              : pos.healthFactor.toFixed(4)
          }`);
          console.log(`   ├─ Max Borrow: ${pos.maxBorrow.toFixed(6)}`);
          console.log(`   └─ Liquidatable: ${pos.isLiquidatable ? '⚠️ YES' : '✅ NO'}`);
        }
      });
    } else {
      console.log('\n   No active positions found.');
    }
  } else {
    console.log('\n⚠️  Skipping getAllUserPositions() - no user address provided');
    console.log('   Use: pnpm run debug -- --user <address>');
  }
}

async function runSpecificMethod(
  sdk: OrbitalSDK,
  method: string,
  marketAppId: number,
  userAddress?: string
) {
  switch (method.toLowerCase()) {
    case 'getmarket':
    case 'market': {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Testing: getMarket()');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const marketData = await sdk.getMarket(marketAppId);
      console.log('Market Data:', JSON.stringify(marketData, null, 2));
      break;
    }

    case 'getapy':
    case 'apy': {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Testing: getAPY()');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const apy = await sdk.getAPY(marketAppId);
      console.log('APY:', JSON.stringify(apy, null, 2));
      break;
    }

    case 'getlstprice':
    case 'lstprice': {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Testing: getLSTPrice()');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const lstPrice = await sdk.getLSTPrice(marketAppId);
      console.log('LST Price:', JSON.stringify(lstPrice, null, 2));
      break;
    }

    case 'getuserposition':
    case 'userposition': {
      if (!userAddress) {
        throw new Error('--user <address> is required for getUserPosition');
      }
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Testing: getUserPosition()');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Market: ${marketAppId}, User: ${userAddress}`);
      const position = await sdk.getUserPosition(marketAppId, userAddress);
      console.log('User Position:', JSON.stringify(position, (_key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      , 2));
      break;
    }

    case 'getalluserpositions':
    case 'alluserpositions':
    case 'allpositions': {
      if (!userAddress) {
        throw new Error('--user <address> is required for getAllUserPositions');
      }
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Testing: getAllUserPositions()');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`User: ${userAddress}`);
      const allPositions = await sdk.getAllUserPositions(userAddress);
      console.log('All Positions:', JSON.stringify(allPositions, (_key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      , 2));
      break;
    }

    case 'getmarketlist':
    case 'marketlist': {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Testing: getMarketList()');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const marketList = await sdk.getMarketList();
      console.log('Market List:', JSON.stringify(marketList, null, 2));
      break;
    }

    case 'getallmarkets':
    case 'allmarkets': {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Testing: getAllMarkets()');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const allMarkets = await sdk.getAllMarkets();
      console.log(`Found ${allMarkets.length} markets`);
      console.log('Markets:', JSON.stringify(allMarkets.slice(0, 2), (_key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      , 2));
      break;
    }

    default:
      console.error(`❌ Unknown method: ${method}`);
      console.log('\nAvailable methods:');
      console.log('  - getMarket / market');
      console.log('  - getAPY / apy');
      console.log('  - getLSTPrice / lstprice');
      console.log('  - getUserPosition / userposition (requires --user)');
      console.log('  - getAllUserPositions / alluserpositions / allpositions (requires --user)');
      console.log('  - getMarketList / marketlist');
      console.log('  - getAllMarkets / allmarkets');
      throw new Error(`Unknown method: ${method}`);
  }
}

// Run debug function
debugSDK()
  .then(() => {
    console.log('\n✨ Debug script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug script failed:', error);
    process.exit(1);
  });
