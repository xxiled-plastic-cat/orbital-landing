import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@txnlab/use-wallet-react'
import { 
  fetchAssetMetadata, 
  getMarketAssetIds, 
  fetchUserAssetInfo 
} from '../services/markets'
import { AssetMetadata, UserAssetSummary, UserAssetInfo } from '../types/lending'
import { useNetwork } from '../context/networkContext'
import { useMemo } from 'react'

// Hook to get all asset IDs from markets
export function useMarketAssetIds() {
  const { selectedNetwork } = useNetwork()
  const MARKET_ASSET_IDS_QUERY_KEY = [selectedNetwork, 'market-asset-ids'] as const

  
  return useQuery({
    queryKey: MARKET_ASSET_IDS_QUERY_KEY,
    queryFn: async () => {
      const assetIds = await getMarketAssetIds()
      console.log('Market asset IDs:', assetIds)
      return assetIds
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Hook to get asset metadata for given asset IDs
export function useAssetMetadata(assetIds: string[]) {
  const { selectedNetwork } = useNetwork()
  const ASSETS_QUERY_KEY = [selectedNetwork, 'assets'] as const
  
  return useQuery({
    queryKey: [...ASSETS_QUERY_KEY, 'metadata', assetIds.sort()],
    queryFn: async () => {
      if (!assetIds || assetIds.length === 0) {
        return []
      }
      const result = await fetchAssetMetadata(assetIds)
      console.log('Asset metadata result:', result)
      return result
    },
    enabled: assetIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

// Hook to get user's asset information (balances and opt-in status)
export function useUserAssetInfo(assetIds?: string[]) {
  const { activeAddress } = useWallet()
  const { selectedNetwork } = useNetwork()
  const USER_ASSETS_QUERY_KEY = [selectedNetwork, 'user-assets'] as const
  
  // Stabilize the assetIds array to prevent unnecessary query key changes
  const sortedAssetIds = useMemo(() => 
    assetIds ? [...assetIds].sort().join(',') : '', 
    [assetIds]
  )
  
  return useQuery({
    queryKey: [...USER_ASSETS_QUERY_KEY, activeAddress, sortedAssetIds],
    queryFn: async (): Promise<UserAssetSummary> => {
      if (!activeAddress) {
        throw new Error('Wallet not connected')
      }
      if (!assetIds || assetIds.length === 0) {
        return { algoBalance: '0', assets: [] }
      }
      return fetchUserAssetInfo(activeAddress, assetIds)
    },
    enabled: !!(activeAddress && assetIds && assetIds.length > 0),
    staleTime: 10 * 1000, // 10 seconds - data considered fresh for this duration
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Poll every 30 seconds as fallback for external balance changes (faucet, transfers)
    // Internal app transactions use event-driven invalidation for instant updates
    refetchInterval: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error.message === 'Wallet not connected') {
        return false
      }
      return failureCount < 2
    },
  })
}

// Combined hook that gets market asset IDs, user asset info, and metadata
export function useUserAssetsWithMetadata() {
  const { activeAddress } = useWallet()
  
  // First get the asset IDs from markets
  const { 
    data: assetIds, 
    isLoading: assetIdsLoading,
    error: assetIdsError 
  } = useMarketAssetIds()
  
  // Then get user asset info and metadata in parallel
  const userAssetsQuery = useUserAssetInfo(assetIds)
  const metadataQuery = useAssetMetadata(assetIds || [])
  
  // Combine the data
  const combinedData = (() => {
    if (!userAssetsQuery.data || !metadataQuery.data) {
      return null
    }
    
    const metadataMap = new Map<string, AssetMetadata>()
    metadataQuery.data.forEach(metadata => {
      metadataMap.set(metadata.id, metadata)
    })
    
    const assetsWithMetadata: UserAssetInfo[] = userAssetsQuery.data.assets.map(asset => ({
      ...asset,
      metadata: metadataMap.get(asset.assetId),
    }))
    
    return {
      algoBalance: userAssetsQuery.data.algoBalance,
      assets: assetsWithMetadata,
    }
  })()
  
  return {
    data: combinedData,
    isLoading: assetIdsLoading || userAssetsQuery.isLoading || metadataQuery.isLoading,
    error: assetIdsError || userAssetsQuery.error || metadataQuery.error,
    isConnected: !!activeAddress,
    refetch: () => {
      userAssetsQuery.refetch()
      metadataQuery.refetch()
    },
    // Individual query states for more granular control
    assetIds: {
      data: assetIds,
      isLoading: assetIdsLoading,
      error: assetIdsError,
    },
    userAssets: userAssetsQuery,
    metadata: metadataQuery,
  }
}

// Hook to get a specific user asset by ID
export function useUserAsset(assetId: string) {
  const { data: userAssets, ...rest } = useUserAssetsWithMetadata()
  
  const asset = userAssets?.assets.find(a => a.assetId === assetId)
  
  return {
    ...rest,
    data: asset,
  }
}

// Hook to invalidate user assets data (useful after transactions)
export function useInvalidateUserAssets() {
  const { activeAddress } = useWallet()
  const { selectedNetwork } = useNetwork()
  const queryClient = useQueryClient()
  const USER_ASSETS_QUERY_KEY = [selectedNetwork, 'user-assets'] as const
  
  return () => {
    if (activeAddress) {
      // Invalidate the user assets query to trigger immediate refetch
      queryClient.invalidateQueries({
        queryKey: [...USER_ASSETS_QUERY_KEY, activeAddress]
      })
    }
  }
}

// Hook to refetch user assets data immediately (alternative to invalidate)
export function useRefetchUserAssets() {
  const { activeAddress } = useWallet()
  const { selectedNetwork } = useNetwork()
  const queryClient = useQueryClient()
  const USER_ASSETS_QUERY_KEY = [selectedNetwork, 'user-assets'] as const
  
  return () => {
    if (activeAddress) {
      // Force refetch the user assets query immediately
      queryClient.refetchQueries({
        queryKey: [...USER_ASSETS_QUERY_KEY, activeAddress]
      })
    }
  }
}
