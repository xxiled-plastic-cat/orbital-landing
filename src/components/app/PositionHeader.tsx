import {  Wallet, Target } from "lucide-react";
import { motion } from "framer-motion";
import { LendingMarket } from "../../types/lending";
import { getLoanRecordReturnType } from "../../contracts/lending/interface";
import Tooltip from "../Tooltip";

interface PositionHeaderProps {
  market: LendingMarket;
  userDepositRecord?: {
    assetId: bigint;
    depositAmount: bigint;
  } | null;
  userDebt?: getLoanRecordReturnType;
}

const PositionHeader = ({ market, userDepositRecord, userDebt }: PositionHeaderProps) => {
  // Helper function to calculate user's deposit amount for this market
  const getUserDepositAmount = () => {
    if (!userDepositRecord || !userDepositRecord.depositAmount) return 0;
    return Number(userDepositRecord.depositAmount) / Math.pow(10, 6); // Convert from microunits
  };

  // Helper function to calculate total debt from bigint
  const getTotalDebt = () => {
    if (!userDebt || !userDebt.principal) return 0;
    return Number(userDebt.principal) / Math.pow(10, 6); // Convert from microunits
  };
/* 
  // Helper function to get collateral amount from bigint
  const getCollateralAmount = () => {
    if (!userDebt || !userDebt.collateralAmount) return 0;
    return Number(userDebt.collateralAmount) / Math.pow(10, 6); // Convert from microunits
  }; */

  // Helper function to calculate health factor (simplified)
  /* const getHealthFactor = () => {
    const totalDebt = getTotalDebt();
    const collateralAmount = getCollateralAmount();
    
    if (!userDebt || totalDebt === 0 || collateralAmount === 0) return null;
    
    // Simplified health factor calculation
    // In reality, this would need oracle prices and proper collateral valuation
    const liquidationThreshold = market.liquidationThreshold / 100;
    return (collateralAmount * liquidationThreshold) / totalDebt;
  }; */

  // Helper function to get health factor color
 /*  const getHealthFactorColor = (hf: number | null) => {
    if (hf === null) return "text-slate-400";
    if (hf >= 2) return "text-green-400";
    if (hf >= 1.5) return "text-yellow-400";
    if (hf >= 1.2) return "text-orange-400";
    return "text-red-400";
  }; */

  // Helper function to get base token symbol (removes 'c' prefix if LST)
  const getBaseTokenSymbol = (symbol?: string): string => {
    if (!symbol) return "";
    return symbol.startsWith("c") ? symbol.substring(1) : symbol;
  };

  const depositAmount = getUserDepositAmount();
  const totalDebt = getTotalDebt();
  //const healthFactor = getHealthFactor();

  // Don't render if no position
  if (depositAmount === 0 && totalDebt === 0) {
    return null;
  }

  return (
    <motion.div
      className="text-slate-600 cut-corners-lg p-4 md:p-6 bg-noise-dark border-2 border-slate-600 shadow-industrial mb-4 md:mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Supplied Position */}
        <Tooltip content="Your deposited assets earning interest in this market" position="bottom">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-mono text-xs text-slate-400 uppercase tracking-wide mb-1">
                Supplied
              </div>
              <div className="font-mono text-lg font-bold text-white">
                {depositAmount.toFixed(2)} {getBaseTokenSymbol(market.symbol)}
              </div>
            </div>
          </div>
        </Tooltip>

        {/* Center: Health Factor (if borrowing) */}
        {/* {healthFactor !== null && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-mono text-xs text-slate-400 uppercase tracking-wide mb-1">
                Health Factor
              </div>
              <div className={`font-mono text-lg font-bold ${getHealthFactorColor(healthFactor)}`}>
                {healthFactor.toFixed(2)}
              </div>
            </div>
          </div>
        )} */}

        {/* Right: Borrowed Position */}
        {totalDebt > 0 && (
          <Tooltip content="Total debt including accrued interest that must be repaid" position="bottom">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-mono text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Borrowed
                </div>
                <div className="font-mono text-lg font-bold text-white">
                  {totalDebt.toFixed(2)} {getBaseTokenSymbol(market.symbol)}
                </div>
              </div>
            </div>
          </Tooltip>
        )}
      </div>
    </motion.div>
  );
};

export default PositionHeader;
