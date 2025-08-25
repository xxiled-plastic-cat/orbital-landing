import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { LendingMarket } from "../types/lending";
import { useCollateralTokens } from "../hooks/useCollateralTokens";

interface CollateralRelationshipsProps {
  market: LendingMarket;
  acceptedCollateral?: Map<unknown, unknown>;
}

const CollateralRelationships = ({ market, acceptedCollateral }: CollateralRelationshipsProps) => {
  // Use the collateral tokens hook
  const { getCollateralAssets } = useCollateralTokens(acceptedCollateral);
  
  // Get the processed collateral assets with token metadata
  const collateralAssets = getCollateralAssets();

  return (
    <motion.div
      className="text-slate-600 cut-corners-lg p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wide">
          Accepted Collateral
        </h2>
      </div>

      <div className="inset-panel cut-corners-sm p-5">
        <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wide">
          This Market Accepts
        </h3>
        <div className="space-y-3">
          {collateralAssets.length > 0 ? (
            collateralAssets.map((asset, index) => (
              <div
                key={asset.assetId}
                className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    {asset.image ? (
                      <img
                        src={asset.image}
                        alt={asset.symbol}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <span className="text-xs font-mono text-white">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-mono text-slate-300 font-semibold">
                      {asset.symbol}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {asset.name}
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      Asset ID: {asset.assetId}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 text-sm font-mono font-semibold">
                    {market.ltv}% LTV
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Total: {(asset.totalCollateral / 10**6).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-sm font-mono italic text-center py-8">
              No collateral accepted yet
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CollateralRelationships;
