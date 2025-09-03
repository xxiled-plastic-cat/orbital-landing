
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import LendingMarketsPage from './pages/LendingMarketsPage';
import MarketDetailsPage from './pages/MarketDetailsPage';
import PortfolioPage from './pages/PortfolioPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/app/markets" element={<LendingMarketsPage />} />
        <Route path="/app/markets/details" element={<MarketDetailsPage />} />
        <Route path="/app/portfolio" element={<PortfolioPage />} />
        {/* Future routes for app sub-pages */}
        {/* <Route path="/app/dashboard" element={<DashboardPage />} /> */}
        {/* <Route path="/app/borrow" element={<BorrowPage />} /> */}
        {/* <Route path="/app/marketplace" element={<MarketplacePage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
