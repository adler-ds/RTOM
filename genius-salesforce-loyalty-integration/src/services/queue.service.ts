import Queue from 'bull';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { IntegrationService } from './integration.service';
import { GeniusTransaction } from '../types/genius.types';

const redisOptions = {
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  ...(config.redisTls && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
};

export class QueueService {
  private transactionQueue: Queue.Queue;
  private integrationService: IntegrationService;

  constructor(integrationService: IntegrationService) {
    this.integrationService = integrationService;

    this.transactionQueue = new Queue('transaction-processing', {
      redis: redisOptions,
      defaultJobOptions: {
        attempts: config.retryAttempts,
        backoff: {
          type: 'exponential',
          delay: config.retryDelayMs,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.setupProcessors();
    this.setupEventHandlers();
  }

  private setupProcessors(): void {
    this.transactionQueue.process('process-transaction', async (job) => {
      const transaction: GeniusTransaction = job.data.transaction;
      
      logger.info('Processing transaction from queue', {
        jobId: job.id,
        transactionId: transaction.transactionId,
        attempt: job.attemptsMade + 1,
      });

      const result = await this.integrationService.processTransaction(transaction);

      if (!result.success) {
        throw new Error(result.error || 'Transaction processing failed');
      }

      return result;
    });

    this.transactionQueue.process('void-transaction', async (job) => {
      const transaction: GeniusTransaction = job.data.transaction;
      
      logger.info('Processing voided transaction from queue', {
        jobId: job.id,
        transactionId: transaction.transactionId,
      });

      await this.integrationService.handleVoidedTransaction(transaction);

      return { success: true };
    });

    this.transactionQueue.process('historical-sync', async (job) => {
      const { startDate, endDate } = job.data;
      
      logger.info('Processing historical sync from queue', {
        jobId: job.id,
        startDate,
        endDate,
      });

      await this.integrationService.syncHistoricalTransactions(startDate, endDate);

      return { success: true };
    });
  }

  private setupEventHandlers(): void {
    this.transactionQueue.on('completed', (job, result) => {
      logger.info('Job completed', {
        jobId: job.id,
        type: job.name,
        result,
      });
    });

    this.transactionQueue.on('failed', (job, error) => {
      logger.error('Job failed', {
        jobId: job?.id,
        type: job?.name,
        error: error.message,
        attempts: job?.attemptsMade,
        data: job?.data,
      });
    });

    this.transactionQueue.on('stalled', (job) => {
      logger.warn('Job stalled', {
        jobId: job.id,
        type: job.name,
      });
    });

    this.transactionQueue.on('error', (error) => {
      logger.error('Queue error', { error: error.message });
    });
  }

  async addTransaction(transaction: GeniusTransaction): Promise<string> {
    const job = await this.transactionQueue.add(
      'process-transaction',
      { transaction },
      {
        priority: transaction.totalAmount >= 100 ? 1 : 5,
      }
    );

    logger.info('Transaction added to queue', {
      jobId: job.id,
      transactionId: transaction.transactionId,
    });

    return job.id?.toString() || '';
  }

  async addVoidedTransaction(transaction: GeniusTransaction): Promise<string> {
    const job = await this.transactionQueue.add(
      'void-transaction',
      { transaction },
      {
        priority: 1,
      }
    );

    logger.info('Voided transaction added to queue', {
      jobId: job.id,
      transactionId: transaction.transactionId,
    });

    return job.id?.toString() || '';
  }

  async addHistoricalSync(startDate: string, endDate: string): Promise<string> {
    const job = await this.transactionQueue.add(
      'historical-sync',
      { startDate, endDate },
      {
        priority: 10,
        timeout: 3600000,
      }
    );

    logger.info('Historical sync added to queue', {
      jobId: job.id,
      startDate,
      endDate,
    });

    return job.id?.toString() || '';
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.transactionQueue.getJob(jobId);
    
    if (!job) {
      return { found: false };
    }

    const state = await job.getState();
    const progress = job.progress();
    const failedReason = job.failedReason;

    return {
      found: true,
      jobId: job.id,
      state,
      progress,
      failedReason,
      data: job.data,
      result: job.returnvalue,
    };
  }

  async getQueueStats(): Promise<any> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.transactionQueue.getWaitingCount(),
      this.transactionQueue.getActiveCount(),
      this.transactionQueue.getCompletedCount(),
      this.transactionQueue.getFailedCount(),
      this.transactionQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down queue service');
    await this.transactionQueue.close();
  }
}
