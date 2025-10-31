import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  AlertCircle, 
  Radio,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { ORBITAL_BACKEND_URL } from '../../constants/constants';
import { useMarkets } from '../../hooks/useMarkets';
import { useAssetMetadata } from '../../hooks/useAssets';
import { useExplorer } from '../../context/explorerContext';
import MomentumSpinner from '../MomentumSpinner';

interface Transaction {
  address: string;
  marketId: string;
  action: 'deposit' | 'borrow' | 'repay' | 'redeem' | 'buyout' | 'liquidation';
  tokenInId: string;
  tokenOutId: string;
  tokensOut: number;
  tokensIn: number;
  timestamp: string;
  txnId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Transaction[];
}

const TransactionHistorySection: React.FC = () => {
  const { activeAccount } = useWallet();
  const { data: markets } = useMarkets();
  const { getExplorerUrl } = useExplorer();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get unique token IDs from transactions
  const uniqueTokenIds = useMemo(() => {
    const tokenIds = new Set<string>();
    transactions.forEach(tx => {
      if (tx.tokenInId && tx.tokenInId !== '0') tokenIds.add(tx.tokenInId);
      if (tx.tokenOutId && tx.tokenOutId !== '0') tokenIds.add(tx.tokenOutId);
    });
    return Array.from(tokenIds);
  }, [transactions]);

  // Fetch asset metadata for transaction token IDs
  const { data: assetMetadata } = useAssetMetadata(uniqueTokenIds);

  const fetchTransactions = useCallback(async () => {
    if (!activeAccount?.address) {
      setError('No wallet connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${ORBITAL_BACKEND_URL}/orbital/records/${activeAccount.address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setTransactions(data.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [activeAccount?.address]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const toggleRowExpansion = (txnId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(txnId)) {
        newSet.delete(txnId);
      } else {
        newSet.add(txnId);
      }
      return newSet;
    });
  };

  const getMarketName = (marketId: string) => {
    if (!markets) return marketId;
    
    const market = markets.find(m => m.id === marketId);
    if (market) {
      return `${market.name} ${market.symbol ? `(${market.symbol})` : ''}`.trim();
    }
    
    return marketId; // Fallback to raw ID if not found
  };

  const getTokenName = (tokenId: string) => {
    // Handle ALGO (ID: 0)
    if (tokenId === '0') return 'ALGO';
    
    if (!assetMetadata) return tokenId;
    
    const metadata = assetMetadata.find(m => m.id === tokenId);
    if (metadata) {
      return `${metadata.name} ${metadata.symbol ? `(${metadata.symbol})` : ''}`.trim();
    }
    
    return tokenId; // Fallback to raw ID if not found
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  };

  const formatTxnId = (txnId: string) => {
    return `${txnId.slice(0, 6)}...${txnId.slice(-6)}`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'borrow':
        return <ArrowUpRight className="w-4 h-4 text-blue-400" />;
      case 'repay':
        return <ArrowDownLeft className="w-4 h-4 text-amber-400" />;
      case 'redeem':
        return <ArrowUpRight className="w-4 h-4 text-cyan-400" />;
      case 'buyout':
        return <DollarSign className="w-4 h-4 text-orange-400" />;
      case 'liquidation':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Radio className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'deposit':
        return 'text-green-400';
      case 'borrow':
        return 'text-blue-400';
      case 'repay':
        return 'text-amber-400';
      case 'redeem':
        return 'text-cyan-400';
      case 'buyout':
        return 'text-orange-400';
      case 'liquidation':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <motion.div
        className="text-center py-12 mb-6 md:mb-8"
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
            SCANNING LOG ENTRIES...
          </div>
          <div className="text-slate-500 text-sm font-mono">
            Retrieving transaction history from orbital database
          </div>
        </div>
      </motion.div>
    );
  }

  // Error State
  if (error && !isLoading) {
    return (
      <motion.div
        className="text-center py-12 mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-slate-600 cut-corners-lg p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 font-mono mb-4">
            TRANSMISSION ERROR
          </div>
          <div className="text-slate-500 text-sm font-mono mb-4">
            {error}
          </div>
          <button
            onClick={fetchTransactions}
            className="text-cyan-500 cut-corners-sm px-6 py-2 font-mono text-sm hover:text-cyan-400 transition-all duration-150 border border-cyan-500 hover:border-cyan-400"
          >
            <span className="text-white">RETRY SCAN</span>
          </button>
        </div>
      </motion.div>
    );
  }

  // Empty State
  if (!isLoading && !error && transactions.length === 0 && activeAccount?.address) {
    return (
      <motion.div
        className="text-center py-12 mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-slate-600 cut-corners-lg p-8">
          <Clock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <div className="text-slate-400 font-mono mb-4">
            NO LOG ENTRIES FOUND
          </div>
          <div className="text-slate-500 text-sm font-mono">
            Start your orbital journey by making your first transaction
          </div>
        </div>
      </motion.div>
    );
  }

  // No Wallet Connected State
  if (!activeAccount?.address && !isLoading) {
    return (
      <motion.div
        className="text-center py-12 mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-slate-600 cut-corners-lg p-8">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <div className="text-amber-400 font-mono mb-4">
            WALLET NOT CONNECTED
          </div>
          <div className="text-slate-500 text-sm font-mono">
            Connect your wallet to view your transaction history
          </div>
        </div>
      </motion.div>
    );
  }

  // Transaction Table
  if (!isLoading && !error && transactions.length > 0) {
    return (
      <motion.div
        className="mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial overflow-hidden">
          {/* Table Header */}
          <div className="p-4 md:p-6 border-b border-slate-600">
            <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              TRANSACTION LOG
            </h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-slate-600 bg-slate-800/50">
                  <th className="text-left p-3 md:p-4 text-slate-400 uppercase tracking-wide">Action</th>
                  <th className="text-left p-3 md:p-4 text-slate-400 uppercase tracking-wide">Market</th>
                  <th className="text-left p-3 md:p-4 text-slate-400 uppercase tracking-wide">Token In</th>
                  <th className="text-left p-3 md:p-4 text-slate-400 uppercase tracking-wide">Token Out</th>
                  <th className="text-right p-3 md:p-4 text-slate-400 uppercase tracking-wide">Tokens In</th>
                  <th className="text-right p-3 md:p-4 text-slate-400 uppercase tracking-wide">Tokens Out</th>
                  <th className="text-left p-3 md:p-4 text-slate-400 uppercase tracking-wide">Timestamp</th>
                  <th className="text-left p-3 md:p-4 text-slate-400 uppercase tracking-wide">Txn ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr 
                    key={tx.txnId} 
                    className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition-all duration-150 ${
                      index % 2 === 0 ? 'bg-slate-900/20' : 'bg-transparent'
                    }`}
                  >
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(tx.action)}
                        <span className={`font-semibold uppercase ${getActionColor(tx.action)}`}>
                          {tx.action}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 text-slate-300">
                      <div className="font-semibold">{getMarketName(tx.marketId)}</div>
                      <div className="text-xs text-slate-500 tabular-nums">ID: {tx.marketId}</div>
                    </td>
                    <td className="p-3 md:p-4 text-slate-300">
                      <div className="font-semibold">{getTokenName(tx.tokenInId)}</div>
                      <div className="text-xs text-slate-500 tabular-nums">ID: {tx.tokenInId}</div>
                    </td>
                    <td className="p-3 md:p-4 text-slate-300">
                      <div className="font-semibold">{getTokenName(tx.tokenOutId)}</div>
                      <div className="text-xs text-slate-500 tabular-nums">ID: {tx.tokenOutId}</div>
                    </td>
                    <td className="p-3 md:p-4 text-right text-white tabular-nums font-semibold">{tx.tokensIn}</td>
                    <td className="p-3 md:p-4 text-right text-white tabular-nums font-semibold">{tx.tokensOut}</td>
                    <td className="p-3 md:p-4 text-slate-300">{formatTimestamp(tx.timestamp)}</td>
                    <td className="p-3 md:p-4">
                      <a 
                        href={getExplorerUrl('transaction', tx.txnId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors group"
                      >
                        <span className="tabular-nums">{formatTxnId(tx.txnId)}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden">
            {transactions.map((tx, index) => {
              const isExpanded = expandedRows.has(tx.txnId);
              return (
                <div key={tx.txnId} className={`border-b border-slate-700/50 ${
                  index % 2 === 0 ? 'bg-slate-900/20' : 'bg-transparent'
                }`}>
                  {/* Main Row - Always Visible */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-slate-800/30 transition-all duration-150"
                    onClick={() => toggleRowExpansion(tx.txnId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Action */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getActionIcon(tx.action)}
                          <span className={`font-semibold uppercase text-xs ${getActionColor(tx.action)}`}>
                            {tx.action}
                          </span>
                        </div>
                        
                        {/* Market Name */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">Market</div>
                          <div className="text-slate-300 text-sm truncate font-semibold">{getMarketName(tx.marketId)}</div>
                        </div>
                      </div>
                      
                      {/* Timestamp & Expand Icon */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 uppercase tracking-wide">Time</div>
                          <div className="text-slate-300 text-xs">{formatTimestamp(tx.timestamp).split(',')[0]}</div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-slate-800/50 border-t border-slate-700/50"
                    >
                      <div className="p-4 space-y-3">
                        {/* Market Details */}
                        <div>
                          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Market Details</div>
                          <div className="text-slate-300 text-sm font-semibold">{getMarketName(tx.marketId)}</div>
                          <div className="text-xs text-slate-500 tabular-nums">ID: {tx.marketId}</div>
                        </div>

                        {/* Token Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Token In</div>
                            <div className="text-slate-300 text-sm font-semibold">{getTokenName(tx.tokenInId)}</div>
                            <div className="text-xs text-slate-500 tabular-nums">ID: {tx.tokenInId}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Token Out</div>
                            <div className="text-slate-300 text-sm font-semibold">{getTokenName(tx.tokenOutId)}</div>
                            <div className="text-xs text-slate-500 tabular-nums">ID: {tx.tokenOutId}</div>
                          </div>
                        </div>

                        {/* Token Amounts */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tokens In</div>
                            <div className="text-white tabular-nums font-semibold text-sm">{tx.tokensIn}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tokens Out</div>
                            <div className="text-white tabular-nums font-semibold text-sm">{tx.tokensOut}</div>
                          </div>
                        </div>

                        {/* Full Timestamp & Transaction ID */}
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Full Timestamp</div>
                            <div className="text-slate-300 text-sm">{formatTimestamp(tx.timestamp)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Transaction ID</div>
                            <a 
                              href={getExplorerUrl('transaction', tx.txnId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors group"
                            >
                              <span className="tabular-nums text-sm">{formatTxnId(tx.txnId)}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default TransactionHistorySection;
