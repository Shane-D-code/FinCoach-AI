import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { TrendingUp, DollarSign, PieChart, Calculator } from 'lucide-react';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function Budget() {
  const [windfallAmount, setWindfallAmount] = useState('');
  const [scenarioAmount, setScenarioAmount] = useState('');
  const [budgetGoal, setBudgetGoal] = useState(2500);

  const forecastData = {
    labels: ['Current', 'Next Month (Predicted)'],
    datasets: [
      {
        label: 'Expenses',
        data: [2200, 2530],
        backgroundColor: ['#3B82F6', '#EF4444']
      }
    ]
  };

  const scenarioData = scenarioAmount ? {
    labels: ['Before', 'After Purchase'],
    datasets: [
      {
        label: 'Savings',
        data: [2000, Math.max(0, 2000 - parseFloat(scenarioAmount))],
        backgroundColor: ['#10B981', '#F59E0B']
      }
    ]
  } : null;

  const calculateWindfallAllocation = (amount: number) => {
    return {
      savings: amount * 0.5,
      debt: amount * 0.3,
      fun: amount * 0.2
    };
  };

  const allocation = windfallAmount ? calculateWindfallAllocation(parseFloat(windfallAmount)) : null;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Planner</h1>
        <p className="text-gray-600 dark:text-gray-400">Predictive insights and smart recommendations</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Expense Forecasting</h3>
          </div>
          <div className="mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg mb-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Prediction:</strong> Your expenses may increase by 15% next month due to upcoming seasonal changes and historical patterns.
              </p>
            </div>
          </div>
          <div className="h-64">
            <Bar
              data={forecastData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (context) => `₹${context.parsed.y}` } }
                },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <PieChart className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dynamic Budget Goal</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Monthly Budget Goal</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">₹{budgetGoal}</span>
              </div>
              <input
                type="range"
                min="1500"
                max="4000"
                step="100"
                value={budgetGoal}
                onChange={(e) => setBudgetGoal(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Plan</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Week 1: Groceries</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{Math.round(budgetGoal * 0.15)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Week 2: Cut dining out 20%</span>
                  <span className="font-bold text-gray-900 dark:text-white">-₹{Math.round(budgetGoal * 0.05)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Week 3: Entertainment</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{Math.round(budgetGoal * 0.08)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Week 4: Buffer savings</span>
                  <span className="font-bold text-green-600 dark:text-green-400">₹{Math.round(budgetGoal * 0.12)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Smart Windfall Allocation</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unexpected Income Amount
              </label>
              <input
                type="number"
                value={windfallAmount}
                onChange={(e) => setWindfallAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter amount (e.g., 500)"
              />
            </div>
            {allocation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-800 dark:text-green-200">Savings (50%)</span>
                    <span className="font-bold text-green-900 dark:text-green-100">₹{allocation.savings.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800 dark:text-blue-200">Debt Payment (30%)</span>
                    <span className="font-bold text-blue-900 dark:text-blue-100">₹{allocation.debt.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-500">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-orange-800 dark:text-orange-200">Fun Money (20%)</span>
                    <span className="font-bold text-orange-900 dark:text-orange-100">₹{allocation.fun.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
              <Calculator className="text-orange-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Scenario Simulator</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What if I buy something for...
              </label>
              <input
                type="number"
                value={scenarioAmount}
                onChange={(e) => setScenarioAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter purchase amount (e.g., 800)"
              />
            </div>
            {scenarioData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="h-48">
                  <Bar
                    data={scenarioData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (context) => `₹${context.parsed.y}` } }
                      },
                      scales: { y: { beginAtZero: true } }
                    }}
                  />
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    <strong>Impact:</strong> Your savings would decrease by{' '}
                    {((parseFloat(scenarioAmount) / 2000) * 100).toFixed(1)}%. Consider waiting or finding alternatives.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
