import React, { useMemo, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  PieChart,
  Loader,
  Coins
} from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { useMarkets } from '../../hooks/useMarkets';
import { useAssetMetadata } from '../../hooks/useAssets';
import { WalletContext } from '../../context/wallet';
import { useLoanRecords } from '../../hooks/useLoanRecords';

const ActivePositionsSection: React.FC = () => {
  const { activeAccount } = useWallet();
  const { data: markets } = useMarkets();
  const { userAssets, algoBalance, isLoadingAssets } = useContext(WalletContext);
  const { data: loanRecords, isLoading: isLoadingLoanRecords } = useLoanRecords();

  // Get relevant token IDs from markets (base tokens and LST tokens)
  const relevantTokenIds = useMemo(() => {
    if (!markets) return [];
    
    const tokenIds = new Set<string>();
    markets.forEach(market => {
      if (market.baseTokenId && market.baseTokenId !== '0') {
        tokenIds.add(market.baseTokenId);
      }
      if (market.lstTokenId && market.lstTokenId !== '0') {
        tokenIds.add(market.lstTokenId);
      }
    });
    return Array.from(tokenIds);
  }, [markets]);

  // Fetch asset metadata for relevant tokens
  const { data: assetMetadata } = useAssetMetadata(relevantTokenIds);

  // Helper function to get wallet balance for a specific token
  const getTokenBalance = useCallback((tokenId: string) => {
    if (tokenId === '0') {
      return algoBalance;
    }
    
    if (!userAssets?.assets) return '0';
    
    const asset = userAssets.assets.find(a => a.assetId === tokenId);
    return asset?.balance || '0';
  }, [algoBalance, userAssets?.assets]);

  // Helper function to format token balance with proper decimals
  const formatTokenBalance = useCallback((balance: string, decimals: number = 6) => {
    const balanceNum = parseFloat(balance) / Math.pow(10, decimals);
    if (balanceNum === 0) return '0';
    if (balanceNum < 0.001) return '< 0.001';
    return balanceNum.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 3 
    });
  }, []);

  // Map token symbols to their image paths
  const getTokenImage = (symbol: string): string => {
    const tokenImages: Record<string, string> = {
      // Base tokens
      'xUSDt': '/xUSDt.svg',
      'COMPXt': '/COMPXt.svg',
      'USDCt': '/USDCt-logo.svg',
      'goBTCt': '/goBTCt-logo.svg',
      'ALGO': '/allo-logo.svg',
      // Collateral tokens (use same icons as base tokens)
      'oxUSDt': '/xUSDt.svg',
      'oCOMPXt': '/COMPXt.svg',
      'oUSDCt': '/USDCt-logo.svg',
      'ogoBTCt': '/goBTCt-logo.svg',
      'oALGO': '/allo-logo.svg',
      // Additional collateral token variations
      'cxUSDt': '/xUSDt.svg',
      'cCOMPXt': '/COMPXt.svg',
      'cUSDCt': '/USDCt-logo.svg',
      'cgoBTCt': '/goBTCt-logo.svg',
      'cALGO': '/allo-logo.svg',
    };
    
    return tokenImages[symbol] || '/orbital-icon.svg';
  };

  // Calculate user positions (deposits and borrowing)
  const userPositions = useMemo(() => {
    if (!markets || !activeAccount?.address) {
      return { deposits: [], borrows: [], totalDepositValue: 0, totalBorrowValue: 0 };
    }

    // Calculate deposits from LST tokens
    const deposits = markets
      .map(market => {
        if (!market.lstTokenId || market.lstTokenId === '0') return null;
        
        const lstBalance = getTokenBalance(market.lstTokenId);
        const lstBalanceNum = parseFloat(lstBalance);
        
        if (lstBalanceNum <= 0) return null;
        
        const metadata = assetMetadata?.find(m => m.id === market.lstTokenId);
        const formattedBalance = formatTokenBalance(lstBalance, metadata?.decimals || 6);
        
        // Calculate underlying asset value (approximate)
        // LST should be roughly 1:1 with deposits, but could be calculated more precisely
        const underlyingValue = lstBalanceNum / Math.pow(10, metadata?.decimals || 6);
        const valueUSD = underlyingValue * market.baseTokenPrice;

        return {
          marketId: market.id,
          marketName: market.name,
          tokenId: market.lstTokenId,
          tokenSymbol: metadata?.symbol || `o${market.symbol || 'UNK'}`,
          tokenName: metadata?.name || `Collateral ${market.name}`,
          balance: lstBalance,
          formattedBalance,
          underlyingValue,
          valueUSD,
          apy: market.supplyApr,
          decimals: metadata?.decimals || 6
        };
      })
      .filter(deposit => deposit !== null);

    // Calculate borrows from loan records
    const borrows = loanRecords?.map(record => {
      const market = markets.find(m => m.id === record.marketId);
      if (!market) return null;

      const collateralMetadata = assetMetadata?.find(m => m.id === record.collateralTokenId.toString());
      const borrowedAmount = Number(record.principal) / Math.pow(10, 6); // Assuming 6 decimals
      const collateralAmount = Number(record.collateralAmount) / Math.pow(10, collateralMetadata?.decimals || 6);
      
      const borrowValueUSD = borrowedAmount * market.baseTokenPrice;

      return {
        marketId: record.marketId,
        marketName: market.name,
        borrowedTokenId: market.baseTokenId,
        borrowedTokenSymbol: market.symbol || 'UNK',
        collateralTokenId: record.collateralTokenId.toString(),
        collateralTokenSymbol: collateralMetadata?.symbol || 'UNK',
        collateralTokenName: collateralMetadata?.name || 'Unknown',
        borrowedAmount,
        collateralAmount,
        borrowValueUSD,
        apy: market.borrowApr,
        lastUpdated: new Date(Number(record.lastDebtChange.timestamp) * 1000),
        userIndexWad: record.userIndexWad
      };
    }).filter(borrow => borrow !== null) || [];

    const totalDepositValue = deposits.reduce((sum, deposit) => sum + deposit.valueUSD, 0);
    const totalBorrowValue = borrows.reduce((sum, borrow) => sum + borrow.borrowValueUSD, 0);

    return { deposits, borrows, totalDepositValue, totalBorrowValue };
  }, [markets, activeAccount?.address, loanRecords, assetMetadata, getTokenBalance, formatTokenBalance]);

  // Loading state
  if ((isLoadingLoanRecords || isLoadingAssets) && activeAccount?.address) {
    return (
      <motion.div
        className="mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-slate-600 cut-corners-lg p-6 md:p-8 bg-noise-dark border-2 border-slate-600">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-5 h-5 text-cyan-400" />
            <span className="text-lg font-mono font-bold text-white uppercase tracking-wide">
              ACTIVE POSITIONS
            </span>
          </div>
          <div className="text-center py-8">
            <Loader className="w-8 h-8 text-cyan-400 mx-auto mb-3 animate-spin" />
            <div className="text-slate-400 font-mono text-sm">
              LOADING POSITIONS...
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Don't render if no active account
  if (!activeAccount?.address) {
    return null;
  }

  return (
    <motion.div
      className="mb-6 md:mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05 }}
    >
      <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              ACTIVE POSITIONS
            </h2>
            <div className="text-xs md:text-sm text-slate-400 font-mono">
              Net Position: ${(userPositions.totalDepositValue - userPositions.totalBorrowValue).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          </div>
          <p className="text-xs md:text-sm text-slate-400 font-mono">
            Your lending deposits and borrowing positions across orbital markets
          </p>
        </div>

        {/* Positions Content */}
        <div className="p-4 md:p-6">
          {(userPositions.deposits.length > 0 || userPositions.borrows.length > 0) ? (
            <div className="space-y-6">
              {/* Deposits Section */}
              {userPositions.deposits.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm md:text-base font-mono font-semibold text-green-400 uppercase tracking-wide">
                      Deposits ({userPositions.deposits.length})
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Total: ${userPositions.totalDepositValue.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {userPositions.deposits.map((deposit) => (
                      <motion.div
                        key={deposit.marketId}
                        className="relative p-4 md:p-5 bg-noise-dark border-2 border-green-700/50 hover:border-green-600/70 transition-all duration-200 shadow-lg hover:shadow-green-900/20"
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-950/30 via-transparent to-green-900/10"></div>
                        {/* Glowing accent */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Enhanced Token Icon */}
                              <div className="relative w-8 h-8 flex-shrink-0">
                                <div className="w-full h-full bg-gradient-to-br from-green-600/20 to-green-800/40 border border-green-600/50 flex items-center justify-center">
                                  <img
                                    src={getTokenImage(deposit.tokenSymbol)}
                                    alt={`${deposit.tokenSymbol} icon`}
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <TrendingUp className="w-4 h-4 text-green-400 hidden" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-green-400 opacity-75"></div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono font-bold text-sm md:text-base text-white truncate">
                                    {deposit.tokenSymbol}
                                  </span>
                                  <span className="bg-green-900/50 text-green-300 border border-green-700/50 px-2 py-0.5 text-xs font-mono font-semibold uppercase tracking-wider">
                                    SUPPLY
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 font-mono truncate mb-1">
                                  {deposit.marketName}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right flex-shrink-0">
                              <div className="bg-green-900/30 border border-green-700/30 px-2 py-1">
                                <div className="text-xs text-green-400 font-mono font-bold">
                                  +{deposit.apy.toFixed(2)}%
                                </div>
                                <div className="text-xs text-green-500/70 font-mono uppercase tracking-wider">
                                  APY
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 pt-2 border-t border-green-800/30">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Balance:</span>
                              <span className="font-mono font-bold text-sm text-white tabular-nums">
                                {deposit.formattedBalance}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Value:</span>
                              <span className="font-mono font-bold text-sm text-green-400 tabular-nums">
                                ${deposit.valueUSD.toLocaleString(undefined, { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Borrows Section */}
              {userPositions.borrows.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-sm md:text-base font-mono font-semibold text-red-400 uppercase tracking-wide">
                      Borrowed ({userPositions.borrows.length})
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Total: ${userPositions.totalBorrowValue.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {userPositions.borrows.map((borrow, index) => (
                      <motion.div
                        key={`${borrow.marketId}-${index}`}
                        className="relative p-4 md:p-5 bg-noise-dark border-2 border-red-700/50 hover:border-red-600/70 transition-all duration-200 shadow-lg hover:shadow-red-900/20"
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-transparent to-red-900/10"></div>
                        {/* Glowing accent */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Enhanced Debt Token Icon */}
                              <div className="relative w-8 h-8 flex-shrink-0">
                                <div className="w-full h-full bg-gradient-to-br from-red-600/20 to-red-800/40 border border-red-600/50 flex items-center justify-center">
                                  <img
                                    src={getTokenImage(borrow.borrowedTokenSymbol)}
                                    alt={`${borrow.borrowedTokenSymbol} icon`}
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <TrendingDown className="w-4 h-4 text-red-400 hidden" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border border-red-400 opacity-75"></div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono font-bold text-sm md:text-base text-white truncate">
                                    {borrow.borrowedTokenSymbol}
                                  </span>
                                  <span className="bg-red-900/50 text-red-300 border border-red-700/50 px-2 py-0.5 text-xs font-mono font-semibold uppercase tracking-wider">
                                    DEBT
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 font-mono truncate mb-1">
                                  {borrow.marketName}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right flex-shrink-0">
                              <div className="bg-red-900/30 border border-red-700/30 px-2 py-1">
                                <div className="text-xs text-red-400 font-mono font-bold">
                                  -{borrow.apy.toFixed(2)}%
                                </div>
                                <div className="text-xs text-red-500/70 font-mono uppercase tracking-wider">
                                  APR
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 pt-2 border-t border-red-800/30">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Borrowed:</span>
                              <span className="font-mono font-bold text-sm text-white tabular-nums">
                                {borrow.borrowedAmount.toLocaleString(undefined, { 
                                  minimumFractionDigits: 0, 
                                  maximumFractionDigits: 3 
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Value:</span>
                              <span className="font-mono font-bold text-sm text-red-400 tabular-nums">
                                ${borrow.borrowValueUSD.toLocaleString(undefined, { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Collateral:</span>
                                <div className="w-3 h-3 flex-shrink-0">
                                  <img
                                    src={getTokenImage(borrow.collateralTokenSymbol)}
                                    alt={`${borrow.collateralTokenSymbol} icon`}
                                    className="w-full h-full object-contain opacity-60"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              </div>
                              <span className="font-mono font-bold text-xs text-slate-300 tabular-nums">
                                {borrow.collateralAmount.toLocaleString(undefined, { 
                                  minimumFractionDigits: 0, 
                                  maximumFractionDigits: 3 
                                })} {borrow.collateralTokenSymbol}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <div className="text-slate-400 font-mono text-sm">
                NO ACTIVE POSITIONS
              </div>
              <div className="text-slate-500 text-xs font-mono mt-1">
                Start by depositing assets or borrowing from orbital markets
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActivePositionsSection;
