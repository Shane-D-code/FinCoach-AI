import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction, TransactionSummary, TransactionFilters } from '../types/transaction';

export const useTransactions = (filters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAll(filters);
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction = await transactionService.create(transaction);
    if (newTransaction) {
      setTransactions(prev => [newTransaction, ...prev]);
      return true;
    }
    return false;
  };

  const updateTransaction = async (id: number, updates: Partial<Transaction>) => {
    const updated = await transactionService.update(id, updates);
    if (updated) {
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
      return true;
    }
    return false;
  };

  const deleteTransaction = async (id: number) => {
    const success = await transactionService.delete(id);
    if (success) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      return true;
    }
    return false;
  };

  const refresh = () => {
    fetchTransactions();
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh
  };
};

export const useTransactionSummary = (months: number = 6) => {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getSummary(months);
      setSummary(data);
    } catch (err) {
      setError('Failed to load transaction summary');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary
  };
};
