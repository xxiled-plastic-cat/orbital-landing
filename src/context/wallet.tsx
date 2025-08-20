/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useState, useMemo, useCallback } from "react";
import * as algokit from "@algorandfoundation/algokit-utils"
import { useUserAssetsWithMetadata } from "../hooks/useAssets";
import { UserAssetSummary } from "../types/lending";

interface OptimisticBalanceOverride {
  assetId: string;
  balanceChange: string; // Can be positive or negative
  timestamp: number;
}

type OptimisticOverrides = Map<string, OptimisticBalanceOverride>;

interface WalletContextType {
  address: string;
  setAddress: (value: string) => void;
  displayWalletConnectModal: boolean;
  setDisplayWalletConnectModal: (value: boolean) => void;
  walletConnected: boolean;
  setWalletConnected: (value: boolean) => void;
  isEligible: boolean | null; // null = not checked, true = eligible, false = ineligible
  setIsEligible: (value: boolean | null) => void;
  isCheckingEligibility: boolean;
  setIsCheckingEligibility: (value: boolean) => void;
  checkEligibility: (walletAddress: string) => Promise<boolean>;
  // Asset information
  algoBalance: string;
  userAssets: UserAssetSummary | null;
  isLoadingAssets: boolean;
  assetsError: Error | null;
  refetchAssets: () => void;
  // Optimistic updates
  applyOptimisticBalanceUpdate: (assetId: string, balanceChange: string) => void;
  confirmOptimisticUpdate: (assetId: string) => void;
  revertOptimisticUpdate: (assetId: string) => void;
  clearAllOptimisticUpdates: () => void;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [address, setAddress] = useState<string>("");
  const [displayWalletConnectModal, setDisplayWalletConnectModal] =
    useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);
  
  // Optimistic updates state
  const [optimisticOverrides, setOptimisticOverrides] = useState<OptimisticOverrides>(new Map());
  
  // Asset information using the custom hook
  const {
    data: userAssets,
    isLoading: isLoadingAssets,
    error: assetsError,
    refetch: refetchAssets,
  } = useUserAssetsWithMetadata();


  const checkEligibility = async (walletAddress: string): Promise<boolean> => {
    setIsCheckingEligibility(true);
    
    try {
      // TODO: Replace with actual NFT check logic
      // This is a placeholder - user will implement the actual blockchain call
      console.log(`Checking eligibility for wallet: ${walletAddress}`);
      
      // Simulate API call delay
      let isWalletEligible = false;
      try{
        const algorand = algokit.AlgorandClient.mainNet();
        console.log("walletAddress", walletAddress);
        await algorand.client.algod.accountAssetInformation(walletAddress, 3001670448).do();
        isWalletEligible = true;
        console.log("isWalletEligible", isWalletEligible);
      }catch(err: any){
        isWalletEligible = false;
        console.log("isWalletEligible", isWalletEligible);
      }

      console.log("isWalletEligible", isWalletEligible);
      setIsEligible(isWalletEligible);
      return isWalletEligible;
    } catch (error) {
      console.error("Error checking eligibility:", error);
      setIsEligible(false);
      return false;
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  // Optimistic update methods
  const applyOptimisticBalanceUpdate = useCallback((assetId: string, balanceChange: string) => {
    setOptimisticOverrides(prev => {
      const newOverrides = new Map(prev);
      newOverrides.set(assetId, {
        assetId,
        balanceChange,
        timestamp: Date.now()
      });
      return newOverrides;
    });
  }, []);

  const confirmOptimisticUpdate = useCallback((assetId: string) => {
    setOptimisticOverrides(prev => {
      const newOverrides = new Map(prev);
      newOverrides.delete(assetId);
      return newOverrides;
    });
    // Refetch real data to confirm changes
    refetchAssets();
  }, [refetchAssets]);

  const revertOptimisticUpdate = useCallback((assetId: string) => {
    setOptimisticOverrides(prev => {
      const newOverrides = new Map(prev);
      newOverrides.delete(assetId);
      return newOverrides;
    });
  }, []);

  const clearAllOptimisticUpdates = useCallback(() => {
    setOptimisticOverrides(new Map());
  }, []);

  // Merge real and optimistic data
  const mergedUserAssets = useMemo(() => {
    if (!userAssets || optimisticOverrides.size === 0) {
      return userAssets;
    }

    const mergedAssets = { ...userAssets };
    
    // Apply optimistic updates to assets
    if (mergedAssets.assets) {
      mergedAssets.assets = mergedAssets.assets.map(asset => {
        const override = optimisticOverrides.get(asset.assetId);
        if (override) {
          const currentBalance = parseFloat(asset.balance || '0');
          const changeAmount = parseFloat(override.balanceChange);
          const newBalance = Math.max(0, currentBalance + changeAmount);
          
          return {
            ...asset,
            balance: newBalance.toString()
          };
        }
        return asset;
      });
    }

    // Apply optimistic updates to ALGO balance
    const algoOverride = optimisticOverrides.get('0');
    if (algoOverride) {
      const currentAlgoBalance = parseFloat(mergedAssets.algoBalance || '0');
      const changeAmount = parseFloat(algoOverride.balanceChange);
      const newAlgoBalance = Math.max(0, currentAlgoBalance + changeAmount);
      mergedAssets.algoBalance = newAlgoBalance.toString();
    }

    return mergedAssets;
  }, [userAssets, optimisticOverrides]);

  return (
    <WalletContext.Provider
      value={{
        address,
        setAddress,
        displayWalletConnectModal,
        setDisplayWalletConnectModal,
        walletConnected,
        setWalletConnected,
        isEligible,
        setIsEligible,
        isCheckingEligibility,
        setIsCheckingEligibility,
        checkEligibility,
        // Asset information (with optimistic updates applied)
        algoBalance: mergedUserAssets?.algoBalance || '0',
        userAssets: mergedUserAssets,
        isLoadingAssets,
        assetsError,
        refetchAssets,
        // Optimistic updates
        applyOptimisticBalanceUpdate,
        confirmOptimisticUpdate,
        revertOptimisticUpdate,
        clearAllOptimisticUpdates,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext, WalletContextProvider };
