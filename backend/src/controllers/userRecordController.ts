import { Request, Response } from 'express';
import * as userRecordService from '../services/userRecordService.js';

export const createUserRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await userRecordService.addUserRecord(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error creating user record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user record',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getRecordsByMarket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { marketId } = req.params;
    const result = await userRecordService.getUserRecordsByMarketId(
      parseInt(marketId)
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch records',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getRecordsByAddressAndMarket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, marketId } = req.params;
    const result = await userRecordService.getUserRecordsByAddressAndMarketId(
      address,
      parseInt(marketId)
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch records',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getUserStatsForMarket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, marketId } = req.params;
    const { baseTokenId, lstTokenId, acceptedCollateralTokenIds } = req.body;
    
    const result = await userRecordService.getUserStatsForMarket(
      address,
      parseInt(marketId),
      parseInt(baseTokenId),
      parseInt(lstTokenId),
      acceptedCollateralTokenIds.map((id: string | number) => parseInt(String(id)))
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    const result = await userRecordService.getUserStats(address);
    res.json(result);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

