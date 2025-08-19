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
import { WalletContext } from "../../context/wallet";
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
        className="h-12 px-6 bg-cyan-600 border-2 border-cyan-500 cut-corners-sm font-mono text-sm font-semibold text-white hover:bg-cyan-500 hover:border-cyan-400 transition-all duration-150 shadow-top-highlight flex items-center gap-3"
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden md:inline uppercase tracking-wide">Connect Wallet</span>
      </button>
    );
  }

  // Connected state - show wallet info with dropdown
  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="h-12 px-4 bg-slate-700 border-2 border-slate-600 cut-corners-sm font-mono text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-600 hover:border-slate-500 transition-all duration-150 shadow-inset flex items-center gap-3 relative z-10"
      >
        {/* Wallet icon */}
        <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border border-slate-500">
          <Wallet className="w-3 h-3 text-cyan-400" />
        </div>

        {/* Address and wallet name */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-white font-mono text-xs font-bold uppercase tracking-wider">
            {formatAddress(activeAccount.address)}
          </span>
          <span className="text-slate-400 text-xs font-mono">
            {activeWallet.metadata.name}
          </span>
        </div>

        {/* Dropdown arrow */}
        <ChevronDown
          className={`w-4 h-4 text-cyan-400 transition-transform duration-150 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
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
              transition={{ duration: 0.15 }}
              className="fixed w-80 z-[9999]"
              style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              }}
            >
              {/* Industrial Dropdown Panel */}
              <div className="text-slate-600 cut-corners-lg p-6 bg-noise-dark border-2 border-slate-600 shadow-industrial">
                {/* Edge lighting */}
                <div className="absolute inset-0 cut-corners-lg shadow-edge-glow pointer-events-none"></div>
                
                {/* Wallet info header */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border-2 border-slate-500">
                    <img
                      src={activeWallet.metadata.icon}
                      alt={`${activeWallet.metadata.name} logo`}
                      className="w-7 h-7 object-contain rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-mono font-bold text-white text-lg uppercase tracking-wide">
                      {activeWallet.metadata.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <p className="text-sm text-slate-300 font-mono uppercase tracking-wide">Connected</p>
                    </div>
                  </div>
                </div>

                {/* Address section */}
                <div className="mb-6">
                  <p className="text-xs text-slate-400 mb-3 font-mono uppercase tracking-wider">Wallet Address</p>
                  <div className="inset-panel cut-corners-sm p-4 flex items-center gap-3">
                    <span className="font-mono text-white font-bold text-sm flex-1 uppercase tracking-wide">
                      {formatAddress(activeAccount.address)}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 cut-corners-sm transition-all duration-150"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-4">
                  {/* Faucet button */}
                  <button
                    onClick={handleFaucet}
                    className="w-full h-12 px-4 bg-purple-600 border-2 border-purple-500 cut-corners-sm font-mono text-sm font-semibold text-white hover:bg-purple-500 hover:border-purple-400 transition-all duration-150 shadow-top-highlight flex items-center gap-3 relative z-10"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center border border-purple-500">
                      <Droplets className="w-3 h-3 text-purple-200" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-mono font-bold text-white uppercase tracking-wide text-xs">
                        Get Test Tokens
                      </p>
                      <p className="text-xs text-purple-200 font-mono">
                        Request testnet tokens
                      </p>
                    </div>
                  </button>

                  {/* Disconnect button */}
                  <button
                    onClick={handleDisconnect}
                    className="w-full h-12 px-4 bg-red-600 border-2 border-red-500 cut-corners-sm font-mono text-sm font-semibold text-white hover:bg-red-500 hover:border-red-400 transition-all duration-150 shadow-top-highlight flex items-center gap-3 relative z-10"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center border border-red-500">
                      <LogOut className="w-3 h-3 text-red-200" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-mono font-bold text-white uppercase tracking-wide text-xs">
                        Disconnect
                      </p>
                      <p className="text-xs text-red-200 font-mono">
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
