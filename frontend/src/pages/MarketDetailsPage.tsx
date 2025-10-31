/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Info,
  Copy,
  CheckCircle,
  AlertCircle,
  Radio,
  BarChart3,
} from "lucide-react";
import AppLayout from "../components/app/AppLayout";
import InterestRateModel from "../components/InterestRateModel";
import CollateralRelationships from "../components/CollateralRelationships";
import ActionDrawer from "../components/app/ActionDrawer";
import PositionHeader from "../components/app/PositionHeader";
import MomentumSpinner from "../components/MomentumSpinner";
import Tooltip from "../components/Tooltip";
import { useMarket, useRefetchMarkets, useMarkets } from "../hooks/useMarkets";
import { useInvalidateUserAssets } from "../hooks/useAssets";
import { WalletContext } from "../context/wallet";
import { useToast } from "../context/toastContext";
import {
  borrow,
  depositAlgo,
  depositAsa,
  getLoanRecordBoxValue,
  repayDebtAlgo,
  repayDebtAsa,
  withdraw,
  withdrawCollateral,
} from "../contracts/lending/user";
import { getLoanRecordReturnType } from "../contracts/lending/interface";
import { useWallet } from "@txnlab/use-wallet-react";
import {
  calculateAssetDue,
  calculateLSTDue,
  getAcceptedCollateral,
  getDepositBoxValue,
} from "../contracts/lending/state";
import { recordUserAction } from "../services/userStats";
import { useNetwork } from "../context/networkContext";
import { ExplorerLinks } from "../components/app/explorerlinks";
import { calculateRealTimeBorrowAPR } from "../utils/interestRateCalculations";

// Helper component to display network name
const NetworkDisplay = () => {
  const { isTestnet } = useNetwork();
  return (
    <span className="font-mono text-white text-sm">
      Algorand {isTestnet ? 'Testnet' : 'Mainnet'}
    </span>
  );
};

