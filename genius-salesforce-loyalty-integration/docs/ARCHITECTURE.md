# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           POS Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Terminal 1  │  │  Terminal 2  │  │  Terminal N  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
│         └──────────────────┴──────────────────┘                       │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │ Webhooks (HTTPS)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Integration Service Layer                         │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     API Gateway (Express)                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │   Webhook   │  │   Loyalty   │  │    Admin    │          │  │
│  │  │   Routes    │  │   Routes    │  │   Routes    │          │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │  │
│  └─────────┼─────────────────┼─────────────────┼─────────────────┘  │
│            │                 │                 │                     │
│  ┌─────────▼─────────────────▼─────────────────▼─────────────────┐  │
│  │               Integration Service Layer                        │  │
│  │  - Transaction Processing                                      │  │
│  │  - Member Lookup                                               │  │
│  │  - Points Calculation                                          │  │
│  │  - Voucher Management                                          │  │
│  └────────┬────────────────────────────────────────┬─────────────┘  │
│           │                                         │                │
│           ▼                                         ▼                │
│  ┌─────────────────┐                    ┌─────────────────┐        │
│  │ Genius Service  │                    │  SF Service     │        │
│  │ - Get Trans     │                    │  - Auth         │        │
│  │ - Get Customer  │                    │  - Member CRUD  │        │
│  │ - Apply Disc    │                    │  - Points Mgmt  │        │
│  └────────┬────────┘                    └────────┬────────┘        │
│           │                                       │                 │
└───────────┼───────────────────────────────────────┼─────────────────┘
            │                                       │
            │         ┌─────────────────┐          │
            │         │  Queue Service  │          │
            │         │   (Bull/Redis)  │          │
            │         │  - Retry Logic  │          │
            │         │  - Job Status   │          │
            │         └─────────────────┘          │
            │                                       │
            ▼                                       ▼
┌─────────────────────┐              ┌─────────────────────┐
│   Genius POS API    │              │  Salesforce APIs    │
│                     │              │                     │
│  - Transactions     │              │  - Auth             │
│  - Customers        │              │  - SOQL             │
│  - Items            │              │  - DML              │
└─────────────────────┘              │  - Loyalty Mgmt     │
                                     └─────────────────────┘
```

## Component Breakdown

### 1. API Layer

**Express Server** (`src/app.ts`)
- Routes incoming requests
- Applies middleware (CORS, helmet, rate limiting)
- Error handling
- Request/response formatting

**Controllers** (`src/controllers/`)
- `WebhookController`: Handles POS webhooks
- `LoyaltyController`: Member lookup, voucher management
- `AdminController`: Queue management, health checks

### 2. Service Layer

**IntegrationService** (`src/services/integration.service.ts`)
- Orchestrates business logic
- Coordinates between Genius and Salesforce
- Points calculation
- Transaction processing workflow

**GeniusPOSService** (`src/services/genius.service.ts`)
- Wrapper for Genius POS API
- Transaction retrieval
- Customer management
- Discount application

**SalesforceLoyaltyService** (`src/services/salesforce.service.ts`)
- Salesforce authentication via jsforce
- Member CRUD operations
- Points accrual/redemption
- Voucher management
- SOQL queries for data retrieval

**QueueService** (`src/services/queue.service.ts`)
- Bull queue management
- Job processing
- Retry logic with exponential backoff
- Job status tracking

### 3. Data Flow

#### Transaction Processing Flow

```
┌─────────────┐
│ POS creates │
│ transaction │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Webhook   │
│   received  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validate &  │
│ queue job   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│   Process   │────>│ Lookup       │
│   from      │     │ member by    │
│   queue     │     │ phone/email  │
└──────┬──────┘     └──────┬───────┘
       │                   │
       │                   ▼
       │            ┌──────────────┐
       │            │  Calculate   │
       │            │  points      │
       │            └──────┬───────┘
       │                   │
       │                   ▼
       │            ┌──────────────┐
       │            │ Create SF    │
       │            │ journal &    │
       │            │ ledger       │
       └───────────>└──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Update     │
                    │ customer in  │
                    │   Genius     │
                    └──────────────┘
```

#### Member Lookup Flow

```
┌─────────────┐
│ POS scans   │
│ member card │
│ or enters   │
│ phone       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Call lookup │
│    API      │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Query SF   │────>│  Return      │
│  for member │     │  member data │
└──────┬──────┘     │  + points    │
       │            └──────────────┘
       │
       ▼
