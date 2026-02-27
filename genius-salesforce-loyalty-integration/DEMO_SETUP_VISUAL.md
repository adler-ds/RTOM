# Complete Demo Setup - Visual Guide

## System Architecture for Demo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR DEMO ENVIRONMENT                        │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │                     Browser (Chrome/Firefox)                  │
    │                   http://localhost:4000                       │
    │                                                               │
    │  ┌────────────────────────────────────────────────────────┐ │
    │  │          🍔 Mock Whataburger POS Interface             │ │
    │  │                                                         │ │
    │  │  📱 Product Menu    │  🛒 Shopping Cart                │ │
    │  │  - Burgers          │  - Customer Info                 │ │
    │  │  - Chicken          │  - Loyalty Preview               │ │
    │  │  - Sides            │  - Order Summary                 │ │
    │  │  - Drinks           │  - Complete Sale                 │ │
    │  │                     │                                  │ │
    │  │  📊 Transaction History                                │ │
    │  │  - View all transactions                               │ │
    │  │  - Void transactions                                   │ │
    │  │  - Webhook status                                      │ │
    │  └────────────────────────────────────────────────────────┘ │
    └───────────────────────┬──────────────────────────────────────┘
                            │ HTTP API Calls
                            ▼
    ┌──────────────────────────────────────────────────────────────┐
    │              Terminal 3: Mock POS Server                      │
    │              Port 4000 (Express/Node.js)                      │
    │                                                               │
    │  server.js:                                                   │
    │  - Product catalog API                                        │
    │  - Transaction creation                                       │
    │  - Void handling                                              │
    │  - Configuration management                                   │
    │                                                               │
    │  On transaction: Sends webhook ────────────┐                │
    └───────────────────────────────────────────┼─────────────────┘
                                                 │
                                                 │ Webhook POST
                                                 │ /api/webhooks/genius/transaction
                                                 ▼
    ┌──────────────────────────────────────────────────────────────┐
    │      Terminal 2: Integration Service (npm run dev)           │
    │              Port 3000 (Express/TypeScript)                   │
    │                                                               │
    │  Express API Server:                                          │
    │  ├── Webhook Controller ← Receives POS events                │
    │  ├── Loyalty Controller ← Member lookup                      │
    │  └── Admin Controller ← Queue management                     │
    │                                                               │
    │  Integration Service:                                         │
    │  ├── Process transaction                                      │
    │  ├── Lookup loyalty member                                    │
    │  ├── Calculate points (base + bonus)                         │
    │  ├── Award points in Salesforce                              │
    │  └── Update customer in POS                                  │
    │                                                               │
    │  Queue Service (Bull):                                        │
    │  └── Async job processing with retry ─────┐                 │
    └───────────────────────┬───────────────────┼─────────────────┘
                            │                   │
                            │ Redis Queue       │ Salesforce API
                            ▼                   ▼
    ┌─────────────────────────┐    ┌──────────────────────────────┐
    │  Terminal 1: Redis      │    │   Salesforce Org             │
    │  Port 6379              │    │                              │
    │                         │    │  - Loyalty Program           │
    │  - Transaction queue    │    │  - Program Members           │
    │  - Job retry logic      │    │  - Transaction Journals      │
    │  - Status tracking      │    │  - Loyalty Ledger            │
    └─────────────────────────┘    │  - Vouchers                  │
                                   └──────────────────────────────┘
```

## Terminal Setup Guide

### Before Starting

Create 3 terminal windows/tabs:

```
Terminal 1: Redis Server
Terminal 2: Integration Service
Terminal 3: Mock POS Server
```

---

### Terminal 1: Redis

**Location:** Anywhere  
**Command:**
```bash
redis-server
```

**What to look for:**
```
Ready to accept connections on port 6379
```

**Keep this running** - Don't close this terminal

---

### Terminal 2: Integration Service

**Location:** `genius-salesforce-loyalty-integration/`  
**Commands:**
```bash
cd genius-salesforce-loyalty-integration

# First time only:
./setup.sh
# Edit .env with Salesforce credentials

# Every time:
npm run dev
```

**What to look for:**
```
Server started on port 3000
Successfully connected to Salesforce
Genius POS to Salesforce Loyalty Integration Service Running
```

**Logs will show** when webhooks are received and processed

**Keep this running** - Don't close this terminal

---

### Terminal 3: Mock POS

**Location:** `genius-salesforce-loyalty-integration/mock-pos/`  
**Commands:**
```bash
cd genius-salesforce-loyalty-integration/mock-pos

# First time only:
./setup.sh

