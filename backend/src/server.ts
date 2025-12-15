import app from './app.js';
import { testConnection } from './config/database.js';
import { closeCacheConnection } from './services/cacheService.js';
import { AddressInfo } from 'net';

const PORT = parseInt(process.env.PORT || '3000', 10);
// Always bind to 0.0.0.0 in production for container deployments
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : (process.env.HOST || '0.0.0.0');

const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Note: Database schema is managed by migrations
    // Run 'npm run migrate:up' to create/update tables

    // Start server - bind to HOST
    const server = app.listen(PORT, HOST, () => {
      const addr = server.address() as AddressInfo;
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Orbital Lending API Server                      ║
║                                                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║   Binding:     ${HOST}:${PORT}                         ║
║   Address:     ${addr.address}:${addr.port}            ║
║   Health:      http://0.0.0.0:${PORT}/api/health     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    // Handle server errors
    server.on('error', (error: Error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} signal received: closing HTTP server and connections`);
  
  try {
    // Close Redis cache connection
    await closeCacheConnection();
    console.log('✅ Cache connection closed');
  } catch (error) {
    console.error('Error closing cache connection:', error);
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

