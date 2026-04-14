import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { UserProfile, UserFinancialProfile } from '../types/user';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await userService.updateProfile(updates);
    if (updated) {
      setProfile(updated);
      return true;
    }
    return false;
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refresh: fetchProfile
  };
};

export const useFinancialProfile = () => {
  const [financialProfile, setFinancialProfile] = useState<UserFinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getFinancialProfile();
      setFinancialProfile(data);
    } catch (err) {
      setError('Failed to load financial profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialProfile();
  }, [fetchFinancialProfile]);

  return {
    financialProfile,
    loading,
    error,
    refresh: fetchFinancialProfile
  };
};
