import {
  TrendingUp,
  DollarSign,
  ClipboardList,
  Rocket,
  Zap,
  Shield,
  Sparkles,
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
              imageUrl: "/lending-markets.png",
              title: "Lending Markets",
              description:
                "Supply assets to earn interest or borrow against your collateral with competitive rates.",
              delay: 0.4,
            },
            {
              icon: TrendingUp,
              imageUrl: "/trading-post.png",
              title: "Mercury Trading Post",
              description:
                "Discover and trade debt positions with automated pricing and instant liquidity.",
              delay: 0.6,
            },
            {
              icon: ClipboardList,
              imageUrl: "/logbook.png",
              title: "Logbook",
              description:
                "Monitor your positions, track performance, and manage your lending portfolio.",
              delay: 0.8,
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              className="relative h-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: item.delay }}
            >
              {/* Industrial Card */}
              <div className="h-full flex flex-col text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial hover:border-slate-500 transition-all duration-150">
                {/* Image at top if present */}
                {item.imageUrl && (
                  <div className="p-4 md:p-6 pb-0">
                    <div className="w-full aspect-[4/3] overflow-hidden border-2 border-slate-600">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex-grow flex flex-col p-4 md:p-6">
                  {!item.imageUrl && (
                    <div className="bg-slate-700 border border-slate-600 p-3 md:p-4 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-4 md:mb-6">
                      <item.icon className="text-cyan-400 w-6 h-6 md:w-8 md:h-8" />
                    </div>
                  )}
                  <h3 className="font-mono text-lg md:text-xl font-bold mb-3 md:mb-4 text-white">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm flex-grow">
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
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission Phases */}
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
                MISSION PHASES
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {/* Testnet Phase */}
              <motion.div
                className="relative h-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="bg-transparent border border-slate-600 p-4 md:p-6 h-full flex flex-col">
                  <h4 className="font-mono font-bold text-cyan-400 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                    <Rocket className="w-4 h-4 md:w-5 md:h-5" />
                    TESTNET PHASE
                  </h4>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>Deploying Contracts ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>Liquidation & Buyout Testing ✓</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400"></div>
                      <span>UI Loadout ✓</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Mainnet Deployment */}
              <motion.div
                className="relative h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="bg-transparent border border-slate-600 p-4 md:p-6 h-full flex flex-col">
                  <h4 className="font-mono font-bold text-amber-400 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                    <Zap className="w-4 h-4 md:w-5 md:h-5" />
                    MAINNET DEPLOYMENT
                  </h4>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500"></div>
                      <span>Mainnet Deployment</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500"></div>
                      <span>Launch ASA Markets: xUSD, COMPX, USDC, TINY, POW, ALPHA</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500"></div>
                      <span>ALGO Consensus Lending Market</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Phase 1 Markets */}
              <motion.div
                className="relative h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <div className="bg-transparent border border-slate-600 p-4 md:p-6 h-full flex flex-col">
                  <h4 className="font-mono font-bold text-purple-400 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                    PHASE 1
                  </h4>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>Phase 1 Markets</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>FLUX Markets</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>New Interest Curve Options</span>
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
