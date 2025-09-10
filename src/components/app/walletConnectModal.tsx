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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-slate-900 bg-opacity-90 backdrop-blur-sm"
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
            {/* Modal container */}
            <div className="relative text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center border border-slate-500">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-mono font-bold text-white uppercase tracking-wide">
                    Connect Wallet
                  </h3>
                </div>
                
                <button
                  onClick={handleClose}
                  className="group relative p-2 rounded-lg hover:bg-slate-700 transition-all duration-150 border border-slate-600"
                >
                  <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-150" />
                </button>
              </div>

              {/* Security notice / Eligibility status */}
              <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-600">
                <Shield className={`w-5 h-5 text-cyan-400 flex-shrink-0 ${isCheckingEligibility ? 'animate-pulse' : ''}`} />
                <p className="text-sm text-slate-300 font-mono">
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
                    {/* Button content */}
                    <div className="relative bg-slate-800 border border-slate-600 rounded-lg p-4 hover:border-slate-500 hover:bg-slate-750 transition-all duration-150">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 border border-slate-500 flex items-center justify-center">
                            <img
                              src={wallet.metadata.icon}
                              alt={`${wallet.metadata.name} logo`}
                              className="w-8 h-8 object-contain rounded-full"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 text-left">
                          <h4 className="font-mono font-semibold text-white group-hover:text-cyan-400 transition-colors duration-150">
                            {wallet.metadata.name}
                          </h4>
                          <p className="text-sm text-slate-400 font-mono">
                            Connect via {wallet.metadata.name}
                          </p>
                        </div>
                        
                        <div className="w-6 h-6 rounded-full border-2 border-slate-500 group-hover:border-cyan-400 transition-colors duration-150"></div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center">
                <button
                  onClick={handleClose}
                  className="relative group overflow-hidden px-6 py-2 rounded-lg bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-all duration-150"
                >
                  <span className="relative text-slate-300 group-hover:text-white transition-colors duration-150 font-mono">
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
