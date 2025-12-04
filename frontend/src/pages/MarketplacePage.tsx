import React, { useState, useMemo, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowLeft,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Search,
  Grid3x3,
  List,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AppLayout from '../components/app/AppLayout';
import DebtPositionCard from '../components/DebtPositionCard';
import { Link, useNavigate } from 'react-router-dom';
import NetworkBadge from '../components/app/NetworkBadge';
import { useOptimizedDebtPositions } from '../hooks/useOptimizedLoanRecords';
import MomentumSpinner from '../components/MomentumSpinner';
import PriceStatusIndicator from '../components/PriceStatusIndicator';
import { DebtPosition } from '../types/lending';
import { WalletContext } from '../context/wallet';
import { useWallet } from '@txnlab/use-wallet-react';

// DebtPosition interface is now imported from types/lending.ts


type SortOrder = 'asc' | 'desc';

const MarketplacePage: React.FC = () => {
  const { activeAddress } = useWallet();
  const { setDisplayWalletConnectModal } = useContext(WalletContext);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    // Load saved preference from localStorage (separate from lending markets)
    const saved = localStorage.getItem("orbitalMarketplaceViewMode");
    return (saved === "cards" || saved === "table") ? saved : "cards";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const navigate = useNavigate();

  // Use optimized data with cached pricing (fixed LST market lookup)
  const { data: debtPositions = [], isLoading, error } = useOptimizedDebtPositions();

  // Save view mode preference to localStorage
  useEffect(() => {
    localStorage.setItem("orbitalMarketplaceViewMode", viewMode);
  }, [viewMode]);

  const filteredAndSortedPositions = useMemo(() => {
    // First filter by search query
    let filtered = debtPositions;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = debtPositions.filter((position) => {
        const debtTokenMatch = 
          position.debtToken.symbol.toLowerCase().includes(query) ||
          position.debtToken.name.toLowerCase().includes(query);
        const collateralTokenMatch = 
          position.collateralToken.symbol.toLowerCase().includes(query) ||
          position.collateralToken.name.toLowerCase().includes(query);
        
        return debtTokenMatch || collateralTokenMatch;
      });
    }
    
    // Then sort the filtered results
    return filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.healthRatio - b.healthRatio;
      } else {
        return b.healthRatio - a.healthRatio;
      }
    });
  }, [debtPositions, sortOrder, searchQuery]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredAndSortedPositions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPositions = filteredAndSortedPositions.slice(startIndex, endIndex);

  // Reset to page 1 when search query or sort order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePositionClick = (position: DebtPosition) => {
    navigate(`/app/marketplace/position/${position.id}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    if (sortOrder === 'asc') return ArrowUp;
    return ArrowDown;
  };

  const SortIcon = getSortIcon();

  return (
    <AppLayout title="Mercury Trading Post">
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
              <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
                {/* Top section: Title and Status badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
                    <span className="text-xs sm:text-base md:text-lg font-mono font-semibold text-slate-300 uppercase tracking-wide">
                      MISSION CONTROL
                    </span>
                  </div>
                  {/* Status badges */}
                  <NetworkBadge />
                </div>

                {/* Divider */}
                <div className="hidden lg:block h-8 w-px bg-slate-600 mx-6"></div>

                {/* Stats section */}
                <div className="grid grid-cols-2 gap-2 md:gap-6 lg:gap-8 lg:flex lg:items-center">
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase tracking-wide text-xs sm:text-xs md:text-sm mb-0.5">
                      Active Positions:
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums text-sm sm:text-base md:text-lg">
                      {filteredAndSortedPositions.length}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase tracking-wide text-xs sm:text-xs md:text-sm mb-0.5">
                      Total Debt:
                    </span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums text-sm sm:text-base md:text-lg">
                      ${filteredAndSortedPositions.reduce((sum, pos) => sum + pos.totalDebtUSD, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-mono font-bold mb-3 sm:mb-4 md:mb-6 text-white tracking-tight">
            MERCURY <span className="text-cyan-400">TRADING POST</span>
          </h1>
          <p className="text-xs sm:text-base md:text-xl text-slate-300 max-w-4xl font-mono leading-relaxed mb-5 sm:mb-6 md:mb-8">
            Trade tokenized debt positions at Mercury Trading Post. 
            Buy and sell debt tokens with transparent pricing, instant settlement, and orbital-grade security.
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
              placeholder="SEARCH BY TOKEN NAME OR SYMBOL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 font-mono text-sm md:text-base focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-150"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2 md:gap-3 justify-end items-center">
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

            <PriceStatusIndicator showDetails={false} />
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-slate-800 border border-slate-600 hover:border-slate-500 hover:bg-slate-700 transition-all duration-150 text-slate-300 font-mono text-xs md:text-sm"
            >
              <span className="uppercase tracking-wide">
                {sortOrder === 'asc' ? 'Risk First' : 'Healthy First'}
              </span>
              <SortIcon className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </motion.div>

        {/* No Wallet Connected State */}
        {!activeAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center py-12">
              <div className="text-slate-600 cut-corners-lg p-8 bg-slate-800/20">
                <Wallet className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <div className="text-slate-300 font-mono mb-4 text-lg">
                  CONNECT WALLET TO VIEW TRADING POST
                </div>
                <div className="text-slate-400 text-sm font-mono mb-6 max-w-md mx-auto">
                  Connect your wallet to browse available debt positions, view pricing, and start trading on Mercury Trading Post.
                </div>
                <button
                  onClick={() => setDisplayWalletConnectModal(true)}
                  className="text-cyan-500 cut-corners-sm px-6 py-3 font-mono text-sm hover:text-cyan-400 transition-all duration-150 border border-cyan-500 hover:border-cyan-400"
                >
                  <span className="text-white">CONNECT WALLET</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {activeAddress && isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center py-12">
              <div className="text-slate-600 cut-corners-lg p-8 bg-slate-800/20">
                <MomentumSpinner 
                  size="48" 
                  speed="1.1" 
                  color="#06b6d4" 
                  className="mx-auto mb-4" 
                />
                <div className="text-slate-400 font-mono mb-4">
                  SCANNING DEBT POSITIONS...
                </div>
                <div className="text-slate-500 text-sm font-mono">
                  Loading positions from the blockchain
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {activeAddress && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center py-12">
              <div className="text-slate-600 cut-corners-lg p-8 bg-slate-800/20">
                <DollarSign className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <div className="text-red-400 font-mono mb-4">
                  FAILED TO LOAD POSITIONS
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-cyan-500 cut-corners-sm px-6 py-3 font-mono text-sm hover:text-cyan-400 transition-all duration-150 border border-cyan-500 hover:border-cyan-400"
                >
                  <span className="text-white">RETRY</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Debt Positions Grid/Table */}
        {activeAddress && !isLoading && !error && filteredAndSortedPositions.length > 0 ? (
          <>
            {viewMode === "cards" ? (
              <div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {paginatedPositions.map((position, index) => (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: (index % itemsPerPage) * 0.1 }}
                  >
                    <DebtPositionCard 
                      position={position} 
                      onClick={handlePositionClick}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider">
                        Debt Token
                      </th>
                      <th className="px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider">
                        Collateral
                      </th>
                      <th className="hidden md:table-cell px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-right">
                        Total Debt
                      </th>
                      <th className="px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-right">
                        Health
                      </th>
                      <th className="hidden lg:table-cell px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-right">
                        Buyout Cost
                      </th>
                      <th className="hidden sm:table-cell px-3 md:px-4 py-3 md:py-4 text-[10px] sm:text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider text-right">
                        Collateral Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPositions.map((position) => (
                      <tr
                        key={position.id}
                        className="border-b border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => handlePositionClick(position)}
                      >
                        <td className="px-3 md:px-4 py-3 md:py-4">
                          <div className="font-mono text-white font-semibold text-xs sm:text-sm md:text-base">
                            {position.debtToken.symbol}
                          </div>
                          <div className="text-slate-400 font-mono text-[10px] sm:text-xs">
                            {position.totalDebt.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3 md:py-4">
                          <div className="font-mono text-white font-semibold text-xs sm:text-sm md:text-base">
                            {position.collateralToken.symbol}
                          </div>
                          <div className="text-slate-400 font-mono text-[10px] sm:text-xs">
                            {position.totalCollateralTokens.toFixed(2)}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 md:px-4 py-3 md:py-4 text-right">
                          <div className="text-white font-mono font-semibold text-xs sm:text-sm md:text-base">
                            ${position.totalDebtUSD.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3 md:py-4 text-right">
                          <div className={`font-mono font-bold text-xs sm:text-sm md:text-base ${
                            position.healthRatio < position.liquidationThreshold 
                              ? 'text-red-400' 
                              : position.healthRatio < position.liquidationThreshold * 1.2 
                              ? 'text-amber-400' 
                              : 'text-green-400'
                          }`}>
                            {position.healthRatio.toFixed(3)}
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-3 md:px-4 py-3 md:py-4 text-right">
                          <div className="text-cyan-400 font-mono font-semibold text-xs sm:text-sm md:text-base">
                            ${position.buyoutCost.toFixed(2)}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 md:px-4 py-3 md:py-4 text-right">
                          <div className="text-slate-300 font-mono text-xs sm:text-sm md:text-base">
                            ${position.totalCollateral.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <motion.div
                className="mt-6 md:mt-8 p-4 md:p-6 border-t border-slate-600 bg-slate-800/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-slate-400 font-mono">
                    Page <span className="text-cyan-400 font-bold">{currentPage}</span> of <span className="text-cyan-400 font-bold">{totalPages}</span>
                    <span className="hidden sm:inline">
                      {' '}• Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedPositions.length)} of {filteredAndSortedPositions.length}
                    </span>
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-3 py-2 font-mono text-sm border transition-all duration-150 ${
                        currentPage === 1
                          ? 'text-slate-600 border-slate-700 cursor-not-allowed'
                          : 'text-cyan-400 border-cyan-600 hover:bg-cyan-900/20 hover:border-cyan-500'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">PREV</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {/* First Page */}
                      {currentPage > 3 && (
                        <>
                          <button
                            onClick={() => goToPage(1)}
                            className="w-8 h-8 sm:w-10 sm:h-10 font-mono text-sm border border-cyan-600 text-cyan-400 hover:bg-cyan-900/20 hover:border-cyan-500 transition-all duration-150"
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="text-slate-500 px-1">...</span>
                          )}
                        </>
                      )}

                      {/* Current page and nearby pages */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return page === currentPage || 
                                 page === currentPage - 1 || 
                                 page === currentPage + 1 ||
                                 (currentPage <= 2 && page <= 3) ||
                                 (currentPage >= totalPages - 1 && page >= totalPages - 2);
                        })
                        .map(page => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 font-mono text-sm border transition-all duration-150 ${
                              page === currentPage
                                ? 'bg-cyan-600 border-cyan-500 text-white font-bold'
                                : 'border-cyan-600 text-cyan-400 hover:bg-cyan-900/20 hover:border-cyan-500'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                      {/* Last Page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="text-slate-500 px-1">...</span>
                          )}
                          <button
                            onClick={() => goToPage(totalPages)}
                            className="w-8 h-8 sm:w-10 sm:h-10 font-mono text-sm border border-cyan-600 text-cyan-400 hover:bg-cyan-900/20 hover:border-cyan-500 transition-all duration-150"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 px-3 py-2 font-mono text-sm border transition-all duration-150 ${
                        currentPage === totalPages
                          ? 'text-slate-600 border-slate-700 cursor-not-allowed'
                          : 'text-cyan-400 border-cyan-600 hover:bg-cyan-900/20 hover:border-cyan-500'
                      }`}
                    >
                      <span className="hidden sm:inline">NEXT</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : null}

        {/* Empty State - No positions found */}
        {activeAddress && !isLoading && !error && filteredAndSortedPositions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center py-12">
              <div className="text-slate-600 cut-corners-lg p-8 bg-slate-800/20">
                {searchQuery ? (
                  <>
                    <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <div className="text-slate-400 font-mono mb-4">
                      NO MATCHING POSITIONS
                    </div>
                    <div className="text-slate-500 text-sm font-mono">
                      No debt positions match your search for "{searchQuery}"
                    </div>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <div className="text-slate-400 font-mono mb-4">
                      NO POSITIONS AVAILABLE
                    </div>
                    <div className="text-slate-500 text-sm font-mono">
                      No debt positions currently available for trading
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default MarketplacePage;
