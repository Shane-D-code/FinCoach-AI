import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types/user';

interface AppUser {
  name: string;
  email: string;
  avatar?: string;
  incomeType?: 'salary' | 'gig' | 'business' | 'mixed';
  monthlyIncome?: number;
  currentBalance?: number;
  riskProfile?: 'low' | 'medium' | 'high';
  streak?: number;
  badges?: string[];
  language?: string;
  currency?: string;
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  user: AppUser | null;
  updateUser: (updates: Partial<AppUser>) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  currency: string;
  setCurrency: (currency: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const defaultUser: AppUser = {
  name: '',
  email: '',
  monthlyIncome: 0,
  currentBalance: 0,
  riskProfile: 'medium',
  streak: 0,
  badges: [],
  language: 'en',
  currency: 'INR'
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark'; // Default to dark theme for fintech feel
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'INR';
  });

  const [user, setUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updateUser = (updates: Partial<AppUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : { ...defaultUser, ...updates });
  };

  return (
    <AppContext.Provider value={{ 
      theme, 
      toggleTheme, 
      language, 
      setLanguage, 
      user, 
      updateUser, 
      isOffline, 
      setIsOffline,
      currency,
      setCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
};
