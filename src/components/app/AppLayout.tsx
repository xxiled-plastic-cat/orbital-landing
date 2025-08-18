import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
      
      {/* Header with glassmorphism */}
      <header className="relative z-10 border-b border-neon-teal border-opacity-20">
        <div className="backdrop-blur-md bg-space-gray bg-opacity-20 border-b border-white border-opacity-10">
          <div className="container-section py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {showBackButton && (
                  <>
                    <Link 
                      to="/" 
                      className="flex items-center gap-2 text-soft-gray hover:text-neon-teal transition-colors duration-300 group"
                    >
                      <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform duration-300" />
                      Back to Landing
                    </Link>
                    <div className="h-6 w-px bg-neon-teal bg-opacity-30"></div>
                  </>
                )}
                <h1 className="text-xl font-sora font-bold">{title}</h1>
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
