/**
 * Utility functions for formatting market data for external APIs
 */

/**
 * Format TVL number to abbreviated string (K, M, B)
 */
export function formatTVL(tvl: number): string {
  if (tvl >= 1_000_000_000) {
    return `${(tvl / 1_000_000_000).toFixed(2)}B`;
  } else if (tvl >= 1_000_000) {
    return `${(tvl / 1_000_000).toFixed(2)}M`;
  } else if (tvl >= 1_000) {
    return `${(tvl / 1_000).toFixed(2)}K`;
  } else {
    return tvl.toFixed(2);
  }
}

/**
 * Categorize asset type based on token information
 */
export function categorizeAssetType(assetType: string | undefined, assetName: string): string {
  // If assetType is provided, use it
  if (assetType) {
    return assetType;
  }

  // Otherwise, categorize based on asset name
  const name = assetName.toLowerCase();
  
  if (name.includes('algo')) {
    return 'Native';
  } else if (name.includes('usdc') || name.includes('usdt') || name.includes('xusd')) {
    return 'Stablecoin';
  } else if (name.includes('btc') || name.includes('gobtc')) {
    return 'Wrapped';
  } else {
    return 'Asset';
  }
}

/**
 * Format reward assets array to string
 */
export function formatRewardAssets(rewardAssets?: string[]): string {
  if (!rewardAssets || rewardAssets.length === 0) {
    return 'None';
  }
  
  return rewardAssets.join(', ');
}

/**
 * Map platform URLs
 */
export const platformUrls: Record<string, string> = {
  'Orbital': 'https://app.orbitallending.com',
  'Orbital Lending': 'https://app.orbitallending.com',
  'CompX': 'https://app.compx.io',
  'Folks Finance': 'https://app.folks.finance',
  'AlgoFi': 'https://app.algofi.org',
};

/**
 * Map platform logos
 */
export const platformLogos: Record<string, string> = {
  'Orbital': '/orbital-icon.svg',
  'Orbital Lending': '/orbital-icon.svg',
  'CompX': '/compx-logo-small.png',
  'Folks Finance': '/folks-logo.png',
  'AlgoFi': '/algofi-logo.png',
};

/**
 * Map yield types
 */
export const yieldTypeMapping: Record<string, string> = {
  'lending': 'Lending',
  'staking': 'Staking',
  'liquidity': 'Liquidity Pool',
  'farming': 'Farming',
};

