# Mock Genius POS

A web-based mock POS terminal for testing the Genius-Salesforce Loyalty Integration.

## Features

- 🍔 Product catalog with categories (Burgers, Chicken, Sides, Drinks)
- 🛒 Shopping cart with quantity management
- 👤 Customer lookup and loyalty preview
- 💳 Complete transaction processing
- 🔄 Automatic webhook sending to integration service
- 📊 Transaction history with void capability
- ⚙️ Configurable webhook settings
- ✅ Webhook testing tool

## Quick Start

### 1. Install Dependencies

```bash
cd mock-pos
npm install
```

### 2. Start the Mock POS Server

```bash
npm start
```

The server will start on `http://localhost:4000`

### 3. Start the Integration Service

In another terminal:

```bash
cd ..
npm run dev
```

The integration service should be running on `http://localhost:3000`

### 4. Open the POS Terminal

Open your browser to:
```
http://localhost:4000
```

## Usage

### Making a Test Transaction

1. **Select Products**: Click on menu items to add them to the cart
2. **Enter Customer Info** (optional):
   - Phone: `5555551234`
   - Email: `test@example.com`
3. **View Loyalty Preview**: If the customer is a loyalty member, you'll see their current points and points to earn
4. **Complete Sale**: Click "Complete Sale" button
5. **View Results**: Success modal shows transaction details and webhook status

### Voiding a Transaction

1. Find the transaction in the "Recent Transactions" section
2. Click "Void Transaction" button
3. Confirm the void
4. A void webhook will be sent to reverse loyalty points

### Configuring Webhooks

1. Click the **⚙️ Settings** button in the header
2. Configure:
   - **Store ID**: Your store identifier (default: `store_001`)
   - **Terminal ID**: Your terminal identifier (default: `terminal_001`)
   - **Webhook URL**: Integration service webhook endpoint (default: `http://localhost:3000/api/webhooks/genius/transaction`)
   - **Enable Webhooks**: Toggle webhook sending
3. Click **Test Webhook** to verify connectivity
4. Save settings

## API Endpoints

The mock POS exposes these endpoints:

### Products
- `GET /api/products` - Get all products
- `GET /api/modifiers` - Get all modifiers

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create new transaction
- `POST /api/transactions/:id/void` - Void a transaction
- `DELETE /api/transactions` - Clear all transactions

### Configuration
- `GET /api/config` - Get current configuration
- `PUT /api/config` - Update configuration

## Testing the Integration

### Test Flow 1: New Customer

1. Don't enter any customer info
2. Complete a transaction
3. Check integration logs - should show "Loyalty member not found"

### Test Flow 2: Existing Loyalty Member

1. Create a test member in Salesforce with phone `5555551234`
2. Enter this phone in the POS
3. Complete a transaction
4. Check integration logs - should show points awarded
5. Verify in Salesforce that points were added

### Test Flow 3: Void Transaction

1. Complete a transaction with a loyalty member
2. Note the points awarded
3. Void the transaction
4. Check integration logs - should show points reversed
5. Verify in Salesforce that points were deducted

### Test Flow 4: Large Transaction with Bonus

1. Add items totaling over $50
2. Complete the transaction
3. Points calculation should include bonus points
4. Example: $75 transaction = 750 base + 50 bonus = 800 points

## Sample Test Data

### Test Phone Numbers
- `5555551234` - Use this for your test loyalty member
- `5555555678` - Additional test member
- `5555559999` - No loyalty member (guest)

### Test Email Addresses
- `test@example.com`
- `customer@example.com`
- `loyalty@example.com`

## Webhook Payload Format

The mock POS sends webhooks in this format:

```json
{
  "eventType": "transaction.created",
  "eventId": "evt_12345678",
  "timestamp": "2026-02-27T10:00:00Z",
  "data": {
    "transactionId": "txn_87654321",
    "storeId": "store_001",
    "terminalId": "terminal_001",
    "timestamp": "2026-02-27T10:00:00Z",
    "customerPhone": "+15555551234",
    "customerEmail": "test@example.com",
    "totalAmount": 45.67,
    "subtotal": 42.12,
    "tax": 3.55,
    "tip": 0.00,
    "discount": 0.00,
    "paymentMethod": "credit_card",
    "items": [...],
    "status": "completed"
  }
}
```

## Troubleshooting

### Webhooks Not Working

1. Check that integration service is running on port 3000
2. Open Settings and test the webhook
3. Check browser console for errors
4. Verify webhook URL in settings

### Customer Not Found

1. Ensure loyalty member exists in Salesforce
2. Check phone number format (digits only)
3. Verify integration service is connected to Salesforce
4. Check integration service logs

### Transaction List Empty

1. Complete at least one transaction
2. Click "🔄 Refresh" button
3. Check browser console for API errors

## Development Mode

Run with auto-reload during development:

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

## Architecture

```
┌─────────────────────┐
│   Browser UI        │
│  (HTML/CSS/JS)      │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Express Server     │
│  (Node.js)          │
│  - Product API      │
│  - Transaction API  │
│  - Webhook Sender   │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Integration        │
│  Service            │
│  (Port 3000)        │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│   Salesforce        │
│   Loyalty           │
└─────────────────────┘
```

## Tips for Demo

1. **Start with a clean slate**: Clear all transactions before demo
2. **Prepare test member**: Have a Salesforce member with phone `5555551234`
3. **Show the flow**:
   - Add items to cart
   - Enter customer phone
   - Show loyalty preview with current points
   - Complete transaction
   - Show webhook success
   - Check Salesforce for new points
4. **Demonstrate void**: Void a transaction and show points reversed
5. **Show large transaction**: Make a $75+ purchase to demonstrate bonus points

## Port Configuration

- **Mock POS**: Port 4000
- **Integration Service**: Port 3000
- **Redis**: Port 6379 (if using queue)

Make sure these ports are available before starting.

## Production Notes

This is a **mock system for demonstration only**. For production:
- Use actual Genius POS system
- Implement proper authentication
- Add security measures
- Use real payment processing
- Implement proper error handling
- Add comprehensive logging

## License

MIT
