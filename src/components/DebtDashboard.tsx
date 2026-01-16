import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, TrendingDown, Target, DollarSign, Clock,
  AlertCircle, CheckCircle, BarChart3, Calculator,
  ChevronDown, ChevronUp, Zap, Calendar, Sparkles,
  Trophy, Flame, Wallet, PiggyBank, LineChart, X
} from 'lucide-react';
import { debtService, Debt } from '../services/debtService';

const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const formatTime = (months: number) => {
  if (months === Infinity || months > 600) return 'Never';
  const years = Math.floor(months / 12);
  const remainingMonths = Math.ceil(months % 12);
  if (years === 0) return `${remainingMonths}mo`;
  if (remainingMonths === 0) return `${years}yr`;
  return `${years}yr ${remainingMonths}mo`;
};

export default function DebtDashboard() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [extraPayment, setExtraPayment] = useState(200);
  const [selectedStrategy, setSelectedStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [expandedDebt, setExpandedDebt] = useState<number | null>(null);
  const [showStrategies, setShowStrategies] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState<Debt | null>(null);
  const [showAddDebtForm, setShowAddDebtForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Add debt form state
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState('');
  const [newDebtRate, setNewDebtRate] = useState('');
  const [newDebtMinPayment, setNewDebtMinPayment] = useState('');
  const [newDebtType, setNewDebtType] = useState<'credit' | 'loan' | 'student' | 'mortgage' | 'auto' | 'medical' | 'other'>('credit');
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [addDebtError, setAddDebtError] = useState('');

  // Load debts from service
  useEffect(() => {
    const loadDebts = async () => {
      setIsLoading(true);
      try {
        const unsubscribe = debtService.subscribe((updatedDebts) => {
          setDebts(updatedDebts);
        });
        await debtService.getDebts();
      } catch (error) {
        console.error('Error loading debts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDebts();
  }, []);

  // Calculate totals
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const weightedAvgRate = totalDebt > 0
    ? debts.reduce((sum, d) => sum + d.balance * d.interestRate, 0) / totalDebt
    : 0;

  // Calculate strategy comparisons
  const strategies = useMemo(() => {
    if (debts.length === 0) return { avalanche: { months: 0, interest: 0 }, snowball: { months: 0, interest: 0 }, savings: 0, timeSaved: 0 };

    const totalMin = debts.reduce((sum, d) => sum + d.minPayment, 0);
    const monthlyPayment = totalMin + extraPayment;

    // Avalanche: Pay highest interest first
    const avalancheDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    let avalancheRemaining = totalDebt;
    let avalancheMonths = 0;
    let avalancheInterest = 0;

    while (avalancheRemaining > 0.01 && avalancheMonths < 600) {
      for (const debt of avalancheDebts) {
        if (avalancheRemaining <= 0.01) break;
        const monthlyRate = debt.interestRate / 100 / 12;
        const interest = avalancheRemaining * monthlyRate;
        avalancheInterest += interest;
        const payment = Math.min(monthlyPayment - interest, avalancheRemaining);
        avalancheRemaining -= payment;
      }
      avalancheMonths++;
    }

    // Snowball: Pay smallest balance first
    const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance);
    let snowballRemaining = totalDebt;
    let snowballMonths = 0;
    let snowballInterest = 0;

    while (snowballRemaining > 0.01 && snowballMonths < 600) {
      for (const debt of snowballDebts) {
        if (snowballRemaining <= 0.01) break;
        const monthlyRate = debt.interestRate / 100 / 12;
        const interest = snowballRemaining * monthlyRate;
        snowballInterest += interest;
        const payment = Math.min(monthlyPayment - interest, snowballRemaining);
        snowballRemaining -= payment;
      }
      snowballMonths++;
    }

    return {
      avalanche: { months: avalancheMonths, interest: avalancheInterest },
      snowball: { months: snowballMonths, interest: snowballInterest },
      savings: Math.max(0, snowballInterest - avalancheInterest),
      timeSaved: Math.max(0, snowballMonths - avalancheMonths)
    };
  }, [debts, extraPayment, totalDebt]);

  const debtFreeDate = useMemo(() => {
    const months = selectedStrategy === 'avalanche' ? strategies.avalanche.months : strategies.snowball.months;
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date;
  }, [selectedStrategy, strategies]);

  const priorityDebt = debts.length > 0
    ? [...debts].sort((a, b) => b.interestRate - a.interestRate)[0]
    : null;

  const sortedDebts = [...debts].sort((a, b) => {
    if (selectedStrategy === 'avalanche') return b.interestRate - a.interestRate;
    return a.balance - b.balance;
  });

  const handlePayment = (debt: Debt) => {
    setShowPaymentModal(debt);
    setPaymentAmount((debt.minPayment + extraPayment).toString());
  };

  const processPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0 && showPaymentModal) {
      try {
        const success = await debtService.makePayment(showPaymentModal.id, amount);

        if (success) {
          alert(`Payment of ₹${amount.toLocaleString()} processed successfully for ${showPaymentModal.name}!`);
          setShowPaymentModal(null);
          setPaymentAmount('');
        } else {
          alert('Payment failed. Please check the amount and try again.');
        }
      } catch (error) {
        console.error('Payment error:', error);
        alert('An error occurred while processing payment.');
      }
    }
  };

  const handleAddDebt = async () => {
    setAddDebtError('');
    
    // Validate inputs
    if (!newDebtName.trim()) {
      setAddDebtError('Please enter a debt name');
      return;
    }
    
    const balance = parseFloat(newDebtBalance);
    if (isNaN(balance) || balance <= 0) {
      setAddDebtError('Please enter a valid balance amount');
      return;
    }
    
    const rate = parseFloat(newDebtRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setAddDebtError('Please enter a valid interest rate (0-100)');
      return;
    }
    
    const minPayment = parseFloat(newDebtMinPayment);
    if (isNaN(minPayment) || minPayment <= 0) {
      setAddDebtError('Please enter a valid minimum payment');
      return;
    }
    
    if (minPayment < balance * (rate / 100 / 12)) {
      setAddDebtError('Minimum payment is too low to cover monthly interest');
      return;
    }

    setIsAddingDebt(true);
    
    try {
      await debtService.addDebt({
        name: newDebtName.trim(),
        balance: newDebtBalance,
        interestRate: newDebtRate,
        minPayment: newDebtMinPayment,
        type: newDebtType
      });
      
      // Reset form and close
      setNewDebtName('');
      setNewDebtBalance('');
      setNewDebtRate('');
      setNewDebtMinPayment('');
      setNewDebtType('credit');
      setShowAddDebtForm(false);
      
      // Show success message
      alert('Debt added successfully!');
    } catch (error) {
      console.error('Error adding debt:', error);
      setAddDebtError('Failed to add debt. Please try again.');
    } finally {
      setIsAddingDebt(false);
    }
  };

  const resetAddDebtForm = () => {
    setNewDebtName('');
    setNewDebtBalance('');
    setNewDebtRate('');
    setNewDebtMinPayment('');
    setNewDebtType('credit');
    setAddDebtError('');
    setShowAddDebtForm(false);
  };

  // Show loading state
  if (isLoading && debts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your debts...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (debts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Debt Free Journey
              </span>
            </h1>
            <p className="text-slate-400 text-lg">Your personalized path to financial freedom</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Debts Yet!</h2>
            <p className="text-slate-400 mb-6">
              Great news! You don't have any debts recorded. Add your first debt to start your debt-free journey.
            </p>
            
            {!showAddDebtForm ? (
              <button
                onClick={() => setShowAddDebtForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Add Your First Debt
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 text-left bg-slate-700/50 rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Add New Debt</h3>
                  <button
                    onClick={resetAddDebtForm}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="text-slate-400" size={20} />
                  </button>
                </div>
                
                {addDebtError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{addDebtError}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Debt Name</label>
                    <input
                      type="text"
                      value={newDebtName}
                      onChange={(e) => setNewDebtName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Credit Card, Personal Loan"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Balance (₹)</label>
                      <input
                        type="number"
                        value={newDebtBalance}
                        onChange={(e) => setNewDebtBalance(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                        min="0"
                        step="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Interest Rate (%)</label>
                      <input
                        type="number"
                        value={newDebtRate}
                        onChange={(e) => setNewDebtRate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Min Payment (₹)</label>
                      <input
                        type="number"
                        value={newDebtMinPayment}
                        onChange={(e) => setNewDebtMinPayment(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                        min="0"
                        step="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Debt Type</label>
                      <select
                        value={newDebtType}
                        onChange={(e) => setNewDebtType(e.target.value as any)}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="credit">Credit Card</option>
                        <option value="loan">Personal Loan</option>
                        <option value="student">Student Loan</option>
                        <option value="mortgage">Mortgage</option>
                        <option value="auto">Auto Loan</option>
                        <option value="medical">Medical</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddDebt}
                      disabled={isAddingDebt}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAddingDebt ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Debt'
                      )}
                    </button>
                    <button
                      onClick={resetAddDebtForm}
                      disabled={isAddingDebt}
                      className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Debt Free Journey
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Your personalized path to financial freedom</p>
        </motion.div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Debt',
              value: formatCurrency(totalDebt),
              icon: Wallet,
              color: 'from-red-500 to-pink-600',
              bgColor: 'bg-red-500/10'
            },
            {
              label: 'Monthly Payment',
              value: formatCurrency(totalMinPayment + extraPayment),
              icon: Calendar,
              color: 'from-blue-500 to-indigo-600',
              bgColor: 'bg-blue-500/10'
            },
            {
              label: 'Avg Interest Rate',
              value: `${weightedAvgRate.toFixed(1)}%`,
              icon: LineChart,
              color: 'from-amber-500 to-orange-600',
              bgColor: 'bg-amber-500/10'
            },
            {
              label: 'Debt-Free In',
              value: formatTime(selectedStrategy === 'avalanche' ? strategies.avalanche.months : strategies.snowball.months),
              icon: Target,
              color: 'from-emerald-500 to-teal-600',
              bgColor: 'bg-emerald-500/10'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} backdrop-blur-xl rounded-2xl p-6 border border-white/10`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="text-white" size={20} />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Extra Payment Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Extra Monthly Payment</h3>
              <p className="text-slate-400 text-sm">Increase your payment to get debt-free faster</p>
            </div>
            <div className="text-3xl font-bold text-emerald-400">{formatCurrency(extraPayment)}</div>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={extraPayment}
            onChange={(e) => setExtraPayment(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between mt-2 text-sm text-slate-400">
            <span>₹0</span>
            <span>₹500</span>
            <span>₹1000</span>
            <span>₹1500</span>
            <span>₹2000</span>
          </div>
        </motion.div>

        {/* Strategy Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Payoff Strategy</h3>
              <p className="text-slate-400 text-sm">Choose the method that works best for you</p>
            </div>
            <button onClick={() => setShowStrategies(!showStrategies)} className="text-slate-400 hover:text-white transition-colors">
              {showStrategies ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {showStrategies && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid md:grid-cols-2 gap-4">
                <motion.button
                  onClick={() => setSelectedStrategy('avalanche')}
                  className={`relative p-6 rounded-xl border-2 text-left transition-all ${selectedStrategy === 'avalanche' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                >
                  {selectedStrategy === 'avalanche' && <div className="absolute top-3 right-3"><CheckCircle className="text-emerald-400" size={20} /></div>}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <TrendingDown className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Avalanche Method</h4>
                      <p className="text-emerald-400 text-sm">Highest interest first</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-slate-400">Payoff Time</span><span className="text-white font-semibold">{formatTime(strategies.avalanche.months)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Total Interest</span><span className="text-white font-semibold">{formatCurrency(Math.round(strategies.avalanche.interest))}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Monthly Payment</span><span className="text-white font-semibold">{formatCurrency(totalMinPayment + extraPayment)}</span></div>
                  </div>
                  <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg">
                    <p className="text-emerald-400 text-sm"><Zap size={14} className="inline mr-1" />Saves {formatCurrency(Math.round(strategies.savings))} in interest</p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setSelectedStrategy('snowball')}
                  className={`relative p-6 rounded-xl border-2 text-left transition-all ${selectedStrategy === 'snowball' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                >
                  {selectedStrategy === 'snowball' && <div className="absolute top-3 right-3"><CheckCircle className="text-blue-400" size={20} /></div>}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Target className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Snowball Method</h4>
                      <p className="text-blue-400 text-sm">Smallest balance first</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-slate-400">Payoff Time</span><span className="text-white font-semibold">{formatTime(strategies.snowball.months)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Total Interest</span><span className="text-white font-semibold">{formatCurrency(Math.round(strategies.snowball.interest))}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Monthly Payment</span><span className="text-white font-semibold">{formatCurrency(totalMinPayment + extraPayment)}</span></div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                    <p className="text-blue-400 text-sm"><Trophy size={14} className="inline mr-1" />Quick wins to stay motivated</p>
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Priority Debt Alert */}
        {priorityDebt && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                <Flame className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-bold text-lg">Priority Debt</h4>
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Pay First</span>
                </div>
                <p className="text-slate-300 mb-4">
                  Your <strong>{priorityDebt.name}</strong> at <strong>{priorityDebt.interestRate}% APR</strong> is your highest interest debt. Focus on this first to maximize savings!
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Current Balance</p>
                    <p className="text-white font-bold">{formatCurrency(priorityDebt.balance)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Min Payment</p>
                    <p className="text-white font-bold">{formatCurrency(priorityDebt.minPayment)}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Monthly Interest</p>
                    <p className="text-white font-bold">{formatCurrency(priorityDebt.monthlyInterest || priorityDebt.balance * (priorityDebt.interestRate / 100 / 12))}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Time to Payoff</p>
                    <p className="text-white font-bold">{formatTime(priorityDebt.monthsToPayoff || 60)}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Sparkles size={18} />
                    <span className="font-semibold">Action Item</span>
                  </div>
                  <p className="text-slate-300">Add <strong>₹{200}</strong>/month extra to eliminate this debt sooner!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* All Debts List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <h3 className="text-white font-semibold">Your Debts ({debts.length})</h3>
          </div>

          <div className="space-y-4">
            {sortedDebts.map((debt, index) => {
              const percentage = totalDebt > 0 ? (debt.balance / totalDebt) * 100 : 0;
              const isExpanded = expandedDebt === debt.id;
              const isPriorityDebt = debt.id === priorityDebt?.id;
              const monthlyInterest = debt.monthlyInterest || debt.balance * (debt.interestRate / 100 / 12);
              const payoffMonths = debt.monthsToPayoff || Math.ceil(debt.balance / debt.minPayment);

              return (
                <motion.div key={debt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`relative overflow-hidden rounded-xl transition-all ${isPriorityDebt ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20' : 'bg-white/5 border border-white/10'}`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${debt.type === 'credit' ? 'bg-gradient-to-br from-red-500 to-pink-500' : debt.type === 'loan' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'}`}>
                          <CreditCard className="text-white" size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-semibold">{debt.name}</h4>
                            {isPriorityDebt && <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">Priority</span>}
                          </div>
                          <p className="text-slate-400 text-sm">{debt.interestRate}% APR</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{formatCurrency(debt.balance)}</p>
                        <p className="text-slate-400 text-sm">Min: {formatCurrency(debt.minPayment)}</p>
                      </div>
                    </div>

                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: 0.5 }} className={`absolute top-0 left-0 h-full rounded-full ${debt.type === 'credit' ? 'bg-gradient-to-r from-red-500 to-pink-500' : debt.type === 'loan' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mb-4">
                      <span>{percentage.toFixed(1)}% of total</span>
                      <span>{formatTime(payoffMonths)} to payoff</span>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 border-t border-white/10">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-slate-400 text-xs">Monthly Interest</p>
                              <p className="text-white font-semibold">{formatCurrency(monthlyInterest)}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-slate-400 text-xs">Total with Interest</p>
                              <p className="text-white font-semibold">{formatCurrency(Math.round(debt.balance + (monthlyInterest * payoffMonths)))}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-slate-400 text-xs">Recommended</p>
                              <p className="text-white font-semibold">{formatCurrency(debt.minPayment + extraPayment)}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-slate-400 text-xs">Payoff Date</p>
                              <p className="text-white font-semibold">
                                {(() => { const d = new Date(); d.setMonth(d.getMonth() + payoffMonths); return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); })()}
                              </p>
                            </div>
                          </div>
                          <button onClick={() => handlePayment(debt)} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 active:scale-95 transform">
                            <DollarSign size={18} />
                            Make Payment
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button onClick={() => setExpandedDebt(isExpanded ? null : debt.id)} className="w-full py-2 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 text-sm">
                      {isExpanded ? <><ChevronUp size={16} /> Show Less</> : <><ChevronDown size={16} /> Show Details</>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Summary Footer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Your Path to Debt Freedom</h3>
              <p className="text-white/80">
                With {formatCurrency(totalMinPayment + extraPayment)}/month, you'll be debt-free by{' '}
                <strong>{debtFreeDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{formatCurrency(Math.round(selectedStrategy === 'avalanche' ? strategies.avalanche.interest : strategies.snowball.interest))}</p>
                <p className="text-white/60 text-sm">Total Interest</p>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">{formatCurrency(totalDebt + Math.round(selectedStrategy === 'avalanche' ? strategies.avalanche.interest : strategies.snowball.interest))}</p>
                <p className="text-white/60 text-sm">Total Amount</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Make Payment</h3>
                <button onClick={() => setShowPaymentModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="text-slate-400" size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-slate-400 mb-2">{showPaymentModal.name}</p>
                <p className="text-3xl font-bold text-white mb-1">{formatCurrency(showPaymentModal.balance)}</p>
                <p className="text-sm text-slate-400">{showPaymentModal.interestRate}% APR</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Payment Amount</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentAmount(showPaymentModal.minPayment.toString())}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Min: {formatCurrency(showPaymentModal.minPayment)}
                  </button>
                  <button
                    onClick={() => setPaymentAmount((showPaymentModal.minPayment + extraPayment).toString())}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Recommended
                  </button>
                  <button
                    onClick={() => setPaymentAmount(showPaymentModal.balance.toString())}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Pay Off
                  </button>
                </div>

                <button
                  onClick={processPayment}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-95 transform"
                >
                  Process Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
