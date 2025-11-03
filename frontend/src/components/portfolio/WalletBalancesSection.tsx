import React, { useMemo, useContext, useCallback } from "react";
import { motion } from "framer-motion";
import { Wallet, Coins } from "lucide-react";
import { useWallet } from "@txnlab/use-wallet-react";
import { useMarkets } from "../../hooks/useMarkets";
import { useAssetMetadata } from "../../hooks/useAssets";
import { WalletContext } from "../../context/wallet";
import MomentumSpinner from "../MomentumSpinner";

const WalletBalancesSection: React.FC = () => {
  const { activeAccount } = useWallet();
  const { data: markets } = useMarkets();
  const { userAssets, algoBalance, isLoadingAssets } =
    useContext(WalletContext);

  // Get relevant token IDs from markets (base tokens and LST tokens)
  const relevantTokenIds = useMemo(() => {
    if (!markets) return [];

    const tokenIds = new Set<string>();
    markets.forEach((market) => {
      if (market.baseTokenId && market.baseTokenId !== "0") {
        tokenIds.add(market.baseTokenId);
      }
      if (market.lstTokenId && market.lstTokenId !== "0") {
        tokenIds.add(market.lstTokenId);
      }
    });
    return Array.from(tokenIds);
  }, [markets]);

  // Fetch asset metadata for relevant tokens
  const { data: assetMetadata } = useAssetMetadata(relevantTokenIds);

  // Helper function to get wallet balance for a specific token
  const getTokenBalance = useCallback(
    (tokenId: string) => {
      if (tokenId === "0") {
        return algoBalance;
      }

      if (!userAssets?.assets) return "0";

      const asset = userAssets.assets.find((a) => a.assetId === tokenId);
      return asset?.balance || "0";
    },
    [algoBalance, userAssets?.assets]
  );

  // Helper function to check if user is opted into a token
  const isOptedIn = useCallback(
    (tokenId: string) => {
      if (tokenId === "0") return true; // ALGO is always opted in

      if (!userAssets?.assets) return false;

      const asset = userAssets.assets.find((a) => a.assetId === tokenId);
      return asset?.isOptedIn || false;
    },
    [userAssets?.assets]
  );

  // Helper function to format token balance with proper decimals
  const formatTokenBalance = useCallback(
    (balance: string, decimals: number = 6) => {
      const balanceNum = parseFloat(balance) / Math.pow(10, decimals);
      if (balanceNum === 0) return "0";
      if (balanceNum < 0.001) return "< 0.001";
      return balanceNum.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      });
    },
    []
  );

  // Map token symbols to their image paths
  const getTokenImage = (symbol: string): string => {
    const tokenImages: Record<string, string> = {
      // Base tokens
      xUSDt: "/xUSDt.svg",
      COMPXt: "/COMPXt.svg",
      USDCt: "/USDCt-logo.svg",
      goBTCt: "/goBTCt-logo.svg",
      ALGO: "/algo-icon.svg",
      // Additional collateral token variations
      cxUSDt: "/cxUSDt.svg",
      cCOMPXt: "/cCOMPXt.svg",
      cUSDCt: "/cUSDCt.svg",
      cgoBTCt: "/cgoBTCt.svg",
      cALGO: "/cAlgo.svg",
    };

    return tokenImages[symbol] || "/orbital-icon.svg";
  };

  // Get wallet balances for relevant tokens
  const walletBalances = useMemo(() => {
    if (!markets || !userAssets) return [];

    const balances: Array<{
      tokenId: string;
      tokenName: string;
      tokenSymbol: string;
      balance: string;
      formattedBalance: string;
      isOptedIn: boolean;
      isLST: boolean;
      marketName?: string;
      decimals: number;
    }> = [];

    // Add ALGO balance
    balances.push({
      tokenId: "0",
      tokenName: "Algorand",
      tokenSymbol: "ALGO",
      balance: algoBalance,
      formattedBalance: formatTokenBalance(algoBalance, 6),
      isOptedIn: true,
      isLST: false,
      decimals: 6,
    });

    markets.forEach((market) => {
      // Add base token
      if (market.baseTokenId && market.baseTokenId !== "0") {
        const metadata = assetMetadata?.find(
          (m) => m.id === market.baseTokenId
        );
        const balance = getTokenBalance(market.baseTokenId);

        balances.push({
          tokenId: market.baseTokenId,
          tokenName: metadata?.name || `Token ${market.baseTokenId}`,
          tokenSymbol: metadata?.symbol || market.symbol || "UNK",
          balance,
          formattedBalance: formatTokenBalance(
            balance,
            metadata?.decimals || 6
          ),
          isOptedIn: isOptedIn(market.baseTokenId),
          isLST: false,
          marketName: market.name,
          decimals: metadata?.decimals || 6,
        });
      }

      // Add collateral token (LST)
      if (market.lstTokenId && market.lstTokenId !== "0") {
        const metadata = assetMetadata?.find((m) => m.id === market.lstTokenId);
        const balance = getTokenBalance(market.lstTokenId);

        balances.push({
          tokenId: market.lstTokenId,
          tokenName: metadata?.name || `Collateral ${market.name}`,
          tokenSymbol: metadata?.symbol || `o${market.symbol || "UNK"}`,
          balance,
          formattedBalance: formatTokenBalance(
            balance,
            metadata?.decimals || 6
          ),
          isOptedIn: isOptedIn(market.lstTokenId),
          isLST: true,
          marketName: market.name,
          decimals: metadata?.decimals || 6,
        });
      }
    });

    // Remove duplicates by tokenId and sort by balance (higher first), then by name
    const uniqueBalances = balances.reduce((acc, current) => {
      const existing = acc.find((item) => item.tokenId === current.tokenId);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, [] as typeof balances);

    return uniqueBalances.sort((a, b) => {
      // Sort by balance (higher first), then by name
      const balanceA = parseFloat(a.balance);
      const balanceB = parseFloat(b.balance);

      if (balanceA !== balanceB) {
        return balanceB - balanceA;
      }

      return a.tokenName.localeCompare(b.tokenName);
    });
  }, [
    markets,
    userAssets,
    algoBalance,
    assetMetadata,
    getTokenBalance,
    isOptedIn,
    formatTokenBalance,
  ]);

  // Loading state
  if (isLoadingAssets && activeAccount?.address) {
    return (
      <motion.div
        className="mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-slate-600 cut-corners-lg p-6 md:p-8 bg-noise-dark border-2 border-slate-600">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <span className="text-lg font-mono font-bold text-white uppercase tracking-wide">
              ORBITAL ASSETS
            </span>
          </div>
          <div className="text-center py-8">
            <MomentumSpinner 
              size="32" 
              speed="1.1" 
              color="#06b6d4" 
              className="mx-auto mb-3" 
            />
            <div className="text-slate-400 font-mono text-sm">
              LOADING WALLET BALANCES...
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Don't render if no active account
  if (!activeAccount?.address) {
    return null;
  }

  return (
    <motion.div
      className="mb-6 md:mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-600">
          <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            ORBITAL ASSETS
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-mono mt-1">
            Available wallet balances for base tokens and collateral tokens
          </p>
        </div>

        {/* Balance Grid */}
        <div className="p-4 md:p-6">
          {walletBalances.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {walletBalances.map((tokenBalance) => (
                <motion.div
                  key={tokenBalance.tokenId}
                  className={`relative p-3 md:p-4 border-2 transition-all duration-200 ${
                    parseFloat(tokenBalance.balance) > 0
                      ? "bg-gradient-to-br from-slate-800/40 to-slate-900/30 border-slate-600/70 hover:border-slate-500/90 hover:shadow-slate-800/20"
                      : "bg-gradient-to-br from-slate-900/30 to-slate-950/40 border-slate-700/50 opacity-75"
                  } bg-noise-dark shadow-lg ${
                    !tokenBalance.isLST &&
                    tokenBalance.tokenId !== "0" &&
                    (parseFloat(tokenBalance.balance) === 0 || !tokenBalance.isOptedIn)
                      ? "pb-12"
                      : ""
                  }`}
                  whileHover={{ scale: 1.02, y: -1 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Subtle glow effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r opacity-0 hover:opacity-100 transition-opacity duration-300 ${
                      tokenBalance.isLST
                        ? "from-purple-500/5 to-transparent"
                        : "from-cyan-500/5 to-transparent"
                    }`}
                  ></div>

                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Enhanced Token Icon */}
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <div
                            className={`w-full h-full bg-gradient-to-br border flex items-center justify-center ${
                              tokenBalance.isLST
                                ? "from-purple-600/20 to-purple-800/40 border-purple-600/50"
                                : "from-cyan-600/20 to-cyan-800/40 border-cyan-600/50"
                            }`}
                          >
                            <img
                              src={getTokenImage(tokenBalance.tokenSymbol)}
                              alt={`${tokenBalance.tokenSymbol} icon`}
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            <Coins
                              className={`w-4 h-4 hidden ${
                                tokenBalance.isLST
                                  ? "text-purple-400"
                                  : "text-cyan-400"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Token Info */}
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`font-mono font-bold text-xs md:text-sm truncate ${
                                parseFloat(tokenBalance.balance) > 0
                                  ? "text-white"
                                  : "text-slate-400"
                              }`}
                            >
                              {tokenBalance.tokenSymbol}
                            </span>
                          </div>
                          {tokenBalance.isLST && (
                            <span className="bg-purple-900/50 text-purple-300 border border-purple-700/50 px-1 py-0.5 text-xs font-mono font-semibold uppercase tracking-wider">
                              Collateral Token
                            </span>
                          )}
                          <div className="text-xs text-slate-500 font-mono mb-2 truncate">
                            {tokenBalance.tokenName}
                            {tokenBalance.marketName && !tokenBalance.isLST && (
                              <div className="text-xs text-slate-600 mt-0.5">
                                Market: {tokenBalance.marketName}
                              </div>
                            )}
                          </div>

                          {/* Balance */}
                          <div className="space-y-1">
                            <div
                              className={`font-mono font-bold text-sm md:text-base tabular-nums ${
                                parseFloat(tokenBalance.balance) > 0
                                  ? "text-white"
                                  : "text-slate-500"
                              }`}
                            >
                              {tokenBalance.formattedBalance}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Asset ID */}
                      <div className="flex-shrink-0 text-right">
                        <div className="bg-slate-800/50 border border-slate-700/50 px-2 py-1">
                          <div className="text-xs text-slate-400 font-mono tabular-nums font-semibold">
                            {tokenBalance.tokenId === "0"
                              ? "ALGO"
                              : `ID: ${tokenBalance.tokenId}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Buy on Compx Button - Positioned in bottom right for base tokens with 0 balance or not opted in */}
                  {!tokenBalance.isLST &&
                    tokenBalance.tokenId !== "0" &&
                    (parseFloat(tokenBalance.balance) === 0 || !tokenBalance.isOptedIn) && (
                      <div className="absolute bottom-2 right-2 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const swapUrl = `https://app.compx.io/swap?asset_1=0&asset_2=${tokenBalance.tokenId}`;
                            window.open(swapUrl, "_blank", "noopener,noreferrer");
                          }}
                          className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-cyan-400 font-mono text-[10px] uppercase tracking-wide cut-corners-sm transition-all duration-150 border border-cyan-500 hover:border-cyan-400 flex items-center space-x-1.5 whitespace-nowrap"
                        >
                          <img
                            src="/compx-logo-small.png"
                            alt="Compx"
                            className="w-3.5 h-3.5 flex-shrink-0"
                          />
                          <span className="text-white">Buy <span className="text-compx-pink">{tokenBalance.tokenSymbol}</span></span>
                          <svg
                            className="w-2.5 h-2.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Coins className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <div className="text-slate-400 font-mono text-sm">
                NO ORBITAL ASSETS FOUND
              </div>
              <div className="text-slate-500 text-xs font-mono mt-1">
                Connect your wallet and interact with orbital lending markets
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WalletBalancesSection;
