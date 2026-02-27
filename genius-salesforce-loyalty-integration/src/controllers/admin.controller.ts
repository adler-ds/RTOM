import { Router, Request, Response, NextFunction } from 'express';
import { QueueService } from '../services/queue.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

export class AdminController {
  public router: Router;
  private queueService: QueueService;

  constructor(queueService: QueueService) {
    this.router = Router();
    this.queueService = queueService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/queue/stats', this.getQueueStats.bind(this));
    this.router.get('/queue/job/:jobId', this.getJobStatus.bind(this));
    this.router.post('/sync/historical', this.triggerHistoricalSync.bind(this));
  }

  private async getQueueStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.queueService.getQueueStats();
      res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      logger.error('Error fetching queue stats', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  private async getJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const status = await this.queueService.getJobStatus(jobId);
      
      res.json({
        success: true,
        job: status,
      });
    } catch (error: any) {
      logger.error('Error fetching job status', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  private async triggerHistoricalSync(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const schema = Joi.object({
        startDate: Joi.string().isoDate().required(),
        endDate: Joi.string().isoDate().required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const jobId = await this.queueService.addHistoricalSync(
        value.startDate,
        value.endDate
      );

      res.json({
        success: true,
        message: 'Historical sync job created',
        jobId,
      });
    } catch (error: any) {
      logger.error('Error triggering historical sync', { error: error.message });
      next(error);
    }
  }
}
