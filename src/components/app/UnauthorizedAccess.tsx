import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Wallet } from 'lucide-react';
import { WalletContext } from '../context/wallet';
import { useWallet } from '@txnlab/use-wallet-react';

const UnauthorizedAccess: React.FC = () => {
  const { address, setDisplayWalletConnectModal } = useContext(WalletContext);
  const { activeWallet } = useWallet();

  const handleTryDifferentWallet = () => {
    activeWallet?.disconnect();
    setDisplayWalletConnectModal(true);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="container-section py-12 min-h-[60vh] flex items-center justify-center">
      <motion.div 
        className="relative max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 opacity-10 rounded-2xl blur-xl"></div>
        
        {/* Main container */}
        <div className="relative backdrop-blur-md bg-white bg-opacity-5 border border-red-500 border-opacity-30 rounded-2xl p-8 md:p-12">
          
          {/* Icon */}
          <motion.div 
            className="relative mx-auto w-20 h-20 mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-red-500 opacity-20 rounded-full blur-sm animate-pulse"></div>
            <div className="relative bg-red-500 bg-opacity-20 rounded-full p-4 flex items-center justify-center">
              <Shield className="w-12 h-12 text-red-400" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2 
            className="text-3xl md:text-4xl font-sora font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="text-red-400">Access Restricted</span>
          </motion.h2>

          {/* Description */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-xl text-soft-gray mb-4">
              Your wallet is not eligible for the Orbital Lending testnet launch.
            </p>
            <p className="text-soft-gray">
              To participate in the testnet, you need to hold a specific NFT in your connected wallet.
            </p>
          </motion.div>

          {/* Wallet info */}
          {address && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-soft-gray">Connected wallet:</p>
                  <p className="font-mono text-red-400">{formatAddress(address)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {/* Try different wallet */}
            <button
              onClick={handleTryDifferentWallet}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-teal to-neon-purple opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative backdrop-blur-sm bg-white bg-opacity-10 border border-neon-teal border-opacity-30 px-6 py-3 rounded-lg hover:bg-opacity-20 transition-all duration-300 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-neon-teal" />
                <span className="text-neon-teal font-medium">Try Different Wallet</span>
              </div>
            </button>

            {/* Learn more button */}
            
          </motion.div>

          {/* Footer message */}
          <motion.div
            className="mt-8 pt-6 border-t border-white border-opacity-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <p className="text-sm text-soft-gray">
              🔒 This is a private testnet launch. Only eligible NFT holders can participate at this time.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedAccess;
