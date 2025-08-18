import React, { useContext, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ChevronDown,
  LogOut,
  Copy,
  Droplets,
  Check,
} from "lucide-react";
import { useWallet } from "@txnlab/use-wallet-react";
import { WalletContext } from "../context/wallet";
import FaucetModal from "./FaucetModal";

const WalletButton: React.FC = () => {
  const { activeAccount, activeWallet } = useWallet();
  const { setDisplayWalletConnectModal } = useContext(WalletContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFaucetModalOpen, setIsFaucetModalOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = () => {
    setDisplayWalletConnectModal(true);
  };

  const handleDisconnect = async () => {
    if (activeWallet) {
      try {
        await activeWallet.disconnect();
        setIsDropdownOpen(false);
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };

  const copyAddress = async () => {
    if (activeAccount?.address) {
      try {
        await navigator.clipboard.writeText(activeAccount.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleFaucet = () => {
    setIsFaucetModalOpen(true);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    if (!isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Disconnected state - show connect button
  if (!activeAccount || !activeWallet) {
    return (
      <button
        onClick={handleConnect}
        className="group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-teal to-neon-purple opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
        <div className="relative backdrop-blur-sm bg-white bg-opacity-10 border border-neon-teal border-opacity-30 px-6 py-3 rounded-2xl hover:bg-opacity-20 transition-all duration-300 flex items-center gap-2">
          <div className="bg-neon-teal bg-opacity-10 rounded-full p-1">
            <Wallet className="w-4 h-4 text-neon-teal" />
          </div>
          <p className="text-neon-teal font-medium hidden md:block">Connect</p>
        </div>
      </button>
    );
  }

  // Connected state - show wallet info with dropdown
  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-teal to-neon-purple opacity-20 group-hover:opacity-30 rounded-2xl transition-opacity duration-300"></div>
        <div className="relative backdrop-blur-sm bg-white bg-opacity-10 border border-neon-teal border-opacity-30 px-4 py-3 rounded-2xl hover:bg-opacity-20 transition-all duration-300 flex items-center gap-3">
          {/* Wallet icon */}
          <div className="bg-neon-teal bg-opacity-20 rounded-full p-1">
            <Wallet className="w-4 h-4 text-neon-teal" />
          </div>

          {/* Address and wallet name */}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-white font-medium text-sm">
              {formatAddress(activeAccount.address)}
            </span>
            <span className="text-neon-teal text-xs">
              {activeWallet.metadata.name}
            </span>
          </div>

          {/* Dropdown arrow */}
          <ChevronDown
            className={`w-4 h-4 text-neon-teal transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu using Portal */}
      {createPortal(
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed w-72 z-[9999]"
              style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-teal via-neon-purple to-neon-pink opacity-20 rounded-3xl blur-sm"></div>

              {/* Dropdown content */}
              <div className="relative backdrop-blur-md bg-white bg-opacity-10 border border-white border-opacity-20 rounded-3xl p-4 shadow-2xl">
                {/* Wallet info header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white border-opacity-10">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white bg-opacity-10 flex items-center justify-center">
                    <img
                      src={activeWallet.metadata.icon}
                      alt={`${activeWallet.metadata.name} logo`}
                      className="w-6 h-6 object-contain rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">
                      {activeWallet.metadata.name}
                    </h4>
                    <p className="text-sm text-soft-gray">Connected</p>
                  </div>
                </div>

                {/* Address section */}
                <div className="mb-4">
                  <p className="text-xs text-soft-gray mb-2">Wallet Address</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
                    <span className="font-mono text-sm text-white flex-1">
                      {formatAddress(activeAccount.address)}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-colors duration-200"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-neon-teal" />
                      ) : (
                        <Copy className="w-4 h-4 text-soft-gray hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  {/* Faucet button */}
                  <button
                    onClick={handleFaucet}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all duration-200 group"
                  >
                    <div className="bg-neon-purple bg-opacity-20 p-2 rounded-full group-hover:bg-opacity-30 transition-colors duration-200">
                      <Droplets className="w-4 h-4 text-neon-purple" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white group-hover:text-neon-purple transition-colors duration-200">
                        Get Test Tokens
                      </p>
                      <p className="text-xs text-soft-gray">
                        Request testnet tokens
                      </p>
                    </div>
                  </button>

                  {/* Disconnect button */}
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500 hover:bg-opacity-10 transition-all duration-200 group"
                  >
                    <div className="bg-red-500 bg-opacity-20 p-2 rounded-full group-hover:bg-opacity-30 transition-colors duration-200">
                      <LogOut className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white group-hover:text-red-400 transition-colors duration-200">
                        Disconnect
                      </p>
                      <p className="text-xs text-soft-gray">
                        Disconnect your wallet
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
                 document.body
       )}

      {/* Faucet Modal */}
      <FaucetModal
        isOpen={isFaucetModalOpen}
        onClose={() => setIsFaucetModalOpen(false)}
        walletAddress={activeAccount?.address}
      />
    </>
  );
};

export default WalletButton;
