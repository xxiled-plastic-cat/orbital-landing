import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { LendingMarket } from "../types/lending";

interface CollateralRelationshipsProps {
  market: LendingMarket;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  acceptedCollateral?: Map<any, any>;
}

// Token name mapping for display
const TOKEN_NAMES: Record<string, string> = {
  "744427950": "COMPXt",
  "744427912": "xUSDt", 
  "744441895": "Market Token",
  "0": "ALGO",
};

const CollateralRelationships = ({ market, acceptedCollateral }: CollateralRelationshipsProps) => {
  const getTokenName = (assetId: string): string => {
    return TOKEN_NAMES[assetId] || `Token ${assetId.slice(0, 6)}...`;
  };

  // Convert Map to array of collateral entries
  const collateralEntries = acceptedCollateral ? Array.from(acceptedCollateral.entries()) : [];

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
          {collateralEntries.length > 0 ? (
            collateralEntries.map(([key, value], index) => {
              const assetId = key.assetId || value.assetId;
              const totalCollateral = value.totalCollateral || 0;
              
              return (
                <div
                  key={assetId}
                  className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-mono text-white">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-mono text-slate-300 font-semibold">
                        {getTokenName(assetId.toString())}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        Asset ID: {assetId.toString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 text-sm font-mono font-semibold">
                      {market.ltv}% LTV
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Total: {(Number(totalCollateral) / 10**6).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })
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
