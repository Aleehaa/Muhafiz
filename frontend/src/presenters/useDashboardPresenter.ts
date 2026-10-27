import { useState, useEffect, useCallback } from 'react';
import { DashboardMetrics } from '../models/dashboard.model';
import { CaseService } from '../services/case.service';

export interface DashboardPresenter {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

export function useDashboardPresenter(): DashboardPresenter {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CaseService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshDashboard();
  }, [refreshDashboard]);

  return {
    metrics,
    isLoading,
    error,
    refreshDashboard,
  };
}
