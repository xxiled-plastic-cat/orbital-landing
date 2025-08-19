import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, Radio, Zap } from 'lucide-react';
import AppLayout from '../components/app/AppLayout';
import MarketCard from '../components/MarketCard';
import { LendingMarket } from '../types/lending';

// Mock market data based on the testnet tokens
const LENDING_MARKETS: LendingMarket[] = [
  {
    id: "744427912",
    name: "xUSD Testnet",
    symbol: "xUSDt",
    image: "/xUSDt.svg",
    ltv: 70.0,
    liquidationThreshold: 82.0,
    supplyApr: 40.50,
    borrowApr: 12.31,
    utilizationRate: 100.0,
    totalDeposits: 2.00,
    totalBorrows: 1.65,
    availableToBorrow: 0,
    isActive: true,
  },
  {
    id: "744427950",
    name: "CompX Token Testnet",
    symbol: "COMPXt",
    image: "/COMPXt.svg",
    ltv: 75.0,
    liquidationThreshold: 85.0,
    supplyApr: 12.31,
    borrowApr: 40.50,
    utilizationRate: 54.5,
    totalDeposits: 5.50,
    totalBorrows: 2.40,
    availableToBorrow: 2.00,
    isActive: true,
  },
];

const LendingMarketsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMarkets = LENDING_MARKETS.filter(market =>
    market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.symbol.toLowerCase().includes(searchQuery.toLowerCase())
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
    if (rate >= 90) return 'from-red-500 to-red-600'; // Danger
    if (rate >= 70) return 'from-amber-500 to-amber-600'; // Warning
    return 'from-cyan-500 to-blue-500'; // Thruster blue
  };

  return (
    <AppLayout>
      <div className="container-section py-8">
        {/* Mission Control Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Mission Control Strip */}
          <div className="relative mb-8">
            <div className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <Radio className="w-6 h-6 text-cyan-400" />
                    <span className="text-lg font-mono font-semibold text-slate-300 uppercase tracking-wide">MISSION CONTROL</span>
                  </div>
                  <div className="h-8 w-px bg-slate-600"></div>
                  <div className="flex items-center gap-8 text-sm">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wide">TVL:</span>
                      <span className="ml-3 font-mono font-bold text-white tabular-nums text-lg">{formatNumber(LENDING_MARKETS.reduce((acc, market) => acc + market.totalDeposits, 0))}M</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase tracking-wide">Total Borrowed:</span>
                      <span className="ml-3 font-mono font-bold text-white tabular-nums text-lg">{formatNumber(LENDING_MARKETS.reduce((acc, market) => acc + market.totalBorrows, 0))}M</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase tracking-wide">Avg Util:</span>
                      <span className="ml-3 font-mono font-bold text-cyan-400 tabular-nums text-lg">{(LENDING_MARKETS.reduce((acc, market) => acc + market.utilizationRate, 0) / LENDING_MARKETS.length).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-amber-400 cut-corners-sm px-4 py-2 border border-amber-400 shadow-inset">
                    <span className="text-amber-400 text-sm font-mono font-semibold uppercase tracking-wide">TESTNET</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm font-mono font-semibold uppercase tracking-wide">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-mono font-bold mb-6 text-white tracking-tight">
            ORBITAL <span className="text-cyan-400">MARKETS</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-4xl font-mono leading-relaxed">
            Supply assets to earn interest • Borrow against your collateral • Monitor your positions
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="SCAN MARKETS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-150"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg hover:border-slate-500 hover:bg-slate-700 transition-all duration-150 text-slate-300 font-mono text-sm">
              <Filter className="w-4 h-4" />
              <span>FILTER</span>
            </button>
            <button className="px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg hover:border-slate-500 hover:bg-slate-700 transition-all duration-150 text-slate-300 font-mono text-sm">
              SORT: APR
            </button>
          </div>
        </motion.div>

        {/* Mission Control Telemetry - Enhanced */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { label: 'ACTIVE MARKETS', value: LENDING_MARKETS.length, icon: Radio, unit: '' },
            { label: 'TOTAL SUPPLIED', value: `${formatNumber(LENDING_MARKETS.reduce((acc, market) => acc + market.totalDeposits, 0))}M`, icon: TrendingUp, unit: '' },
            { label: 'TOTAL BORROWED', value: `${formatNumber(LENDING_MARKETS.reduce((acc, market) => acc + market.totalBorrows, 0))}M`, icon: TrendingDown, unit: '' },
          ].map((stat) => (
            <div key={stat.label} className="relative">
              <div className="text-slate-600 cut-corners-md p-6 h-24 hover:text-slate-500 transition-all duration-150 bg-noise-dark">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <stat.icon className="w-4 h-4 text-cyan-400" />
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">{stat.label}</div>
                  </div>  
                </div>
                <div className="text-3xl font-mono font-bold text-white tabular-nums tracking-tight">
                  {stat.value}{stat.unit}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Orbital Markets Grid */}
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

        {/* Empty State */}
        {filteredMarkets.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-slate-600 cut-corners-lg p-8">
              <Radio className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <div className="text-slate-400 font-mono mb-4">NO ORBITAL SIGNALS DETECTED</div>
              <button
                onClick={() => setSearchQuery('')}
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