import React from 'react';
import { ShoppingCart, Orbit } from 'lucide-react';
import VideoEmbed from './VideoEmbed';

const MarketplaceSection: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Mercury Trading Post
        </h2>
      </div>

      <VideoEmbed 
        title="Buying Out Healthy Loans"
        description="Learn how to buy out healthy debt positions for premiums at Mercury Trading Post"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-4">
          <p>
            <strong className="text-cyan-400">Mercury Trading Post</strong> introduces Orbital's most innovative feature: 
            a Debt Marketplace where even <strong className="text-cyan-400">healthy loans can be bought out for a premium</strong>. 
            This goes beyond traditional liquidation-only systems, creating new opportunities for borrowers, traders, and the protocol.
          </p>
          
          <p>
            Unlike other DeFi protocols that only resolve debt through liquidation, Orbital allows third parties to buy out 
            healthy positions by paying a single buyout price that simultaneously repays debt, returns borrower equity, 
            and distributes a premium fee.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">Buyout Process</h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  Browse healthy loan positions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  Analyze collateral ratio vs liquidation threshold
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  Calculate buyout price and premium
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">4.</span>
                  Execute atomic buyout transaction
                </li>
              </ol>
            </div>

            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">Premium Calculation</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-slate-700 bg-opacity-50 rounded p-2 font-mono text-xs">
                  <div className="text-cyan-400 mb-1">Premium Rate =</div>
                  <div>(CR × 10000) / liquidation_threshold - 10000</div>
                </div>
                <div className="bg-slate-700 bg-opacity-50 rounded p-2 font-mono text-xs">
                  <div className="text-cyan-400 mb-1">Buyout Price =</div>
                  <div>Collateral Value × (1 + Premium Rate)</div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Higher collateral ratios = higher premiums for buyers to pay
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4 my-6">
            <h4 className="text-cyan-400 font-bold mb-3">Example Buyout Scenario</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="text-white font-semibold mb-2">Position Details</h5>
                <ul className="space-y-1">
                  <li>Collateral: $1,000</li>
                  <li>Debt: $500</li>
                  <li>CR: 200%</li>
                  <li>Threshold: 150%</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-2">Buyout Calculation</h5>
                <ul className="space-y-1">
                  <li>Premium Rate: 33%</li>
                  <li className="text-cyan-400">Buyout Price: $1,333</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-2">Settlement</h5>
                <ul className="space-y-1">
                  <li>$500 → Debt repaid</li>
                  <li>$500 → Borrower equity</li>
                  <li>$333 → Premium (50/50 split)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Orbit className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-cyan-400 font-bold mb-2">Multi-Sided Market Benefits</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-cyan-200">
                    The Debt Marketplace transforms Orbital into a multi-sided market where:
                  </p>
                  <ul className="space-y-1 text-cyan-200">
                    <li>• <strong>Borrowers</strong> can exit flexibly and earn a share of premium fees</li>
                    <li>• <strong>Lenders</strong> benefit from certainty of debt repayment</li>
                    <li>• <strong>Traders</strong> gain structured entry points into collateral assets</li>
                    <li>• <strong>Protocol</strong> captures revenue from premium fees</li>
                  </ul>
                  <p className="text-cyan-200 mt-2">
                    Every buyout is atomic and on-chain, ensuring debt is repaid, equity is returned, 
                    and premiums are distributed fairly between borrower and protocol.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceSection;
