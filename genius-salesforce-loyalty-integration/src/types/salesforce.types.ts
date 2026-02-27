export interface SalesforceLoyaltyMember {
  Id?: string;
  MembershipNumber: string;
  ContactId: string;
  LoyaltyProgramId: string;
  MemberStatus: 'Active' | 'Inactive' | 'Suspended';
  EnrollmentDate: string;
  MemberType?: string;
  TierName?: string;
}

export interface SalesforceLoyaltyTransaction {
  Id?: string;
  ActivityDate: string;
  LoyaltyProgramMemberId: string;
  TransactionJournalId?: string;
  TransactionAmount: number;
  TransactionType: 'Accrual' | 'Redemption' | 'Adjustment';
  Status: 'Pending' | 'Processed' | 'Failed';
  ExternalTransactionNumber?: string;
  TransactionLocation?: string;
}

export interface SalesforceTransactionJournal {
  Id?: string;
  ActivityDate: string;
  JournalDate: string;
  JournalType: 'Accrual' | 'Redemption';
  MemberId: string;
  LoyaltyProgramId: string;
  TransactionAmount: number;
  Status: 'Pending' | 'Processed';
  ExternalTransactionNumber?: string;
}

export interface SalesforceLoyaltyLedger {
  Id?: string;
  LoyaltyProgramMemberId: string;
  TransactionJournalId: string;
  ActivityDate: string;
  EventType: 'Credit' | 'Debit';
  Points: number;
  PointsBalance?: number;
  ExpirationDate?: string;
}

export interface SalesforceVoucher {
  Id?: string;
  VoucherCode: string;
  VoucherDefinitionId: string;
  LoyaltyProgramMemberId: string;
  Status: 'Issued' | 'Redeemed' | 'Expired' | 'Cancelled';
  EffectiveDate: string;
  ExpirationDate?: string;
  FaceValue?: number;
  DiscountPercent?: number;
  Type: 'FixedValue' | 'Percentage' | 'Product';
}

export interface LoyaltyProcessResponse {
  success: boolean;
  transactionId?: string;
  pointsAwarded?: number;
  pointsRedeemed?: number;
  newBalance?: number;
  error?: string;
}

export interface MemberLookupResponse {
  found: boolean;
  member?: {
    memberId: string;
    membershipNumber: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    pointsBalance: number;
    tier?: string;
    status: string;
  };
  error?: string;
}
