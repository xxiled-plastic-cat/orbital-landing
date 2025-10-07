import React from 'react';
import { 
  User, 
  AlertTriangle, 
  Shield, 
  TrendingDown
} from 'lucide-react';
import { useNFD } from '../hooks/useNFD';
import { DebtPosition } from '../types/lending';

// DebtPosition interface is now imported from types/lending.ts

interface DebtPositionCardProps {
  position: DebtPosition;
  onClick?: (position: DebtPosition) => void;
}

const DebtPositionCard: React.FC<DebtPositionCardProps> = ({ 
  position, 
  onClick 
}) => {
  // Fetch NFD data for the user address
  const { nfdName, nfdAvatar, isLoadingNFD } = useNFD(position.userAddress);

  // Map token symbols to their image paths
  const getTokenImage = (symbol: string): string => {
    const tokenImages: Record<string, string> = {
      // Base tokens
      'xUSDt': '/xUSDt.svg',
      'COMPXt': '/COMPXt.svg',
      'USDCt': '/USDCt-logo.svg',
      'goBTCt': '/goBTCt-logo.svg',
      // Collateral tokens
      'cxUSDt': '/xUSDt.svg', // Using base token image for collateral
      'cCOMPXt': '/COMPXt.svg', // Using base token image for collateral
    };
    
    return tokenImages[symbol] || '/default-token.svg';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatDisplayName = (address: string) => {
    // Show loading indicator if NFD is being fetched
    if (isLoadingNFD) {
      return "Loading...";
    }
    
    // Use NFD name if available
    if (nfdName) {
      // Truncate long NFD names (keep first 12 chars + ...)
      return nfdName.length > 15 ? `${nfdName.slice(0, 12)}...` : nfdName;
    }
    
    // Fall back to truncated address
    return formatAddress(address);
  };

  const getHealthStatus = (healthRatio: number, liquidationThreshold: number) => {
    // Healthy: significantly above liquidation threshold
    if (healthRatio >= liquidationThreshold * 1.5) {
      return {
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        borderColor: 'border-green-400',
        status: 'HEALTHY',
        icon: Shield
      };
    } 
    // Warning: close to liquidation threshold (within 20% buffer)
    else if (healthRatio >= liquidationThreshold * 1.2) {
      return {
        color: 'text-amber-400',
        bgColor: 'bg-amber-400/10',
        borderColor: 'border-amber-400',
        status: 'NEAR LIQUIDATION',
        icon: AlertTriangle
      };
    } 
    // Liquidation zone: below liquidation threshold
    else {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-400/10',
        borderColor: 'border-red-400',
        status: 'LIQUIDATION ZONE',
        icon: TrendingDown
      };
    }
  };

  const healthStatus = getHealthStatus(position.healthRatio, position.liquidationThreshold);

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

  // Get dynamic font size based on text length to keep values on one line
  const getDynamicFontSize = (text: string) => {
    const length = text.length;
    if (length <= 12) return 'text-sm'; // Default size
    if (length <= 16) return 'text-xs'; // Smaller for medium length
    return 'text-xs'; // Smallest for long text
  };

  return (
    <div 
      className="bg-slate-800 border border-slate-600 rounded-lg p-4 md:p-6 hover:border-slate-500 hover:bg-slate-750 transition-all duration-150 cursor-pointer"
      onClick={() => onClick?.(position)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* User avatar or default icon */}
          <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border border-slate-500 overflow-hidden">
            {nfdAvatar ? (
              <img
                src={nfdAvatar}
                alt="NFD Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-3 h-3 text-cyan-400" />
            )}
          </div>
          
          {/* Display name and address */}
          <div className="flex flex-col">
            <span className="font-mono text-slate-300 text-sm font-semibold">
              {formatDisplayName(position.userAddress)}
            </span>
            {nfdName && (
              <span className="font-mono text-slate-500 text-xs">
                {formatAddress(position.userAddress)}
              </span>
            )}
          </div>
        </div>
        
        {/* Health Status Badge */}
        <div className={`px-3 py-1 rounded-md border ${healthStatus.borderColor} ${healthStatus.bgColor}`}>
          <div className="flex items-center gap-1">
            <span className={`text-xs font-mono font-semibold ${healthStatus.color}`}>
              {healthStatus.status}
            </span>
          </div>
        </div>
      </div>

      {/* Token Pair - Hidden on mobile */}
      <div className="hidden sm:grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Debt Token</div>
          <div className="flex items-center gap-2">
            <img 
              src={getTokenImage(position.debtToken.symbol)} 
              alt={position.debtToken.symbol}
              className="w-5 h-5 rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="font-mono font-semibold text-white">
              {position.debtToken.symbol}
            </div>
          </div>
          <div className="text-xs text-slate-500">{position.debtToken.name}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Collateral Token</div>
          <div className="flex items-center gap-2">
            <img 
              src={getTokenImage(position.collateralToken.symbol)} 
              alt={position.collateralToken.symbol}
              className="w-5 h-5 rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="font-mono font-semibold text-white">
              {position.collateralToken.symbol}
            </div>
          </div>
          <div className="text-xs text-slate-500">{position.collateralToken.name}</div>
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Debt</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <img 
                src={getTokenImage(position.debtToken.symbol)} 
                alt={position.debtToken.symbol}
                className="w-4 h-4 rounded-full flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className={`font-mono font-semibold text-red-400 ${getDynamicFontSize(`${formatNumber(position.totalDebt)} ${position.debtToken.symbol}`)} truncate`}>
                {formatNumber(position.totalDebt)} {position.debtToken.symbol}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-400 font-bold text-xs">$</span>
              <div className="font-mono font-semibold text-slate-400 text-xs">
                {formatUSD(position.totalDebtUSD)}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Collateral Value</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <img 
                src={getTokenImage(position.collateralToken.symbol)} 
                alt={position.collateralToken.symbol}
                className="w-4 h-4 rounded-full flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className={`font-mono font-semibold text-cyan-400 ${getDynamicFontSize(`${formatNumber(position.totalCollateralTokens)} ${position.collateralToken.symbol}`)} truncate`}>
                {formatNumber(position.totalCollateralTokens)} {position.collateralToken.symbol}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-400 font-bold text-xs">$</span>
              <div className="font-mono font-semibold text-slate-400 text-xs">
                {formatUSD(position.totalCollateral)}
              </div>
            </div>
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
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Liquidation Price</div>
          <div className="flex items-center gap-1">
            <span className="text-red-400 font-bold text-xs">$</span>
            <div className="font-mono font-semibold text-slate-300">
              {position.liquidationPrice ? formatNumber(position.liquidationPrice, 4) : 'N/A'}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default DebtPositionCard;
