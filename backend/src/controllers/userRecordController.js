import * as userRecordService from '../services/userRecordService.js';

export const createUserRecord = async (req, res) => {
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
      message: error.message
    });
  }
};

export const getRecordsByMarket = async (req, res) => {
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
      message: error.message
    });
  }
};

export const getRecordsByAddressAndMarket = async (req, res) => {
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
      message: error.message
    });
  }
};

export const getUserStatsForMarket = async (req, res) => {
  try {
    const { address, marketId } = req.params;
    const { baseTokenId, lstTokenId, acceptedCollateralTokenIds } = req.body;
    
    const result = await userRecordService.getUserStatsForMarket(
      address,
      parseInt(marketId),
      parseInt(baseTokenId),
      parseInt(lstTokenId),
      acceptedCollateralTokenIds.map(id => parseInt(id))
    );
    res.json(result);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error.message
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { address } = req.params;
    const result = await userRecordService.getUserStats(address);
    res.json(result);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
      message: error.message
    });
  }
};

