
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import LendingMarketsPage from './pages/LendingMarketsPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/app/markets" element={<LendingMarketsPage />} />
        {/* Future routes for app sub-pages */}
        {/* <Route path="/app/dashboard" element={<DashboardPage />} /> */}
        {/* <Route path="/app/borrow" element={<BorrowPage />} /> */}
        {/* <Route path="/app/marketplace" element={<MarketplacePage />} /> */}
        {/* <Route path="/app/portfolio" element={<PortfolioPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
