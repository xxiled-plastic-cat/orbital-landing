import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@txnlab/use-wallet-react'
import { fetchDebtPositions, fetchAllLoanRecords } from '../services/loanRecords'
import { DebtPosition, LoanRecordData } from '../types/lending'

const LOAN_RECORDS_QUERY_KEY = ['loanRecords'] as const
const DEBT_POSITIONS_QUERY_KEY = ['debtPositions'] as const

// Hook to get raw loan records data
export function useLoanRecords() {
  const { transactionSigner, activeAddress } = useWallet()

  return useQuery({
    queryKey: [...LOAN_RECORDS_QUERY_KEY, activeAddress],
    queryFn: async (): Promise<LoanRecordData[]> => {
      if (!transactionSigner || !activeAddress) {
        throw new Error('Wallet not connected')
      }
      return fetchAllLoanRecords(transactionSigner, activeAddress)
    },
    enabled: !!(activeAddress && transactionSigner),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error.message === 'Wallet not connected') {
        return false
      }
      return failureCount < 2
    },
  })
}

// Hook to get debt positions for marketplace
export function useDebtPositions() {
  const { transactionSigner, activeAddress } = useWallet()

  return useQuery({
    queryKey: [...DEBT_POSITIONS_QUERY_KEY, activeAddress],
    queryFn: async (): Promise<DebtPosition[]> => {
      if (!transactionSigner || !activeAddress) {
        throw new Error('Wallet not connected')
      }
      return fetchDebtPositions(transactionSigner, activeAddress)
    },
    enabled: !!(activeAddress && transactionSigner),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error.message === 'Wallet not connected') {
        return false
      }
      return failureCount < 2
    },
  })
}

// Hook to get a specific debt position by ID
export function useDebtPosition(positionId: string) {
  const { data: positions, ...queryResult } = useDebtPositions()
  
  const position = positions?.find(p => p.id === positionId)
  
  return {
    ...queryResult,
    data: position,
  }
}

// Hook to invalidate loan records data (useful after transactions)
export function useInvalidateLoanRecords() {
  const { activeAddress } = useWallet()
  const queryClient = useQueryClient()
  
  return () => {
    if (activeAddress) {
      // Invalidate both loan records and debt positions
      queryClient.invalidateQueries({
        queryKey: [...LOAN_RECORDS_QUERY_KEY, activeAddress]
      })
      queryClient.invalidateQueries({
        queryKey: [...DEBT_POSITIONS_QUERY_KEY, activeAddress]
      })
    }
  }
}

// Hook to refetch loan records data immediately
export function useRefetchLoanRecords() {
  const { activeAddress } = useWallet()
  const queryClient = useQueryClient()
  
  return () => {
    if (activeAddress) {
      // Force refetch both queries
      queryClient.refetchQueries({
        queryKey: [...LOAN_RECORDS_QUERY_KEY, activeAddress]
      })
      queryClient.refetchQueries({
        queryKey: [...DEBT_POSITIONS_QUERY_KEY, activeAddress]
      })
    }
  }
}
