import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@txnlab/use-wallet-react'
import { fetchAllLoanRecordsForMarketplace } from '../services/loanRecords'
import { transformLoanRecordsToDebtPositionsOptimized } from '../services/optimizedLoanRecords'
import { usePriceContext } from '../context/priceContext'
import { DebtPosition } from '../types/lending'

const OPTIMIZED_DEBT_POSITIONS_QUERY_KEY = ['optimized-debt-positions'] as const

// Hook to get debt positions for marketplace with optimized pricing (global - all users)
export function useOptimizedDebtPositions() {
  const { transactionSigner, activeAddress } = useWallet()
  const priceContext = usePriceContext()

  return useQuery({
    queryKey: OPTIMIZED_DEBT_POSITIONS_QUERY_KEY, // No activeAddress - this is global data for marketplace
    queryFn: async (): Promise<DebtPosition[]> => {
      if (!transactionSigner || !activeAddress) {
        throw new Error('Wallet not connected')
      }

      console.log('Fetching debt positions with optimized pricing...')
      
      // 1. Fetch all loan records (from all users for marketplace)
      const loanRecords = await fetchAllLoanRecordsForMarketplace(transactionSigner, activeAddress)
      
      // 2. Transform to debt positions using cached pricing
      const debtPositions = await transformLoanRecordsToDebtPositionsOptimized(
        loanRecords,
        transactionSigner,
        activeAddress,
        priceContext
      )

      return debtPositions
    },
    enabled: !!(activeAddress && transactionSigner),
    staleTime: 15 * 1000, // 15 seconds (shorter than price cache)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds (aligned with price refresh)
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Always refetch when component mounts to ensure fresh data
    retry: (failureCount, error) => {
      if (error.message === 'Wallet not connected') {
        return false
      }
      return failureCount < 2
    },
  })
}

// Hook to get a specific debt position by ID with optimized pricing
export function useOptimizedDebtPosition(positionId: string) {
  const { data: positions, ...queryResult } = useOptimizedDebtPositions()
  
  const position = positions?.find(p => p.id === positionId)
  
  return {
    data: position,
    ...queryResult
  }
}
