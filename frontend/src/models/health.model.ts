import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  version: z.string(),
  environment: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const readinessResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  service: z.string(),
  version: z.string(),
  environment: z.string(),
  timestamp: z.string(),
  database: z.object({
    status: z.enum(['ready', 'disconnected']),
    latencyMs: z.number().optional(),
    error: z.string().optional(),
  }),
});

export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;

export type ConnectionState = 'idle' | 'checking' | 'connected' | 'error';

export interface HealthViewModel {
  connectionState: ConnectionState;
  data: HealthResponse | null;
  readiness: ReadinessResponse | null;
  error: string | null;
  latencyMs: number | null;
  lastChecked: Date | null;
  apiBaseUrl: string;
}
