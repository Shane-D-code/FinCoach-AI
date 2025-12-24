import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Award, Plus, X, Shield } from 'lucide-react';
import DailySpend from '../components/DailySpend';
import { mlApi } from '../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DailySpendEntry {
  date: string;
  amount: number;
  category: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailySpends, setDailySpends] = useState<DailySpendEntry[]>([]);
  const [yearlySpend, setYearlySpend] = useState<number>(0);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionForm, setTransactionForm] = useState({ amount: '', category: '', date: '' });
  const [riskAssessment, setRiskAssessment] = useState<{ risk_score: number; risk_label: string } | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('userProfile');
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }
    const storedDaily = localStorage.getItem('dailySpends');
    if (storedDaily) {
      setDailySpends(JSON.parse(storedDaily));
    } else {
      // Add mock data for demonstration
      const mockData: DailySpendEntry[] = [
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1500, category: 'Food' },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 800, category: 'Transport' },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 2000, category: 'Shopping' },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 1200, category: 'Entertainment' },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 600, category: 'Bills & Utilities' },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 900, category: 'Healthcare' },
      ];
      setDailySpends(mockData);
      localStorage.setItem('dailySpends', JSON.stringify(mockData));
    }
    const storedYearly = localStorage.getItem('yearlySpend');
    if (storedYearly) {
      setYearlySpend(parseFloat(storedYearly));
    } else {
      setYearlySpend(600000); // Mock yearly spend
      localStorage.setItem('yearlySpend', '600000');
    }
  }, []);

  // Fetch risk assessment
  useEffect(() => {
    const fetchRiskAssessment = async () => {
      if (dailySpends.length === 0 || yearlySpend === 0) return;
      
      setLoadingRisk(true);
      try {
        const monthlyIncome = yearlySpend / 12;
        const totalExpenses = dailySpends.reduce((sum, spend) => sum + spend.amount, 0);
        const avgDailySpend = totalExpenses / dailySpends.length;
        
        const riskData = {
          monthly_income: monthlyIncome,
          total_expenses: totalExpenses,
          avg_daily_spend: avgDailySpend,
          expense_ratio: totalExpenses / monthlyIncome,
          transaction_count: dailySpends.length,
          savings_rate: (monthlyIncome - totalExpenses) / monthlyIncome
        };
        
        const result = await mlApi.assessRisk(riskData);
        setRiskAssessment(result);
      } catch (error) {
        console.error('Failed to fetch risk assessment:', error);
      } finally {
        setLoadingRisk(false);
      }
    };

    fetchRiskAssessment();
  }, [dailySpends, yearlySpend]);

  const totalSpent = useMemo(() => dailySpends.reduce((sum, spend) => sum + spend.amount, 0), [dailySpends]);
  const currentBalance = yearlySpend - totalSpent;
  const monthlyIncome = yearlySpend / 12;

  const savingsStreak = useMemo(() => {
    if (dailySpends.length === 0) return 0;
    const sortedSpends = [...dailySpends].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastSpendDate = new Date(sortedSpends[0].date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastSpendDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays - 1;
  }, [dailySpends]);

  const savingsGoal = { progress: yearlySpend > 0 ? Math.round((currentBalance / yearlySpend) * 100) : 0 };

  const categoryData = useMemo(() => {
    const breakdown: { [key: string]: number } = {};
    dailySpends.forEach(spend => {
      breakdown[spend.category] = (breakdown[spend.category] || 0) + spend.amount;
    });
    return breakdown;
  }, [dailySpends]);

  // Generate stable mock variations for past months
  const mockVariations = useMemo(() => {
    return Array.from({ length: 5 }, () => ({
      incomeVariation: (Math.random() - 0.5) * 0.3, // ±15%
      expenseRatio: 0.6 + Math.random() * 0.4 // 60-100% of income
    }));
  }, []); // Empty dependency array to generate once

  const cashFlowData = useMemo(() => {
    const months: string[] = [];
    const incomes: number[] = [];
    const expenses: number[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.push(monthName);

      // Add some variation to past months for curved lines
      let income = monthlyIncome;
      let expense = 0;

      if (i > 0) { // Past months - add mock variation
        const variationIndex = 5 - i; // 0 for 5 months ago, 1 for 4 months ago, etc.
        const variation = mockVariations[variationIndex];
        income = monthlyIncome * (1 + variation.incomeVariation);

        // Mock expenses for past months if no real data
        const realMonthSpend = dailySpends
          .filter(spend => {
            const spendDate = new Date(spend.date);
            return spendDate.getMonth() === date.getMonth() && spendDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, spend) => sum + spend.amount, 0);

        if (realMonthSpend === 0) {
          // Mock expenses for past months
          expense = monthlyIncome * variation.expenseRatio;
        } else {
          expense = realMonthSpend;
        }
      } else {
        // Current month - use real data
        income = monthlyIncome;
        expense = dailySpends
          .filter(spend => {
            const spendDate = new Date(spend.date);
            return spendDate.getMonth() === date.getMonth() && spendDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, spend) => sum + spend.amount, 0);
      }

      incomes.push(income);
      expenses.push(expense);
    }
    return months.map((month, index) => ({
      month,
      income: incomes[index],
      expenses: expenses[index]
    }));
  }, [dailySpends, monthlyIncome, mockVariations]);

  const alerts: any[] = [];

  const user = {
    name: userProfile?.name || 'User',
    currentBalance,
    monthlyIncome,
    streak: savingsStreak,
    badges: (() => {
      const badges = ['First Steps'];
      if (savingsStreak > 0) badges.push('Budget Master');
      if (totalSpent > 1000) badges.push('Spending Champion');
      if (currentBalance > yearlySpend * 0.5) badges.push('Savings Guru');
      if (dailySpends.length > 10) badges.push('Consistent Tracker');
      return badges;
    })()
  };

  const expenseData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#14B8A6',
          '#F97316'
        ],
        borderWidth: 0
      }
    ]
  };

  const cashFlowChartData = {
    labels: cashFlowData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: cashFlowData.map(d => d.income),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Expenses',
        data: cashFlowData.map(d => d.expenses),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const unreadAlerts = alerts.filter(a => !a.read);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transactionForm.amount);
    if (amount > 0 && transactionForm.category && transactionForm.date) {
      const newEntry: DailySpendEntry = {
        date: transactionForm.date,
        amount,
        category: transactionForm.category
      };
      const updatedSpends = [...dailySpends, newEntry];
      setDailySpends(updatedSpends);
      localStorage.setItem('dailySpends', JSON.stringify(updatedSpends));
      setShowAddTransaction(false);
      setTransactionForm({ amount: '', category: '', date: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Here's your financial overview</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <DollarSign size={24} />
            </div>
            <TrendingUp size={20} className="text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm mb-1">
            {currentBalance >= 0 ? 'Remaining Budget' : 'Over Budget'}
          </p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold">
              {currentBalance < 0 ? '-' : ''}₹{Math.abs(user.currentBalance).toLocaleString()}
            </h3>
            <button
              onClick={() => {
                const newBudget = prompt('Update Yearly Budget:', yearlySpend.toString());
                if (newBudget && !isNaN(parseFloat(newBudget))) {
                  const val = parseFloat(newBudget);
                  setYearlySpend(val);
                  localStorage.setItem('yearlySpend', val.toString());
                }
              }}
              className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors mb-1"
            >
              Edit
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp size={24} />
            </div>
            <span className="text-green-200 text-sm">+12%</span>
          </div>
          <p className="text-green-100 text-sm mb-1">Monthly Income</p>
          <h3 className="text-3xl font-bold">₹{user.monthlyIncome.toLocaleString()}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Award size={24} />
            </div>
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-purple-100 text-sm mb-1">Savings Streak</p>
          <h3 className="text-3xl font-bold">{user.streak} days</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingDown size={24} />
            </div>
            <AlertTriangle size={20} className="text-orange-200" />
          </div>
          <p className="text-orange-100 text-sm mb-1">Savings Goal</p>
          <h3 className="text-3xl font-bold">{savingsGoal.progress}%</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`bg-gradient-to-br ${
            !riskAssessment ? 'from-gray-600 to-gray-700' :
            riskAssessment.risk_label === 'LOW' ? 'from-green-600 to-green-700' :
            riskAssessment.risk_label === 'MEDIUM' ? 'from-yellow-600 to-yellow-700' :
            'from-red-600 to-red-700'
          } rounded-2xl p-6 text-white shadow-xl`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield size={24} />
            </div>
            {loadingRisk && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
          </div>
          <p className="text-white/90 text-sm mb-1">Financial Risk</p>
          {riskAssessment ? (
            <>
              <h3 className="text-3xl font-bold">{riskAssessment.risk_label}</h3>
              <p className="text-xs text-white/70 mt-1">Score: {(riskAssessment.risk_score * 100).toFixed(0)}%</p>
            </>
          ) : (
            <h3 className="text-2xl font-bold">Analyzing...</h3>
          )}
        </motion.div>
      </div>

      {unreadAlerts.some(a => a.type === 'warning') && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg mb-8"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={24} />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200">Action Required</h4>
              <p className="text-red-600 dark:text-red-300">{unreadAlerts.find(a => a.type === 'warning')?.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        <button
          onClick={() => setShowAddTransaction(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Expense Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={expenseData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }
                }
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Cash Flow (6 Months)</h3>
          <div className="h-64">
            <Line
              data={cashFlowChartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: 'bottom' }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Achievements</h3>
        <div className="flex flex-wrap gap-4">
          {user.badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold shadow-md"
            >
              <Award size={20} />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
        <DailySpend forceShow={true} onSpendAdded={(newEntry) => {
          const updatedSpends = [...dailySpends, newEntry];
          setDailySpends(updatedSpends);
          localStorage.setItem('dailySpends', JSON.stringify(updatedSpends));
        }} />
      </div>

      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add Transaction</h3>
              <button
                onClick={() => setShowAddTransaction(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select category</option>
                  {Object.keys(categoryData).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Add Transaction
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
