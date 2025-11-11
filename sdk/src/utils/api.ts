/**
 * API utilities for fetching data from Orbital backend
 */

import { MarketInfo } from '../types';

const DEFAULT_API_BASE_URL = 'https://api.orbitalfinance.io';

/**
 * Fetch market list from Orbital backend API
 * @param network Network to filter by
 * @param apiBaseUrl Optional API base URL (defaults to production)
 * @returns Array of market info
 */
export async function fetchMarketList(
  network: 'mainnet' | 'testnet',
  apiBaseUrl: string = DEFAULT_API_BASE_URL
): Promise<MarketInfo[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/orbital/markets`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const markets = await response.json();
    
    // Filter by network
    return markets.filter((m: MarketInfo) => m.network === network);
  } catch (error) {
    console.error('Failed to fetch market list from API:', error);
    throw new Error('Failed to fetch market list from Orbital API');
  }
}

/**
 * Fetch single market info from backend API
 * @param appId Market application ID
 * @param apiBaseUrl Optional API base URL
 * @returns Market info
 */
export async function fetchMarketInfo(
  appId: number,
  apiBaseUrl: string = DEFAULT_API_BASE_URL
): Promise<MarketInfo> {
  try {
    const response = await fetch(`${apiBaseUrl}/orbital/markets/${appId}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch market info for ${appId}:`, error);
    throw new Error(`Failed to fetch market info for ${appId}`);
  }
}

