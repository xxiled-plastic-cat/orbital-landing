import express, { Request, Response, Router } from 'express';
import marketRoutes from './markets.js';
import recordRoutes from './records.js';
import assetRoutes from './assets.js';
import depositBoxRoutes from './depositBoxes.js';

const router: Router = express.Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Orbital API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules under /orbital prefix to match legacy API
router.use('/orbital/markets', marketRoutes);
router.use('/orbital/records', recordRoutes);
router.use('/orbital/deposit-boxes', depositBoxRoutes);

// Asset metadata endpoint (not under /orbital prefix to match frontend expectations)
router.use('/assets', assetRoutes);

export default router;

