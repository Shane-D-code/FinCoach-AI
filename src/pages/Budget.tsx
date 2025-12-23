import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { TrendingUp, DollarSign, PieChart, Calculator } from 'lucide-react';
import { mlApi } from '../services/api';
import { userData } from '../data/mockData'; // In a real app, this would come from a Context or API

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function Budget() {
  const [windfallAmount, setWindfallAmount] = useState('');
  const [scenarioAmount, setScenarioAmount] = useState('');
  const [budgetGoal, setBudgetGoal] = useState(2500);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  /* 1. State for forecast result */
  const [forecastResult, setForecastResult] = useState<any>(null);

  /* 2. Fetch forecast on mount */
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await mlApi.forecastExpenses({
          monthlyIncome: userData.monthlyIncome,
          currentExpenses: 2400, // Estimated from mockData
          months: 3
        });
        setForecastResult(res);
      } catch (e) {
        console.error("Forecast failed", e);
      }
    };
    fetchForecast();
  }, []);

  /* 3. Dynamic forecast data for the chart */
  const forecastData = forecastResult ? {
    labels: forecastResult.forecasts.map((f: any) => f.month),
    datasets: [
      {
        label: 'Predicted Expenses',
        data: forecastResult.forecasts.map((f: any) => f.predicted_expense),
        backgroundColor: forecastResult.forecasts.map((_: any, i: number) => i === 0 ? '#3B82F6' : '#EF4444')
      }
    ]
  } : {
    // Fallback/Loading state
    labels: ['Loading...'],
    datasets: [{ label: 'Loading', data: [0], backgroundColor: ['#ccc'] }]
  };

  /* ...Existing calculation logic... */
  const calculateScenario = async (amount: string) => {
    if (!amount) {
      setSimulationResult(null);
      return;
    }
    try {
      const val = parseFloat(amount);
      if (isNaN(val)) return;

      // Call ML API
      const res = await mlApi.simulatePurchase({
        currentBalance: userData.currentBalance,
        monthlyIncome: userData.monthlyIncome,
        monthlyExpenses: 2400,
        purchaseAmount: val
      });
      setSimulationResult(res);

    } catch (e) {
      console.error("Simulation failed", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateScenario(scenarioAmount);
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [scenarioAmount]);


  const scenarioData = scenarioAmount && simulationResult ? {
    labels: ['Before', 'After Purchase'],
    datasets: [
      {
        label: 'Balance',
        data: [userData.currentBalance, simulationResult.new_balance],
        backgroundColor: ['#10B981', simulationResult.new_balance < 0 ? '#EF4444' : '#F59E0B']
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
            {forecastResult ? (
              <div className={`p-4 rounded-lg mb-4 border-l-4 ${forecastResult.trend === 'increasing' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200' :
                  forecastResult.trend === 'decreasing' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200'
                }`}>
                <p className="text-sm">
                  <strong>Trend: {forecastResult.trend.toUpperCase()}</strong>. {forecastResult.recommendations?.[0]}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            )}
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

                {simulationResult && (
                  <div className={`rounded-lg p-4 border-l-4 ${simulationResult.risk_level === 'CRITICAL' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200' :
                    simulationResult.risk_level === 'HIGH' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200' :
                      simulationResult.risk_level === 'MEDIUM' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200' :
                        'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200'
                    }`}>
                    <p className="font-bold mb-1">Risk Level: {simulationResult.risk_level}</p>
                    <p className="text-sm mb-2">{simulationResult.advice}</p>
                    {simulationResult.recovery_months > 0 && (
                      <p className="text-xs italic">Estimated recovery time: {simulationResult.recovery_months} months</p>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>ML Insight:</strong> Impact calculated based on your real-time balance of ₹{userData.currentBalance}.
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
