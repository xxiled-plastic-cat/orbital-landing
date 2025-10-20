import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { GENERAL_BACKEND_URL } from '../constants/constants';

export interface UserDeposit {
  address: string;
  marketId: string;
  action: 'deposit' | 'redeem';
  tokenInId: string;
  tokenOutId: string;
  tokensOut: number;
  tokensIn: number;
  timestamp: string;
  txnId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: UserDeposit[];
}

export interface ProcessedDeposit {
  marketId: string;
  marketName: string;
  tokenId: string;
  tokenSymbol: string;
  tokenName: string;
  totalDeposited: number;
  totalRedeemed: number;
  netDeposited: number;
  valueUSD: number;
  apy: number;
  lastDepositTimestamp?: Date;
}

export const useUserDeposits = () => {
  const { activeAccount } = useWallet();
  const [deposits, setDeposits] = useState<UserDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposits = useCallback(async () => {
    if (!activeAccount?.address) {
      setError('No wallet connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${GENERAL_BACKEND_URL}/orbital/${activeAccount.address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        // Filter for deposit and redeem actions only
        const depositTransactions = data.data.filter(tx => 
          tx.action === 'deposit' || tx.action === 'redeem'
        );
        setDeposits(depositTransactions);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching user deposits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user deposits');
    } finally {
      setIsLoading(false);
    }
  }, [activeAccount?.address]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  return {
    deposits,
    isLoading,
    error,
    refetch: fetchDeposits
  };
};
