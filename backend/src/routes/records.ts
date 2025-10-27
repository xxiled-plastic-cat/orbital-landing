import express, { Router } from 'express';
import {
  createUserRecord,
  getRecordsByMarket,
  getRecordsByAddressAndMarket,
  getUserStatsForMarket,
  getUserStats
} from '../controllers/userRecordController.js';

const router: Router = express.Router();

// POST /api/orbital/records - Create new user record
router.post('/', createUserRecord);

// GET /api/orbital/records/market/:marketId - Get all records for a market
router.get('/market/:marketId', getRecordsByMarket);

// GET /api/orbital/records/:address/:marketId - Get records for address and market
router.get('/:address/:marketId', getRecordsByAddressAndMarket);

// POST /api/orbital/records/:address/:marketId/stats - Get user stats for market
router.post('/:address/:marketId/stats', getUserStatsForMarket);

// GET /api/orbital/records/:address - Get all records for an address
router.get('/:address', getUserStats);

export default router;

