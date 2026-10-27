import app from './app';
import { env } from './config/env';
import { prisma } from './database/prisma';

const server = app.listen(env.PORT, () => {
  console.log(`===============================================`);
  console.log(`🛡️  Mohafiz Case Desk Backend API`);
  console.log(`🚀 Server listening on http://localhost:${env.PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health Check: http://localhost:${env.PORT}/api/v1/health`);
  console.log(`🔗 DB Readiness: http://localhost:${env.PORT}/api/v1/health/ready`);
  console.log(`===============================================`);
});

// Graceful shutdown handling
const handleGracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down HTTP server and database pool...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database client disconnected.');
    } catch (e) {
      console.error('Error disconnecting Prisma client:', e);
    }
    console.log('HTTP server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => void handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void handleGracefulShutdown('SIGINT'));

export default server;
