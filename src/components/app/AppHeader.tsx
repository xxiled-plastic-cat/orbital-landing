import React from "react";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import WalletButton from "./WalletButton";

interface AppHeaderProps {
  showBackButton?: boolean;
  title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = "Orbital Lending Testnet",
}) => {
  return (
    <header className="relative z-10 border-b border-slate-700">
      <div className="bg-slate-900 bg-opacity-95 backdrop-blur-sm">
        <div className="container-section py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Back button and Logo/Title */}
            <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1">
              {/* Logo and Title */}
                <div className="flex items-center gap-2 md:gap-3 min-w-0 ">
                <div className="bg-slate-800 border border-slate-600 p-1 rounded-full shrink-0">
                  <img
                    src="/orbital-logo.png"
                    alt="Orbital Lending"
                    className="h-10 w-10 rounded-full object-contain"
                  />
                </div>
                <h1 className="text-sm md:text-lg font-mono font-bold text-white truncate">
                  <span className="hidden sm:inline">
                    {title.toUpperCase()}
                  </span>
                  <span className="sm:hidden">
                    {title.includes("Testnet")
                      ? "ORBITAL TESTNET"
                      : title.toUpperCase()}
                  </span>
                </h1>
                
                {/* Documentation Link */}
                <Link 
                  to="/app/docs"
                  className="ml-2 md:ml-4 flex items-center gap-1 md:gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs md:text-sm group"
                >
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline uppercase tracking-wide">DOCS</span>
                </Link>
              </div>
            </div>

            {/* Right side - Wallet Button */}
            <div className="shrink-0">
              <WalletButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
