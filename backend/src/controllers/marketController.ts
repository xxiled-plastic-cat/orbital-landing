import { Request, Response } from 'express';
import * as marketService from '../services/marketService.js';
import {
  formatTVL,
  categorizeAssetType,
  formatRewardAssets,
  platformUrls,
  platformLogos,
  yieldTypeMapping,
} from '../utils/formatters.js';

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
    const { appId, baseTokenId, lstTokenId, network = 'mainnet' } = req.body;
    const market = await marketService.addOrbitalLendingMarket(
      appId,
      baseTokenId,
      lstTokenId,
      network
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

/**
 * Get enriched market data with on-chain metrics (APY, TVL, etc.)
 * GET /api/orbital/markets/details
 * Query params: network (optional) - filter by 'mainnet' or 'testnet'
 */
export const getAllMarketsWithDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const network = req.query.network as 'mainnet' | 'testnet' | undefined;
    
    // Validate network parameter
    if (network && network !== 'mainnet' && network !== 'testnet') {
      res.status(400).json({
        success: false,
        error: 'Invalid network parameter',
        message: 'Network must be either "mainnet" or "testnet"'
      });
      return;
    }

    const enrichedMarkets = await marketService.getAllEnrichedMarketData(network);
    res.json({
      success: true,
      data: enrichedMarkets,
      count: enrichedMarkets.length
    });
  } catch (error) {
    console.error('Error fetching enriched markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market details',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Get enriched market data for a specific market by app ID
 * GET /api/orbital/markets/:id/details
 */
export const getMarketDetailsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const appId = parseInt(req.params.id, 10);
    
    if (isNaN(appId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid app ID',
        message: 'App ID must be a valid number'
      });
      return;
    }

    const enrichedMarket = await marketService.getEnrichedMarketData(appId);
    res.json({
      success: true,
      data: enrichedMarket
    });
  } catch (error) {
    console.error(`Error fetching market details for app ${req.params.id}:`, error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Market not found',
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch market details',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
};

/**
 * Get markets formatted for Canix/external aggregator format
 * GET /api/orbital/markets/canix
 * Query params: network (optional) - filter by 'mainnet' or 'testnet'
 */
export const getCanixFormattedMarkets = async (req: Request, res: Response): Promise<void> => {
  try {
    const network = req.query.network as 'mainnet' | 'testnet' | undefined;
    
    // Validate network parameter
    if (network && network !== 'mainnet' && network !== 'testnet') {
      res.status(400).json({
        success: false,
        error: 'Invalid network parameter',
        message: 'Network must be either "mainnet" or "testnet"'
      });
      return;
    }

    // Fetch enriched market data
    const enrichedMarkets = await marketService.getAllEnrichedMarketData(network);

    // Transform to Canix format
    const canixFormattedData = enrichedMarkets.map((market) => ({
      platform: 'Orbital Lending',
      logo: platformLogos['Orbital Lending'] || '/orbital-icon.svg',
      url: platformUrls['Orbital Lending'] || 'https://orbital.compx.io',
      asset: market.baseTokenName || 'Unknown Asset',
      assetType: categorizeAssetType(undefined, market.baseTokenName),
      yieldType: 'Lending',
      yield: market.supplyApy ? `${market.supplyApy.toFixed(2)}%` : '0.00%',
      tvl: market.tvl ? `$${formatTVL(market.tvl)}` : '$0',
      rewards: formatRewardAssets([]), // Orbital doesn't have reward tokens currently
      // Additional fields that might be useful
      borrowApy: market.borrowApy ? `${market.borrowApy.toFixed(2)}%` : '0.00%',
      utilizationRate: market.utilizationRate ? `${market.utilizationRate.toFixed(2)}%` : '0.00%',
      network: market.network,
      appId: market.appId,
      baseTokenId: market.baseTokenId,
      baseTokenSymbol: market.baseTokenSymbol,
    }));

    res.json({
      success: true,
      data: canixFormattedData,
      count: canixFormattedData.length
    });
  } catch (error) {
    console.error('Error fetching Canix formatted markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market data',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

