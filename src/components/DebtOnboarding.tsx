import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CreditCard,
  DollarSign,
  Target,
  Trash2,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { debtService } from '../services/debtService';

interface DebtFormData {
  name: string;
  balance: string;
  interestRate: string;
  minPayment: string;
  type: 'credit' | 'loan' | 'student';
}

interface DebtOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function DebtOnboarding({ onComplete, onSkip }: DebtOnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'form' | 'review'>('welcome');
  const [debts, setDebts] = useState<DebtFormData[]>([]);
  const [currentDebt, setCurrentDebt] = useState<DebtFormData>({
    name: '',
    balance: '',
    interestRate: '',
    minPayment: '',
    type: 'credit'
  });
  const [errors, setErrors] = useState<Partial<DebtFormData>>({});

  const debtTypes = [
    { value: 'credit' as const, label: 'Credit Card', icon: CreditCard, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    { value: 'loan' as const, label: 'Personal Loan', icon: DollarSign, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { value: 'student' as const, label: 'Student Loan', icon: Target, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
  ];

  const validateDebt = (debt: DebtFormData): Partial<DebtFormData> => {
    const newErrors: Partial<DebtFormData> = {};

    if (!debt.name.trim()) newErrors.name = 'Debt name is required';
    if (!debt.balance || parseFloat(debt.balance) <= 0) newErrors.balance = 'Valid balance is required';
    if (!debt.interestRate || parseFloat(debt.interestRate) < 0) newErrors.interestRate = 'Valid interest rate is required';
    if (!debt.minPayment || parseFloat(debt.minPayment) <= 0) newErrors.minPayment = 'Valid minimum payment is required';

    return newErrors;
  };

  const handleAddDebt = () => {
    const validationErrors = validateDebt(currentDebt);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setDebts([...debts, currentDebt]);
    setCurrentDebt({
      name: '',
      balance: '',
      interestRate: '',
      minPayment: '',
      type: 'credit'
    });
    setErrors({});
  };

  const handleRemoveDebt = (index: number) => {
    setDebts(debts.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    // Add all debts to the debt service
    for (const debt of debts) {
      await debtService.addDebt({
        name: debt.name,
        balance: parseFloat(debt.balance),
        interestRate: parseFloat(debt.interestRate),
        minPayment: parseFloat(debt.minPayment),
        type: debt.type
      });
    }

    onComplete();
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString()}`;
  };

  const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.balance || '0'), 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + parseFloat(debt.minPayment || '0'), 0);

  if (step === 'welcome') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Let's Manage Your Debt
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Add your debts to get personalized payoff strategies and real-time tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {debtTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.value} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{type.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track and optimize payments</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep('form')}
            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            Add My Debts
            <ArrowRight size={20} />
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Skip for Now
          </button>
        </div>
      </motion.div>
    );
  }

  if (step === 'form') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add Your Debts</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter details for each debt to get personalized payoff strategies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Debt Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Debt</h3>

            {/* Debt Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Debt Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {debtTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setCurrentDebt({ ...currentDebt, type: type.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        currentDebt.type === type.value
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon size={20} className="mx-auto mb-1" />
                      <p className="text-xs font-medium">{type.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Debt Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Debt Name
              </label>
              <input
                type="text"
                value={currentDebt.name}
                onChange={(e) => setCurrentDebt({ ...currentDebt, name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Chase Freedom Card"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Balance (₹)
              </label>
              <input
                type="number"
                value={currentDebt.balance}
                onChange={(e) => setCurrentDebt({ ...currentDebt, balance: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white ${
                  errors.balance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="1000"
              />
              {errors.balance && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.balance}
                </p>
              )}
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentDebt.interestRate}
                onChange={(e) => setCurrentDebt({ ...currentDebt, interestRate: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white ${
                  errors.interestRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="18.0"
              />
              {errors.interestRate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.interestRate}
                </p>
              )}
            </div>

            {/* Minimum Payment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Payment (₹)
              </label>
              <input
                type="number"
                value={currentDebt.minPayment}
                onChange={(e) => setCurrentDebt({ ...currentDebt, minPayment: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white ${
                  errors.minPayment ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="50"
              />
              {errors.minPayment && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.minPayment}
                </p>
              )}
            </div>

            <button
              onClick={handleAddDebt}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Debt
            </button>
          </div>

          {/* Debt List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Debts</h3>
              {debts.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Debt</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(totalDebt.toString())}</p>
                </div>
              )}
            </div>

            {debts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400">No debts added yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add your first debt to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {debts.map((debt, index) => {
                    const debtType = debtTypes.find(t => t.value === debt.type);
                    const Icon = debtType?.icon || CreditCard;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${debtType?.color}`}>
                              <Icon size={16} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{debt.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {debt.interestRate}% APR • Min: {formatCurrency(debt.minPayment)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-600">{formatCurrency(debt.balance)}</span>
                            <button
                              onClick={() => handleRemoveDebt(index)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {debts.length > 0 && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Total Monthly Minimum</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalMinPayment.toString())}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Total Debt</span>
                    <span className="font-bold text-red-600">{formatCurrency(totalDebt.toString())}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('review')}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Review
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setStep('welcome')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
      </motion.div>
    );
  }

  if (step === 'review') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review Your Debts</h2>
          <p className="text-gray-600 dark:text-gray-400">
            We'll create personalized payoff strategies for your {debts.length} debt{debts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {debts.map((debt, index) => {
            const debtType = debtTypes.find(t => t.value === debt.type);
            const Icon = debtType?.icon || CreditCard;

            return (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${debtType?.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{debt.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {debt.interestRate}% APR • Min Payment: {formatCurrency(debt.minPayment)}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(debt.balance)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="text-green-600 mt-0.5" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Real-time debt tracking with interest accrual</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="text-green-600 mt-0.5" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Snowball vs Avalanche strategy comparison</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="text-green-600 mt-0.5" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Personalized payoff recommendations</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="text-green-600 mt-0.5" size={16} />
              <span className="text-gray-700 dark:text-gray-300">Progress tracking and payment scheduling</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleComplete}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            Start Managing My Debts
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => setStep('form')}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Edit Debts
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
