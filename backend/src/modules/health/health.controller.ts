import { Request, Response, NextFunction } from 'express';
import { HealthService } from './health.service';

export class HealthController {
  public static getHealth(_req: Request, res: Response, next: NextFunction): void {
    try {
      const healthData = HealthService.getHealth();
      res.status(200).json(healthData);
    } catch (error) {
      next(error);
    }
  }

  public static async getReadiness(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const readinessData = await HealthService.getReadiness();
      const statusCode = readinessData.status === 'ok' ? 200 : 503;
      res.status(statusCode).json(readinessData);
    } catch (error) {
      next(error);
    }
  }
}