const MarketDetailsPage = () => {
  const [searchParams] = useSearchParams();
  const marketId = searchParams.get("id");
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [acceptedCollateral, setAcceptedCollateral] = useState<
    Map<any, any> | undefined
  >(undefined);

  // User debt state management
  const [userDebt, setUserDebt] = useState<getLoanRecordReturnType | undefined>(
    undefined
  );

  // User deposit record state management
  const [userDepositRecord, setUserDepositRecord] = useState<{
    assetId: bigint;
    depositAmount: bigint;
  } | null>(null);

  // Ref to track the last fetched collateral combination to prevent unnecessary calls
  const lastFetchedRef = useRef<string | null>(null);

  const { data: market, isLoading, error, isError } = useMarket(marketId || "");
  const { data: allMarkets } = useMarkets();
  const {
    algoBalance,
    userAssets,
    isLoadingAssets,
    applyOptimisticBalanceUpdate,
  } = useContext(WalletContext);
  const { openToast } = useToast();
  const { activeAddress, transactionSigner } = useWallet();
  const refetchMarkets = useRefetchMarkets();
  const invalidateUserAssets = useInvalidateUserAssets();

  // Function to refetch user debt
  const refetchUserDebt = async () => {
    if (market && activeAddress && transactionSigner) {
      try {
        const debtRecord = await getLoanRecordBoxValue({
          address: activeAddress,
          appId: Number(market.id),
          signer: transactionSigner,
        });
        setUserDebt(debtRecord);
      } catch (error) {
        console.log("No debt record found for user:", error);
        setUserDebt(undefined);
      }
    }
  };

  // Function to refetch user deposit record
  const refetchUserDepositRecord = async () => {
    if (market && activeAddress && transactionSigner) {
      try {
        const { getExistingClient, getExistingClientAsa } = await import("../contracts/lending/getClient");
        
        const appClient = market.baseTokenId === "0"
          ? await getExistingClient(transactionSigner, activeAddress, Number(market.id))
          : await getExistingClientAsa(transactionSigner, activeAddress, Number(market.id));
        
        const depositRecord = await getDepositBoxValue(
          activeAddress,
          appClient as any, // Type assertion needed as getDepositBoxValue expects OrbitalLendingClient
          BigInt(market.baseTokenId)
        );
        console.log("Deposit record:", depositRecord);
        setUserDepositRecord(depositRecord);
      } catch (error) {
        console.log("No deposit record found for user:", error);
        setUserDepositRecord(null);
      }
    }
  };

  useEffect(() => {
    if (!isLoading && !market && marketId) {
      navigate("/app/markets");
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

  // Fetch user debt information
  useEffect(() => {
    const fetchUserDebt = async () => {
      if (market && activeAddress && transactionSigner) {
        try {
          const debtRecord = await getLoanRecordBoxValue({
            address: activeAddress,
            appId: Number(market.id),
            signer: transactionSigner,
          });
          console.log("Debt record:", debtRecord);
          setUserDebt(debtRecord);
        } catch (error) {
          console.log("No debt record found for user:", error);
          setUserDebt(undefined);
        }
      } else {
        setUserDebt(undefined);
      }
    };

    fetchUserDebt();
  }, [market, activeAddress]);

  // Fetch user deposit record information
  useEffect(() => {
    const fetchUserDepositRecord = async () => {
      if (market && activeAddress && transactionSigner) {
        try {
          const { getExistingClient, getExistingClientAsa } = await import("../contracts/lending/getClient");
          
          const appClient = market.baseTokenId === "0"
            ? await getExistingClient(transactionSigner, activeAddress, Number(market.id))
            : await getExistingClientAsa(transactionSigner, activeAddress, Number(market.id));
          
          const depositRecord = await getDepositBoxValue(
            activeAddress,
            appClient as any, // Type assertion needed as getDepositBoxValue expects OrbitalLendingClient
            BigInt(market.baseTokenId)
          );
          console.log("Deposit record:", depositRecord);
          setUserDepositRecord(depositRecord);
        } catch (error) {
          console.log("No deposit record found for user:", error);
          setUserDepositRecord(null);
        }
      } else {
        setUserDepositRecord(null);
      }
    };

    fetchUserDepositRecord();
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
      if (market?.baseTokenId === "0") {
        await depositAlgo({
          address: activeAddress as string,
          amount: Number(amount),
          appId: Number(market?.id),
          depositAssetId: Number(market?.baseTokenId),
          lstAssetId: Number(market?.lstTokenId),
          signer: transactionSigner,
        })
          .then((txId) => {
            // Apply optimistic updates for instant UI feedback
            applyOptimisticBalanceUpdate(
              baseTokenId,
              `-${depositAmountMicrounits}`
            );
            if (lstTokenId) {
              applyOptimisticBalanceUpdate(lstTokenId, depositAmountMicrounits);
            }

            // Invalidate queries to trigger background refetch
            // This will fetch real blockchain data and auto-clear optimistic updates
            invalidateUserAssets();
            refetchMarkets();

            // Refetch user debt and deposit data
            refetchUserDebt();
            refetchUserDepositRecord();

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
      } else {
        await depositAsa({
          address: activeAddress as string,
          amount: Number(amount),
          appId: Number(market?.id),
          depositAssetId: Number(market?.baseTokenId),
          lstAssetId: Number(market?.lstTokenId),
          signer: transactionSigner,
        })
          .then((txId) => {
            // Apply optimistic updates for instant UI feedback
            applyOptimisticBalanceUpdate(
              baseTokenId,
              `-${depositAmountMicrounits}`
            );
            if (lstTokenId) {
              applyOptimisticBalanceUpdate(lstTokenId, depositAmountMicrounits);
            }

            // Invalidate queries to trigger background refetch
            // This will fetch real blockchain data and auto-clear optimistic updates
            invalidateUserAssets();
            refetchMarkets();

            // Refetch user debt and deposit data
            refetchUserDebt();
            refetchUserDepositRecord();

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
      }
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
          // Apply optimistic updates for instant UI feedback
          if (lstTokenId) {
            applyOptimisticBalanceUpdate(
              lstTokenId,
              `-${redeemAmountMicrounits}`
            );
          }
          applyOptimisticBalanceUpdate(baseTokenId, redeemAmountMicrounits);

          // Invalidate queries to trigger background refetch
          invalidateUserAssets();
          refetchMarkets();

          // Refetch user debt and deposit data
          refetchUserDebt();
          refetchUserDepositRecord();

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

  const handleRepay = async (repayAmount: string) => {
    console.log("Repay:", { repayAmount });
    openToast({
      type: "loading",
      message: "Repaying...",
      description: `Please sign the transaction to repay ${repayAmount} ${getBaseTokenSymbol(
        market?.symbol
      )}`,
    });

    if (market?.baseTokenId == "0") {
      await repayDebtAlgo({
        address: activeAddress as string,
        amount: Number(repayAmount),
        appId: Number(market?.id),
        lstTokenId: Number(market?.lstTokenId),
        signer: transactionSigner,
      })
        .then((txId) => {
          // Apply optimistic updates for instant UI feedback
          const repayAmountMicrounits = (
            Number(repayAmount) * Math.pow(10, 6)
          ).toString();
          const baseTokenId = market?.baseTokenId || "0";

          // Remove repaid tokens from user balance
          applyOptimisticBalanceUpdate(
            baseTokenId,
            `-${repayAmountMicrounits}`
          );

          // Invalidate queries to trigger background refetch
          invalidateUserAssets();
          refetchMarkets();

          openToast({
            type: "success",
            message: "Repay successful",
            description: `You have repaid ${repayAmount} ${getBaseTokenSymbol(
              market?.symbol
            )}`,
          });
          recordUserAction({
            address: activeAddress as string,
            marketId: Number(market?.id),
            action: "repay",
            tokensOut: Number(repayAmount),
            timestamp: Date.now(),
            txnId: txId,
            tokenInId: Number(market?.baseTokenId),
            tokenOutId: Number(market?.lstTokenId),
            tokensIn: 0,
          });
        })
        .catch((error) => {
          console.error(error);
          openToast({
            type: "error",
            message: "Repay failed",
            description: `Unable to repay ${repayAmount} ${getBaseTokenSymbol(
              market?.symbol
            )}`,
          });
        });
      setTransactionLoading(false);
    } else {
      await repayDebtAsa({
        address: activeAddress as string,
        amount: Number(repayAmount),
        appId: Number(market?.id),
        lstTokenId: Number(market?.lstTokenId),
        repayTokenId: Number(market?.baseTokenId),
        signer: transactionSigner,
      })
        .then((txId) => {
          // Apply optimistic updates for instant UI feedback
          const repayAmountMicrounits = (
            Number(repayAmount) * Math.pow(10, 6)
          ).toString();
          const baseTokenId = market?.baseTokenId || "0";

          // Remove repaid tokens from user balance
          applyOptimisticBalanceUpdate(
            baseTokenId,
            `-${repayAmountMicrounits}`
          );

          // Invalidate queries to trigger background refetch
          invalidateUserAssets();
          refetchMarkets();

          openToast({
            type: "success",
            message: "Repay successful",
            description: `You have repaid ${repayAmount} ${getBaseTokenSymbol(
              market?.symbol
            )}`,
          });
          recordUserAction({
            address: activeAddress as string,
            marketId: Number(market?.id),
            action: "repay",
            tokensOut: Number(repayAmount),
            timestamp: Date.now(),
            txnId: txId,
            tokenInId: Number(market?.baseTokenId),
            tokenOutId: Number(market?.lstTokenId),
            tokensIn: 0,
          });
        })
        .catch((error) => {
          console.error(error);
          openToast({
            type: "error",
            message: "Repay failed",
            description: `Unable to repay ${repayAmount} ${getBaseTokenSymbol(
              market?.symbol
            )}`,
          });
        });
      setTransactionLoading(false);
    }
  };

  const handleWithdrawCollateral = async (
    collateralAssetId: string,
    withdrawAmount: string
  ) => {
    console.log("Withdraw collateral:", { collateralAssetId, withdrawAmount });
    openToast({
      type: "loading",
      message: "Withdrawing collateral...",
      description: `Please sign the transaction to withdraw ${withdrawAmount} ${getBaseTokenSymbol(
        market?.symbol
      )}`,
    });
    await withdrawCollateral({
      address: activeAddress as string,
      amount: Number(withdrawAmount),
      appId: Number(market?.id),
      collateralAssetId: Number(collateralAssetId),
      lstAppId: Number(market?.id),
      signer: transactionSigner,
    })
      .then((txId) => {
        // Apply optimistic updates for instant UI feedback
        const withdrawAmountMicrounits = (
          Number(withdrawAmount) * Math.pow(10, 6)
        ).toString();

        // Add withdrawn collateral tokens back to user balance
        applyOptimisticBalanceUpdate(
          collateralAssetId,
          withdrawAmountMicrounits
        );

        // Invalidate queries to trigger background refetch
        invalidateUserAssets();
        refetchMarkets();

        openToast({
          type: "success",
          message: "Withdraw successful",
          description: `You have withdrawn ${withdrawAmount} ${getBaseTokenSymbol(
            market?.symbol
          )}`,
        });
        recordUserAction({
          address: activeAddress as string,
          marketId: Number(market?.id),
          action: "withdrawCollateral",
          tokensOut: Number(withdrawAmount),
          timestamp: Date.now(),
          txnId: txId,
          tokenInId: Number(collateralAssetId),
          tokenOutId: Number(market?.baseTokenId),
          tokensIn: 0,
        });
      })
      .catch((error) => {
        console.error(error);
        openToast({
          type: "error",
          message: "Withdraw failed",
          description: `Unable to withdraw ${withdrawAmount} ${getBaseTokenSymbol(
            market?.symbol
          )}`,
        });
      });
    setTransactionLoading(false);
  };

  const handleBorrow = async (
    collateralAssetId: string,
    collateralAmount: string,
    borrowAmount: string
  ) => {
    // Check if user has existing debt and is borrowing against existing collateral
    const hasExistingDebt = userDebt && Number(userDebt.principal) > 0;
    const isAddingCollateral =
      collateralAmount && parseFloat(collateralAmount) > 0;

    // If user has existing debt and isn't adding collateral, use existing collateral
    let effectiveCollateralAssetId = collateralAssetId;
    let effectiveCollateralAmount = collateralAmount;

    if (hasExistingDebt && !isAddingCollateral) {
      effectiveCollateralAssetId = userDebt.collateralTokenId.toString();
      effectiveCollateralAmount = "0"; // No new collateral being added
    }

    // Find the market that has the collateral token as its LST token
    const collateralMarket = allMarkets?.find(
      (m) => m.lstTokenId === effectiveCollateralAssetId
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

    const toastDescription = isAddingCollateral
      ? `Please sign the transaction to borrow ${borrowAmount} ${getBaseTokenSymbol(
          market?.symbol
        )} using ${effectiveCollateralAmount} ${getBaseTokenSymbol(
          effectiveCollateralAssetId
        )} as additional collateral`
      : `Please sign the transaction to borrow ${borrowAmount} ${getBaseTokenSymbol(
          market?.symbol
        )} against your existing collateral`;

    openToast({
      type: "loading",
      message: "Borrowing...",
      description: toastDescription,
    });

    await borrow({
      address: activeAddress as string,
      collateralAmount: Number(effectiveCollateralAmount),
      borrowAmount: Number(borrowAmount),
      collateralAssetId: Number(effectiveCollateralAssetId),
      lstAppId: Number(collateralMarket.id), // Use the collateral market's app ID
      appId: Number(market?.id), // Current market we're borrowing from
      oracleAppId: Number(market?.oracleAppId),
      signer: transactionSigner,
    })
      .then((txId) => {
        // Apply optimistic updates for instant UI feedback
        const borrowAmountMicrounits = (
          Number(borrowAmount) * Math.pow(10, 6)
        ).toString();
        const baseTokenId = market?.baseTokenId || "0";

        // Add borrowed tokens to user balance
        applyOptimisticBalanceUpdate(baseTokenId, borrowAmountMicrounits);

        // Only update collateral balance if new collateral is being added
        if (isAddingCollateral) {
          const collateralAmountMicrounits = (
            Number(effectiveCollateralAmount) * Math.pow(10, 6)
          ).toString();

          // Remove collateral tokens from user balance
          applyOptimisticBalanceUpdate(
            effectiveCollateralAssetId,
            `-${collateralAmountMicrounits}`
          );
        }

        // Invalidate queries to trigger background refetch
        invalidateUserAssets();
        refetchMarkets();

        const successDescription = isAddingCollateral
          ? `You have borrowed ${borrowAmount} ${getBaseTokenSymbol(
              market?.symbol
            )} using ${effectiveCollateralAmount} ${getBaseTokenSymbol(
              effectiveCollateralAssetId
            )} as additional collateral`
          : `You have borrowed ${borrowAmount} ${getBaseTokenSymbol(
              market?.symbol
            )} against your existing collateral`;

        openToast({
          type: "success",
          message: "Borrow successful",
          description: successDescription,
        });

        recordUserAction({
          address: activeAddress as string,
          marketId: Number(market?.id),
          action: "borrow",
          tokensOut: Number(borrowAmount),
          tokensIn: Number(effectiveCollateralAmount),
          timestamp: Date.now(),
          txnId: txId,
          tokenInId: Number(effectiveCollateralAssetId),
          tokenOutId: Number(market?.baseTokenId),
        });
      })
      .catch((error) => {
        console.error(error);
        const errorDescription = isAddingCollateral
          ? `Unable to borrow ${borrowAmount} ${getBaseTokenSymbol(
              market?.symbol
            )} using ${effectiveCollateralAmount} ${getBaseTokenSymbol(
              effectiveCollateralAssetId
            )} as additional collateral`
          : `Unable to borrow ${borrowAmount} ${getBaseTokenSymbol(
              market?.symbol
            )} against your existing collateral`;

        openToast({
          type: "error",
          message: "Borrow failed",
          description: errorDescription,
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
              <MomentumSpinner
                size="48"
                speed="1.1"
                color="#06b6d4"
                className="mx-auto mb-4"
              />
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
                onClick={() => navigate("/app/markets")}  
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
      <div className="container-section py-4 md:py-8 pb-24 xl:pb-8">
        {/* Navigation Header */}
        <motion.div
          className="mb-4 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link 
            to="/app/markets"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs sm:text-sm md:text-base group mb-4 md:mb-6"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-150" />
            <span className="uppercase tracking-wide">Back to Markets</span>
          </Link>

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
                <Tooltip content="Loan-to-Value: Max % of collateral value you can borrow" position="bottom">
                  <div className="text-cyan-500 cut-corners-sm px-2 py-1 md:px-4 md:py-2 border border-cyan-500 shadow-inset">
                    <span className="text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wide">
                      LTV {market.ltv}%
                    </span>
                  </div>
                </Tooltip>
                <Tooltip content="Liquidation Threshold: Position liquidated if debt exceeds this %" position="bottom">
                  <div className="text-amber-500 cut-corners-sm px-2 py-1 md:px-4 md:py-2 border border-amber-500 shadow-inset">
                    <span className="text-amber-400 text-xs font-mono font-semibold uppercase tracking-wide">
                      LT {market.liquidationThreshold}%
                    </span>
                  </div>
                </Tooltip>
                <Tooltip 
                  content={market.contractState === 1 ? "Market is active and accepting transactions" : market.contractState === 2 ? "Market is migrating to new version" : "Market is currently inactive"} 
                  position="bottom"
                >
                  <div className="flex items-center gap-1 md:gap-2 text-cyan-400">
                    <Radio className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-xs md:text-sm font-mono font-semibold uppercase tracking-wide">
                      {market.contractState === 1
                        ? "ACTIVE"
                        : market.contractState === 2
                        ? "MIGRATING"
                        : "INACTIVE"}
                    </span>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Position Header */}
        <PositionHeader
          market={market}
          userDepositRecord={userDepositRecord}
          userDebt={userDebt}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content - Takes full width on mobile, 2/3 on desktop */}
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
                  <div className="text-slate-400 text-xs font-mono mb-1 md:mb-2 uppercase tracking-wider flex items-center gap-1">
                    Total Supply
                    <Tooltip content="Total value of all assets deposited in this market" position="top">
                      <Info className="w-3 h-3 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="text-lg md:text-2xl font-mono font-bold text-white tabular-nums">
                    ${market.totalDepositsUSD.toLocaleString()}
                  </div>
                  <div className="text-xs md:text-sm text-slate-500 font-mono">
                    {market.totalDeposits.toFixed(6)} {market.symbol}
                  </div>
                </div>

                <div className="inset-panel cut-corners-sm p-3 md:p-4">
                  <div className="text-slate-400 text-xs font-mono mb-1 md:mb-2 uppercase tracking-wider flex items-center gap-1">
                    Deposit APR
                    <Tooltip content="Annual rate earned by suppliers. Varies with utilization." position="top">
                      <Info className="w-3 h-3 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="text-lg md:text-2xl font-mono font-bold text-cyan-400 tabular-nums">
                    {market.supplyApr.toFixed(2)}%
                  </div>
                </div>

                <div className="inset-panel cut-corners-sm p-3 md:p-4">
                  <div className="text-slate-400 text-xs font-mono mb-1 md:mb-2 uppercase tracking-wider flex items-center gap-1">
                    Borrow APR
                    <Tooltip content="Annual rate charged to borrowers. Increases with utilization." position="top">
                      <Info className="w-3 h-3 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="text-lg md:text-2xl font-mono font-bold text-amber-400 tabular-nums">
                    {calculateRealTimeBorrowAPR(market).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Utilization Track */}
              <div className="mb-4 md:mb-6">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <span className="text-slate-400 text-xs md:text-sm font-mono uppercase tracking-wider flex items-center gap-1">
                    Market Utilization
                    <Tooltip content="% of supplied assets currently borrowed. Higher utilization = higher rates" position="top">
                      <Info className="w-3 h-3 cursor-help" />
                    </Tooltip>
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
                  <Tooltip content="Interest rates accelerate after kink to incentivize supply" position="top">
                    <div className="absolute top-0 left-[50%] h-3.5 w-0.5 bg-yellow-400 opacity-80 transform -translate-x-0.5 rounded-full"></div>
                  </Tooltip>
                  <Tooltip content="Max utilization threshold. No further borrowing at 100%" position="top">
                    <div className="absolute top-0 left-[100%] h-3.5 w-1 bg-red-400 opacity-90 transform -translate-x-1 rounded-full"></div>
                  </Tooltip>
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
                  <span>0%</span>
                  <Tooltip content="Kink point: where interest rate slope increases sharply" position="top">
                    <span className="text-yellow-400">Kink: 50%</span>
                  </Tooltip>
                  <Tooltip content="Utilization cap: maximum % that can be borrowed" position="top">
                    <span className="text-red-400">Cap: 100%</span>
                  </Tooltip>
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
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide flex items-center gap-1">
                      Token ID
                      <Tooltip content="Unique identifier for this market's smart contract" position="right">
                        <Info className="w-3 h-3 cursor-help" />
                      </Tooltip>
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
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide flex items-center gap-1">
                      Decimals
                      <Tooltip content="Token precision: 6 decimals = divide by 1,000,000" position="right">
                        <Info className="w-3 h-3 cursor-help" />
                      </Tooltip>
                    </span>
                    <span className="font-mono text-white text-sm">6</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide flex items-center gap-1">
                      Oracle Price
                      <Tooltip content="Real-time price from oracle used for collateral calculations" position="right">
                        <Info className="w-3 h-3 cursor-help" />
                      </Tooltip>
                    </span>
                    <span className="font-mono text-white text-sm">
                      ${market?.baseTokenPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">
                      Network
                    </span>
                    <NetworkDisplay />
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide flex items-center gap-1">
                      Market Type
                      <Tooltip content="LST Pool: Depositors receive cTokens for their share + interest" position="left">
                        <Info className="w-3 h-3 cursor-help" />
                      </Tooltip>
                    </span>
                    <span className="font-mono text-white text-sm">
                      LST Pool
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">
                      View on Explorer
                    </span>
                    <div className="flex items-center gap-2">
                      <ExplorerLinks appId={Number(market.id)} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Panel - Right Side on Desktop, Drawer on Mobile */}
          <div className="xl:block">
            <ActionDrawer
              market={market}
              userAssets={userAssets || undefined}
              algoBalance={algoBalance}
              isLoadingAssets={isLoadingAssets}
              transactionLoading={transactionLoading}
              acceptedCollateral={acceptedCollateral}
              userDebt={userDebt}
              onDeposit={handleDeposit}
              onRedeem={handleRedeem}
              onBorrow={handleBorrow}
              onRepay={handleRepay}
              onWithdrawCollateral={handleWithdrawCollateral}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MarketDetailsPage;
