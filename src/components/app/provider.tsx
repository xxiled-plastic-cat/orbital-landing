'use client'

import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'

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
  return <WalletProvider manager={walletManager}>{children}</WalletProvider>
}