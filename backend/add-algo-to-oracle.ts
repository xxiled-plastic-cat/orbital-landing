/**
 * Script to add ALGO to the oracle contract
 * Run with: npx tsx add-algo-to-oracle.ts
 */

import dotenv from 'dotenv';
import * as algokit from '@algorandfoundation/algokit-utils';
import { OracleClient } from './src/clients/oracleClient.js';
import { getMedianPrice } from './src/services/oracleService.js';

// Load environment variables
dotenv.config();

async function addAlgoToOracle() {
  console.log('\n' + '═'.repeat(70));
  console.log('🚀 Adding ALGO to Oracle Contract');
  console.log('═'.repeat(70) + '\n');

  // Validate required environment variables
  if (!process.env.ORACLE_APP_ID) {
    throw new Error('ORACLE_APP_ID environment variable not set');
  }
  if (!process.env.ORACLE_ADMIN_MNEMONIC) {
    throw new Error('ORACLE_ADMIN_MNEMONIC environment variable not set');
  }
  if (!process.env.ORACLE_ADMIN_ADDRESS) {
    throw new Error('ORACLE_ADMIN_ADDRESS environment variable not set');
  }

  try {
    // Get current ALGO price
    console.log('📊 Fetching current ALGO price...');
    const algoPrice = await getMedianPrice('ALGO', 0);
    
    if (!algoPrice || algoPrice <= 0) {
      throw new Error('Could not fetch ALGO price from sources');
    }
    
    console.log(`✅ Current ALGO price: $${algoPrice.toFixed(6)}\n`);

    // Setup Algorand client
    const algorand = algokit.AlgorandClient.fromConfig({
      algodConfig: {
        server:
          process.env.ALGORAND_NODE_URL ||
          'https://testnet-api.4160.nodely.dev',
        token: process.env.ALGORAND_NETWORK_TOKEN || '',
      },
    });

    // Setup oracle client
    const appClient = new OracleClient({
      algorand,
      appId: BigInt(process.env.ORACLE_APP_ID),
    });

    // Setup admin account
    const account = algorand.account.fromMnemonic(
      process.env.ORACLE_ADMIN_MNEMONIC as string,
      process.env.ORACLE_ADMIN_ADDRESS as string
    );
    algorand.setDefaultSigner(account);

    console.log(`📝 Oracle App ID: ${process.env.ORACLE_APP_ID}`);
    console.log(`👤 Admin Address: ${process.env.ORACLE_ADMIN_ADDRESS}`);
    console.log(`🌐 Network: ${process.env.ALGORAND_NETWORK || 'testnet'}\n`);

    // Check if ALGO is already in the oracle
    console.log('🔍 Checking if ALGO is already in oracle...');
    const prices = await appClient.state.box.tokenPrices.getMap();
    let algoExists = false;
    
    for (const [assetIdKey] of prices) {
      if (Number(assetIdKey.assetId) === 0) {
        algoExists = true;
        const priceValue = prices.get(assetIdKey);
        if (priceValue) {
          const currentPrice = Number(priceValue.price) / 1e6;
          console.log(`⚠️  ALGO already exists in oracle with price: $${currentPrice.toFixed(6)}`);
          console.log('   Use updateTokenPrice instead of addTokenListing\n');
        }
        break;
      }
    }

    if (!algoExists) {
      // Convert price to microunits (6 decimals)
      const decimals = 6;
      const priceScaleFactor = Math.pow(10, decimals);
      const initialPrice = BigInt(Math.round(algoPrice * priceScaleFactor));

      console.log(`💰 Initial price (scaled): ${initialPrice} microunits`);
      console.log(`   ($${algoPrice.toFixed(6)} × 10^${decimals})\n`);

      // Add ALGO to oracle
      console.log('📤 Adding ALGO to oracle contract...');
      const result = await appClient.send.addTokenListing({
        args: {
          assetId: 0,
          initialPrice: initialPrice,
        },
      });

      console.log(`✅ Transaction sent successfully!`);
      console.log(`   Transaction ID: ${result.transaction.txID()}`);
      console.log(`   Confirmed in round: ${result.confirmation?.confirmedRound}`);
      
      // Verify it was added
      console.log('\n🔍 Verifying ALGO was added...');
      const updatedPrices = await appClient.state.box.tokenPrices.getMap();
      for (const [assetIdKey, priceValue] of updatedPrices) {
        if (Number(assetIdKey.assetId) === 0) {
          const verifiedPrice = Number(priceValue.price) / 1e6;
          console.log(`✅ ALGO verified in oracle: $${verifiedPrice.toFixed(6)}`);
          break;
        }
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('✅ Process completed successfully!');
    console.log('═'.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Error adding ALGO to oracle:');
    console.error(error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
addAlgoToOracle().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

