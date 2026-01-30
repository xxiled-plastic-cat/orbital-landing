import express, { Router } from 'express';
import {
  copyDepositRecords,
  getAllDepositRecords,
} from '../controllers/depositBoxController.js';

const router: Router = express.Router();

// POST /api/orbital/deposit-boxes/copy-records - Copy all deposit records from source to target contract
/* router.post('/copy-records', copyDepositRecords);

// GET /api/orbital/deposit-boxes/:appId - Get all deposit records from a contract
router.get('/:appId', getAllDepositRecords); */

export default router;
