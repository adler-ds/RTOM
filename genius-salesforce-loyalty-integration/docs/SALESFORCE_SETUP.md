# Salesforce Loyalty Setup Guide

This guide walks through configuring Salesforce Loyalty Management for integration with Genius POS.

## Prerequisites

- Salesforce org with Loyalty Management enabled
- System Administrator access
- Basic understanding of Salesforce configuration

## Step 1: Enable Loyalty Management

1. Log in to Salesforce
2. Navigate to **Setup** > **Feature Settings** > **Loyalty Management**
3. Click **Enable Loyalty Management**
4. Accept the terms and conditions

## Step 2: Create Loyalty Program

1. Navigate to **Loyalty Management** app
2. Click **New Loyalty Program**
3. Configure:
   - **Program Name**: "Whataburger Rewards" (or your brand name)
   - **Program Type**: Points-Based
   - **Currency**: USD
   - **Program Status**: Active
   - **Enrollment Type**: Automatic
4. Click **Save**

## Step 3: Configure Loyalty Tiers (Optional)

1. From the Loyalty Program record, go to **Related** > **Loyalty Tiers**
2. Create tiers:

### Bronze Tier
- **Tier Name**: Bronze
- **Minimum Points**: 0
- **Benefits**: 10 points per dollar

### Silver Tier
- **Tier Name**: Silver
- **Minimum Points**: 1000
- **Benefits**: 12 points per dollar + birthday bonus

### Gold Tier
- **Tier Name**: Gold
- **Minimum Points**: 5000
- **Benefits**: 15 points per dollar + exclusive offers

## Step 4: Create Voucher Definitions

1. Navigate to **Voucher Definitions**
2. Create reward vouchers:

### $5 Off Voucher
- **Voucher Definition Name**: "$5 Off Purchase"
- **Type**: Fixed Value
- **Face Value**: 5.00
- **Redemption Requirement**: 500 points
- **Expiration Days**: 30

### 10% Off Voucher
- **Voucher Definition Name**: "10% Off Purchase"
- **Type**: Percentage
- **Discount Percent**: 10
- **Redemption Requirement**: 1000 points
- **Expiration Days**: 30

### Free Item Voucher
- **Voucher Definition Name**: "Free Medium Fries"
- **Type**: Product
- **Product Code**: ITEM_FRIES_MED
- **Redemption Requirement**: 250 points
- **Expiration Days**: 14

## Step 5: Configure Transaction Journals

Transaction journals track all loyalty activities.

1. Navigate to **Setup** > **Object Manager** > **Transaction Journal**
2. Verify required fields exist:
   - Activity Date
   - Journal Type (Accrual/Redemption)
   - Member ID
   - Loyalty Program ID
   - Transaction Amount
   - Status
   - External Transaction Number

## Step 6: Create Connected App

The integration service needs API access via a Connected App.

1. Navigate to **Setup** > **App Manager**
2. Click **New Connected App**
3. Configure:
   - **Connected App Name**: Genius POS Integration
   - **API Name**: Genius_POS_Integration
   - **Contact Email**: your-email@example.com
   - **Enable OAuth Settings**: Checked
   - **Callback URL**: https://login.salesforce.com/services/oauth2/callback
   - **Selected OAuth Scopes**:
     - Full access (full)
     - Perform requests on your behalf at any time (refresh_token, offline_access)
     - Manage user data via APIs (api)
4. Click **Save**
5. Note the **Consumer Key** (Client ID) and **Consumer Secret** (Client Secret)

## Step 7: Create Integration User

Create a dedicated user for the integration service.

1. Navigate to **Setup** > **Users** > **New User**
2. Configure:
   - **Profile**: System Administrator (or custom integration profile)
   - **Username**: genius-integration@yourcompany.com
   - **Email**: your-email@example.com
   - **First Name**: Genius
   - **Last Name**: Integration
3. Assign **Permission Sets**:
   - Loyalty Management User
   - API Enabled
4. Click **Save**
5. Reset password and note the credentials

## Step 8: Generate Security Token

1. Log in as the integration user
2. Navigate to **Personal Settings** > **Reset My Security Token**
3. Click **Reset Security Token**
4. Check email for the security token
5. Save the token securely (needed for integration config)

## Step 9: Configure Field-Level Security

Ensure the integration user can access required fields:

1. Navigate to **Setup** > **Object Manager**
2. For each object (LoyaltyProgramMember, TransactionJournal, LoyaltyLedger, Voucher):
   - Click **Fields & Relationships**
   - For each field, click **Set Field-Level Security**
   - Grant **Read** and **Edit** access to the integration user's profile

