/**
 * API utilities for fetching data from Orbital backend
 */

import { MarketInfo } from '../types';

const DEFAULT_API_BASE_URL = 'https://orbital-backend-nssb4.ondigitalocean.app';

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
  const url = `${apiBaseUrl}/api/orbital/markets`;
  console.log(`[fetchMarketList] Requesting: ${url} for network: ${network}`);
  
  try {
    const response = await fetch(url);
    console.log(`[fetchMarketList] Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read response');
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}. Response: ${errorText}`
      );
    }

    const markets = (await response.json()) as MarketInfo[];
    console.log(`[fetchMarketList] Received ${markets.length} total markets`);
    
    // Filter by network
    const filtered = markets.filter((m: MarketInfo) => m.network === network);
    console.log(`[fetchMarketList] Filtered to ${filtered.length} markets for ${network}`);
    
    return filtered;
  } catch (error) {
    console.error('[fetchMarketList] Failed to fetch market list from API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to fetch market list from Orbital API (${url}): ${errorMessage}`
    );
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
    const response = await fetch(`${apiBaseUrl}/api/orbital/markets/${appId}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as MarketInfo;
  } catch (error) {
    console.error(`Failed to fetch market info for ${appId}:`, error);
    throw new Error(`Failed to fetch market info for ${appId}`);
  }
}

