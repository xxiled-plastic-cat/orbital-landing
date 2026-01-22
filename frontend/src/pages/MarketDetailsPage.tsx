/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  Radio,
} from "lucide-react";
import AppLayout from "../components/app/AppLayout";
import ActionDrawer from "../components/app/ActionDrawer";
import PositionHeader from "../components/app/PositionHeader";
import MomentumSpinner from "../components/MomentumSpinner";
import Tooltip from "../components/Tooltip";
import TabSelector from "../components/app/TabSelector";
import OverviewTab from "../components/market/OverviewTab";
import CollateralTab from "../components/market/CollateralTab";
import AnalyticsTab from "../components/market/AnalyticsTab";
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
import { BuyOnCompxButton } from "../components/app/BuyOnCompxButton";

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

  // Staking pools state management
  const [stakingPools, setStakingPools] = useState<any[]>([]);
  const [loadingStakingPools, setLoadingStakingPools] = useState(true);

  // Tab state management
  const [activeTab, setActiveTab] = useState<string>("overview");

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

  // Fetch staking pools from CompX API
  useEffect(() => {
    const fetchStakingPools = async () => {
      try {
        setLoadingStakingPools(true);
        const response = await fetch('https://api-general.compx.io/api/staking-pools-v2');
        const data = await response.json();
        setStakingPools(data);
      } catch (error) {
        console.error('Failed to fetch staking pools:', error);
        setStakingPools([]);
      } finally {
        setLoadingStakingPools(false);
      }
    };

    fetchStakingPools();
  }, []);

  const handleDeposit = async (amount: string) => {
    try {
      setTransactionLoading(true);

      const baseTokenDecimals = market?.baseTokenDecimals ?? 6;
      const lstDecimals = market?.lstTokenDecimals ?? 6;
      const depositAmountMicrounits = (
        Number(amount) * Math.pow(10, baseTokenDecimals)
      ).toString();
      const baseTokenId = market?.baseTokenId || "0";
      const lstTokenId = market?.lstTokenId;

      // Calculate expected LST tokens to receive
      const expectedLSTMinted = calculateLSTDue(
        BigInt(Math.floor(Number(amount) * 10 ** baseTokenDecimals)),
        BigInt(Math.floor((market?.circulatingLST ?? 0) * 10 ** lstDecimals)),
        BigInt(Math.floor((market?.totalDeposits ?? 0) * 10 ** baseTokenDecimals))
      );
      const expectedLSTDisplay = (Number(expectedLSTMinted) / 10 ** lstDecimals).toFixed(6).replace(/\.?0+$/, '');

      openToast({
        type: "loading",
        message: "Depositing...",
        description: `Please sign the transaction to deposit ${amount} ${getBaseTokenSymbol(
          market?.symbol
        )} to receive ${expectedLSTDisplay} ${getLSTTokenSymbol(market?.symbol)}`,
      });
      if (market?.baseTokenId === "0") {
        await depositAlgo({
          address: activeAddress as string,
          amount: Number(amount),
          appId: Number(market?.id),
          depositAssetId: Number(market?.baseTokenId),
          lstAssetId: Number(market?.lstTokenId),
          baseTokenDecimals: market?.baseTokenDecimals ?? 6,
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

            // Calculate the actual LST tokens minted for this deposit
            const baseDecimals = market?.baseTokenDecimals ?? 6;
            const lstDecimals = market?.lstTokenDecimals ?? 6;
            const lstMinted = calculateLSTDue(
              BigInt(Math.floor(Number(amount) * 10 ** baseDecimals)),
              BigInt(Math.floor((market?.circulatingLST ?? 0) * 10 ** lstDecimals)),
              BigInt(Math.floor((market?.totalDeposits ?? 0) * 10 ** baseDecimals))
            );
            const lstMintedDisplay = (Number(lstMinted) / 10 ** lstDecimals).toFixed(6).replace(/\.?0+$/, '');

            recordUserAction({
              address: activeAddress as string,
              marketId: Number(market?.id),
              action: "deposit",
              tokensOut: Number(lstMinted) / 10 ** lstDecimals, //LST returned (convert from microunits)
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
              )} and received ${lstMintedDisplay} ${getLSTTokenSymbol(market?.symbol)}!`,
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
          baseTokenDecimals: market?.baseTokenDecimals ?? 6,
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

            // Calculate the actual LST tokens minted for this deposit
            const baseDecimals = market?.baseTokenDecimals ?? 6;
            const lstDecimals = market?.lstTokenDecimals ?? 6;
            const lstMinted = calculateLSTDue(
              BigInt(Math.floor(Number(amount) * 10 ** baseDecimals)),
              BigInt(Math.floor((market?.circulatingLST ?? 0) * 10 ** lstDecimals)),
              BigInt(Math.floor((market?.totalDeposits ?? 0) * 10 ** baseDecimals))
            );
            const lstMintedDisplay = (Number(lstMinted) / 10 ** lstDecimals).toFixed(6).replace(/\.?0+$/, '');

            recordUserAction({
              address: activeAddress as string,
              marketId: Number(market?.id),
              action: "deposit",
              tokensOut: Number(lstMinted) / 10 ** lstDecimals, //LST returned (convert from microunits)
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
              )} and received ${lstMintedDisplay} ${getLSTTokenSymbol(market?.symbol)}!`,
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

      const lstTokenDecimals = market?.lstTokenDecimals ?? 6;
      const baseDecimals = market?.baseTokenDecimals ?? 6;
      const redeemAmountMicrounits = (
        Number(amount) * Math.pow(10, lstTokenDecimals)
      ).toString();
      const baseTokenId = market?.baseTokenId || "0";
      const lstTokenId = market?.lstTokenId;

      // Calculate expected base tokens to receive
      const expectedAssetDue = calculateAssetDue(
        BigInt(Math.floor(Number(amount) * 10 ** lstTokenDecimals)),
        BigInt(Math.floor((market?.circulatingLST ?? 0) * 10 ** lstTokenDecimals)),
        BigInt(Math.floor((market?.totalDeposits ?? 0) * 10 ** baseDecimals))
      );
      const expectedAssetDisplay = (Number(expectedAssetDue) / 10 ** baseDecimals).toFixed(6).replace(/\.?0+$/, '');

      openToast({
        type: "loading",
        message: "Redeeming...",
        description: `Please sign the transaction to redeem ${amount} ${getLSTTokenSymbol(
          market?.symbol
        )} to receive ${expectedAssetDisplay} ${getBaseTokenSymbol(market?.symbol)}`,
      });

      await withdraw({
        address: activeAddress as string,
        amount: Number(amount),
        appId: Number(market?.id),
        signer: transactionSigner,
        lstTokenId: Number(market?.lstTokenId),
        lstTokenDecimals: market?.lstTokenDecimals ?? 6,
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

          const baseDecimals = market?.baseTokenDecimals ?? 6;
          const lstDecimals = market?.lstTokenDecimals ?? 6;
          const asaDue = calculateAssetDue(
            BigInt(Math.floor(Number(amount) * 10 ** lstDecimals)),
            BigInt(Math.floor((market?.circulatingLST ?? 0) * 10 ** lstDecimals)),
            BigInt(Math.floor((market?.totalDeposits ?? 0) * 10 ** baseDecimals))
          );
          const asaDueDisplay = (Number(asaDue) / 10 ** baseDecimals).toFixed(6).replace(/\.?0+$/, '');

          recordUserAction({
            address: activeAddress as string,
            marketId: Number(market?.id),
            action: "redeem",
            tokensOut: Number(amount), //LST returned
            tokensIn: Number(asaDue) / 10 ** baseDecimals, //Base token received (convert from microunits)
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
            )} and received ${asaDueDisplay} ${getBaseTokenSymbol(market?.symbol)}!`,
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
        baseTokenDecimals: market?.baseTokenDecimals ?? 6,
        signer: transactionSigner,
      })
        .then((txId) => {
          // Apply optimistic updates for instant UI feedback
          const baseTokenDecimals = market?.baseTokenDecimals ?? 6;
          const repayAmountMicrounits = (
            Number(repayAmount) * Math.pow(10, baseTokenDecimals)
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
        baseTokenDecimals: market?.baseTokenDecimals ?? 6,
        signer: transactionSigner,
      })
        .then((txId) => {
          // Apply optimistic updates for instant UI feedback
          const baseTokenDecimals = market?.baseTokenDecimals ?? 6;
          const repayAmountMicrounits = (
            Number(repayAmount) * Math.pow(10, baseTokenDecimals)
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
      lstTokenDecimals: market?.lstTokenDecimals ?? 6,
      signer: transactionSigner,
    })
      .then((txId) => {
        // Apply optimistic updates for instant UI feedback
        const lstTokenDecimals = market?.lstTokenDecimals ?? 6;
        const withdrawAmountMicrounits = (
          Number(withdrawAmount) * Math.pow(10, lstTokenDecimals)
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
      collateralTokenDecimals: collateralMarket?.lstTokenDecimals ?? 6,
      baseTokenDecimals: market?.baseTokenDecimals ?? 6,
      signer: transactionSigner,
    })
      .then((txId) => {
        // Apply optimistic updates for instant UI feedback
        const baseTokenDecimals = market?.baseTokenDecimals ?? 6;
        const lstTokenDecimals = market?.lstTokenDecimals ?? 6;
        const borrowAmountMicrounits = (
          Number(borrowAmount) * Math.pow(10, baseTokenDecimals)
        ).toString();
        const baseTokenId = market?.baseTokenId || "0";

        // Add borrowed tokens to user balance
        applyOptimisticBalanceUpdate(baseTokenId, borrowAmountMicrounits);

        // Only update collateral balance if new collateral is being added
        if (isAddingCollateral) {
          const collateralAmountMicrounits = (
            Number(effectiveCollateralAmount) * Math.pow(10, lstTokenDecimals)
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
                {/* Buy on Compx Button */}
                <BuyOnCompxButton
                  tokenSymbol={getBaseTokenSymbol(market.symbol)}
                  tokenId={market.baseTokenId}
                  hasBalance={false}
                />
                
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
            {/* Tab Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <TabSelector
                tabs={[
                  { id: "overview", label: "OVERVIEW" },
                  { id: "collateral", label: "COLLATERAL" },
                  { id: "analytics", label: "ANALYTICS" },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                className="mb-4 md:mb-6"
              />
            </motion.div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <OverviewTab
                market={market}
                copied={copied}
                onCopy={copyToClipboard}
              />
            )}
            {activeTab === "collateral" && (
              <CollateralTab
                market={market}
                acceptedCollateral={acceptedCollateral}
                stakingPools={stakingPools}
                loadingStakingPools={loadingStakingPools}
              />
            )}
            {activeTab === "analytics" && (
              <AnalyticsTab market={market} />
            )}
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
