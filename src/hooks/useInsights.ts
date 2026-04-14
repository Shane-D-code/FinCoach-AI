import { useState, useEffect, useCallback } from 'react';
import { insightsService } from '../services/insightsService';
import { Insight, FinancialHealthScore } from '../types/insights';

export const useInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insightsService.getInsights();
      setInsights(data);
    } catch (err) {
      setError('Failed to load insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const markAsRead = async (insightId: string) => {
    const success = await insightsService.markAsRead(insightId);
    if (success) {
      setInsights(prev => prev.map(i => i.id === insightId ? { ...i, read: true } : i));
    }
    return success;
  };

  const generateNew = async () => {
    const newInsights = await insightsService.generateInsights();
    if (newInsights.length > 0) {
      setInsights(prev => [...newInsights, ...prev]);
    }
    return newInsights;
  };

  return {
    insights,
    loading,
    error,
    markAsRead,
    generateNew,
    refresh: fetchInsights
  };
};

export const useHealthScore = () => {
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthScore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insightsService.getHealthScore();
      setHealthScore(data);
    } catch (err) {
      setError('Failed to load health score');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthScore();
  }, [fetchHealthScore]);

  return {
    healthScore,
    loading,
    error,
    refresh: fetchHealthScore
  };
};
