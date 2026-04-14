export const userData = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  incomeType: 'gig',
  monthlyIncome: 249000,  // ~$3000 USD *83
  currentBalance: 265600,  // ~$3200
  streak: 7,
  badges: ['Saver', 'Budgeter', 'Investor'],
  language: 'en',
  riskProfile: 'medium'
};

export const transactions = [
  { id: 1, date: '2025-10-09', category: 'Groceries', amount: -85.50, description: 'Whole Foods', type: 'expense' },
  { id: 2, date: '2025-10-08', category: 'Income', amount: 450, description: 'Freelance Project', type: 'income' },
  { id: 3, date: '2025-10-07', category: 'Transport', amount: -25, description: 'Uber', type: 'expense' },
  { id: 4, date: '2025-10-06', category: 'Dining', amount: -42.30, description: 'Restaurant', type: 'expense' },
  { id: 5, date: '2025-10-05', category: 'Rent', amount: -1200, description: 'Monthly Rent', type: 'expense' },
  { id: 6, date: '2025-10-04', category: 'Income', amount: 800, description: 'Consulting Gig', type: 'income' },
  { id: 7, date: '2025-10-03', category: 'Entertainment', amount: -35, description: 'Movie Tickets', type: 'expense' },
  { id: 8, date: '2025-10-02', category: 'Groceries', amount: -120, description: 'Trader Joes', type: 'expense' },
  { id: 9, date: '2025-10-01', category: 'Utilities', amount: -95, description: 'Electric Bill', type: 'expense' },
  { id: 10, date: '2025-09-30', category: 'Income', amount: 1200, description: 'Web Dev Project', type: 'income' },
  { id: 11, date: '2025-09-28', category: 'Healthcare', amount: -150, description: 'Doctor Visit', type: 'expense' },
  { id: 12, date: '2025-09-27', category: 'Groceries', amount: -95, description: 'Supermarket', type: 'expense' },
  { id: 13, date: '2025-09-25', category: 'Transport', amount: -40, description: 'Gas', type: 'expense' },
  { id: 14, date: '2025-09-23', category: 'Dining', amount: -55, description: 'Dinner Out', type: 'expense' },
  { id: 15, date: '2025-09-20', category: 'Income', amount: 650, description: 'Gig Work', type: 'income' },
  { id: 16, date: '2025-09-18', category: 'Shopping', amount: -180, description: 'Clothing', type: 'expense' },
  { id: 17, date: '2025-09-15', category: 'Entertainment', amount: -45, description: 'Concert', type: 'expense' },
  { id: 18, date: '2025-09-10', category: 'Groceries', amount: -110, description: 'Weekly Shopping', type: 'expense' },
  { id: 19, date: '2025-09-08', category: 'Utilities', amount: -80, description: 'Internet', type: 'expense' },
  { id: 20, date: '2025-09-05', category: 'Rent', amount: -1200, description: 'Monthly Rent', type: 'expense' }
];

export const categoryData = {
  'Groceries': 400,
  'Rent': 1200,
  'Transport': 200,
  'Dining': 300,
  'Entertainment': 150,
  'Utilities': 175,
  'Healthcare': 150,
  'Shopping': 225
};

export const cashFlowData = [
  { month: 'May', income: 2800, expenses: 2400 },
  { month: 'Jun', income: 3200, expenses: 2600 },
  { month: 'Jul', income: 2600, expenses: 2500 },
  { month: 'Aug', income: 3400, expenses: 2700 },
  { month: 'Sep', income: 3100, expenses: 2800 },
  { month: 'Oct', income: 3000, expenses: 2200 }
];

export const savingsGoal = {
  name: 'Emergency Fund',
  target: 5000,
  current: 2000,
  progress: 40
};

export const debts = [
  { id: 1, name: 'Credit Card', balance: 1000, interestRate: 18, minPayment: 50, type: 'credit' },
  { id: 2, name: 'Personal Loan', balance: 3500, interestRate: 12, minPayment: 150, type: 'loan' },
  { id: 3, name: 'Student Loan', balance: 8000, interestRate: 6, minPayment: 100, type: 'student' }
];

export const investments = [
  { id: 1, name: 'AAPL', type: 'Stock', shares: 5, currentPrice: 180, totalValue: 900, gain: 12.5 },
  { id: 2, name: 'GOOGL', type: 'Stock', shares: 2, currentPrice: 140, totalValue: 280, gain: -3.2 },
  { id: 3, name: 'VOO', type: 'ETF', shares: 8, currentPrice: 420, totalValue: 3360, gain: 8.7 },
  { id: 4, name: 'Mutual Fund A', type: 'Mutual Fund', shares: 100, currentPrice: 15, totalValue: 1500, gain: 5.3 }
];

export const alerts = [
  { id: 1, type: 'warning', message: 'Low emergency fund - add ₹16,600 this week', date: '2025-10-09', read: false },
  { id: 2, type: 'info', message: 'Rent payment due in 2 days', date: '2025-10-08', read: false },
  { id: 3, type: 'success', message: 'You saved ₹12,450 this month!', date: '2025-10-07', read: true },
  { id: 4, type: 'warning', message: 'Unusual transaction detected: ₹41,500 charge', date: '2025-10-06', read: false }
];

export const deals = [
  { id: 1, store: 'Whole Foods', discount: '20% off groceries', location: 'Downtown', distance: '0.5 mi' },
  { id: 2, store: 'Shell Gas', discount: '10 cents off per gallon', location: 'Main St', distance: '1.2 mi' },
  { id: 3, store: 'Target', discount: '15% off household items', location: 'Westside Mall', distance: '2.3 mi' }
];

export const leaderboard = [
  { rank: 1, name: 'You (Alex)', streak: 7, savings: 2000 },
  { rank: 2, name: 'Anonymous User', streak: 12, savings: 3500 },
  { rank: 3, name: 'Anonymous User', streak: 9, savings: 2800 },
  { rank: 4, name: 'Anonymous User', streak: 6, savings: 1900 },
  { rank: 5, name: 'Anonymous User', streak: 5, savings: 1500 }
];

export const productComparisons = [
  { product: 'iPhone 15', amazon: 66317, flipkart: 68787, bestbuy: 66317, cashback: '5%' }, // INR
  { product: 'Samsung TV 55"', amazon: 49657, flipkart: 53867, bestbuy: 48053, cashback: '3%' },
  { product: 'Laptop Dell XPS', amazon: 107777, flipkart: 112050, bestbuy: 103667, cashback: '2%' }
];

export const currencyRates: Record<string, number> = {
  INR: 1,
  USD: 0.011,    // 1 USD = 83 INR
  EUR: 0.0097,    // 1 EUR ≈ 91 INR
  GBP: 0.0084,   // 1 GBP ≈ 105 INR
  JPY: 1.72   // 1 JPY ≈ 0.56 INR
};

