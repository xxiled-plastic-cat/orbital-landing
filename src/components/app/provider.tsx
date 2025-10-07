'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { PriceProvider } from '../../context/priceContext'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // Data is fresh for 30 seconds
      gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

const walletManager = new WalletManager({
  wallets: [
    WalletId.DEFLY,
    WalletId.PERA,
    {
      id: WalletId.LUTE,
      options: { siteName: 'https://orbital.compx.io' },
  },
  ],
  defaultNetwork: NetworkId.TESTNET
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider manager={walletManager}>
        <PriceProvider>
          {children}
        </PriceProvider>
      </WalletProvider>
    </QueryClientProvider>
  )
}