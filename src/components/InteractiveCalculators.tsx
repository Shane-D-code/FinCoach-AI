import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Calculator, DollarSign, Calendar, TrendingDown,
    Percent, Target, Zap, Info
} from 'lucide-react';

interface Debt {
    id: number;
    name: string;
    balance: number;
    interestRate: number;
    minPayment: number;
}

interface InteractiveCalculatorsProps {
    debts: Debt[];
    className?: string;
}

type CalculatorType = 'whatif' | 'payoff' | 'savings';

export default function InteractiveCalculators({ debts, className = '' }: InteractiveCalculatorsProps) {
    const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('whatif');

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <Calculator className="text-indigo-500" size={24} />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Calculators</h2>
                </div>

                {/* Calculator Tabs */}
                <div className="flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveCalculator('whatif')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeCalculator === 'whatif'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        What-If Scenarios
                    </button>
                    <button
                        onClick={() => setActiveCalculator('payoff')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeCalculator === 'payoff'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Payoff Calculator
                    </button>
                    <button
                        onClick={() => setActiveCalculator('savings')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeCalculator === 'savings'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Interest Savings
                    </button>
                </div>
            </div>

            {/* Calculator Content */}
            <div className="p-6">
                {activeCalculator === 'whatif' && <WhatIfCalculator debts={debts} />}
                {activeCalculator === 'payoff' && <PayoffCalculator debts={debts} />}
                {activeCalculator === 'savings' && <SavingsCalculator debts={debts} />}
            </div>
        </div>
    );
}

// What-If Scenario Calculator
function WhatIfCalculator({ debts }: { debts: Debt[] }) {
    const [extraPayment, setExtraPayment] = useState(100);
    const [selectedDebt, setSelectedDebt] = useState<number>(debts[0]?.id || 0);

    const results = useMemo(() => {
        const debt = debts.find(d => d.id === selectedDebt);
        if (!debt) return null;

        const calculatePayoff = (monthlyPayment: number) => {
            let balance = debt.balance;
            let months = 0;
            let totalInterest = 0;

            while (balance > 0 && months < 600) {
                const monthlyInterest = balance * (debt.interestRate / 100 / 12);
                const principal = Math.min(monthlyPayment - monthlyInterest, balance);

                if (principal <= 0) break; // Payment too small

                balance -= principal;
                totalInterest += monthlyInterest;
                months++;
            }

            return { months, totalInterest, totalPaid: debt.balance + totalInterest };
        };

        const current = calculatePayoff(debt.minPayment);
        const withExtra = calculatePayoff(debt.minPayment + extraPayment);

        return {
            debt,
            current,
            withExtra,
            monthsSaved: current.months - withExtra.months,
            interestSaved: current.totalInterest - withExtra.totalInterest
        };
    }, [debts, selectedDebt, extraPayment]);

    if (!results) {
        return <div className="text-center text-gray-500 dark:text-gray-400 py-8">No debts available</div>;
    }

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Debt
                    </label>
                    <select
                        value={selectedDebt}
                        onChange={(e) => setSelectedDebt(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        {debts.map(debt => (
                            <option key={debt.id} value={debt.id}>
                                {debt.name} - ${debt.balance.toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Extra Monthly Payment: ${extraPayment}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        step="25"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>$0</span>
                        <span>$500</span>
                        <span>$1000</span>
                    </div>
                </div>
            </div>

            {/* Results Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Current Plan */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600"
                >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Calendar size={18} />
                        Current Plan
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Monthly Payment:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                ${results.debt.minPayment.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Payoff Time:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {results.current.months} months
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Interest:</span>
                            <span className="font-semibold text-red-600">
                                ${results.current.totalInterest.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                ${results.current.totalPaid.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* With Extra Payment */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-2 border-green-500"
                >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Zap size={18} className="text-green-600" />
                        With Extra ${extraPayment}/mo
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Monthly Payment:</span>
                            <span className="font-semibold text-green-700 dark:text-green-400">
                                ${(results.debt.minPayment + extraPayment).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Payoff Time:</span>
                            <span className="font-semibold text-green-700 dark:text-green-400">
                                {results.withExtra.months} months
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Interest:</span>
                            <span className="font-semibold text-green-700 dark:text-green-400">
                                ${results.withExtra.totalInterest.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-green-300 dark:border-green-700">
                            <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                            <span className="font-bold text-green-700 dark:text-green-400">
                                ${results.withExtra.totalPaid.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Savings Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-6 text-white"
            >
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingDown size={20} />
                    Your Savings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-indigo-100 text-sm mb-1">Time Saved</div>
                        <div className="text-3xl font-bold">{results.monthsSaved}</div>
                        <div className="text-indigo-100 text-sm">months</div>
                    </div>
                    <div>
                        <div className="text-indigo-100 text-sm mb-1">Interest Saved</div>
                        <div className="text-3xl font-bold">${results.interestSaved.toLocaleString()}</div>
                        <div className="text-indigo-100 text-sm">total</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Payoff Date Calculator
function PayoffCalculator({ debts }: { debts: Debt[] }) {
    const [targetDate, setTargetDate] = useState(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 2);
        return date.toISOString().split('T')[0];
    });

    const results = useMemo(() => {
        const target = new Date(targetDate);
        const now = new Date();
        const monthsToTarget = Math.max(1, Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));

        const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
        const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);

        // Calculate required monthly payment
        let requiredPayment = totalMinPayment;
        let iterations = 0;

        while (iterations < 1000) {
            let remainingBalance = totalDebt;
            let months = 0;

            const debtsCopy = debts.map(d => ({ ...d }));

            while (remainingBalance > 0.01 && months < monthsToTarget) {
                debtsCopy.forEach(debt => {
                    if (debt.balance > 0) {
                        const monthlyInterest = debt.balance * (debt.interestRate / 100 / 12);
                        const payment = Math.min(requiredPayment / debts.length, debt.balance + monthlyInterest);
                        debt.balance = Math.max(0, debt.balance + monthlyInterest - payment);
                    }
                });

                remainingBalance = debtsCopy.reduce((sum, d) => sum + d.balance, 0);
                months++;
            }

            if (remainingBalance <= 0.01) break;
            requiredPayment += 50;
            iterations++;
        }

        return {
            monthsToTarget,
            requiredPayment,
            totalDebt,
            totalMinPayment,
            extraNeeded: requiredPayment - totalMinPayment,
            isPossible: requiredPayment < totalDebt * 2 // Sanity check
        };
    }, [debts, targetDate]);

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Debt-Free Date
                </label>
                <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target size={20} className="text-blue-600" />
                    Required Monthly Payment
                </h4>

                {results.isPossible ? (
                    <>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            ${results.requiredPayment.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            per month for {results.monthsToTarget} months
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Payment</div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    ${results.totalMinPayment.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Extra Needed</div>
                                <div className="text-lg font-semibold text-orange-600">
                                    ${results.extraNeeded.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <Info className="mx-auto text-orange-500 mb-2" size={32} />
                        <p className="text-gray-600 dark:text-gray-400">
                            This target date may not be achievable. Try selecting a later date.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Interest Savings Calculator
function SavingsCalculator({ debts }: { debts: Debt[] }) {
    const [newInterestRate, setNewInterestRate] = useState(10);

    const results = useMemo(() => {
        const calculateTotalInterest = (rate: number) => {
            return debts.reduce((total, debt) => {
                let balance = debt.balance;
                let totalInterest = 0;
                let months = 0;

                while (balance > 0 && months < 600) {
                    const monthlyInterest = balance * (rate / 100 / 12);
                    const principal = Math.min(debt.minPayment - monthlyInterest, balance);

                    if (principal <= 0) break;

                    balance -= principal;
                    totalInterest += monthlyInterest;
                    months++;
                }

                return total + totalInterest;
            }, 0);
        };

        const currentInterest = calculateTotalInterest(
            debts.reduce((sum, d) => sum + d.interestRate * d.balance, 0) /
            debts.reduce((sum, d) => sum + d.balance, 0)
        );
        const newInterest = calculateTotalInterest(newInterestRate);
        const savings = currentInterest - newInterest;

        return { currentInterest, newInterest, savings };
    }, [debts, newInterestRate]);

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Interest Rate: {newInterestRate}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={newInterestRate}
                    onChange={(e) => setNewInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span>15%</span>
                    <span>30%</span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Percent size={16} className="text-red-600" />
                        <div className="text-xs text-gray-600 dark:text-gray-400">Current Interest</div>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                        ${results.currentInterest.toLocaleString()}
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Percent size={16} className="text-blue-600" />
                        <div className="text-xs text-gray-600 dark:text-gray-400">New Interest</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        ${results.newInterest.toLocaleString()}
                    </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={16} className="text-green-600" />
                        <div className="text-xs text-gray-600 dark:text-gray-400">Savings</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        ${results.savings.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white">
                <h4 className="font-bold mb-2">💡 Refinancing Opportunity</h4>
                <p className="text-sm text-green-50">
                    {results.savings > 0
                        ? `By refinancing to ${newInterestRate}%, you could save $${results.savings.toLocaleString()} in interest payments!`
                        : `Your current rate is already better than ${newInterestRate}%. Keep up the good work!`
                    }
                </p>
            </div>
        </div>
    );
}
