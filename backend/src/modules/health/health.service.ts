import { env } from '../../config/env';
import { checkDatabaseReadiness } from '../../database/prisma';

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  service: string;
}

export interface ReadinessResponse {
  status: 'ok' | 'error';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  database: {
    status: 'ready' | 'disconnected';
    latencyMs?: number;
    error?: string;
  };
}

export class HealthService {
  public static getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'Mohafiz Case Desk API',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  public static async getReadiness(
    checker: (timeoutMs?: number) => Promise<{ isReady: boolean; latencyMs?: number; error?: string }> = checkDatabaseReadiness
  ): Promise<ReadinessResponse> {
    const dbStatus = await checker();

    const isReady = dbStatus.isReady;

    return {
      status: isReady ? 'ok' : 'error',
      service: 'Mohafiz Case Desk API',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: {
        status: isReady ? 'ready' : 'disconnected',
        ...(isReady
          ? { latencyMs: dbStatus.latencyMs }
          : { error: dbStatus.error ?? 'Database is unreachable' }),
      },
    };
  }
}
