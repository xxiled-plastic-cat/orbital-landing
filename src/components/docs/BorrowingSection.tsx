import React from "react";
import { TrendingUp, Shield } from "lucide-react";
import VideoEmbed from "./VideoEmbed";

const BorrowingSection: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Borrow
        </h2>
      </div>

      <VideoEmbed
        title="How to Borrow Assets"
        description="Learn to create borrowing positions against your collateral safely"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-4">
          <p>
            <strong className="text-cyan-400">Borrowing Positions</strong> let
            you borrow assets against your supplied collateral tokens. Use your
            deposited tokens as collateral to borrow other assets from the
            protocol.
          </p>
          <p>
            Each market has a different set of{" "}
            <strong className="text-cyan-400">accepted collateral</strong>{" "}
            tokens. Mutliple markets may exist for the same asset with different
            LTV ratios, interest curves and accepted collateral tokens.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">
                Borrowing Process
              </h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  Select a market to borrow from
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  Enter collateral amount and borrow amount
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  Check your health ratio
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">4.</span>
                  Create your borrowing position
                </li>
              </ol>
            </div>

            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">Risk Management</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Health Ratio:</span>
                  <span className="text-cyan-400">&gt; 1.0 Safe</span>
                </li>
                <li className="flex justify-between">
                  <span>Liquidation:</span>
                  <span className="text-red-400">&lt; 1.0 Risk</span>
                </li>
                <li className="flex justify-between">
                  <span>Borrow APR:</span>
                  <span className="text-cyan-400">Variable</span>
                </li>
                <li className="flex justify-between">
                  <span>Max LTV:</span>
                  <span className="text-cyan-400">Market dependent</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-bold mb-2">
                  Liquidation Warning
                </h4>
                <p className="text-red-200 text-sm">
                  If your health ratio falls below 1.0, your position may be
                  liquidated. Always monitor your positions and maintain
                  adequate collateral to avoid liquidation penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowingSection;
