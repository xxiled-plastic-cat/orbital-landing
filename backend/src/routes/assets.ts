import express, { Router } from 'express';
import { getAssetMetadata } from '../controllers/assetController.js';

const router: Router = express.Router();

// POST /api/assets - Get asset metadata for multiple asset IDs
router.post('/', getAssetMetadata);

export default router;

