/**
 * Example POS Terminal Client for Genius Loyalty Integration
 * 
 * This demonstrates how to integrate the loyalty service into a POS terminal
 */

import axios, { AxiosInstance } from 'axios';

interface LoyaltyMember {
  memberId: string;
  membershipNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  pointsBalance: number;
  tier?: string;
  status: string;
}

interface Voucher {
  Id: string;
  VoucherCode: string;
  Type: string;
  FaceValue?: number;
  DiscountPercent?: number;
  ExpirationDate?: string;
}

export class POSLoyaltyClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async lookupMemberByPhone(phone: string): Promise<LoyaltyMember | null> {
    try {
      const response = await this.client.get('/loyalty/member/lookup', {
        params: { phone },
      });

      if (response.data.found) {
        return response.data.member;
      }
      return null;
    } catch (error) {
      console.error('Error looking up member:', error);
      return null;
    }
  }

  async lookupMemberByEmail(email: string): Promise<LoyaltyMember | null> {
    try {
      const response = await this.client.get('/loyalty/member/lookup', {
        params: { email },
      });

      if (response.data.found) {
        return response.data.member;
      }
      return null;
    } catch (error) {
      console.error('Error looking up member:', error);
      return null;
    }
  }

  async calculatePoints(amount: number): Promise<number> {
    try {
      const response = await this.client.post('/loyalty/calculate-points', {
        amount,
      });

      return response.data.calculation.totalPoints;
    } catch (error) {
      console.error('Error calculating points:', error);
      return 0;
    }
  }

  async getAvailableVouchers(memberId: string): Promise<Voucher[]> {
    try {
      const response = await this.client.get(
        `/loyalty/member/${memberId}/vouchers`
      );

      return response.data.vouchers || [];
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      return [];
    }
  }

  async redeemVoucher(voucherId: string, transactionId: string): Promise<boolean> {
    try {
      const response = await this.client.post('/loyalty/member/redeem-voucher', {
        voucherId,
        transactionId,
      });

      return response.data.success;
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      return false;
    }
  }
}

export class POSCheckoutFlow {
  private loyaltyClient: POSLoyaltyClient;
  private currentMember: LoyaltyMember | null = null;

  constructor(baseUrl?: string) {
    this.loyaltyClient = new POSLoyaltyClient(baseUrl);
  }

  async startCheckout(phone?: string, email?: string): Promise<void> {
    console.log('=== Starting Checkout ===');
    
    if (phone) {
      this.currentMember = await this.loyaltyClient.lookupMemberByPhone(phone);
    } else if (email) {
      this.currentMember = await this.loyaltyClient.lookupMemberByEmail(email);
    }

    if (this.currentMember) {
      console.log(`Welcome ${this.currentMember.firstName}!`);
      console.log(`Current Points: ${this.currentMember.pointsBalance}`);
      console.log(`Tier: ${this.currentMember.tier || 'Standard'}`);
    } else {
      console.log('No loyalty member found. Continue as guest?');
    }
  }

  async showPointsPreview(transactionAmount: number): Promise<void> {
    if (!this.currentMember) {
      console.log('Sign up for loyalty to earn points!');
      return;
    }

    const pointsToEarn = await this.loyaltyClient.calculatePoints(transactionAmount);
    const newBalance = this.currentMember.pointsBalance + pointsToEarn;

    console.log('\n=== Points Preview ===');
    console.log(`Transaction Amount: $${transactionAmount.toFixed(2)}`);
    console.log(`Points to Earn: ${pointsToEarn}`);
    console.log(`Current Balance: ${this.currentMember.pointsBalance}`);
    console.log(`New Balance: ${newBalance}`);
  }

  async showAvailableRewards(): Promise<Voucher[]> {
    if (!this.currentMember) {
      return [];
    }

    const vouchers = await this.loyaltyClient.getAvailableVouchers(
      this.currentMember.memberId
    );

    if (vouchers.length > 0) {
      console.log('\n=== Available Rewards ===');
      vouchers.forEach((voucher, index) => {
        console.log(`${index + 1}. ${voucher.VoucherCode}`);
        if (voucher.Type === 'FixedValue') {
          console.log(`   Save $${voucher.FaceValue}`);
        } else if (voucher.Type === 'Percentage') {
          console.log(`   Save ${voucher.DiscountPercent}%`);
        }
        if (voucher.ExpirationDate) {
          console.log(`   Expires: ${voucher.ExpirationDate}`);
        }
        console.log('');
      });
    }

    return vouchers;
  }

  async applyReward(voucherIndex: number, transactionId: string): Promise<boolean> {
    if (!this.currentMember) {
      return false;
    }

    const vouchers = await this.loyaltyClient.getAvailableVouchers(
      this.currentMember.memberId
    );

    if (voucherIndex < 0 || voucherIndex >= vouchers.length) {
      console.log('Invalid voucher selection');
      return false;
    }

    const voucher = vouchers[voucherIndex];
    const success = await this.loyaltyClient.redeemVoucher(
      voucher.Id,
      transactionId
    );

    if (success) {
      console.log(`✓ Reward applied: ${voucher.VoucherCode}`);
    } else {
      console.log('✗ Failed to apply reward');
    }

    return success;
  }

  getMember(): LoyaltyMember | null {
    return this.currentMember;
  }
}

async function demoCheckout() {
  console.log('==============================================');
  console.log('POS Loyalty Integration Demo');
  console.log('==============================================\n');

  const checkout = new POSCheckoutFlow('http://localhost:3000/api');

  await checkout.startCheckout('+15555551234');

  await checkout.showPointsPreview(45.67);

  const vouchers = await checkout.showAvailableRewards();

  if (vouchers.length > 0) {
    console.log('Would you like to apply a reward? (Demo: applying first reward)');
    await checkout.applyReward(0, 'demo_txn_123');
  }

  console.log('\n=== Transaction Complete ===');
  console.log('Points will be automatically awarded after checkout.');
}

if (require.main === module) {
  demoCheckout().catch(console.error);
}

export default POSLoyaltyClient;
