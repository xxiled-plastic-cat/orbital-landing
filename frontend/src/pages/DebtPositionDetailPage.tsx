import React, { useState, useContext, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  AlertTriangle,
  Shield,
  TrendingDown,
  Target,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "../components/app/AppLayout";
import { useOptimizedDebtPosition } from "../hooks/useOptimizedLoanRecords";
import { useNFD } from "../hooks/useNFD";
import { useMarket } from "../hooks/useMarkets";
import MomentumSpinner from "../components/MomentumSpinner";
import LiquidationActionDrawer from "../components/app/LiquidationActionDrawer";
import { buyoutSplitASA, buyoutSplitAlgo, liquidatePartialAlgo, liquidatePartialASA } from "../contracts/lending/user";
import { getAcceptedCollateral } from "../contracts/lending/state";
import { useWallet } from "@txnlab/use-wallet-react";
import { useToast } from "../context/toastContext";
import { WalletContext } from "../context/wallet";
import { DebtPosition } from "../types/lending";

const DebtPositionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeAddress, transactionSigner } = useWallet();
  const { openToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isExecutingBuyout, setIsExecutingBuyout] = useState(false);
  const [liquidationAmount, setLiquidationAmount] = useState<string>("");

  // Get user's wallet balances
  const { algoBalance, userAssets, isLoadingAssets } = useContext(WalletContext);

  // Use optimized pricing system with fixed LST market lookup
  const { data: position, isLoading, error } = useOptimizedDebtPosition(id || "");

  // Fetch market data to get buyoutTokenId, oracleAppId, etc.
  const { data: market } = useMarket(position?.marketId || "");

  // Calculate user's balance for the debt token
  const userDebtTokenBalance = useMemo(() => {
    if (!position || isLoadingAssets) return null;
    
    const debtTokenId = position.debtToken.id;
    
    // Check if it's ALGO (id === "0")
    if (debtTokenId === "0") {
      return algoBalance ? (parseFloat(algoBalance) / 1e6).toString() : "0";
    }
    
    // Find the asset in user's assets
    const asset = userAssets?.assets.find(a => a.assetId === debtTokenId);
    return asset ? (parseFloat(asset.balance) / 1e6).toString() : "0";
  }, [position, userAssets, algoBalance, isLoadingAssets]);

  // Calculate user's balance for the premium token (buyout token, typically xUSD)
  const userPremiumTokenBalance = useMemo(() => {
    if (!market || isLoadingAssets) return null;
    
    const buyoutTokenId = market.buyoutTokenId?.toString();
    if (!buyoutTokenId) return null;
    
    // Check if it's ALGO (id === "0")
    if (buyoutTokenId === "0") {
      return algoBalance ? (parseFloat(algoBalance) / 1e6).toString() : "0";
    }
    
    // Find the asset in user's assets
    const asset = userAssets?.assets.find(a => a.assetId === buyoutTokenId);
    return asset ? (parseFloat(asset.balance) / 1e6).toString() : "0";
  }, [market, userAssets, algoBalance, isLoadingAssets]);

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
    // liquidationThreshold parameter should be the inverted LTV (e.g., 1/0.90 = 1.111)
    // healthRatio is collateralValueUSD / debtValueUSD
    // Liquidation occurs when healthRatio <= liquidationThreshold
    
    // Healthy: significantly above liquidation threshold (20%+ buffer above liquidation point)
    if (healthRatio >= liquidationThreshold * 1.2) {
      return {
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        borderColor: "border-green-400",
        status: "HEALTHY",
        icon: Shield,
      };
    } 
    // Nearing liquidation: above liquidation point but not healthy (0-20% buffer)
    else if (healthRatio > liquidationThreshold) {
      return {
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        borderColor: "border-amber-400",
        status: "NEARING LIQUIDATION",
        icon: AlertTriangle,
      };
    } 
    // Liquidation zone: at or below actual liquidation threshold (ACTUALLY LIQUIDATABLE)
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

  // The liquidation threshold needs proper interpretation
  // position.liquidationThreshold is stored as a decimal (e.g., 0.85 for 85% LTV)
  // This represents the maximum debt-to-collateral ratio before liquidation
  // So liquidation occurs when: debt/collateral >= 0.85
  // Since healthRatio = collateral/debt, liquidation occurs when: healthRatio <= 1/0.85
  const actualLiquidationThreshold = position.liquidationThreshold > 0 ? 1 / position.liquidationThreshold : 1.2;
  
  const healthStatus = getHealthStatus(position.healthRatio, actualLiquidationThreshold);
  const HealthIcon = healthStatus.icon;
  const isLiquidationZone = position.healthRatio <= actualLiquidationThreshold;
  
  // Debug logging - please check console to verify thresholds
  console.log("=== LIQUIDATION ZONE DEBUG ===");
  console.log("Raw position.liquidationThreshold value:", position.liquidationThreshold);
  console.log("  (should be 0.90 for 90% liquidation, 0.85 for 85%, etc.)");
  console.log("Health Ratio (collateral/debt):", position.healthRatio);
  console.log("Calculated actualThreshold (1/LTV):", actualLiquidationThreshold);
  console.log("  Healthy if health >=", actualLiquidationThreshold * 1.2);
  console.log("  Nearing if health >", actualLiquidationThreshold, "but <", actualLiquidationThreshold * 1.2);
  console.log("  Liquidatable if health <=", actualLiquidationThreshold);
  console.log("Is Liquidation Zone:", isLiquidationZone);
  console.log("Health Status Label:", healthStatus.status);
  console.log("Market data:", market ? `LTV=${market.ltv}, LiqThreshold=${market.liquidationThreshold}` : "not loaded");
  console.log("==============================");

  const handleLiquidate = async () => {
    // Calculate values needed for transaction
    const liveDebt = position.totalDebt;
    const liveDebtUSD = position.totalDebtUSD;
    const totalCollateralUSD = position.totalCollateral;
    const isBadDebtScenario = liveDebtUSD > totalCollateralUSD;
    
    const parsedLiquidationAmount = isBadDebtScenario 
      ? liveDebt 
      : (liquidationAmount ? parseFloat(liquidationAmount) : liveDebt);
    
    const requestedRepayAmount = isBadDebtScenario 
      ? liveDebt
      : Math.min(Math.max(0, parsedLiquidationAmount), liveDebt);
    
    // Add 0.1% buffer for full repayments (when repaying the full debt)
    const isFullRepayment = requestedRepayAmount >= liveDebt * 0.999; // Account for floating point precision
    const BUFFER_PERCENT = 0.001; // 0.1%
    const bufferedRepayAmount = isFullRepayment 
      ? requestedRepayAmount * (1 + BUFFER_PERCENT)
      : requestedRepayAmount;
    
    const liveDebtBaseUnits = liveDebt;
    if (!transactionSigner || !activeAddress) {
      openToast({
        type: "error",
        message: "Please connect your wallet to execute liquidation",
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

    setIsExecutingBuyout(true); // Reusing the same loading state

    try {
      console.log("Execute liquidation for position:", position.id);
      
      // Check if debt token is ALGO (baseTokenId = 0) or ASA
      const isAlgoDebt = position.debtToken.id === "0";
      
      // Get IDs from market data
      const marketAppId = parseInt(position.marketId);
      const oracleAppId = market.oracleAppId;
      
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
      
      // Use the buffered repayment amount for full repayments, otherwise use requested amount
      const partialRepayAmount = bufferedRepayAmount;
      
      let txId: string;
      let attemptedFullRepay = false;
      
      if (isAlgoDebt) {
        console.log("Attempting ALGO partial liquidation...");
        console.log("  Partial amount:", partialRepayAmount, "ALGO");
        console.log("  Live debt:", liveDebtBaseUnits, "ALGO");
        
        try {
          // First attempt: partial liquidation
          const partialAmountMicroAlgos = Math.floor(partialRepayAmount * 1e6);
          
          txId = await liquidatePartialAlgo({
            liquidatorAddress: activeAddress,
            debtorAddress: position.userAddress,
            appId: marketAppId,
            repayAmount: partialAmountMicroAlgos,
            collateralTokenId: parseInt(position.collateralToken.id),
            lstAppId,
            oracleAppId,
            signer: transactionSigner,
          });
          
          console.log("Partial liquidation succeeded");
        } catch (error: unknown) {
          console.log("Partial liquidation error:", error);
          
          // Check if the error is FULL_REPAY_REQUIRED
          const errorMessage = (error as Error)?.message || String(error);
          if (errorMessage.includes("FULL_REPAY_REQUIRED")) {
            console.log("FULL_REPAY_REQUIRED detected - retrying with full debt repayment");
            attemptedFullRepay = true;
            
            // Retry with full debt amount + 0.1% buffer
            const fullRepayWithBuffer = liveDebtBaseUnits * (1 + BUFFER_PERCENT);
            const fullRepayMicroAlgos = Math.floor(fullRepayWithBuffer * 1e6);
            
            txId = await liquidatePartialAlgo({
              liquidatorAddress: activeAddress,
              debtorAddress: position.userAddress,
              appId: marketAppId,
              repayAmount: fullRepayMicroAlgos,
              collateralTokenId: parseInt(position.collateralToken.id),
              lstAppId,
              oracleAppId,
              signer: transactionSigner,
            });
            
            console.log("Full debt repayment liquidation succeeded");
          } else {
            // Re-throw if it's a different error
            throw error;
          }
        }
      } else {
        console.log("Attempting ASA partial liquidation...");
        console.log("  Partial amount:", partialRepayAmount, position.debtToken.symbol);
        console.log("  Live debt:", liveDebtBaseUnits, position.debtToken.symbol);
        
        try {
          // First attempt: partial liquidation
          txId = await liquidatePartialASA({
            liquidatorAddress: activeAddress,
            debtorAddress: position.userAddress,
            appId: marketAppId,
            repayAmount: partialRepayAmount, // Will be scaled to micro units in the function
            baseTokenAssetId: parseInt(position.debtToken.id),
            collateralTokenId: parseInt(position.collateralToken.id),
            lstAppId,
            oracleAppId,
            baseTokenDecimals: market?.baseTokenDecimals ?? 6,
            signer: transactionSigner,
          });
          
          console.log("Partial liquidation succeeded");
        } catch (error: unknown) {
          console.log("Partial liquidation error:", error);
          
          // Check if the error is FULL_REPAY_REQUIRED
          const errorMessage = (error as Error)?.message || String(error);
          if (errorMessage.includes("FULL_REPAY_REQUIRED")) {
            console.log("FULL_REPAY_REQUIRED detected - retrying with full debt repayment");
            attemptedFullRepay = true;
            
            // Retry with full debt amount + 0.1% buffer
            const fullRepayWithBuffer = liveDebtBaseUnits * (1 + BUFFER_PERCENT);
            
            txId = await liquidatePartialASA({
              liquidatorAddress: activeAddress,
              debtorAddress: position.userAddress,
              appId: marketAppId,
              repayAmount: fullRepayWithBuffer, // Full debt + buffer in base units
              baseTokenAssetId: parseInt(position.debtToken.id),
              collateralTokenId: parseInt(position.collateralToken.id),
              lstAppId,
              oracleAppId,
              baseTokenDecimals: market?.baseTokenDecimals ?? 6,
              signer: transactionSigner,
            });
            
            console.log("Full debt repayment liquidation succeeded");
          } else {
            // Re-throw if it's a different error
            throw error;
          }
        }
      }
      
      // Show appropriate success message based on liquidation type
      const successMessage = attemptedFullRepay
        ? `Full liquidation successful! Repaid entire ${formatNumber(liveDebtBaseUnits)} ${position.debtToken.symbol} debt and seized all remaining collateral.`
        : `Partial liquidation successful! Repaid ${formatNumber(partialRepayAmount)} ${position.debtToken.symbol}.`;
      
      openToast({
        type: "success",
        message: successMessage,
        description: `Transaction ID: ${txId}`,
      });
      console.log("Liquidation transaction completed:", txId);
      console.log("  Type:", attemptedFullRepay ? "Full repayment" : "Partial liquidation");
      
      // Optimistic update: Remove the position from the cache immediately
      queryClient.setQueryData<DebtPosition[]>(
        ['optimized-debt-positions'],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter(p => p.id !== position.id);
        }
      );
      
      // Trigger refetch and wait for it to complete before navigating
      await queryClient.refetchQueries({
        queryKey: ['optimized-debt-positions'],
      });
      
      // Navigate back to marketplace after successful liquidation
      setTimeout(() => {
        navigate("/app/marketplace");
      }, 1500); // Small delay to allow user to see success message
      
    } catch (error) {
      console.error("Liquidation failed:", error);
      openToast({
        type: "error",
        message: "Liquidation failed: " + (error instanceof Error ? error.message : 'Unknown error'),
        description: null,
      });
    } finally {
      setIsExecutingBuyout(false);
    }
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
      
      // Add 5% buffer to premium to account for potential debt changes at buyout time
      // Any excess will be returned to the buyer
      const bufferedPremiumAmount = Math.ceil(position.buyoutPremiumTokens * 1.05);
      
      let txId: string;
      
      if (isAlgoDebt) {
        console.log("Executing ALGO buyout method");
        
        txId = await buyoutSplitAlgo({
          buyerAddress: activeAddress,
          debtorAddress: position.userAddress,
          appId: marketAppId,
          premiumAmount: bufferedPremiumAmount,
          debtRepayAmount: position.buyoutDebtRepaymentTokens * 1e6, // Convert to microAlgos
          xUSDAssetId: buyoutTokenId,
          collateralTokenId: parseInt(position.collateralToken.id),
          lstAppId,
          oracleAppId,
          premiumTokenDecimals: 6, // xUSD typically has 6 decimals
          signer: transactionSigner,
        });
      } else {
        console.log("Executing ASA buyout method");
        
        txId = await buyoutSplitASA({
          buyerAddress: activeAddress,
          debtorAddress: position.userAddress,
          appId: marketAppId,
          premiumAmount: bufferedPremiumAmount,
          debtRepayAmount: position.buyoutDebtRepaymentTokens,
          xUSDAssetId: buyoutTokenId,
          baseTokenAssetId: parseInt(position.debtToken.id),
          collateralTokenId: parseInt(position.collateralToken.id),
          lstAppId,
          oracleAppId,
          premiumTokenDecimals: 6, // xUSD typically has 6 decimals
          baseTokenDecimals: market?.baseTokenDecimals ?? 6,
          signer: transactionSigner,
        });
      }
      
      openToast({
        type: "success",
        message: "Buyout successful!",
        description: `Transaction ID: ${txId}`,
      });
      console.log("Buyout transaction completed:", txId);
      
      // Optimistic update: Remove the position from the cache immediately
      queryClient.setQueryData<DebtPosition[]>(
        ['optimized-debt-positions'],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter(p => p.id !== position.id);
        }
      );
      
      // Trigger refetch and wait for it to complete before navigating
      await queryClient.refetchQueries({
        queryKey: ['optimized-debt-positions'],
      });
      
      // Navigate back to marketplace after successful buyout
      setTimeout(() => {
        navigate("/app/marketplace");
      }, 1500); // Small delay to allow user to see success message
      
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
      <div className="container-section py-4 md:py-8 pb-24 lg:pb-8">
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

          {/* Transaction Panel / Drawer */}
          <LiquidationActionDrawer
            position={position}
            market={market}
            isExecuting={isExecutingBuyout}
            liquidationAmount={liquidationAmount}
            setLiquidationAmount={setLiquidationAmount}
            onLiquidate={handleLiquidate}
            onBuyout={handleBUYOUT}
            userDebtTokenBalance={userDebtTokenBalance}
            userPremiumTokenBalance={userPremiumTokenBalance}
            isLoadingBalance={isLoadingAssets}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default DebtPositionDetailPage;
