import { Request, Response } from 'express';
import * as marketAnalyticsService from '../services/marketAnalyticsService.js';

/**
 * Get all market analytics records
 * GET /api/orbital/markets/analytics
 */
export const getAllMarketAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await marketAnalyticsService.getAllMarketAnalytics();
    res.json({
      success: true,
      data: analytics,
      count: analytics.length
    });
  } catch (error) {
    console.error('Error fetching all market analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market analytics',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Get market analytics for a specific market by app ID
 * GET /api/orbital/markets/:id/analytics
 * Query params: startDate (optional), endDate (optional)
 */
export const getMarketAnalyticsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const marketAppId = parseInt(req.params.id, 10);
    
    if (isNaN(marketAppId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid market app ID',
        message: 'Market app ID must be a valid number'
      });
      return;
    }

    // Parse optional date filters
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
      if (isNaN(startDate.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid start date',
          message: 'startDate must be a valid ISO date string'
        });
        return;
      }
    }

    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
      if (isNaN(endDate.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Invalid end date',
          message: 'endDate must be a valid ISO date string'
        });
        return;
      }
    }

    const analytics = await marketAnalyticsService.getMarketAnalytics(
      marketAppId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: analytics,
      count: analytics.length
    });
  } catch (error) {
    console.error(`Error fetching market analytics for app ${req.params.id}:`, error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Market analytics not found',
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch market analytics',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
};

/**
 * Add a new market analytics record
 * POST /api/orbital/markets/analytics
 */
export const addMarketAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { marketAppId, baseTokenId, tvl, borrowing, dateAdded } = req.body;

    // Validate required fields
    if (marketAppId === undefined || baseTokenId === undefined || tvl === undefined || borrowing === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'marketAppId, baseTokenId, tvl, and borrowing are required'
      });
      return;
    }

    const analytics = await marketAnalyticsService.addMarketAnalytics({
      marketAppId: Number(marketAppId),
      baseTokenId: Number(baseTokenId),
      tvl: Number(tvl),
      borrowing: Number(borrowing),
      dateAdded: dateAdded ? new Date(dateAdded) : undefined
    });

    res.status(201).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error adding market analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add market analytics',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Delete market analytics records
 * DELETE /api/orbital/markets/analytics/:id? (optional marketAppId)
 */
export const deleteMarketAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const marketAppId = req.params.id ? parseInt(req.params.id, 10) : undefined;

    if (marketAppId !== undefined && isNaN(marketAppId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid market app ID',
        message: 'Market app ID must be a valid number'
      });
      return;
    }

    const deletedCount = await marketAnalyticsService.deleteMarketAnalytics(marketAppId);

    res.json({
      success: true,
      message: `Deleted ${deletedCount} market analytics record(s)`,
      deletedCount
    });
  } catch (error) {
    console.error('Error deleting market analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete market analytics',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

