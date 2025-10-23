
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatelessLending from '../components/StatelessLending';
import TokenizedDebt from '../components/TokenizedDebt';
import DebtMarketplace from '../components/DebtMarketplace';
import MarketplaceLayer from '../components/MarketplaceLayer';
import WhyOrbital from '../components/WhyOrbital';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-mono overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <StatelessLending />
        <TokenizedDebt />
        <DebtMarketplace />
        <MarketplaceLayer />
        <WhyOrbital />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
