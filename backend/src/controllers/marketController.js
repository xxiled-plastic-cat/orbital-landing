import * as marketService from '../services/marketService.js';

export const getAllMarkets = async (req, res) => {
  try {
    const markets = await marketService.getOrbitalLendingMarkets();
    res.json(markets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch markets',
      message: error.message
    });
  }
};

export const getMarketById = async (req, res) => {
  try {
    const { id } = req.params;
    const market = await marketService.getOrbitalLendingMarketById(id);
    res.json(market);
  } catch (error) {
    console.error('Error fetching market:', error);
    res.status(404).json({
      success: false,
      error: 'Market not found',
      message: error.message
    });
  }
};

export const createMarket = async (req, res) => {
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
      message: error.message
    });
  }
};
