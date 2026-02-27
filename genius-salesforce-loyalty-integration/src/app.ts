import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { IntegrationService } from './services/integration.service';
import { QueueService } from './services/queue.service';
import { WebhookController } from './controllers/webhook.controller';
import { LoyaltyController } from './controllers/loyalty.controller';
import { AdminController } from './controllers/admin.controller';
import { logger } from './utils/logger';
import { config, validateConfig } from './config/config';

export class App {
  public app: Express;
  private integrationService: IntegrationService;
  private queueService: QueueService;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.integrationService = new IntegrationService();
    this.queueService = new QueueService(this.integrationService);
  }

  async initialize(): Promise<void> {
    try {
      validateConfig();
      
      await this.integrationService.initialize();
      
      this.setupMiddleware();
      this.setupRoutes();
      this.setupErrorHandling();
      
      logger.info('Application initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize application', { error: error.message });
      throw error;
    }
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    this.app.use(bodyParser.json({ limit: '10mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    });

    this.app.use('/api/', limiter);

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
      });
      next();
    });
  }

  private setupRoutes(): void {
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        service: 'Genius POS to Salesforce Loyalty Integration',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
      });
    });

    const webhookController = new WebhookController(
      this.integrationService,
      this.queueService
    );
    this.app.use('/api/webhooks', webhookController.router);

    const loyaltyController = new LoyaltyController(this.integrationService);
    this.app.use('/api/loyalty', loyaltyController.router);

    const adminController = new AdminController(this.queueService);
    this.app.use('/api/admin', adminController.router);

    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });

      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message,
      });
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        logger.info(`Server started on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        resolve();
      });
    });
  }

  public async shutdown(): Promise<void> {
    logger.info('Shutting down application');
    await this.queueService.shutdown();
    logger.info('Application shut down successfully');
  }
}
