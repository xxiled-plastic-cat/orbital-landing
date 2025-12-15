/**
 * Redis Cache Service
 * 
 * Provides caching functionality using Redis for improved performance.
 * Handles serialization/deserialization and TTL management.
 */

import Redis from 'ioredis';

// Redis connection (reuse existing connection if available)
let redisClient: Redis | null = null;

/**
 * Get or create Redis client
 */
function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis cache connected');
    });
  }
  return redisClient;
}

/**
 * Cache key prefixes for different data types
 */
export const CacheKeys = {
  MARKET_ENRICHED: 'market:enriched:',
  MARKET_BASIC: 'market:basic:',
  MARKET_ALL_ENRICHED: 'market:all:enriched:',
  ASSET_INFO: 'asset:info:',
  ASSET_METADATA: 'asset:metadata:',
  APP_GLOBAL_STATE: 'app:state:',
  ORACLE_PRICE: 'oracle:price:',
} as const;

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  MARKET_ENRICHED: 30, // 30 seconds - market data changes frequently
  MARKET_BASIC: 300, // 5 minutes - basic market info changes rarely
  ASSET_INFO: 3600, // 1 hour - asset info rarely changes
  ASSET_METADATA: 3600, // 1 hour - metadata rarely changes
  APP_GLOBAL_STATE: 15, // 15 seconds - state changes frequently
  ORACLE_PRICE: 10, // 10 seconds - prices update frequently
} as const;

/**
 * Get cached value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    
    if (!value) {
      return null;
    }
    
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null; // Return null on error to allow fallback to source
  }
}

/**
 * Set cached value with TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 300
): Promise<boolean> {
  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    
    if (ttlSeconds > 0) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    return false; // Return false but don't throw - allow operation to continue
  }
}

/**
 * Delete cached value
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple cached values by pattern
 */
export async function deleteCacheByPattern(pattern: string): Promise<number> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    await client.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`Error deleting cache by pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Invalidate all market-related cache
 */
export async function invalidateMarketCache(appId?: number): Promise<void> {
  try {
    if (appId) {
      // Invalidate specific market
      await deleteCache(`${CacheKeys.MARKET_ENRICHED}${appId}`);
      await deleteCache(`${CacheKeys.MARKET_BASIC}${appId}`);
    }
    
    // Always invalidate "all markets" cache
    await deleteCacheByPattern(`${CacheKeys.MARKET_ALL_ENRICHED}*`);
  } catch (error) {
    console.error('Error invalidating market cache:', error);
  }
}

/**
 * Invalidate asset-related cache
 */
export async function invalidateAssetCache(assetId?: number): Promise<void> {
  try {
    if (assetId) {
      await deleteCache(`${CacheKeys.ASSET_INFO}${assetId}`);
      await deleteCache(`${CacheKeys.ASSET_METADATA}${assetId}`);
    } else {
      // Invalidate all asset cache
      await deleteCacheByPattern(`${CacheKeys.ASSET_INFO}*`);
      await deleteCacheByPattern(`${CacheKeys.ASSET_METADATA}*`);
    }
  } catch (error) {
    console.error('Error invalidating asset cache:', error);
  }
}

/**
 * Get or set cached value (cache-aside pattern)
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch from source
  const value = await fetchFn();
  
  // Set in cache (don't await - fire and forget)
  setCache(key, value, ttlSeconds).catch((err) => {
    console.error(`Failed to cache value for key ${key}:`, err);
  });
  
  return value;
}

/**
 * Close Redis connection (for graceful shutdown)
 */
export async function closeCacheConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
