import { useQuery } from '@tanstack/react-query';
import { getMarketAnalytics, MarketAnalytics } from '../services/orbitalApi';

const MARKET_ANALYTICS_QUERY_KEY = ['market-analytics'] as const;

export function useMarketAnalytics(marketAppId: number | string) {
  return useQuery({
    queryKey: [...MARKET_ANALYTICS_QUERY_KEY, marketAppId],
    queryFn: async (): Promise<MarketAnalytics[]> => {
      const appId = typeof marketAppId === 'string' ? parseInt(marketAppId, 10) : marketAppId;
      if (isNaN(appId)) {
        throw new Error('Invalid market app ID');
      }
      const response = await getMarketAnalytics(appId);
      return response.data || [];
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

