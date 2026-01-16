import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, TrendingDown, Calculator, Target, DollarSign, Clock,
  Plus, AlertCircle, CheckCircle, History, BarChart3, Award,
  ChevronDown, ChevronUp, RefreshCw, Wifi, WifiOff, Trash2, Lightbulb, Home,
  Zap, TrendingUp, Calendar, Bell, Sparkles, PieChart, ArrowUpRight, Edit2,
  Gift, Star, Flame, Trophy, Shield, Brain, Percent, ArrowDownRight
} from 'lucide-react';
import { debtService, Debt, DebtSummary, DebtPayment, StrategyComparison } from '../services/debtService';
import DebtOnboarding from './DebtOnboarding';

interface DebtManagementProps { className?: string; }
type ViewMode = 'dashboard' | 'payments' | 'progress' | 'strategies';

export default function DebtManagement({ className = '' }: DebtManagementProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [extraPayment, setExtraPayment] = useState(200);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [comparison, setComparison] = useState<StrategyComparison | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [expandedDebt, setExpandedDebt] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showInsights, setShowInsights] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState<number | null>(null);
  const [customPayment, setCustomPayment] = useState('');
  const [debtFreeDate, setDebtFreeDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const unsubDebts = debtService.subscribe((updatedDebts) => {
          setDebts(updatedDebts);
          if (!hasInitialLoad) {
            setHasInitialLoad(true);
            if (updatedDebts.length === 0) setShowOnboarding(true);
          }
        });
        const unsubPayments = debtService.subscribeToPayments((updatedPayments) => {
          setPayments(updatedPayments);
        });
        await Promise.all([debtService.getDebts(), debtService.getPaymentHistory()]);
        const summary = await debtService.getDebtSummary(extraPayment);
        setDebtSummary(summary);
        const comp = await debtService.compareStrategies(extraPayment);
        setComparison(comp);
      } catch (error) {
        console.error('Error loading data:', error);
        showToast('Failed to load debt data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    return () => { debtService.destroy(); };
  }, [hasInitialLoad]);

  useEffect(() => {
    const updateSummary = async () => {
      if (debts.length > 0) {
        const summary = await debtService.getDebtSummary(extraPayment);
        setDebtSummary(summary);
        const comp = await debtService.compareStrategies(extraPayment);
        setComparison(comp);
        
        // Calculate debt-free date
        if (summary) {
          const monthsToFree = summary.estimatedPayoffMonths;
          const freeDate = new Date();
          freeDate.setMonth(freeDate.getMonth() + monthsToFree);
          setDebtFreeDate(freeDate);
        }
      }
    };
    updateSummary();
  }, [debts, extraPayment]);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); showToast('Back online - syncing data...', 'success'); debtService.refreshDebts(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handlePayment = async (debtId: number, amount: number) => {
    const success = await debtService.makePayment(debtId, amount);
    if (success) {
      showToast(`Payment of ₹${amount.toLocaleString()} processed successfully!`, 'success');
      await Promise.all([debtService.getDebts(), debtService.getPaymentHistory()]);
      const summary = await debtService.getDebtSummary(extraPayment);
      setDebtSummary(summary);
    } else {
      showToast('Payment failed. Please try again.', 'error');
    }
  };

  const handleDeleteDebt = async (debtId: number) => {
    if (confirm('Are you sure you want to delete this debt?')) {
      await debtService.deleteDebt(debtId);
      showToast('Debt deleted successfully', 'success');
      await debtService.getDebts();
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  const formatTime = (months: number) => {
    if (months === Infinity || months > 600) return 'Never';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths}mo`;
    if (remainingMonths === 0) return `${years}yr`;
    return `${years}yr ${remainingMonths}mo`;
  };

  const getDebtTypeIcon = (type: string) => {
    switch (type) {
      case 'credit': return <CreditCard size={20} />;
      case 'loan': return <DollarSign size={20} />;
      case 'student': return <Target size={20} />;
      case 'mortgage': return <Home size={20} />;
      default: return <CreditCard size={20} />;
    }
  };

  const getDebtTypeColor = (type: string) => {
    switch (type) {
      case 'credit': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'loan': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'mortgage': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await debtService.getDebts();
    const summary = await debtService.getDebtSummary(extraPayment);
    setDebtSummary(summary);
    showToast('Debts added successfully!', 'success');
  };

  const handleOnboardingSkip = () => setShowOnboarding(false);
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([debtService.getDebts(), debtService.getPaymentHistory()]);
      const summary = await debtService.getDebtSummary(extraPayment);
      setDebtSummary(summary);
      const comp = await debtService.compareStrategies(extraPayment);
      setComparison(comp);
      showToast('Data refreshed', 'success');
    } catch { showToast('Failed to refresh data', 'error'); }
    finally { setIsLoading(false); }
  };

  const getSortedDebts = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (strategy === 'avalanche') return b.interestRate - a.interestRate;
      return a.balance - b.balance;
    });
  }, [debts, strategy]);

  const getSmartInsights = useMemo(() => {
    if (!debtSummary || debts.length === 0) return [];
    
    const insights = [];
    
    // High interest warning
    const highInterestDebts = debts.filter(d => d.interestRate > 18);
    if (highInterestDebts.length > 0) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'High Interest Alert',
        message: `${highInterestDebts.length} debt(s) with >18% APR. Consider refinancing to save ₹${Math.round(highInterestDebts.reduce((sum, d) => sum + (d.balance * (d.interestRate - 12) / 100), 0)).toLocaleString()}/year.`,
        action: 'Explore Options'
      });
    }
    
    // Extra payment impact
    if (comparison && extraPayment > 0) {
      const savings = comparison.savings.interestSaved;
      if (savings > 1000) {
        insights.push({
          type: 'success',
          icon: TrendingUp,
          title: 'Great Progress!',
          message: `Your ₹${extraPayment} extra payment saves ₹${Math.round(savings).toLocaleString()} in interest and ${comparison.savings.timeSavedMonths} months!`,
          action: 'Increase Payment'
        });
      }
    }
    
    // Debt consolidation opportunity
    if (debts.length >= 3 && debtSummary.averageInterestRate > 15) {
      insights.push({
        type: 'info',
        icon: Sparkles,
        title: 'Consolidation Opportunity',
        message: `Consolidating ${debts.length} debts could lower your rate from ${debtSummary.averageInterestRate.toFixed(1)}% to ~12% and simplify payments.`,
        action: 'Calculate Savings'
      });
    }
    
    // Milestone approaching
    if (debtSummary.progressPercentage > 25 && debtSummary.progressPercentage < 30) {
      insights.push({
        type: 'celebration',
        icon: Trophy,
        title: 'Milestone Approaching!',
        message: `You're ${(30 - debtSummary.progressPercentage).toFixed(1)}% away from 30% debt freedom. Keep going!`,
        action: 'View Milestones'
      });
    }
    
    return insights;
  }, [debts, debtSummary, comparison, extraPayment]);

  const handleQuickPayment = async (debtId: number, paymentType: 'min' | 'recommended' | 'custom') => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;
    
    let amount = 0;
    if (paymentType === 'min') amount = debt.minPayment;
    else if (paymentType === 'recommended') amount = debt.minPayment + extraPayment;
    else if (paymentType === 'custom' && customPayment) amount = parseFloat(customPayment);
    
    if (amount > 0) {
      await handlePayment(debtId, amount);
      setShowPaymentModal(null);
      setCustomPayment('');
    }
  };

  if (showOnboarding) {
    return <div className={className}><DebtOnboarding onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} /></div>;
  }

  if (debts.length === 0 && hasInitialLoad && !isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="text-center py-12">
          <CreditCard className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Debts Added</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add your debts to get personalized payoff strategies</p>
          <button onClick={() => setShowOnboarding(true)} className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 mx-auto">
            <Plus size={20} />Add Your Debts
          </button>
        </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              {(() => {
                const debt = debts.find(d => d.id === showPaymentModal);
                if (!debt) return null;
                return (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Make Payment</h3>
                    <div className="mb-6">
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{debt.name}</p>
                      <p className="text-3xl font-bold text-red-600">{formatCurrency(debt.balance)}</p>
                    </div>
                    <div className="space-y-3">
                      <button onClick={() => handleQuickPayment(debt.id, 'min')}
                        className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 transition-all text-left">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Minimum Payment</p>
                            <p className="text-sm text-gray-500">Required monthly payment</p>
                          </div>
                          <span className="text-xl font-bold text-blue-600">{formatCurrency(debt.minPayment)}</span>
                        </div>
                      </button>
                      <button onClick={() => handleQuickPayment(debt.id, 'recommended')}
                        className="w-full p-4 border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all text-left">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              Recommended <Sparkles size={16} className="text-green-600" />
                            </p>
                            <p className="text-sm text-gray-500">Minimum + extra payment</p>
                          </div>
                          <span className="text-xl font-bold text-green-600">{formatCurrency(debt.minPayment + extraPayment)}</span>
                        </div>
                      </button>
                      <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                        <p className="font-semibold text-gray-900 dark:text-white mb-3">Custom Amount</p>
                        <div className="flex gap-2">
                          <input type="number" value={customPayment} onChange={(e) => setCustomPayment(e.target.value)}
                            placeholder="Enter amount" className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                          <button onClick={() => handleQuickPayment(debt.id, 'custom')}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            Pay
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setShowPaymentModal(null)}
                      className="w-full mt-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Cancel
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl"><TrendingDown className="text-red-600" size={24} /></div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Debt Management</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Debt: {debtSummary ? formatCurrency(debtSummary.totalDebt) : '₹0'}</span>
                {isOnline ? <span className="flex items-center gap-1 text-green-600"><Wifi size={14} /> Live</span> : <span className="flex items-center gap-1 text-orange-600"><WifiOff size={14} /> Offline</span>}
              </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowOnboarding(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus size={16} />Add Debt
            </button>
          </div>
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'payments', label: 'Payments', icon: History },
            { id: 'progress', label: 'Progress', icon: TrendingDown },
            { id: 'strategies', label: 'Strategies', icon: Lightbulb }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${viewMode === tab.id ? 'bg-white dark:bg-gray-600 text-red-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
              <tab.icon size={18} /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

      {viewMode === 'dashboard' && debtSummary && (
        <>
          {/* Smart Insights Banner */}
          {showInsights && getSmartInsights.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="text-purple-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">AI Insights</h4>
                </div>
                <button onClick={() => setShowInsights(false)} className="text-gray-400 hover:text-gray-600">
                  <ChevronUp size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getSmartInsights.map((insight, idx) => {
                  const Icon = insight.icon;
                  const colors = {
                    warning: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
                    success: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
                    info: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
                    celebration: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                  };
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-xl border ${colors[insight.type as keyof typeof colors]}`}>
                      <div className="flex items-start gap-3">
                        <Icon size={20} className="mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-white mb-1">{insight.title}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{insight.message}</p>
                          <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
                            {insight.action} <ArrowUpRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Debt-Free Countdown */}
          {debtFreeDate && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-white/90" size={24} />
                    <h4 className="text-lg font-semibold">Debt-Free Date</h4>
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    {debtFreeDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-white/80">
                    {Math.ceil((debtFreeDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days to freedom
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{debtSummary.progressPercentage.toFixed(0)}%</p>
                      <p className="text-xs text-white/80">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-100 dark:border-red-900">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Clock className="text-red-600" size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payoff Time</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatTime(debtSummary.estimatedPayoffMonths)}</p>
              {debtSummary.recommendedStrategy === 'avalanche' && (
                <div className="flex items-center gap-1 mt-2">
                  <Zap size={12} className="text-green-600" />
                  <p className="text-xs text-green-600">Avalanche saves time</p>
                </div>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DollarSign className="text-blue-600" size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Payment</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(debtSummary.totalMinPayment + extraPayment)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(debtSummary.totalMinPayment)} min + {formatCurrency(extraPayment)} extra</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-900">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Percent className="text-green-600" size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{debtSummary.highestInterestRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Avg: {debtSummary.averageInterestRate.toFixed(1)}% • Low: {debtSummary.lowestInterestRate}%</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-900">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Trophy className="text-purple-600" size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{debtSummary.progressPercentage.toFixed(1)}%</p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(debtSummary.progressPercentage, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
            </motion.div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-900 dark:text-white">Extra Monthly Payment</label>
              <span className="text-2xl font-bold text-red-600">{formatCurrency(extraPayment)}</span>
            </div>
            <input type="range" min="0" max="2000" step="50" value={extraPayment} onChange={(e) => setExtraPayment(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-red-600" />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>₹0</span><span>₹500</span><span>₹1000</span><span>₹1500</span><span>₹2000</span>
            </div>
            <div className="flex gap-2 mt-4">
              {[50, 100, 200, 500].map((amount) => (
                <button key={amount} onClick={() => setExtraPayment(amount)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${extraPayment === amount ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  +₹{amount}
                </button>
              ))}
            </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="text-purple-600" size={20} />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Payoff Strategy</h4>
              </div>
              {comparison && comparison.savings.interestSaved > 0 && (
                <span className="text-sm text-green-600">Save {formatCurrency(comparison.savings.interestSaved)} with Avalanche</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setStrategy('snowball')}
                className={`p-4 rounded-xl border-2 transition-all ${strategy === 'snowball' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Snowball</span>
                  {strategy === 'snowball' && <CheckCircle className="text-green-500" size={20} />}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pay smallest balances first for quick wins</p>
              </button>
              <button onClick={() => setStrategy('avalanche')}
                className={`p-4 rounded-xl border-2 transition-all ${strategy === 'avalanche' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Avalanche</span>
                  {strategy === 'avalanche' && <CheckCircle className="text-green-500" size={20} />}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pay highest interest first to save money</p>
              </button>
            </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Debts</h4>
            <div className="space-y-3">
              <AnimatePresence>
                {getSortedDebts.map((debt, index) => (
                  <motion.div key={debt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-xl border-l-4 ${index === 0 && strategy === 'avalanche' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : index === 0 && strategy === 'snowball' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getDebtTypeColor(debt.type)}`}>{getDebtTypeIcon(debt.type)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-gray-900 dark:text-white">{debt.name}</h5>
                            {index === 0 && <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">Priority</span>}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{debt.interestRate}% APR - Min: {formatCurrency(debt.minPayment)}</p>
                        </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-red-600">{formatCurrency(debt.balance)}</span>
                        {debt.originalBalance && debt.progressPercentage !== undefined && debt.progressPercentage > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                            <TrendingDown size={12} />{debt.progressPercentage.toFixed(1)}% paid
                          </div>
                        )}
                      </div>
                    <AnimatePresence>
                      {expandedDebt === debt.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Monthly Interest</span>
                              <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(debt.monthlyInterest || debt.balance * (debt.interestRate / 100 / 12))}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Est. Payoff</span>
                              <p className="font-semibold text-gray-900 dark:text-white">{formatTime(debt.monthsToPayoff || 60)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Recommended</span>
                              <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(debt.recommendedPayment || debt.minPayment + extraPayment)}</p>
                            </div>
                          <div className="flex gap-2 mt-4">
                            <button onClick={() => handlePayment(debt.id, debt.minPayment + extraPayment)}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Make Payment</button>
                            <button onClick={() => handleDeleteDebt(debt.id)}
                              className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button onClick={() => setExpandedDebt(expandedDebt === debt.id ? null : debt.id)}
                      className="mt-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      {expandedDebt === debt.id ? <><ChevronUp size={16} />Hide details</> : <><ChevronDown size={16} />Show details</>}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
        </>
      )}

      {viewMode === 'payments' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="text-blue-600" />Payment History
          </h4>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="mx-auto mb-2" size={48} />
              <p>No payments made yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 20).map((payment, index) => (
                <motion.div key={payment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{payment.debtName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-500">Balance: {formatCurrency(payment.balanceAfter)}</p>
                    </div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="text-gray-500">Principal: <span className="text-blue-600">{formatCurrency(payment.principalPaid)}</span>
                    <span className="text-gray-500">Interest: <span className="text-red-600">{formatCurrency(payment.interestPaid)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'progress' && debtSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="text-green-600" />Overall Progress
          </h4>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Debt Payoff Progress</span>
              <span className="font-semibold text-gray-900 dark:text-white">{debtSummary.progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(debtSummary.progressPercentage, 100)}%` }} transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
            </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(debtSummary.totalDebt)}</p>
              <p className="text-sm text-gray-500">Remaining</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(debtSummary.totalOriginalDebt - debtSummary.totalDebt)}</p>
              <p className="text-sm text-gray-500">Paid Off</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(debtSummary.totalInterestPaid)}</p>
              <p className="text-sm text-gray-500">Interest Paid</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(debtSummary.totalPrincipalPaid)}</p>
              <p className="text-sm text-gray-500">Principal Paid</p>
            </div>
        </div>
      )}

      {viewMode === 'strategies' && comparison && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lightbulb className="text-yellow-600" />Strategy Comparison
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <h5 className="text-xl font-bold text-red-600 mb-4">Snowball Method</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payoff Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatTime(comparison.snowball.payoffMonths)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Interest</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(comparison.snowball.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Payment</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(comparison.snowball.monthlyPayment)}</span>
                </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Best for psychological wins by eliminating smaller debts first.</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h5 className="text-xl font-bold text-blue-600 mb-4">Avalanche Method</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payoff Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatTime(comparison.avalanche.payoffMonths)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Interest</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(comparison.avalanche.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Payment</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(comparison.avalanche.monthlyPayment)}</span>
                </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Best for saving money by eliminating highest interest debts first.</p>
            </div>
          {comparison.savings.interestSaved > 0 && (
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-center">
                <strong>Avalanche saves you {formatCurrency(comparison.savings.interestSaved)}</strong> in interest
                {comparison.savings.timeSavedMonths > 0 && ` and ${formatTime(comparison.savings.timeSavedMonths)} in time`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
