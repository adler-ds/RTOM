# Genius POS Webhook Setup Guide

This guide explains how to configure Genius POS to send webhooks to your integration service.

## Prerequisites

- Genius POS account with admin access
- Integration service deployed and accessible via HTTPS
- Valid SSL certificate for webhook endpoint

## Webhook Configuration

### 1. Access Genius Back Office

1. Log in to Genius Back Office
2. Navigate to **Settings** > **Integrations** > **Webhooks**

### 2. Create Webhook Endpoint

Configure the following webhook:

**Endpoint URL**: `https://your-domain.com/api/webhooks/genius/transaction`

**Events to Subscribe**:
- `transaction.created`
- `transaction.completed`
- `transaction.updated`
- `transaction.voided`

**Authentication**:
- Method: Bearer Token or API Key
- Add to Header: `Authorization: Bearer YOUR_SECRET_TOKEN`

### 3. Configure Void Webhook

Create a second webhook for void events:

**Endpoint URL**: `https://your-domain.com/api/webhooks/genius/void`

**Events to Subscribe**:
- `transaction.voided`
- `transaction.refunded`

## Webhook Payload Format

### Transaction Created Event

```json
{
  "eventType": "transaction.created",
  "eventId": "evt_123456789",
  "timestamp": "2026-02-27T10:30:00Z",
  "data": {
    "transactionId": "txn_987654321",
    "storeId": "store_001",
    "terminalId": "terminal_001",
    "timestamp": "2026-02-27T10:30:00Z",
    "customerId": "cust_123",
    "customerPhone": "+15555551234",
    "customerEmail": "customer@example.com",
    "totalAmount": 45.67,
    "subtotal": 42.50,
    "tax": 3.17,
    "tip": 0.00,
    "discount": 0.00,
    "paymentMethod": "credit_card",
    "items": [
      {
        "itemId": "item_001",
        "itemName": "Whataburger",
        "quantity": 2,
        "unitPrice": 8.99,
        "totalPrice": 17.98,
        "categoryId": "cat_burgers",
        "categoryName": "Burgers",
        "modifiers": [
          {
            "modifierId": "mod_001",
            "modifierName": "Extra Cheese",
            "price": 0.50
          }
        ]
      },
      {
        "itemId": "item_002",
        "itemName": "French Fries",
        "quantity": 1,
        "unitPrice": 3.49,
        "totalPrice": 3.49,
        "categoryId": "cat_sides",
        "categoryName": "Sides"
      }
    ],
    "status": "completed"
  }
}
```

## Testing Webhooks

### 1. Test Endpoint Availability

```bash
curl -X GET https://your-domain.com/api/webhooks/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-27T10:30:00Z",
  "queue": {
    "waiting": 0,
    "active": 0,
    "completed": 100,
    "failed": 0
  }
}
```

### 2. Send Test Transaction

Use the Genius POS test environment or send a manual test:

```bash
curl -X POST https://your-domain.com/api/webhooks/genius/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN" \
  -d '{
    "eventType": "transaction.created",
    "eventId": "test_evt_001",
    "timestamp": "2026-02-27T10:30:00Z",
    "data": {
      "transactionId": "test_txn_001",
      "storeId": "store_001",
      "totalAmount": 25.00,
      "customerPhone": "+15555551234",
      "status": "completed",
      "items": []
    }
  }'
```

### 3. Verify Processing

Check job status:
```bash
curl -X GET https://your-domain.com/api/admin/queue/job/{jobId}
```

## Webhook Security

### 1. Verify Webhook Signatures

If Genius POS supports webhook signatures, verify them:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### 2. IP Whitelist

Configure your firewall to only accept webhooks from Genius POS IPs:

```nginx
# Nginx example
location /api/webhooks/genius {
    allow 52.1.2.3;      # Genius POS IP
    allow 52.1.2.4;      # Genius POS IP
    deny all;
    
    proxy_pass http://localhost:3000;
}
```

### 3. Rate Limiting

The integration service includes built-in rate limiting:
- 100 requests per 15 minutes per IP
- Configurable in `src/app.ts`

## Monitoring Webhooks

### View Queue Statistics

```bash
curl -X GET https://your-domain.com/api/admin/queue/stats
```

### Check Logs

```bash
tail -f logs/combined.log | grep "webhook"
```

### Failed Webhooks

Failed webhooks are automatically retried with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay

After 3 failed attempts, check the failed jobs:

```bash
curl -X GET https://your-domain.com/api/admin/queue/stats
```

## Troubleshooting

### Webhook Not Received

1. **Check endpoint accessibility**:
   ```bash
   curl -I https://your-domain.com/api/webhooks/health
   ```

2. **Verify SSL certificate**:
   ```bash
   openssl s_client -connect your-domain.com:443
   ```

3. **Check firewall rules**:
   - Ensure port 443 is open
   - Verify IP whitelisting

### Webhook Received But Not Processing

1. **Check logs**:
   ```bash
   tail -f logs/error.log
   ```

2. **Verify Redis connection**:
   ```bash
   redis-cli ping
   ```

3. **Check Salesforce connectivity**:
   ```bash
   curl -X GET https://your-domain.com/api/webhooks/health
   ```

### Points Not Awarded

1. **Verify member exists**:
   ```bash
   curl -X GET "https://your-domain.com/api/loyalty/member/lookup?phone=5555551234"
   ```

2. **Check minimum transaction amount**:
   - Default: $1.00
   - Configured in `.env`: `MINIMUM_TRANSACTION_FOR_POINTS`

3. **Review transaction status**:
   - Only `completed` transactions award points

## Support

For webhook configuration issues:
1. Contact Genius POS support
2. Provide your store ID and webhook endpoint URL
3. Share any error messages from webhook delivery logs

For integration issues:
1. Check application logs
2. Verify Salesforce connectivity
3. Review queue statistics
