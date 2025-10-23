import express from 'express';
import {
  getAllMarkets,
  getMarketById,
  createMarket
} from '../controllers/marketController.js';

const router = express.Router();

// GET /api/orbital/markets - Get all markets
router.get('/', getAllMarkets);

// GET /api/orbital/markets/:id - Get market by ID
router.get('/:id', getMarketById);

// POST /api/orbital/markets - Create new market
router.post('/', createMarket);

export default router;
