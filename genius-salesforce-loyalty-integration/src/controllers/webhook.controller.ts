import { Router, Request, Response, NextFunction } from 'express';
import { IntegrationService } from '../services/integration.service';
import { QueueService } from '../services/queue.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

export class WebhookController {
  public router: Router;
  private integrationService: IntegrationService;
  private queueService: QueueService;

  constructor(integrationService: IntegrationService, queueService: QueueService) {
    this.router = Router();
    this.integrationService = integrationService;
    this.queueService = queueService;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/genius/transaction', this.handleGeniusTransaction.bind(this));
    this.router.post('/genius/void', this.handleGeniusVoid.bind(this));
    this.router.get('/health', this.healthCheck.bind(this));
  }

  private async handleGeniusTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const schema = Joi.object({
        eventType: Joi.string().required(),
        eventId: Joi.string().required(),
        timestamp: Joi.string().required(),
        data: Joi.object({
          transactionId: Joi.string().required(),
          storeId: Joi.string().required(),
          totalAmount: Joi.number().required(),
          status: Joi.string().required(),
        }).unknown(true).required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      logger.info('Received Genius transaction webhook', {
        eventId: value.eventId,
        transactionId: value.data.transactionId,
      });

      const jobId = await this.queueService.addTransaction(value.data);

      res.status(202).json({
        success: true,
        message: 'Transaction queued for processing',
        jobId,
      });
    } catch (error: any) {
      logger.error('Error handling Genius transaction webhook', {
        error: error.message,
      });
      next(error);
    }
  }

  private async handleGeniusVoid(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const schema = Joi.object({
        eventType: Joi.string().required(),
        eventId: Joi.string().required(),
        timestamp: Joi.string().required(),
        data: Joi.object({
          transactionId: Joi.string().required(),
        }).unknown(true).required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      logger.info('Received Genius void webhook', {
        eventId: value.eventId,
        transactionId: value.data.transactionId,
      });

      const jobId = await this.queueService.addVoidedTransaction(value.data);

      res.status(202).json({
        success: true,
        message: 'Void transaction queued for processing',
        jobId,
      });
    } catch (error: any) {
      logger.error('Error handling Genius void webhook', {
        error: error.message,
      });
      next(error);
    }
  }

  private async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const queueStats = await this.queueService.getQueueStats();

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        queue: queueStats,
      });
    } catch (error: any) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  }
}
