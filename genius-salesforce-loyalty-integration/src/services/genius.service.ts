import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { GeniusTransaction, GeniusCustomer } from '../types/genius.types';

export class GeniusPOSService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.geniusApiBaseUrl,
      headers: {
        'Authorization': `Bearer ${config.geniusApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Genius API Request', {
          method: config.method,
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error) => {
        logger.error('Genius API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Genius API Response', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        logger.error('Genius API Response Error', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  async getTransaction(transactionId: string): Promise<GeniusTransaction | null> {
    try {
      const response = await this.client.get(`/transactions/${transactionId}`, {
        params: {
          storeId: config.geniusStoreId,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.warn(`Transaction not found: ${transactionId}`);
        return null;
      }
      logger.error('Error fetching transaction from Genius POS', {
        transactionId,
        error: error.message,
      });
      throw error;
    }
  }

  async getTransactionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<GeniusTransaction[]> {
    try {
      const response = await this.client.get('/transactions', {
        params: {
          storeId: config.geniusStoreId,
          startDate,
          endDate,
          status: 'completed',
        },
      });
      return response.data.transactions || [];
    } catch (error: any) {
      logger.error('Error fetching transactions by date range', {
        startDate,
        endDate,
        error: error.message,
      });
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<GeniusCustomer | null> {
    try {
      const response = await this.client.get(`/customers/${customerId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.warn(`Customer not found: ${customerId}`);
        return null;
      }
      logger.error('Error fetching customer from Genius POS', {
        customerId,
        error: error.message,
      });
      throw error;
    }
  }

  async lookupCustomerByPhone(phone: string): Promise<GeniusCustomer | null> {
    try {
      const response = await this.client.get('/customers/search', {
        params: {
          phone,
        },
      });
      return response.data.customers?.[0] || null;
    } catch (error: any) {
      logger.error('Error looking up customer by phone', {
        phone,
        error: error.message,
      });
      throw error;
    }
  }

  async lookupCustomerByEmail(email: string): Promise<GeniusCustomer | null> {
    try {
      const response = await this.client.get('/customers/search', {
        params: {
          email,
        },
      });
      return response.data.customers?.[0] || null;
    } catch (error: any) {
      logger.error('Error looking up customer by email', {
        email,
        error: error.message,
      });
      throw error;
    }
  }

  async updateCustomerLoyaltyNumber(
    customerId: string,
    loyaltyNumber: string
  ): Promise<void> {
    try {
      await this.client.patch(`/customers/${customerId}`, {
        loyaltyNumber,
      });
      logger.info('Updated customer loyalty number', { customerId, loyaltyNumber });
    } catch (error: any) {
      logger.error('Error updating customer loyalty number', {
        customerId,
        error: error.message,
      });
      throw error;
    }
  }

  async applyDiscount(
    transactionId: string,
    discountAmount: number,
    discountReason: string
  ): Promise<void> {
    try {
      await this.client.post(`/transactions/${transactionId}/discounts`, {
        amount: discountAmount,
        reason: discountReason,
        type: 'loyalty_redemption',
      });
      logger.info('Applied discount to transaction', {
        transactionId,
        discountAmount,
      });
    } catch (error: any) {
      logger.error('Error applying discount', {
        transactionId,
        error: error.message,
      });
      throw error;
    }
  }
}
