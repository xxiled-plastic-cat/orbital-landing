import express, { Router } from 'express';
import {
  getAllMarkets,
  getMarketById,
  createMarket,
  getAllMarketsWithDetails,
  getMarketDetailsById,
  getCanixFormattedMarkets
} from '../controllers/marketController.js';
import {
  getAllMarketAnalytics,
  getMarketAnalyticsById,
  addMarketAnalytics,
  deleteMarketAnalytics
} from '../controllers/marketAnalyticsController.js';

const router: Router = express.Router();

// GET /api/orbital/markets - Get all markets (basic info only)
router.get('/', getAllMarkets);

// GET /api/orbital/markets/canix - Get markets in Canix aggregator format
// Must be defined before /:id route to avoid conflicts
router.get('/canix', getCanixFormattedMarkets);

// GET /api/orbital/markets/details - Get all markets with enriched data (APY, TVL, etc.)
// Must be defined before /:id route to avoid conflicts
router.get('/details', getAllMarketsWithDetails);

// GET /api/orbital/markets/analytics - Get all market analytics
// Must be defined before /:id route to avoid conflicts
router.get('/analytics', getAllMarketAnalytics);

// POST /api/orbital/markets/analytics - Add market analytics record
router.post('/analytics', addMarketAnalytics);

// DELETE /api/orbital/markets/analytics/:id? - Delete market analytics (optional marketAppId)
router.delete('/analytics/:id?', deleteMarketAnalytics);

// GET /api/orbital/markets/:id - Get market by ID (basic info only)
router.get('/:id', getMarketById);

// GET /api/orbital/markets/:id/details - Get enriched market data by ID
router.get('/:id/details', getMarketDetailsById);

// GET /api/orbital/markets/:id/analytics - Get market analytics for specific market
router.get('/:id/analytics', getMarketAnalyticsById);

// POST /api/orbital/markets - Create new market
router.post('/', createMarket);

export default router;