# Every time:
npm start
```

**What to look for:**
```
Mock Genius POS Server
Server running on http://localhost:4000
Store ID: store_001
Webhook URL: http://localhost:3000/api/webhooks/genius/transaction
```

**Logs will show** webhook sends and API calls

**Keep this running** - Don't close this terminal

---

## Data Flow During Demo

### When Customer Makes Purchase:

```
1. Cashier selects items
   └─> Mock POS: Items added to cart

2. Cashier enters customer phone
   └─> Mock POS → Integration Service
       └─> GET /api/loyalty/member/lookup?phone=5555551234
           └─> Integration Service → Salesforce
               └─> Query LoyaltyProgramMember
                   └─> Return member + points balance
                       └─> Show loyalty preview in POS

3. Cashier clicks "Complete Sale"
   └─> Mock POS: Creates transaction
       └─> POST /api/transactions
           └─> Sends webhook to Integration Service
               └─> POST /api/webhooks/genius/transaction
                   └─> Queues job in Redis
                       └─> Process job:
                           ├─> Lookup member (Salesforce)
                           ├─> Calculate points
                           ├─> Create Transaction Journal (SF)
                           ├─> Create Loyalty Ledger (SF)
                           └─> Update points balance

4. Transaction complete!
   └─> Mock POS: Shows success
   └─> Integration logs: "Points awarded successfully"
   └─> Salesforce: New ledger entry with points
```

### When Transaction is Voided:

```
1. Cashier clicks "Void Transaction"
   └─> Mock POS: POST /transactions/{id}/void
       └─> Sends void webhook to Integration Service
           └─> POST /api/webhooks/genius/void
               └─> Queues void job in Redis
                   └─> Process job:
                       ├─> Lookup original transaction
                       ├─> Calculate points to reverse
                       ├─> Create reversal journal (SF)
                       └─> Debit loyalty ledger (SF)

2. Void complete!
   └─> Mock POS: Shows "VOIDED" status
   └─> Integration logs: "Points reversed"
   └─> Salesforce: Debit entry in ledger
```

---

## Ports Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Mock POS | 4000 | http://localhost:4000 | Web UI for demo |
| Integration | 3000 | http://localhost:3000 | API service |
| Redis | 6379 | N/A | Queue backend |

---

## Quick Health Checks

### Check Integration Service
```bash
curl http://localhost:3000/api/webhooks/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-27T10:00:00Z",
  "queue": { "waiting": 0, "active": 0, ... }
}
```

### Check Mock POS
```bash
curl http://localhost:4000/api/config
```

**Expected:**
```json
{
  "storeId": "store_001",
  "terminalId": "terminal_001",
  "webhookUrl": "http://localhost:3000/...",
  "webhookEnabled": true
}
```

### Check Redis
```bash
redis-cli ping
```

**Expected:**
```
PONG
```

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Port 4000 in use | Kill process: `lsof -ti:4000 \| xargs kill -9` |
| Port 3000 in use | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| Redis not running | Start: `redis-server` |
| Can't connect to SF | Check `.env` credentials |
| Webhook fails | Check integration service logs |
| Member not found | Verify member exists in SF |

---

## Demo Checklist

### Pre-Demo (5 min)
- [ ] Redis running (Terminal 1)
- [ ] Integration service running (Terminal 2)
- [ ] Mock POS running (Terminal 3)
- [ ] Browser open to http://localhost:4000
- [ ] Test member exists in Salesforce (phone: 5555551234)
- [ ] All transactions cleared in mock POS
- [ ] Test webhook from Settings page

### During Demo
- [ ] Show guest transaction (no loyalty)
- [ ] Show loyalty member transaction
- [ ] Show points calculation with bonus
- [ ] Demonstrate void/reversal
- [ ] Show transaction history

### Post-Demo
- [ ] Show Salesforce ledger entries
- [ ] Show queue statistics
- [ ] Answer questions

---

## File Locations

```
genius-salesforce-loyalty-integration/
├── mock-pos/                    ← Mock POS application
│   ├── server.js                ← Backend server
│   ├── public/
│   │   ├── index.html           ← POS UI
│   │   ├── styles.css           ← Styling
│   │   └── app.js               ← Frontend logic
│   ├── package.json
│   └── README.md
├── src/                         ← Integration service
│   ├── controllers/
│   ├── services/
│   └── ...
├── docs/                        ← Documentation
├── DEMO_GUIDE.md                ← This guide!
└── README.md                    ← Main docs
```

---

## Pro Tips

1. **Keep terminals visible** - Arrange side-by-side to show real-time logs
2. **Use large fonts** - Terminal text should be readable to audience
3. **Prepare backups** - Have screenshots/video ready
4. **Test beforehand** - Run through entire demo 30 minutes before
5. **Have data ready** - Pre-create test members in Salesforce

---

**You're ready to demo! 🚀**
