import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { getPricing } from '../contracts/oracle/pricing';
import { collateralUSDFromLST } from '../contracts/lending/testing-utils';

// Price cache entry with timestamp
interface PriceCacheEntry {
  price: number;
  timestamp: number;
  isStale: boolean;
}

// LST price calculation parameters
interface LSTParams {
  lstAmount: bigint;
  totalDeposits: bigint;
  circulatingLst: bigint;
  baseTokenPrice: number;
  lstTokenDecimals?: number;
  baseTokenDecimals?: number;
}

// Price context interface
interface PriceContextType {
  // Base token prices (from oracle)
  getBaseTokenPrice: (tokenId: number, oracleAppId: number) => Promise<number>;
  
  // LST collateral token prices (calculated)
  getLSTTokenPrice: (
    tokenId: string, 
    marketId: string, 
    lstParams: LSTParams
  ) => Promise<number>;
  
  // Batch price fetching
  refreshAllPrices: () => Promise<void>;
  
  // Price staleness checking
  isPriceStale: (tokenId: string) => boolean;
  
  // Loading states
  isRefreshing: boolean;
  lastRefresh: Date | null;
  
  // Price cache for debugging/monitoring
  priceCache: Map<string, PriceCacheEntry>;
}

const PriceContext = createContext<PriceContextType | null>(null);

// Price cache duration (2 minutes)
const PRICE_CACHE_DURATION = 2 * 60 * 1000;
// Price staleness threshold (30 seconds)
const PRICE_STALE_THRESHOLD = 30 * 1000;

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { transactionSigner, activeAddress } = useWallet();
  const [priceCache, setPriceCache] = useState<Map<string, PriceCacheEntry>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Get base token price from oracle (no caching - always fresh)
  const getBaseTokenPrice = useCallback(async (tokenId: number, oracleAppId: number): Promise<number> => {
    if (!transactionSigner || !activeAddress) {
      console.warn('Wallet not connected for price fetching');
      return 0;
    }

    try {
      console.log(`Fetching fresh oracle price for token ${tokenId}`);
      const price = await getPricing({
        tokenId,
        address: activeAddress,
        signer: transactionSigner,
        appId: oracleAppId,
      });

      return price;
    } catch (error) {
      console.error(`Failed to fetch price for token ${tokenId}:`, error);
      return 0;
    }
  }, [transactionSigner, activeAddress]);

  // Get LST token price with caching
  const getLSTTokenPrice = useCallback(async (
    tokenId: string, 
    marketId: string, 
    lstParams: LSTParams
  ): Promise<number> => {
    const cacheKey = `lst-${tokenId}-${marketId}`;
    const cached = priceCache.get(cacheKey);
    
    // Return cached price if still valid
    if (cached && Date.now() - cached.timestamp < PRICE_CACHE_DURATION) {
      return cached.price;
    }

    try {
      console.log(`Calculating fresh LST price for token ${tokenId}`, {
        totalDeposits: lstParams.totalDeposits.toString(),
        circulatingLst: lstParams.circulatingLst.toString(),
        baseTokenPrice: lstParams.baseTokenPrice
      });
      
      // Calculate LST price using the helper function
      const lstDecimals = lstParams.lstTokenDecimals ?? 6;
      const baseDecimals = lstParams.baseTokenDecimals ?? 6;
      const oneTokenAmount = BigInt(10 ** lstDecimals); // 1 token in microunits
      const baseTokenPriceMicro = BigInt(Math.floor(lstParams.baseTokenPrice * 10 ** baseDecimals));
      
      console.log(`LST price calculation inputs:`, {
        oneTokenAmount: oneTokenAmount.toString(),
        totalDeposits: lstParams.totalDeposits.toString(),
        circulatingLst: lstParams.circulatingLst.toString(),
        baseTokenPriceMicro: baseTokenPriceMicro.toString(),
        lstDecimals,
        baseDecimals
      });
      
      const pricePerTokenUSDMicro = collateralUSDFromLST(
        oneTokenAmount,
        lstParams.totalDeposits,
        lstParams.circulatingLst,
        baseTokenPriceMicro
      );
      
      console.log(`LST price calculation result (micro USD):`, pricePerTokenUSDMicro.toString());
      
      const price = Number(pricePerTokenUSDMicro) / 10 ** baseDecimals; // Convert back to USD
      console.log(`Final LST price (USD):`, price);

      // Update cache
      setPriceCache(prev => new Map(prev.set(cacheKey, {
        price,
        timestamp: Date.now(),
        isStale: false
      })));

      return price;
    } catch (error) {
      console.error(`Failed to calculate LST price for token ${tokenId}:`, error);
      
      // Return stale price if available, otherwise 0
      if (cached) {
        // Mark as stale
        setPriceCache(prev => new Map(prev.set(cacheKey, {
          ...cached,
          isStale: true
        })));
        return cached.price;
      }
      
      return 0;
    }
  }, [priceCache]);

  // Check if a price is stale (only applies to LST prices now)
  const isPriceStale = useCallback((tokenId: string): boolean => {
    const lstKey = `lst-${tokenId}`;
    const lstPrice = priceCache.get(lstKey);
    
    if (!lstPrice) return true;
    return lstPrice.isStale || (Date.now() - lstPrice.timestamp > PRICE_STALE_THRESHOLD);
  }, [priceCache]);

  // Refresh cached LST prices (oracle prices are always fresh)
  const refreshAllPrices = useCallback(async () => {
    if (!transactionSigner || !activeAddress || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    console.log('Refreshing cached LST prices...');

    try {
      // Mark all cached LST prices as stale to force refresh
      setPriceCache(prev => {
        const newCache = new Map();
        for (const [key, entry] of prev.entries()) {
          if (key.startsWith('lst-')) {
            newCache.set(key, { ...entry, isStale: true });
          }
        }
        return newCache;
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh LST prices:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [transactionSigner, activeAddress, isRefreshing]);

  // Auto-refresh prices every 30 seconds
  useEffect(() => {
    if (!transactionSigner || !activeAddress) return;

    const interval = setInterval(() => {
      refreshAllPrices();
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(interval);
  }, [transactionSigner, activeAddress, refreshAllPrices]);

  // Clean up stale cache entries periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      setPriceCache(prev => {
        const newCache = new Map();
        const now = Date.now();
        
        for (const [key, entry] of prev.entries()) {
          // Keep entries that are less than 10 minutes old
          if (now - entry.timestamp < 10 * 60 * 1000) {
            newCache.set(key, entry);
          }
        }
        
        return newCache;
      });
    }, 5 * 60 * 1000); // Clean up every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  const contextValue: PriceContextType = {
    getBaseTokenPrice,
    getLSTTokenPrice,
    refreshAllPrices,
    isPriceStale,
    isRefreshing,
    lastRefresh,
    priceCache,
  };

  return (
    <PriceContext.Provider value={contextValue}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePriceContext = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePriceContext must be used within a PriceProvider');
  }
  return context;
};
