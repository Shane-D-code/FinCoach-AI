export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
  incomeType?: 'salary' | 'gig' | 'business' | 'mixed';
  monthlyIncome?: number;
  currentBalance?: number;
  riskProfile?: 'low' | 'medium' | 'high';
  language?: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFinancialProfile {
  user: UserProfile;
  stats: {
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    savingsRate: number;
    debtToIncomeRatio: number;
  };
  streak: number;
  badges: string[];
  lastUpdated: string;
}
