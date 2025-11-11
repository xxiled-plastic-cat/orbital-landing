import { DollarSign, AlertTriangle } from "lucide-react";
import { DebtPosition } from "../../types/lending";
import { LendingMarket } from "../../types/lending";
import MomentumSpinner from "../MomentumSpinner";
import { BuyOnCompxButton } from "./BuyOnCompxButton";
import { useNetwork } from "../../context/networkContext";

interface LiquidationActionPanelProps {
  position: DebtPosition;
  market?: LendingMarket;
  isExecuting: boolean;
  liquidationAmount: string;
  setLiquidationAmount: (value: string) => void;
  onLiquidate: () => void;
  onBuyout: () => void;
  userDebtTokenBalance: string | null;
  userPremiumTokenBalance: string | null;
  isLoadingBalance: boolean;
}

const LiquidationActionPanel = ({
  position,
  market,
  isExecuting,
  liquidationAmount,
  setLiquidationAmount,
  onLiquidate,
  onBuyout,
  userDebtTokenBalance,
  userPremiumTokenBalance,
  isLoadingBalance,
}: LiquidationActionPanelProps) => {
  const { isTestnet } = useNetwork();
  
  // Dynamic premium token based on network
  const premiumSymbol = isTestnet ? "xUSDt" : "xUSD";
  // Use the buyout token ID from the market to get the correct icon
  const buyoutTokenId = market?.buyoutTokenId?.toString() || (isTestnet ? "744427912" : "760037151");
  const premiumImage = isTestnet ? "/xUSDt.svg" : `/mainnet-tokens/${buyoutTokenId}.svg`;
  
  // Map token symbols to their image paths
  const getTokenImage = (symbol: string): string => {
    const tokenImages: Record<string, string> = {
      // Base tokens
      xUSDt: "/xUSDt.svg",
      COMPXt: "/COMPXt.svg",
      USDCt: "/USDCt-logo.svg",
      goBTCt: "/goBTCt-logo.svg",
      // Collateral tokens
      cxUSDt: "/xUSDt.svg",
      cCOMPXt: "/COMPXt.svg",
    };

    return tokenImages[symbol] || "/default-token.svg";
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
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(num);
    } else if (num < 1) {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(num);
    } else {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    }
  };

  const actualLiquidationThreshold = position.liquidationThreshold > 0 ? 1 / position.liquidationThreshold : 1.2;
  const isLiquidationZone = position.healthRatio <= actualLiquidationThreshold;

  // Calculate buffered amounts for buyout
  const bufferedPremiumTokens = position.buyoutPremiumTokens * 1.05;
  const bufferedPremiumUSD = position.buyoutPremium * 1.05;
  const bufferedTotalCost = position.buyoutDebtRepayment + bufferedPremiumUSD;

  // Liquidation calculations
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
  const requestedRepayAmountUSD = requestedRepayAmount * (liveDebtUSD / liveDebt);
  
  const liquidationBonusBps = market?.liqBonusBps || position.liquidationBonus * 100;
  const liquidationBonusMultiplier = 1 + liquidationBonusBps / 10000;
  
  const maxSeizableUSD = position.totalCollateral;
  const maxSeizableTokens = position.totalCollateralTokens;
  
  const idealSeizeUSD = requestedRepayAmountUSD * liquidationBonusMultiplier;
  const expectedSeizeUSD = Math.min(idealSeizeUSD, maxSeizableUSD);
  const expectedSeizeTokens = Math.min(
    expectedSeizeUSD / (position.currentCollateralPrice || 1),
    maxSeizableTokens
  );
  
  const isCollateralInsufficient = idealSeizeUSD > maxSeizableUSD;
  
  const actualReturnUSD = expectedSeizeUSD;
  const netGainLossUSD = actualReturnUSD - requestedRepayAmountUSD;
  const effectiveBonusPercent = requestedRepayAmountUSD > 0 
    ? ((actualReturnUSD / requestedRepayAmountUSD) - 1) * 100 
    : 0;
  
  const maxSupportedRepayUSD = maxSeizableUSD / liquidationBonusMultiplier;
  const maxSupportedRepayTokens = maxSupportedRepayUSD / (liveDebtUSD / liveDebt);

  return (
    <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
      <div className="p-4 md:p-6 border-b border-slate-600">
        <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
          <span>ACTION</span>
        </h2>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Cost/Bonus Display */}
        {isLiquidationZone ? (
          <div className="space-y-4">
            <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-1">
              Liquidation Breakdown
            </h3>
            
            {/* Live Debt */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-xs uppercase tracking-wide">Current Live Debt</span>
                <span className="text-slate-500 text-xs">(Maximum Repayment)</span>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={getTokenImage(position.debtToken.symbol)}
                  alt={position.debtToken.symbol}
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="font-mono font-bold text-white">
                  {formatNumber(liveDebt)} {position.debtToken.symbol}
                </div>
                <span className="text-slate-400 text-sm">≈ ${formatUSD(liveDebtUSD)}</span>
              </div>
            </div>

            {/* User's Wallet Balance */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-xs uppercase tracking-wide">Your Wallet Balance</span>
                {isLoadingBalance && (
                  <span className="text-slate-500 text-xs">Loading...</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={getTokenImage(position.debtToken.symbol)}
                  alt={position.debtToken.symbol}
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                {userDebtTokenBalance !== null ? (
                  <>
                    <div className="font-mono font-bold text-white">
                      {formatNumber(parseFloat(userDebtTokenBalance))} {position.debtToken.symbol}
                    </div>
                    <span className="text-slate-400 text-sm">
                      ≈ ${formatUSD(parseFloat(userDebtTokenBalance) * (liveDebtUSD / liveDebt))}
                    </span>
                    {parseFloat(userDebtTokenBalance) < requestedRepayAmount && (
                      <span className="ml-auto text-xs text-red-400 font-semibold">
                        ⚠️ INSUFFICIENT
                      </span>
                    )}
                    {parseFloat(userDebtTokenBalance) >= liveDebt && (
                      <span className="ml-auto text-xs text-green-400 font-semibold">
                        ✓ SUFFICIENT
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-slate-500 text-sm">
                    {isLoadingBalance ? "Loading balance..." : "Connect wallet to view balance"}
                  </div>
                )}
              </div>
              {/* Buy on Compx Button when insufficient balance */}
              {userDebtTokenBalance !== null && parseFloat(userDebtTokenBalance) < requestedRepayAmount && (
                <div className="mt-2 flex justify-center">
                  <BuyOnCompxButton
                    tokenSymbol={position.debtToken.symbol}
                    tokenId={position.debtToken.id}
                    hasBalance={false}
                  />
                </div>
              )}
            </div>

            {/* Liquidation Amount Input */}
            <div className={`rounded-lg p-4 border-2 ${
              isBadDebtScenario 
                ? 'bg-red-900/20 border-red-500' 
                : 'bg-slate-700 border-cyan-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm font-semibold uppercase tracking-wide">
                  Repayment Amount
                  {isBadDebtScenario && (
                    <span className="text-red-400 text-xs ml-2">(FULL REPAY ONLY)</span>
                  )}
                </span>
                <button
                  onClick={() => setLiquidationAmount(liveDebt.toString())}
                  className={`text-xs font-mono font-semibold transition-colors ${
                    isBadDebtScenario 
                      ? 'text-red-400 cursor-not-allowed' 
                      : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                  disabled={isBadDebtScenario}
                >
                  {isBadDebtScenario ? 'LOCKED' : 'MAX'}
                </button>
              </div>
              
              {isBadDebtScenario && (
                <div className="mb-3 p-2 bg-red-950/50 border border-red-500/30 rounded">
                  <div className="text-red-300 text-xs font-semibold">
                    ⚠️ MANDATORY FULL REPAYMENT
                  </div>
                  <div className="text-red-200 text-xs mt-1">
                    Debt (${formatUSD(liveDebtUSD)}) exceeds collateral (${formatUSD(totalCollateralUSD)}). 
                    Partial liquidation disabled to prevent bad debt.
                  </div>
                </div>
              )}
              
              <div className="relative">
                <input
                  type="number"
                  value={isBadDebtScenario ? liveDebt.toString() : liquidationAmount}
                  onChange={(e) => !isBadDebtScenario && setLiquidationAmount(e.target.value)}
                  placeholder={`Enter amount (max ${formatNumber(liveDebt)})`}
                  step="0.000001"
                  min="0"
                  max={liveDebt}
                  disabled={isBadDebtScenario}
                  className={`w-full border rounded-lg px-4 py-3 font-mono focus:outline-none ${
                    isBadDebtScenario
                      ? 'bg-red-950/50 border-red-500/50 text-red-300 cursor-not-allowed'
                      : 'bg-slate-800 border-slate-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                />
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm ${
                  isBadDebtScenario ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {position.debtToken.symbol}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className={isBadDebtScenario ? 'text-red-300' : 'text-slate-400'}>
                  {isBadDebtScenario ? 'Mandatory' : 'Requested'}: {formatNumber(requestedRepayAmount)} {position.debtToken.symbol}
                </span>
                <span className={isBadDebtScenario ? 'text-red-300' : 'text-slate-400'}>
                  ≈ ${formatUSD(requestedRepayAmountUSD)}
                </span>
              </div>
            </div>

            {/* Expected Collateral Seizure */}
            <div className={`rounded-lg p-4 border-2 ${
              netGainLossUSD < 0 
                ? 'bg-red-900/20 border-red-500/50' 
                : 'bg-green-900/20 border-green-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm font-semibold uppercase tracking-wide">Expected Collateral Seized</span>
                {netGainLossUSD >= 0 ? (
                  <span className="text-green-400 text-xs font-mono">+{formatNumber(effectiveBonusPercent, 1)}% Return</span>
                ) : (
                  <span className="text-red-400 text-xs font-mono">{formatNumber(effectiveBonusPercent, 1)}% LOSS</span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={getTokenImage(position.collateralToken.symbol)}
                  alt={position.collateralToken.symbol}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className={`font-mono font-bold text-2xl ${
                  netGainLossUSD < 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {formatNumber(expectedSeizeTokens)} {position.collateralToken.symbol}
                </div>
              </div>
              <div className="font-mono font-semibold text-lg text-slate-300 mt-1">
                ${formatUSD(expectedSeizeUSD)}
              </div>
              
              {/* Show gain/loss breakdown */}
              <div className={`mt-3 p-2 rounded ${
                netGainLossUSD < 0 
                  ? 'bg-red-950/50 border border-red-500/30' 
                  : 'bg-green-950/50 border border-green-500/30'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">You repay:</span>
                  <span className="text-slate-300">${formatUSD(requestedRepayAmountUSD)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-400">You receive:</span>
                  <span className="text-slate-300">${formatUSD(actualReturnUSD)}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-600">
                  <span className="font-semibold text-slate-300">Net {netGainLossUSD >= 0 ? 'Gain' : 'LOSS'}:</span>
                  <span className={`font-bold ${
                    netGainLossUSD < 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {netGainLossUSD >= 0 ? '+' : ''}{formatUSD(Math.abs(netGainLossUSD))}
                  </span>
                </div>
              </div>
              
              {isCollateralInsufficient && (
                <div className="mt-3 p-2 bg-orange-900/30 border border-orange-500/50 rounded">
                  <div className="text-orange-300 text-xs leading-relaxed">
                    <div className="font-semibold mb-1">⚠️ BAD DEBT SCENARIO</div>
                    <div>• Collateral value (${formatUSD(maxSeizableUSD)}) cannot cover full repayment</div>
                    <div>• Will trigger full debt repayment: {formatNumber(liveDebt)} {position.debtToken.symbol}</div>
                    <div>• You will take a loss to prevent system bad debt</div>
                  </div>
                </div>
              )}
            </div>

            {/* Collateral Availability Warning */}
            {!isCollateralInsufficient && requestedRepayAmount > maxSupportedRepayTokens * 0.9 && (
              <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-amber-300 text-xs leading-relaxed">
                    <strong>Near Collateral Limit:</strong> You're repaying close to the maximum supported by available collateral ({formatNumber(maxSupportedRepayTokens)} {position.debtToken.symbol}). Amounts above this will trigger automatic full debt repayment.
                  </div>
                </div>
              </div>
            )}

            {/* Liquidation Bonus Display */}
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="font-mono font-bold text-2xl text-green-400">
                {formatNumber(liquidationBonusBps / 100, 1)}%
              </div>
              <div className="text-slate-400 text-sm mb-2">
                Standard Liquidation Bonus
              </div>
              <div className="text-slate-500 text-xs">
                In normal liquidations, you receive {formatNumber(liquidationBonusBps / 100, 1)}% more collateral value than repayment. 
                {isCollateralInsufficient && (
                  <span className="text-orange-400 block mt-1">
                    ⚠️ Not applicable here - insufficient collateral for bonus.
                  </span>
                )}
              </div>
            </div>

            {/* Smart Liquidation Notice */}
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-cyan-400 text-xs">💡</div>
                <div className="text-cyan-300 text-xs leading-relaxed space-y-1">
                  <div><strong>Smart Liquidation Process:</strong></div>
                  <div>• Attempts liquidation with your specified amount</div>
                  <div>• If collateral insufficient for bonus, automatically retries with full debt</div>
                  <div>• No manual intervention needed - the system handles it automatically!</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-slate-400 uppercase tracking-wide text-sm">
              Buyout Breakdown
            </h3>
            
            {/* User's Wallet Balance */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-xs uppercase tracking-wide">Your Wallet Balance</span>
                {isLoadingBalance && (
                  <span className="text-slate-500 text-xs">Loading...</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={getTokenImage(position.debtToken.symbol)}
                  alt={position.debtToken.symbol}
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                {userDebtTokenBalance !== null ? (
                  <>
                    <div className="font-mono font-bold text-white">
                      {formatNumber(parseFloat(userDebtTokenBalance))} {position.debtToken.symbol}
                    </div>
                    <span className="text-slate-400 text-sm">
                      ≈ ${formatUSD(parseFloat(userDebtTokenBalance) * (liveDebtUSD / liveDebt))}
                    </span>
                    {parseFloat(userDebtTokenBalance) < position.buyoutDebtRepaymentTokens && (
                      <span className="ml-auto text-xs text-red-400 font-semibold">
                        ⚠️ INSUFFICIENT
                      </span>
                    )}
                    {parseFloat(userDebtTokenBalance) >= position.buyoutDebtRepaymentTokens && (
                      <span className="ml-auto text-xs text-green-400 font-semibold">
                        ✓ SUFFICIENT
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-slate-500 text-sm">
                    {isLoadingBalance ? "Loading balance..." : "Connect wallet to view balance"}
                  </div>
                )}
              </div>
              {/* Buy on Compx Button when insufficient balance */}
              {userDebtTokenBalance !== null && parseFloat(userDebtTokenBalance) < position.buyoutDebtRepaymentTokens && (
                <div className="mt-2 flex justify-center">
                  <BuyOnCompxButton
                    tokenSymbol={position.debtToken.symbol}
                    tokenId={position.debtToken.id}
                    hasBalance={false}
                  />
                </div>
              )}
            </div>

            {/* Premium Token Balance */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-xs uppercase tracking-wide">Your {premiumSymbol} Balance (Premium)</span>
                {isLoadingBalance && (
                  <span className="text-slate-500 text-xs">Loading...</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={premiumImage}
                  alt={premiumSymbol}
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                {userPremiumTokenBalance !== null ? (
                  <>
                    <div className="font-mono font-bold text-white">
                      {formatNumber(parseFloat(userPremiumTokenBalance))} {premiumSymbol}
                    </div>
                    <span className="text-slate-400 text-sm">
                      ≈ ${formatUSD(parseFloat(userPremiumTokenBalance) * 1.0)}
                    </span>
                    {parseFloat(userPremiumTokenBalance) < bufferedPremiumTokens && (
                      <span className="ml-auto text-xs text-red-400 font-semibold">
                        ⚠️ INSUFFICIENT
                      </span>
                    )}
                    {parseFloat(userPremiumTokenBalance) >= bufferedPremiumTokens && (
                      <span className="ml-auto text-xs text-green-400 font-semibold">
                        ✓ SUFFICIENT
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-slate-500 text-sm">
                    {isLoadingBalance ? "Loading balance..." : "Connect wallet to view balance"}
                  </div>
                )}
              </div>
              {/* Buy on Compx Button when insufficient premium balance */}
              {userPremiumTokenBalance !== null && parseFloat(userPremiumTokenBalance) < bufferedPremiumTokens && (
                <div className="mt-2 flex justify-center">
                  <BuyOnCompxButton
                    tokenSymbol={premiumSymbol}
                    tokenId={buyoutTokenId}
                    hasBalance={false}
                  />
                </div>
              )}
            </div>

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
                  src={premiumImage}
                  alt={premiumSymbol}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="font-mono font-bold text-lg text-amber-400">
                  {formatNumber(bufferedPremiumTokens)} {premiumSymbol}
                </div>
              </div>
              <div className="font-mono font-semibold text-slate-300">
                ${formatUSD(bufferedPremiumUSD)}
              </div>
              <div className="text-slate-400 text-sm mb-2">
                Buyout Premium (with 5% buffer)
              </div>
              <div className="text-slate-500 text-xs space-y-1">
                <div>Base: {formatNumber(position.buyoutPremiumTokens)} {premiumSymbol} (50% to borrower, 50% to protocol)</div>
                <div className="text-cyan-400">+5% buffer for debt fluctuations - excess returned to you</div>
              </div>
            </div>
            
            {/* Total */}
            <div className="bg-slate-600 rounded-lg p-4 border border-cyan-500/30">
              <div className="font-mono font-bold text-2xl text-cyan-400 mb-1">
                ${formatUSD(bufferedTotalCost)}
              </div>
              <div className="text-slate-300 text-sm font-semibold mb-3">
                Total Buyout Cost (maximum with buffer)
              </div>
              
              {/* Token Breakdown */}
              <div className="pt-3 border-t border-slate-500/50 space-y-2">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                  Token Transfer Breakdown:
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={getTokenImage(position.debtToken.symbol)}
                      alt={position.debtToken.symbol}
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="text-slate-300 text-xs">Loan Repayment:</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-sm text-red-400">
                      {formatNumber(position.buyoutDebtRepaymentTokens)} {position.debtToken.symbol}
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      ${formatUSD(position.buyoutDebtRepayment)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={premiumImage}
                      alt={premiumSymbol}
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="text-slate-300 text-xs">Premium Payment:</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-sm text-amber-400">
                      {formatNumber(bufferedPremiumTokens)} {premiumSymbol}
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      ${formatUSD(bufferedPremiumUSD)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={isLiquidationZone ? onLiquidate : onBuyout}
          disabled={
            isExecuting || 
            (isLiquidationZone && !isBadDebtScenario && requestedRepayAmount <= 0) ||
            (!isLiquidationZone && userDebtTokenBalance !== null && parseFloat(userDebtTokenBalance) < position.buyoutDebtRepaymentTokens) ||
            (!isLiquidationZone && userPremiumTokenBalance !== null && parseFloat(userPremiumTokenBalance) < bufferedPremiumTokens)
          }
          className={`w-full py-4 border text-white rounded-lg font-mono text-lg font-semibold transition-all duration-150 flex items-center justify-center gap-3 ${
            isLiquidationZone
              ? "bg-red-600 border-red-500 hover:bg-red-500 disabled:bg-red-400 disabled:border-red-400"
              : "bg-cyan-600 border-cyan-500 hover:bg-cyan-500 disabled:bg-cyan-400 disabled:border-cyan-400"
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          {isExecuting ? (
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
                <li>• Liquidate undercollateralized position</li>
                {isBadDebtScenario ? (
                  <>
                    <li className="text-red-400 font-semibold">• MANDATORY FULL REPAYMENT: {formatNumber(requestedRepayAmount)} {position.debtToken.symbol} (${formatUSD(requestedRepayAmountUSD)})</li>
                    <li className="text-orange-400 text-xs pl-4">⚠️ Debt exceeds collateral - partial liquidation disabled</li>
                  </>
                ) : (
                  <>
                    <li>• Repay specified amount: {formatNumber(requestedRepayAmount)} {position.debtToken.symbol} (${formatUSD(requestedRepayAmountUSD)})</li>
                    {isCollateralInsufficient && (
                      <li className="text-orange-400 text-xs pl-4">⚠️ Amount exceeds collateral support - will auto-retry with full debt</li>
                    )}
                  </>
                )}
                <li className={netGainLossUSD < 0 ? "text-red-400" : "text-green-400"}>
                  • Seize ALL collateral: {formatNumber(expectedSeizeTokens)} {position.collateralToken.symbol}
                </li>
                <li className="text-slate-400 text-xs pl-4">
                  ↳ Worth ${formatUSD(expectedSeizeUSD)} 
                  {netGainLossUSD >= 0 ? (
                    <span className="text-green-400"> (+{formatNumber(effectiveBonusPercent, 1)}% return)</span>
                  ) : (
                    <span className="text-red-400"> ({formatNumber(effectiveBonusPercent, 1)}% LOSS - bad debt prevention)</span>
                  )}
                </li>
                {!isBadDebtScenario && (
                  <li className="text-purple-400 text-xs pl-4">⚡ Auto-retry with full debt if bonus can't be supported</li>
                )}
              </>
            ) : (
              <>
                <li>• Buyout debt position</li>
                <li>• Repay debt: {formatNumber(position.buyoutDebtRepaymentTokens)} {position.debtToken.symbol} (${formatUSD(position.buyoutDebtRepayment)})</li>
                <li>• Pay premium: {formatNumber(bufferedPremiumTokens)} {premiumSymbol} (${formatUSD(bufferedPremiumUSD)})</li>
                <li className="text-cyan-400 text-xs pl-4">↳ Includes 5% buffer for debt fluctuations</li>
                <li className="text-cyan-400 text-xs pl-4">↳ Excess premium will be returned to you</li>
                <li>• Receive collateral: {formatNumber(position.totalCollateralTokens)} {position.collateralToken.symbol} (${formatUSD(position.totalCollateral)})</li>
              </>
            )}
            <li>• Execute atomic smart contract transaction</li>
            <li>• Remove position from marketplace</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LiquidationActionPanel;