┌─────────────┐
│ Get points  │
│ balance     │
│ from ledger │
└─────────────┘
```

## Data Models

### Genius POS Transaction

```typescript
{
  transactionId: string;
  storeId: string;
  timestamp: string;
  customerId?: string;
  customerPhone?: string;
  totalAmount: number;
  items: LineItem[];
  status: 'completed' | 'voided';
}
```

### Salesforce Loyalty Member

```typescript
{
  Id: string;
  MembershipNumber: string;
  ContactId: string;
  LoyaltyProgramId: string;
  MemberStatus: 'Active' | 'Inactive';
  EnrollmentDate: string;
}
```

### Transaction Journal (SF)

```typescript
{
  ActivityDate: string;
  JournalType: 'Accrual' | 'Redemption';
  MemberId: string;
  TransactionAmount: number;
  Status: 'Processed';
  ExternalTransactionNumber: string;
}
```

### Loyalty Ledger (SF)

```typescript
{
  LoyaltyProgramMemberId: string;
  TransactionJournalId: string;
  EventType: 'Credit' | 'Debit';
  Points: number;
  ActivityDate: string;
}
```

## Scalability Considerations

### Horizontal Scaling

The service is stateless and can be scaled horizontally:

```
┌─────────────┐
│ Load        │
│ Balancer    │
└──────┬──────┘
       │
       ├──────>┌─────────────┐
       │       │ Instance 1  │
       ├──────>┌─────────────┐
       │       │ Instance 2  │
       └──────>┌─────────────┐
               │ Instance N  │
               └─────────────┘
                      │
                      ▼
               ┌─────────────┐
               │   Shared    │
               │   Redis     │
               └─────────────┘
```

### Performance Optimization

1. **Caching**: Cache member lookups in Redis
2. **Batch Processing**: Process multiple transactions in batches
3. **Connection Pooling**: Reuse Salesforce connections
4. **Queue Priority**: Prioritize high-value transactions

### Rate Limiting

- API rate limiting: 100 req/15min per IP
- Salesforce API limits monitored
- Genius POS webhook retry with backoff

## Security Architecture

### Authentication Flow

```
┌─────────────┐
│   Webhook   │
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Verify     │
│  Bearer     │
│  Token      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Process    │
│  Request    │
└─────────────┘
```

### Security Layers

1. **Network**: HTTPS only, firewall rules
2. **Application**: Helmet, CORS, input validation
3. **Data**: Encrypted env variables, secrets management
4. **API**: Rate limiting, authentication

## Error Handling

### Retry Strategy

```
Attempt 1 ──fail──> Wait 1s  ──> Attempt 2
                                    │
                                  fail
                                    │
                                    ▼
                                Wait 2s ──> Attempt 3
                                               │
                                             fail
                                               │
                                               ▼
                                        Dead Letter
                                            Queue
```

### Error Categories

1. **Transient**: Network timeouts, rate limits → Retry
2. **Permanent**: Invalid data, auth failures → Log & alert
3. **Business**: Member not found → Return error to POS

## Monitoring & Observability

### Metrics Collected

- Request rate
- Response time
- Error rate
- Queue depth
- Salesforce API usage
- Points awarded/redeemed

### Logging Levels

- **ERROR**: Failures requiring attention
- **WARN**: Potential issues
- **INFO**: Business events (points awarded, etc.)
- **DEBUG**: Detailed technical info

### Health Checks

- Service health: `/api/webhooks/health`
- Redis connectivity
- Salesforce connectivity
- Queue processing status

## Disaster Recovery

### Backup Strategy

1. **Queue Persistence**: Redis AOF enabled
2. **Transaction Logs**: All transactions logged
3. **Salesforce Backup**: Native Salesforce backups
4. **Configuration**: Infrastructure as code

### Recovery Procedures

1. **Service Down**: Auto-restart via PM2/K8s
2. **Redis Down**: Queue jobs resume when restored
3. **Salesforce Down**: Jobs retry automatically
4. **Data Corruption**: Historical sync from Genius POS

## Future Enhancements

1. **Real-time Dashboard**: Web UI for monitoring
2. **Advanced Analytics**: Member behavior insights
3. **Multi-brand Support**: Support multiple loyalty programs
4. **Mobile App Integration**: Direct member app integration
5. **AI-powered Rewards**: Personalized offers
6. **Blockchain**: Decentralized loyalty points

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 18+ | JavaScript execution |
| Language | TypeScript | Type safety |
| Framework | Express.js | Web server |
| Queue | Bull + Redis | Job processing |
| Salesforce | jsforce | SF API client |
| HTTP Client | Axios | External API calls |
| Logging | Winston | Application logging |
| Validation | Joi | Input validation |
| Process Mgmt | PM2 | Production process management |
| Container | Docker | Containerization |
| Orchestration | Kubernetes | Container orchestration |

## Performance Benchmarks

Expected performance (single instance):

- **Throughput**: 100-200 transactions/second
- **Latency**: <100ms (webhook acceptance)
- **Processing Time**: 1-3 seconds (end-to-end)
- **Memory**: ~256MB baseline, ~512MB peak
- **CPU**: 0.5-1 core under normal load
