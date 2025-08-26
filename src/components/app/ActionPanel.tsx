import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DollarSign, AlertCircle, ChevronDown } from "lucide-react";
import {
  calculateAssetDue,
  calculateLSTDue,
} from "../../contracts/lending/state";
import { LendingMarket } from "../../types/lending";
import { getLoanRecordReturnType } from "../../contracts/lending/interface";
import { useCollateralTokens } from "../../hooks/useCollateralTokens";
import TabSelector from "./TabSelector";

interface ActionPanelProps {
  market: LendingMarket;
  userAssets?: {
    assets: Array<{
      assetId: string;
      balance: string;
      isOptedIn: boolean;
    }>;
  };
  algoBalance?: string;
  isLoadingAssets: boolean;
  transactionLoading: boolean;
  acceptedCollateral?: Map<unknown, unknown>;
  userDebt?: getLoanRecordReturnType;
  initialTab?: "lend" | "borrow";
  onDeposit: (amount: string) => void;
  onRedeem: (amount: string) => void;
  onBorrow: (
    collateralAssetId: string,
    collateralAmount: string,
    borrowAmount: string
  ) => void;
  onRepay: (repayAmount: string) => void;
  onWithdrawCollateral?: (collateralAssetId: string, withdrawAmount: string) => void;
}