## Step 10: Create Accrual Rules (Optional)

Automate point calculation with Salesforce rules:

1. Navigate to **Loyalty Program** > **Loyalty Rules**
2. Create accrual rule:
   - **Rule Name**: Standard Purchase Points
   - **Rule Type**: Accrual
   - **Calculation**: 10 points per $1 spent
   - **Status**: Active

## Step 11: Test Configuration

### Test Member Creation

1. Create a test Contact:
   - First Name: Test
   - Last Name: Customer
   - Email: test@example.com
   - Phone: +15555551234

2. Create Loyalty Program Member:
   - Contact: Test Customer
   - Loyalty Program: Whataburger Rewards
   - Membership Number: TEST001
   - Status: Active

### Test Points Accrual

1. Create a Transaction Journal:
   - Member: TEST001
   - Transaction Amount: 25.00
   - Journal Type: Accrual

2. Create Loyalty Ledger entry:
   - Points: 250
   - Event Type: Credit

3. Verify points balance:
   - Query: `SELECT SUM(Points) FROM LoyaltyLedger WHERE LoyaltyProgramMemberId = '...'`

## Step 12: Configure Integration Service

Update your `.env` file with Salesforce credentials:

```env
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_USERNAME=genius-integration@yourcompany.com
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_security_token
SALESFORCE_CLIENT_ID=your_connected_app_consumer_key
SALESFORCE_CLIENT_SECRET=your_connected_app_consumer_secret
SALESFORCE_LOYALTY_PROGRAM_NAME=Whataburger Rewards
```

## Step 13: Test Integration

Test member lookup via API:

```bash
curl -X GET "https://your-integration-service.com/api/loyalty/member/lookup?phone=5555551234"
```

Expected response:
```json
{
  "found": true,
  "member": {
    "memberId": "a1b2c3d4",
    "membershipNumber": "TEST001",
    "firstName": "Test",
    "lastName": "Customer",
    "email": "test@example.com",
    "pointsBalance": 250,
    "status": "Active"
  }
}
```

## Monitoring and Maintenance

### View Activity

1. **Transaction Journals**: Track all loyalty transactions
2. **Loyalty Ledger**: View point credits/debits
3. **Reports**: Create custom reports for:
   - Member enrollment trends
   - Points accrual/redemption
   - Voucher usage
   - Member tier distribution

### Create Reports

1. Navigate to **Reports**
2. Create report types:
   - **Members by Tier**: LoyaltyProgramMember report
   - **Points Activity**: LoyaltyLedger with filters
   - **Voucher Redemption**: Voucher with status filters

### Create Dashboards

1. Navigate to **Dashboards**
2. Create loyalty program dashboard:
   - Total active members
   - Points accrued (last 30 days)
   - Points redeemed (last 30 days)
   - Top members by points
   - Voucher redemption rate

## Troubleshooting

### Authentication Failures

**Error**: "INVALID_LOGIN"
- Verify username and password
- Check security token is appended to password
- Ensure user is active

**Error**: "INVALID_CLIENT"
- Verify Connected App credentials
- Check OAuth scopes

### Permission Errors

**Error**: "INSUFFICIENT_ACCESS"
- Review user profile permissions
- Check field-level security
- Verify object permissions

### API Limits

Salesforce API limits apply:
- **Developer Edition**: 15,000 API calls/day
- **Enterprise Edition**: 100,000 API calls/day
- **Unlimited Edition**: 200,000 API calls/day

Monitor API usage:
1. Navigate to **Setup** > **System Overview**
2. View **API Usage**

## Best Practices

1. **Use Separate Sandbox**: Test integrations in a sandbox org first
2. **Monitor API Limits**: Track usage to avoid hitting limits
3. **Audit Trail**: Enable field history tracking on loyalty objects
4. **Data Backup**: Regular exports of loyalty data
5. **Performance**: Index frequently queried fields
6. **Security**: Use IP restrictions on Connected App

## Support Resources

- [Salesforce Loyalty Management Documentation](https://help.salesforce.com/s/articleView?id=sf.loyalty_management.htm)
- [Salesforce APIs Documentation](https://developer.salesforce.com/docs/apis)
- [Trailhead: Loyalty Management](https://trailhead.salesforce.com/content/learn/modules/loyalty-management)

## Next Steps

1. Configure Genius POS webhooks (see `WEBHOOK_SETUP.md`)
2. Deploy integration service
3. Test end-to-end transaction flow
4. Monitor initial transactions
5. Train staff on loyalty features
