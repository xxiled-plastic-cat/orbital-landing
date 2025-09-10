import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  AlertTriangle,
  Shield,
  TrendingDown,
  DollarSign,
  Target
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AppLayout from '../components/app/AppLayout';
import { DebtPosition } from '../types/lending';
import { useDebtPosition } from '../hooks/useLoanRecords';

// DebtPosition interface is now imported from types/lending.ts


const DebtPositionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch the position by ID using real data
  const { data: position, isLoading, error } = useDebtPosition(id || '');
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatUSD = (num: number) => {
    if (num === 0) return '0.00';
    if (num < 0.01) {
      // For very small amounts, show up to 6 decimal places
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(num);
    } else if (num < 1) {
      // For amounts less than $1, show up to 4 decimal places
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(num);
    } else {
      // For amounts $1 and above, show 2 decimal places
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    }
  };

  const getHealthStatus = (healthRatio: number) => {
    if (healthRatio >= 1.5) {
      return {
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        borderColor: 'border-green-400',
        status: 'HEALTHY',
        icon: Shield
      };
    } else if (healthRatio >= 1.2) {
      return {
        color: 'text-amber-400',
        bgColor: 'bg-amber-400/10',
        borderColor: 'border-amber-400',
        status: 'NEARING LIQUIDATION',
        icon: AlertTriangle
      };
    } else {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-400/10',
        borderColor: 'border-red-400',
        status: 'LIQUIDATION ZONE',
        icon: TrendingDown
      };
    }
  };

  // Loading and error states
  if (isLoading) {
    return (
      <AppLayout title="Loading Position - Mercury Trading Post">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading debt position...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !position) {
    return (
      <AppLayout title="Position Not Found - Mercury Trading Post">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">
              {error ? 'Failed to load debt position' : 'Debt position not found'}
            </p>
            <Link 
              to="/app/marketplace" 
              className="px-4 py-2 bg-cyan-400 text-slate-900 rounded-lg hover:bg-opacity-80 font-semibold"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const healthStatus = getHealthStatus(position.healthRatio);
  const HealthIcon = healthStatus.icon;
  const isLiquidationZone = position.healthRatio < 1.2;

  const handleLiquidate = () => {
    console.log('Execute liquidation for position:', position.id);
    // TODO: Implement liquidation logic
  };

  const handleAcquire = () => {
    console.log('Execute acquisition for position:', position.id);
    // TODO: Implement acquisition logic
  };

  return (
    <AppLayout title={`Debt Position ${id} - Mercury Trading Post`}>
      <div className="container-section py-4 md:py-8">
        {/* Header */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/app/marketplace"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm md:text-base group"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-150" />
              <span className="uppercase tracking-wide">Back to Mercury Trading Post</span>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold mb-4 text-white tracking-tight">
            DEBT POSITION <span className="text-cyan-400">#{id}</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl font-mono leading-relaxed">
            Review and execute transactions on this debt position with detailed metrics and secure orbital transaction processing.
          </p>
        </motion.div>

        {/* Position Details Grid */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Position Info */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="p-4 md:p-6 border-b border-slate-600">
                <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  POSITION OVERVIEW
                </h2>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                {/* User & Health Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <span className="font-mono text-slate-300 text-lg">
                      {formatAddress(position.userAddress)}
                    </span>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg border ${healthStatus.borderColor} ${healthStatus.bgColor} flex items-center gap-2`}>
                    <HealthIcon className={`w-4 h-4 ${healthStatus.color}`} />
                    <span className={`font-mono font-semibold ${healthStatus.color}`}>
                      {healthStatus.status}
                    </span>
                  </div>
                </div>

                {/* Token Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">Debt Token</h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="font-mono font-bold text-xl text-white mb-1">
                        {position.debtToken.symbol}
                      </div>
                      <div className="text-slate-400 text-sm">{position.debtToken.name}</div>
                      <div className="text-slate-500 text-xs mt-1">ID: {position.debtToken.id}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">Collateral Token</h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="font-mono font-bold text-xl text-white mb-1">
                        {position.collateralToken.symbol}
                      </div>
                      <div className="text-slate-400 text-sm">{position.collateralToken.name}</div>
                      <div className="text-slate-500 text-xs mt-1">ID: {position.collateralToken.id}</div>
                    </div>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">Debt Amount</h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="font-mono font-bold text-2xl text-red-400">
                        {formatNumber(position.totalDebt)}
                      </div>
                      <div className="text-slate-400 text-sm">{position.debtToken.symbol}</div>
                      <div className="font-mono font-semibold text-lg text-slate-300 mt-2">
                        ${formatUSD(position.totalDebtUSD)}
                      </div>
                      <div className="text-slate-400 text-xs">USD Value</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">Collateral Value</h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="font-mono font-bold text-2xl text-cyan-400">
                        {formatNumber(position.totalCollateralTokens)}
                      </div>
                      <div className="text-slate-400 text-sm">{position.collateralToken.symbol}</div>
                      <div className="font-mono font-semibold text-lg text-slate-300 mt-2">
                        ${formatUSD(position.totalCollateral)}
                      </div>
                      <div className="text-slate-400 text-xs">USD Value</div>
                    </div>
                  </div>
                </div>

                {/* Health Metrics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">Current Health Ratio</h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className={`font-mono font-bold text-2xl ${healthStatus.color}`}>
                        {formatNumber(position.healthRatio, 3)}
                      </div>
                      <div className="text-slate-400 text-sm">Position Health</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">Liquidation Price</h3>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="font-mono font-bold text-2xl text-slate-300">
                        ${position.liquidationPrice ? formatNumber(position.liquidationPrice, 4) : 'N/A'}
                      </div>
                      <div className="text-slate-400 text-sm">Collateral Price</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transaction Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="p-4 md:p-6 border-b border-slate-600">
                <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  TRANSACTION
                </h2>
              </div>

              <div className="p-4 md:p-6 space-y-6">
                {/* Cost/Bonus Display */}
                <div>
                  <h3 className="text-slate-400 uppercase tracking-wide text-sm mb-3">
                    {isLiquidationZone ? 'Liquidation Bonus' : 'Buyout Cost'}
                  </h3>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="font-mono font-bold text-2xl text-white">
                      {isLiquidationZone 
                        ? `${formatNumber(position.liquidationBonus, 1)}%` 
                        : `${formatNumber(position.buyoutCost)} ALGO`
                      }
                    </div>
                    <div className="text-slate-400 text-sm">
                      {isLiquidationZone ? 'Discount Rate' : 'Total Cost'}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={isLiquidationZone ? handleLiquidate : handleAcquire}
                  className={`w-full py-4 border text-white rounded-lg font-mono text-lg font-semibold transition-all duration-150 flex items-center justify-center gap-3 ${
                    isLiquidationZone 
                      ? 'bg-red-600 border-red-500 hover:bg-red-500' 
                      : 'bg-cyan-600 border-cyan-500 hover:bg-cyan-500'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>{isLiquidationZone ? 'LIQUIDATE POSITION' : 'ACQUIRE POSITION'}</span>
                </button>

                {/* Transaction Details */}
                <div className="bg-slate-800/50 rounded-lg p-4 text-sm font-mono">
                  <div className="text-slate-400 mb-2">Transaction will:</div>
                  <ul className="space-y-1 text-slate-300">
                    <li>• Transfer collateral to your wallet</li>
                    <li>• {isLiquidationZone ? 'Liquidate' : 'Acquire'} debt position</li>
                    <li>• Execute smart contract transaction</li>
                    <li>• Update position status</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DebtPositionDetailPage;
