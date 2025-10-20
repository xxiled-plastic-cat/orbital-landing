import React, { useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import WalletButton from "./WalletButton";

interface AppHeaderProps {
  showBackButton?: boolean;
  title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = "Orbital Lending",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/app/markets", label: "Lending Markets" },
    { to: "/app/marketplace", label: "Mercury Trading Post" },
    { to: "/app/portfolio", label: "Logbook" },
  ];

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <header className="relative z-10 border-b border-slate-700">
      <div className="bg-slate-900 bg-opacity-95 backdrop-blur-sm">
        <div className="container-section py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Logo/Title */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
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

            {/* Center - Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-mono text-sm uppercase tracking-wide transition-colors ${
                    isActiveLink(link.to)
                      ? "text-cyan-400"
                      : "text-slate-300 hover:text-cyan-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/app/docs"
                className={`flex items-center gap-2 font-mono text-sm uppercase tracking-wide transition-colors ${
                  isActiveLink("/app/docs")
                    ? "text-cyan-400"
                    : "text-slate-300 hover:text-cyan-300"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Docs</span>
              </Link>
            </nav>

            {/* Right side - Wallet Button and Mobile Menu */}
            <div className="flex items-center gap-3 shrink-0">
              <WalletButton />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-cyan-400 transition-colors border border-slate-600 bg-slate-800"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-700 bg-slate-900">
            <nav className="container-section py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-mono text-sm uppercase tracking-wide py-2 px-4 transition-colors border-l-2 ${
                    isActiveLink(link.to)
                      ? "border-cyan-400 text-cyan-400 bg-slate-800"
                      : "border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/app/docs"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 font-mono text-sm uppercase tracking-wide py-2 px-4 transition-colors border-l-2 ${
                  isActiveLink("/app/docs")
                    ? "border-cyan-400 text-cyan-400 bg-slate-800"
                    : "border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Docs</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
