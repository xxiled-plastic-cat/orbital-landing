import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Radio,
  AlertCircle,
  Loader,
  ArrowLeft,
} from "lucide-react";
import AppLayout from "../components/app/AppLayout";
import MarketCard from "../components/MarketCard";
import { useMarkets } from "../hooks/useMarkets";
import { Link } from "react-router-dom";

const LendingMarketsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: markets, isLoading, error, isError } = useMarkets();

  const filteredMarkets = (markets || []).filter(
    (market) =>
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (market.symbol?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(decimals)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(decimals)}K`;
    }
    return num.toFixed(decimals);
  };

  const getUtilizationBgColor = (rate: number) => {
    if (rate >= 90) return "from-red-500 to-red-600"; // Danger
    if (rate >= 70) return "from-amber-500 to-amber-600"; // Warning
    return "from-cyan-500 to-blue-500"; // Thruster blue
  };

  return (
    <AppLayout>
      <div className="container-section py-4 md:py-8">
        {/* Mission Control Header */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Mission Control Strip */}
          <div className="relative mb-6 md:mb-8">
            <div className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
              {/* Mobile-first responsive layout */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
                {/* Top section: Title and Status badges */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 md:gap-3 justify-between w-full">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Radio className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                      <span className="text-base md:text-lg font-mono font-semibold text-slate-300 uppercase tracking-wide">
                        MISSION CONTROL
                      </span>
                    </div>
                    {/* Status badges */}
                    <div className="text-amber-400 cut-corners-sm px-2 py-1 md:px-4 md:py-2 border border-amber-400 shadow-inset">
                      <span className="text-amber-400 text-xs md:text-sm font-mono font-semibold uppercase tracking-wide">
                        TESTNET
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block h-8 w-px bg-slate-600 mx-6"></div>

                {/* Stats section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 lg:gap-8 text-sm lg:flex lg:items-center">
                  <div className="flex flex-col sm:block">
                    <span className="text-slate-400 uppercase tracking-wide text-xs md:text-sm">
                      TVL:
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3">
                      {isLoading
                        ? "..."
                        : `$${(markets || [])
                            .reduce(
                              (acc, market) => acc + market.totalDepositsUSD,
                              0
                            )
                            .toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex flex-col sm:block">
                    <span className="text-slate-400 uppercase tracking-wide text-xs md:text-sm">
                      Total Borrowed:
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3">
                      {isLoading
                        ? "..."
                        : `$${(markets || [])
                            .reduce(
                              (acc, market) => acc + market.totalBorrowsUSD,
                              0
                            )
                            .toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex flex-col sm:block">
                    <span className="text-slate-400 uppercase tracking-wide text-xs md:text-sm">
                      Avg Util:
                    </span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3">
                      {isLoading
                        ? "..."
                        : markets && markets.length > 0
                        ? `${(
                            markets.reduce(
                              (acc, market) => acc + market.utilizationRate,
                              0
                            ) / markets.length
                          ).toFixed(1)}%`
                        : "0.0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-mono font-bold mb-4 md:mb-6 text-white tracking-tight">
            ORBITAL <span className="text-cyan-400">MARKETS</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-slate-300 max-w-4xl font-mono leading-relaxed mb-6 md:mb-8">
            Supply assets to earn interest • Borrow against your collateral •
            Monitor your positions
          </p>

          {/* Navigation Link */}
          <div className="flex items-center gap-4">
            <Link 
              to="/app"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm md:text-base group"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-150" />
              <span className="uppercase tracking-wide">Back to Home</span>
            </Link>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="SCAN MARKETS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 bg-slate-800 border border-slate-600  text-white placeholder-slate-400 font-mono text-sm md:text-base focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-150"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2 md:gap-3">
            <button className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-slate-800 border border-slate-600  hover:border-slate-500 hover:bg-slate-700 transition-all duration-150 text-slate-300 font-mono text-xs md:text-sm">
              <Filter className="w-3 h-3 md:w-4 md:h-4" />
              <span>FILTER</span>
            </button>
            <button className="px-3 md:px-4 py-2.5 md:py-3 bg-slate-800 border border-slate-600  hover:border-slate-500 hover:bg-slate-700 transition-all duration-150 text-slate-300 font-mono text-xs md:text-sm">
              SORT: APR
            </button>
          </div>
        </motion.div>

        {/* Mission Control Telemetry - Enhanced */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            {
              label: "ACTIVE MARKETS",
              value: isLoading ? "..." : markets?.length || 0,
              icon: Radio,
              unit: "",
            },
            {
              label: "TOTAL SUPPLIED",
              value: isLoading
                ? "..."
                : `$${(markets || [])
                    .reduce((acc, market) => acc + market.totalDepositsUSD, 0)
                    .toLocaleString()}`,
              icon: TrendingUp,
              unit: "",
            },
            {
              label: "TOTAL BORROWED",
              value: isLoading
                ? "..."
                : `$${(markets || [])
                    .reduce((acc, market) => acc + market.totalBorrowsUSD, 0)
                    .toLocaleString()}`,
              icon: TrendingDown,
              unit: "",
            },
          ].map((stat) => (
            <div key={stat.label} className="relative">
              <div className="text-slate-600 cut-corners-md p-4 md:p-4 h-20 md:h-24 hover:text-slate-500 transition-all duration-150 bg-noise-dark">
                <div className="flex items-start justify-between mb-2 md:mb-4">
                  <div className="flex items-center gap-1 md:gap-2">
                    <stat.icon className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                </div>
                <div className="text-xl md:text-3xl font-mono font-bold text-white tabular-nums tracking-tight">
                  {stat.value}
                  {stat.unit}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-slate-600 cut-corners-lg p-8">
              <Loader className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
              <div className="text-slate-400 font-mono mb-4">
                SCANNING ORBITAL MARKETS...
              </div>
              <div className="text-slate-500 text-sm font-mono">
                Fetching market data from the blockchain
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {isError && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-slate-600 cut-corners-lg p-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <div className="text-red-400 font-mono mb-4">
                CONNECTION ERROR
              </div>
              <div className="text-slate-500 text-sm font-mono mb-4">
                {error?.message || "Failed to load market data"}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-cyan-500 cut-corners-sm px-6 py-2 font-mono text-sm hover:text-cyan-400 transition-all duration-150 border border-cyan-500 hover:border-cyan-400"
              >
                <span className="text-white">RETRY SCAN</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Orbital Markets Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredMarkets.map((market, index) => (
              <MarketCard
                key={market.id}
                market={market}
                index={index}
                formatNumber={formatNumber}
                getUtilizationBgColor={getUtilizationBgColor}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredMarkets.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-slate-600 cut-corners-lg p-8">
              <Radio className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <div className="text-slate-400 font-mono mb-4">
                NO ORBITAL SIGNALS DETECTED
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-cyan-500 cut-corners-sm px-6 py-2 font-mono text-sm hover:text-cyan-400 transition-all duration-150"
              >
                <span className="text-white">RESET SCAN</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default LendingMarketsPage;
