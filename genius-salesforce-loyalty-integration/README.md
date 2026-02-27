# Genius POS to Salesforce Loyalty Integration

A robust Node.js integration service that connects Xenial Genius POS with Salesforce Loyalty Management, enabling real-time loyalty points accrual, redemption, and customer engagement.

## Features

- **Real-time Transaction Processing**: Automatically award loyalty points when transactions complete in Genius POS
- **Member Lookup**: Search loyalty members by phone, email, or membership number
- **Points Calculation**: Configurable points-per-dollar rules with bonus point tiers
- **Voucher Management**: Retrieve and redeem loyalty vouchers at POS
- **Transaction Reversal**: Automatically reverse points for voided transactions
- **Historical Sync**: Batch process historical transactions
- **Queue-based Processing**: Reliable async processing with retry logic
- **Webhook Support**: Receive real-time events from Genius POS
- **RESTful API**: Clean API endpoints for POS integrations
- **Enterprise Logging**: Comprehensive Winston-based logging
- **Rate Limiting**: Built-in API rate limiting and security

## Architecture

```
┌─────────────────┐         ┌──────────────────────┐         ┌──────────────────┐
│   Genius POS    │────────>│  Integration Service │────────>│   Salesforce     │
│                 │ Webhook │                      │  API    │   Loyalty Mgmt   │
│  - Transactions │         │  - Express Server    │         │                  │
│  - Customers    │         │  - Queue Processing  │         │  - Members       │
│  - Discounts    │         │  - Business Logic    │         │  - Points        │
└─────────────────┘         └──────────────────────┘         │  - Vouchers      │
                                     │                        └──────────────────┘
                                     │
                                     v
                            ┌─────────────────┐
                            │   Redis Queue   │
                            │  - Bull Queue   │
                            │  - Retry Logic  │
                            └─────────────────┘
```

## Prerequisites

- Node.js 18+ and npm
- Redis 6+ (for queue management)
- Genius POS API access with API key
- Salesforce org with Loyalty Management enabled
- Salesforce Connected App credentials

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd genius-salesforce-loyalty-integration
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Build the TypeScript project:
```bash
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

#### Server Configuration
- `PORT`: API server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

#### Genius POS Configuration
- `GENIUS_API_BASE_URL`: Genius API base URL
- `GENIUS_API_KEY`: Your Genius API key
- `GENIUS_STORE_ID`: Store identifier
- `GENIUS_TERMINAL_ID`: Terminal identifier

#### Salesforce Configuration
- `SALESFORCE_LOGIN_URL`: Salesforce login URL
- `SALESFORCE_USERNAME`: Salesforce username
- `SALESFORCE_PASSWORD`: Salesforce password
- `SALESFORCE_SECURITY_TOKEN`: Salesforce security token
- `SALESFORCE_CLIENT_ID`: Connected App client ID
- `SALESFORCE_CLIENT_SECRET`: Connected App client secret
- `SALESFORCE_LOYALTY_PROGRAM_NAME`: Name of loyalty program in Salesforce

#### Points Configuration
- `POINTS_PER_DOLLAR`: Points awarded per dollar spent (default: 10)
- `MINIMUM_TRANSACTION_FOR_POINTS`: Minimum transaction amount (default: 1.00)

#### Integration Settings
- `SYNC_INTERVAL_MINUTES`: Polling interval for sync (default: 5)
- `ENABLE_REAL_TIME_SYNC`: Enable webhook processing (default: true)
- `RETRY_ATTEMPTS`: Number of retry attempts (default: 3)
- `RETRY_DELAY_MS`: Delay between retries (default: 1000)

#### Redis Configuration
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_PASSWORD`: Redis password (optional)

## Usage

### Demo with Mock POS 🎮

A complete web-based mock Genius POS is included for testing!

```bash
# Terminal 1: Start Integration Service
npm run dev

# Terminal 2: Start Mock POS
cd mock-pos
./setup.sh
npm start

# Open browser to http://localhost:4000
```

**The mock POS includes:**
- 🍔 Full Whataburger product catalog
- 🛒 Shopping cart functionality
- 👤 Customer lookup with real-time loyalty preview
- 💳 Transaction processing with automatic webhooks
- 📊 Transaction history with void capability
- ⚙️ Configurable webhook settings
- ✅ Webhook testing tool

See `mock-pos/README.md` for detailed usage instructions.

### Development Mode

Run with hot-reload:
```bash
npm run dev
```

### Production Mode

Build and start:
```bash
npm run build
npm start
```

### Running with Docker

```bash
docker-compose up -d
```

### Deploy to Heroku

One-click deploy:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/adler-ds/genius-salesforce-loyalty-integration)

Or use Heroku CLI:
```bash
heroku create your-app-name
heroku addons:create heroku-redis:mini
git push heroku main
```

See `docs/HEROKU_DEPLOYMENT.md` for complete instructions.

## API Endpoints

### Webhook Endpoints

#### POST `/api/webhooks/genius/transaction`
Receive transaction events from Genius POS

**Request Body:**
```json
{
  "eventType": "transaction.created",
  "eventId": "evt_123456",
  "timestamp": "2026-02-27T10:00:00Z",
  "data": {
    "transactionId": "txn_789012",
    "storeId": "store_001",
    "totalAmount": 45.67,
    "customerPhone": "+15555551234",
    "status": "completed",
    "items": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction queued for processing",
  "jobId": "12345"
}
```

