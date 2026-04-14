import { Transaction } from '../types/transaction';

/**
 * Calculate savings rate
 */
export const calculateSavingsRate = (income: number, expenses: number): number => {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
};

/**
 * Calculate debt to income ratio
 */
export const calculateDebtToIncomeRatio = (totalDebt: number, monthlyIncome: number): number => {
  if (monthlyIncome === 0) return 0;
  return (totalDebt / monthlyIncome) * 100;
};

/**
 * Calculate financial health score
 */
export const calculateHealthScore = (data: {
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  spendingConsistency: number;
}): number => {
  const { savingsRate, debtToIncomeRatio, emergencyFundMonths, spendingConsistency } = data;
  
  // Savings rate score (0-30 points)
  const savingsScore = Math.min(30, (savingsRate / 30) * 30);
  
  // Debt ratio score (0-25 points) - lower is better
  const debtScore = Math.max(0, 25 - (debtToIncomeRatio / 4));
  
  // Emergency fund score (0-25 points)
  const emergencyScore = Math.min(25, (emergencyFundMonths / 6) * 25);
  
  // Spending consistency score (0-20 points)
  const consistencyScore = spendingConsistency * 20;
  
  return Math.round(savingsScore + debtScore + emergencyScore + consistencyScore);
};

/**
 * Calculate category breakdown from transactions
 */
export const calculateCategoryBreakdown = (transactions: Transaction[]) => {
  const categoryMap = new Map<string, { amount: number; count: number }>();
  let totalExpenses = 0;
  
  transactions.forEach(t => {
    if (t.type === 'expense') {
      totalExpenses += Math.abs(t.amount);
      const current = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: current.amount + Math.abs(t.amount),
        count: current.count + 1
      });
    }
  });
  
  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
    count: data.count
  })).sort((a, b) => b.amount - a.amount);
};

/**
 * Calculate monthly trend from transactions
 */
export const calculateMonthlyTrend = (transactions: Transaction[], months: number = 6) => {
  const monthMap = new Map<string, { income: number; expenses: number }>();
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthMap.get(monthKey) || { income: 0, expenses: 0 };
    
    if (t.type === 'income') {
      current.income += t.amount;
    } else {
      current.expenses += Math.abs(t.amount);
    }
    
    monthMap.set(monthKey, current);
  });
  
  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses
    }))
    .slice(-months);
};

/**
 * Predict next month expenses using simple moving average
 */
export const predictNextMonthExpenses = (monthlyExpenses: number[]): number => {
  if (monthlyExpenses.length === 0) return 0;
  const sum = monthlyExpenses.reduce((a, b) => a + b, 0);
  return sum / monthlyExpenses.length;
};

/**
 * Calculate emergency fund months
 */
export const calculateEmergencyFundMonths = (currentBalance: number, monthlyExpenses: number): number => {
  if (monthlyExpenses === 0) return 0;
  return currentBalance / monthlyExpenses;
};
