import React from 'react';
import { Wallet } from 'lucide-react';
import VideoEmbed from './VideoEmbed';

const PortfolioSection: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Logbook
        </h2>
      </div>

      <VideoEmbed 
        title="Portfolio Management"
        description="Monitor your positions, health ratios, and earnings in the Command Center"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-4">
          <p>
            Your <strong className="text-cyan-400">Command Center</strong> provides a comprehensive view 
            of all your positions, earnings, and risk metrics across the Orbital Lending ecosystem.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">Supply Positions</h4>
              <ul className="space-y-2 text-sm">
                <li>• Total supplied value</li>
                <li>• Interest earned</li>
                <li>• Collateral 'c' token balances</li>
                <li>• APR tracking</li>
              </ul>
            </div>

            <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-bold mb-3">Borrow Positions</h4>
              <ul className="space-y-2 text-sm">
                <li>• Total borrowed value</li>
                <li>• Interest owed</li>
                <li>• Health ratios</li>
                <li>• Liquidation risk</li>
              </ul>
            </div>

            
          </div>

          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-3">Health Monitoring</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-white font-semibold mb-2">Real-time Alerts</h5>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Health ratio above 1.5 (Safe)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Health ratio 1.0-1.5 (Caution)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    Health ratio below 1.0 (Danger)
                  </li>
                </ul>
              </div>
              {/* <div>
                <h5 className="text-white font-semibold mb-2">Quick Actions</h5>
                <ul className="space-y-1 text-sm">
                  <li>• Add more collateral</li>
                  <li>• Repay borrowed amounts</li>
                  <li>• Withdraw excess collateral</li>
                  <li>• Emergency liquidation</li>
                </ul>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSection;