#### POST `/api/webhooks/genius/void`
Handle voided transaction events

### Loyalty Endpoints

#### GET `/api/loyalty/member/lookup`
Lookup loyalty member

**Query Parameters:**
- `phone`: Phone number
- `email`: Email address
- `memberNumber`: Membership number

**Response:**
```json
{
  "found": true,
  "member": {
    "memberId": "a1b2c3d4",
    "membershipNumber": "WHT12345",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "pointsBalance": 1250,
    "tier": "Gold",
    "status": "Active"
  }
}
```

#### GET `/api/loyalty/member/:memberId/vouchers`
Get available vouchers for member

**Response:**
```json
{
  "success": true,
  "vouchers": [
    {
      "Id": "voucher_123",
      "VoucherCode": "SAVE10",
      "Type": "Percentage",
      "DiscountPercent": 10,
      "Status": "Issued",
      "ExpirationDate": "2026-03-31"
    }
  ]
}
```

#### POST `/api/loyalty/member/redeem-voucher`
Redeem a voucher

**Request Body:**
```json
{
  "voucherId": "voucher_123",
  "transactionId": "txn_789012"
}
```

#### POST `/api/loyalty/calculate-points`
Calculate points for transaction amount

**Request Body:**
```json
{
  "amount": 45.67
}
```

**Response:**
```json
{
  "success": true,
  "calculation": {
    "transactionAmount": 45.67,
    "pointsAwarded": 456,
    "bonusPoints": 25,
    "totalPoints": 481
  }
}
```

### Admin Endpoints

#### GET `/api/admin/queue/stats`
Get queue processing statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "waiting": 5,
    "active": 2,
    "completed": 1234,
    "failed": 3,
    "delayed": 0,
    "total": 1244
  }
}
```

#### GET `/api/admin/queue/job/:jobId`
Get status of specific job

#### POST `/api/admin/sync/historical`
Trigger historical transaction sync

**Request Body:**
```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-28"
}
```

### Health Check

#### GET `/api/webhooks/health`
Service health check

## Integration Workflow

### Transaction Processing Flow

1. **Transaction Completion**: Customer completes purchase at Genius POS
2. **Webhook Event**: Genius POS sends webhook to integration service
3. **Queue Job**: Transaction queued for async processing
4. **Member Lookup**: Service looks up loyalty member by phone/email
5. **Points Calculation**: Calculate points based on transaction amount
6. **Salesforce Update**: Award points in Salesforce Loyalty
7. **POS Update**: Update customer record with loyalty number (if needed)

### Void Transaction Flow

1. **Transaction Voided**: Transaction voided in Genius POS
2. **Webhook Event**: Void event sent to integration service
3. **Points Reversal**: Debit points from member's account
4. **Audit Trail**: Log reversal in Salesforce

## Points Rules

### Base Points
- Configurable via `POINTS_PER_DOLLAR` (default: 10 points per $1)
- Minimum transaction amount applies

### Bonus Points
- $25-$49.99: +25 bonus points
- $50+: +50 bonus points

### Example Calculations

| Transaction | Base Points | Bonus | Total Points |
|------------|-------------|-------|--------------|
| $15.00     | 150         | 0     | 150          |
| $30.00     | 300         | 25    | 325          |
| $75.00     | 750         | 50    | 800          |

## Error Handling

The service includes comprehensive error handling:

- **Retry Logic**: Failed jobs automatically retry with exponential backoff
- **Dead Letter Queue**: Permanently failed jobs logged for review
- **Validation**: Request validation with Joi schemas
- **Logging**: Detailed error logging with Winston
- **Circuit Breaker**: Prevents cascading failures

## Monitoring

### Logging

Logs are written to:
- `logs/error.log`: Error-level logs
- `logs/combined.log`: All logs
- Console output in development mode

### Queue Monitoring

Monitor queue health via `/api/admin/queue/stats` endpoint.

### Salesforce Monitoring

Check Salesforce Loyalty Management reports for:
- Transaction journals
- Points accrual/redemption
- Member activity

## Security

- **API Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers enabled
- **CORS**: Configurable CORS policy
- **Input Validation**: All inputs validated with Joi
- **Environment Variables**: Sensitive data in environment variables

## Testing

Run tests:
```bash
npm test
```

## Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start dist/index.js --name genius-loyalty-integration
pm2 save
pm2 startup
```

### Using Docker

```bash
docker build -t genius-loyalty-integration .
docker run -d -p 3000:3000 --env-file .env genius-loyalty-integration
```

## Troubleshooting

### Common Issues

**Redis Connection Failed**
- Ensure Redis is running: `redis-cli ping`
- Check Redis host/port configuration

**Salesforce Authentication Failed**
- Verify username, password, and security token
- Check Connected App credentials
- Ensure user has Loyalty Management permissions

**Transactions Not Processing**
- Check webhook configuration in Genius POS
- Verify API key is valid
- Review logs for errors

**Points Not Appearing**
- Check minimum transaction amount
- Verify loyalty member is active
- Review Salesforce transaction journals

## Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Review queue stats via admin API
3. Check Salesforce debug logs
4. Contact support with log excerpts

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
