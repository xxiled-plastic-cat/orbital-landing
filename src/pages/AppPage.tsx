import {
  TrendingUp,
  DollarSign,
  ClipboardList,
  Droplets,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AppLayout from "../components/app/AppLayout";
import MissionControlHeader from "../components/app/MissionControlHeader";

const AppPage = () => {

  return (
    <AppLayout>
      <div className="container-section py-6 md:py-12">
        <MissionControlHeader />

        {/* Operations Grid */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {[
            {
              icon: DollarSign,
              title: "Lending Markets",
              description:
                "Supply assets to earn interest or borrow against your collateral with competitive rates.",
              delay: 0.4,
            },
            {
              icon: TrendingUp,
              title: "Mercury Trading Post",
              description:
                "Discover and trade debt positions with automated pricing and instant liquidity.",
              delay: 0.6,
            },
            {
              icon: ClipboardList,
              title: "Logbook",
              description:
                "Monitor your positions, track performance, and manage your lending portfolio.",
              delay: 0.8,
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: item.delay }}
            >
              {/* Industrial Card */}
              <div className="text-slate-600 cut-corners-lg p-4 md:p-6 bg-noise-dark border-2 border-slate-600 shadow-industrial hover:border-slate-500 transition-all duration-150">
                <div className="bg-slate-700 border border-slate-600 p-3 md:p-4 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-4 md:mb-6">
                  <item.icon className="text-cyan-400 w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="font-mono text-lg md:text-xl font-bold mb-3 md:mb-4 text-white">
                  {item.title}
                </h3>
                <p className="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm">
                  {item.description}
                </p>
                {item.title === "Lending Markets" ? (
                  <Link to="/app/markets" className="block w-full">
                    <button className="w-full text-cyan-500 cut-corners-sm px-4 py-2.5 md:px-6 md:py-3 font-mono text-xs md:text-sm hover:text-cyan-400 transition-all duration-150 border border-cyan-500 hover:border-cyan-400">
                      <span className="text-white">EXPLORE MARKETS</span>
                    </button>
                  </Link>
                ) : item.title === "Mercury Trading Post" ? (
                  <Link to="/app/marketplace" className="block w-full">
                    <button className="w-full text-cyan-500 cut-corners-sm px-4 py-2.5 md:px-6 md:py-3 font-mono text-xs md:text-sm hover:text-cyan-400 transition-all duration-150 border border-cyan-500 hover:border-cyan-400">
                      <span className="text-white">ENTER MERCURY TRADING POST</span>
                    </button>
                  </Link>
                ) : item.title === "Logbook" ? (
                  <Link to="/app/portfolio" className="block w-full">
                    <button className="w-full text-cyan-500 cut-corners-sm px-4 py-2.5 md:px-6 md:py-3 font-mono text-xs md:text-sm hover:text-cyan-400 transition-all duration-150 border border-cyan-500 hover:border-cyan-400">
                      <span className="text-white">VIEW LOGBOOK</span>
                    </button>
                  </Link>
                ) : (
                  <button className="w-full text-slate-500 cut-corners-sm px-4 py-2.5 md:px-6 md:py-3 font-mono text-xs md:text-sm cursor-not-allowed border border-slate-500">
                    <span className="text-slate-400">COMING SOON</span>
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
          <div className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
              <h3 className="text-lg md:text-2xl font-mono font-bold text-center text-white">
                SYSTEM STATUS
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {/* Module 1 */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="bg-transparent border border-slate-600 p-4 md:p-6">
                  <h4 className="font-mono font-bold text-cyan-400 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                    <Droplets className="w-4 h-4 md:w-5 md:h-5" />
                    FOUNDATION
                  </h4>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>Routing Infrastructure ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>Industrial UI Theme ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>Wallet Integration ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
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
                <div className="bg-transparent border border-slate-600 p-4 md:p-6">
                  <h4 className="font-mono font-bold text-amber-400 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                    <Zap className="w-4 h-4 md:w-5 md:h-5" />
                    CORE LENDING
                  </h4>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>Smart Contract Integration ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>Oracle Deployment ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>Interest Accruals ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>Supply/Borrow Interface ✓</span>
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
                <div className="bg-transparent border border-slate-600 p-4 md:p-6">
                  <h4 className="font-mono font-bold text-red-400 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                    MERCURY TRADING POST
                  </h4>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500"></div>
                      <span>Marketplace Trading</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span>Portfolio Management</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Position Analytics</span>
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
