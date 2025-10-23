import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useMarkets } from './useMarkets';
import { getDepositBoxValue } from '../contracts/lending/state';
import { getExistingClient, getExistingClientAsa } from '../contracts/lending/getClient';

export interface DepositRecord {
  marketId: string;
  assetId: string;
  depositAmount: bigint;
  depositAmountFormatted: number; // In base units (divided by 10^6)
}

export interface DepositRecordsState {
  records: DepositRecord[];
  isLoading: boolean;
  error: string | null;
}

export const useDepositRecords = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const { data: markets, isLoading: isLoadingMarkets } = useMarkets();
  const [records, setRecords] = useState<DepositRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create stable reference for market IDs to prevent infinite loops
  const marketIds = useMemo(() => {
    return markets?.map(m => m.id).join(',') || '';
  }, [markets]);

  useEffect(() => {
    const fetchDepositRecords = async () => {
      if (!activeAddress || !transactionSigner || !markets || markets.length === 0 || isLoadingMarkets) {
        setRecords([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const depositRecords: DepositRecord[] = [];

        // Fetch deposit records for each market
        await Promise.all(
          markets.map(async (market) => {
            try {
              // Get the appropriate client based on whether the market uses ALGO or ASA
              const appClient = market.baseTokenId === '0'
                ? await getExistingClient(transactionSigner, activeAddress, Number(market.id))
                : await getExistingClientAsa(transactionSigner, activeAddress, Number(market.id));

              // Fetch deposit record from the box
              const depositRecord = await getDepositBoxValue(
                activeAddress,
                appClient,
                BigInt(market.baseTokenId)
              );

              // Only add if there's actually a deposit
              if (depositRecord.depositAmount > 0n) {
                depositRecords.push({
                  marketId: market.id,
                  assetId: depositRecord.assetId.toString(),
                  depositAmount: depositRecord.depositAmount,
                  depositAmountFormatted: Number(depositRecord.depositAmount) / 1e6,
                });
              }
            } catch (error) {
              // No deposit record for this market - this is normal, not an error
              console.log(`No deposit record found for market ${market.id}:`, error);
            }
          })
        );

        setRecords(depositRecords);
      } catch (err) {
        console.error('Error fetching deposit records:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch deposit records');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepositRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress, marketIds, isLoadingMarkets]);

  const refetch = useCallback(async () => {
    if (!activeAddress || !transactionSigner || !markets || markets.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const depositRecords: DepositRecord[] = [];

      await Promise.all(
        markets.map(async (market) => {
          try {
            const appClient = market.baseTokenId === '0'
              ? await getExistingClient(transactionSigner, activeAddress, Number(market.id))
              : await getExistingClientAsa(transactionSigner, activeAddress, Number(market.id));

            const depositRecord = await getDepositBoxValue(
              activeAddress,
              appClient,
              BigInt(market.baseTokenId)
            );

            if (depositRecord.depositAmount > 0n) {
              depositRecords.push({
                marketId: market.id,
                assetId: depositRecord.assetId.toString(),
                depositAmount: depositRecord.depositAmount,
                depositAmountFormatted: Number(depositRecord.depositAmount) / 1e6,
              });
            }
          } catch (error) {
            console.log(`No deposit record found for market ${market.id}:`, error);
          }
        })
      );

      setRecords(depositRecords);
    } catch (err) {
      console.error('Error fetching deposit records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch deposit records');
    } finally {
      setIsLoading(false);
    }
  }, [activeAddress, transactionSigner, markets]);

  return {
    records,
    isLoading: isLoading || isLoadingMarkets,
    error,
    refetch,
  };
};

