import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CreditCard, TrendingUp, Calculator, AlertCircle } from 'lucide-react';
import { savingsGoal, debts, investments } from '../data/mockData';

export default function Goals() {
  const [debtStrategy, setDebtStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanRate, setLoanRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');

  const totalInvestments = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.balance, 0);

  const sortedDebts = [...debts].sort((a, b) =>
    debtStrategy === 'avalanche' ? b.interestRate - a.interestRate : a.balance - b.balance
  );

  const calculateLoanPayment = () => {
    if (!loanAmount || !loanRate || !loanTerm) return null;
    const principal = parseFloat(loanAmount);
    const monthlyRate = parseFloat(loanRate) / 100 / 12;
    const numPayments = parseInt(loanTerm) * 12;
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    return payment;
  };

  const monthlyPayment = calculateLoanPayment();

  const getPortfolioAllocation = () => {
    if (riskLevel === 'low') return { stocks: 30, bonds: 60, cash: 10 };
    if (riskLevel === 'medium' ) return { stocks: 60, bonds: 30, cash: 10 };
    return { stocks: 80, bonds: 15, cash: 5 };
  };

  const allocation = getPortfolioAllocation();

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Goals & Planning</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your progress and manage your financial future</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Target size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{savingsGoal.name}</h3>
              <p className="text-green-100">Keep up the great work!</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-lg">
              <span>Progress</span>
              <span className="font-bold">{savingsGoal.progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${savingsGoal.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-white rounded-full shadow-lg"
              />
            </div>
            <div className="flex justify-between text-lg">
              <span>₹{savingsGoal.current.toLocaleString()}</span>
              <span>₹{savingsGoal.target.toLocaleString()}</span>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm">
                You need ₹{(savingsGoal.target - savingsGoal.current).toLocaleString()} more to reach your goal.
                At your current rate, you'll achieve this in approximately 4 months!
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Total Value</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{totalInvestments.toLocaleString()}
              </span>
            </div>
            <div className="space-y-2">
              {investments.map((inv) => (
                <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{inv.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{inv.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">₹{inv.totalValue.toLocaleString()}</p>
                    <p className={`text-sm font-semibold ${inv.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {inv.gain >= 0 ? '+' : ''}{inv.gain}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Risk Profile: <span className="text-blue-600 font-semibold capitalize">{riskLevel}</span>
              </label>
              <div className="flex gap-2 mb-4">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setRiskLevel(level)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      riskLevel === level
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Allocation</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Stocks</span>
                    <span className="font-bold text-gray-900 dark:text-white">{allocation.stocks}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Bonds</span>
                    <span className="font-bold text-gray-900 dark:text-white">{allocation.bonds}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Cash</span>
                    <span className="font-bold text-gray-900 dark:text-white">{allocation.cash}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
            <CreditCard className="text-red-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Debt Management</h3>
            <p className="text-gray-600 dark:text-gray-400">Total Debt: ₹{totalDebts.toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDebtStrategy('snowball')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                debtStrategy === 'snowball'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Snowball
            </button>
            <button
              onClick={() => setDebtStrategy('avalanche')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                debtStrategy === 'avalanche'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Avalanche
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {sortedDebts.map((debt, index) => (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-red-500"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {index === 0 && '🎯 '}{debt.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Interest Rate: {debt.interestRate}% | Min Payment: ₹{debt.minPayment}
                  </p>
                </div>
                <span className="text-lg font-bold text-red-600">₹{debt.balance.toLocaleString()}</span>
              </div>
              {index === 0 && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Priority:</strong> Pay this debt first. Adding ₹200/month extra could eliminate it in{' '}
                    {Math.ceil(debt.balance / (debt.minPayment + 200))} months.
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
            <Calculator className="text-purple-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loan Assessment Calculator</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loan Amount</label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interest Rate (%)</label>
            <input
              type="number"
              value={loanRate}
              onChange={(e) => setLoanRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="5.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Term (years)</label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="5"
            />
          </div>
        </div>
        {monthlyPayment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-purple-600" size={24} />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Loan Assessment</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Monthly Payment</span>
                <span className="text-2xl font-bold text-purple-600">₹{monthlyPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Total Interest</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{(monthlyPayment * parseInt(loanTerm) * 12 - parseFloat(loanAmount)).toFixed(2)}
                </span>
              </div>
              <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Strategy:</strong> Consider refinancing if you find rates below {parseFloat(loanRate) - 1}%.
                  This could save you approximately ₹{(monthlyPayment * 0.15).toFixed(2)}/month.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
