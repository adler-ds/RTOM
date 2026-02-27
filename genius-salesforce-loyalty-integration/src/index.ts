import { App } from './app';
import { logger } from './utils/logger';
import fs from 'fs';
import path from 'path';

const logDir = process.env.LOG_FILE_PATH || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

async function main() {
  const app = new App();

  try {
    await app.initialize();
    await app.start();

    logger.info('Genius POS to Salesforce Loyalty Integration Service Running');
  } catch (error: any) {
    logger.error('Failed to start application', { error: error.message });
    process.exit(1);
  }

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received');
    await app.shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT signal received');
    await app.shutdown();
    process.exit(0);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

main();
