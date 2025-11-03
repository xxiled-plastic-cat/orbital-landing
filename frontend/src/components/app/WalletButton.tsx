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
  Globe,
  FlaskConical,
} from "lucide-react";
import { useWallet } from "@txnlab/use-wallet-react";
import { WalletContext } from "../../context/wallet";
import FaucetModal from "./FaucetModal";
import ExplorerSelectModal from "./ExplorerSelectModal";
import NetworkSelectModal from "./NetworkSelectModal";
import { useExplorer, EXPLORERS } from "../../context/explorerContext";
import { useNetwork } from "../../context/networkContext";
import { galaxyCardTypes } from "./galaxy-card-data";
import { getUserFluxTier } from "../../contracts/flux/state";
import axios from "axios";

const WalletButton: React.FC = () => {
  const { activeAccount, activeWallet } = useWallet();
  const { setDisplayWalletConnectModal, nfdName, nfdAvatar, isLoadingNFD } = useContext(WalletContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFaucetModalOpen, setIsFaucetModalOpen] = useState(false);
  const [isExplorerModalOpen, setIsExplorerModalOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [galaxyCardImageUrl, setGalaxyCardImageUrl] = useState<string>("");
  const [loadingGalaxyCard, setLoadingGalaxyCard] = useState(false);
  const [fluxTier, setFluxTier] = useState<number>(0);
  const [loadingFluxTier, setLoadingFluxTier] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { selectedExplorer } = useExplorer();
  const { isTestnet } = useNetwork();

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

  // Fetch Galaxy Card data
  useEffect(() => {
    const fetchGalaxyCard = async () => {
      if (!activeAccount?.address) {
        setGalaxyCardImageUrl("");
        return;
      }

      setLoadingGalaxyCard(true);
      try {
        const { data: galaxyCardData } = await axios.get(
          `https://api-general.compx.io/api/galaxy-card/${activeAccount.address}`
        );
        if (galaxyCardData) {
          const imageUrl =
            galaxyCardTypes.find(
              (card) =>
                card.name === galaxyCardData.name &&
                card.level == galaxyCardData.level
            )?.imageURL || "";
          setGalaxyCardImageUrl(imageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch galaxy card:", error);
        setGalaxyCardImageUrl("");
      } finally {
        setLoadingGalaxyCard(false);
      }
    };

    fetchGalaxyCard();
  }, [activeAccount?.address]);

  // Fetch FLUX tier data
  useEffect(() => {
    const fetchFluxTier = async () => {
      if (!activeAccount?.address) {
        setFluxTier(0);
        return;
      }

      setLoadingFluxTier(true);
      try {
        const tier = await getUserFluxTier(activeAccount.address);
        setFluxTier(tier);
      } catch (error) {
        console.error("Failed to fetch FLUX tier:", error);
        setFluxTier(0);
      } finally {
        setLoadingFluxTier(false);
      }
    };

    fetchFluxTier();
  }, [activeAccount?.address]);

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

  const formatDisplayName = (address: string) => {
    // Show loading indicator if NFD is being fetched
    if (isLoadingNFD) {
      return "Loading...";
    }
    
    // Use NFD name if available
    if (nfdName) {
      // Truncate long NFD names (keep first 12 chars + ...)
      return nfdName.length > 15 ? `${nfdName.slice(0, 12)}...` : nfdName;
    }
    
    // Fall back to truncated address
    return formatAddress(address);
  };

  const handleFaucet = () => {
    setIsFaucetModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleExplorerSelect = () => {
    setIsExplorerModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleNetworkSelect = () => {
    setIsNetworkModalOpen(true);
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
        {/* Wallet/NFD icon */}
        <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border border-slate-500 overflow-hidden">
          {nfdAvatar ? (
            <img
              src={nfdAvatar}
              alt="NFD Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <Wallet className="w-3 h-3 text-cyan-400" />
          )}
        </div>

        {/* Address and wallet name */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-white font-mono text-xs font-bold uppercase tracking-wider">
            {formatDisplayName(activeAccount.address)}
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
                
                {/* Wallet info header with action buttons */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border-2 border-slate-500 overflow-hidden flex-shrink-0">
                    {nfdAvatar ? (
                      <img
                        src={nfdAvatar}
                        alt="NFD Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <img
                        src={activeWallet.metadata.icon}
                        alt={`${activeWallet.metadata.name} logo`}
                        className="w-7 h-7 object-contain rounded-full"
                      />
                    )}
                  </div>
                  
                  {/* Action buttons grid */}
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {/* Governance button */}
                    <div className="relative group">
                      <button
                        onClick={() => {
                          window.open('https://app.compx.io/governance', '_blank', 'noopener,noreferrer');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full h-14 px-2 bg-transparent border-2 border-slate-600   hover:border-cyan-500 transition-all duration-150 shadow-top-highlight flex items-center justify-center gap-1"
                      >
                        {loadingFluxTier ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-400 border-t-transparent"></div>
                        ) : (
                          <>
                            <img 
                              src="/FLUX-LOGO.png" 
                              alt="FLUX" 
                              className="w-10 h-10 object-contain rounded-full"
                            />
                            <span className="text-md font-mono font-bold text-white uppercase tracking-wide">
                              T-{fluxTier}
                            </span>
                          </>
                        )}
                      </button>
                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 border border-cyan-500 text-white text-xs font-mono whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                        Your current FLUX tier
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-cyan-500"></div>
                      </div>
                    </div>
                    
                    {/* COMPX Rewards button */}
                    <div className="relative group">
                      <button
                        onClick={() => {
                          window.open('https://app.compx.io/compx-rewards', '_blank', 'noopener,noreferrer');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full h-14 bg-transparent border-2 border-slate-600 hover:border-cyan-500 transition-all duration-150 shadow-top-highlight flex items-center justify-center relative overflow-hidden ${galaxyCardImageUrl ? 'p-0' : 'px-2'}`}
                      >
                        {loadingGalaxyCard ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent"></div>
                        ) : galaxyCardImageUrl ? (
                          <img 
                            src={galaxyCardImageUrl} 
                            alt="Galaxy Card" 
                            className="w-full h-full object-cover absolute inset-0"
                          />
                        ) : (
                          <span className="text-xs font-mono font-bold text-white uppercase tracking-wide text-center">
                            Earn CompX Rewards
                          </span>
                        )}
                      </button>
                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 border border-cyan-500 text-white text-xs font-mono whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                        Your current CompX Rewards level
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-cyan-500"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address section */}
                <div className="mb-6">

                  <div className="inset-panel cut-corners-sm p-4 flex items-center gap-3">
                    <div className="flex-1">
                      <span className="font-mono text-white font-bold text-sm uppercase tracking-wide">
                        {formatDisplayName(activeAccount.address)}
                      </span>
                      {nfdName && (
                        <div className="text-xs text-slate-400 font-mono mt-1">
                          {formatAddress(activeAccount.address)}
                        </div>
                      )}
                    </div>
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
                  {/* Network Select button */}
                  <button
                    onClick={handleNetworkSelect}
                    className="w-full h-12 px-4 bg-slate-700 border-2 border-slate-600 cut-corners-sm font-mono text-sm font-semibold text-white hover:bg-slate-600 hover:border-slate-500 transition-all duration-150 shadow-top-highlight flex items-center gap-3 relative z-10"
                  >
                    <div className={`w-6 h-6 flex items-center justify-center border ${
                      isTestnet 
                        ? 'bg-purple-600 border-purple-500' 
                        : 'bg-cyan-600 border-cyan-500'
                    }`}>
                      {isTestnet ? (
                        <FlaskConical className="w-3 h-3 text-white" />
                      ) : (
                        <Globe className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-mono font-bold text-white uppercase tracking-wide text-xs">
                        Switch Network
                      </p>
                      <p className={`text-xs font-mono ${
                        isTestnet ? 'text-purple-200' : 'text-cyan-200'
                      }`}>
                        Current: {isTestnet ? 'Testnet' : 'Mainnet'}
                      </p>
                    </div>
                  </button>

                  {/* Faucet button - Only show on testnet */}
                  {isTestnet && (
                    <button
                      onClick={handleFaucet}
                      className="w-full h-12 px-4 bg-purple-600 border-2 border-purple-500 cut-corners-sm font-mono text-sm font-semibold text-white hover:bg-purple-500 hover:border-purple-400 transition-all duration-150 shadow-top-highlight flex items-center gap-3 relative z-10"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center border border-purple-500">
                        <Droplets className="w-3 h-3 text-purple-200" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-mono font-bold text-white uppercase tracking-wide text-xs">
                          Resource Station
                        </p>
                        <p className="text-xs text-purple-200 font-mono">
                          Request testnet resources
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Explorer Select button */}
                  <button
                    onClick={handleExplorerSelect}
                    className="w-full h-12 px-4 bg-slate-700 border-2 border-slate-600 cut-corners-sm font-mono text-sm font-semibold text-white hover:bg-slate-600 hover:border-slate-500 transition-all duration-150 shadow-top-highlight flex items-center gap-3 relative z-10"
                  >
                    <div className="w-6 h-6 flex items-center justify-center border border-slate-500" style={{ backgroundColor: EXPLORERS[selectedExplorer].bgColor }}>
                      <img 
                        src={EXPLORERS[selectedExplorer].logo} 
                        alt={EXPLORERS[selectedExplorer].name}
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-mono font-bold text-white uppercase tracking-wide text-xs">
                        Select Explorer
                      </p>
                      <p className="text-xs text-slate-300 font-mono">
                        Current: {EXPLORERS[selectedExplorer].name}
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

      {/* Explorer Select Modal */}
      <ExplorerSelectModal
        isOpen={isExplorerModalOpen}
        onClose={() => setIsExplorerModalOpen(false)}
      />

      {/* Network Select Modal */}
      <NetworkSelectModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />
    </>
  );
};

export default WalletButton;
