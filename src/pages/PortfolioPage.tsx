import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  ExternalLink, 
  AlertCircle, 
  Loader, 
  Radio,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import AppLayout from '../components/app/AppLayout';
import { useWallet } from '@txnlab/use-wallet-react';
import { Link } from 'react-router-dom';
import { GENERAL_BACKEND_URL } from '../constants/constants';
import { useMarkets } from '../hooks/useMarkets';
import { useAssetMetadata } from '../hooks/useAssets';

interface Transaction {
  address: string;
  marketId: string;
  action: 'deposit' | 'borrow' | 'repay' | 'redeem';
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

const PortfolioPage: React.FC = () => {
  const { activeAccount } = useWallet();
  const { data: markets } = useMarkets();
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

  // Fetch asset metadata for all unique token IDs
  const { data: assetMetadata } = useAssetMetadata(uniqueTokenIds);

  const fetchTransactions = useCallback(async () => {
    if (!activeAccount?.address) {
      setError('No wallet connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${GENERAL_BACKEND_URL}/orbital/${activeAccount.address}`);
      
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
      default:
        return 'text-slate-400';
    }
  };

  return (
    <AppLayout title="Logbook - Transaction History">
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
                      <History className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                      <span className="text-base md:text-lg font-mono font-semibold text-slate-300 uppercase tracking-wide">
                        LOG BOOK
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
                      Total Transactions:
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3">
                      {isLoading ? "..." : transactions.length}
                    </span>
                  </div>
                  <div className="flex flex-col sm:block">
                    <span className="text-slate-400 uppercase tracking-wide text-xs md:text-sm">
                      Wallet:
                    </span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3">
                      {activeAccount?.address ? 
                        `${activeAccount.address.slice(0, 6)}...${activeAccount.address.slice(-6)}` : 
                        "Not Connected"
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-mono font-bold mb-4 md:mb-6 text-white tracking-tight">
            ORBITAL <span className="text-cyan-400">LOG BOOK</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-slate-300 max-w-4xl font-mono leading-relaxed mb-6 md:mb-8">
            Track your complete transaction history across all Orbital lending markets. 
            Monitor deposits, borrows, repayments, and redemptions with detailed blockchain records.
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

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-slate-600 cut-corners-lg p-8">
              <Loader className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
              <div className="text-slate-400 font-mono mb-4">
                SCANNING LOG ENTRIES...
              </div>
              <div className="text-slate-500 text-sm font-mono">
                Retrieving transaction history from orbital database
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            className="text-center py-12"
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
        )}

        {/* Transaction Table */}
        {!isLoading && !error && transactions.length > 0 && (
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
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-400 tabular-nums">{formatTxnId(tx.txnId)}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
                          </div>
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
                                <div className="flex items-center gap-2">
                                  <span className="text-cyan-400 tabular-nums text-sm">{formatTxnId(tx.txnId)}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
                                </div>
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
        )}

        {/* Empty State */}
        {!isLoading && !error && transactions.length === 0 && activeAccount?.address && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-slate-600 cut-corners-lg p-8">
              <History className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <div className="text-slate-400 font-mono mb-4">
                NO LOG ENTRIES FOUND
              </div>
              <div className="text-slate-500 text-sm font-mono">
                Start your orbital journey by making your first transaction
              </div>
            </div>
          </motion.div>
        )}

        {/* No Wallet Connected State */}
        {!activeAccount?.address && !isLoading && (
          <motion.div
            className="text-center py-12"
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
        )}
      </div>
    </AppLayout>
  );
};

export default PortfolioPage;
