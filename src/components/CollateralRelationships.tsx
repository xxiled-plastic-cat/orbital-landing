/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from "framer-motion";
import { Wallet, Info } from "lucide-react";
import { LendingMarket } from "../types/lending";
import { useCollateralTokens } from "../hooks/useCollateralTokens";
import Tooltip from "./Tooltip";

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
        <Tooltip content="LST tokens from these markets can be used as collateral to borrow" position="bottom">
          <Info className="w-5 h-5 text-slate-500 hover:text-cyan-400 transition-colors cursor-help" />
        </Tooltip>
      </div>

      <div className="inset-panel cut-corners-sm p-5">
        <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wide">
          This Market Accepts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collateralAssets.length > 0 ? (
            collateralAssets.map((asset, index) => (
              <div
                key={asset.assetId}
                className="bg-slate-800/50 border border-slate-600 cut-corners-sm p-4 hover:border-cyan-400/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    {asset.image ? (
                      <img
                        src={asset.image}
                        alt={asset.symbol}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <span className="text-sm font-mono text-white">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-slate-300 font-semibold text-sm">
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
              </div>
            ))
          ) : (
            <div className="col-span-full text-slate-500 text-sm font-mono italic text-center py-8">
              No collateral accepted yet
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CollateralRelationships;
