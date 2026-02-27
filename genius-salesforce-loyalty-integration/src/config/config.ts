import dotenv from 'dotenv';
import { IntegrationConfig } from '../types/integration.types';

dotenv.config();

function parseRedisUrl(redisUrl?: string): { host?: string; port?: string; password?: string } {
  if (!redisUrl) {
    return {};
  }
  
  try {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: url.port,
      password: url.password || undefined,
    };
  } catch (error) {
    return {};
  }
}

export const config: IntegrationConfig = {
  geniusApiBaseUrl: process.env.GENIUS_API_BASE_URL || 'https://api.xenial.com/v1',
  geniusApiKey: process.env.GENIUS_API_KEY || '',
  geniusStoreId: process.env.GENIUS_STORE_ID || '',
  geniusTerminalId: process.env.GENIUS_TERMINAL_ID || '',
  
  salesforceLoginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com',
  salesforceUsername: process.env.SALESFORCE_USERNAME || '',
  salesforcePassword: process.env.SALESFORCE_PASSWORD || '',
  salesforceSecurityToken: process.env.SALESFORCE_SECURITY_TOKEN || '',
  salesforceClientId: process.env.SALESFORCE_CLIENT_ID || '',
  salesforceClientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
  
  loyaltyProgramName: process.env.SALESFORCE_LOYALTY_PROGRAM_NAME || 'Rewards Program',
  currencyIsoCode: process.env.SALESFORCE_CURRENCY_ISO_CODE || 'USD',
  
  pointsPerDollar: parseInt(process.env.POINTS_PER_DOLLAR || '10', 10),
  minimumTransactionForPoints: parseFloat(process.env.MINIMUM_TRANSACTION_FOR_POINTS || '1.00'),
  
  syncIntervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES || '5', 10),
  enableRealTimeSync: process.env.ENABLE_REAL_TIME_SYNC === 'true',
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
  retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
  
  redisHost: process.env.REDIS_HOST || parseRedisUrl(process.env.REDIS_URL).host || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || parseRedisUrl(process.env.REDIS_URL).port || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || parseRedisUrl(process.env.REDIS_URL).password,
  redisTls: process.env.REDIS_URL?.startsWith('rediss://') ? true : undefined,
};

export function validateConfig(): void {
  const requiredFields: (keyof IntegrationConfig)[] = [
    'geniusApiKey',
    'geniusStoreId',
    'salesforceUsername',
    'salesforcePassword',
    'salesforceClientId',
    'salesforceClientSecret',
  ];

  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration: ${missingFields.join(', ')}`);
  }
}
