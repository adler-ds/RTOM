import { GeniusPOSService } from './genius.service';
import { SalesforceLoyaltyService } from './salesforce.service';
import { logger } from '../utils/logger';
import { config } from '../config/config';
import { GeniusTransaction } from '../types/genius.types';
import { PointsCalculation } from '../types/integration.types';
import { LoyaltyProcessResponse } from '../types/salesforce.types';

export class IntegrationService {
  private geniusService: GeniusPOSService;
  private salesforceService: SalesforceLoyaltyService;

  constructor() {
    this.geniusService = new GeniusPOSService();
    this.salesforceService = new SalesforceLoyaltyService();
  }

  async initialize(): Promise<void> {
    try {
      await this.salesforceService.connect();
      logger.info('Integration service initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize integration service', {
        error: error.message,
      });
      throw error;
    }
  }

  calculatePoints(transactionAmount: number): PointsCalculation {
    const basePoints = Math.floor(transactionAmount * config.pointsPerDollar);
    
    let bonusPoints = 0;
    if (transactionAmount >= 50) {
      bonusPoints = 50;
    } else if (transactionAmount >= 25) {
      bonusPoints = 25;
    }

    return {
      transactionAmount,
      pointsAwarded: basePoints,
      bonusPoints: bonusPoints > 0 ? bonusPoints : undefined,
      totalPoints: basePoints + bonusPoints,
    };
  }

  async processTransaction(transaction: GeniusTransaction): Promise<LoyaltyProcessResponse> {
    try {
      logger.info('Processing transaction for loyalty', {
        transactionId: transaction.transactionId,
        amount: transaction.totalAmount,
      });

      if (transaction.status !== 'completed') {
        logger.warn('Transaction not completed, skipping', {
          transactionId: transaction.transactionId,
          status: transaction.status,
        });
        return {
          success: false,
          error: 'Transaction not completed',
        };
      }

      if (transaction.totalAmount < config.minimumTransactionForPoints) {
        logger.info('Transaction below minimum for points', {
          transactionId: transaction.transactionId,
          amount: transaction.totalAmount,
          minimum: config.minimumTransactionForPoints,
        });
        return {
          success: false,
          error: 'Transaction below minimum amount',
        };
      }

      let memberLookup;
      
      if (transaction.customerPhone) {
        memberLookup = await this.salesforceService.lookupMemberByPhone(
          transaction.customerPhone
        );
      } else if (transaction.customerEmail) {
        memberLookup = await this.salesforceService.lookupMemberByEmail(
          transaction.customerEmail
        );
      } else if (transaction.customerId) {
        const customer = await this.geniusService.getCustomer(transaction.customerId);
        if (customer?.phone) {
          memberLookup = await this.salesforceService.lookupMemberByPhone(customer.phone);
        } else if (customer?.email) {
          memberLookup = await this.salesforceService.lookupMemberByEmail(customer.email);
        }
      }

      if (!memberLookup || !memberLookup.found) {
        logger.warn('Loyalty member not found for transaction', {
          transactionId: transaction.transactionId,
        });
        return {
          success: false,
          error: 'Loyalty member not found',
        };
      }

      const member = memberLookup.member!;
      const pointsCalc = this.calculatePoints(transaction.totalAmount);

      const result = await this.salesforceService.awardPoints(
        member.memberId,
        pointsCalc.totalPoints,
        transaction.totalAmount,
        transaction.transactionId
      );

      if (result.success && transaction.customerId && member.membershipNumber) {
        try {
          await this.geniusService.updateCustomerLoyaltyNumber(
            transaction.customerId,
            member.membershipNumber
          );
        } catch (error) {
          logger.warn('Failed to update customer loyalty number in POS', {
            customerId: transaction.customerId,
          });
        }
      }

      logger.info('Transaction processed successfully', {
        transactionId: transaction.transactionId,
        memberId: member.memberId,
        pointsAwarded: pointsCalc.totalPoints,
        newBalance: result.newBalance,
      });

      return result;
    } catch (error: any) {
      logger.error('Error processing transaction', {
        transactionId: transaction.transactionId,
        error: error.message,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async handleVoidedTransaction(transaction: GeniusTransaction): Promise<void> {
    try {
      logger.info('Handling voided transaction', {
        transactionId: transaction.transactionId,
      });

      let memberLookup;
      
      if (transaction.customerPhone) {
        memberLookup = await this.salesforceService.lookupMemberByPhone(
          transaction.customerPhone
        );
      } else if (transaction.customerEmail) {
        memberLookup = await this.salesforceService.lookupMemberByEmail(
          transaction.customerEmail
        );
      }

      if (!memberLookup || !memberLookup.found) {
        logger.warn('Member not found for voided transaction', {
          transactionId: transaction.transactionId,
        });
        return;
      }

      const pointsCalc = this.calculatePoints(transaction.totalAmount);
      
      await this.salesforceService.redeemPoints(
        memberLookup.member!.memberId,
        pointsCalc.totalPoints,
        `VOID-${transaction.transactionId}`
      );

      logger.info('Voided transaction processed, points reversed', {
        transactionId: transaction.transactionId,
        pointsReversed: pointsCalc.totalPoints,
      });
    } catch (error: any) {
      logger.error('Error handling voided transaction', {
        transactionId: transaction.transactionId,
        error: error.message,
      });
    }
  }

  async syncHistoricalTransactions(startDate: string, endDate: string): Promise<void> {
    try {
      logger.info('Starting historical transaction sync', { startDate, endDate });

      const transactions = await this.geniusService.getTransactionsByDateRange(
        startDate,
        endDate
      );

      logger.info(`Found ${transactions.length} transactions to sync`);

      let processed = 0;
      let failed = 0;

      for (const transaction of transactions) {
        const result = await this.processTransaction(transaction);
        
        if (result.success) {
          processed++;
        } else {
          failed++;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      logger.info('Historical sync completed', {
        total: transactions.length,
        processed,
        failed,
      });
    } catch (error: any) {
      logger.error('Error syncing historical transactions', {
        error: error.message,
      });
      throw error;
    }
  }

  async lookupMember(identifier: string, type: 'phone' | 'email' | 'number') {
    switch (type) {
      case 'phone':
        return this.salesforceService.lookupMemberByPhone(identifier);
      case 'email':
        return this.salesforceService.lookupMemberByEmail(identifier);
      case 'number':
        return this.salesforceService.lookupMemberByNumber(identifier);
      default:
        throw new Error(`Unknown lookup type: ${type}`);
    }
  }

  async getAvailableVouchers(memberId: string) {
    return this.salesforceService.getAvailableVouchers(memberId);
  }

  async redeemVoucher(voucherId: string, transactionId: string): Promise<boolean> {
    try {
      const success = await this.salesforceService.redeemVoucher(voucherId);
      
      if (success) {
        logger.info('Voucher redeemed successfully', {
          voucherId,
          transactionId,
        });
      }
      
      return success;
    } catch (error: any) {
      logger.error('Error redeeming voucher', {
        voucherId,
        transactionId,
        error: error.message,
      });
      return false;
    }
  }
}
