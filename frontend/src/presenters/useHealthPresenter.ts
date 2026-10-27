import { useState, useCallback, useEffect } from 'react';
import {
  HealthViewModel,
  HealthResponse,
  ReadinessResponse,
  ConnectionState,
} from '../models/health.model';
import { HealthService } from '../services/health.service';
import { API_BASE_URL } from '../services/apiClient';

export interface HealthPresenter {
  viewModel: HealthViewModel;
  checkHealth: () => Promise<void>;
}

export function useHealthPresenter(autoCheck = true): HealthPresenter {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [data, setData] = useState<HealthResponse | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setConnectionState('checking');
    setError(null);
    const startTime = performance.now();

    try {
      const [healthRes, readinessRes] = await Promise.all([
        HealthService.checkHealth(),
        HealthService.checkReadiness().catch((err) => {
          console.warn('Readiness check probe warning:', err);
          return null;
        }),
      ]);

      const elapsed = Math.round(performance.now() - startTime);

      setData(healthRes);
      setReadiness(readinessRes);
      setLatencyMs(elapsed);
      setLastChecked(new Date());
      setConnectionState('connected');
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : 'Unknown connection error';

      setLatencyMs(elapsed);
      setLastChecked(new Date());
      setError(message);
      setConnectionState('error');
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      void checkHealth();
    }
  }, [autoCheck, checkHealth]);

  const viewModel: HealthViewModel = {
    connectionState,
    data,
    readiness,
    error,
    latencyMs,
    lastChecked,
    apiBaseUrl: API_BASE_URL,
  };

  return {
    viewModel,
    checkHealth,
  };
}
