import express from 'express';
import marketRoutes from './markets.js';
import recordRoutes from './records.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Orbital API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules under /orbital prefix to match legacy API
router.use('/orbital/markets', marketRoutes);
router.use('/orbital/records', recordRoutes);

export default router;
