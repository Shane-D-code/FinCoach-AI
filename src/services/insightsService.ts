import api from './api';
import { Insight, FinancialHealthScore, AIAdvice } from '../types/insights';

export const insightsService = {
  /**
   * Get AI-generated financial insights
   */
  getInsights: async (): Promise<Insight[]> => {
    try {
      const response = await api.get('/insights');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      return [];
    }
  },

  /**
   * Get financial health score
   */
  getHealthScore: async (): Promise<FinancialHealthScore> => {
    try {
      const response = await api.get('/insights/health-score');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to fetch health score:', error);
      // Return default score
      return {
        overall: 0,
        breakdown: {
          savingsRatio: 0,
          debtRatio: 0,
          spendingBehavior: 0,
          emergencyFund: 0
        },
        grade: 'poor',
        color: '#EF4444',
        recommendations: ['Upload your transactions to get started']
      };
    }
  },

  /**
   * Mark insight as read
   */
  markAsRead: async (insightId: string): Promise<boolean> => {
    try {
      await api.put(`/insights/${insightId}/read`);
      return true;
    } catch (error) {
      console.error('Failed to mark insight as read:', error);
      return false;
    }
  },

  /**
   * Get AI financial advice
   */
  getAdvice: async (question: string): Promise<AIAdvice | null> => {
    try {
      const response = await api.post('/insights/advice', { question });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to get AI advice:', error);
      return null;
    }
  },

  /**
   * Generate insights based on recent activity
   */
  generateInsights: async (): Promise<Insight[]> => {
    try {
      const response = await api.post('/insights/generate');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to generate insights:', error);
      return [];
    }
  }
};
