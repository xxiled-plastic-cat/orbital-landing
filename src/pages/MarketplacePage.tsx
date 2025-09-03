import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowLeft,
  ShoppingCart,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import AppLayout from '../components/app/AppLayout';
import DebtPositionCard from '../components/DebtPositionCard';
import { Link, useNavigate } from 'react-router-dom';

interface DebtPosition {
  id: string;
  debtToken: {
    symbol: string;
    name: string;
    id: string;
  };
  collateralToken: {
    symbol: string;
    name: string;
    id: string;
  };
  userAddress: string;
  totalDebt: number;
  totalCollateral: number;
  healthRatio: number;
  liquidationThreshold: number;
  buyoutCost: number;
  liquidationBonus: number; // Percentage discount for liquidators (e.g., 8.5 = 8.5%)
}

// Mock data for debt positions
const mockDebtPositions: DebtPosition[] = [
  {
    id: '1',
    debtToken: { symbol: 'USDC', name: 'USD Coin', id: '31566704' },
    collateralToken: { symbol: 'ALGO', name: 'Algorand', id: '0' },
    userAddress: 'WXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCD',
    totalDebt: 850.50,
    totalCollateral: 5000.00,
    healthRatio: 1.65,
    liquidationThreshold: 1.20,
    buyoutCost: 892.03,
    liquidationBonus: 7.5 // USDC market liquidation bonus
  },
  {
    id: '2',
    debtToken: { symbol: 'USDT', name: 'Tether USD', id: '312769' },
    collateralToken: { symbol: 'ALGO', name: 'Algorand', id: '0' },
    userAddress: 'ABCD5678901234567890EFGHIJKLMNOPQRSTUVWXYZ1234567890EF',
    totalDebt: 1200.00,
    totalCollateral: 4200.00,
    healthRatio: 1.35,
    liquidationThreshold: 1.20,
    buyoutCost: 1260.00,
    liquidationBonus: 6.0 // USDT market liquidation bonus
  },
  {
    id: '3',
    debtToken: { symbol: 'USDC', name: 'USD Coin', id: '31566704' },
    collateralToken: { symbol: 'ALGO', name: 'Algorand', id: '0' },
    userAddress: 'PQRS9012345678901234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12',
    totalDebt: 2500.75,
    totalCollateral: 3800.00,
    healthRatio: 1.15,
    liquidationThreshold: 1.20,
    buyoutCost: 2375.71,
    liquidationBonus: 7.5 // USDC market liquidation bonus
  },
  {
    id: '4',
    debtToken: { symbol: 'USDT', name: 'Tether USD', id: '312769' },
    collateralToken: { symbol: 'ALGO', name: 'Algorand', id: '0' },
    userAddress: 'MNOP3456789012345678901234567890ABCDEFGHIJKLMNOPQRST',
    totalDebt: 750.00,
    totalCollateral: 3600.00,
    healthRatio: 1.92,
    liquidationThreshold: 1.20,
    buyoutCost: 787.50,
    liquidationBonus: 6.0 // USDT market liquidation bonus
  },
  {
    id: '5',
    debtToken: { symbol: 'USDC', name: 'USD Coin', id: '31566704' },
    collateralToken: { symbol: 'ALGO', name: 'Algorand', id: '0' },
    userAddress: 'EFGH7890123456789012345678901234567890ABCDEFGHIJKLMN',
    totalDebt: 1800.25,
    totalCollateral: 2300.00,
    healthRatio: 1.08,
    liquidationThreshold: 1.20,
    buyoutCost: 1710.24,
    liquidationBonus: 7.5 // USDC market liquidation bonus
  },
  {
    id: '6',
    debtToken: { symbol: 'USDT', name: 'Tether USD', id: '312769' },
    collateralToken: { symbol: 'ALGO', name: 'Algorand', id: '0' },
    userAddress: 'IJKL1234567890123456789012345678901234567890ABCDEFGH',
    totalDebt: 950.00,
    totalCollateral: 4800.00,
    healthRatio: 1.58,
    liquidationThreshold: 1.20,
    buyoutCost: 997.50,
    liquidationBonus: 6.0 // USDT market liquidation bonus
  }
];

type SortOrder = 'asc' | 'desc';

const MarketplacePage: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const navigate = useNavigate();

  const sortedPositions = useMemo(() => {
    return [...mockDebtPositions].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.healthRatio - b.healthRatio;
      } else {
        return b.healthRatio - a.healthRatio;
      }
    });
  }, [sortOrder]);

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
    <AppLayout title="Mercury Trading Post - Trade Tokenized Debt">
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
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 md:gap-3 justify-between w-full">
                    <div className="flex items-center gap-2 md:gap-3">
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                      <span className="text-base md:text-lg font-mono font-semibold text-slate-300 uppercase tracking-wide">
                        MERCURY TRADING POST
                      </span>
                    </div>
                    <div className="text-amber-400 cut-corners-sm px-2 py-1 md:px-4 md:py-2 border border-amber-400 shadow-inset">
                      <span className="text-amber-400 text-xs md:text-sm font-mono font-semibold uppercase tracking-wide">
                        TESTNET
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block h-8 w-px bg-slate-600 mx-6"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 lg:gap-8 text-sm lg:flex lg:items-center">
                  <div className="flex flex-col sm:block">
                    <span className="text-slate-400 uppercase tracking-wide text-xs md:text-sm">
                      Active Listings:
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3">
                      {sortedPositions.length}
                    </span>
                  </div>
                  <div className="flex flex-col sm:block">
                    <span className="text-slate-400 uppercase tracking-wide text-xs md:text-sm">
                      Total Volume:
                    </span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3">
                      {sortedPositions.reduce((sum, pos) => sum + pos.buyoutCost, 0).toFixed(0)} ALGO
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-mono font-bold mb-4 md:mb-6 text-white tracking-tight">
            MERCURY <span className="text-cyan-400">TRADING POST</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-slate-300 max-w-4xl font-mono leading-relaxed mb-6 md:mb-8">
            Trade tokenized debt positions at Mercury Trading Post. 
            Buy and sell debt tokens with transparent pricing, instant settlement, and orbital-grade security.
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

        {/* Main Content Area */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
            {/* Content Header */}
            <div className="p-4 md:p-6 border-b border-slate-600">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-cyan-400" />
                    AVAILABLE DEBT POSITIONS
                  </h2>
                  <p className="text-slate-400 font-mono text-sm mt-2">
                    Browse and trade tokenized debt from active lending positions
                  </p>
                </div>
                
                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-sm">Sort by Health:</span>
                  <button
                    onClick={toggleSortOrder}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-650 transition-colors"
                  >
                    <span className="text-slate-300 font-mono text-sm">
                      {sortOrder === 'asc' ? 'Risk First' : 'Healthy First'}
                    </span>
                    <SortIcon className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Debt Positions Grid */}
            <div className="p-4 md:p-6">
              <div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {sortedPositions.map((position, index) => (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <DebtPositionCard 
                      position={position} 
                      onClick={handlePositionClick}
                    />
                  </motion.div>
                ))}
              </div>
              
              {sortedPositions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-slate-600 cut-corners-lg p-8 bg-slate-800/20">
                    <DollarSign className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <div className="text-slate-400 font-mono mb-4">
                      NO POSITIONS AVAILABLE
                    </div>
                    <div className="text-slate-500 text-sm font-mono">
                      No debt positions currently available for trading
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default MarketplacePage;
