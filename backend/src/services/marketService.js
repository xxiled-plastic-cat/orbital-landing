import { OrbitalLendingMarket } from '../models/index.js';

export async function getOrbitalLendingMarkets() {
  try {
    const markets = await OrbitalLendingMarket.findAll();
    return markets;
  } catch (error) {
    console.error('Error fetching orbital lending markets:', error);
    throw error;
  }
}

export async function getOrbitalLendingMarketById(id) {
  try {
    const market = await OrbitalLendingMarket.findByPk(id);
    if (!market) {
      throw new Error(`Orbital lending market with id ${id} not found`);
    }
    return market;
  } catch (error) {
    console.error('Error fetching orbital lending market by ID:', error);
    throw error;
  }
}

export async function addOrbitalLendingMarket(appId, baseTokenId, lstTokenId) {
  try {
    const marketData = {
      appId,
      baseTokenId,
      lstTokenId,
    };
    const market = await OrbitalLendingMarket.create(marketData);
    return market;
  } catch (error) {
    console.error('Error adding orbital lending market:', error);
    throw error;
  }
}

