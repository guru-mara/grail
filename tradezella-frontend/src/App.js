// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import AccountsPage from './pages/Accounts/AccountsPage';
import TemplatesPage from './pages/Templates/TemplatesPage';
import ScenariosPage from './pages/Scenarios/ScenariosPage';
import SimulationsPage from './pages/Simulations/SimulationsPage';
import CalculatorsPage from './pages/Calculators/CalculatorsPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';

// Trade Components
import TradesList from './components/trades/TradesList';
import TradeEntryPage from './pages/Trades/TradeEntryPage';  
import TradeAnalysisPage from './pages/Trades/TradeAnalysisPage';

// Layout
import AppLayout from './components/layout/AppLayout';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#FFC107', // Gold color
    },
    secondary: {
      main: '#2196F3', // Blue color
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  }
});

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="scenarios" element={<ScenariosPage />} />
        <Route path="simulations" element={<SimulationsPage />} />
        <Route path="calculators" element={<CalculatorsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="trades" element={<TradesList />} />
        <Route path="trades/new" element={<TradeEntryPage />} />
        <Route path="trades/:tradeId/analysis" element={<TradeAnalysisPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;