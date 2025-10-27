import React from 'react';
import { ShoppingCart, Zap, ArrowRight, ShoppingBag, AlertTriangle } from 'lucide-react';
import VideoEmbed from './VideoEmbed';

interface MarketplaceSectionProps {
  onNavigate?: (section: string) => void;
}

const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({ onNavigate }) => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Trade
        </h2>
      </div>

      <VideoEmbed 
        title="Mercury Trading Post Overview"
        description="Introduction to Orbital's innovative debt marketplace"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-6">
          
          {/* What is the Trading Post */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              What is the Trading Post?
            </h3>
            <p>
              The <strong className="text-cyan-400">Mercury Trading Post</strong> (accessible via the Trade tab) is Orbital's 
              revolutionary <strong className="text-pink-400">debt marketplace</strong> — a feature that fundamentally differentiates 
              Orbital from traditional DeFi lending protocols.
            </p>
            <p className="mt-3">
              While most lending protocols only allow positions to be resolved through <strong className="text-pink-400">liquidation</strong> when 
              they become unhealthy, Orbital creates a <strong className="text-pink-400">secondary market</strong> for debt positions 
              where participants can trade both healthy and at-risk loans in a transparent, on-chain environment.
            </p>
          </div>

          {/* Why It's Different */}
          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              What Makes It Different?
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-cyan-300 font-bold mb-2 text-sm">Traditional Protocols</h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Only one resolution mechanism: liquidation when unhealthy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Borrowers lose collateral and pay penalties during liquidation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>No market for healthy positions or voluntary exits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Limited opportunities for third-party participants</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-cyan-300 font-bold mb-2 text-sm">Orbital's Trading Post</h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong className="text-pink-400">Two resolution mechanisms:</strong> liquidations for unhealthy positions AND buyouts for healthy ones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Borrowers can <strong className="text-pink-400">profit</strong> from buyouts through premium sharing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Active marketplace for all loan positions — healthy and at-risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Traders can acquire collateral without borrowing themselves</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Protocol earns additional revenue beyond interest rates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* The Two Trading Mechanisms */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Two Ways to Trade Positions</h3>
            <p className="mb-4 text-sm">
              The Trading Post supports two distinct mechanisms for acquiring debt positions, each designed for 
              different scenarios and market conditions:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Buyouts Card */}
              <button
                onClick={() => onNavigate?.('buyouts')}
                className="bg-slate-800 bg-opacity-50 border-2 border-cyan-600 hover:border-cyan-400 rounded-lg p-5 text-left transition-all hover:bg-opacity-70 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-cyan-400 font-bold text-base">Buyouts</h4>
                  </div>
                  <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-cyan-200 font-semibold">For Healthy Positions</p>
                  <p className="text-slate-400">
                    Purchase healthy loan positions by paying a <span className="text-pink-400">premium</span> above the debt. 
                    Borrowers profit from the sale, and buyers acquire yield-bearing collateral.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-cyan-300">
                      <strong>When:</strong> Health ratio above liquidation threshold<br/>
                      <strong>Cost:</strong> Debt + Premium<br/>
                      <strong>Result:</strong> Win-win for borrower and buyer
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-cyan-400 text-xs font-bold flex items-center gap-1">
                  Read detailed guide
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Liquidations Card */}
              <button
                onClick={() => onNavigate?.('liquidations')}
                className="bg-slate-800 bg-opacity-50 border-2 border-red-600 hover:border-red-400 rounded-lg p-5 text-left transition-all hover:bg-opacity-70 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h4 className="text-red-400 font-bold text-base">Liquidations</h4>
                  </div>
                  <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-red-200 font-semibold">For Unhealthy Positions</p>
                  <p className="text-slate-400">
                    Liquidate undercollateralized positions by repaying debt and claiming collateral with a 
                    <span className="text-pink-400"> liquidation bonus</span>. Protects protocol solvency.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-red-300">
                      <strong>When:</strong> Health ratio below liquidation threshold<br/>
                      <strong>Cost:</strong> Debt repayment only<br/>
                      <strong>Result:</strong> Liquidator profit, borrower loses collateral
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-red-400 text-xs font-bold flex items-center gap-1">
                  Read detailed guide
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>

          {/* Benefits Overview */}
          <div className="bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-30 rounded-lg p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Who Benefits?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="text-cyan-300 font-bold mb-2">For Borrowers</h4>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>Option to exit positions profitably via buyouts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>Earn premium bonuses when positions are bought out</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>More flexibility than liquidation-only systems</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-cyan-300 font-bold mb-2">For Traders/Liquidators</h4>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>Acquire collateral assets without borrowing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>Profit opportunities from both buyouts and liquidations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">→</span>
                    <span>Transparent on-chain pricing and settlement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-5">
            <h3 className="text-xl font-bold text-cyan-400 mb-3">How to Use the Trading Post</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">1</span>
                <div>
                  <strong className="text-cyan-300">Navigate to Trade</strong>
                  <p className="text-slate-400 text-xs mt-1">Click the "Trade" tab in the main navigation to access the marketplace</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">2</span>
                <div>
                  <strong className="text-cyan-300">Browse Available Positions</strong>
                  <p className="text-slate-400 text-xs mt-1">View all active loan positions with health ratios, collateral types, and pricing</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">3</span>
                <div>
                  <strong className="text-cyan-300">Filter by Opportunity Type</strong>
                  <p className="text-slate-400 text-xs mt-1">Look for healthy positions (buyouts) or at-risk positions (liquidations)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-cyan-400 bg-opacity-20 text-cyan-400 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">4</span>
                <div>
                  <strong className="text-cyan-300">Execute Atomically</strong>
                  <p className="text-slate-400 text-xs mt-1">Complete buyouts or liquidations in a single on-chain transaction</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Key Insight */}
          <div className="bg-gradient-to-br from-cyan-900 via-slate-800 to-cyan-900 bg-opacity-50 border-2 border-cyan-500 border-opacity-30 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-cyan-300 font-bold mb-3 text-lg">
                  A New Paradigm for DeFi Lending
                </h4>
                <div className="text-cyan-100 text-sm space-y-2">
                  <p>
                    The Mercury Trading Post transforms lending from a static <strong className="text-pink-400">borrow-and-repay</strong> model 
                    into a <strong className="text-pink-400">dynamic marketplace</strong> with continuous price discovery, multiple exit strategies, 
                    and opportunities for all participants.
                  </p>
                  <p className="text-cyan-200 font-semibold mt-3">
                    This creates entirely new DeFi strategies that don't exist in traditional protocols — from yield farming 
                    through buyout premiums to collateral acquisition without borrowing risk.
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
