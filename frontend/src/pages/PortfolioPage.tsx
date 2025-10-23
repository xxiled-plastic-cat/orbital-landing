import React from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  ArrowLeft
} from 'lucide-react';
import AppLayout from '../components/app/AppLayout';
import { useWallet } from '@txnlab/use-wallet-react';
import { Link } from 'react-router-dom';
import NetworkBadge from '../components/app/NetworkBadge';
import { 
  ActivePositionsSection, 
  WalletBalancesSection, 
  TransactionHistorySection 
} from '../components/portfolio';


const PortfolioPage: React.FC = () => {
  const { activeAccount } = useWallet();

  return (
    <AppLayout title="Logbook">
      <div className="container-section py-4 md:py-8">
        {/* Navigation Link */}
        <div className="mb-4 md:mb-4">
          <Link 
            to="/app"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs sm:text-sm md:text-base group"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-150" />
            <span className="uppercase tracking-wide">Back to Home</span>
          </Link>
        </div>

        {/* Mission Control Header */}
        <motion.div
          className="mb-5 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Mission Control Strip */}
          <div className="relative mb-6 md:mb-8">
            <div className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 md:gap-3 justify-between w-full">
                    <div className="flex items-center gap-2 md:gap-3">
                      <History className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                      <span className="text-base md:text-lg font-mono font-semibold text-slate-300 uppercase tracking-wide">
                        MISSION CONTROL
                      </span>
                    </div>
                    <NetworkBadge />
                  </div>
                </div>

                <div className="hidden lg:block h-8 w-px bg-slate-600 mx-6"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 lg:gap-8 text-sm lg:flex lg:items-center">
                  <div className="flex flex-col sm:block">
                    <span className="text-slate-400 uppercase tracking-wide text-xs md:text-sm">
                      Wallet:
                    </span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3">
                      {activeAccount?.address ? 
                        `${activeAccount.address.slice(0, 6)}...${activeAccount.address.slice(-6)}` : 
                        "Not Connected"
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-mono font-bold mb-3 sm:mb-4 md:mb-6 text-white tracking-tight">
            ORBITAL <span className="text-cyan-400">LOG BOOK</span>
          </h1>
          <p className="text-xs sm:text-base md:text-xl text-slate-300 max-w-4xl font-mono leading-relaxed mb-5 sm:mb-6 md:mb-8">
            Track your complete transaction history across all Orbital lending markets. 
            Monitor deposits, borrows, repayments, and redemptions with detailed blockchain records.
          </p>
        </motion.div>

        {/* Active Positions Section */}
        <ActivePositionsSection />

        {/* Wallet Balances Section */}
        <WalletBalancesSection />

        {/* Transaction History Section */}
        <TransactionHistorySection />
      </div>
    </AppLayout>
  );
};

export default PortfolioPage;
