import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { LendingMarket } from "../types/lending";

interface MarketCardProps {
  market: LendingMarket;
  index: number;
  formatNumber: (num: number, decimals?: number) => string;
  getUtilizationBgColor: (rate: number) => string;
}

const MarketCard: React.FC<MarketCardProps> = ({
  market,
  index,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formatNumber,
  getUtilizationBgColor,
}) => {
  const navigate = useNavigate();
  return (
    <motion.div
      key={market.id}
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
    >
      {/* Industrial Planet Card */}
      <div className="text-slate-600 cut-corners-lg p-8 hover:text-slate-500 transition-all duration-150 bg-noise-dark border-2 border-slate-600 shadow-industrial hover:shadow-industrial-hover relative">
        {/* Edge lighting */}
        <div className="absolute inset-0 cut-corners-lg shadow-edge-glow pointer-events-none"></div>

        {/* Planet Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            {/* Enhanced Planet Token */}
            <div className="relative">
              <div className="relative w-14 h-14 planet-ring">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-2 border-slate-500">
                  <img
                    src={market.image}
                    alt={`${market.name} planet`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NmZjZjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMkwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEyTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiMwMDIwMzMiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-mono font-semibold text-white">
                {market.symbol}
              </h3>
              <p className="text-slate-400 font-mono text-sm">{market.name}</p>
            </div>
          </div>

          {/* Enhanced Orbital Parameters */}
          <div className="flex flex-col items-end gap-3">
            <div className="text-cyan-500 cut-corners-sm px-4 py-2 border border-cyan-500 shadow-inset">
              <span className="text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wide">
                LTV {market.ltv}%
              </span>
            </div>
            <div className="text-amber-500 cut-corners-sm px-4 py-2 border border-amber-500 shadow-inset">
              <span className="text-amber-400 text-xs font-mono font-semibold uppercase tracking-wide">
                LT {market.liquidationThreshold}%
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Primary Telemetry - Inset Panels */}
        <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="inset-panel cut-corners-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                SUPPLY APR
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-cyan-400 tabular-nums tracking-tight">
              {market.supplyApr.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 mt-2 font-mono">
              Kink at 50% of cap; rates rise faster beyond.
            </div>
          </div>
          <div className="inset-panel cut-corners-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                BORROW APR
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-cyan-400 tabular-nums tracking-tight">
              {market.borrowApr.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 mt-2 font-mono">
              Kink at 50% of cap; rates rise faster beyond.
            </div>
          </div>
          
        </div>

        {/* Enhanced Orbital Track - Thick Industrial Gauge */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">
              UTILIZATION
            </span>
            <span className="text-white text-sm font-mono font-semibold tabular-nums">
              {market.utilizationRate.toFixed(1)}% OF CAP
            </span>
          </div>
          <div className="relative">
            {/* Industrial Orbit Track */}
            <div className="orbital-ring w-full bg-noise-dark">
              <motion.div
                className={`h-full bg-gradient-to-r ${getUtilizationBgColor(
                  market.utilizationRate
                )} relative rounded-lg`}
                initial={{ width: 0 }}
                animate={{ width: `${market.utilizationRate}%` }}
                transition={{
                  duration: 1.4,
                  delay: 0.5 + index * 0.1,
                  ease: "easeOut",
                }}
                style={{
                  minWidth: market.utilizationRate > 0 ? "14px" : "0px",
                }}
              >
                
              </motion.div>
            </div>

            {/* Enhanced markers */}
            <div className="absolute top-0 left-[50%] h-3.5 w-0.5 bg-yellow-400 opacity-80 transform -translate-x-0.5 rounded-full"></div>
            <div className="absolute top-0 left-[100%] h-3.5 w-1 bg-red-400 opacity-90 transform -translate-x-1 rounded-full"></div>

            {/* Kink indicator */}
            {market.utilizationRate >= 90 && (
              <motion.div
                className="absolute -top-1 left-[100%] transform -translate-x-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-red-400 rounded-full opacity-80"></div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Enhanced Station Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
              SUPPLIED
            </div>
            <div className="text-xl font-mono font-bold text-white tabular-nums">
              ${(market.totalDepositsUSD).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
              BORROWED
            </div>
            <div className="text-xl font-mono font-bold text-white tabular-nums">
              ${(market.totalBorrowsUSD).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">
              AVAILABLE
            </div>
            <div className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
              ${(market.availableToBorrowUSD).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Enhanced Command Interface - Industrial Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/app/markets/details?id=${market.id}`)}
            className="flex-1 h-12 px-4 bg-slate-700 border-2 border-slate-600 cut-corners-sm font-mono text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-600 hover:border-slate-500 transition-all duration-150 shadow-inset relative z-10"
          >
            <span className="relative z-20">DETAILS</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketCard;
