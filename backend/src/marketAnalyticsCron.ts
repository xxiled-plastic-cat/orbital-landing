/**
 * Market Analytics Collection Cron Service
 * 
 * This service runs independently to collect market analytics data (TVL and borrowing)
 * on an hourly schedule. It can be deployed as a separate service or integrated into
 * the main API server.
 */

import cron from 'node-cron';
import dotenv from 'dotenv';
import express from 'express';
import { collectMarketAnalytics } from './services/marketAnalyticsCronService.js';
import { testConnection } from './config/database.js';

// Load environment variables
dotenv.config();

// Configuration
const CRON_SCHEDULE = process.env.MARKET_ANALYTICS_CRON_SCHEDULE || '0 * * * *'; // Default: every hour at minute 0
const TIMEZONE = process.env.MARKET_ANALYTICS_TIMEZONE || 'America/New_York';
const HEALTH_CHECK_PORT = parseInt(process.env.MARKET_ANALYTICS_PORT || '8081', 10); // Default: 8081

// Track last update status for health checks
interface CollectionSummary {
  success: boolean;
  processed: number;
  errors: number;
  errorDetails?: string[];
  timestamp: string;
}

let lastCollectionStatus: CollectionSummary | null = null;
let isHealthy = true;

/**
 * Execute the market analytics collection cycle
 */
async function runMarketAnalyticsCollection(): Promise<CollectionSummary> {
  const timestamp = new Date().toISOString();
  
  console.log('\n' + '╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + '  📊 ORBITAL MARKET ANALYTICS COLLECTION'.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + `  Time: ${timestamp}`.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');
  
  try {
    const result = await collectMarketAnalytics();
    
    const summary: CollectionSummary = {
      ...result,
      timestamp
    };
    
    // Update status for health checks
    lastCollectionStatus = summary;
    isHealthy = result.success;
    
    if (result.success) {
      console.log('✅ Market analytics collection completed successfully\n');
    } else {
      console.error('❌ Market analytics collection failed:', result.errorDetails, '\n');
    }
    
    return summary;
  } catch (error) {
    console.error('❌ Fatal error in market analytics collection:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    const errorResult: CollectionSummary = {
      success: false,
      processed: 0,
      errors: 1,
      errorDetails: [error instanceof Error ? error.message : String(error)],
      timestamp
    };
    lastCollectionStatus = errorResult;
    isHealthy = false;
    return errorResult;
  }
}

/**
 * Start the health check HTTP server
 */
function startHealthCheckServer(): void {
  const app = express();
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    if (isHealthy) {
      res.status(200).json({
        status: 'healthy',
        service: 'orbital-market-analytics-cron',
        lastCollection: lastCollectionStatus,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'orbital-market-analytics-cron',
        lastCollection: lastCollectionStatus,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Readiness check endpoint
  app.get('/ready', (req, res) => {
    res.status(200).json({
      status: 'ready',
      service: 'orbital-market-analytics-cron',
      timestamp: new Date().toISOString()
    });
  });
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      service: 'orbital-market-analytics-cron',
      status: isHealthy ? 'running' : 'degraded',
      schedule: CRON_SCHEDULE,
      lastCollection: lastCollectionStatus,
      timestamp: new Date().toISOString()
    });
  });
  
  app.listen(HEALTH_CHECK_PORT, () => {
    console.log(`🏥 Health check server listening on port ${HEALTH_CHECK_PORT}`);
  });
}

/**
 * Start the cron service
 */
async function startCronService(): Promise<void> {
  console.log('\n' + '╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + '  🚀 ORBITAL MARKET ANALYTICS CRON SERVICE'.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + `  Environment:      ${(process.env.NODE_ENV || 'development')}`.padEnd(68) + '║');
  console.log('║' + `  Schedule:         ${CRON_SCHEDULE}`.padEnd(68) + '║');
  console.log('║' + `  Timezone:         ${TIMEZONE}`.padEnd(68) + '║');
  console.log('║' + `  Health Port:      ${HEALTH_CHECK_PORT}`.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝\n');
  
  // Test database connection
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
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
      await runMarketAnalyticsCollection();
    },
    {
      scheduled: false,
      timezone: TIMEZONE
    }
  );
  
  // Calculate and display next runs (this is for information only)
  const now = new Date();
  console.log(`   • ${now.toISOString()} (starting now...)`);
  
  // Start health check server first
  console.log('\n🏥 Starting health check server...\n');
  startHealthCheckServer();
  
  // Run immediately on startup
  console.log('\n🔄 Running initial market analytics collection...\n');
  await runMarketAnalyticsCollection();
  
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
    console.log('👋 Market analytics cron service stopped\n');
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

