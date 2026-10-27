import { PrismaClient } from '@prisma/client';

/**
 * Mohafiz Case Desk - Prisma Database Client
 * Configured for PostgreSQL 17 via Prisma ORM
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export interface DatabaseReadinessResult {
  isReady: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Tests database connectivity by executing a fast lightweight query (SELECT 1).
 * Includes timeout protection to prevent hanging requests when the database is unreachable.
 */
export async function checkDatabaseReadiness(timeoutMs = 5000): Promise<DatabaseReadinessResult> {
  const start = Date.now();

  const queryPromise = prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Database health check timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    await Promise.race([queryPromise, timeoutPromise]);
    const latencyMs = Date.now() - start;
    return {
      isReady: true,
      latencyMs,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database query failed';
    return {
      isReady: false,
      error: message.includes('timed out') ? 'Connection timed out' : 'Database connection error',
    };
  }
}

export default prisma;
