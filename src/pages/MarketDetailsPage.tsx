/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Radio,
  Zap,
  BarChart3,
  DollarSign,
  Wallet
} from 'lucide-react';
import AppLayout from '../components/app/AppLayout';
import { LendingMarket } from '../types/lending';

// Mock market data - in real app this would come from API
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

// Mock user position data
interface UserPosition {
  supplied: number;
  borrowed: number;
  collateralValue: number;
  healthFactor: number;
}

// Mock collateral relationships
const COLLATERAL_RELATIONSHIPS = {
  "744427912": {
    acceptsAsCollateral: ["744427950", "ethereum", "bitcoin"],
    usableAsCollateralFor: ["744427950", "ethereum"]
  },
  "744427950": {
    acceptsAsCollateral: ["744427912", "ethereum", "bitcoin"],
    usableAsCollateralFor: ["744427912", "ethereum"]
  }
};

const MarketDetailsPage = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow'>('supply');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  // Mock user position - in real app this would come from wallet/API
  const [userPosition] = useState<UserPosition>({
    supplied: 0,
    borrowed: 0,
    collateralValue: 0,
    healthFactor: 0
  });

  const market = LENDING_MARKETS.find(m => m.id === marketId);

  useEffect(() => {
    if (!market) {
      navigate('/markets');
    }
  }, [market, navigate]);

  if (!market) {
    return null;
  }

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(decimals)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(decimals)}K`;
    }
    return num.toFixed(decimals);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-400';
    if (rate >= 70) return 'text-amber-400';
    return 'text-cyan-400';
  };

  const getUtilizationBgColor = (rate: number) => {
    if (rate >= 90) return 'from-red-500 to-red-600';
    if (rate >= 70) return 'from-amber-500 to-amber-600';
    return 'from-cyan-500 to-blue-500';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock interest rate calculation
  const calculateInterestRate = (utilization: number) => {
    if (utilization < 50) {
      return 2 + (utilization * 0.1);
    } else {
      const baseRate = 2 + (50 * 0.1);
      const kinkRate = (utilization - 50) * 0.4;
      return baseRate + kinkRate;
    }
  };

  return (
    <AppLayout>
      <div className="container-section py-8">
        {/* Navigation Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('app/markets')}
            className="flex items-center gap-3 mb-6 text-slate-400 hover:text-white transition-colors duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono text-sm uppercase tracking-wide">Back to Markets</span>
          </button>

          {/* Market Header */}
          <div className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative w-16 h-16 planet-ring">
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
                <div>
                  <h1 className="text-3xl font-mono font-bold text-white mb-2">{market.symbol}</h1>
                  <p className="text-slate-400 font-mono">{market.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2 text-cyan-400">
                  <Radio className="w-5 h-5" />
                  <span className="text-sm font-mono font-semibold uppercase tracking-wide">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Market Overview */}
            <motion.div
              className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wide">Market Overview</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="inset-panel cut-corners-sm p-4">
                  <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">Total Supply</div>
                  <div className="text-2xl font-mono font-bold text-white tabular-nums">${formatNumber(market.totalDeposits * 100)}M</div>
                  <div className="text-sm text-slate-500 font-mono">{formatNumber(market.totalDeposits)}M {market.symbol}</div>
                </div>
                
                <div className="inset-panel cut-corners-sm p-4">
                  <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">Supply APR</div>
                  <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">{market.supplyApr.toFixed(2)}%</div>
                </div>

                <div className="inset-panel cut-corners-sm p-4">
                  <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">Borrow APR</div>
                  <div className="text-2xl font-mono font-bold text-amber-400 tabular-nums">{market.borrowApr.toFixed(2)}%</div>
                  
                </div>

                <div className="inset-panel cut-corners-sm p-4">
                  <div className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">Utilization</div>
                  <div className={`text-2xl font-mono font-bold tabular-nums ${getUtilizationColor(market.utilizationRate)}`}>
                    {market.utilizationRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-500 font-mono">At capacity</div>
                </div>
              </div>

              {/* Utilization Track */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400 text-sm font-mono uppercase tracking-wider">Market Utilization</span>
                  <span className="text-white text-sm font-mono font-semibold tabular-nums">{market.utilizationRate.toFixed(1)}% of Cap</span>
                </div>
                <div className="relative">
                  <div className="orbital-ring w-full bg-noise-dark">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${getUtilizationBgColor(market.utilizationRate)} relative rounded-lg`}
                      initial={{ width: 0 }}
                      animate={{ width: `${market.utilizationRate}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{ minWidth: market.utilizationRate > 0 ? '14px' : '0px' }}
                    />
                  </div>
                  <div className="absolute top-0 left-[50%] h-3.5 w-0.5 bg-yellow-400 opacity-80 transform -translate-x-0.5 rounded-full"></div>
                  <div className="absolute top-0 left-[100%] h-3.5 w-1 bg-red-400 opacity-90 transform -translate-x-1 rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-500 mt-2">
                  <span>0%</span>
                  <span className="text-yellow-400">Kink: 50%</span>
                  <span className="text-red-400">Cap: 100%</span>
                </div>
              </div>
            </motion.div>

            {/* Interest Rate Model */}
            <motion.div
              className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wide">Interest Rate Model</h2>
                <div className="text-cyan-500 cut-corners-sm px-3 py-1 border border-cyan-500 shadow-inset">
                  <span className="text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wide">Kink Model</span>
                </div>
              </div>

              {/* Interest Rate Chart */}
              <div className="relative h-64 mb-6 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                <div className="absolute inset-4">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-mono text-slate-400">
                    <span>50%</span>
                    <span>40%</span>
                    <span>30%</span>
                    <span>20%</span>
                    <span>10%</span>
                    <span>0%</span>
                  </div>
                  
                  {/* Chart area */}
                  <div className="ml-8 mr-4 h-full relative">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="absolute w-full border-t border-slate-700/50" style={{ top: `${i * 20}%` }} />
                    ))}
                    
                    {/* Current utilization marker */}
                    <div 
                      className="absolute top-0 bottom-0 border-l-2 border-cyan-400 opacity-80"
                      style={{ left: `${market.utilizationRate}%` }}
                    >
                      <div className="absolute -top-6 -left-8 text-xs font-mono text-cyan-400 font-bold">
                        Current: {market.utilizationRate.toFixed(1)}%
                      </div>
                    </div>
                    
                    {/* Kink point marker */}
                    <div className="absolute top-0 bottom-0 left-[50%] border-l border-yellow-400 opacity-60">
                      <div className="absolute -top-6 -left-6 text-xs font-mono text-yellow-400">
                        Kink: 50%
                      </div>
                    </div>
                  </div>
                  
                  {/* X-axis labels */}
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
                <h3 className="text-sm font-mono font-bold text-white mb-3 uppercase tracking-wide">Rate Formula</h3>
                <div className="space-y-2 text-sm font-mono text-slate-300">
                  <div>Base Rate: <span className="text-cyan-400">2%</span></div>
                  <div>Pre-Kink Multiplier: <span className="text-cyan-400">0.1 per % utilization</span></div>
                  <div>Post-Kink Multiplier: <span className="text-amber-400">0.4 per % utilization</span></div>
                  <div className="pt-2 border-t border-slate-700">
                    Current Rate: <span className="text-white font-bold">{calculateInterestRate(market.utilizationRate).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Collateral Relationships */}
           {/*  <motion.div
              className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wide">Collateral Network</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="inset-panel cut-corners-sm p-5">
                  <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wide">Accepts as Collateral</h3>
                  <div className="space-y-3">
                    {COLLATERAL_RELATIONSHIPS[market.id]?.acceptsAsCollateral.map((assetId, index) => (
                      <div key={assetId} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-xs font-mono text-white">{index + 1}</span>
                          </div>
                          <span className="font-mono text-slate-300">{assetId === '744427950' ? 'COMPXt' : assetId.charAt(0).toUpperCase() + assetId.slice(1)}</span>
                        </div>
                        <div className="text-cyan-400 text-sm font-mono">75% LTV</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="inset-panel cut-corners-sm p-5">
                  <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wide">Usable as Collateral For</h3>
                  <div className="space-y-3">
                    {COLLATERAL_RELATIONSHIPS[market.id]?.usableAsCollateralFor.map((assetId, index) => (
                      <div key={assetId} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-xs font-mono text-white">{index + 1}</span>
                          </div>
                          <span className="font-mono text-slate-300">{assetId === '744427950' ? 'COMPXt' : assetId.charAt(0).toUpperCase() + assetId.slice(1)}</span>
                        </div>
                        <div className="text-amber-400 text-sm font-mono">Active</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
 */}
            {/* Contract Information */}
            <motion.div
              className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Info className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wide">Contract Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">Token ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white text-sm">{market.id}</span>
                      <button
                        onClick={() => copyToClipboard(market.id)}
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">Decimals</span>
                    <span className="font-mono text-white text-sm">6</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">Oracle Price</span>
                    <span className="font-mono text-white text-sm">$0.9834</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">Network</span>
                    <span className="font-mono text-white text-sm">Algorand Testnet</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">Market Type</span>
                    <span className="font-mono text-white text-sm">LST Pool</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">Explorer</span>
                    <div className="flex items-center gap-2">
                      <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Panel - Right Side */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* User Position Overview */}
            <div className="text-slate-600 cut-corners-lg p-6 bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wide">Your Position</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-slate-400 text-sm">Supplied</span>
                  <div className="text-right">
                    <div className="font-mono text-white font-bold">{formatNumber(userPosition.supplied)}</div>
                    <div className="font-mono text-slate-500 text-xs">~${formatNumber(userPosition.supplied * 100)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-mono text-slate-400 text-sm">Borrowed</span>
                  <div className="text-right">
                    <div className="font-mono text-white font-bold">{formatNumber(userPosition.borrowed)}</div>
                    <div className="font-mono text-slate-500 text-xs">~${formatNumber(userPosition.borrowed * 100)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                  <span className="font-mono text-slate-400 text-sm">Health Factor</span>
                  <div className="text-right">
                    <div className="font-mono text-green-400 font-bold">
                      {userPosition.healthFactor > 0 ? userPosition.healthFactor.toFixed(2) : '∞'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="text-slate-600 cut-corners-lg p-6 bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wide">Market Actions</h3>
              </div>

              {/* Tab Selector */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('supply')}
                  className={`flex-1 h-10 px-4 cut-corners-sm font-mono text-sm font-semibold transition-all duration-150 ${
                    activeTab === 'supply'
                      ? 'bg-cyan-600 border-2 border-cyan-500 text-white'
                      : 'bg-slate-700 border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <span className="relative z-20">SUPPLY</span>
                </button>
                <button
                  onClick={() => setActiveTab('borrow')}
                  className={`flex-1 h-10 px-4 cut-corners-sm font-mono text-sm font-semibold transition-all duration-150 ${
                    activeTab === 'borrow'
                      ? 'bg-blue-600 border-2 border-blue-500 text-white'
                      : 'bg-slate-700 border-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600'
                  }`}
                  disabled={market.availableToBorrow === 0}
                >
                  <span className="relative z-20">BORROW</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-slate-400 text-sm uppercase tracking-wide">Amount</span>
                    <button className="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wide">
                      MAX
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 px-4 bg-slate-800 border-2 border-slate-600 cut-corners-sm text-white font-mono text-lg focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-sm">{market.symbol}</span>
                      <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                        <img
                          src={market.image}
                          alt={market.symbol}
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="inset-panel cut-corners-sm p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-mono text-slate-400">
                      {activeTab === 'supply' ? 'Supply APR' : 'Borrow APR'}
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {activeTab === 'supply' ? `+${market.supplyApr.toFixed(2)}%` : `${market.borrowApr.toFixed(2)}%`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-mono text-slate-400">Available</span>
                    <span className="font-mono text-white">
                      {activeTab === 'supply' 
                        ? `${formatNumber(999)}M ${market.symbol}` 
                        : `${formatNumber(market.availableToBorrow)}M ${market.symbol}`
                      }
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-mono text-slate-400">Gas Fee</span>
                    <span className="font-mono text-white">~0.001 ALGO</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className={`w-full h-12 cut-corners-sm font-mono text-sm font-semibold transition-all duration-150 ${
                    amount && parseFloat(amount) > 0
                      ? activeTab === 'supply'
                        ? 'bg-cyan-600 border-2 border-cyan-500 text-white hover:bg-cyan-500 shadow-top-highlight'
                        : 'bg-blue-600 border-2 border-blue-500 text-white hover:bg-blue-500 shadow-top-highlight'
                      : 'bg-slate-700 border-2 border-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                  disabled={!amount || parseFloat(amount) <= 0 || (activeTab === 'borrow' && market.availableToBorrow === 0)}
                >
                  <span className="relative z-20">
                    {activeTab === 'supply' ? `SUPPLY ${market.symbol}` : `BORROW ${market.symbol}`}
                  </span>
                </button>

                {activeTab === 'borrow' && market.availableToBorrow === 0 && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                    <AlertCircle className="w-4 h-4" />
                    <span>Market at capacity</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MarketDetailsPage;
