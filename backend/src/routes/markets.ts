import express, { Router } from 'express';
import {
  getAllMarkets,
  getMarketById,
  createMarket,
  getAllMarketsWithDetails,
  getMarketDetailsById,
  getCanixFormattedMarkets
} from '../controllers/marketController.js';

const router: Router = express.Router();

// GET /api/orbital/markets - Get all markets (basic info only)
router.get('/', getAllMarkets);

// GET /api/orbital/markets/canix - Get markets in Canix aggregator format
// Must be defined before /:id route to avoid conflicts
router.get('/canix', getCanixFormattedMarkets);

// GET /api/orbital/markets/details - Get all markets with enriched data (APY, TVL, etc.)
// Must be defined before /:id route to avoid conflicts
router.get('/details', getAllMarketsWithDetails);

// GET /api/orbital/markets/:id - Get market by ID (basic info only)
router.get('/:id', getMarketById);

// GET /api/orbital/markets/:id/details - Get enriched market data by ID
router.get('/:id/details', getMarketDetailsById);

// POST /api/orbital/markets - Create new market
router.post('/', createMarket);

export default router;

