# API Reference

Complete API documentation for the Genius POS to Salesforce Loyalty Integration service.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

Most endpoints don't require authentication, but webhooks should be secured with bearer tokens.

```
Authorization: Bearer YOUR_SECRET_TOKEN
```

---

## Webhook Endpoints

### POST /webhooks/genius/transaction

Receive transaction events from Genius POS.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_SECRET_TOKEN
```

**Request Body:**
```json
{
  "eventType": "transaction.created",
  "eventId": "evt_123456",
  "timestamp": "2026-02-27T10:00:00Z",
  "data": {
    "transactionId": "txn_789012",
    "storeId": "store_001",
    "terminalId": "terminal_001",
    "timestamp": "2026-02-27T10:00:00Z",
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
        "totalPrice": 17.98
      }
    ],
    "status": "completed"
  }
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Transaction queued for processing",
  "jobId": "12345"
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "success": false,
  "error": "Validation error message"
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### POST /webhooks/genius/void

Handle voided transaction events.

**Request Body:**
```json
{
  "eventType": "transaction.voided",
  "eventId": "evt_123457",
  "timestamp": "2026-02-27T10:05:00Z",
  "data": {
    "transactionId": "txn_789012",
    "storeId": "store_001",
    "totalAmount": 45.67,
    "status": "voided"
  }
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Void transaction queued for processing",
  "jobId": "12346"
}
```

---

### GET /webhooks/health

