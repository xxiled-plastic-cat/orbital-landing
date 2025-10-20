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
      title: "Overview",
      icon: Radio,
      description: "Understanding Orbital Lending Protocol",
    },
    {
      id: "lending",
      title: "Supply",
      icon: Coins,
      description: "Supply assets and earn interest",
    },
    {
      id: "borrowing",
      title: "Borrow",
      icon: TrendingUp,
      description: "Borrow against your collateral",
    },
    {
      id: "marketplace",
      title: "Trade",
      icon: ShoppingCart,
      description: "Trade tokenized debt positions",
    },
    {
      id: "portfolio",
      title: "Logbook",
      icon: Wallet,
      description: "Monitor your positions and history",
    },
    {
      id: "faucet",
      title: "Resource Station",
      icon: Droplets,
      description: "Get testnet tokens for testing",
    },
    {
      id: "governance",
      title: "Governance",
      icon: Vote,
      description: "Participate in protocol governance",
    },
  ];

  return (
    <AppLayout title="Orbital Documentation">
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
          <div className="relative mb-5 md:mb-8">
            <div className="text-slate-600 cut-corners-lg p-4 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
              <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
                {/* Top section: Title and Status badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
                    <span className="text-xs sm:text-base md:text-lg font-mono font-semibold text-slate-300 uppercase tracking-wide">
                      MISSION BRIEFING
                    </span>
                  </div>
                  {/* Status badges */}
                  <div className="text-amber-400 cut-corners-sm px-2 py-1 md:px-4 md:py-2 border border-amber-400 shadow-inset shrink-0">
                    <span className="text-amber-400 text-[10px] sm:text-xs md:text-sm font-mono font-semibold uppercase tracking-wide">
                      TESTNET
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block h-8 w-px bg-slate-600 mx-6"></div>

                {/* Stats section */}
                <div className="grid grid-cols-2 gap-2 md:gap-6 lg:gap-8 lg:flex lg:items-center">
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase tracking-wide text-xs sm:text-xs md:text-sm mb-0.5">
                      Protocol Status:
                    </span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums text-sm sm:text-base md:text-lg flex items-center gap-2">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                      ONLINE
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase tracking-wide text-xs sm:text-xs md:text-sm mb-0.5">
                      Network:
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums text-sm sm:text-base md:text-lg">
                      ALGORAND
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-mono font-bold mb-3 sm:mb-4 md:mb-6 text-white tracking-tight">
            ORBITAL <span className="text-cyan-400">DOCUMENTATION</span>
          </h1>
          <p className="text-xs sm:text-base md:text-xl text-slate-300 max-w-4xl font-mono leading-relaxed mb-5 sm:mb-6 md:mb-8">
            Complete guide to Orbital Lending Protocol • Learn to
            navigate the system • Master DeFi lending
          </p>
        </motion.div>

        {/* Main Documentation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
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
                        className={`w-full text-left p-3  transition-all duration-150 group ${
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