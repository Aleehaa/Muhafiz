import { Router } from 'express';
import { HealthController } from './health.controller';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Liveness health check returning system uptime and environment
 * @access  Public
 */
router.get('/', HealthController.getHealth);

/**
 * @route   GET /api/v1/health/ready
 * @desc    Readiness check verifying active PostgreSQL database connectivity
 * @access  Public
 */
router.get('/ready', HealthController.getReadiness);

export default router;
