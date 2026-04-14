import api from './api';
import { Transaction, TransactionSummary, TransactionFilters } from '../types/transaction';

export const transactionService = {
  /**
   * Get all transactions for the current user
   */
  getAll: async (filters?: TransactionFilters): Promise<Transaction[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.type) params.append('type', filters.type);
      
      const response = await api.get(`/transactions?${params.toString()}`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  },

  /**
   * Get transaction summary with analytics
   */
  getSummary: async (months: number = 6): Promise<TransactionSummary> => {
    try {
      const response = await api.get(`/transactions/summary?months=${months}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to fetch transaction summary:', error);
      // Return default structure
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        categoryBreakdown: [],
        monthlyTrend: []
      };
    }
  },

  /**
   * Add a new transaction
   */
  create: async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Transaction | null> => {
    try {
      const response = await api.post('/transactions', transaction);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      return null;
    }
  },

  /**
   * Update an existing transaction
   */
  update: async (id: number, updates: Partial<Transaction>): Promise<Transaction | null> => {
    try {
      const response = await api.put(`/transactions/${id}`, updates);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to update transaction:', error);
      return null;
    }
  },

  /**
   * Delete a transaction
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/transactions/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      return false;
    }
  },

  /**
   * Bulk create transactions (from upload)
   */
  bulkCreate: async (transactions: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]): Promise<Transaction[]> => {
    try {
      const response = await api.post('/transactions/bulk', { transactions });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to bulk create transactions:', error);
      return [];
    }
  }
};
