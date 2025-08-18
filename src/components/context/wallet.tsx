/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useState } from "react";
import * as algokit from "@algorandfoundation/algokit-utils"

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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext, WalletContextProvider };
