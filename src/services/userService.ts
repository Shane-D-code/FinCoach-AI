import api from './api';
import { UserProfile, UserFinancialProfile } from '../types/user';

export const userService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const response = await api.get('/user/profile');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  },

  /**
   * Get complete financial profile with stats
   */
  getFinancialProfile: async (): Promise<UserFinancialProfile | null> => {
    try {
      const response = await api.get('/user/financial-profile');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to fetch financial profile:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const response = await api.put('/user/profile', updates);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return null;
    }
  },

  /**
   * Update financial settings
   */
  updateFinancialSettings: async (settings: {
    monthlyIncome?: number;
    incomeType?: string;
    riskProfile?: string;
  }): Promise<boolean> => {
    try {
      await api.put('/user/financial-settings', settings);
      return true;
    } catch (error) {
      console.error('Failed to update financial settings:', error);
      return false;
    }
  }
};
