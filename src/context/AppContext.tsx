import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userData as initialUserData } from '../data/mockData';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  user: typeof initialUserData;
  updateUser: (updates: Partial<typeof initialUserData>) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : initialUserData;
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
    localStorage.setItem('userData', JSON.stringify(user));
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updateUser = (updates: Partial<typeof initialUserData>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, language, setLanguage, user, updateUser, isOffline, setIsOffline }}>
      {children}
    </AppContext.Provider>
  );
};
