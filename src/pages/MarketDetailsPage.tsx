/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Info,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Radio,
  BarChart3,
  Loader,
} from "lucide-react";
import AppLayout from "../components/app/AppLayout";
import InterestRateModel from "../components/InterestRateModel";
import CollateralRelationships from "../components/CollateralRelationships";
import ActionPanel from "../components/app/ActionPanel";
import { useMarket, useRefetchMarkets, useMarkets } from "../hooks/useMarkets";
import { WalletContext } from "../context/wallet";
import { useToast } from "../context/toastContext";
import { borrow, deposit, withdraw } from "../contracts/lending/user";
import { useWallet } from "@txnlab/use-wallet-react";
import {
  calculateAssetDue,
  calculateLSTDue,
  getAcceptedCollateral,
} from "../contracts/lending/state";
import { recordUserAction } from "../services/userStats";

const MarketDetailsPage = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [acceptedCollateral, setAcceptedCollateral] = useState<
    Map<any, any> | undefined
  >(undefined);

  // Ref to track the last fetched collateral combination to prevent unnecessary calls
  const lastFetchedRef = useRef<string | null>(null);

  const { data: market, isLoading, error, isError } = useMarket(marketId || "");
  const { data: allMarkets } = useMarkets();
  const {
    algoBalance,
    userAssets,
    isLoadingAssets,
    applyOptimisticBalanceUpdate,
    confirmOptimisticUpdate,
  } = useContext(WalletContext);
  const { openToast } = useToast();
  const { activeAddress, transactionSigner } = useWallet();
  const refetchMarkets = useRefetchMarkets();

  useEffect(() => {
    if (!isLoading && !market && marketId) {
      navigate("/markets");
    }
  }, [market, navigate, isLoading, marketId]);

  // Fetch accepted collateral data - only when market or address actually changes
  useEffect(() => {
    const fetchCollateral = async () => {
      if (market && activeAddress && transactionSigner) {
        // Create a unique identifier for this combination
        const currentIdentifier = `${market.id}-${activeAddress}`;

        // Only fetch if this combination has changed
        if (lastFetchedRef.current !== currentIdentifier) {
          console.log("Fetching accepted collateral for market:", market.id);

          try {
            const collateral = await getAcceptedCollateral(
              activeAddress,
              Number(market.id),
              transactionSigner
            );
            setAcceptedCollateral(collateral);
            lastFetchedRef.current = currentIdentifier;
          } catch (error) {
            console.error("Failed to fetch accepted collateral:", error);
            setAcceptedCollateral(undefined);
            // Don't update lastFetchedRef on error so it will retry next time
          }
        }
      } else {
        // Clear collateral if dependencies are missing
        setAcceptedCollateral(undefined);
        lastFetchedRef.current = null;
      }
    };

    fetchCollateral();
  }, [market, activeAddress]);

  const handleDeposit = async (amount: string) => {
    try {
      setTransactionLoading(true);

      const depositAmountMicrounits = (
        Number(amount) * Math.pow(10, 6)
      ).toString();
      const baseTokenId = market?.baseTokenId || "0";
      const lstTokenId = market?.lstTokenId;

      openToast({
        type: "loading",
        message: "Depositing...",
        description: `Please sign the transaction to deposit ${amount} ${getBaseTokenSymbol(
          market?.symbol
        )} to receive ${amount} ${getLSTTokenSymbol(market?.symbol)}`,
      });

      await deposit({
        address: activeAddress as string,
        amount: Number(amount),
        appId: Number(market?.id),
        depositAssetId: Number(market?.baseTokenId),
        lstAssetId: Number(market?.lstTokenId),
        signer: transactionSigner,
      })
        .then((txId) => {
          // Apply optimistic updates only after transaction success
          applyOptimisticBalanceUpdate(
            baseTokenId,
            `-${depositAmountMicrounits}`
          );
          if (lstTokenId) {
            applyOptimisticBalanceUpdate(lstTokenId, depositAmountMicrounits);
          }

          // Confirm the updates immediately since transaction was successful
          confirmOptimisticUpdate(baseTokenId);
          if (lstTokenId) {
            confirmOptimisticUpdate(lstTokenId);
          }

          // Immediately refetch market data to reflect changes in market overview and interest rates
          refetchMarkets();

          // Calculate the actual LST tokens minted for this deposit (for analytics, not used in UI here)
          const lstMinted = calculateLSTDue(
            BigInt(Number(amount) * 10 ** 6),
            BigInt((market?.circulatingLST ?? 0) * 10 ** 6),
            BigInt((market?.totalDeposits ?? 0) * 10 ** 6)
          );

          recordUserAction({
            address: activeAddress as string,
            marketId: Number(market?.id),
            action: "deposit",
            tokensOut: Number(lstMinted), //LST returned
            tokensIn: Number(amount), //Base token deposited
            timestamp: Date.now(),
            txnId: txId,
            tokenInId: Number(market?.baseTokenId),
            tokenOutId: Number(market?.lstTokenId),
          });

          openToast({
            type: "success",
            message: "Deposit successful",
            description: `You have deposited ${amount} ${getBaseTokenSymbol(
              market?.symbol
            )} and received ${amount} ${getLSTTokenSymbol(market?.symbol)}!`,
          });
        })
        .catch((error) => {
          console.error(error);
          openToast({
            type: "error",
            message: "Deposit failed",
            description: `Unable to deposit ${amount} ${getBaseTokenSymbol(
              market?.symbol
            )}`,
          });
        });
      setTransactionLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRedeem = async (amount: string) => {
    try {
      setTransactionLoading(true);

      const redeemAmountMicrounits = (
        Number(amount) * Math.pow(10, 6)
      ).toString();
      const baseTokenId = market?.baseTokenId || "0";
      const lstTokenId = market?.lstTokenId;

      openToast({
        type: "loading",
        message: "Redeeming...",
        description: `Please sign the transaction to redeem ${amount} ${getLSTTokenSymbol(
          market?.symbol
        )} to receive ${amount} ${getBaseTokenSymbol(market?.symbol)}`,
      });

      await withdraw({
        address: activeAddress as string,
        amount: Number(amount),
        appId: Number(market?.id),
        signer: transactionSigner,
        lstTokenId: Number(market?.lstTokenId),
      })
        .then((txId) => {
          // Apply optimistic updates only after transaction success
          if (lstTokenId) {
            applyOptimisticBalanceUpdate(
              lstTokenId,
              `-${redeemAmountMicrounits}`
            );
          }
          applyOptimisticBalanceUpdate(baseTokenId, redeemAmountMicrounits);

          // Confirm the updates immediately since transaction was successful
          if (lstTokenId) {
            confirmOptimisticUpdate(lstTokenId);
          }
          confirmOptimisticUpdate(baseTokenId);

          // Immediately refetch market data to reflect changes in market overview and interest rates
          refetchMarkets();

          const asaDue = calculateAssetDue(
            BigInt(Number(amount) * 10 ** 6),
            BigInt((market?.circulatingLST ?? 0) * 10 ** 6),
            BigInt((market?.totalDeposits ?? 0) * 10 ** 6)
          );

          recordUserAction({
            address: activeAddress as string,
            marketId: Number(market?.id),
            action: "redeem",
            tokensOut: Number(amount), //LST returned
            tokensIn: Number(asaDue), //Base token deposited
            timestamp: Date.now(),
            txnId: txId,
            tokenInId: Number(market?.lstTokenId),
            tokenOutId: Number(market?.baseTokenId),
          });

          openToast({
            type: "success",
            message: "Redeem successful",
            description: `You have redeemed ${amount} ${getLSTTokenSymbol(
              market?.symbol
            )} and received ${amount} ${getBaseTokenSymbol(market?.symbol)}!`,
          });
        })
        .catch((error) => {
          console.error(error);
          openToast({
            type: "error",
            message: "Redeem failed",
            description: `Unable to redeem ${amount} ${getLSTTokenSymbol(
              market?.symbol
            )}`,
          });
        });
      setTransactionLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBorrow = async (
    collateralAssetId: string,
    collateralAmount: string,
    borrowAmount: string
  ) => {
    // Find the market that has the collateral token as its LST token
    const collateralMarket = allMarkets?.find(
      (m) => m.lstTokenId === collateralAssetId
    );

    if (!collateralMarket) {
      openToast({
        type: "error",
        message: "Invalid collateral",
        description:
          "Could not find the market for the selected collateral token",
      });
      return;
    }

    openToast({
      type: "loading",
      message: "Borrowing...",
      description: `Please sign the transaction to borrow ${borrowAmount} ${getBaseTokenSymbol(
        market?.symbol
      )} using ${collateralAmount} ${getBaseTokenSymbol(
        collateralAssetId
      )} as collateral`,
    });

    await borrow({
      address: activeAddress as string,
      collateralAmount: Number(collateralAmount),
      borrowAmount: Number(borrowAmount),
      collateralAssetId: Number(collateralAssetId),
      lstAppId: Number(collateralMarket.id), // Use the collateral market's app ID
      appId: Number(market?.id), // Current market we're borrowing from
      signer: transactionSigner,
    })
      .then((txId) => {
        // Apply optimistic updates only after transaction success
        const borrowAmountMicrounits = (Number(borrowAmount) * Math.pow(10, 6)).toString();
        const collateralAmountMicrounits = (Number(collateralAmount) * Math.pow(10, 6)).toString();
        const baseTokenId = market?.baseTokenId || "0";

        // Add borrowed tokens to user balance
        applyOptimisticBalanceUpdate(baseTokenId, borrowAmountMicrounits);
        
        // Remove collateral tokens from user balance
        applyOptimisticBalanceUpdate(collateralAssetId, `-${collateralAmountMicrounits}`);

        // Confirm the updates immediately since transaction was successful
        confirmOptimisticUpdate(baseTokenId);
        confirmOptimisticUpdate(collateralAssetId);

        // Immediately refetch market data to reflect changes in market overview and interest rates
        refetchMarkets();

        openToast({
          type: "success",
          message: "Borrow successful",
          description: `You have borrowed ${borrowAmount} ${getBaseTokenSymbol(
            market?.symbol
          )} using ${collateralAmount} ${getBaseTokenSymbol(
            collateralAssetId
          )} as collateral`,
        });

        recordUserAction({
          address: activeAddress as string,
          marketId: Number(market?.id),
          action: "borrow",
          tokensOut: Number(borrowAmount),
          tokensIn: Number(collateralAmount),
          timestamp: Date.now(),
          txnId: txId,
          tokenInId: Number(collateralAssetId),
          tokenOutId: Number(market?.baseTokenId),
        });
      })
      .catch((error) => {
        console.error(error);
        openToast({
          type: "error",
          message: "Borrow failed",
          description: `Unable to borrow ${borrowAmount} ${getBaseTokenSymbol(
            market?.symbol
          )} using ${collateralAmount} ${getBaseTokenSymbol(
            collateralAssetId
          )} as collateral`,
        });
      });
    setTransactionLoading(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container-section py-8">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-slate-600 cut-corners-lg p-8">
              <Loader className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
              <div className="text-slate-400 font-mono mb-4">
                LOADING ORBITAL MARKET...
              </div>
              <div className="text-slate-500 text-sm font-mono">
                Fetching market details from the blockchain
              </div>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (isError || !market) {
    return (
      <AppLayout>
        <div className="container-section py-8">
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-slate-600 cut-corners-lg p-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <div className="text-red-400 font-mono mb-4">
                MARKET NOT FOUND
              </div>
              <div className="text-slate-500 text-sm font-mono mb-4">
                {error?.message || "The requested market could not be found"}
              </div>
              <button
                onClick={() => navigate("/markets")}
                className="text-cyan-500 cut-corners-sm px-6 py-2 font-mono text-sm hover:text-cyan-400 transition-all duration-150 border border-cyan-500 hover:border-cyan-400"
              >
                <span className="text-white">RETURN TO MARKETS</span>
              </button>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const getUtilizationBgColor = (rate: number) => {
    if (rate >= 90) return "from-red-500 to-red-600";
    if (rate >= 70) return "from-amber-500 to-amber-600";
    return "from-cyan-500 to-blue-500";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper function to get base token symbol (removes 'c' prefix if LST)
  const getBaseTokenSymbol = (symbol?: string): string => {
    if (!symbol) return "";
    return symbol.startsWith("c") ? symbol.substring(1) : symbol;
  };

  // Helper function to get LST token symbol (adds 'c' prefix if not already there)
  const getLSTTokenSymbol = (symbol?: string): string => {
    if (!symbol) return "";
    return symbol.startsWith("c") ? symbol : `c${symbol}`;
  };

  return (
    <AppLayout>
      <div className="container-section py-4 md:py-8">
        {/* Navigation Header */}
        <motion.div
          className="mb-4 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate("/app/markets")}
            className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-slate-400 hover:text-white transition-colors duration-150 px-1"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-mono text-xs md:text-sm uppercase tracking-wide">
              Back to Markets
            </span>
          </button>

          {/* Market Header */}
          <div className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="relative w-12 h-12 md:w-16 md:h-16 planet-ring">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-2 border-slate-500">
                    <img
                      src={market.image}
                      alt={`${market.name} planet`}
                      className="w-8 h-8 md:w-12 md:h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NmZjZjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMkwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEyTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiMwMDIwMzMiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-mono font-bold text-white mb-1 md:mb-2">
                    {market.symbol}
                  </h1>
                  <p className="text-slate-400 font-mono text-sm md:text-base">
                    {market.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <div className="text-cyan-500 cut-corners-sm px-2 py-1 md:px-4 md:py-2 border border-cyan-500 shadow-inset">
                  <span className="text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wide">
                    LTV {market.ltv}%
                  </span>
                </div>
                <div className="text-amber-500 cut-corners-sm px-2 py-1 md:px-4 md:py-2 border border-amber-500 shadow-inset">
                  <span className="text-amber-400 text-xs font-mono font-semibold uppercase tracking-wide">
                    LT {market.liquidationThreshold}%
                  </span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-cyan-400">
                  <Radio className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm font-mono font-semibold uppercase tracking-wide">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content - Left Side */}
          <div className="xl:col-span-2 space-y-4 md:space-y-8">
            {/* Market Overview */}
            <motion.div
              className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide">
                  Market Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="inset-panel cut-corners-sm p-3 md:p-4">
                  <div className="text-slate-400 text-xs font-mono mb-1 md:mb-2 uppercase tracking-wider">
                    Total Supply
                  </div>
                  <div className="text-lg md:text-2xl font-mono font-bold text-white tabular-nums">
                    ${market.totalDepositsUSD.toLocaleString()}
                  </div>
                  <div className="text-xs md:text-sm text-slate-500 font-mono">
                    {market.totalDeposits.toFixed(6)} {market.symbol}
                  </div>
                </div>

                <div className="inset-panel cut-corners-sm p-3 md:p-4">
                  <div className="text-slate-400 text-xs font-mono mb-1 md:mb-2 uppercase tracking-wider">
                    Supply APR
                  </div>
                  <div className="text-lg md:text-2xl font-mono font-bold text-cyan-400 tabular-nums">
                    {market.supplyApr.toFixed(2)}%
                  </div>
                </div>

                <div className="inset-panel cut-corners-sm p-3 md:p-4">
                  <div className="text-slate-400 text-xs font-mono mb-1 md:mb-2 uppercase tracking-wider">
                    Borrow APR
                  </div>
                  <div className="text-lg md:text-2xl font-mono font-bold text-amber-400 tabular-nums">
                    {market.borrowApr.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Utilization Track */}
              <div className="mb-4 md:mb-6">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <span className="text-slate-400 text-xs md:text-sm font-mono uppercase tracking-wider">
                    Market Utilization
                  </span>
                  <span className="text-white text-xs md:text-sm font-mono font-semibold tabular-nums">
                    {market.utilizationRate.toFixed(1)}% of Cap
                  </span>
                </div>
                <div className="relative">
                  <div className="orbital-ring w-full bg-noise-dark">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${getUtilizationBgColor(
                        market.utilizationRate
                      )} relative rounded-lg`}
                      initial={{ width: 0 }}
                      animate={{ width: `${market.utilizationRate}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{
                        minWidth: market.utilizationRate > 0 ? "14px" : "0px",
                      }}
                    />
                  </div>
                  <div className="absolute top-0 left-[50%] h-3.5 w-0.5 bg-yellow-400 opacity-80 transform -translate-x-0.5 rounded-full"></div>
                  <div className="absolute top-0 left-[100%] h-3.5 w-1 bg-red-400 opacity-90 transform -translate-x-1 rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
                  <span>0%</span>
                  <span className="text-yellow-400">Kink: 50%</span>
                  <span className="text-red-400">Cap: 100%</span>
                </div>
              </div>
            </motion.div>

            {/* Interest Rate Model */}
            <InterestRateModel market={market} />

            {/* Collateral Relationships */}
            <CollateralRelationships
              market={market}
              acceptedCollateral={acceptedCollateral}
            />

            {/* Contract Information */}
            <motion.div
              className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Info className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wide">
                  Contract Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">
                      Token ID
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white text-sm">
                        {market.id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(market.id)}
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">
                      Decimals
                    </span>
                    <span className="font-mono text-white text-sm">6</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">
                      Oracle Price
                    </span>
                    <span className="font-mono text-white text-sm">
                      ${market?.baseTokenPrice}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">
                      Network
                    </span>
                    <span className="font-mono text-white text-sm">
                      Algorand Testnet
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">
                      Market Type
                    </span>
                    <span className="font-mono text-white text-sm">
                      LST Pool
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">
                      Explorer
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Panel - Right Side */}
          <ActionPanel
            market={market}
            userAssets={userAssets || undefined}
            algoBalance={algoBalance}
            isLoadingAssets={isLoadingAssets}
            transactionLoading={transactionLoading}
            acceptedCollateral={acceptedCollateral}
            onDeposit={handleDeposit}
            onRedeem={handleRedeem}
            onBorrow={handleBorrow}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default MarketDetailsPage;
