import jsforce, { Connection } from 'jsforce';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import {
  SalesforceTransactionJournal,
  SalesforceVoucher,
  LoyaltyProcessResponse,
  MemberLookupResponse,
} from '../types/salesforce.types';

export class SalesforceLoyaltyService {
  private conn: Connection;
  private loyaltyProgramId: string | null = null;

  constructor() {
    this.conn = new jsforce.Connection({
      loginUrl: config.salesforceLoginUrl,
      version: '59.0',
    });
  }

  async connect(): Promise<void> {
    try {
      await this.conn.login(
        config.salesforceUsername,
        config.salesforcePassword + config.salesforceSecurityToken
      );
      logger.info('Successfully connected to Salesforce');
      
      await this.initializeLoyaltyProgram();
    } catch (error: any) {
      logger.error('Failed to connect to Salesforce', { error: error.message });
      throw error;
    }
  }

  private async initializeLoyaltyProgram(): Promise<void> {
    try {
      const result = await this.conn.query(
        `SELECT Id, Name FROM LoyaltyProgram WHERE Name = '${config.loyaltyProgramName}' LIMIT 1`
      );

      if (result.records.length > 0) {
        this.loyaltyProgramId = (result.records[0] as any).Id;
        logger.info('Loyalty program found', {
          programId: this.loyaltyProgramId,
          programName: config.loyaltyProgramName,
        });
      } else {
        throw new Error(`Loyalty program not found: ${config.loyaltyProgramName}`);
      }
    } catch (error: any) {
      logger.error('Error initializing loyalty program', { error: error.message });
      throw error;
    }
  }

  async lookupMemberByPhone(phone: string): Promise<MemberLookupResponse> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      
      const result = await this.conn.query(`
        SELECT 
          Id, MembershipNumber, ContactId, MemberStatus, MemberType,
          Contact.FirstName, Contact.LastName, Contact.Email, Contact.Phone
        FROM LoyaltyProgramMember 
        WHERE Contact.Phone LIKE '%${cleanPhone}%' 
        AND LoyaltyProgramId = '${this.loyaltyProgramId}'
        AND MemberStatus = 'Active'
        LIMIT 1
      `);

      if (result.records.length === 0) {
        return { found: false };
      }

      const member = result.records[0] as any;
      const pointsBalance = await this.getMemberPointsBalance(member.Id);

