import React from 'react';
import { Droplets, Zap } from 'lucide-react';
import VideoEmbed from './VideoEmbed';

const FaucetSection: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Droplets className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Resource Station
        </h2>
      </div>

      <VideoEmbed 
        title="Getting Testnet Tokens"
        description="How to use the faucet to get test tokens for protocol interaction"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-4">
          <p>
            The <strong className="text-cyan-400">Resource Station</strong> provides free testnet tokens 
            so you can explore all features of Orbital Lending without using real assets.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">Available Tokens</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>ALGO:</span>
                  <span className="text-cyan-400">1000 per request</span>
                </li>
                <li className="flex justify-between">
                  <span>USDCt:</span>
                  <span className="text-cyan-400">10,000 per request</span>
                </li>
                <li className="flex justify-between">
                  <span>xUSDt:</span>
                  <span className="text-cyan-400">10,000 per request</span>
                </li>
                <li className="flex justify-between">
                  <span>COMPXt:</span>
                  <span className="text-cyan-400">100 per request</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">Usage Instructions</h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  Connect your Algorand wallet
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  Select tokens you need
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  Click "Request Tokens"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">4.</span>
                  Wait for transaction confirmation
                </li>
              </ol>
            </div>
          </div>

          <div className="bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-400 font-bold mb-2">Testnet Only</h4>
                <p className="text-amber-200 text-sm">
                  These tokens have no real-world value and are only for testing purposes. 
                  The faucet has rate limits to prevent abuse - you can request tokens once 
                  every 24 hours per wallet address.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-3">Getting Started Checklist</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-white font-semibold mb-2">For Lending</h5>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Get ALGO for transaction fees
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Get USDCt or xUSDt to supply
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Visit Orbital Markets
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-2">For Trading</h5>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Get ALGO for purchases
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Browse Mercury Trading Post
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Start with small positions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaucetSection;
