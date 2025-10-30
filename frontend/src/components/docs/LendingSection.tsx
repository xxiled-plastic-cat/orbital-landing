import React from 'react';
import { Coins, Zap } from 'lucide-react';
import VideoEmbed from './VideoEmbed';

const LendingSection: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Coins className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Supply
        </h2>
      </div>

      <VideoEmbed 
        title="How to Supply Assets"
        description="Step-by-step guide to supplying your assets and earning interest"
        youtubeUrl="https://www.youtube.com/embed/d1w_5GQ4Aik?si=et3XvcwNfj3rAIvn"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-4">
          <p>
            <strong className="text-cyan-400">
              Supply
            </strong>{" "}
            allow you to supply assets and earn interest. Supply your tokens 
            to lending pools and earn yield from borrower interest payments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">Supply Process</h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  Choose a market to supply to
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  Enter the amount you want to supply
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  Confirm the transaction
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">4.</span>
                  Receive collateral tokens representing your share
                </li>
              </ol>
            </div>

            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">Key Metrics</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Supply APR:</span>
                  <span className="text-cyan-400">Variable rate</span>
                </li>
                <li className="flex justify-between">
                  <span>Utilization:</span>
                  <span className="text-cyan-400">Market dependent</span>
                </li>
                <li className="flex justify-between">
                  <span>Collateral Factor:</span>
                  <span className="text-cyan-400">Asset specific</span>
                </li>
                <li className="flex justify-between">
                  <span>Liquidity:</span>
                  <span className="text-cyan-400">Real-time</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-400 font-bold mb-2">Collateral Tokens</h4>
                <p className="text-amber-200 text-sm">
                  When you supply assets, you receive collateral 'c' tokens that represent your 
                  deposit and share of the market. These tokens automatically accrue interest and 
                  can be redeemed for the underlying asset plus earned interest at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LendingSection;
