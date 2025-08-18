/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, Loader2 } from "lucide-react";
import { useToast } from "../context/toastContext";
import { getTestTokens } from "../../contracts/faucet/user";
import { useWallet } from "@txnlab/use-wallet-react";

interface Token {
  id: string;
  faucetId: number;
  name: string;
  symbol: string;
  image: string;
  description: string;
}

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

// Mock token data - replace with real token data
const TESTNET_TOKENS: Token[] = [
  {
    id: "744427912",
    faucetId: 744429238,
    name: "xUSD Testnet",
    symbol: "xUSDt",
    image: "/xUSDt.svg",
    description: "xUSD Testnet",
  },
  {
    id: "744427950",
    faucetId: 744429257,
    name: "CompX Token Testnet",
    symbol: "COMPXt",
    image: "/COMPXt.svg",
    description: "CompX Token Testnet",
  },
];

const FaucetModal: React.FC<FaucetModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
}) => {
  const [requestingTokens, setRequestingTokens] = useState<Set<string>>(new Set());

  const { activeAddress, signTransactions } = useWallet();
  const { openToast } = useToast();

  const handleTokenRequest = async (token: Token) => {
    if (requestingTokens.has(token.id)) return;

    setRequestingTokens(prev => new Set(prev).add(token.id));

    try {
      openToast({
        type: "loading",
        message: "Requesting tokens...",
        description: `Requesting ${token.symbol} tokens`,
      });
      
      await getTestTokens(activeAddress!, signTransactions, token.faucetId).then(() => {
        openToast({
          type: "success",
          message: "Tokens requested successfully",
          description: `${token.symbol} tokens have been sent to your wallet`,
        });
      })
    } catch (error: any) {
      console.error(`Failed to request ${token.symbol}:`, error);
      openToast({
        type: "error",
        message: "Failed to request tokens",
        description: error?.message || "An error occurred while requesting tokens",
      });
    } finally {
      setRequestingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(token.id);
        return newSet;
      });
    }
  };

  const getButtonState = (token: Token) => {
    if (requestingTokens.has(token.id)) return "requesting";
    return "available";
  };

  const getButtonContent = (token: Token) => {
    const state = getButtonState(token);

    switch (state) {
      case "requesting":
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Requesting...</span>
          </>
        );

      default:
        return (
          <>
            <Droplets className="w-4 h-4" />
            <span>Request {token.symbol}</span>
          </>
        );
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          aria-labelledby="faucet-modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-space-dark bg-opacity-80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-teal via-neon-purple to-neon-pink opacity-20 rounded-2xl blur-sm"></div>

            {/* Modal container */}
            <div className="relative backdrop-blur-md bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
                <div className="flex items-center gap-3">
                  <div className="bg-neon-purple bg-opacity-20 p-3 rounded-full">
                    <Droplets className="w-6 h-6 text-neon-purple" />
                  </div>
                  <div>
                    <h2
                      id="faucet-modal-title"
                      className="text-2xl font-sora font-bold text-white"
                    >
                      Get Test Tokens
                    </h2>
                    <p className="text-sm text-soft-gray">
                      Request testnet tokens for Orbital Lending
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="group relative p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                >
                  <X className="w-6 h-6 text-soft-gray group-hover:text-white transition-colors duration-200" />
                </button>
              </div>

              {/* Wallet info */}
              {walletAddress && (
                <div className="px-6 py-4 bg-neon-teal bg-opacity-5 border-b border-white border-opacity-5">
                  <p className="text-sm text-soft-gray">
                    <span className="text-neon-teal font-medium">Wallet:</span>{" "}
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                  </p>
                </div>
              )}

              {/* Token Grid */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TESTNET_TOKENS.map((token, index) => (
                    <motion.div
                      key={token.id}
                      className="relative group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {/* Token card background glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-neon-teal to-neon-purple opacity-5 group-hover:opacity-10 rounded-xl blur-sm transition-opacity duration-300"></div>

                      {/* Token card */}
                      <div className="relative backdrop-blur-sm bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-4 hover:bg-opacity-10 transition-all duration-300">
                        {/* Token header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-white bg-opacity-10 flex items-center justify-center">
                            <img
                              src={token.image}
                              alt={`${token.name} logo`}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                // Fallback to a generic token icon if image fails to load
                                (e.target as HTMLImageElement).src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NmZjZjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMkwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEyTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiMwMDIwMzMiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">
                              {token.name}
                            </h3>
                            <p className="text-sm text-soft-gray">
                              ID: {token.id}
                            </p>
                          </div>
                        </div>

                        {/* Token description */}
                        <p className="text-sm text-soft-gray mb-4 leading-relaxed">
                          {token.description}
                        </p>

                        {/* Request button */}
                        <button
                          onClick={() => handleTokenRequest(token)}
                          disabled={requestingTokens.has(token.id)}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                            requestingTokens.has(token.id)
                              ? "bg-neon-purple bg-opacity-20 text-neon-purple cursor-not-allowed"
                              : "bg-white bg-opacity-5 text-white hover:bg-opacity-10 hover:text-neon-teal"
                          }`}
                        >
                          {getButtonContent(token)}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white border-opacity-10 bg-white bg-opacity-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-soft-gray">
                    Tokens are for testnet only and have no real value
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-white bg-opacity-10 text-soft-gray hover:bg-opacity-20 hover:text-white transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FaucetModal;