      return {
        found: true,
        member: {
          memberId: member.Id,
          membershipNumber: member.MembershipNumber,
          firstName: member.Contact?.FirstName,
          lastName: member.Contact?.LastName,
          email: member.Contact?.Email,
          pointsBalance,
          tier: member.MemberType,
          status: member.MemberStatus,
        },
      };
    } catch (error: any) {
      logger.error('Error looking up member by phone', {
        phone,
        error: error.message,
      });
      return {
        found: false,
        error: error.message,
      };
    }
  }

  async lookupMemberByEmail(email: string): Promise<MemberLookupResponse> {
    try {
      const result = await this.conn.query(`
        SELECT 
          Id, MembershipNumber, ContactId, MemberStatus, MemberType,
          Contact.FirstName, Contact.LastName, Contact.Email, Contact.Phone
        FROM LoyaltyProgramMember 
        WHERE Contact.Email = '${email}'
        AND LoyaltyProgramId = '${this.loyaltyProgramId}'
        AND MemberStatus = 'Active'
        LIMIT 1
      `);

      if (result.records.length === 0) {
        return { found: false };
      }

      const member = result.records[0] as any;
      const pointsBalance = await this.getMemberPointsBalance(member.Id);

      return {
        found: true,
        member: {
          memberId: member.Id,
          membershipNumber: member.MembershipNumber,
          firstName: member.Contact?.FirstName,
          lastName: member.Contact?.LastName,
          email: member.Contact?.Email,
          pointsBalance,
          tier: member.MemberType,
          status: member.MemberStatus,
        },
      };
    } catch (error: any) {
      logger.error('Error looking up member by email', {
        email,
        error: error.message,
      });
      return {
        found: false,
        error: error.message,
      };
    }
  }

  async lookupMemberByNumber(membershipNumber: string): Promise<MemberLookupResponse> {
    try {
      const result = await this.conn.query(`
        SELECT 
          Id, MembershipNumber, ContactId, MemberStatus, MemberType,
          Contact.FirstName, Contact.LastName, Contact.Email, Contact.Phone
        FROM LoyaltyProgramMember 
        WHERE MembershipNumber = '${membershipNumber}'
        AND LoyaltyProgramId = '${this.loyaltyProgramId}'
        AND MemberStatus = 'Active'
        LIMIT 1
      `);

      if (result.records.length === 0) {
        return { found: false };
      }

      const member = result.records[0] as any;
      const pointsBalance = await this.getMemberPointsBalance(member.Id);

      return {
        found: true,
        member: {
          memberId: member.Id,
          membershipNumber: member.MembershipNumber,
          firstName: member.Contact?.FirstName,
          lastName: member.Contact?.LastName,
          email: member.Contact?.Email,
          pointsBalance,
          tier: member.MemberType,
          status: member.MemberStatus,
        },
      };
    } catch (error: any) {
      logger.error('Error looking up member by number', {
        membershipNumber,
        error: error.message,
      });
      return {
        found: false,
        error: error.message,
      };
    }
  }

  async getMemberPointsBalance(memberId: string): Promise<number> {
    try {
      const result = await this.conn.query(`
        SELECT SUM(Points) balance
        FROM LoyaltyLedger
        WHERE LoyaltyProgramMemberId = '${memberId}'
        AND (ExpirationDate = NULL OR ExpirationDate > TODAY)
        GROUP BY LoyaltyProgramMemberId
      `);

      if (result.records.length === 0) {
        return 0;
      }

      return (result.records[0] as any).balance || 0;
    } catch (error: any) {
      logger.error('Error getting member points balance', {
        memberId,
        error: error.message,
      });
      return 0;
    }
  }

  async awardPoints(
    memberId: string,
    points: number,
    transactionAmount: number,
    externalTransactionNumber: string
  ): Promise<LoyaltyProcessResponse> {
    try {
      const activityDate = new Date().toISOString();

      const journal: SalesforceTransactionJournal = {
        ActivityDate: activityDate,
        JournalDate: activityDate,
        JournalType: 'Accrual',
        MemberId: memberId,
        LoyaltyProgramId: this.loyaltyProgramId!,
        TransactionAmount: transactionAmount,
        Status: 'Processed',
        ExternalTransactionNumber: externalTransactionNumber,
      };

      const journalResult = await this.conn.sobject('TransactionJournal').create(journal);

      if (!journalResult.success) {
        throw new Error('Failed to create transaction journal');
      }

      const ledger: any = {
        LoyaltyProgramMemberId: memberId,
        TransactionJournalId: journalResult.id,
        ActivityDate: activityDate,
        EventType: 'Credit',
        Points: points,
      };

      const ledgerResult = await this.conn.sobject('LoyaltyLedger').create(ledger) as any;

      if (!ledgerResult.success) {
        throw new Error('Failed to create loyalty ledger entry');
      }

      const newBalance = await this.getMemberPointsBalance(memberId);

      logger.info('Points awarded successfully', {
        memberId,
        points,
        transactionAmount,
        externalTransactionNumber,
        newBalance,
      });

      return {
        success: true,
        transactionId: journalResult.id as string,
        pointsAwarded: points,
        newBalance,
      };
    } catch (error: any) {
      logger.error('Error awarding points', {
        memberId,
        points,
        error: error.message,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async redeemPoints(
    memberId: string,
    points: number,
    externalTransactionNumber: string
  ): Promise<LoyaltyProcessResponse> {
    try {
      const currentBalance = await this.getMemberPointsBalance(memberId);

      if (currentBalance < points) {
        return {
          success: false,
          error: 'Insufficient points balance',
        };
      }

      const activityDate = new Date().toISOString();

      const journal: any = {
        ActivityDate: activityDate,
        JournalDate: activityDate,
        JournalType: 'Redemption',
        MemberId: memberId,
        LoyaltyProgramId: this.loyaltyProgramId!,
        Status: 'Processed',
        ExternalTransactionNumber: externalTransactionNumber,
      };

      const journalResult = await this.conn.sobject('TransactionJournal').create(journal) as any;

      if (!journalResult.success) {
        throw new Error('Failed to create redemption journal');
      }

      const ledger: any = {
        LoyaltyProgramMemberId: memberId,
        TransactionJournalId: journalResult.id,
        ActivityDate: activityDate,
        EventType: 'Debit',
        Points: -points,
      };

      const ledgerResult = await this.conn.sobject('LoyaltyLedger').create(ledger) as any;

      if (!ledgerResult.success) {
        throw new Error('Failed to create redemption ledger entry');
      }

      const newBalance = await this.getMemberPointsBalance(memberId);

      logger.info('Points redeemed successfully', {
        memberId,
        points,
        externalTransactionNumber,
        newBalance,
      });

      return {
        success: true,
        transactionId: journalResult.id as string,
        pointsRedeemed: points,
        newBalance,
      };
    } catch (error: any) {
      logger.error('Error redeeming points', {
        memberId,
        points,
        error: error.message,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createMember(
    contactId: string,
    membershipNumber: string
  ): Promise<string | null> {
    try {
      const member: any = {
        ContactId: contactId,
        LoyaltyProgramId: this.loyaltyProgramId,
        MembershipNumber: membershipNumber,
        MemberStatus: 'Active',
        EnrollmentDate: new Date().toISOString().split('T')[0],
      };

      const result = await this.conn.sobject('LoyaltyProgramMember').create(member) as any;

      if (result.success) {
        logger.info('Loyalty member created', {
          contactId,
          membershipNumber,
          memberId: result.id,
        });
        return result.id as string;
      }

      return null;
    } catch (error: any) {
      logger.error('Error creating loyalty member', {
        contactId,
        error: error.message,
      });
      throw error;
    }
  }

  async getAvailableVouchers(memberId: string): Promise<SalesforceVoucher[]> {
    try {
      const result = await this.conn.query(`
        SELECT Id, VoucherCode, VoucherDefinitionId, Status, 
               EffectiveDate, ExpirationDate, FaceValue, DiscountPercent, Type
        FROM Voucher
        WHERE LoyaltyProgramMemberId = '${memberId}'
        AND Status = 'Issued'
        AND EffectiveDate <= TODAY
        AND (ExpirationDate = NULL OR ExpirationDate >= TODAY)
      `);

      return result.records as SalesforceVoucher[];
    } catch (error: any) {
      logger.error('Error fetching available vouchers', {
        memberId,
        error: error.message,
      });
      return [];
    }
  }

  async redeemVoucher(voucherId: string): Promise<boolean> {
    try {
      const result = await this.conn.sobject('Voucher').update({
        Id: voucherId,
        Status: 'Redeemed',
      });

      return result.success;
    } catch (error: any) {
      logger.error('Error redeeming voucher', {
        voucherId,
        error: error.message,
      });
      return false;
    }
  }
}
