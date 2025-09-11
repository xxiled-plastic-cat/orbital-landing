import React from 'react';
import { Vote, Users, Lock, TrendingUp, ExternalLink } from 'lucide-react';
import VideoEmbed from './VideoEmbed';

const GovernanceSection: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Vote className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Governance Hub
        </h2>
      </div>

      <VideoEmbed 
        title="CompX Governance System"
        description="Learn how to participate in protocol governance and shape Orbital's future"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-4">
          <p>
            <strong className="text-cyan-400">Orbital Lending</strong> is governed by the{" "}
            <strong className="text-compx-pink">$COMPX</strong> token, which grants holders voting rights 
            on key protocol decisions including interest rates, fee structures, liquidation thresholds, 
            and system upgrades.
          </p>
          
          <p>
            CompX is positioning itself as a <strong className="text-cyan-400">fully community-governed DAO</strong>, 
            enabling token holders to propose and vote on platform changes that directly affect Orbital's 
            lending markets and debt marketplace mechanics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                <Vote className="w-4 h-4" />
                Governance Powers
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  Interest rate curves and parameters
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  Liquidation thresholds and LTV ratios
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  Protocol fees and treasury allocation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  Debt marketplace premium rates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  New market listings and parameters
                </li>
              </ul>
            </div>

            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Voting Power ("Flux")
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-compx-pink rounded-full"></div>
                  Liquidity contributed (TVL)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-compx-pink rounded-full"></div>
                  COMPX LP token holdings
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-compx-pink rounded-full"></div>
                  Locked COMPX tokens
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-compx-pink rounded-full"></div>
                  Platform usage and engagement
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4 my-6">
            <h4 className="text-cyan-400 font-bold mb-3">Earning COMPX Tokens</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-white font-semibold mb-2">Platform Activities</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Supplying assets to Orbital Markets</li>
                  <li>• Borrowing from lending pools</li>
                  <li>• Participating in debt marketplace</li>
                  <li>• Using xUSD stablecoin</li>
                  <li>• Providing liquidity to pools</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-2">Reward Distribution</h5>
                <ul className="space-y-1 text-sm">
                  <li>• ~1,000,000 COMPX weekly emissions</li>
                  <li>• Distributed through usage incentives</li>
                  <li>• Additional staking rewards</li>
                  <li>• Liquidity mining programs</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-compx-pink bg-opacity-10 border border-compx-pink border-opacity-30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-compx-pink shrink-0 mt-0.5" />
              <div>
                <h4 className="text-compx-pink font-bold mb-2">Staking & Locking Benefits</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-pink-200">
                    Staking or locking COMPX tokens increases your <strong>"Flux"</strong> - your governance 
                    voting power within the CompX ecosystem. Higher Flux means:
                  </p>
                  <ul className="space-y-1 text-pink-200">
                    <li>• Greater influence on protocol decisions</li>
                    <li>• Access to enhanced reward multipliers</li>
                    <li>• Priority in governance proposal creation</li>
                    <li>• Increased share of protocol revenue</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-400 font-bold mb-2">Governance Evolution</h4>
                <p className="text-amber-200 text-sm">
                  CompX governance launched in early 2025 with reward distribution already active. 
                  Specific mechanics like proposal thresholds, voting durations, and delegation features 
                  are still being refined by the community. This ensures the governance system evolves 
                  based on real usage and community needs.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4 my-6">
            <h4 className="text-cyan-400 font-bold mb-3">Why Governance Matters for Orbital</h4>
            <div className="space-y-3 text-sm">
              <p>
                Orbital's innovative features like the <strong className="text-cyan-400">Debt Marketplace</strong> and 
                dynamic interest rates require careful parameter tuning. Community governance ensures:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-1">
                  <li>• <strong>Market Responsiveness:</strong> Interest curves adapt to market conditions</li>
                  <li>• <strong>Risk Management:</strong> Liquidation thresholds balance safety and capital efficiency</li>
                  <li>• <strong>Innovation:</strong> New features and markets can be proposed and implemented</li>
                </ul>
                <ul className="space-y-1">
                  <li>• <strong>Fair Distribution:</strong> Premium splits and fees benefit all stakeholders</li>
                  <li>• <strong>Decentralization:</strong> No single entity controls critical parameters</li>
                  <li>• <strong>Transparency:</strong> All changes are proposed, debated, and voted on publicly</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-compx-pink bg-opacity-10 border border-compx-pink border-opacity-30 rounded-lg p-6 my-6">
            <div className="text-center">
              <h4 className="text-compx-pink font-bold text-lg mb-3 flex items-center justify-center gap-2">
                <Vote className="w-5 h-5" />
                Ready to Participate in Governance?
              </h4>
              <p className="text-pink-200 text-sm mb-4 max-w-2xl mx-auto">
                Join the CompX governance platform to vote on proposals, create new initiatives, 
                and help shape the future of Orbital Lending Protocol.
              </p>
              <a
                href="https://app.compx.io/governance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-compx-pink hover:bg-pink-500 text-white font-mono font-bold px-6 py-3 rounded-lg transition-all duration-150 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Vote className="w-4 h-4" />
                <span className="uppercase tracking-wide">Access Governance Platform</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-pink-300 text-xs mt-3 font-mono">
                Requires COMPX tokens to participate in voting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceSection;
