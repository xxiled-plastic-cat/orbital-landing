/**
 * Example: Fetching debt positions for marketplace (no wallet needed!)
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
  });

  return sdk;
}

// Example 1: Get loan records for a specific market
async function getMarketLoanRecords() {
  const sdk = await initializeSDK();
  const marketAppId = 123456789;
  
  try {
    console.log(`Fetching loan records for market ${marketAppId}...`);
    const loanRecords = await sdk.getMarketLoanRecords(marketAppId);
    
    console.log(`\nFound ${loanRecords.length} active loan positions:\n`);
    loanRecords.forEach((record, index) => {
      console.log(`${index + 1}. Borrower: ${record.borrowerAddress.slice(0, 10)}...`);
      console.log(`   Collateral Token: ${record.collateralTokenId}`);
      console.log(`   Collateral Amount: ${record.collateralAmount.toString()}`);
      console.log(`   Principal: ${record.principal.toString()}`);
      console.log(`   Borrowed Token: ${record.borrowedTokenId}`);
      console.log('');
    });
    
    return loanRecords;
  } catch (error) {
    console.error('Error fetching loan records:', error);
    throw error;
  }
}

// Example 2: Get debt positions for specific markets
async function getDebtPositions() {
  const sdk = await initializeSDK();
  
  const marketAppIds = [
    123456789,
    234567890,
    // Add more market IDs
  ];
  
  try {
    console.log(`Fetching debt positions from ${marketAppIds.length} markets...\n`);
    const positions = await sdk.getAllDebtPositions(marketAppIds);
    
    console.log(`Found ${positions.length} total debt positions:\n`);
    
    positions.forEach((position, index) => {
      console.log(`${index + 1}. Position ${position.id}`);
      console.log(`   Market: ${position.marketId}`);
      console.log(`   Borrower: ${position.borrowerAddress.slice(0, 15)}...`);
      console.log(`   Collateral: ${position.collateralAmount.toFixed(6)} (Token ${position.collateralTokenId})`);
      console.log(`   Principal: ${position.principal.toFixed(6)}`);
      console.log(`   Total Debt: ${position.totalDebt.toFixed(6)} (Token ${position.borrowedTokenId})`);
      console.log(`   Health Ratio: ${position.healthRatio.toFixed(2)}`);
      console.log(`   Liquidation Threshold: ${position.liquidationThreshold.toFixed(2)}`);
      console.log(`   Status: ${position.healthRatio < position.liquidationThreshold ? '⚠️  AT RISK' : '✅ HEALTHY'}`);
      console.log('');
    });
    
    return positions;
  } catch (error) {
    console.error('Error fetching debt positions:', error);
    throw error;
  }
}

// Example 3: Get ALL debt positions from ALL markets
async function getAllMarketplacePositions() {
  const sdk = await initializeSDK();
  
  try {
    console.log('Fetching all debt positions from all markets...\n');
    const positions = await sdk.getAllDebtPositionsFromAllMarkets();
    
    console.log(`Found ${positions.length} total positions across all markets\n`);
    
    // Calculate statistics
    const totalDebtUSD = positions.reduce((sum, p) => sum + p.totalDebt, 0);
    const totalCollateralTokens = positions.reduce((sum, p) => sum + p.collateralAmount, 0);
    const atRiskCount = positions.filter((p) => p.healthRatio < p.liquidationThreshold).length;
    const healthyCount = positions.length - atRiskCount;
    
    console.log('=== Marketplace Statistics ===');
    console.log(`Total Positions: ${positions.length}`);
    console.log(`Healthy Positions: ${healthyCount} (${((healthyCount / positions.length) * 100).toFixed(1)}%)`);
    console.log(`At Risk Positions: ${atRiskCount} (${((atRiskCount / positions.length) * 100).toFixed(1)}%)`);
    console.log(`Total Debt: ${totalDebtUSD.toFixed(2)} tokens`);
    console.log(`Total Collateral: ${totalCollateralTokens.toFixed(2)} tokens`);
    
    // Show at-risk positions
    if (atRiskCount > 0) {
      console.log('\n=== At Risk Positions ===');
      const atRisk = positions
        .filter((p) => p.healthRatio < p.liquidationThreshold)
        .sort((a, b) => a.healthRatio - b.healthRatio);
      
      atRisk.forEach((position, index) => {
        console.log(`\n${index + 1}. ${position.borrowerAddress.slice(0, 15)}...`);
        console.log(`   Market: ${position.marketId}`);
        console.log(`   Health Ratio: ${position.healthRatio.toFixed(2)}`);
        console.log(`   Debt: ${position.totalDebt.toFixed(6)}`);
        console.log(`   Collateral: ${position.collateralAmount.toFixed(6)}`);
      });
    }
    
    return positions;
  } catch (error) {
    console.error('Error fetching all marketplace positions:', error);
    throw error;
  }
}

// Example 4: Find liquidation opportunities
async function findLiquidationOpportunities() {
  const sdk = await initializeSDK();
  
  try {
    const positions = await sdk.getAllDebtPositionsFromAllMarkets();
    
    // Find positions that are liquidatable (health ratio < liquidation threshold)
    const liquidatable = positions.filter((p) => p.healthRatio < p.liquidationThreshold);
    
    console.log('=== Liquidation Opportunities ===\n');
    console.log(`Found ${liquidatable.length} positions eligible for liquidation:\n`);
    
    // Sort by health ratio (most at risk first)
    liquidatable.sort((a, b) => a.healthRatio - b.healthRatio);
    
    liquidatable.forEach((position, index) => {
      const riskLevel = position.healthRatio < position.liquidationThreshold * 0.9 
        ? '🔴 CRITICAL' 
        : '🟡 WARNING';
      
      console.log(`${index + 1}. ${riskLevel}`);
      console.log(`   Borrower: ${position.borrowerAddress}`);
      console.log(`   Market: ${position.marketId}`);
      console.log(`   Health Ratio: ${position.healthRatio.toFixed(2)}`);
      console.log(`   Debt: ${position.totalDebt.toFixed(6)}`);
      console.log(`   Collateral: ${position.collateralAmount.toFixed(6)}`);
      console.log(`   Last Updated: ${position.lastUpdated.toISOString()}`);
      console.log('');
    });
    
    return liquidatable;
  } catch (error) {
    console.error('Error finding liquidation opportunities:', error);
    throw error;
  }
}

// Example 5: Monitor specific market
async function monitorMarket() {
  const sdk = await initializeSDK();
  const marketAppId = 123456789;
  
  console.log(`Monitoring market ${marketAppId}...`);
  console.log('Press Ctrl+C to stop\n');
  
  const checkMarket = async () => {
    try {
      const positions = await sdk.getAllDebtPositions([marketAppId]);
      const atRisk = positions.filter((p) => p.healthRatio < p.liquidationThreshold);
      
      console.log(`[${new Date().toISOString()}]`);
      console.log(`Total Positions: ${positions.length}`);
      console.log(`At Risk: ${atRisk.length}`);
      
      if (atRisk.length > 0) {
        console.log('⚠️  WARNING: Positions at risk!');
        atRisk.forEach((p) => {
          console.log(`  - ${p.borrowerAddress.slice(0, 10)}... (Health: ${p.healthRatio.toFixed(2)})`);
        });
      }
      console.log('');
    } catch (error) {
      console.error('Error checking market:', error);
    }
  };
  
  // Check immediately
  await checkMarket();
  
  // Then check every 30 seconds
  setInterval(checkMarket, 30000);
}

// Main function to run examples
async function main() {
  console.log('=== Orbital Finance SDK - Debt Marketplace Examples ===\n');
  
  try {
    // Example 1: Market loan records
    console.log('Example 1: Fetching loan records for a market');
    await getMarketLoanRecords();
    console.log('\n---\n');
    
    // Example 2: Debt positions
    console.log('Example 2: Fetching debt positions');
    await getDebtPositions();
    console.log('\n---\n');
    
    // Example 3: All marketplace positions
    console.log('Example 3: Fetching all marketplace positions');
    await getAllMarketplacePositions();
    console.log('\n---\n');
    
    // Example 4: Liquidation opportunities
    console.log('Example 4: Finding liquidation opportunities');
    await findLiquidationOpportunities();
    console.log('\n---\n');
    
    // Example 5: Monitor market (uncomment to run)
    // await monitorMarket();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export functions for use in other modules
export {
  initializeSDK,
  getMarketLoanRecords,
  getDebtPositions,
  getAllMarketplacePositions,
  findLiquidationOpportunities,
  monitorMarket,
};

// Run main if this file is executed directly
if (require.main === module) {
  main();
}

