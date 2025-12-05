import { OrbitalLendingMarket } from '../models/index.js';
import { getEnrichedMarketData } from './marketService.js';
import { addMarketAnalytics, cleanupOldMarketAnalytics } from './marketAnalyticsService.js';

/**
 * Collect market analytics for all markets
 * This function fetches TVL and borrowing data for each market and stores it
 */
export async function collectMarketAnalytics(): Promise<{
  success: boolean;
  processed: number;
  errors: number;
  errorDetails?: string[];
}> {
  const timestamp = new Date().toISOString();
  console.log(`\n📊 Starting market analytics collection at ${timestamp}`);
  
  let processed = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  try {
    // Get all markets from database
    const markets = await OrbitalLendingMarket.findAll();

    if (markets.length === 0) {
      console.log('⚠️  No markets found in database');
      return {
        success: true,
        processed: 0,
        errors: 0
      };
    }

    console.log(`📈 Found ${markets.length} market(s) to process`);

    // Process each market
    for (const market of markets) {
      try {
        // Fetch enriched market data (includes TVL and totalBorrowsUSD)
        const enrichedData = await getEnrichedMarketData(market.appId);

        // Store analytics data
        await addMarketAnalytics({
          marketAppId: market.appId,
          baseTokenId: market.baseTokenId,
          tvl: enrichedData.tvl,
          borrowing: enrichedData.totalBorrowsUSD,
          dateAdded: new Date()
        });

        processed++;
        console.log(`✅ Collected analytics for market ${market.appId} (TVL: $${enrichedData.tvl.toFixed(2)}, Borrowing: $${enrichedData.totalBorrowsUSD.toFixed(2)})`);
      } catch (error) {
        errors++;
        const errorMessage = `Failed to collect analytics for market ${market.appId}: ${error instanceof Error ? error.message : String(error)}`;
        errorDetails.push(errorMessage);
        console.error(`❌ ${errorMessage}`);
      }
    }

    // Cleanup old records (older than 30 days)
    console.log('\n🧹 Cleaning up old analytics records...');
    const deletedCount = await cleanupOldMarketAnalytics(30);
    console.log(`✅ Cleaned up ${deletedCount} old record(s)`);

    const success = errors === 0 || processed > 0;
    console.log(`\n✅ Analytics collection completed: ${processed} processed, ${errors} errors`);

    return {
      success,
      processed,
      errors,
      errorDetails: errorDetails.length > 0 ? errorDetails : undefined
    };
  } catch (error) {
    console.error('❌ Fatal error in market analytics collection:', error);
    return {
      success: false,
      processed,
      errors: errors + 1,
      errorDetails: [
        ...errorDetails,
        `Fatal error: ${error instanceof Error ? error.message : String(error)}`
      ]
    };
  }
}

