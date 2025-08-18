import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Radio } from 'lucide-react';
import OrbitalBackground from './OrbitalBackground';
import WalletButton from './WalletButton';

interface AppLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showBackButton = true, 
  title = "Orbital Lending Testnet" 
}) => {
  return (
    <div className="min-h-screen text-white font-inter relative">
      {/* Orbital Background */}
      <OrbitalBackground />
      
      {/* Industrial Header */}
      <header className="relative z-10 border-b border-slate-700">
        <div className="bg-slate-900 bg-opacity-95 backdrop-blur-sm">
          <div className="container-section py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {showBackButton && (
                  <>
                    <Link 
                      to="/" 
                      className="flex items-center gap-2 bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:border-slate-500 transition-all duration-150 group font-mono text-sm"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:transform group-hover:-translate-x-1 transition-transform duration-150" />
                      BACK TO LANDING
                    </Link>
                    <div className="h-6 w-px bg-slate-600"></div>
                  </>
                )}
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 border border-slate-600 p-2 rounded-lg">
                    <img 
                      src="/orbital-logo.png" 
                      alt="Orbital Lending" 
                      className="h-5 w-5"
                    />
                  </div>
                  <h1 className="text-lg font-mono font-bold text-white">{title.toUpperCase()}</h1>
                </div>
              </div>
              
              {/* Wallet Button Component */}
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
