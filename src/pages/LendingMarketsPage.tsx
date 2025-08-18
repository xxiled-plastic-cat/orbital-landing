import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, Info, Radio, Zap } from 'lucide-react';
import AppLayout from '../components/app/AppLayout';

// Market data interface
interface LendingMarket {
  id: string;
  name: string;
  symbol: string;
  image: string;
  ltv: number; // Loan-to-value ratio
  liquidationThreshold: number;
  currentApr: number;
  utilizationRate: number;
  totalDeposits: number;
  totalBorrows: number;
  availableToBorrow: number;
  isActive: boolean;
}

// Mock market data based on the testnet tokens
const LENDING_MARKETS: LendingMarket[] = [
  {
    id: "744427912",
    name: "xUSD Testnet",
    symbol: "xUSDt",
    image: "/xUSDt.svg",
    ltv: 70.0,
    liquidationThreshold: 82.0,
    currentApr: 40.50,
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
    currentApr: 12.31,
    utilizationRate: 54.5,
    totalDeposits: 5.50,
    totalBorrows: 2.40,
    availableToBorrow: 2.00,
    isActive: true,
  },
];

const LendingMarketsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

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

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-400'; // Danger: magenta/red
    if (rate >= 70) return 'text-amber-400'; // Warning: amber
    return 'text-cyan-400'; // Positive: thruster blue/cyan
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
          {/* Mission Control Strip */}
          <div className="relative mb-6">
            {/* Background with subtle noise texture */}
            <div className="text-slate-600 cut-corners-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-mono text-slate-300">MISSION CONTROL</span>
                  </div>
                  <div className="h-6 w-px bg-slate-600"></div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-slate-400">TVL:</span>
                      <span className="ml-2 font-mono text-white">{formatNumber(LENDING_MARKETS.reduce((acc, market) => acc + market.totalDeposits, 0))}M</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Borrowed:</span>
                      <span className="ml-2 font-mono text-white">{formatNumber(LENDING_MARKETS.reduce((acc, market) => acc + market.totalBorrows, 0))}M</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Avg Util:</span>
                      <span className="ml-2 font-mono text-cyan-400">{(LENDING_MARKETS.reduce((acc, market) => acc + market.utilizationRate, 0) / LENDING_MARKETS.length).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-amber-400 cut-corners-sm px-3 py-1">
                    <span className="text-amber-400 text-sm font-mono">TESTNET</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-mono">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-mono font-bold mb-4 text-white">
            ORBITAL <span className="text-cyan-400">MARKETS</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl font-mono">
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

        {/* Station Telemetry */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { label: 'ACTIVE MARKETS', value: LENDING_MARKETS.length, icon: Radio, unit: '' },
            { label: 'TOTAL SUPPLIED', value: `${formatNumber(LENDING_MARKETS.reduce((acc, market) => acc + market.totalDeposits, 0))}M`, icon: TrendingUp, unit: '' },
            { label: 'TOTAL BORROWED', value: `${formatNumber(LENDING_MARKETS.reduce((acc, market) => acc + market.totalBorrows, 0))}M`, icon: TrendingDown, unit: '' },
          ].map((stat, index) => (
            <div key={stat.label} className="relative">
              <div className="text-slate-600 cut-corners-md p-4 hover:text-slate-500 transition-all duration-150">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5 text-cyan-400" />
                  <div className="text-xs font-mono text-slate-400">{stat.label}</div>
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-1">
                  {stat.value}{stat.unit}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Orbital Markets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMarkets.map((market, index) => (
            <motion.div
              key={market.id}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              {/* Planet Card - Industrial Design with Cut Corners */}
              <div className="text-slate-600 cut-corners-lg p-6 hover:text-slate-500 transition-all duration-150">
                
                {/* Planet Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {/* Planet Token - Textured Disk */}
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 bg-slate-700 rounded-full border-2 border-slate-600"></div>
                      <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                        <img
                          src={market.image}
                          alt={`${market.name} planet`}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NmZjZjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMkwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEyTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiMwMDIwMzMiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-mono font-bold text-white">{market.symbol}</h3>
                      <p className="text-slate-400 font-mono text-sm">{market.name}</p>
                    </div>
                  </div>

                  {/* Orbital Parameters */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-cyan-400 cut-corners-sm px-3 py-1">
                      <span className="text-cyan-400 text-xs font-mono">LTV {market.ltv}%</span>
                    </div>
                    <div className="text-amber-400 cut-corners-sm px-3 py-1">
                      <span className="text-amber-400 text-xs font-mono">LT {market.liquidationThreshold}%</span>
                    </div>
                  </div>
                </div>

                {/* Primary Telemetry */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-slate-600 cut-corners-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-400 text-xs font-mono">BORROW APR</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-cyan-400">{market.currentApr.toFixed(2)}%</div>
                  </div>
                  <div className="text-slate-600 cut-corners-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400 text-xs font-mono">UTILIZATION</span>
                    </div>
                    <div className={`text-3xl font-mono font-bold ${getUtilizationColor(market.utilizationRate)}`}>
                      {market.utilizationRate.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Orbit Gauge - Utilization Ring */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400 text-xs font-mono">UTILIZATION</span>
                    <span className="text-white text-sm font-mono">{market.utilizationRate.toFixed(1)}% OF CAP</span>
                  </div>
                  <div className="relative">
                    {/* Orbit Ring Background */}
                    <div className="w-full bg-slate-700 rounded-lg h-4 overflow-hidden border border-slate-600">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${getUtilizationBgColor(market.utilizationRate)} relative`}
                        initial={{ width: 0 }}
                        animate={{ width: `${market.utilizationRate}%` }}
                        transition={{ duration: 1.2, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                      >
                        {/* Kink marker at 80% */}
                        {market.utilizationRate > 80 && (
                          <div className="absolute right-0 top-0 h-full w-1 bg-white opacity-60"></div>
                        )}
                      </motion.div>
                    </div>
                    {/* 80% Cap Marker */}
                    <div className="absolute top-0 left-[80%] h-4 w-0.5 bg-amber-400 opacity-75"></div>
                  </div>
                </div>

                {/* Station Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-slate-400 text-xs font-mono mb-1">SUPPLIED</div>
                    <div className="text-lg font-mono font-bold text-white">{formatNumber(market.totalDeposits)}M</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-xs font-mono mb-1">BORROWED</div>
                    <div className="text-lg font-mono font-bold text-white">{formatNumber(market.totalBorrows)}M</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-xs font-mono mb-1">AVAILABLE</div>
                    <div className="text-lg font-mono font-bold text-cyan-400">{formatNumber(market.availableToBorrow)}M</div>
                  </div>
                </div>

                {/* Command Interface */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedMarket(market.id)}
                    className="flex-1 text-slate-600 cut-corners-sm px-4 py-3 font-mono text-sm hover:text-slate-500 transition-all duration-150"
                  >
                    <span className="text-slate-300 hover:text-white">DETAILS</span>
                  </button>
                  <button className="flex-1 text-cyan-500 cut-corners-sm px-4 py-3 font-mono text-sm hover:text-cyan-400 transition-all duration-150">
                    <span className="text-white">SUPPLY</span>
                  </button>
                  <button
                    className={`flex-1 px-4 py-3 cut-corners-sm font-mono text-sm transition-all duration-150 ${
                      market.availableToBorrow > 0
                        ? 'text-blue-500 hover:text-blue-400'
                        : 'text-slate-500 cursor-not-allowed'
                    }`}
                    disabled={market.availableToBorrow === 0}
                  >
                    <span className={market.availableToBorrow > 0 ? 'text-white' : 'text-slate-400'}>
                      {market.availableToBorrow > 0 ? 'BORROW' : 'AT CAP'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
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