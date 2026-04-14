import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import DemoEntry from './components/DemoEntry';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import Lifestyle from './pages/Lifestyle';
import Engagement from './pages/Engagement';
import Settings from './pages/Settings';
import Register from './pages/Register';
import Login from './pages/Login';
import Otp from './pages/OTP';
import YearlySpend from './pages/YearlySpend';
import DailySpendPage from './pages/DailySpendPage';
import ExpenseForecast from './pages/ExpenseForecast';
import BillScanner from './pages/BillScanner';

function App() {
  const isDevelopment = import.meta.env.DEV;

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to={isDevelopment ? "/login" : "/dashboard"} replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<Otp />} />

            {/* Protected Routes */}
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
              <Route path="goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
              <Route path="lifestyle" element={<ProtectedRoute><Lifestyle /></ProtectedRoute>} />
              <Route path="engagement" element={<ProtectedRoute><Engagement /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="forecast" element={<ProtectedRoute><ExpenseForecast /></ProtectedRoute>} />
              <Route path="bill-scanner" element={<ProtectedRoute><BillScanner /></ProtectedRoute>} />
            </Route>

            {/* Public Pages */}
            <Route path="/yearly-spend" element={<YearlySpend />} />
            <Route path="/daily-spend" element={<DailySpendPage />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
