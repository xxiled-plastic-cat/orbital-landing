import app from './app.js';
import { testConnection } from './config/database.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Note: Database schema is managed by migrations
    // Run 'npm run migrate:up' to create/update tables

    // Start server
    app.listen(PORT, HOST, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Orbital Lending API Server                      ║
║                                                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║   Server:      http://${HOST}:${PORT}                ║
║   Health:      http://${HOST}:${PORT}/api/health     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();

