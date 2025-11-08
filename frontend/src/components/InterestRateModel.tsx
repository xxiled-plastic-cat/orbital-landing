import { motion } from "framer-motion";
import { TrendingUp, Info } from "lucide-react";
import { LendingMarket } from "../types/lending";
import Tooltip from "./Tooltip";

interface InterestRateModelProps {
  market: LendingMarket;
}

const InterestRateModel = ({ market }: InterestRateModelProps) => {
  // Extract interest rate model parameters with defaults
  const baseBps = market.baseBps ?? 200; // 2% default
  const utilCapBps = market.utilCapBps ?? 8000; // 80% default
  const kinkNormBps = market.kinkNormBps ?? 5000; // 50% default
  const slope1Bps = market.slope1Bps ?? 1000; // 10% default
  const slope2Bps = market.slope2Bps ?? 4000; // 40% default
  const maxAprBps = market.maxAprBps ?? 60000; // 600% default
  const rateModelType = market.rateModelType ?? 0; // Kinked model default

  // Calculate interest rate at any utilization point
  const calculateInterestRate = (utilization: number): number => {
    // Convert utilization percentage to normalized basis points (0-10000)
    const utilizationBps = Math.min(utilization * 100, utilCapBps);
    const normalizedUtil = (utilizationBps / utilCapBps) * 10000;
    
    let aprBps: number;
    
    if (rateModelType === 0) { // Kinked model
      if (normalizedUtil <= kinkNormBps) {
        // Before kink: base + slope1 * (util / kink)
        aprBps = baseBps + (slope1Bps * normalizedUtil) / kinkNormBps;
      } else {
        // After kink: base + slope1 + slope2 * ((util - kink) / (10000 - kink))
        const over = normalizedUtil - kinkNormBps;
        const denom = 10000 - kinkNormBps;
        aprBps = baseBps + slope1Bps + (slope2Bps * over) / denom;
      }
      
      // Apply max APR cap if set
      if (maxAprBps > 0 && aprBps > maxAprBps) {
        aprBps = maxAprBps;
      }
    } else {
      // Fixed rate fallback
      aprBps = baseBps;
    }
    
    return aprBps / 100; // Convert basis points to percentage
  };

  // Kink is normalized to the cap (0-100% where 100% = cap)
  const kinkUtilization = kinkNormBps / 100;
  const maxUtilization = 100; // Cap is always 100% in normalized view
  return (
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
        <Tooltip content={rateModelType === 0 ? "Rate accelerates after kink to maintain liquidity" : "Fixed interest rate model"} position="bottom">
          <div className="text-cyan-500 cut-corners-sm px-3 py-1 border border-cyan-500 shadow-inset">
            <span className="text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wide">
              {rateModelType === 0 ? "Kink Model" : "Fixed Rate"}
            </span>
          </div>
        </Tooltip>
      </div>

      {/* Interest Rate Chart */}
      <div className="relative h-64 mb-6 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <div className="absolute inset-4">
          {/* Y-axis labels - Dynamic based on max APR */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-mono text-slate-400">
            {(() => {
              const absoluteMaxUtil = utilCapBps / 100;
              // Use the actual max APR cap, or calculate a reasonable max if no cap is set
              const maxDisplayRate = maxAprBps > 0 ? maxAprBps / 100 : Math.max(calculateInterestRate(absoluteMaxUtil) * 1.2, 50);
              const steps = 5;
              const stepSize = maxDisplayRate / steps;
              return Array.from({ length: steps + 1 }, (_, i) => (
                <span key={i}>{(maxDisplayRate - i * stepSize).toFixed(0)}%</span>
              ));
            })()}
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

            {/* Interest Rate Curve */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="rateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset={`${(kinkUtilization / maxUtilization) * 100}%`} stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset={`${(kinkUtilization / maxUtilization) * 100}%`} stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path
                d={(() => {
                  const points: string[] = [];
                  const absoluteMaxUtil = utilCapBps / 100; // Actual cap percentage
                  // Use the same maxDisplayRate calculation as Y-axis
                  const maxDisplayRate = maxAprBps > 0 ? maxAprBps / 100 : Math.max(calculateInterestRate(absoluteMaxUtil) * 1.2, 50);
                  
                  // Generate curve points - loop through normalized utilization (0-100)
                  for (let normalizedUtil = 0; normalizedUtil <= 100; normalizedUtil += 2) {
                    // Convert normalized to absolute for rate calculation
                    const absoluteUtil = (normalizedUtil / 100) * absoluteMaxUtil;
                    const rate = calculateInterestRate(absoluteUtil);
                    const x = normalizedUtil;
                    const y = 100 - (Math.min(rate, maxDisplayRate) / maxDisplayRate) * 100;
                    points.push(`${x},${y}`);
                  }
                  
                  return `M ${points.join(' L ')}`;
                })()}
                stroke="url(#rateGradient)"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Current utilization marker */}
            <div
              className="absolute top-0 bottom-0 border-l-2 border-cyan-400 opacity-80"
              style={{ left: `${market.utilizationRate}%` }}
            >
              <div className="absolute -top-6 -left-8 text-xs font-mono text-cyan-400 font-bold whitespace-nowrap">
                Current: {market.borrowApr.toFixed(1)}%
              </div>
            </div>

            {/* Kink point marker */}
            <div 
              className="absolute top-0 bottom-0 border-l border-yellow-400 opacity-60"
              style={{ left: `${kinkUtilization}%` }}
            >
              <div className="absolute -top-6 -left-6 text-xs font-mono text-yellow-400 whitespace-nowrap">
                Kink: {kinkUtilization.toFixed(0)}%
              </div>
            </div>

            {/* Utilization cap marker */}
            <div className="absolute top-0 bottom-0 right-0 border-l border-red-400 opacity-60">
              <div className="absolute -top-6 -right-6 text-xs font-mono text-red-400 whitespace-nowrap">
                Cap: 100%
              </div>
            </div>
          </div>

          {/* X-axis labels - Normalized (0-100% where 100% = cap) */}
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
          <div className="flex items-center gap-1">
            Base Rate: <span className="text-cyan-400">{(baseBps / 100).toFixed(2)}%</span>
            <Tooltip content="Minimum interest rate when utilization is 0%" position="right">
              <Info className="w-3 h-3 text-slate-500 cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            Utilization Cap:{" "}
            <span className="text-red-400">{(utilCapBps / 100).toFixed(0)}%</span>
            <Tooltip content="Maximum % of funds that can be borrowed" position="right">
              <Info className="w-3 h-3 text-slate-500 cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            Kink Point:{" "}
            <span className="text-yellow-400">{kinkUtilization.toFixed(0)}%</span>
            <Tooltip content="Utilization threshold where rate slope increases sharply (normalized to cap)" position="right">
              <Info className="w-3 h-3 text-slate-500 cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            Pre-Kink Slope:{" "}
            <span className="text-cyan-400">{(slope1Bps / 100).toFixed(1)}% per full utilization</span>
            <Tooltip content="Rate of interest increase before the kink point" position="right">
              <Info className="w-3 h-3 text-slate-500 cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            Post-Kink Slope:{" "}
            <span className="text-amber-400">
              {(slope2Bps / 100).toFixed(1)}% per full utilization
            </span>
            <Tooltip content="Rate of interest increase after kink (usually steeper)" position="right">
              <Info className="w-3 h-3 text-slate-500 cursor-help" />
            </Tooltip>
          </div>
          {maxAprBps > 0 && (
            <div className="flex items-center gap-1">
              Max APR Cap:{" "}
              <span className="text-red-400">{(maxAprBps / 100).toFixed(0)}%</span>
              <Tooltip content="Maximum interest rate cap regardless of utilization" position="right">
                <Info className="w-3 h-3 text-slate-500 cursor-help" />
              </Tooltip>
            </div>
          )}
          <div className="pt-2 border-t border-slate-700">
            <div className="flex items-center gap-1">
              Current Rate:{" "}
              <span className="text-white font-bold">
                {market.borrowApr.toFixed(2)}%
              </span>
              <Tooltip content="Current borrow rate based on market utilization" position="right">
                <Info className="w-3 h-3 text-slate-500 cursor-help" />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Normalization note */}
      <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700/50 rounded text-xs font-mono text-slate-400 flex gap-2 items-center">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span>
          Note: All data points above are normalized to the utilization cap of{" "}
          <span className="text-red-400 font-semibold">{(utilCapBps / 100).toFixed(0)}%</span>
          
        </span>
      </div>
    </motion.div>
  );
};

export default InterestRateModel;
