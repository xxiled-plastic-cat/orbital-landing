import { useContext, useEffect } from 'react';
import { TrendingUp, DollarSign, BarChart3, Droplets, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AppLayout from '../components/app/AppLayout';
import UnauthorizedAccess from '../components/app/UnauthorizedAccess';
import { WalletContext } from '../components/context/wallet';
import { useWallet } from "@txnlab/use-wallet-react";

const AppPage = () => {
  const { activeAccount, activeWallet } = useWallet();
  const { isEligible, isCheckingEligibility, checkEligibility } = useContext(WalletContext);

  // Trigger eligibility check when wallet connects but hasn't been checked yet
  useEffect(() => {
    console.log("activeAccount", activeAccount);
    console.log("isEligible", isEligible);
    console.log("isCheckingEligibility", isCheckingEligibility);
    if (activeAccount?.address && !isCheckingEligibility) {
      console.log("Triggering eligibility check for connected wallet");
      checkEligibility(activeAccount.address);
    }
  }, [activeAccount?.address, isEligible]);

  // Show loading state while checking eligibility
  if (activeAccount && activeWallet && isCheckingEligibility) {
    return (
      <AppLayout>
        <div className="container-section py-12 min-h-[60vh] flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mx-auto w-16 h-16 mb-6">
              <div className="absolute inset-0 bg-neon-teal opacity-20 rounded-full blur-sm animate-pulse"></div>
              <div className="relative bg-neon-teal bg-opacity-20 rounded-full p-4 flex items-center justify-center animate-pulse">
                <Shield className="w-8 h-8 text-neon-teal" />
              </div>
            </div>
            <h3 className="text-2xl font-sora font-bold mb-4">Checking Eligibility</h3>
            <p className="text-soft-gray">Verifying your NFT holdings for testnet access...</p>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Show unauthorized access if wallet is connected but not eligible
  if (activeAccount && activeWallet && isEligible === false) {
    return (
      <AppLayout>
        <UnauthorizedAccess />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container-section py-12">
        {/* Mission Control Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Status Strip */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-slate-900 bg-opacity-90 backdrop-blur-sm border border-slate-700 rounded-lg"></div>
            <div className="relative px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-mono text-slate-300">ORBITAL LENDING</span>
                  </div>
                  <div className="h-6 w-px bg-slate-600"></div>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-mono">SYSTEM ONLINE</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 bg-opacity-20 border border-amber-500 border-opacity-30 px-3 py-1 rounded-md">
                    <span className="text-amber-400 text-sm font-mono">TESTNET</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-mono font-bold mb-6 text-white">
              ORBITAL <span className="text-cyan-400">LENDING</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 font-mono">
              Decentralized lending protocol on Algorand testnet. 
              Supply assets, borrow funds, trade debt positions.
            </p>
            
            {/* Testnet Notice */}
            <div className="bg-amber-500 bg-opacity-10 border border-amber-500 border-opacity-30 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <p className="text-amber-400 font-mono text-sm">
                 TESTNET ENVIRONMENT - All transactions use test tokens with no real value
                </p>
              </div>
            </div>
          </div>
        </motion.div>

                {/* Operations Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: DollarSign,
              title: "Lending Markets",
              description: "Supply assets to earn interest or borrow against your collateral with competitive rates.",
              delay: 0.4
            },
            {
              icon: TrendingUp,
              title: "Debt Marketplace",
              description: "Discover and trade debt positions with automated pricing and instant liquidity.",
              delay: 0.6
            },
            {
              icon: BarChart3,
              title: "Portfolio",
              description: "Monitor your positions, track performance, and manage your lending portfolio.",
              delay: 0.8
            }
          ].map((item) => (
            <motion.div
              key={item.title}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: item.delay }}
            >
              {/* Industrial Card */}
              <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 hover:border-slate-500 hover:bg-slate-750 transition-all duration-150">
                <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                  <item.icon className="text-cyan-400 w-8 h-8" />
                </div>
                <h3 className="font-mono text-xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-slate-300 mb-6 leading-relaxed text-sm">
                  {item.description}
                </p>
                {item.title === "Lending Markets" ? (
                  <Link to="/app/markets" className="block w-full">
                    <button className="w-full bg-cyan-600 border border-cyan-500 text-white px-6 py-3 rounded-lg font-mono text-sm hover:bg-cyan-500 transition-all duration-150">
                      EXPLORE MARKETS
                    </button>
                  </Link>
                ) : (
                  <button className="w-full bg-slate-600 border border-slate-500 text-slate-400 px-6 py-3 rounded-lg font-mono text-sm cursor-not-allowed">
                    COMING SOON
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Status */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >          
          {/* Industrial container */}
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-8">
            <div className="flex items-center justify-center gap-3 mb-6"> 
              <Shield className="w-6 h-6 text-cyan-400" />
              <h3 className="text-2xl font-mono font-bold text-center text-white">SYSTEM STATUS</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Module 1 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="bg-slate-700 border border-slate-600 rounded-lg p-6">
                  <h4 className="font-mono font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5" />
                    FOUNDATION
                  </h4>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Routing Infrastructure ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Industrial UI Theme ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Wallet Integration ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Testnet Faucet ✓</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Module 2 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="bg-slate-700 border border-slate-600 rounded-lg p-6">
                  <h4 className="font-mono font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    CORE LENDING
                  </h4>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Smart Contract Integration</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Oracle Deployment</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Interest Accruals</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Supply/Borrow Interface</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Module 3 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <div className="bg-slate-700 border border-slate-600 rounded-lg p-6">
                  <h4 className="font-mono font-bold text-red-400 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    DEBT MARKETPLACE
                  </h4>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Marketplace Trading</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Portfolio Management</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Position Analytics</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Risk Assessment</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default AppPage;
