export interface IntegrationConfig {
  geniusApiBaseUrl: string;
  geniusApiKey: string;
  geniusStoreId: string;
  geniusTerminalId: string;
  
  salesforceLoginUrl: string;
  salesforceUsername: string;
  salesforcePassword: string;
  salesforceSecurityToken: string;
  salesforceClientId: string;
  salesforceClientSecret: string;
  
  loyaltyProgramName: string;
  currencyIsoCode: string;
  
  pointsPerDollar: number;
  minimumTransactionForPoints: number;
  
  syncIntervalMinutes: number;
  enableRealTimeSync: boolean;
  retryAttempts: number;
  retryDelayMs: number;
  
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
}

export interface WebhookRequest {
  id: string;
  type: string;
  timestamp: string;
  data: any;
}

export interface IntegrationEvent {
  eventId: string;
  eventType: string;
  source: 'genius' | 'salesforce';
  timestamp: Date;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
}

export interface PointsCalculation {
  transactionAmount: number;
  pointsAwarded: number;
  bonusPoints?: number;
  totalPoints: number;
}
