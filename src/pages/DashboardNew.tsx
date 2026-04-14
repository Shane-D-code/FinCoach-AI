import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Upload,
  Zap,
  Award,
  Calendar
} from 'lucide-react';
import { useHealthScore, useInsights } from '../hooks/useInsights';
import { useTransactions, useTransactionSummary } from '../hooks/useTransactions';
import { useAuth } from '../context/AuthContext';
import HealthScoreRing from '../components/HealthScoreRing';
import InsightsPanel from '../components/InsightsPanel';
import ActionableCard from '../components/ActionableCard';
import BankUpload from '../components/BankUpload';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimatedCounter from '../components/AnimatedCounter';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardNew = () => {
  const { user } = useAuth();
  const { healthScore, loading: healthLoading } = useHealthScore();
  const { insights, markAsRead } = useInsights();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { summary, loading: summaryLoading } = useTransactionSummary();
  const [showUpload, setShowUpload] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const savingsRate = summary 
    ? ((summary.netSavings / (summary.totalIncome || 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {greeting()}, {user?.name || 'there'}! 👋
            </h1>
            <p className="text-gray-400">Here's your financial snapshot</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all hover:scale-105"
          >
            <Upload className="w-5 h-5" />
            Upload Statement
          </button>
        </motion.div>

        {/* Financial Health Score Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Financial Health Score</h2>
              <p className="text-gray-400 mb-6">
                Your overall financial wellness based on savings, debt, and spending patterns
              </p>
              
              {healthLoading ? (
                <SkeletonLoader variant="circle" />
              ) : healthScore ? (
                <div className="flex items-center gap-8">
                  <HealthScoreRing score={healthScore.overall} size={180} />
                  <div className="space-y-3">
                    {Object.entries(healthScore.breakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-32 text-sm text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          />
                        </div>
                        <span className="text-sm text-white w-12 text-right">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Upload transactions to see your health score</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              {healthScore?.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg"
                >
                  <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">{rec}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Income',
              value: summary?.totalIncome || 0,
              icon: TrendingUp,
              color: 'text-green-400',
              bg: 'bg-green-500/10'
            },
            {
              label: 'Total Expenses',
              value: summary?.totalExpenses || 0,
              icon: TrendingDown,
              color: 'text-red-400',
              bg: 'bg-red-500/10'
            },
            {
              label: 'Net Savings',
              value: summary?.netSavings || 0,
              icon: DollarSign,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10'
            },
            {
              label: 'Savings Rate',
              value: savingsRate,
              icon: Target,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
              isPercentage: true
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              {summaryLoading ? (
                <div className="h-8 bg-slate-700 rounded animate-pulse" />
              ) : (
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.isPercentage ? (
                    <AnimatedCounter value={stat.value} suffix="%" decimals={1} />
                  ) : (
                    <AnimatedCounter 
                      value={stat.value} 
                      prefix="₹" 
                      decimals={0}
                    />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InsightsPanel insights={insights} onMarkAsRead={markAsRead} />
        </motion.div>

        {/* Actionable Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Take Action</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionableCard
              title="Optimize Your Budget"
              description="Get AI-powered suggestions to reduce expenses and increase savings"
              icon={Target}
              action={{ label: 'Start Optimizing', route: '/budget' }}
              color="indigo"
              gradient="from-indigo-500 to-purple-500"
            />
            <ActionableCard
              title="Fix Your Debt"
              description="Create a personalized debt payoff plan in 60 days"
              icon={TrendingUp}
              action={{ label: 'View Plan', route: '/goals' }}
              color="green"
              gradient="from-green-500 to-emerald-500"
            />
            <ActionableCard
              title="Find Best Deals"
              description="Discover nearby deals and save on everyday purchases"
              icon={Award}
              action={{ label: 'Explore Deals', route: '/lifestyle' }}
              color="yellow"
              gradient="from-yellow-500 to-orange-500"
            />
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Trend</h3>
            {summaryLoading ? (
              <SkeletonLoader variant="chart" />
            ) : summary?.monthlyTrend && summary.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={summary.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
            {summaryLoading ? (
              <SkeletonLoader variant="chart" />
            ) : summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={summary.categoryBreakdown.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="category" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bank Upload Modal */}
      {showUpload && (
        <BankUpload
          onClose={() => setShowUpload(false)}
          onTransactionsImported={(transactions) => {
            console.log('Imported transactions:', transactions);
            setShowUpload(false);
            // Refresh data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default DashboardNew;
