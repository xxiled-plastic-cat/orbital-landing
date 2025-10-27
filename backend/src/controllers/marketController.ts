import { Request, Response } from 'express';
import * as marketService from '../services/marketService.js';

export const getAllMarkets = async (req: Request, res: Response): Promise<void> => {
  try {
    const markets = await marketService.getOrbitalLendingMarkets();
    res.json(markets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch markets',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getMarketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const market = await marketService.getOrbitalLendingMarketById(id);
    res.json(market);
  } catch (error) {
    console.error('Error fetching market:', error);
    res.status(404).json({
      success: false,
      error: 'Market not found',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export const createMarket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appId, baseTokenId, lstTokenId } = req.body;
    const market = await marketService.addOrbitalLendingMarket(
      appId,
      baseTokenId,
      lstTokenId
    );
    res.status(201).json(market);
  } catch (error) {
    console.error('Error creating market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create market',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

