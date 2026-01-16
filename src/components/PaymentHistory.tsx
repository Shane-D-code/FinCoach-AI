import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Calendar, DollarSign, TrendingDown, Filter,
    Download, Search, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';

interface DebtPayment {
    id: number;
    debtId: number;
    debtName: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    interestPaid: number;
    principalPaid: number;
    paymentDate: string;
    paymentMethod?: string;
    notes?: string;
    isAutomatic?: boolean;
}

interface PaymentHistoryProps {
    payments: DebtPayment[];
    className?: string;
}

type FilterType = 'all' | 'week' | 'month' | '3months' | 'year';
type SortField = 'date' | 'amount' | 'principal';
type SortOrder = 'asc' | 'desc';

export default function PaymentHistory({ payments, className = '' }: PaymentHistoryProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [expandedPayment, setExpandedPayment] = useState<number | null>(null);

    // Filter payments by date range
    const filteredPayments = useMemo(() => {
        const now = new Date();
        let filtered = payments;

        // Date filter
        if (filter !== 'all') {
            const cutoffDate = new Date();
            switch (filter) {
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case '3months':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
                case 'year':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            filtered = filtered.filter(p => new Date(p.paymentDate) >= cutoffDate);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.debtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.notes?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    comparison = new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
                    break;
                case 'amount':
                    comparison = a.amount - b.amount;
                    break;
                case 'principal':
                    comparison = a.principalPaid - b.principalPaid;
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [payments, filter, searchTerm, sortField, sortOrder]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalPaid = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalPrincipal = filteredPayments.reduce((sum, p) => sum + p.principalPaid, 0);
        const totalInterest = filteredPayments.reduce((sum, p) => sum + p.interestPaid, 0);
        const avgPayment = filteredPayments.length > 0 ? totalPaid / filteredPayments.length : 0;

        return { totalPaid, totalPrincipal, totalInterest, avgPayment };
    }, [filteredPayments]);

    // Export to CSV
    const handleExport = () => {
        const headers = ['Date', 'Debt', 'Amount', 'Principal', 'Interest', 'Balance Before', 'Balance After', 'Method', 'Notes'];
        const rows = filteredPayments.map(p => [
            new Date(p.paymentDate).toLocaleDateString(),
            p.debtName,
            p.amount.toFixed(2),
            p.principalPaid.toFixed(2),
            p.interestPaid.toFixed(2),
            p.balanceBefore.toFixed(2),
            p.balanceAfter.toFixed(2),
            p.paymentMethod || '',
            p.notes || ''
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (payments.length === 0) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center ${className}`}>
                <History className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Payment History</h3>
                <p className="text-gray-500 dark:text-gray-400">Make your first payment to see it here!</p>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <History className="text-blue-500" size={24} />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment History</h2>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Paid</div>
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(stats.totalPaid)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400 mb-1">Principal</div>
                        <div className="text-xl font-bold text-green-900 dark:text-green-100">{formatCurrency(stats.totalPrincipal)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
                        <div className="text-sm text-red-600 dark:text-red-400 mb-1">Interest</div>
                        <div className="text-xl font-bold text-red-900 dark:text-red-100">{formatCurrency(stats.totalInterest)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Avg Payment</div>
                        <div className="text-xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(stats.avgPayment)}</div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by debt name or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-400" size={18} />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as FilterType)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Time</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last Month</option>
                            <option value="3months">Last 3 Months</option>
                            <option value="year">Last Year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Payment List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {filteredPayments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No payments found matching your filters.
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredPayments.map((payment, index) => (
                            <motion.div
                                key={payment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setExpandedPayment(expandedPayment === payment.id ? null : payment.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{payment.debtName}</h4>
                                                {payment.isAutomatic && (
                                                    <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                                        Auto
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {formatDate(payment.paymentDate)}
                                                </span>
                                                {payment.paymentMethod && (
                                                    <span>• {payment.paymentMethod}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right mr-4">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(payment.amount)}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Principal: {formatCurrency(payment.principalPaid)}
                                        </div>
                                    </div>

                                    {expandedPayment === payment.id ? (
                                        <ChevronUp className="text-gray-400" size={20} />
                                    ) : (
                                        <ChevronDown className="text-gray-400" size={20} />
                                    )}
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedPayment === payment.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 pl-16 grid grid-cols-2 md:grid-cols-4 gap-4"
                                        >
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Interest Paid</div>
                                                <div className="font-semibold text-red-600">{formatCurrency(payment.interestPaid)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance Before</div>
                                                <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(payment.balanceBefore)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance After</div>
                                                <div className="font-semibold text-green-600">{formatCurrency(payment.balanceAfter)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reduction</div>
                                                <div className="font-semibold text-blue-600">
                                                    {formatCurrency(payment.balanceBefore - payment.balanceAfter)}
                                                </div>
                                            </div>
                                            {payment.notes && (
                                                <div className="col-span-2 md:col-span-4">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</div>
                                                    <div className="text-sm text-gray-700 dark:text-gray-300">{payment.notes}</div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
