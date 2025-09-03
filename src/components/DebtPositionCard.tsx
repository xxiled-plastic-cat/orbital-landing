import React from 'react';
import { 
  User, 
  AlertTriangle, 
  Shield, 
  TrendingDown
} from 'lucide-react';

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
  healthRatio: number; // Higher is better (>1.5 healthy, 1.2-1.5 warning, <1.2 liquidation)
  liquidationThreshold: number;
  buyoutCost: number;
  liquidationBonus: number; // Percentage discount for liquidators (e.g., 8.5 = 8.5%)
}

interface DebtPositionCardProps {
  position: DebtPosition;
  onClick?: (position: DebtPosition) => void;
}

const DebtPositionCard: React.FC<DebtPositionCardProps> = ({ 
  position, 
  onClick 
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
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

  const healthStatus = getHealthStatus(position.healthRatio);
  const HealthIcon = healthStatus.icon;

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <div 
      className="bg-slate-800 border border-slate-600 rounded-lg p-4 md:p-6 hover:border-slate-500 hover:bg-slate-750 transition-all duration-150 cursor-pointer"
      onClick={() => onClick?.(position)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-slate-400" />
          <span className="font-mono text-slate-300 text-sm">
            {formatAddress(position.userAddress)}
          </span>
        </div>
        
        {/* Health Status Badge */}
        <div className={`px-3 py-1 rounded-md border ${healthStatus.borderColor} ${healthStatus.bgColor}`}>
          <div className="flex items-center gap-1">
            <HealthIcon className={`w-3 h-3 ${healthStatus.color}`} />
            <span className={`text-xs font-mono font-semibold ${healthStatus.color}`}>
              {healthStatus.status}
            </span>
          </div>
        </div>
      </div>

      {/* Token Pair */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Debt Token</div>
          <div className="font-mono font-semibold text-white">
            {position.debtToken.symbol}
          </div>
          <div className="text-xs text-slate-500">{position.debtToken.name}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Collateral Token</div>
          <div className="font-mono font-semibold text-white">
            {position.collateralToken.symbol}
          </div>
          <div className="text-xs text-slate-500">{position.collateralToken.name}</div>
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Debt</div>
          <div className="font-mono font-semibold text-red-400">
            {formatNumber(position.totalDebt)} {position.debtToken.symbol}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Collateral</div>
          <div className="font-mono font-semibold text-cyan-400">
            {formatNumber(position.totalCollateral)} {position.collateralToken.symbol}
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Health Ratio</div>
          <div className={`font-mono font-semibold ${healthStatus.color}`}>
            {formatNumber(position.healthRatio, 3)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Liquidation at</div>
          <div className="font-mono font-semibold text-slate-300">
            {formatNumber(position.liquidationThreshold, 3)}
          </div>
        </div>
      </div>


    </div>
  );
};

export default DebtPositionCard;
