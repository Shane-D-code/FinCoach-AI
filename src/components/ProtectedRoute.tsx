import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Guards protected routes.
 *
 * Behaviour:
 * - While auth is being verified over the network (isLoading === true), shows
 *   a minimal full-screen spinner so the user never sees a flash of content.
 * - isLoading is only ever true when a valid token exists and we are waiting
 *   for the /auth/me response — it is NEVER true for unauthenticated visitors,
 *   so public pages (Login / Register / OTP) render instantly.
 * - Once loading finishes, redirects to /login if not authenticated.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show a spinner ONLY while verifying an existing token.
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
        role="status"
        aria-label="Verifying session…"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Spinning ring */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-sm text-slate-400 tracking-wide">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
