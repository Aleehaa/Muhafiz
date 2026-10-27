import { request } from './apiClient';
import {
  HealthResponse,
  healthResponseSchema,
  ReadinessResponse,
  readinessResponseSchema,
} from '../models/health.model';

export class HealthService {
  /**
   * Calls GET /api/v1/health and validates the response payload
   */
  public static async checkHealth(): Promise<HealthResponse> {
    const data = await request<unknown>('/health');
    const parsed = healthResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error('Invalid health response format:', parsed.error);
      throw new Error('Health check returned an unexpected payload structure');
    }

    return parsed.data;
  }

  /**
   * Calls GET /api/v1/health/ready to verify database readiness
   */
  public static async checkReadiness(): Promise<ReadinessResponse> {
    const data = await request<unknown>('/health/ready');
    const parsed = readinessResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error('Invalid readiness response format:', parsed.error);
      throw new Error('Readiness check returned an unexpected payload structure');
    }

    return parsed.data;
  }
}
