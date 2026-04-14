import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authApi, tokenManager, User } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** True only while a network auth-check is in flight. Never true for public pages. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  // isLoading is ONLY true when a network fetch is running.
  // It starts false so public pages (Login / Register / OTP) render immediately.
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user && tokenManager.isTokenValid();

  // ── checkAuth ──────────────────────────────────────────────────────────────
  // Called once on mount and exposed via context.
  // Key rule: if there is no valid token we resolve synchronously (no spinner).
  const checkAuth = useCallback(async (): Promise<void> => {
    const token = tokenManager.getToken();

    // No token → unauthenticated, nothing to fetch.
    if (!token || !tokenManager.isTokenValid()) {
      setUser(null);
      return;
    }

    // We have a token → verify it against the server.
    setIsLoading(true);
    try {
      // Race against a 3-second timeout to avoid infinite loading.
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 600000), // 10 minutes

      );

      const response: any = await Promise.race([authApi.getCurrentUser(), timeout]);

      if (response?.success && response?.data) {
        setUser(response.data);
      } else {
        setUser(null);
        tokenManager.removeToken();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      tokenManager.removeToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Note: do NOT set isLoading here — the caller (Login page) manages its own
    // submitting state. Setting context isLoading would block ProtectedRoute.
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback((): void => {
    authApi.logout();
    tokenManager.removeToken();
    setUser(null);
  }, []);

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};