Service health check endpoint.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-27T10:00:00Z",
  "queue": {
    "waiting": 5,
    "active": 2,
    "completed": 1234,
    "failed": 3,
    "delayed": 0,
    "total": 1244
  }
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "error": "Redis connection failed"
}
```

---

## Loyalty Endpoints

### GET /loyalty/member/lookup

Lookup a loyalty member by phone, email, or membership number.

**Query Parameters:**
- `phone` (string, optional): Phone number (e.g., "+15555551234" or "5555551234")
- `email` (string, optional): Email address
- `memberNumber` (string, optional): Membership number

**Note**: Provide at least one query parameter.

**Example Request:**
```bash
curl -X GET "https://your-domain.com/api/loyalty/member/lookup?phone=5555551234"
```

**Response (200 OK) - Member Found:**
```json
{
  "found": true,
  "member": {
    "memberId": "a1b2c3d4e5f6",
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

**Response (200 OK) - Member Not Found:**
```json
{
  "found": false
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Please provide phone, email, or memberNumber"
}
```

---

### GET /loyalty/member/:memberId/vouchers

Get available vouchers for a loyalty member.

**Path Parameters:**
- `memberId` (string, required): Salesforce member ID

**Example Request:**
```bash
curl -X GET "https://your-domain.com/api/loyalty/member/a1b2c3d4e5f6/vouchers"
```

**Response (200 OK):**
```json
{
  "success": true,
  "vouchers": [
    {
      "Id": "voucher_123",
      "VoucherCode": "SAVE5",
      "VoucherDefinitionId": "vdef_001",
      "Status": "Issued",
      "EffectiveDate": "2026-02-01",
      "ExpirationDate": "2026-03-31",
      "FaceValue": 5.00,
      "DiscountPercent": null,
      "Type": "FixedValue"
    },
    {
      "Id": "voucher_124",
      "VoucherCode": "SAVE10PCT",
      "VoucherDefinitionId": "vdef_002",
      "Status": "Issued",
      "EffectiveDate": "2026-02-15",
      "ExpirationDate": "2026-03-15",
      "FaceValue": null,
      "DiscountPercent": 10,
      "Type": "Percentage"
    }
  ]
}
```

**Response (200 OK) - No Vouchers:**
```json
{
  "success": true,
  "vouchers": []
}
```

---

### POST /loyalty/member/redeem-voucher

Redeem a voucher for a transaction.

**Request Body:**
```json
{
  "voucherId": "voucher_123",
  "transactionId": "txn_789012"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Voucher redeemed successfully"
}
```

**Response (200 OK) - Failed:**
```json
{
  "success": false,
  "message": "Failed to redeem voucher"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "\"voucherId\" is required"
}
```

---

### POST /loyalty/calculate-points

Calculate loyalty points for a given transaction amount.

**Request Body:**
```json
{
  "amount": 45.67
}
```

**Response (200 OK):**
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

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "\"amount\" must be greater than or equal to 0"
}
```

---

## Admin Endpoints

### GET /admin/queue/stats

Get queue processing statistics.

**Example Request:**
```bash
curl -X GET "https://your-domain.com/api/admin/queue/stats"
```

**Response (200 OK):**
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

---

### GET /admin/queue/job/:jobId

Get the status of a specific job.

**Path Parameters:**
- `jobId` (string, required): Job ID returned from webhook endpoints

**Example Request:**
```bash
curl -X GET "https://your-domain.com/api/admin/queue/job/12345"
```

**Response (200 OK) - Job Found:**
```json
{
  "success": true,
  "job": {
    "found": true,
    "jobId": "12345",
    "state": "completed",
    "progress": 100,
    "failedReason": null,
    "data": {
      "transaction": {
        "transactionId": "txn_789012",
        "totalAmount": 45.67
      }
    },
    "result": {
      "success": true,
      "pointsAwarded": 456,
      "newBalance": 1706
    }
  }
}
```

**Response (200 OK) - Job Not Found:**
```json
{
  "success": true,
  "job": {
    "found": false
  }
}
```

**Job States:**
- `waiting`: Job is in queue
- `active`: Job is currently processing
- `completed`: Job completed successfully
- `failed`: Job failed after retries
- `delayed`: Job is delayed for retry

---

### POST /admin/sync/historical

Trigger a historical transaction sync.

**Request Body:**
```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-28"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Historical sync job created",
  "jobId": "12347"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "\"startDate\" must be in ISO 8601 date format"
}
```

---

## Root Endpoint

### GET /

Service information endpoint.

**Response (200 OK):**
```json
{
  "service": "Genius POS to Salesforce Loyalty Integration",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2026-02-27T10:00:00Z"
}
```

---

## Rate Limits

All API endpoints are rate-limited:
- **Limit**: 100 requests per 15 minutes per IP
- **Response Header**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Rate Limit Exceeded Response (429):**
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Error Codes

| HTTP Status | Code | Description |
|------------|------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 401 | UNAUTHORIZED | Authentication required |
| 404 | NOT_FOUND | Resource not found |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Internal server error |
| 502 | EXTERNAL_SERVICE_ERROR | External service (Genius/Salesforce) error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

---

## Webhooks Retry Policy

Failed webhook processing follows this retry schedule:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 second |
| 3 | 2 seconds |

After 3 failed attempts, the job is marked as failed and logged.

---

## Testing with cURL

### Test Member Lookup
```bash
curl -X GET "http://localhost:3000/api/loyalty/member/lookup?phone=5555551234"
```

### Test Points Calculation
```bash
curl -X POST http://localhost:3000/api/loyalty/calculate-points \
  -H "Content-Type: application/json" \
  -d '{"amount": 45.67}'
```

### Test Transaction Webhook
```bash
curl -X POST http://localhost:3000/api/webhooks/genius/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "transaction.created",
    "eventId": "test_001",
    "timestamp": "2026-02-27T10:00:00Z",
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

### Check Queue Stats
```bash
curl -X GET http://localhost:3000/api/admin/queue/stats
```

### Check Health
```bash
curl -X GET http://localhost:3000/api/webhooks/health
```

---

## Postman Collection

Import this collection for easy API testing:

```json
{
  "info": {
    "name": "Genius Loyalty Integration",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Member Lookup",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/loyalty/member/lookup?phone=5555551234",
          "host": ["{{base_url}}"],
          "path": ["loyalty", "member", "lookup"],
          "query": [{"key": "phone", "value": "5555551234"}]
        }
      }
    }
  ]
}
```

Save as `postman_collection.json` and import into Postman.
