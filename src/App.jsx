import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';
import FunnelPage from './pages/FunnelPage';
import ResultsPage from './pages/ResultsPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <FilterProvider>
          <Routes>
            <Route path="/" element={<FunnelPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </FilterProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
