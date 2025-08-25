import React from 'react';
import OrbitalBackground from './OrbitalBackground';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

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
      
      <AppHeader showBackButton={showBackButton} title={title} />

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default AppLayout;
