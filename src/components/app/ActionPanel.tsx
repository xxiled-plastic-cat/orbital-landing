import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DollarSign, AlertCircle, ChevronDown } from "lucide-react";
import {
  calculateAssetDue,
  calculateLSTDue,
} from "../../contracts/lending/state";
import { LendingMarket } from "../../types/lending";
import { useCollateralTokens } from "../../hooks/useCollateralTokens";

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
  onDeposit: (amount: string) => void;
  onRedeem: (amount: string) => void;
  onBorrow: (
    collateralAssetId: string,
    collateralAmount: string,
    borrowAmount: string
  ) => void;
}

const ActionPanel = ({
  market,
  userAssets,
  algoBalance,
  isLoadingAssets,
  transactionLoading,
  acceptedCollateral,
  onDeposit,
  onRedeem,
  onBorrow,
}: ActionPanelProps) => {
  const [activeTab, setActiveTab] = useState<"deposit" | "redeem" | "borrow">(
    "deposit"
  );
  const [amount, setAmount] = useState("");

  // Borrow-specific state
  const [selectedCollateral, setSelectedCollateral] = useState<string>("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [showCollateralDropdown, setShowCollateralDropdown] = useState(false);

  // Ref for dropdown click outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use the collateral tokens hook
  const { getCollateralAssets } = useCollateralTokens(acceptedCollateral);

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
    if (activeTab === "deposit") {
      onDeposit(amount);
    } else if (activeTab === "redeem") {
      onRedeem(amount);
    } else if (activeTab === "borrow") {
      onBorrow(selectedCollateral, collateralAmount, borrowAmount);
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
    if (activeTab === "borrow") {
      setCollateralAmount(formattedMax);
    } else {
      setAmount(formattedMax);
    }
  };

  // Get available collateral assets using the hook
  const availableCollateral = getCollateralAssets(userAssets);

  // Calculate borrow details
  const calculateBorrowDetails = () => {
    if (!selectedCollateral || !collateralAmount || !borrowAmount) {
      return {
        ltvRatio: 0,
        dailyInterest: 0,
        originationFee: 0,
        totalFees: 0,
        maxBorrowAmount: 0,
      };
    }

    const collateralValue = parseFloat(collateralAmount);
    const borrowValue = parseFloat(borrowAmount);

    // Calculate LTV ratio
    const ltvRatio =
      collateralValue > 0 ? (borrowValue / collateralValue) * 100 : 0;

    // Calculate daily interest (APR / 365)
    const dailyInterest = (borrowValue * market.borrowApr) / 100 / 365;

    // Estimate origination fee (typically 0.1-0.5% of borrow amount)
    const originationFee = borrowValue * 0.001; // 0.1% as example

    // Calculate max borrow amount based on LTV
    const maxBorrowAmount = (collateralValue * market.ltv) / 100;

    return {
      ltvRatio,
      dailyInterest,
      originationFee,
      totalFees: originationFee,
      maxBorrowAmount,
    };
  };

  const borrowDetails = calculateBorrowDetails();

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
    if (collateralAmount) {
      const maxBorrow = (parseFloat(collateralAmount) * market.ltv) / 100;
      setBorrowAmount(maxBorrow.toFixed(6));
    }
  };

  return (
    <motion.div
      className="space-y-4 md:space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Action Panel */}
      <div className="text-slate-600 cut-corners-lg p-4 md:p-6 bg-noise-dark border-2 border-slate-600 shadow-industrial">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
          <h3 className="text-base md:text-lg font-mono font-bold text-white uppercase tracking-wide">
            Market Actions
          </h3>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 md:gap-2 mb-4 md:mb-6">
          <button
            onClick={() => setActiveTab("deposit")}
            className={`flex-1 h-8 md:h-10 px-2 md:px-3 cut-corners-sm font-mono text-xs font-semibold transition-all duration-150 ${
              activeTab === "deposit"
                ? "bg-cyan-600 border-2 border-cyan-500 text-white"
                : "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600"
            }`}
          >
            <span className="relative z-20">DEPOSIT</span>
          </button>
          <button
            onClick={() => setActiveTab("redeem")}
            className={`flex-1 h-8 md:h-10 px-2 md:px-3 cut-corners-sm font-mono text-xs font-semibold transition-all duration-150 ${
              activeTab === "redeem"
                ? "bg-green-600 border-2 border-green-500 text-white"
                : "bg-slate-700 border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600"
            }`}
            disabled={
              userAssets?.assets.find(
                (asset) => Number(asset.assetId) === Number(market?.lstTokenId)
              )?.balance === "0"
            }
          >
            <span className="relative z-20">REDEEM</span>
          </button>
          <button
            onClick={() => setActiveTab("borrow")}
            className={`flex-1 h-8 md:h-10 px-2 md:px-3 cut-corners-sm font-mono text-xs font-semibold transition-all duration-150 ${
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
        <div className="space-y-3 md:space-y-4">
          {activeTab === "borrow" ? (
            // Borrow-specific inputs
            <>
              {/* Collateral Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                    Collateral Asset
                  </span>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setShowCollateralDropdown(!showCollateralDropdown)
                    }
                    className="w-full h-10 md:h-12 px-3 md:px-4 bg-slate-100 border-2 border-slate-600 text-slate-800 font-mono text-base md:text-lg focus:outline-none transition-colors focus:border-blue-400 flex items-center justify-between"
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
                          ? selectedCollateralInfo.symbol
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
              {selectedCollateral && collateralAmount && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                      Borrow Amount
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
              )}
            </>
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
                  className={`w-full h-10 md:h-12 px-3 md:px-4 bg-slate-100 border-2 border-slate-600 text-slate-800 font-mono text-base md:text-lg focus:outline-none transition-colors ${
                    activeTab === "deposit"
                      ? "focus:border-cyan-400"
                      : activeTab === "redeem"
                      ? "focus:border-green-400"
                      : "focus:border-blue-400"
                  }`}
                />
                <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
                  <span className="font-mono text-slate-400 text-xs md:text-sm">
                    {activeTab === "redeem"
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

          {/* Transaction Details */}
          <div className="inset-panel cut-corners-sm p-3 md:p-4 space-y-2 md:space-y-3">
            {activeTab === "borrow" ? (
              // Enhanced borrow details
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">Borrow APR</span>
                  <span className="font-mono font-bold text-blue-400">
                    {market.borrowApr.toFixed(2)}%
                  </span>
                </div>

                {borrowAmount && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono text-slate-400">
                        LTV Ratio
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
            ) : (
              // Original transaction details for deposit/redeem
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">
                    {activeTab === "deposit" && "Deposit APR"}
                    {activeTab === "redeem" && "Current Supply APR"}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      activeTab === "deposit"
                        ? "text-cyan-400"
                        : "text-green-400"
                    }`}
                  >
                    {activeTab === "deposit" &&
                      `+${market.supplyApr.toFixed(2)}%`}
                    {activeTab === "redeem" &&
                      `+${market.supplyApr.toFixed(2)}%`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">
                    {activeTab === "deposit" && "Wallet Balance"}
                    {activeTab === "redeem" && "Your LST Balance"}
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
                      </>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-400">
                    {activeTab === "deposit" && "You Will Receive"}
                    {activeTab === "redeem" && "You Will Receive"}
                  </span>
                  <span className="font-mono text-white">
                    {activeTab === "deposit" &&
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
                    {activeTab === "redeem" &&
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
              if (activeTab === "borrow") {
                return selectedCollateral &&
                  collateralAmount &&
                  parseFloat(collateralAmount) > 0 &&
                  borrowAmount &&
                  parseFloat(borrowAmount) > 0 &&
                  borrowDetails.ltvRatio <= market.ltv &&
                  market.availableToBorrow > 0 &&
                  hasSufficientCollateral()
                  ? "bg-blue-600 border-2 border-blue-500 text-white hover:bg-blue-500 shadow-top-highlight"
                  : "bg-slate-700 border-2 border-slate-600 text-slate-400 cursor-not-allowed";
              } else {
                return amount &&
                  parseFloat(amount) > 0 &&
                  !(
                    activeTab === "redeem" &&
                    userAssets?.assets.find(
                      (asset) =>
                        Number(asset.assetId) === Number(market?.lstTokenId)
                    )?.balance === "0"
                  )
                  ? activeTab === "deposit"
                    ? "bg-cyan-600 border-2 border-cyan-500 text-white hover:bg-cyan-500 shadow-top-highlight"
                    : "bg-green-600 border-2 border-green-500 text-white hover:bg-green-500 shadow-top-highlight"
                  : "bg-slate-700 border-2 border-slate-600 text-slate-400 cursor-not-allowed";
              }
            })()}`}
            onClick={handleAction}
            disabled={
              transactionLoading ||
              (() => {
                if (activeTab === "borrow") {
                  return (
                    !selectedCollateral ||
                    !collateralAmount ||
                    parseFloat(collateralAmount) <= 0 ||
                    !borrowAmount ||
                    parseFloat(borrowAmount) <= 0 ||
                    borrowDetails.ltvRatio > market.ltv ||
                    market.availableToBorrow === 0 ||
                    !hasSufficientCollateral()
                  ); // Only disable if insufficient balance
                } else {
                  return (
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    (activeTab === "redeem" &&
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
              {activeTab === "deposit" &&
                `DEPOSIT ${getBaseTokenSymbol(market?.symbol)}`}
              {activeTab === "redeem" &&
                `REDEEM ${getLSTTokenSymbol(market?.symbol)}`}
              {activeTab === "borrow" &&
                `BORROW ${getBaseTokenSymbol(market?.symbol)}`}
            </span>
          </button>

          {/* Status Messages */}
          {activeTab === "borrow" && (
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

              {!selectedCollateral && availableCollateral.length > 0 && (
                <div className="text-xs text-slate-500 font-mono">
                  Select collateral to deposit and specify borrow amount
                </div>
              )}

              {selectedCollateral && !collateralAmount && (
                <div className="text-xs text-slate-500 font-mono">
                  Enter collateral amount to deposit (balance:{" "}
                  {formatBalance(selectedCollateralInfo?.balance || "0")}{" "}
                  {selectedCollateralInfo?.symbol})
                </div>
              )}

              {selectedCollateral && collateralAmount && !borrowAmount && (
                <div className="text-xs text-slate-500 font-mono">
                  Enter amount to borrow (max{" "}
                  {borrowDetails.maxBorrowAmount.toFixed(2)}{" "}
                  {getBaseTokenSymbol(market?.symbol)})
                </div>
              )}

              {selectedCollateral &&
                collateralAmount &&
                borrowAmount &&
                hasSufficientCollateral() &&
                borrowDetails.ltvRatio <= market.ltv && (
                  <div className="text-xs text-green-500 font-mono">
                    Ready to borrow! You'll receive{" "}
                    {(
                      parseFloat(borrowAmount) - borrowDetails.originationFee
                    ).toFixed(6)}{" "}
                    {getBaseTokenSymbol(market?.symbol)} after fees
                  </div>
                )}
            </>
          )}

          {activeTab === "redeem" &&
            userAssets?.assets.find(
              (asset) => Number(asset.assetId) === Number(market?.lstTokenId)
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
              Redeem your {getLSTTokenSymbol(market?.symbol)} tokens back to{" "}
              {getBaseTokenSymbol(market?.symbol)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActionPanel;
