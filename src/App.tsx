import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import DemoEntry from './components/DemoEntry';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import Lifestyle from './pages/Lifestyle';
import Chatbot from './pages/Chatbot';
import Engagement from './pages/Engagement';
import Settings from './pages/Settings';
import Register from './pages/Register';
import Otp from './pages/OTP';
import YearlySpend from './pages/YearlySpend';
import DailySpendPage from './pages/DailySpendPage';

function App() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to={isDevelopment ? "/register" : "/dashboard"} replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="budget" element={<Budget />} />
            <Route path="goals" element={<Goals />} />
            <Route path="lifestyle" element={<Lifestyle />} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="engagement" element={<Engagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/yearly-spend" element={<YearlySpend />} />
          <Route path="/daily-spend" element={<DailySpendPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
