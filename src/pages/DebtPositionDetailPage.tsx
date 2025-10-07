import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  AlertTriangle,
  Shield,
  TrendingDown,
  DollarSign,
  Target,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/app/AppLayout";
import { useOptimizedDebtPosition } from "../hooks/useOptimizedLoanRecords";
import { useNFD } from "../hooks/useNFD";
import { useMarket } from "../hooks/useMarkets";
import MomentumSpinner from "../components/MomentumSpinner";
import { buyoutSplitASA, buyoutSplitAlgo } from "../contracts/lending/user";
import { getAcceptedCollateral } from "../contracts/lending/state";
import { useWallet } from "@txnlab/use-wallet-react";
import { useToast } from "../context/toastContext";

const DebtPositionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeAddress, transactionSigner } = useWallet();
  const { openToast } = useToast();
  const [isExecutingBuyout, setIsExecutingBuyout] = useState(false);

  // Use optimized pricing system with fixed LST market lookup
  const { data: position, isLoading, error } = useOptimizedDebtPosition(id || "");

  // Fetch market data to get buyoutTokenId, oracleAppId, etc.
  const { data: market } = useMarket(position?.marketId || "");

  // Fetch NFD data for the user address
  const { nfdName, nfdAvatar, isLoadingNFD } = useNFD(
    position?.userAddress || ""
  );

  // Map token symbols to their image paths
  const getTokenImage = (symbol: string): string => {
    const tokenImages: Record<string, string> = {
      // Base tokens
      xUSDt: "/xUSDt.svg",
      COMPXt: "/COMPXt.svg",
      USDCt: "/USDCt-logo.svg",
      goBTCt: "/goBTCt-logo.svg",
      // Collateral tokens
      cxUSDt: "/xUSDt.svg", // Using base token image for collateral
      cCOMPXt: "/COMPXt.svg", // Using base token image for collateral
    };

    return tokenImages[symbol] || "/default-token.svg";
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatDisplayName = (address: string) => {
    // Show loading indicator if NFD is being fetched
    if (isLoadingNFD) {
      return "Loading...";
    }

    // Use NFD name if available
    if (nfdName) {
      // Truncate long NFD names (keep first 20 chars + ...)
      return nfdName.length > 23 ? `${nfdName.slice(0, 20)}...` : nfdName;
    }

    // Fall back to truncated address
    return formatAddress(address);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatUSD = (num: number) => {
    if (num === 0) return "0.00";
    if (num < 0.01) {
      // For very small amounts, show up to 6 decimal places
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(num);
    } else if (num < 1) {
      // For amounts less than $1, show up to 4 decimal places
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(num);
    } else {
      // For amounts $1 and above, show 2 decimal places
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    }
  };

  const getHealthStatus = (healthRatio: number, liquidationThreshold: number) => {
    // liquidationThreshold is already a decimal (e.g., 0.85 for 85%)
    // healthRatio is collateralValueUSD / debtValueUSD
    // Liquidation occurs when healthRatio <= liquidationThreshold
    
    // Healthy: significantly above liquidation threshold (20% buffer)
    if (healthRatio >= liquidationThreshold * 1.2) {
      return {
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        borderColor: "border-green-400",
        status: "HEALTHY",
        icon: Shield,
      };
    } 
    // Warning: close to liquidation threshold (within 10% buffer above threshold)
    else if (healthRatio >= liquidationThreshold * 1.1) {
      return {
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        borderColor: "border-amber-400",
        status: "NEARING LIQUIDATION",
        icon: AlertTriangle,
      };
    } 
    // Liquidation zone: at or below liquidation threshold
    else {
      return {
        color: "text-red-400",
        bgColor: "bg-red-400/10",
        borderColor: "border-red-400",
        status: "LIQUIDATION ZONE",
        icon: TrendingDown,
      };
    }
  };

  // Loading and error states
  if (isLoading) {
    return (
      <AppLayout title="Loading Position - Mercury Trading Post">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <MomentumSpinner 
              size="48" 
              speed="1.1" 
              color="#06b6d4" 
              className="mx-auto mb-4" 
            />
            <p className="text-slate-400">Loading debt position...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !position) {
    return (
      <AppLayout title="Position Not Found - Mercury Trading Post">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">
              {error
                ? "Failed to load debt position"
                : "Debt position not found"}
            </p>
            <Link
              to="/app/marketplace"
              className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-lg hover:bg-opacity-80 font-semibold"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const healthStatus = getHealthStatus(position.healthRatio, position.liquidationThreshold);
  const HealthIcon = healthStatus.icon;
  // Use the actual liquidation threshold from the position data, not hardcoded 1.2
  const isLiquidationZone = position.healthRatio <= position.liquidationThreshold;

  const handleLiquidate = () => {
    console.log("Execute liquidation for position:", position.id);
    // TODO: Implement liquidation logic
  };

  const handleBUYOUT = async () => {
    if (!transactionSigner || !activeAddress) {
      openToast({
        type: "error",
        message: "Please connect your wallet to execute buyout",
        description: null,
      });
      return;
    }

    if (!position) {
      openToast({
        type: "error",
        message: "Position data not available",
        description: null,
      });
      return;
    }

    if (!market) {
      openToast({
        type: "error",
        message: "Market data not available",
        description: null,
      });
      return;
    }

    setIsExecutingBuyout(true);

    try {
      console.log("Execute buyout for position:", position.id);
      
      // Check if debt token is ALGO (baseTokenId = 0) or ASA
      const isAlgoDebt = position.debtToken.id === "0";
      
      // Get IDs from market data
      const marketAppId = parseInt(position.marketId);
      const oracleAppId = market.oracleAppId;
      const buyoutTokenId = market.buyoutTokenId;
      
      // Get LST app ID from accepted collateral data
      let lstAppId = 0;
      
      try {
        // Get accepted collateral data to find the LST app ID (originatingAppId)
        const acceptedCollaterals = await getAcceptedCollateral(
          activeAddress,
          marketAppId,
          transactionSigner
        );
        
        // Find the collateral that matches our position's collateral token
        const collateralTokenId = BigInt(position.collateralToken.id);
        for (const [, collateral] of acceptedCollaterals.entries()) {
          if (collateral.assetId === collateralTokenId) {
            lstAppId = Number(collateral.originatingAppId);
            console.log("Found LST app ID:", lstAppId, "for collateral token:", collateralTokenId);
            break;
          }
        }
        
        if (lstAppId === 0) {
          console.warn("Could not find LST app ID for collateral token:", collateralTokenId);
        }
      } catch (error) {
        console.warn("Failed to get accepted collateral data:", error);
        // Continue with lstAppId = 0, the transaction might still work
      }
      
      let txId: string;
      
      if (isAlgoDebt) {
        console.log("Executing ALGO buyout method");
        
        txId = await buyoutSplitAlgo({
          buyerAddress: activeAddress,
          debtorAddress: position.userAddress,
          appId: marketAppId,
          premiumAmount: position.buyoutPremiumTokens,
          debtRepayAmount: position.buyoutDebtRepaymentTokens * 1e6, // Convert to microAlgos
          xUSDAssetId: buyoutTokenId,
          collateralTokenId: parseInt(position.collateralToken.id),
          lstAppId,
          oracleAppId,
          signer: transactionSigner,
        });
      } else {
        console.log("Executing ASA buyout method");
        
        txId = await buyoutSplitASA({
          buyerAddress: activeAddress,
          debtorAddress: position.userAddress,
          appId: marketAppId,
          premiumAmount: position.buyoutPremiumTokens,
          debtRepayAmount: position.buyoutDebtRepaymentTokens,
          xUSDAssetId: buyoutTokenId,
          baseTokenAssetId: parseInt(position.debtToken.id),
          collateralTokenId: parseInt(position.collateralToken.id),
          lstAppId,
          oracleAppId,
          signer: transactionSigner,
        });
      }
      
      openToast({
        type: "success",
        message: "Buyout successful! Transaction ID: " + txId,
        description: null,
      });
      console.log("Buyout transaction completed:", txId);
      
    } catch (error) {
      console.error("Buyout failed:", error);
      openToast({
        type: "error",
        message: "Buyout failed: " + (error instanceof Error ? error.message : 'Unknown error'),
        description: null,
      });
    } finally {
      setIsExecutingBuyout(false);
    }
  };

  return (
    <AppLayout title={`Mercury Trading Post`}>
      <div className="container-section py-4 md:py-8">
        {/* Header */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/app/marketplace"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm md:text-base group"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-150" />
              <span className="uppercase tracking-wide">
                Back to Mercury Trading Post
              </span>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold mb-4 text-white tracking-tight">
            DEBT POSITION
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl font-mono leading-relaxed">
            Review and execute transactions on this debt position with detailed
            metrics and secure orbital transaction processing.
          </p>
        </motion.div>

        {/* Position Details Grid */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Position Info */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="p-4 md:p-6 border-b border-slate-600">
                <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  POSITION OVERVIEW
                </h2>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                {/* User & Health Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* User avatar or default icon */}
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border border-slate-500 overflow-hidden">
                      {nfdAvatar ? (
                        <img
                          src={nfdAvatar}
                          alt="NFD Avatar"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>

                    {/* Display name and address */}
                    <div className="flex flex-col">
                      <span className="font-mono text-slate-300 text-lg font-semibold">
                        {formatDisplayName(position.userAddress)}
                      </span>
                      {nfdName && (
                        <span className="font-mono text-slate-500 text-sm">
                          {formatAddress(position.userAddress)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-lg border ${healthStatus.borderColor} ${healthStatus.bgColor} flex items-center gap-2`}
                  >
                    <HealthIcon className={`w-4 h-4 ${healthStatus.color}`} />
                    <span
                      className={`font-mono font-semibold ${healthStatus.color}`}
                    >
                      {healthStatus.status}
                    </span>
                  </div>
                </div>

                {/* Token Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">
                      Debt Token
                    </h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={getTokenImage(position.debtToken.symbol)}
                          alt={position.debtToken.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-mono font-bold text-xl text-white">
                          {position.debtToken.symbol}
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {position.debtToken.name}
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        ID: {position.debtToken.id}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">
                      Collateral Token
                    </h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={getTokenImage(position.collateralToken.symbol)}
                          alt={position.collateralToken.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-mono font-bold text-xl text-white">
                          {position.collateralToken.symbol}
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {position.collateralToken.name}
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        ID: {position.collateralToken.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">
                      Debt Amount
                    </h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={getTokenImage(position.debtToken.symbol)}
                          alt={position.debtToken.symbol}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-mono font-bold text-2xl text-red-400">
                          {formatNumber(position.totalDebt)}
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {position.debtToken.symbol}
                      </div>
                      <div className="font-mono font-semibold text-lg text-slate-300 mt-2">
                        ${formatUSD(position.totalDebtUSD)}
                      </div>
                      <div className="text-slate-400 text-xs">USD Value</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">
                      Collateral Value
                    </h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={getTokenImage(position.collateralToken.symbol)}
                          alt={position.collateralToken.symbol}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-mono font-bold text-2xl text-cyan-400">
                          {formatNumber(position.totalCollateralTokens)}
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {position.collateralToken.symbol}
                      </div>
                      <div className="font-mono font-semibold text-lg text-slate-300 mt-2">
                        ${formatUSD(position.totalCollateral)}
                      </div>
                      <div className="text-slate-400 text-xs">USD Value</div>
                    </div>
                  </div>
                </div>

                {/* Health Metrics */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">
                      Current Health Ratio
                    </h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div
                        className={`font-mono font-bold text-2xl ${healthStatus.color}`}
                      >
                        {formatNumber(position.healthRatio, 3)}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Position Health
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">
                      Current Collateral Price
                    </h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={getTokenImage(position.collateralToken.symbol)}
                          alt={position.collateralToken.symbol}
                          className="w-5 h-5 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-mono font-bold text-2xl text-white">
                          $
                          {position.currentCollateralPrice
                            ? formatUSD(position.currentCollateralPrice)
                            : "N/A"}
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">Market Price</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">
                      Liquidation Price
                    </h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="font-mono font-bold text-2xl text-slate-300">
                        $
                        {position.liquidationPrice
                          ? formatUSD(position.liquidationPrice)
                          : "N/A"}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Liquidation Trigger
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transaction Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="p-4 md:p-6 border-b border-slate-600">
                <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <span>ACTION</span>{" "}
                </h2>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                {/* Cost/Bonus Display */}
                {isLiquidationZone ? (
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">
                      Liquidation Bonus
                    </h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="font-mono font-bold text-2xl text-white">
                        {market?.liqBonusBps 
                          ? formatNumber(market.liqBonusBps / 100, 1) 
                          : formatNumber(position.liquidationBonus, 1)}%
                      </div>
                      <div className="text-slate-400 text-sm">
                        Liquidation Discount
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm">
                      Buyout Breakdown
                    </h3>
                    
                    {/* Debt Repayment */}
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={getTokenImage(position.debtToken.symbol)}
                          alt={position.debtToken.symbol}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-mono font-bold text-lg text-red-400">
                          {formatNumber(position.buyoutDebtRepaymentTokens)} {position.debtToken.symbol}
                        </div>
                      </div>
                      <div className="font-mono font-semibold text-slate-300">
                        ${formatUSD(position.buyoutDebtRepayment)}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Debt Repayment
                      </div>
                    </div>
                    
                    {/* Premium */}
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src="/xUSDt.svg"
                          alt="xUSDt"
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-mono font-bold text-lg text-amber-400">
                          {formatNumber(position.buyoutPremiumTokens)} xUSDt
                        </div>
                      </div>
                      <div className="font-mono font-semibold text-slate-300">
                        ${formatUSD(position.buyoutPremium)}
                      </div>
                      <div className="text-slate-400 text-sm mb-2">
                        Buyout Premium
                      </div>
                      <div className="text-slate-500 text-xs">
                        50% goes to borrower, 50% to protocol
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="bg-slate-600 rounded-lg p-4 border border-cyan-500/30">
                      <div className="font-mono font-bold text-2xl text-cyan-400">
                        ${formatUSD(position.buyoutCost)}
                      </div>
                      <div className="text-slate-300 text-sm font-semibold">
                        Total Buyout Cost
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={isLiquidationZone ? handleLiquidate : handleBUYOUT}
                  disabled={isExecutingBuyout}
                  className={`w-full py-4 border text-white rounded-lg font-mono text-lg font-semibold transition-all duration-150 flex items-center justify-center gap-3 ${
                    isLiquidationZone
                      ? "bg-red-600 border-red-500 hover:bg-red-500 disabled:bg-red-400 disabled:border-red-400"
                      : "bg-cyan-600 border-cyan-500 hover:bg-cyan-500 disabled:bg-cyan-400 disabled:border-cyan-400"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  {isExecutingBuyout ? (
                    <>
                      <MomentumSpinner size="20" speed="1.2" color="#ffffff" />
                      <span>EXECUTING...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      <span>
                        {isLiquidationZone
                          ? "LIQUIDATE POSITION"
                          : "BUYOUT POSITION"}
                      </span>
                    </>
                  )}
                </button>

                {/* Transaction Details */}
                <div className="bg-slate-800/50 rounded-lg p-4 text-sm font-mono">
                  <div className="text-slate-400 mb-2">Transaction will:</div>
                  <ul className="space-y-1 text-slate-300">
                    {isLiquidationZone ? (
                      <>
                        <li>• Liquidate debt position</li>
                        <li>• Repay full debt amount</li>
                        <li>• Claim collateral at discount</li>
                      </>
                    ) : (
                      <>
                        <li>• Buyout debt position</li>
                        <li>• Repay debt: {formatNumber(position.buyoutDebtRepaymentTokens)} {position.debtToken.symbol} (${formatUSD(position.buyoutDebtRepayment)})</li>
                        <li>• Pay premium: {formatNumber(position.buyoutPremiumTokens)} xUSDt (${formatUSD(position.buyoutPremium)})</li>
                        <li>• Receive collateral: {formatNumber(position.totalCollateralTokens)} {position.collateralToken.symbol} (${formatUSD(position.totalCollateral)})</li>
                      </>
                    )}
                    <li>• Execute atomic smart contract transaction</li>
                    <li>• Remove position from marketplace</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DebtPositionDetailPage;
