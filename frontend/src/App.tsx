import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { PlantsPage } from './pages/PlantsPage';
import { PlantDetailPage } from './pages/PlantDetailPage';
import { WeatherPage } from './pages/WeatherPage';
import { ObservationsPage } from './pages/ObservationsPage';
import { RulesPage } from './pages/RulesPage';
import { DatasetPage } from './pages/DatasetPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="advisory" element={<AdvisoryPage />} />
          <Route path="plants" element={<PlantsPage />} />
          <Route path="plants/:id" element={<PlantDetailPage />} />
          <Route path="weather" element={<WeatherPage />} />
          <Route path="observations" element={<ObservationsPage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="dataset" element={<DatasetPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
