
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import LendingMarketsPage from './pages/LendingMarketsPage';
import MarketDetailsPage from './pages/MarketDetailsPage';
import PortfolioPage from './pages/PortfolioPage';
import MarketplacePage from './pages/MarketplacePage';
import DebtPositionDetailPage from './pages/DebtPositionDetailPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/app/markets" element={<LendingMarketsPage />} />
        <Route path="/app/markets/details" element={<MarketDetailsPage />} />
        <Route path="/app/portfolio" element={<PortfolioPage />} />
        <Route path="/app/marketplace" element={<MarketplacePage />} />
        <Route path="/app/marketplace/position/:id" element={<DebtPositionDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
