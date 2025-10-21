import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Radio,
  AlertCircle,
  ArrowLeft,
  Grid3x3,
  List,
  Info,
} from "lucide-react";
import AppLayout from "../components/app/AppLayout";
import MarketCard from "../components/MarketCard";
import MomentumSpinner from "../components/MomentumSpinner";
import { useMarkets } from "../hooks/useMarkets";
import { Link, useNavigate } from "react-router-dom";
import Tooltip from "../components/Tooltip";

const LendingMarketsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    // Load saved preference from localStorage
    const saved = localStorage.getItem("orbitalLendingViewMode");
    return (saved === "cards" || saved === "table") ? saved : "cards";
  });
  const { data: markets, isLoading, error, isError } = useMarkets();

  // Save view mode preference to localStorage
  useEffect(() => {
    localStorage.setItem("orbitalLendingViewMode", viewMode);
  }, [viewMode]);

  const filteredMarkets = (markets || []).filter((market) => {
    // Text search filter
    const matchesSearch = 
      market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (market.symbol?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && market.contractState === 1) ||
      (statusFilter === "inactive" && market.contractState === 0);
    
    return matchesSearch && matchesStatus;
  });

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
        {/* Navigation Link */}
        <div className="mb-4 md:mb-4">
          <Link 
            to="/app"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs sm:text-sm md:text-base group"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-150" />
            <span className="uppercase tracking-wide">Back to Home</span>
          </Link>
        </div>

        {/* Mission Control Header */}
        <motion.div
          className="mb-5 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Mission Control Strip */}
          <div className="relative mb-5 md:mb-8">
            <div className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
              {/* Mobile-first responsive layout */}
              <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
                {/* Top section: Title and Status badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Radio className="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
                    <span className="text-xs sm:text-base md:text-lg font-mono font-semibold text-slate-300 uppercase tracking-wide">
                      MISSION CONTROL
                    </span>
                  </div>
                  {/* Status badges */}
                  <Tooltip content="Running on Algorand Testnet - Use test tokens only" position="bottom">
                    <div className="text-amber-400 cut-corners-sm px-2 py-1 md:px-4 md:py-2 border border-amber-400 shadow-inset shrink-0">
                      <span className="text-amber-400 text-[10px] sm:text-xs md:text-sm font-mono font-semibold uppercase tracking-wide">
                        TESTNET
                      </span>
                    </div>
                  </Tooltip>
                </div>

                {/* Divider */}
                <div className="hidden lg:block h-8 w-px bg-slate-600 mx-6"></div>

                {/* Stats section */}
                <div className="grid grid-cols-3 gap-2 md:gap-6 lg:gap-8 lg:flex lg:items-center">
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase tracking-wide text-xs sm:text-xs md:text-sm mb-0.5 flex items-center gap-1">
                      TVL:
                      <Tooltip content="Total Value Locked: Sum of all assets deposited across markets" position="bottom">
                        <Info className="w-3 h-3 cursor-help" />
                      </Tooltip>
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums text-sm sm:text-base md:text-lg">
                      {isLoading
                        ? "..."
                        : `$${formatNumber((markets || [])
                            .reduce(
                              (acc, market) => acc + market.totalDepositsUSD,
                              0
                            ), 0)}`}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase tracking-wide text-xs sm:text-xs md:text-sm mb-0.5 flex items-center gap-1">
                      Borrowed:
                      <Tooltip content="Total amount borrowed across all markets" position="bottom">
                        <Info className="w-3 h-3 cursor-help" />
                      </Tooltip>
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums text-sm sm:text-base md:text-lg">
                      {isLoading
                        ? "..."
                        : `$${formatNumber((markets || [])
                            .reduce(
                              (acc, market) => acc + market.totalBorrowsUSD,
                              0
                            ), 0)}`}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase tracking-wide text-xs sm:text-xs md:text-sm mb-0.5 flex items-center gap-1">
                      Avg Util:
                      <Tooltip content="Average utilization rate across all markets" position="bottom">
                        <Info className="w-3 h-3 cursor-help" />
                      </Tooltip>
                    </span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums text-sm sm:text-base md:text-lg">
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

          <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-mono font-bold mb-3 sm:mb-4 md:mb-6 text-white tracking-tight">
            ORBITAL <span className="text-cyan-400">MARKETS</span>
          </h1>
          <p className="text-xs sm:text-base md:text-xl text-slate-300 max-w-4xl font-mono leading-relaxed mb-5 sm:mb-6 md:mb-8">
            Supply assets to earn interest • Borrow against your collateral •
            Monitor your positions
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="flex flex-col md:flex-row gap-3 md:gap-4 mb-5 md:mb-8"
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
          <div className="flex gap-2 md:gap-3 justify-end">
            {/* View Mode Toggle */}
            <div className="flex border border-slate-600 bg-slate-800">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-2 md:px-3 py-2.5 md:py-3 transition-all duration-150 ${
                  viewMode === "cards"
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
                aria-label="Card view"
              >
                <Grid3x3 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-2 md:px-3 py-2.5 md:py-3 transition-all duration-150 ${
                  viewMode === "table"
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
                aria-label="Table view"
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-slate-800 border border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition-all duration-150 text-slate-300 font-mono text-xs md:text-sm appearance-none cursor-pointer min-w-[120px]"
              >
                <option value="all">ALL MARKETS</option>
                <option value="active">ACTIVE ONLY</option>
                <option value="inactive">INACTIVE ONLY</option>
              </select>
              <Filter className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-slate-400 pointer-events-none" />
            </div>
            <Tooltip content="Sort markets by Annual Percentage Rate" position="bottom">
              <button className="px-3 md:px-4 py-2.5 md:py-3 bg-slate-800 border border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition-all duration-150 text-slate-300 font-mono text-xs md:text-sm">
                SORT: APR
              </button>
            </Tooltip>
          </div>
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
              <MomentumSpinner 
                size="48" 
                speed="1.1" 
                color="#06b6d4" 
                className="mx-auto mb-4" 
              />
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

        {/* Orbital Markets Grid/Table */}
        {!isLoading && !isError && (
          <>
            {viewMode === "cards" ? (
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
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider">
                        Market
                      </th>
                      <th className="px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-right">
                        <span className="inline-flex items-center gap-1 justify-end">
                          Supply APR
                          <Tooltip content="Annual rate earned by depositing assets" position="top">
                            <Info className="w-3 h-3 cursor-help" />
                          </Tooltip>
                        </span>
                      </th>
                      <th className="px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-right">
                        <span className="inline-flex items-center gap-1 justify-end">
                          Borrow APR
                          <Tooltip content="Annual rate charged on borrowed assets" position="top">
                            <Info className="w-3 h-3 cursor-help" />
                          </Tooltip>
                        </span>
                      </th>
                      <th className="hidden md:table-cell px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-right">
                        <span className="inline-flex items-center gap-1 justify-end">
                          Utilization
                          <Tooltip content="% of supplied assets currently borrowed" position="top">
                            <Info className="w-3 h-3 cursor-help" />
                          </Tooltip>
                        </span>
                      </th>
                      <th className="px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-right">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <span className="hidden sm:inline">TVL</span>
                          <span className="sm:hidden">TVL/Avail</span>
                          <Tooltip content="Total value of assets deposited in this market" position="top">
                            <Info className="w-3 h-3 cursor-help" />
                          </Tooltip>
                        </span>
                      </th>
                      <th className="hidden md:table-cell px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-right">
                        <span className="inline-flex items-center gap-1 justify-end">
                          Available
                          <Tooltip content="Amount available to borrow from this market" position="top">
                            <Info className="w-3 h-3 cursor-help" />
                          </Tooltip>
                        </span>
                      </th>
                      <th className="hidden lg:table-cell px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-center">
                        <span className="inline-flex items-center gap-1 justify-center">
                          Status
                          <Tooltip content="Current operational status of the market" position="top">
                            <Info className="w-3 h-3 cursor-help" />
                          </Tooltip>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarkets.map((market) => (
                      <tr
                        key={market.id}
                        className="border-b border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/app/markets/details?id=${market.id}`)}
                      >
                        <td className="px-3 md:px-4 py-3 md:py-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <img
                              src={market.image}
                              alt={market.name}
                              className="w-6 h-6 md:w-8 md:h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NmZjZjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMkwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEyTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiMwMDIwMzMiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                              }}
                            />
                            <div>
                              <div className="text-white font-mono text-xs sm:text-sm md:text-base font-semibold">
                                {market.name}
                              </div>
                              <div className="text-slate-400 font-mono text-[10px] sm:text-xs hidden sm:block">
                                {market.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3 md:py-4 text-right">
                          <div className="text-green-400 font-mono font-bold text-xs sm:text-sm md:text-base">
                            {market.supplyApr.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3 md:py-4 text-right">
                          <div className="text-cyan-400 font-mono font-bold text-xs sm:text-sm md:text-base">
                            {market.borrowApr.toFixed(2)}%
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 md:px-4 py-3 md:py-4 text-right">
                          <div className="text-white font-mono text-xs sm:text-sm md:text-base">
                            {market.utilizationRate.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3 md:py-4 text-right">
                          <div className="text-white font-mono font-semibold text-xs sm:text-sm md:text-base">
                            <span className="hidden sm:inline">${formatNumber(market.totalDepositsUSD, 0)}</span>
                            <span className="sm:hidden">
                              <div>${formatNumber(market.totalDepositsUSD, 0)}</div>
                              <div className="text-[10px] text-slate-400">${formatNumber(market.availableToBorrowUSD, 0)}</div>
                            </span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 md:px-4 py-3 md:py-4 text-right">
                          <div className="text-slate-300 font-mono text-xs sm:text-sm md:text-base">
                            ${formatNumber(market.availableToBorrowUSD, 0)}
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-3 md:px-4 py-3 md:py-4 text-center">
                          {market.contractState === 1 && (
                            <Tooltip content="Market is active and accepting all transactions" position="left">
                              <span className="inline-flex items-center gap-1 px-2 py-1 border border-green-500/60 text-[10px] font-mono text-green-400 uppercase">
                                <Radio className="w-2.5 h-2.5" />
                                Active
                              </span>
                            </Tooltip>
                          )}
                          {market.contractState === 2 && (
                            <Tooltip content="Market is migrating to a new version" position="left">
                              <span className="inline-flex items-center gap-1 px-2 py-1 border border-amber-500/60 text-[10px] font-mono text-amber-400 uppercase">
                                <Radio className="w-2.5 h-2.5" />
                                Migrating
                              </span>
                            </Tooltip>
                          )}
                          {market.contractState === 0 && (
                            <Tooltip content="Market is inactive - transactions are paused" position="left">
                              <span className="inline-flex items-center gap-1 px-2 py-1 border border-red-500/60 text-[10px] font-mono text-red-400 uppercase">
                                <AlertCircle className="w-2.5 h-2.5" />
                                Inactive
                              </span>
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
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
