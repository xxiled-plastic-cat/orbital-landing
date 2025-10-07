import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { usePriceContext } from '../context/priceContext';

interface PriceStatusIndicatorProps {
  tokenId?: string;
  showDetails?: boolean;
  className?: string;
}

const PriceStatusIndicator: React.FC<PriceStatusIndicatorProps> = ({ 
  tokenId, 
  showDetails = false,
  className = ""
}) => {
  const { isRefreshing, lastRefresh, isPriceStale, priceCache } = usePriceContext();

  // Determine overall status
  const getStatus = () => {
    if (isRefreshing) {
      return {
        type: 'refreshing' as const,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-400/10',
        borderColor: 'border-cyan-400/30',
        icon: RefreshCw,
        message: 'Updating prices...'
      };
    }

    if (tokenId && isPriceStale(tokenId)) {
      return {
        type: 'stale' as const,
        color: 'text-amber-400',
        bgColor: 'bg-amber-400/10',
        borderColor: 'border-amber-400/30',
        icon: AlertTriangle,
        message: 'Price data may be stale'
      };
    }

    return {
      type: 'fresh' as const,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/30',
      icon: CheckCircle,
      message: 'Prices up to date'
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastRefresh.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return lastRefresh.toLocaleTimeString();
    }
  };

  if (!showDetails) {
    // Simple indicator
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <motion.div
          animate={status.type === 'refreshing' ? { rotate: 360 } : { rotate: 0 }}
          transition={{ 
            duration: status.type === 'refreshing' ? 1 : 0,
            repeat: status.type === 'refreshing' ? Infinity : 0,
            ease: "linear"
          }}
        >
          <StatusIcon className={`w-3 h-3 ${status.color}`} />
        </motion.div>
        {showDetails && (
          <span className={`text-xs font-mono ${status.color}`}>
            {status.message}
          </span>
        )}
      </div>
    );
  }

  // Detailed status panel
  return (
    <div className={`${status.bgColor} ${status.borderColor} border rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          animate={status.type === 'refreshing' ? { rotate: 360 } : { rotate: 0 }}
          transition={{ 
            duration: status.type === 'refreshing' ? 1 : 0,
            repeat: status.type === 'refreshing' ? Infinity : 0,
            ease: "linear"
          }}
        >
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
        </motion.div>
        <span className={`text-sm font-mono font-semibold ${status.color}`}>
          Price Status
        </span>
      </div>
      
      <div className="space-y-1 text-xs font-mono text-slate-400">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <span className={status.color}>{status.message}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Last Update:</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatLastRefresh()}
          </span>
        </div>
        
        {tokenId && (
          <div className="flex items-center justify-between">
            <span>Token Status:</span>
            <span className={isPriceStale(tokenId) ? 'text-amber-400' : 'text-green-400'}>
              {isPriceStale(tokenId) ? 'Stale' : 'Fresh'}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span>Cached Prices:</span>
          <span>{priceCache.size}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceStatusIndicator;
