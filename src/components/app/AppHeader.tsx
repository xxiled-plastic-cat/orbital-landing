import React from "react";
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
