import { motion } from "framer-motion";
import { Coins, CheckCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { LendingMarket } from "../../types/lending";
import CollateralRelationships from "../CollateralRelationships";
import MomentumSpinner from "../MomentumSpinner";

interface CollateralTabProps {
  market: LendingMarket;
  acceptedCollateral?: Map<any, any>;
  stakingPools: any[];
  loadingStakingPools: boolean;
}

const CollateralTab = ({ 
  market, 
  acceptedCollateral, 
  stakingPools, 
  loadingStakingPools 
}: CollateralTabProps) => {
  // Helper function to get LST token symbol (adds 'c' prefix if not already there)
  const getLSTTokenSymbol = (symbol?: string): string => {
    if (!symbol) return "";
    return symbol.startsWith("c") ? symbol : `c${symbol}`;
  };

  return (
    <div className="space-y-4 md:space-y-8">
      {/* LST Token Utilities */}
      <motion.div
        className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <Coins className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
          <h2 className="text-lg md:text-xl font-mono font-bold text-white uppercase tracking-wide">
            What You Can Do With {getLSTTokenSymbol(market.symbol)}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Always show: Use as collateral */}
          <div className="text-slate-600 cut-corners-sm p-4 border border-slate-600 hover:border-cyan-500 transition-all duration-150 bg-slate-800/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-mono font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  Use as Collateral on Orbital
                </h3>
                <p className="text-slate-400 text-sm font-mono mb-3">
                  Deposit your {getLSTTokenSymbol(market.symbol)} tokens as collateral to borrow other assets on Orbital Lending
                </p>
                <Link
                  to="/app/markets"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs uppercase tracking-wide"
                >
                  <span>View Markets</span>
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </Link>
              </div>
            </div>
          </div>

          {/* Conditionally show: Stake on CompX if available */}
          {!loadingStakingPools && (() => {
            const matchingPool = stakingPools.find(
              (pool) => pool.stakedAsset === market.lstTokenId && pool.active
            );
            
            if (!matchingPool) return null;

            // Get reward asset symbol (you might want to enhance this with a lookup)
            const getRewardSymbol = (rewardAssetId: string) => {
              if (rewardAssetId === "760037151") return "xUSD";
              // Add more mappings as needed
              return `Asset ${rewardAssetId}`;
            };

            return (
              <div className="text-slate-600 cut-corners-sm p-4 border border-slate-600 hover:border-cyan-500 transition-all duration-150 bg-slate-800/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-mono font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-cyan-400" />
                      Stake on CompX
                    </h3>
                    <p className="text-slate-400 text-sm font-mono mb-2">
                      Stake your {getLSTTokenSymbol(market.symbol)} tokens to earn {getRewardSymbol(matchingPool.rewardAsset)} rewards
                    </p>
                    
                    <a
                      href={`https://compx.io/app/staking?pool=${matchingPool.appId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs uppercase tracking-wide"
                    >
                      <span>Stake Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}

          {loadingStakingPools && (
            <div className="text-center py-4">
              <MomentumSpinner
                size="32"
                speed="1.1"
                color="#06b6d4"
                className="mx-auto"
              />
              <p className="text-slate-400 text-xs font-mono mt-2">
                Checking for staking opportunities...
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Collateral Relationships */}
      <CollateralRelationships
        market={market}
        acceptedCollateral={acceptedCollateral}
      />
    </div>
  );
};

export default CollateralTab;

