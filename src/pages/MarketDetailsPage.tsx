import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  Info,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Radio,
  BarChart3,
  DollarSign,
  Loader,
} from "lucide-react";
import AppLayout from "../components/app/AppLayout";
import { useMarket } from "../hooks/useMarkets";
import { WalletContext } from "../context/wallet";
import { useToast } from "../context/toastContext";
import { deposit, withdraw } from "../contracts/lending/user";
import { useWallet } from "@txnlab/use-wallet-react";

const MarketDetailsPage = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"deposit" | "redeem" | "borrow">(
    "deposit"
  );
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);

  const { data: market, isLoading, error, isError } = useMarket(marketId || "");
  const { 
    algoBalance, 
    userAssets, 
    isLoadingAssets,
    applyOptimisticBalanceUpdate,
    confirmOptimisticUpdate,
    revertOptimisticUpdate,
  } = useContext(WalletContext);
  const { openToast } = useToast();
  const { activeAddress, transactionSigner } = useWallet();

  useEffect(() => {
    if (!isLoading && !market && marketId) {
      navigate("/markets");
    }
  }, [market, navigate, isLoading, marketId]);

  const handleAction = () => {
    if (activeTab === "deposit") {
      handleDeposit();
    } else if (activeTab === "redeem") {
      handleRedeem();
    } else if (activeTab === "borrow") {
      handleBorrow();
    }
  };

  useEffect(() => {
    console.log("market", market);
  }, [market]);

  const handleDeposit = async () => {
    try {
      setTransactionLoading(true);
      
      // Apply optimistic updates immediately
      const depositAmountMicrounits = (Number(amount) * Math.pow(10, 6)).toString();
      const baseTokenId = market?.baseTokenId || '0';
      const lstTokenId = market?.lstTokenId;
      
      // Decrease base token balance (what user is spending)
      applyOptimisticBalanceUpdate(baseTokenId, `-${depositAmountMicrounits}`);
      // Increase LST token balance (what user receives)
      if (lstTokenId) {
        applyOptimisticBalanceUpdate(lstTokenId, depositAmountMicrounits);
      }
      
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
        .then(() => {
          // Confirm optimistic updates on success
          confirmOptimisticUpdate(baseTokenId);
          if (lstTokenId) {
            confirmOptimisticUpdate(lstTokenId);
          }
          
          openToast({
            type: "success",
            message: "Deposit successful",
            description: `You have deposited ${amount} ${getBaseTokenSymbol(
              market?.symbol
            )} and received ${amount} ${getLSTTokenSymbol(market?.symbol)}!`,
          });
        })
        .catch((error) => {
          // Revert optimistic updates on failure
          revertOptimisticUpdate(baseTokenId);
          if (lstTokenId) {
            revertOptimisticUpdate(lstTokenId);
          }
          
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

  const handleRedeem = async () => {
    try {
      setTransactionLoading(true);
      
      // Apply optimistic updates immediately
      const redeemAmountMicrounits = (Number(amount) * Math.pow(10, 6)).toString();
      const baseTokenId = market?.baseTokenId || '0';
      const lstTokenId = market?.lstTokenId;
      
      // Decrease LST token balance (what user is spending)
      if (lstTokenId) {
        applyOptimisticBalanceUpdate(lstTokenId, `-${redeemAmountMicrounits}`);
      }
      // Increase base token balance (what user receives)
      applyOptimisticBalanceUpdate(baseTokenId, redeemAmountMicrounits);
      
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
        .then(() => {
          // Confirm optimistic updates on success
          if (lstTokenId) {
            confirmOptimisticUpdate(lstTokenId);
          }
          confirmOptimisticUpdate(baseTokenId);
          
          openToast({
            type: "success",
            message: "Redeem successful",
            description: `You have redeemed ${amount} ${getLSTTokenSymbol(
              market?.symbol
            )} and received ${amount} ${getBaseTokenSymbol(market?.symbol)}!`,
          });
        })
        .catch((error) => {
          // Revert optimistic updates on failure
          if (lstTokenId) {
            revertOptimisticUpdate(lstTokenId);
          }
          revertOptimisticUpdate(baseTokenId);
          
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

  const handleBorrow = () => {
    console.log("Borrow");
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

  // Get the maximum available balance based on the active tab
  const getMaxBalance = (): string => {
    if (!market || isLoadingAssets) return "0";

    switch (activeTab) {
      case "deposit": {
        // For deposit, use the base token balance (the token being deposited)
        if (market.baseTokenId === "0" || !market.baseTokenId) {
          // If base token is ALGO
          return algoBalance || "0";
        } else {
          // Find the base token in user assets
          const baseAsset = userAssets?.assets.find(
            (asset) => asset.assetId === market.baseTokenId && asset.isOptedIn
          );
          return baseAsset?.balance || "0";
        }
      }

      case "redeem": {
        // For redeem, use the LST token balance (the market token)
        if (!market.lstTokenId) return "0";
        const lstAsset = userAssets?.assets.find(
          (asset) => asset.assetId === market.lstTokenId && asset.isOptedIn
        );
        return lstAsset?.balance || "0";
      }

      case "borrow":
        // For borrow, use the available borrow amount (already calculated in market)
        // Convert to microunits for consistency with other balances
        return (market.availableToBorrow * Math.pow(10, 6)).toString();

      default:
        return "0";
    }
  };

  // Format balance from microunits to display units (assuming 6 decimals for most tokens)
  const formatBalance = (balance: string, decimals = 6): string => {
    const balanceNum = parseFloat(balance || "0");
    if (isNaN(balanceNum) || balanceNum === 0) return "0";

    const formattedBalance = balanceNum / Math.pow(10, decimals);

    // For very small amounts, show more precision
    if (formattedBalance < 0.01 && formattedBalance > 0) {
      return formattedBalance.toFixed(8).replace(/\.?0+$/, "");
    }

    // For normal amounts, show up to 6 decimal places
    return formattedBalance.toFixed(6).replace(/\.?0+$/, "");
  };

  // Handle MAX button click
  const handleMaxClick = () => {
    const maxBalance = getMaxBalance();
    const formattedMax = formatBalance(maxBalance);
    setAmount(formattedMax);
  };

  // Mock interest rate calculation
  const calculateInterestRate = (utilization: number) => {
    if (utilization < 50) {
      return 2 + utilization * 0.1;
    } else {
      const baseRate = 2 + 50 * 0.1;
      const kinkRate = (utilization - 50) * 0.4;
      return baseRate + kinkRate;
    }
  };

  return (
    <AppLayout>
      <div className="container-section py-8">
        {/* Navigation Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate("/app/markets")}
            className="flex items-center gap-3 mb-6 text-slate-400 hover:text-white transition-colors duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono text-sm uppercase tracking-wide">
              Back to Markets
            </span>
          </button>

          {/* Market Header */}
          <div className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative w-16 h-16 planet-ring">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-2 border-slate-500">
                    <img
                      src={market.image}
                      alt={`${market.name} planet`}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NmZjZjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMkwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEyTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiMwMDIwMzMiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-mono font-bold text-white mb-2">
                    {market.symbol}
                  </h1>
                  <p className="text-slate-400 font-mono">{market.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-cyan-500 cut-corners-sm px-4 py-2 border border-cyan-500 shadow-inset">
                  <span className="text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wide">
                    LTV {market.ltv}%
                  </span>
                </div>
                <div className="text-amber-500 cut-corners-sm px-4 py-2 border border-amber-500 shadow-inset">
                  <span className="text-amber-400 text-xs font-mono font-semibold uppercase tracking-wide">
                    LT {market.liquidationThreshold}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <Radio className="w-5 h-5" />
                  <span className="text-sm font-mono font-semibold uppercase tracking-wide">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="xl:col-span-2 space-y-8">
            {/* Market Overview */}
            <motion.div
              className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wide">
                  Market Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="inset-panel cut-corners-sm p-4">
                  <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
                    Total Supply
                  </div>
                  <div className="text-2xl font-mono font-bold text-white tabular-nums">
                    ${market.totalDepositsUSD.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500 font-mono">
                    {(market.totalDeposits).toFixed(6)} {market.symbol}
                  </div>
                </div>

                <div className="inset-panel cut-corners-sm p-4">
                  <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
                    Supply APR
                  </div>
                  <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">
                    {market.supplyApr.toFixed(2)}%
                  </div>
                </div>

                <div className="inset-panel cut-corners-sm p-4">
                  <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
                    Borrow APR
                  </div>
                  <div className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
                    {market.borrowApr.toFixed(2)}%
                  </div>
                </div>

                
              </div>

              {/* Utilization Track */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400 text-sm font-mono uppercase tracking-wider">
                    Market Utilization
                  </span>
                  <span className="text-white text-sm font-mono font-semibold tabular-nums">
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
            <motion.div
              className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wide">
                  Interest Rate Model
                </h2>
                <div className="text-cyan-500 cut-corners-sm px-3 py-1 border border-cyan-500 shadow-inset">
                  <span className="text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wide">
                    Kink Model
                  </span>
                </div>
              </div>

              {/* Interest Rate Chart */}
              <div className="relative h-64 mb-6 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                <div className="absolute inset-4">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-mono text-slate-400">
                    <span>50%</span>
                    <span>40%</span>
                    <span>30%</span>
                    <span>20%</span>
                    <span>10%</span>
                    <span>0%</span>
                  </div>

                  {/* Chart area */}
                  <div className="ml-8 mr-4 h-full relative">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="absolute w-full border-t border-slate-700/50"
                        style={{ top: `${i * 20}%` }}
                      />
                    ))}

                    {/* Current utilization marker */}
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-cyan-400 opacity-80"
                      style={{ left: `${market.utilizationRate}%` }}
                    >
                      <div className="absolute -top-6 -left-8 text-xs font-mono text-cyan-400 font-bold">
                        Current: {market.utilizationRate.toFixed(1)}%
                      </div>
                    </div>

                    {/* Kink point marker */}
                    <div className="absolute top-0 bottom-0 left-[50%] border-l border-yellow-400 opacity-60">
                      <div className="absolute -top-6 -left-6 text-xs font-mono text-yellow-400">
                        Kink: 50%
                      </div>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-8 right-4 flex justify-between text-xs font-mono text-slate-400">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Rate Model Description */}
              <div className="inset-panel cut-corners-sm p-4">
                <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wide">
                  Rate Formula
                </h3>
                <div className="space-y-2 text-sm font-mono text-slate-300">
                  <div>
                    Base Rate: <span className="text-cyan-400">2%</span>
                  </div>
                  <div>
                    Pre-Kink Multiplier:{" "}
                    <span className="text-cyan-400">0.1 per % utilization</span>
                  </div>
                  <div>
                    Post-Kink Multiplier:{" "}
                    <span className="text-amber-400">
                      0.4 per % utilization
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-700">
                    Current Rate:{" "}
                    <span className="text-white font-bold">
                      {calculateInterestRate(market.utilizationRate).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Collateral Relationships */}
            {/*  <motion.div
              className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wide">Collateral Network</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="inset-panel cut-corners-sm p-5">
                  <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wide">Accepts as Collateral</h3>
                  <div className="space-y-3">
                    {COLLATERAL_RELATIONSHIPS[market.id]?.acceptsAsCollateral.map((assetId, index) => (
                      <div key={assetId} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-xs font-mono text-white">{index + 1}</span>
                          </div>
                          <span className="font-mono text-slate-300">{assetId === '744427950' ? 'COMPXt' : assetId.charAt(0).toUpperCase() + assetId.slice(1)}</span>
                        </div>
                        <div className="text-cyan-400 text-sm font-mono">75% LTV</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="inset-panel cut-corners-sm p-5">
                  <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wide">Usable as Collateral For</h3>
                  <div className="space-y-3">
                    {COLLATERAL_RELATIONSHIPS[market.id]?.usableAsCollateralFor.map((assetId, index) => (
                      <div key={assetId} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-xs font-mono text-white">{index + 1}</span>
                          </div>
                          <span className="font-mono text-slate-300">{assetId === '744427950' ? 'COMPXt' : assetId.charAt(0).toUpperCase() + assetId.slice(1)}</span>
                        </div>
                        <div className="text-amber-400 text-sm font-mono">Active</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
 */}
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
                    <span className="font-mono text-white text-sm">${market?.baseTokenPrice}</span>
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
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Action Panel */}
            <div className="text-slate-600 cut-corners-lg p-6 bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wide">
                  Market Actions
                </h3>
              </div>

              {/* Tab Selector */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("deposit")}
                  className={`flex-1 h-10 px-3 cut-corners-sm font-mono text-xs font-semibold transition-all duration-150 ${
                    activeTab === "deposit"
                      ? "bg-cyan-600 border-2 border-cyan-500 text-white"
                      : "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600"
                  }`}
                >
                  <span className="relative z-20">DEPOSIT</span>
                </button>
                <button
                  onClick={() => setActiveTab("redeem")}
                  className={`flex-1 h-10 px-3 cut-corners-sm font-mono text-xs font-semibold transition-all duration-150 ${
                    activeTab === "redeem"
                      ? "bg-green-600 border-2 border-green-500 text-white"
                      : "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600"
                  }`}
                  disabled={
                    userAssets?.assets.find(
                      (asset) =>
                        Number(asset.assetId) === Number(market?.lstTokenId)
                    )?.balance === "0"
                  }
                >
                  <span className="relative z-20">REDEEM</span>
                </button>
                <button
                  onClick={() => setActiveTab("borrow")}
                  className={`flex-1 h-10 px-3 cut-corners-sm font-mono text-xs font-semibold transition-all duration-150 ${
                    activeTab === "borrow"
                      ? "bg-blue-600 border-2 border-blue-500 text-white"
                      : "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600"
                  }`}
                  disabled={market.availableToBorrow === 0}
                >
                  <span className="relative z-20">BORROW</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">
                      Amount
                    </span>
                    <button
                      onClick={handleMaxClick}
                      disabled={isLoadingAssets}
                      className={`text-xs font-mono font-semibold uppercase tracking-wide transition-colors ${
                        isLoadingAssets
                          ? "text-slate-500 cursor-not-allowed"
                          : activeTab === "deposit"
                          ? "text-cyan-400 hover:text-cyan-300"
                          : activeTab === "redeem"
                          ? "text-green-400 hover:text-green-300"
                          : "text-blue-400 hover:text-blue-300"
                      }`}
                    >
                      {isLoadingAssets ? "LOADING..." : "MAX"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={`w-full h-12 px-4 bg-slate-100 border-2 border-slate-600  text-slate-800 font-mono text-lg focus:outline-none transition-colors ${
                        activeTab === "deposit"
                          ? "focus:border-cyan-400"
                          : activeTab === "redeem"
                          ? "focus:border-green-400"
                          : "focus:border-blue-400"
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-sm">
                        {activeTab === "redeem"
                          ? getLSTTokenSymbol(market?.symbol)
                          : getBaseTokenSymbol(market?.symbol)}
                      </span>
                      <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                        <img
                          src={market.image}
                          alt={market.symbol}
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="inset-panel cut-corners-sm p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-mono text-slate-400">
                      {activeTab === "deposit" && "Deposit APR"}
                      {activeTab === "redeem" && "Current Supply APR"}
                      {activeTab === "borrow" && "Borrow APR"}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        activeTab === "deposit"
                          ? "text-cyan-400"
                          : activeTab === "redeem"
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {activeTab === "deposit" &&
                        `+${market.supplyApr.toFixed(2)}%`}
                      {activeTab === "redeem" &&
                        `+${market.supplyApr.toFixed(2)}%`}
                      {activeTab === "borrow" &&
                        `${market.borrowApr.toFixed(2)}%`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-mono text-slate-400">
                      {activeTab === "deposit" && "Wallet Balance"}
                      {activeTab === "redeem" && "Your LST Balance"}
                      {activeTab === "borrow" && "Available to Borrow"}
                    </span>
                    <span className="font-mono text-white">
                      {isLoadingAssets ? (
                        <span className="text-slate-500">Loading...</span>
                      ) : (
                        <>
                          {activeTab === "deposit" &&
                            `${formatBalance(getMaxBalance())} ${
                              getBaseTokenSymbol(market?.symbol) || "tokens"
                            }`}
                          {activeTab === "redeem" &&
                            `${formatBalance(getMaxBalance())} ${
                              getLSTTokenSymbol(market?.symbol) || "LST"
                            }`}
                          {activeTab === "borrow" &&
                            `${formatBalance(getMaxBalance())} ${
                              getBaseTokenSymbol(market?.symbol) || "tokens"
                            }`}
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-mono text-slate-400">
                      {activeTab === "deposit" && "You Will Receive"}
                      {activeTab === "redeem" && "You Will Receive"}
                      {activeTab === "borrow" && "Collateral Required"}
                    </span>
                    <span className="font-mono text-white">
                      {activeTab === "deposit" &&
                        `${
                          amount
                            ? (parseFloat(amount) * 0.98).toFixed(2)
                            : "0.00"
                        } ${getLSTTokenSymbol(market?.symbol)}`}
                      {activeTab === "redeem" &&
                        `${
                          amount
                            ? (parseFloat(amount) * 1.02).toFixed(2)
                            : "0.00"
                        } ${getBaseTokenSymbol(market?.symbol)}`}
                      {activeTab === "borrow" &&
                        `${
                          amount
                            ? (parseFloat(amount) / (market.ltv / 100)).toFixed(
                                2
                              )
                            : "0.00"
                        } collateral`}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className={`w-full h-12 cut-corners-sm font-mono text-sm font-semibold transition-all duration-150 ${
                    amount &&
                    parseFloat(amount) > 0 &&
                    !(
                      (activeTab === "borrow" &&
                        market.availableToBorrow === 0) /* ||
                      (activeTab === "redeem" &&
                        userAssets?.assets.find(
                          (asset) =>
                            Number(asset.assetId) === Number(market?.lstTokenId)
                        )?.balance !== "0") */
                    )
                      ? activeTab === "deposit"
                        ? "bg-cyan-600 border-2 border-cyan-500 text-white hover:bg-cyan-500 shadow-top-highlight"
                        : activeTab === "redeem"
                        ? "bg-green-600 border-2 border-green-500 text-white hover:bg-green-500 shadow-top-highlight"
                        : "bg-blue-600 border-2 border-blue-500 text-white hover:bg-blue-500 shadow-top-highlight"
                      : "bg-slate-700 border-2 border-slate-600 text-slate-400 cursor-not-allowed"
                  }`}
                  onClick={handleAction}
                  disabled={
                    transactionLoading ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    (activeTab === "borrow" &&
                      market.availableToBorrow === 0) ||
                    (activeTab === "redeem" &&
                      userAssets?.assets.find(
                        (asset) =>
                          Number(asset.assetId) === Number(market?.lstTokenId)
                      )?.balance === "0")
                  }
                >
                  <span className="relative z-20">
                    {activeTab === "deposit" &&
                      `DEPOSIT ${getBaseTokenSymbol(market?.symbol)}`}
                    {activeTab === "redeem" &&
                      `REDEEM ${getLSTTokenSymbol(market?.symbol)}`}
                    {activeTab === "borrow" &&
                      `BORROW ${getBaseTokenSymbol(market?.symbol)}`}
                  </span>
                </button>

                {/* Status Messages */}
                {activeTab === "borrow" && market.availableToBorrow === 0 && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                    <AlertCircle className="w-4 h-4" />
                    <span>Market at capacity</span>
                  </div>
                )}

                {activeTab === "redeem" &&
                  userAssets?.assets.find(
                    (asset) =>
                      Number(asset.assetId) === Number(market?.lstTokenId)
                  )?.balance === "0" && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                      <AlertCircle className="w-4 h-4" />
                      <span>No LST tokens to redeem</span>
                    </div>
                  )}

                {activeTab === "deposit" && (
                  <div className="text-xs text-slate-500 font-mono">
                    Deposit {getBaseTokenSymbol(market?.symbol)} to receive
                    yield-bearing {getLSTTokenSymbol(market?.symbol)} tokens
                  </div>
                )}

                {activeTab === "redeem" && (
                  <div className="text-xs text-slate-500 font-mono">
                    Redeem your {getLSTTokenSymbol(market?.symbol)} tokens back
                    to {getBaseTokenSymbol(market?.symbol)}
                  </div>
                )}

                {activeTab === "borrow" && (
                  <div className="text-xs text-slate-500 font-mono">
                    Borrow {getBaseTokenSymbol(market?.symbol)} against your
                    collateral at {market?.ltv}% LTV
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MarketDetailsPage;
