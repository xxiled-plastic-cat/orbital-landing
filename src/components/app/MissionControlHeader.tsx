import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';

const MissionControlHeader: React.FC = () => {
  return (
    <motion.div 
      className="mb-6 md:mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Status Strip */}
      <div className="relative mb-4 md:mb-8">
        <div className="absolute inset-0 bg-slate-900 bg-opacity-90 backdrop-blur-sm border border-slate-700 rounded-lg"></div>
        <div className="relative px-3 md:px-6 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                <span className="text-xs md:text-sm font-mono text-slate-300">ORBITAL LENDING</span>
              </div>
              <div className="hidden sm:block h-4 md:h-6 w-px bg-slate-600"></div>
              <div className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-mono">SYSTEM ONLINE</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-amber-500 bg-opacity-20 border border-amber-500 border-opacity-30 px-2 md:px-3 py-1 rounded-md">
                <span className="text-amber-400 text-xs md:text-sm font-mono">TESTNET</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="text-center px-3 md:px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold mb-3 md:mb-6 text-white leading-tight">
          ORBITAL <span className="text-cyan-400">LENDING</span>
        </h2>
        <p className="text-sm sm:text-base md:text-xl text-slate-300 max-w-3xl mx-auto mb-4 md:mb-8 font-mono leading-relaxed">
          Decentralized lending protocol on Algorand testnet.
        </p>
        <p className="text-sm sm:text-base md:text-xl text-slate-300 max-w-3xl mx-auto mb-6 md:mb-8 font-mono leading-relaxed">
          Supply assets, borrow funds, trade debt positions.
        </p>
        
        {/* Testnet Notice */}
        <div className="bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded-lg p-3 md:p-4 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0" />
            <p className="text-amber-400 font-mono text-xs md:text-sm text-center sm:text-left leading-relaxed">
              TESTNET ENVIRONMENT - All transactions use test tokens with no real value
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MissionControlHeader;
