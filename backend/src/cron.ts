/**
 * Oracle Price Update Cron Service
 * 
 * This is a standalone service that runs independently from the main API server.
 * It periodically fetches prices from multiple sources and updates the oracle contracts.
 * 
 * Designed to be deployed as a separate web service on Digital Ocean.
 */

import cron from 'node-cron';
import dotenv from 'dotenv';
import { updateAllOraclePrices, UpdateSummary } from './services/oracleService.js';

// Load environment variables
dotenv.config();

// Configuration
const CRON_SCHEDULE = process.env.ORACLE_CRON_SCHEDULE || '*/2 * * * *'; // Default: every 2 minutes
const PRICE_THRESHOLD = parseFloat(process.env.ORACLE_PRICE_THRESHOLD || '0.05'); // Default: 0.05%
const TIMEZONE = process.env.ORACLE_TIMEZONE || 'America/New_York';

/**
 * Execute the oracle price update cycle
 */
async function runOracleUpdate(): Promise<UpdateSummary> {
  const timestamp = new Date().toISOString();
  
  console.log('\n' + '╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + '  🛰️  ORBITAL ORACLE PRICE UPDATE'.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + `  Time: ${timestamp}`.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');
  
  try {
    const result = await updateAllOraclePrices(PRICE_THRESHOLD);
    
    if (result.success) {
      console.log('✅ Oracle update cycle completed successfully\n');
    } else {
      console.error('❌ Oracle update cycle failed:', result.error, '\n');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Fatal error in oracle update cycle:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: 0
    };
  }
}

/**
 * Start the cron service
 */
async function startCronService(): Promise<void> {
  console.log('\n' + '╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + '  🚀 ORBITAL ORACLE CRON SERVICE'.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + `  Environment:      ${(process.env.NODE_ENV || 'development')}`.padEnd(68) + '║');
  console.log('║' + `  Schedule:         ${CRON_SCHEDULE}`.padEnd(68) + '║');
  console.log('║' + `  Timezone:         ${TIMEZONE}`.padEnd(68) + '║');
  console.log('║' + `  Price Threshold:  ${PRICE_THRESHOLD}%`.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝\n');
  
  // Validate cron schedule
  if (!cron.validate(CRON_SCHEDULE)) {
    console.error('❌ Invalid cron schedule:', CRON_SCHEDULE);
    process.exit(1);
  }
  
  console.log('⏰ Cron schedule validated successfully');
  console.log('📅 Next scheduled runs:');
  
  // Show next 5 scheduled runs
  const cronJob = cron.schedule(
    CRON_SCHEDULE,
    async () => {
      await runOracleUpdate();
    },
    {
      scheduled: false,
      timezone: TIMEZONE
    }
  );
  
  // Calculate and display next runs (this is for information only)
  const now = new Date();
  console.log(`   • ${now.toISOString()} (starting now...)`);
  
  // Run immediately on startup
  console.log('\n🔄 Running initial oracle update...\n');
  await runOracleUpdate();
  
  // Start the scheduled cron job
  console.log('\n✅ Starting scheduled cron job...\n');
  cronJob.start();
  
  console.log('🟢 Cron service is now running');
  console.log('💡 Press Ctrl+C to stop\n');
}

/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown(): void {
  const shutdown = (signal: string): void => {
    console.log(`\n\n${signal} received. Shutting down gracefully...`);
    console.log('👋 Oracle cron service stopped\n');
    process.exit(0);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Handle uncaught errors
 */
function setupErrorHandlers(): void {
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('❌ Reason:', reason);
    // Don't exit - continue running
  });
  
  process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    console.error(error.stack);
    // Don't exit - continue running
  });
}

// Initialize the cron service
setupErrorHandlers();
setupGracefulShutdown();

startCronService().catch((error: unknown) => {
  console.error('❌ Failed to start cron service:', error);
  process.exit(1);
});

