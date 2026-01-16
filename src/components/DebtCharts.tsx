import { useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, Area, AreaChart
} from 'recharts';
import { TrendingDown, DollarSign, Calendar, Percent } from 'lucide-react';

// Types
interface Debt {
    id: number;
    name: string;
    balance: number;
    interestRate: number;
    type: string;
    originalBalance?: number;
}

interface DebtSummary {
    totalDebt: number;
    totalOriginalDebt: number;
    progressPercentage: number;
    totalMonthlyInterest: number;
    estimatedPayoffMonths: number;
}

interface StrategyComparison {
    snowball: { payoffMonths: number; totalInterest: number; monthlyPayment: number };
    avalanche: { payoffMonths: number; totalInterest: number; monthlyPayment: number };
    savings: { interestSaved: number; timeSavedMonths: number; recommendation: string };
}

// Color palettes
const DEBT_TYPE_COLORS: Record<string, string> = {
    credit: '#ef4444',
    loan: '#f59e0b',
    student: '#3b82f6',
    mortgage: '#8b5cf6',
    auto: '#10b981',
    medical: '#ec4899',
    other: '#6b7280'
};

const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    gradient1: '#6366f1',
    gradient2: '#8b5cf6'
};

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: ${entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// 1. Progress Donut Chart
interface ProgressDonutChartProps {
    summary: DebtSummary;
    className?: string;
}

export function ProgressDonutChart({ summary, className = '' }: ProgressDonutChartProps) {
    const data = useMemo(() => {
        const paid = summary.totalOriginalDebt - summary.totalDebt;
        const remaining = summary.totalDebt;
        return [
            { name: 'Paid Off', value: paid, color: CHART_COLORS.success },
            { name: 'Remaining', value: remaining, color: CHART_COLORS.danger }
        ];
    }, [summary]);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="text-green-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h3>
            </div>

            <div className="relative">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {summary.progressPercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Paid Off</div>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Paid</div>
                    <div className="text-lg font-semibold text-green-600">
                        ${(summary.totalOriginalDebt - summary.totalDebt).toLocaleString()}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
                    <div className="text-lg font-semibold text-red-600">
                        ${summary.totalDebt.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 2. Balance Projection Chart
interface BalanceProjectionChartProps {
    debts: Debt[];
    extraPayment: number;
    className?: string;
}

export function BalanceProjectionChart({ debts, extraPayment, className = '' }: BalanceProjectionChartProps) {
    const projectionData = useMemo(() => {
        const months = 24; // 2 years projection
        const data = [];
        let currentDebts = debts.map(d => ({ ...d }));

        for (let month = 0; month <= months; month++) {
            const totalBalance = currentDebts.reduce((sum, d) => sum + d.balance, 0);
            const totalInterest = currentDebts.reduce((sum, d) => sum + (d.balance * (d.interestRate / 100 / 12)), 0);

            data.push({
                month: month === 0 ? 'Now' : `${month}m`,
                balance: Math.round(totalBalance),
                interest: Math.round(totalInterest)
            });

            // Simulate monthly payments
            currentDebts = currentDebts.map(d => {
                if (d.balance <= 0) return d;
                const monthlyInterest = d.balance * (d.interestRate / 100 / 12);
                const minPayment = d.balance * 0.02; // 2% minimum
                const payment = Math.min(minPayment + (extraPayment / currentDebts.length), d.balance + monthlyInterest);
                return {
                    ...d,
                    balance: Math.max(0, d.balance + monthlyInterest - payment)
                };
            });
        }

        return data;
    }, [debts, extraPayment]);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">24-Month Projection</h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={projectionData}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                        dataKey="month"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke={CHART_COLORS.primary}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Projected debt-free in <span className="font-semibold text-blue-600">
                        {projectionData.findIndex(d => d.balance === 0) || '24+'} months
                    </span>
                </p>
            </div>
        </div>
    );
}

// 3. Strategy Comparison Chart
interface StrategyComparisonChartProps {
    comparison: StrategyComparison;
    className?: string;
}

export function StrategyComparisonChart({ comparison, className = '' }: StrategyComparisonChartProps) {
    const data = useMemo(() => [
        {
            strategy: 'Snowball',
            months: comparison.snowball.payoffMonths,
            interest: comparison.snowball.totalInterest,
            payment: comparison.snowball.monthlyPayment
        },
        {
            strategy: 'Avalanche',
            months: comparison.avalanche.payoffMonths,
            interest: comparison.avalanche.totalInterest,
            payment: comparison.avalanche.monthlyPayment
        }
    ], [comparison]);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <DollarSign className="text-purple-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strategy Comparison</h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                        dataKey="strategy"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="interest" fill={CHART_COLORS.danger} name="Total Interest" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="months" fill={CHART_COLORS.warning} name="Months to Payoff" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    💡 {comparison.savings.recommendation}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Interest Saved: </span>
                        <span className="font-semibold text-green-600">
                            ${comparison.savings.interestSaved.toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Time Saved: </span>
                        <span className="font-semibold text-green-600">
                            {comparison.savings.timeSavedMonths} months
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 4. Interest vs Principal Chart
interface InterestVsPrincipalChartProps {
    debts: Debt[];
    className?: string;
}

export function InterestVsPrincipalChart({ debts, className = '' }: InterestVsPrincipalChartProps) {
    const data = useMemo(() => {
        const months = 12;
        const chartData = [];
        let currentDebts = debts.map(d => ({ ...d }));

        for (let month = 1; month <= months; month++) {
            let totalPrincipal = 0;
            let totalInterest = 0;

            currentDebts = currentDebts.map(d => {
                if (d.balance <= 0) return d;
                const monthlyInterest = d.balance * (d.interestRate / 100 / 12);
                const minPayment = d.balance * 0.02;
                const principal = Math.min(minPayment, d.balance);

                totalInterest += monthlyInterest;
                totalPrincipal += principal;

                return {
                    ...d,
                    balance: Math.max(0, d.balance + monthlyInterest - minPayment)
                };
            });

            chartData.push({
                month: `Month ${month}`,
                principal: Math.round(totalPrincipal),
                interest: Math.round(totalInterest)
            });
        }

        return chartData;
    }, [debts]);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Percent className="text-orange-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interest vs Principal</h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                        dataKey="month"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="principal"
                        stroke={CHART_COLORS.success}
                        strokeWidth={2}
                        name="Principal Payment"
                        dot={{ fill: CHART_COLORS.success }}
                    />
                    <Line
                        type="monotone"
                        dataKey="interest"
                        stroke={CHART_COLORS.danger}
                        strokeWidth={2}
                        name="Interest Payment"
                        dot={{ fill: CHART_COLORS.danger }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// 5. Debt Breakdown Pie Chart
interface DebtBreakdownPieChartProps {
    debts: Debt[];
    className?: string;
}

export function DebtBreakdownPieChart({ debts, className = '' }: DebtBreakdownPieChartProps) {
    const data = useMemo(() => {
        const breakdown = debts.reduce((acc, debt) => {
            const type = debt.type || 'other';
            if (!acc[type]) {
                acc[type] = { name: type, value: 0, color: DEBT_TYPE_COLORS[type] || DEBT_TYPE_COLORS.other };
            }
            acc[type].value += debt.balance;
            return acc;
        }, {} as Record<string, { name: string; value: number; color: string }>);

        return Object.values(breakdown).sort((a, b) => b.value - a.value);
    }, [debts]);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <DollarSign className="text-indigo-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Debt by Type</h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-gray-700 dark:text-gray-300 capitalize">{item.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            ${item.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
