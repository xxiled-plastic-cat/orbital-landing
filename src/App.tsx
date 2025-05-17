import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatelessLending from './components/StatelessLending';
import TokenizedDebt from './components/TokenizedDebt';
import DebtMarketplace from './components/DebtMarketplace';
import MarketplaceLayer from './components/MarketplaceLayer';
import WhyOrbital from './components/WhyOrbital';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-space-dark text-white font-inter overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <StatelessLending />
        <TokenizedDebt />
        <DebtMarketplace />
        <MarketplaceLayer />
        <WhyOrbital />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default App;