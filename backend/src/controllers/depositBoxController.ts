import { Request, Response } from 'express';
import * as depositBoxService from '../services/depositBoxService.js';

/**
 * POST /api/orbital/deposit-boxes/copy-records
 * Copies all deposit records from source contract to target contract
 * 
 * Uses MARKET_ADMIN_MNEMONIC and MARKET_ADMIN_ADDRESS from environment variables
 * (similar to how oracleService uses ORACLE_ADMIN_MNEMONIC and ORACLE_ADMIN_ADDRESS)
 * 
 * Body:
 * {
 *   sourceAppId: number,
 *   targetAppId: number
 * }
 */
export const copyDepositRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sourceAppId, targetAppId } = req.body;
    
    // Validate required fields
    if (!sourceAppId || !targetAppId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: sourceAppId and targetAppId are required',
      });
      return;
    }
    
    const result = await depositBoxService.copyDepositRecords({
      sourceAppId: parseInt(String(sourceAppId)),
      targetAppId: parseInt(String(targetAppId)),
    });
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in copyDepositRecords controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to copy deposit records',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * GET /api/orbital/deposit-boxes/:appId
 * Gets all deposit records from a contract
 * 
 * Params:
 *   appId: number (required)
 */
export const getAllDepositRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appId } = req.params;
    
    if (!appId) {
      res.status(400).json({
        success: false,
        error: 'appId parameter is required',
      });
      return;
    }
    
    const result = await depositBoxService.getAllDepositRecords(
      parseInt(String(appId))
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in getAllDepositRecords controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deposit records',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
