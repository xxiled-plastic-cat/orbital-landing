import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Coins,
  TrendingUp,
  ShoppingCart,
  Wallet,
  Droplets,
  Zap,
  ChevronRight,
  Radio,
  Target,
  Vote,
} from "lucide-react";
import AppLayout from "../components/app/AppLayout";
import { Link } from "react-router-dom";
import {
  OverviewSection,
  LendingSection,
  BorrowingSection,
  MarketplaceSection,
  PortfolioSection,
  FaucetSection,
  GovernanceSection
} from "../components/docs";

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("overview");

  const sections = [
    {
      id: "overview",
      title: "Mission Overview",
      icon: Radio,
      description: "Understanding Orbital Lending Protocol",
    },
    {
      id: "lending",
      title: "Orbital Markets",
      icon: Coins,
      description: "Supply assets and earn interest",
    },
    {
      id: "borrowing",
      title: "Launch Positions",
      icon: TrendingUp,
      description: "Borrow against your collateral",
    },
    {
      id: "marketplace",
      title: "Mercury Trading Post",
      icon: ShoppingCart,
      description: "Trade tokenized debt positions",
    },
    {
      id: "portfolio",
      title: "Command Center",
      icon: Wallet,
      description: "Monitor your positions and health",
    },
    {
      id: "faucet",
      title: "Resource Station",
      icon: Droplets,
      description: "Get testnet tokens for testing",
    },
    {
      id: "governance",
      title: "Governance Hub",
      icon: Vote,
      description: "Participate in protocol governance",
    },
  ];

  return (
    <AppLayout title="Orbital Documentation - Mission Briefing">
      <div className="container-section py-4 md:py-8">
        {/* Mission Control Header */}
        <motion.div
          className="mb-6 md:mb-8"
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
                      <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                      <span className="text-base md:text-lg font-mono font-semibold text-slate-300 uppercase tracking-wide">
                        MISSION BRIEFING
                      </span>
                    </div>
                    <div className="text-amber-400 cut-corners-sm px-2 py-1 md:px-4 md:py-2 border border-amber-400 shadow-inset">
                      <span className="text-amber-400 text-xs md:text-sm font-mono font-semibold uppercase tracking-wide">
                        TESTNET
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block h-8 w-px bg-slate-600 mx-6"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 lg:gap-8 text-sm lg:flex lg:items-center">
                  <div className="flex flex-col sm:block">
                    <span className="text-slate-400 uppercase tracking-wide text-xs md:text-sm">
                      Protocol Status:
                    </span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      ONLINE
                    </span>
                  </div>
                  <div className="flex flex-col sm:block">
                    <span className="text-slate-400 uppercase tracking-wide text-xs md:text-sm">
                      Network:
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums text-base md:text-lg sm:ml-2 lg:ml-3">
                      ALGORAND
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-mono font-bold mb-4 md:mb-6 text-white tracking-tight">
            ORBITAL <span className="text-cyan-400">DOCUMENTATION</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-slate-300 max-w-4xl font-mono leading-relaxed mb-6 md:mb-8">
            Complete guide to Orbital Lending Protocol • Learn to
            navigate the system • Master DeFi lending
          </p>

          {/* Navigation Link */}
          <div className="flex items-center gap-4">
            <Link 
              to="/app"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm md:text-base group"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform duration-150" />
              <span className="uppercase tracking-wide">Back to Mission Control</span>
            </Link>
          </div>
        </motion.div>

        {/* Main Documentation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Navigation Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial sticky top-8">
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  NAVIGATION
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-150 group ${
                          isActive 
                            ? 'bg-cyan-400 bg-opacity-20 border border-cyan-400 border-opacity-30 text-cyan-400' 
                            : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                          <div className="flex-1">
                            <div className={`font-mono font-semibold text-sm ${isActive ? 'text-cyan-400' : 'text-slate-300 group-hover:text-white'}`}>
                              {section.title}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {section.description}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90 text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-slate-600 cut-corners-lg bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="p-6 md:p-8">
                {/* Overview Section */}
                {activeSection === "overview" && <OverviewSection />}

                {/* Lending Section */}
                {activeSection === "lending" && <LendingSection />}

                {/* Borrowing Section */}
                {activeSection === "borrowing" && <BorrowingSection />}

                {/* Marketplace Section */}
                {activeSection === "marketplace" && <MarketplaceSection />}

                {/* Portfolio Section */}
                {activeSection === "portfolio" && <PortfolioSection />}

                {/* Faucet Section */}
                {activeSection === "faucet" && <FaucetSection />}

                {/* Governance Section */}
                {activeSection === "governance" && <GovernanceSection />}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DocsPage;