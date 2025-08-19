import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@txnlab/use-wallet-react'
import { fetchMarkets } from '../services/markets'
import { LendingMarket } from '../types/lending'

const MARKETS_QUERY_KEY = ['markets'] as const

export function useMarkets() {
  const { transactionSigner, activeAddress } = useWallet()

  return useQuery({
    queryKey: [...MARKETS_QUERY_KEY, activeAddress],
    queryFn: async (): Promise<LendingMarket[]> => {
      if (!transactionSigner || !activeAddress) {
        throw new Error('Wallet not connected')
      }
      return fetchMarkets(transactionSigner, activeAddress)
    },
    enabled: !!(activeAddress), // Only run query when wallet is connected
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute when active
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Don't retry if wallet is not connected
      if (error.message === 'Wallet not connected') {
        return false
      }
      return failureCount < 2
    },
  })
}

// Hook to get a specific market by ID
export function useMarket(marketId: string) {
  const { data: markets, ...queryResult } = useMarkets()
  
  const market = markets?.find(m => m.id === marketId)
  
  return {
    ...queryResult,
    data: market,
  }
}

// Hook to invalidate markets data (useful after transactions)
export function useInvalidateMarkets() {
  const { activeAddress } = useWallet()
  
  return () => {
    if (activeAddress) {
      // You can call queryClient.invalidateQueries here if needed
      // For now, the refetchInterval will handle updates
    }
  }
}