const ActionPanel = ({
  market,
  userAssets,
  algoBalance,
  isLoadingAssets,
  transactionLoading,
  acceptedCollateral,
  userDebt,
  initialTab = "lend",
  onDeposit,
  onRedeem,
  onBorrow,
  onRepay,
  onWithdrawCollateral,
}: ActionPanelProps) => {
  // Main tab state: lend or borrow
  const [activeMainTab, setActiveMainTab] = useState<"lend" | "borrow">(initialTab);
  // Action state within each main tab
  const [activeAction, setActiveAction] = useState<"deposit" | "redeem" | "open" | "repay" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  // Borrow-specific state
  const [selectedCollateral, setSelectedCollateral] = useState<string>("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [showCollateralDropdown, setShowCollateralDropdown] = useState(false);

  // Repay-specific state
  const [repayAmount, setRepayAmount] = useState("");

  // Withdraw collateral-specific state
  const [withdrawCollateralAssetId, setWithdrawCollateralAssetId] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Ref for dropdown click outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle main tab changes and reset action state
  const handleMainTabChange = (newTab: "lend" | "borrow") => {
    setActiveMainTab(newTab);
    // Reset to first action of the new tab
    if (newTab === "lend") {
      setActiveAction("deposit");
    } else {
      setActiveAction("open");
    }
    // Clear all form state
    setAmount("");
    setSelectedCollateral("");
    setCollateralAmount("");
    setBorrowAmount("");
    setRepayAmount("");
    setWithdrawCollateralAssetId("");
    setWithdrawAmount("");
  };

  // Use the collateral tokens hook
  const { getCollateralAssets } = useCollateralTokens(acceptedCollateral);

  // Update tab when initialTab changes (for drawer)
  useEffect(() => {
    setActiveMainTab(initialTab);
    // Reset to first action of the new tab
    if (initialTab === "lend") {
      setActiveAction("deposit");
    } else {
      setActiveAction("open");
    }
  }, [initialTab]);

  // Auto-select existing collateral when user has debt and switches to open or withdraw action
  useEffect(() => {
    if ((activeAction === "open" || activeAction === "withdraw") && userDebt && Number(userDebt.principal) > 0) {
      const existingCollateralId = userDebt.collateralTokenId.toString();
      if (existingCollateralId) {
        if (activeAction === "open" && existingCollateralId !== selectedCollateral) {
          setSelectedCollateral(existingCollateralId);
        } else if (activeAction === "withdraw" && existingCollateralId !== withdrawCollateralAssetId) {
          setWithdrawCollateralAssetId(existingCollateralId);
        }
      }
    }
  }, [activeAction, userDebt, selectedCollateral, withdrawCollateralAssetId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCollateralDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAction = () => {
    if (activeAction === "deposit") {
      onDeposit(amount);
    } else if (activeAction === "redeem") {
      onRedeem(amount);
    } else if (activeAction === "open") {
      onBorrow(selectedCollateral, collateralAmount, borrowAmount);
    } else if (activeAction === "repay") {
      onRepay(repayAmount);
    } else if (activeAction === "withdraw" && onWithdrawCollateral) {
      onWithdrawCollateral(withdrawCollateralAssetId, withdrawAmount);
    }
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

  // Get the maximum available balance based on the active action
  const getMaxBalance = (): string => {
    if (!market || isLoadingAssets) return "0";

    switch (activeAction) {
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

      case "open":
        // For borrow open, use the available borrow amount (already calculated in market)
        // Convert to microunits for consistency with other balances
        return (market.availableToBorrow * Math.pow(10, 6)).toString();

      case "repay": {
        // For repay, use the total debt amount
        if (!userDebt || !userDebt.principal) return "0";
        return userDebt.principal.toString(); // Already in microunits
      }

      case "withdraw": {
        // For withdraw collateral, use the collateral balance
        if (!withdrawCollateralAssetId) return "0";
        const collateralAsset = userAssets?.assets.find(
          (asset) => asset.assetId === withdrawCollateralAssetId && asset.isOptedIn
        );
        return collateralAsset?.balance || "0";
      }

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
    if (activeAction === "open") {
      setCollateralAmount(formattedMax);
    } else if (activeAction === "repay") {
      setRepayAmount(formattedMax);
    } else if (activeAction === "withdraw") {
      setWithdrawAmount(formattedMax);
    } else {
      setAmount(formattedMax);
    }
  };

  // Get available collateral assets using the hook
  const availableCollateral = getCollateralAssets(userAssets);

  // Calculate borrow details
  const calculateBorrowDetails = () => {
    if (!borrowAmount) {
      return {
        ltvRatio: 0,
        dailyInterest: 0,
        originationFee: 0,
        totalFees: 0,
        maxBorrowAmount: 0,
      };
    }

    // Get existing collateral amount
    const existingCollateralValue = userDebt ? Number(userDebt.collateralAmount) / Math.pow(10, 6) : 0;
    // Get additional collateral amount (if any)
    const additionalCollateralValue = collateralAmount ? parseFloat(collateralAmount) : 0;
    // Total collateral = existing + additional
    const totalCollateralValue = existingCollateralValue + additionalCollateralValue;

    // Get existing debt
    const existingDebtValue = userDebt ? Number(userDebt.principal) / Math.pow(10, 6) : 0;
    // Get additional borrow amount
    const additionalBorrowValue = parseFloat(borrowAmount);
    // Total debt = existing + additional
    const totalDebtValue = existingDebtValue + additionalBorrowValue;

    // Calculate LTV ratio based on total debt vs total collateral
    const ltvRatio = totalCollateralValue > 0 ? (totalDebtValue / totalCollateralValue) * 100 : 0;

    // Calculate daily interest on the additional borrow amount
    const dailyInterest = (additionalBorrowValue * market.borrowApr) / 100 / 365;

    // Estimate origination fee (typically 0.1-0.5% of additional borrow amount)
    const originationFee = additionalBorrowValue * 0.001; // 0.1% as example

    // Calculate max additional borrow amount based on existing collateral + any new collateral
    const maxTotalDebt = (totalCollateralValue * market.ltv) / 100;
    const maxAdditionalBorrowByCollateral = Math.max(0, maxTotalDebt - existingDebtValue);
    
    // Also consider market supply availability
    const marketAvailableSupply = market.availableToBorrow;
    
    // The actual max is the minimum of collateral-based limit and market supply
    const maxAdditionalBorrow = Math.min(maxAdditionalBorrowByCollateral, marketAvailableSupply);

    return {
      ltvRatio,
      dailyInterest,
      originationFee,
      totalFees: originationFee,
      maxBorrowAmount: maxAdditionalBorrow,
      totalCollateralValue,
      totalDebtValue,
      existingCollateralValue,
      existingDebtValue,
    };
  };

  const borrowDetails = calculateBorrowDetails();

  // Calculate repayment details
  const calculateRepaymentDetails = () => {
    if (!userDebt || !repayAmount || parseFloat(repayAmount) <= 0) {
      return {
        totalDebt: 0,
        repaymentAmount: 0,
        remainingDebt: 0,
        collateralReturned: 0,
        isFullRepayment: false,
      };
    }

    const totalDebt = Number(userDebt.principal) / Math.pow(10, 6); // Convert from microunits
    const repaymentAmount = parseFloat(repayAmount);
    const remainingDebt = Math.max(0, totalDebt - repaymentAmount);
    const isFullRepayment = repaymentAmount >= totalDebt;

    // Calculate collateral returned proportionally
    const collateralAmount = Number(userDebt.collateralAmount) / Math.pow(10, 6); // Convert from microunits
    const repaymentRatio = Math.min(1, repaymentAmount / totalDebt);
    const collateralReturned = collateralAmount * repaymentRatio;

    return {
      totalDebt,
      repaymentAmount,
      remainingDebt,
      collateralReturned,
      isFullRepayment,
    };
  };

  const repaymentDetails = calculateRepaymentDetails();

  // Get selected collateral info
  const selectedCollateralInfo = availableCollateral.find(
    (c) => c.assetId === selectedCollateral
  );

  // Handle collateral selection
  const handleCollateralSelect = (assetId: string) => {
    setSelectedCollateral(assetId);
    setShowCollateralDropdown(false);
    setCollateralAmount("");
    setBorrowAmount("");
  };

  // Handle max collateral click
  const handleMaxCollateralClick = () => {
    if (selectedCollateralInfo) {
      const maxBalance = formatBalance(selectedCollateralInfo.balance);
      setCollateralAmount(maxBalance);
    }
  };

  // Check if user has sufficient collateral balance
  const hasSufficientCollateral = () => {
    if (!selectedCollateralInfo || !collateralAmount) return true; // Allow progression
    const userBalance = parseFloat(
      formatBalance(selectedCollateralInfo.balance)
    );
    const requestedAmount = parseFloat(collateralAmount);
    return userBalance >= requestedAmount;
  };

  // Handle max borrow click
  const handleMaxBorrowClick = () => {
    // Use the calculated max additional borrow amount
    setBorrowAmount(borrowDetails.maxBorrowAmount.toFixed(6));
  };

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Action Panel */}
      <div className="text-slate-600 cut-corners-lg p-4 md:p-6 bg-noise-dark border-2 border-slate-600 shadow-industrial">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
          <h3 className="text-base md:text-lg font-mono font-bold text-white uppercase tracking-wide">
            Market Actions
          </h3>
        </div>

        {/* Main Tab Selector */}
        <TabSelector
          tabs={[
            { id: "lend", label: "LEND" },
            { id: "borrow", label: "BORROW" },
          ]}
          activeTab={activeMainTab}
          onTabChange={(tabId) => handleMainTabChange(tabId as "lend" | "borrow")}
          className="mb-4 md:mb-6"
        />

        {/* Action Buttons */}
        <motion.div 
          className="flex gap-2 md:gap-3 mb-4 md:mb-6"
          key={activeMainTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {activeMainTab === "lend" ? (
            <>
              <button
                onClick={() => setActiveAction("deposit")}
                className={`flex-1 h-10 md:h-12 px-3 md:px-4 cut-corners-md font-mono text-xs md:text-sm font-bold uppercase tracking-wide transition-all duration-200 border-2 shadow-lg ${
                  activeAction === "deposit"
                    ? "bg-gradient-to-br from-cyan-600 to-cyan-700 border-cyan-400 text-white shadow-cyan-500/25 transform scale-[1.02]"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 hover:shadow-slate-500/20"
                }`}
              >
                <span className="relative z-20 drop-shadow-sm">DEPOSIT</span>
              </button>
              <button
                onClick={() => setActiveAction("redeem")}
                className={`flex-1 h-10 md:h-12 px-3 md:px-4 cut-corners-md font-mono text-xs md:text-sm font-bold uppercase tracking-wide transition-all duration-200 border-2 shadow-lg ${
                  activeAction === "redeem"
                    ? "bg-gradient-to-br from-green-600 to-green-700 border-green-400 text-white shadow-green-500/25 transform scale-[1.02]"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 hover:shadow-slate-500/20"
                } ${
                  userAssets?.assets.find(
                    (asset) => Number(asset.assetId) === Number(market?.lstTokenId)
                  )?.balance === "0"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  userAssets?.assets.find(
                    (asset) => Number(asset.assetId) === Number(market?.lstTokenId)
                  )?.balance === "0"
                }
              >
                <span className="relative z-20 drop-shadow-sm">REDEEM</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveAction("open")}
                className={`flex-1 h-10 md:h-12 px-2 md:px-3 cut-corners-md font-mono text-xs md:text-sm font-bold uppercase tracking-wide transition-all duration-200 border-2 shadow-lg ${
                  activeAction === "open"
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-400 text-white shadow-blue-500/25 transform scale-[1.02]"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 hover:shadow-slate-500/20"
                } ${market.availableToBorrow === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={market.availableToBorrow === 0}
              >
                <span className="relative z-20 drop-shadow-sm">OPEN</span>
              </button>
              <button
                onClick={() => setActiveAction("repay")}
                className={`flex-1 h-10 md:h-12 px-2 md:px-3 cut-corners-md font-mono text-xs md:text-sm font-bold uppercase tracking-wide transition-all duration-200 border-2 shadow-lg ${
                  activeAction === "repay"
                    ? "bg-gradient-to-br from-amber-600 to-amber-700 border-amber-400 text-white shadow-amber-500/25 transform scale-[1.02]"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 hover:shadow-slate-500/20"
                } ${!userDebt || Number(userDebt.principal) === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!userDebt || Number(userDebt.principal) === 0}
              >
                <span className="relative z-20 drop-shadow-sm">REPAY</span>
              </button>
              <button
                onClick={() => setActiveAction("withdraw")}
                className={`flex-1 h-10 md:h-12 px-2 md:px-3 cut-corners-md font-mono text-xs md:text-sm font-bold uppercase tracking-wide transition-all duration-200 border-2 shadow-lg ${
                  activeAction === "withdraw"
                    ? "bg-gradient-to-br from-purple-600 to-purple-700 border-purple-400 text-white shadow-purple-500/25 transform scale-[1.02]"
                    : "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 hover:shadow-slate-500/20"
                } ${!userDebt || Number(userDebt.collateralAmount) === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!userDebt || Number(userDebt.collateralAmount) === 0}
              >
                <span className="relative z-20 drop-shadow-sm">WITHDRAW</span>
              </button>
            </>
          )}
        </motion.div>

        {/* Amount Input */}
        <motion.div 
          className="space-y-3 md:space-y-4"
          key={activeAction}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {activeAction === "open" ? (
            // Borrow-specific inputs
            <>
              {/* Current Position Display */}
              {userDebt && Number(userDebt.principal) > 0 && (
                <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-3 mb-4">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wide mb-2">
                    Current Position
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400 font-mono">Collateral</div>
                      <div className="text-white font-mono">
                        {(Number(userDebt.collateralAmount) / Math.pow(10, 6)).toFixed(6)} {availableCollateral.find(c => c.assetId === userDebt.collateralTokenId.toString())?.symbol}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-mono">Debt</div>
                      <div className="text-white font-mono">
                        {(Number(userDebt.principal) / Math.pow(10, 6)).toFixed(6)} {getBaseTokenSymbol(market?.symbol)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Collateral Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                      {userDebt && Number(userDebt.principal) > 0 ? "Add More Collateral" : "Collateral Asset"}
                  </span>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setShowCollateralDropdown(!showCollateralDropdown)
                    }
                    disabled={userDebt && Number(userDebt.principal) > 0}
                    className={`w-full h-10 md:h-12 px-3 md:px-4 bg-slate-100 border-2 border-slate-600 text-slate-800 font-mono text-base md:text-lg focus:outline-none transition-colors focus:border-blue-400 flex items-center justify-between ${
                      userDebt && Number(userDebt.principal) > 0 ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedCollateralInfo?.image && (
                        <img
                          src={selectedCollateralInfo.image}
                          alt={selectedCollateralInfo.symbol}
                          className="w-4 h-4 object-contain"
                        />
                      )}
                      <span>
                        {selectedCollateralInfo
                          ? `${selectedCollateralInfo.symbol}${userDebt && Number(userDebt.principal) > 0 ? " (Existing)" : ""}`
                          : "Select Collateral"}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showCollateralDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-100 border-2 border-slate-600 cut-corners-sm z-50 max-h-40 overflow-y-auto">
                      {availableCollateral.length > 0 ? (
                        availableCollateral.map((asset) => (
                          <button
                            key={asset.assetId}
                            onClick={() =>
                              handleCollateralSelect(asset.assetId)
                            }
                            className="w-full px-3 py-2 text-left hover:bg-slate-200 font-mono text-slate-800 text-sm flex justify-between items-center transition-colors duration-150"
                          >
                            <div className="flex items-center gap-2">
                              {asset.image && (
                                <img
                                  src={asset.image}
                                  alt={asset.symbol}
                                  className="w-4 h-4 object-contain"
                                />
                              )}
                              <span className="font-medium text-slate-200">
                                {asset.symbol}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-slate-600 font-mono text-sm">
                          No collateral available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Collateral Amount Input */}
              {selectedCollateral && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                      Collateral Amount
                    </span>
                    <button
                      onClick={handleMaxCollateralClick}
                      disabled={isLoadingAssets}
                      className="text-xs font-mono font-semibold uppercase tracking-wide transition-colors text-blue-400 hover:text-blue-300"
                    >
                      MAX
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={collateralAmount}
                      onChange={(e) => setCollateralAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-10 md:h-12 px-3 md:px-4 bg-slate-100 border-2 border-slate-600 text-slate-800 font-mono text-base md:text-lg focus:outline-none transition-colors focus:border-blue-400"
                    />
                    <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
                      <span className="font-mono text-slate-400 text-xs md:text-sm">
                        {selectedCollateralInfo?.symbol}
                      </span>
                    </div>
                  </div>
                  {selectedCollateralInfo && (
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      Balance: {formatBalance(selectedCollateralInfo.balance)}{" "}
                      {selectedCollateralInfo.symbol}
                    </div>
                  )}
                </div>
              )}

              {/* Borrow Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                    {userDebt && Number(userDebt.principal) > 0 ? "Additional Borrow Amount" : "Borrow Amount"}
                  </span>
                  <button
                    onClick={handleMaxBorrowClick}
                    className="text-xs font-mono font-semibold uppercase tracking-wide transition-colors text-blue-400 hover:text-blue-300"
                  >
                    MAX
                  </button>
                </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-10 md:h-12 px-3 md:px-4 bg-slate-100 border-2 border-slate-600 text-slate-800 font-mono text-base md:text-lg focus:outline-none transition-colors focus:border-blue-400"
                    />
                    <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
                      <span className="font-mono text-slate-400 text-xs md:text-sm">
                        {getBaseTokenSymbol(market?.symbol)}
                      </span>
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                        <img
                          src={market.image}
                          alt={market.symbol}
                          className="w-3 h-3 md:w-4 md:h-4 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
            </>
          ) : activeAction === "repay" ? (
            // Repay-specific input
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                  Repay Amount
                </span>
                <button
                  onClick={handleMaxClick}
                  disabled={isLoadingAssets || !userDebt}
                  className="text-xs font-mono font-semibold uppercase tracking-wide transition-colors text-amber-400 hover:text-amber-300"
                >
                  MAX
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 md:h-12 px-3 md:px-4 bg-slate-100 border-2 border-slate-600 text-slate-800 font-mono text-base md:text-lg focus:outline-none transition-colors focus:border-amber-400"
                />
                <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
                  <span className="font-mono text-slate-400 text-xs md:text-sm">
                    {getBaseTokenSymbol(market?.symbol)}
                  </span>
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    <img
                      src={market.image}
                      alt={market.symbol}
                      className="w-3 h-3 md:w-4 md:h-4 object-contain"
                    />
                  </div>
                </div>
              </div>
              {userDebt && (
                <div className="text-xs font-mono text-slate-400 mt-1">
                    Total Debt: {(Number(userDebt.principal) / Math.pow(10, 6)).toFixed(6)} {getBaseTokenSymbol(market?.symbol)}
                </div>
              )}
            </div>
          ) : activeAction === "withdraw" ? (
            // Withdraw collateral-specific input
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                  Collateral Asset
                </span>
              </div>
              <div className="w-full h-10 md:h-12 px-3 md:px-4 bg-slate-800/50 border-2 border-slate-600 text-white font-mono text-base md:text-lg flex items-center gap-2">
                {availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.image && (
                  <img
                    src={availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.image}
                    alt={availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.symbol}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span>
                  {availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.symbol || "No collateral available"}
                </span>
              </div>

              {withdrawCollateralAssetId && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                      Withdraw Amount
                    </span>
                    <button
                      onClick={handleMaxClick}
                      disabled={isLoadingAssets}
                      className="text-xs font-mono font-semibold uppercase tracking-wide transition-colors text-purple-400 hover:text-purple-300"
                    >
                      MAX
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-10 md:h-12 px-3 md:px-4 bg-slate-100 border-2 border-slate-600 text-slate-800 font-mono text-base md:text-lg focus:outline-none transition-colors focus:border-purple-400"
                    />
                    <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
                      <span className="font-mono text-slate-400 text-xs md:text-sm">
                        {availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.symbol}
                      </span>
                    </div>
                  </div>
                  {withdrawCollateralAssetId && (
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      Available: {formatBalance(availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.balance || "0")}{" "}
                      {availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.symbol}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Original amount input for deposit/redeem
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                  Amount
                </span>
                <button
                  onClick={handleMaxClick}
                  disabled={isLoadingAssets}
                  className={`text-xs font-mono font-semibold uppercase tracking-wide transition-colors ${
                    isLoadingAssets
                      ? "text-slate-500 cursor-not-allowed"
                      : activeAction === "deposit"
                      ? "text-cyan-400 hover:text-cyan-300"
                      : activeAction === "redeem"
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
                  className={`w-full h-10 md:h-12 px-3 md:px-4 bg-slate-100 border-2 border-slate-600 text-slate-800 font-mono text-base md:text-lg focus:outline-none transition-colors ${
                    activeAction === "deposit"
                      ? "focus:border-cyan-400"
                      : activeAction === "redeem"
                      ? "focus:border-green-400"
                      : "focus:border-blue-400"
                  }`}
                />
                <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
                  <span className="font-mono text-slate-400 text-xs md:text-sm">
                    {activeAction === "redeem"
                      ? getLSTTokenSymbol(market?.symbol)
                      : getBaseTokenSymbol(market?.symbol)}
                  </span>
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    <img
                      src={market.image}
                      alt={market.symbol}
                      className="w-3 h-3 md:w-4 md:h-4 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Transaction Details */}
        <div className="inset-panel cut-corners-sm p-3 md:p-4 space-y-2 md:space-y-3">
          {activeAction === "open" ? (
              // Enhanced borrow details
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">Borrow APR</span>
                  <span className="font-mono font-bold text-blue-400">
                    {market.borrowApr.toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">Available Supply</span>
                  <span className="font-mono text-white">
                    {market.availableToBorrow.toFixed(2)} {getBaseTokenSymbol(market?.symbol)}
                  </span>
                </div>

                {borrowAmount && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">
                        Total LTV Ratio
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          borrowDetails.ltvRatio > market.ltv
                            ? "text-red-400"
                            : "text-blue-400"
                        }`}
                      >
                        {borrowDetails.ltvRatio.toFixed(1)}% / {market.ltv}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">
                        Total Collateral
                      </span>
                      <span className="font-mono text-white">
                        {borrowDetails.totalCollateralValue?.toFixed(6)} {userDebt ? availableCollateral.find(c => c.assetId === userDebt.collateralTokenId.toString())?.symbol : ""}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">
                        Total Debt
                      </span>
                      <span className="font-mono text-white">
                        {borrowDetails.totalDebtValue?.toFixed(6)} {getBaseTokenSymbol(market?.symbol)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">
                        Daily Interest
                      </span>
                      <span className="font-mono text-white">
                        {borrowDetails.dailyInterest.toFixed(6)}{" "}
                        {getBaseTokenSymbol(market?.symbol)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">
                        Origination Fee
                      </span>
                      <span className="font-mono text-white">
                        {borrowDetails.originationFee.toFixed(6)}{" "}
                        {getBaseTokenSymbol(market?.symbol)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">
                        You Will Receive
                      </span>
                      <span className="font-mono text-white">
                        {(
                          parseFloat(borrowAmount) -
                          borrowDetails.originationFee
                        ).toFixed(6)}{" "}
                        {getBaseTokenSymbol(market?.symbol)}
                      </span>
                    </div>
                  </>
                )}

                {collateralAmount && !borrowAmount && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-mono text-slate-400">
                      Max Borrow Amount
                    </span>
                    <span className="font-mono text-white">
                      {borrowDetails.maxBorrowAmount.toFixed(6)}{" "}
                      {getBaseTokenSymbol(market?.symbol)}
                    </span>
                  </div>
                )}
              </>
            ) : activeAction === "repay" ? (
              // Repayment transaction details
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">Total Debt</span>
                  <span className="font-mono text-white">
                    {repaymentDetails.totalDebt.toFixed(6)} {getBaseTokenSymbol(market?.symbol)}
                  </span>
                </div>

                {repayAmount && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">Repay Amount</span>
                      <span className="font-mono font-bold text-amber-400">
                        {repaymentDetails.repaymentAmount.toFixed(6)} {getBaseTokenSymbol(market?.symbol)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">Remaining Debt</span>
                      <span className={`font-mono font-bold ${repaymentDetails.isFullRepayment ? "text-green-400" : "text-white"}`}>
                        {repaymentDetails.remainingDebt.toFixed(6)} {getBaseTokenSymbol(market?.symbol)}
                      </span>
                    </div>

                    {repaymentDetails.isFullRepayment && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-mono text-slate-400">Collateral Returned</span>
                          <span className="font-mono text-white">
                            {repaymentDetails.collateralReturned.toFixed(6)} 
                            {userDebt && availableCollateral.find(c => c.assetId === userDebt.collateralTokenId.toString())?.symbol}
                          </span>
                        </div>

                        <div className="text-xs font-mono text-green-400 bg-green-500/10 border border-green-500/20 p-2 rounded">
                          ✓ Position will be fully closed - all collateral returned
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            ) : activeAction === "withdraw" ? (
              // Withdraw collateral transaction details
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">Selected Collateral</span>
                  <span className="font-mono text-white">
                    {availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.symbol || "None"}
                  </span>
                </div>

                {withdrawAmount && withdrawCollateralAssetId && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">Withdraw Amount</span>
                      <span className="font-mono font-bold text-purple-400">
                        {parseFloat(withdrawAmount).toFixed(6)} {availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.symbol}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">Remaining Collateral</span>
                      <span className="font-mono text-white">
                        {(parseFloat(formatBalance(availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.balance || "0")) - parseFloat(withdrawAmount)).toFixed(6)} {availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.symbol}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded">
                      ⚠ Ensure sufficient collateral remains to maintain health factor
                    </div>
                  </>
                )}
              </>
            ) : (
              // Original transaction details for deposit/redeem
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">
                    {activeAction === "deposit" && "Deposit APR"}
                    {activeAction === "redeem" && "Current Supply APR"}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      activeAction === "deposit"
                        ? "text-cyan-400"
                        : "text-green-400"
                    }`}
                  >
                    {activeAction === "deposit" &&
                      `+${market.supplyApr.toFixed(2)}%`}
                    {activeAction === "redeem" &&
                      `+${market.supplyApr.toFixed(2)}%`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">
                    {activeAction === "deposit" && "Wallet Balance"}
                    {activeAction === "redeem" && "Your LST Balance"}
                  </span>
                  <span className="font-mono text-white">
                    {isLoadingAssets ? (
                      <span className="text-slate-500">Loading...</span>
                    ) : (
                      <>
                        {activeAction === "deposit" &&
                          `${formatBalance(getMaxBalance())} ${
                            getBaseTokenSymbol(market?.symbol) || "tokens"
                          }`}
                        {activeAction === "redeem" &&
                          `${formatBalance(getMaxBalance())} ${
                            getLSTTokenSymbol(market?.symbol) || "LST"
                          }`}
                      </>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">
                    {activeAction === "deposit" && "You Will Receive"}
                    {activeAction === "redeem" && "You Will Receive"}
                  </span>
                  <span className="font-mono text-white">
                    {activeAction === "deposit" &&
                      `${
                        amount
                          ? Number(
                              calculateLSTDue(
                                BigInt(Number(amount) * 10 ** 6),
                                BigInt(market.circulatingLST * 10 ** 6 || 0),
                                BigInt(market.totalDeposits * 10 ** 6 || 0)
                              )
                            ).toFixed(2)
                          : "0.00"
                      } ${getLSTTokenSymbol(market?.symbol)}`}
                    {activeAction === "redeem" &&
                      `${
                        amount
                          ? Number(
                              calculateAssetDue(
                                BigInt(Number(amount) * 10 ** 6),
                                BigInt(market?.circulatingLST * 10 ** 6 || 0),
                                BigInt(market?.totalDeposits * 10 ** 6 || 0)
                              )
                            ).toFixed(2)
                          : "0.00"
                      } ${getBaseTokenSymbol(market?.symbol)}`}
                  </span>
                </div>
              </>
            )}
          </div>

        {/* Action Button */}
        <button
          className={`w-full h-10 md:h-12 cut-corners-sm font-mono text-xs md:text-sm font-semibold transition-all duration-150 ${(() => {
              if (activeAction === "open") {
                // For existing debt, allow borrowing without new collateral
                // For new debt, require collateral selection
                const hasExistingDebt = userDebt && Number(userDebt.principal) > 0;
                const needsCollateral = !hasExistingDebt;
                
                const collateralValid = needsCollateral 
                  ? (selectedCollateral && collateralAmount && parseFloat(collateralAmount) > 0 && hasSufficientCollateral())
                  : (!collateralAmount || parseFloat(collateralAmount || "0") === 0 || hasSufficientCollateral());
                
                return borrowAmount &&
                  parseFloat(borrowAmount) > 0 &&
                  parseFloat(borrowAmount) <= market.availableToBorrow &&
                  borrowDetails.ltvRatio <= market.ltv &&
                  market.availableToBorrow > 0 &&
                  collateralValid
                  ? "bg-blue-600 border-2 border-blue-500 text-white hover:bg-blue-500 shadow-top-highlight"
                  : "bg-slate-700 border-2 border-slate-600 text-slate-400 cursor-not-allowed";
              } else if (activeAction === "repay") {
                return repayAmount &&
                  parseFloat(repayAmount) > 0 &&
                  userDebt &&
                  Number(userDebt.principal) > 0
                  ? "bg-amber-600 border-2 border-amber-500 text-white hover:bg-amber-500 shadow-top-highlight"
                  : "bg-slate-700 border-2 border-slate-600 text-slate-400 cursor-not-allowed";
              } else if (activeAction === "withdraw") {
                return withdrawCollateralAssetId &&
                  withdrawAmount &&
                  parseFloat(withdrawAmount) > 0
                  ? "bg-purple-600 border-2 border-purple-500 text-white hover:bg-purple-500 shadow-top-highlight"
                  : "bg-slate-700 border-2 border-slate-600 text-slate-400 cursor-not-allowed";
              } else {
                return amount &&
                  parseFloat(amount) > 0 &&
                  !(
                    activeAction === "redeem" &&
                    userAssets?.assets.find(
                      (asset) =>
                        Number(asset.assetId) === Number(market?.lstTokenId)
                    )?.balance === "0"
                  )
                  ? activeAction === "deposit"
                    ? "bg-cyan-600 border-2 border-cyan-500 text-white hover:bg-cyan-500 shadow-top-highlight"
                    : "bg-green-600 border-2 border-green-500 text-white hover:bg-green-500 shadow-top-highlight"
                  : "bg-slate-700 border-2 border-slate-600 text-slate-400 cursor-not-allowed";
              }
            })()}`}
            onClick={handleAction}
            disabled={
              Boolean(transactionLoading) ||
              (() => {
                if (activeAction === "open") {
                  const hasExistingDebt = userDebt && Number(userDebt.principal) > 0;
                  const needsCollateral = !hasExistingDebt;
                  
                  const collateralInvalid = needsCollateral 
                    ? (!selectedCollateral || !collateralAmount || parseFloat(collateralAmount || "0") <= 0 || !hasSufficientCollateral())
                    : (Boolean(collateralAmount) && parseFloat(collateralAmount || "0") > 0 && !hasSufficientCollateral());
                  
                  return (
                    !borrowAmount ||
                    parseFloat(borrowAmount || "0") <= 0 ||
                    parseFloat(borrowAmount || "0") > market.availableToBorrow ||
                    borrowDetails.ltvRatio > market.ltv ||
                    market.availableToBorrow === 0 ||
                    collateralInvalid
                  );
                } else if (activeAction === "repay") {
                  return (
                    !repayAmount ||
                    parseFloat(repayAmount || "0") <= 0 ||
                    !userDebt ||
                    Number(userDebt.principal) <= 0
                  );
                } else if (activeAction === "withdraw") {
                  return (
                    !withdrawCollateralAssetId ||
                    !withdrawAmount ||
                    parseFloat(withdrawAmount || "0") <= 0
                  );
                } else {
                  return (
                    !amount ||
                    parseFloat(amount || "0") <= 0 ||
                    (activeAction === "redeem" &&
                      userAssets?.assets.find(
                        (asset) =>
                          Number(asset.assetId) === Number(market?.lstTokenId)
                      )?.balance === "0")
                  );
                }
              })()
            }
          >
            <span className="relative z-20">
              {activeAction === "deposit" &&
                `DEPOSIT ${getBaseTokenSymbol(market?.symbol)}`}
              {activeAction === "redeem" &&
                `REDEEM ${getLSTTokenSymbol(market?.symbol)}`}
              {activeAction === "open" &&
                `${userDebt && Number(userDebt.principal) > 0 ? "ADD TO POSITION" : "BORROW"} ${getBaseTokenSymbol(market?.symbol)}`}
              {activeAction === "repay" &&
                `REPAY ${getBaseTokenSymbol(market?.symbol)}`}
              {activeAction === "withdraw" &&
                `WITHDRAW COLLATERAL`}
            </span>
        </button>

        {/* Status Messages */}
        {activeAction === "open" && (
          <>
              {market.availableToBorrow === 0 && (
                <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>Market at capacity</span>
                </div>
              )}

              {availableCollateral.length === 0 && (
                <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>No accepted collateral available</span>
                </div>
              )}

              {borrowAmount && borrowDetails.ltvRatio > market.ltv && (
                <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>LTV ratio exceeds maximum ({market.ltv}%)</span>
                </div>
              )}

              {borrowAmount && parseFloat(borrowAmount) > market.availableToBorrow && (
                <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>Borrow amount exceeds available market supply ({market.availableToBorrow.toFixed(2)} {getBaseTokenSymbol(market?.symbol)})</span>
                </div>
              )}

              {selectedCollateral &&
                collateralAmount &&
                borrowAmount &&
                !hasSufficientCollateral() && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      Insufficient {selectedCollateralInfo?.symbol} balance
                      (have{" "}
                      {formatBalance(selectedCollateralInfo?.balance || "0")},
                      need {collateralAmount})
                    </span>
                  </div>
                )}

              {!borrowAmount && userDebt && Number(userDebt.principal) > 0 && (
                <div className="text-xs text-slate-500 font-mono">
                  Enter additional amount to borrow (max{" "}
                  {borrowDetails.maxBorrowAmount.toFixed(2)}{" "}
                  {getBaseTokenSymbol(market?.symbol)} - limited by {borrowDetails.maxBorrowAmount < market.availableToBorrow ? "collateral" : "market supply"})
                </div>
              )}

              {!borrowAmount && (!userDebt || Number(userDebt.principal) === 0) && (
                <div className="text-xs text-slate-500 font-mono">
                  Select collateral to deposit and specify borrow amount
                </div>
              )}

              {selectedCollateral && !collateralAmount && (!userDebt || Number(userDebt.principal) === 0) && (
                <div className="text-xs text-slate-500 font-mono">
                  Enter collateral amount to deposit (balance:{" "}
                  {formatBalance(selectedCollateralInfo?.balance || "0")}{" "}
                  {selectedCollateralInfo?.symbol})
                </div>
              )}

              {borrowAmount && !selectedCollateral && (!userDebt || Number(userDebt.principal) === 0) && (
                <div className="text-xs text-slate-500 font-mono">
                  Select collateral asset for new position
                </div>
              )}

              {selectedCollateral &&
                collateralAmount &&
                borrowAmount &&
                hasSufficientCollateral() &&
                borrowDetails.ltvRatio <= market.ltv &&
                parseFloat(borrowAmount) <= market.availableToBorrow && (
                  <div className="text-xs text-green-500 font-mono">
                    Ready to borrow! You'll receive{" "}
                    {(
                      parseFloat(borrowAmount) - borrowDetails.originationFee
                    ).toFixed(6)}{" "}
                    {getBaseTokenSymbol(market?.symbol)} after fees
                  </div>
                )}

              {borrowAmount &&
                (!userDebt || Number(userDebt.principal) === 0) &&
                (!selectedCollateral || !collateralAmount) &&
                parseFloat(borrowAmount) <= market.availableToBorrow &&
                borrowDetails.ltvRatio <= market.ltv && (
                  <div className="text-xs text-green-500 font-mono">
                    Borrow amount valid! Add collateral to proceed.
                  </div>
                )}

              {borrowAmount &&
                userDebt && Number(userDebt.principal) > 0 &&
                parseFloat(borrowAmount) <= market.availableToBorrow &&
                borrowDetails.ltvRatio <= market.ltv && (
                  <div className="text-xs text-green-500 font-mono">
                    Ready to add to position! You'll receive{" "}
                    {(
                      parseFloat(borrowAmount) - borrowDetails.originationFee
                    ).toFixed(6)}{" "}
                    {getBaseTokenSymbol(market?.symbol)} after fees
                  </div>
                )}
          </>
        )}

        {/* Repay Status Messages */}
        {activeAction === "repay" && (
          <>
              {!userDebt && (
                <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>No active debt position found</span>
                </div>
              )}

              {userDebt && Number(userDebt.principal) === 0 && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>No outstanding debt to repay</span>
                </div>
              )}

              {!repayAmount && userDebt && Number(userDebt.principal) > 0 && (
                <div className="text-xs text-slate-500 font-mono">
                  Enter amount to repay (max: {(Number(userDebt.principal) / Math.pow(10, 6)).toFixed(6)} {getBaseTokenSymbol(market?.symbol)})
                </div>
              )}

              {repayAmount && repaymentDetails.isFullRepayment && (
                <div className="text-xs text-green-500 font-mono">
                  ✓ Full repayment selected - position will be closed and all collateral returned
                </div>
              )}

              {repayAmount && !repaymentDetails.isFullRepayment && repaymentDetails.remainingDebt > 0 && (
                <div className="text-xs text-amber-500 font-mono">
                  Partial repayment - {repaymentDetails.remainingDebt.toFixed(6)} {getBaseTokenSymbol(market?.symbol)} debt will remain
                </div>
              )}
          </>
        )}

        {/* Withdraw Status Messages */}
        {activeAction === "withdraw" && (
          <>
              {!userDebt && (
                <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                  <AlertCircle className="w-4 h-4" />
                  <span>No active debt position found</span>
                </div>
              )}

              {!withdrawCollateralAssetId && availableCollateral.length > 0 && (
                <div className="text-xs text-slate-500 font-mono">
                  Select collateral asset to withdraw
                </div>
              )}

              {withdrawCollateralAssetId && !withdrawAmount && (
                <div className="text-xs text-slate-500 font-mono">
                  Enter amount to withdraw (available: {formatBalance(availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.balance || "0")} {availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.symbol})
                </div>
              )}

              {withdrawCollateralAssetId && withdrawAmount && (
                <div className="text-xs text-green-500 font-mono">
                  Ready to withdraw {parseFloat(withdrawAmount).toFixed(6)} {availableCollateral.find(c => c.assetId === withdrawCollateralAssetId)?.symbol}
                </div>
              )}
          </>
        )}

        {activeAction === "redeem" &&
          userAssets?.assets.find(
            (asset) => Number(asset.assetId) === Number(market?.lstTokenId)
          )?.balance === "0" && (
            <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
              <AlertCircle className="w-4 h-4" />
              <span>No LST tokens to redeem</span>
            </div>
          )}

        {activeAction === "deposit" && (
          <div className="text-xs text-slate-500 font-mono">
            Deposit {getBaseTokenSymbol(market?.symbol)} to receive
            yield-bearing {getLSTTokenSymbol(market?.symbol)} tokens
          </div>
        )}

        {activeAction === "redeem" && (
          <div className="text-xs text-slate-500 font-mono">
            Redeem your {getLSTTokenSymbol(market?.symbol)} tokens back to{" "}
            {getBaseTokenSymbol(market?.symbol)}
          </div>
        )}

        {activeAction === "repay" && (
          <div className="text-xs text-slate-500 font-mono">
            Repay your borrowed {getBaseTokenSymbol(market?.symbol)} to unlock collateral
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionPanel;
