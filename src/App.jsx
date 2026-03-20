import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import FunnelPage from './pages/FunnelPage';
import ResultsPage from './pages/ResultsPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <FilterProvider>
        <Routes>
          <Route path="/" element={<FunnelPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </FilterProvider>
    </BrowserRouter>
  );
}
