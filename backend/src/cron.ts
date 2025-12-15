/**
 * Oracle Price Update Cron Service
 * 
 * This is a standalone service that runs independently from the main API server.
 * It periodically fetches prices from multiple sources and updates the oracle contracts.
 * 
 * Uses BullMQ with Redis for reliable job scheduling and processing.
 * Designed to be deployed as a separate web service on Digital Ocean.
 */

import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import express from 'express';
import { updateAllOraclePrices, UpdateSummary } from './services/oracleService.js';

// Load environment variables
dotenv.config();

// Configuration
const CRON_SCHEDULE = process.env.ORACLE_CRON_SCHEDULE || '*/2 * * * *'; // Default: every 2 minutes
const PRICE_THRESHOLD = parseFloat(process.env.ORACLE_PRICE_THRESHOLD || '0.03'); // Default: 0.03%
const TIMEZONE = process.env.ORACLE_TIMEZONE || 'America/New_York';
const HEALTH_CHECK_PORT = parseInt(process.env.PORT || '8080'); // Default: 8080
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis connection
const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Queue name
const QUEUE_NAME = 'orbital-oracle-price-update';

// Track last update status for health checks
let lastUpdateStatus: UpdateSummary | null = null;
let isHealthy = true;

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
    
    // Update status for health checks
    lastUpdateStatus = result;
    isHealthy = true;
    
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
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: 0
    };
    lastUpdateStatus = errorResult;
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
        service: 'orbital-oracle-cron',
        lastUpdate: lastUpdateStatus,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'orbital-oracle-cron',
        lastUpdate: lastUpdateStatus,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Readiness check endpoint
  app.get('/ready', (req, res) => {
    res.status(200).json({
      status: 'ready',
      service: 'orbital-oracle-cron',
      timestamp: new Date().toISOString()
    });
  });
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      service: 'orbital-oracle-cron',
      status: isHealthy ? 'running' : 'degraded',
      schedule: CRON_SCHEDULE,
      lastUpdate: lastUpdateStatus,
      timestamp: new Date().toISOString()
    });
  });
  
  app.listen(HEALTH_CHECK_PORT, () => {
    console.log(`🏥 Health check server listening on port ${HEALTH_CHECK_PORT}`);
  });
}

/**
 * Start the cron service with BullMQ
 */
async function startCronService(): Promise<void> {
  console.log('\n' + '╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + '  🚀 ORBITAL ORACLE CRON SERVICE (BullMQ)'.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('║' + `  Environment:      ${(process.env.NODE_ENV || 'development')}`.padEnd(68) + '║');
  console.log('║' + `  Schedule:         ${CRON_SCHEDULE}`.padEnd(68) + '║');
  console.log('║' + `  Timezone:         ${TIMEZONE}`.padEnd(68) + '║');
  console.log('║' + `  Price Threshold:  ${PRICE_THRESHOLD}%`.padEnd(68) + '║');
  console.log('║' + `  Health Port:      ${HEALTH_CHECK_PORT}`.padEnd(68) + '║');
  console.log('║' + `  Redis URL:        ${REDIS_URL}`.padEnd(68) + '║');
  console.log('║' + `  Queue Name:       ${QUEUE_NAME}`.padEnd(68) + '║');
  console.log('║' + ' '.repeat(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝\n');
  
  // Test Redis connection
  try {
    await redisConnection.ping();
    console.log('✅ Redis connection established');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    process.exit(1);
  }
  
  // Create Queue
  const queue = new Queue(QUEUE_NAME, {
    connection: redisConnection,
  });
  
  // Create Worker
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      console.log(`\n📦 Processing job ${job.id}...`);
      await runOracleUpdate();
    },
    {
      connection: redisConnection,
      concurrency: 1, // Process one job at a time
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 24 * 3600, // Keep jobs for 24 hours
      },
      removeOnFail: {
        count: 1000, // Keep last 1000 failed jobs
      },
    }
  );
  
  // Worker event handlers
  worker.on('completed', (job: Job) => {
    console.log(`✅ Job ${job.id} completed`);
  });
  
  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
    isHealthy = false;
  });
  
  worker.on('error', (err: Error) => {
    console.error('❌ Worker error:', err);
    isHealthy = false;
  });
  
  // Add repeatable job with cron pattern
  await queue.add(
    'orbital-oracle-price-update',
    {
      threshold: PRICE_THRESHOLD,
    },
    {
      repeat: {
        pattern: CRON_SCHEDULE,
        tz: TIMEZONE,
      },
      jobId: 'orbital-oracle-price-update-repeatable', // Use fixed ID to prevent duplicates
    }
  );
  
  console.log('✅ Repeatable job added to queue');
  console.log(`📅 Schedule: ${CRON_SCHEDULE} (${TIMEZONE})`);
  
  // Start health check server
  console.log('\n🏥 Starting health check server...\n');
  startHealthCheckServer();
  
  // Run immediately on startup
  console.log('\n🔄 Running initial oracle update...\n');
  await runOracleUpdate();
  
  console.log('\n✅ BullMQ worker is now running');
  console.log('💡 Press Ctrl+C to stop\n');
  
  // Store references for graceful shutdown
  (global as any).oracleQueue = queue;
  (global as any).oracleWorker = worker;
}

/**
 * Handle graceful shutdown
 */
function setupGracefulShutdown(): void {
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n\n${signal} received. Shutting down gracefully...`);
    
    // Close worker
    const worker = (global as any).oracleWorker as Worker | undefined;
    if (worker) {
      console.log('🛑 Closing worker...');
      await worker.close();
    }
    
    // Close queue
    const queue = (global as any).oracleQueue as Queue | undefined;
    if (queue) {
      console.log('🛑 Closing queue...');
      await queue.close();
    }
    
    // Close Redis connection
    console.log('🛑 Closing Redis connection...');
    await redisConnection.quit();
    
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

