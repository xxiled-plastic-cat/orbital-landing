import { useWallet } from "@txnlab/use-wallet-react";
import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Shield } from "lucide-react";
import { WalletContext } from "../../context/wallet";

export const WalletConnectionModal: React.FC = () => {
  const { wallets } = useWallet();
  const { 
    displayWalletConnectModal, 
    setDisplayWalletConnectModal,
    checkEligibility,
    isCheckingEligibility
  } = useContext(WalletContext);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOnConnect = async (wallet: any) => {
    try {
      await wallet.connect();
      
      // After successful connection, check eligibility
      // Note: We need to wait for activeAccount to be updated, so we'll get it from the wallet
      if (wallet.activeAccount?.address) {
        console.log("Wallet connected, checking eligibility...");
        await checkEligibility(wallet.activeAccount.address);
      }
      
      setDisplayWalletConnectModal(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleClose = () => {
    setDisplayWalletConnectModal(false);
  };

  return (
    <AnimatePresence>
      {displayWalletConnectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop with glassmorphism */}
          <motion.div
            className="fixed inset-0 bg-space-dark bg-opacity-80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-teal via-neon-purple to-neon-pink opacity-20 rounded-2xl blur-sm"></div>
            
            {/* Glassmorphism container */}
            <div className="relative backdrop-blur-md bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-neon-teal bg-opacity-20 p-2 rounded-full">
                    <Wallet className="w-5 h-5 text-neon-teal" />
                  </div>
                  <h3 className="text-2xl font-sora font-bold text-white">
                    Connect Wallet
                  </h3>
                </div>
                
                <button
                  onClick={handleClose}
                  className="group relative p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                >
                  <X className="w-5 h-5 text-soft-gray group-hover:text-white transition-colors duration-200" />
                </button>
              </div>

              {/* Security notice / Eligibility status */}
              <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-neon-teal bg-opacity-5 border border-neon-teal border-opacity-20">
                <Shield className={`w-5 h-5 text-neon-teal flex-shrink-0 ${isCheckingEligibility ? 'animate-pulse' : ''}`} />
                <p className="text-sm text-soft-gray">
                  {isCheckingEligibility ? 
                    "Checking testnet eligibility..." : 
                    "Connect your wallet to interact with Orbital Lending on Algorand testnet"
                  }
                </p>
              </div>

              {/* Wallet options */}
              <div className="space-y-3 mb-6">
                {wallets?.map((wallet, index) => (
                  <motion.button
                    key={`wallet-${wallet.metadata.name}`}
                    className="group relative w-full"
                    onClick={() => handleOnConnect(wallet)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-teal to-neon-purple opacity-0 group-hover:opacity-20 rounded-xl blur-sm transition-opacity duration-300"></div>
                    
                    {/* Button content */}
                    <div className="relative backdrop-blur-sm bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-4 group-hover:bg-opacity-10 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-white bg-opacity-10 flex items-center justify-center">
                            <img
                              src={wallet.metadata.icon}
                              alt={`${wallet.metadata.name} logo`}
                              className="w-8 h-8 object-contain rounded-full"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-white group-hover:text-neon-teal transition-colors duration-200">
                            {wallet.metadata.name}
                          </h4>
                          <p className="text-sm text-soft-gray">
                            Connect via {wallet.metadata.name}
                          </p>
                        </div>
                        
                        <div className="w-6 h-6 rounded-full border-2 border-soft-gray group-hover:border-neon-teal transition-colors duration-200"></div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center">

                <button
                  onClick={handleClose}
                  className="relative group overflow-hidden px-6 py-2 rounded-lg"
                >
                  <div className="absolute inset-0 bg-white bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-200"></div>
                  <span className="relative text-soft-gray group-hover:text-white transition-colors duration-200">
                    Cancel
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
