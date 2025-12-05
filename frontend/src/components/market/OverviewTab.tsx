import { motion } from "framer-motion";
import { BarChart3, Info, CheckCircle, Copy } from "lucide-react";
import { LendingMarket } from "../../types/lending";
import InterestRateModel from "../InterestRateModel";
import Tooltip from "../Tooltip";
import { ExplorerLinks } from "../app/explorerlinks";
import { useNetwork } from "../../context/networkContext";

interface OverviewTabProps {
  market: LendingMarket;
  copied: boolean;
  onCopy: (text: string) => void;
}

// Helper component to display network name
const NetworkDisplay = () => {
  const { isTestnet } = useNetwork();
  return (
    <span className="font-mono text-white text-sm">
      Algorand {isTestnet ? 'Testnet' : 'Mainnet'}
    </span>
  );
};

const OverviewTab = ({ market, copied, onCopy }: OverviewTabProps) => {
  const getUtilizationBgColor = (rate: number, market: LendingMarket) => {
    // rate is already normalized to the cap (0-100% where 100% = the cap)
    // kinkNormBps is also normalized (0-10000 where 10000 = 100% of cap)
    const kinkPercent = (market.kinkNormBps ?? 5000) / 100;
    
    // Red zone: 90% or more of the cap
    if (rate >= 90) return "from-red-500 to-red-600";
    // Amber zone: at or above the kink point
    if (rate >= kinkPercent) return "from-amber-500 to-amber-600";
    // Cyan zone: below the kink point
    return "from-cyan-500 to-blue-500";
  };

  return (
    <div className="space-y-4 md:space-y-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="inset-panel cut-corners-sm p-3 md:p-4">
            <div className="text-slate-400 text-xs font-mono mb-1 md:mb-2 uppercase tracking-wider flex items-center gap-1">
              Total Supply
              <Tooltip content="Total value of all assets deposited in this market" position="top">
                <Info className="w-3 h-3 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-base md:text-xl font-mono font-bold text-white tabular-nums">
              ${market.totalDepositsUSD.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {market.totalDeposits.toFixed(6)} {market.symbol}
            </div>
          </div>

          <div className="inset-panel cut-corners-sm p-3 md:p-4">
            <div className="text-slate-400 text-xs font-mono mb-1 md:mb-2 uppercase tracking-wider flex items-center gap-1">
              Total Borrows
              <Tooltip content="Total value of all assets currently borrowed from this market" position="top">
                <Info className="w-3 h-3 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-base md:text-xl font-mono font-bold text-white tabular-nums">
              ${market.totalBorrowsUSD.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {market.totalBorrows.toFixed(6)} {market.symbol}
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
              {market.borrowApr.toFixed(2)}%
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
                  market.utilizationRate,
                  market
                )} relative rounded-lg`}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(market.utilizationRate, 100)}%` 
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  minWidth: market.utilizationRate > 0 ? "14px" : "0px",
                }}
              />
            </div>
            <Tooltip content="Interest rates accelerate after kink to incentivize supply" position="top">
              <div 
                className="absolute top-0 h-3.5 w-0.5 bg-yellow-400 opacity-80 transform -translate-x-0.5 rounded-full"
                style={{ 
                  left: `${(market.kinkNormBps ?? 5000) / 100}%` 
                }}
              ></div>
            </Tooltip>
            <Tooltip content="Max utilization threshold. No further borrowing beyond this point" position="top">
              <div className="absolute top-0 left-[100%] h-3.5 w-1 bg-red-400 opacity-90 transform -translate-x-1 rounded-full"></div>
            </Tooltip>
          </div>
          <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
            <span>0%</span>
            <Tooltip content="Kink point: where interest rate slope increases sharply" position="top">
              <span className="text-yellow-400">
                Kink: {((market.kinkNormBps ?? 5000) / 100).toFixed(0)}%
              </span>
            </Tooltip>
            <Tooltip content="Utilization cap: maximum % that can be borrowed" position="top">
              <span className="text-red-400">Cap: {((market.utilCapBps ?? 8000) / 100).toFixed(0)}%</span>
            </Tooltip>
          </div>
        </div>
      </motion.div>

      {/* Interest Rate Model */}
      <InterestRateModel market={market} />

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
                  onClick={() => onCopy(market.id)}
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
  );
};

export default OverviewTab;

