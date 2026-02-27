# Demo Guide - Mock Genius POS & Loyalty Integration

Complete guide for demonstrating the integration using the mock POS system.

## Setup (5 minutes)

### 1. Prerequisites Check

```bash
# Verify Node.js installed
node -v  # Should be 18+

# Verify Redis installed
redis-cli ping  # Should return PONG
```

### 2. Start Services

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - Integration Service:**
```bash
cd genius-salesforce-loyalty-integration
npm run dev
```

Wait for: "Genius POS to Salesforce Loyalty Integration Service Running"

**Terminal 3 - Mock POS:**
```bash
cd genius-salesforce-loyalty-integration/mock-pos
npm install  # First time only
npm start
```

Wait for: "Mock Genius POS Server running on http://localhost:4000"

### 3. Open Mock POS

Open browser to: **http://localhost:4000**

You should see the Whataburger POS interface!

---

## Demo Scenarios

### Scenario 1: Guest Transaction (No Loyalty) ⭐

**Purpose:** Show basic transaction flow without loyalty integration

**Steps:**
1. Click on products to add to cart:
   - 1x Whataburger ($8.99)
   - 1x French Fries - Medium ($3.49)
   - 1x Soft Drink - Medium ($2.49)

2. **Don't enter** any customer information

3. Review order summary:
   - Subtotal should show ~$14.97
   - Tax: ~$1.23
   - Total: ~$16.20

4. Click **"Complete Sale"**

5. **Success modal appears:**
   - ✓ Transaction completed
   - ✗ Webhook sent (but member not found)
   - Message: "Tip: Enter phone or email to earn loyalty points!"

6. **Show transaction history** at bottom:
   - Transaction appears
   - Status: COMPLETED
   - No customer info attached

**Key Points:**
- ✅ Transaction completes successfully
- ✅ Webhook sent to integration service
- ⚠️ No points awarded (no loyalty member)

---

### Scenario 2: Loyalty Member Transaction ⭐⭐⭐

**Purpose:** Demonstrate full loyalty integration with points accrual

**Prerequisites:**
- Create a test member in Salesforce:
  - Phone: `5555551234`
  - Email: `test@example.com`
  - Status: Active

**Steps:**
1. Clear previous order if needed

2. Add items to cart:
   - 2x Double Meat Whataburger ($11.99 each = $23.98)
   - 1x French Fries - Large ($4.49)
   - 1x Shake - Chocolate ($4.99)

3. **Enter customer phone:** `5555551234`

4. **🎯 Watch the magic happen:**
   - Loyalty preview appears automatically
   - Shows member name
   - Shows current points balance
   - Shows **points to earn** from this transaction

5. Review the calculation:
   - Subtotal: ~$33.46
   - Points to earn: **358 points** (333 base + 25 bonus for $25+ purchase)

6. Click **"Complete Sale"**

7. **Success modal shows:**
   - ✓ Transaction completed
   - ✓ Webhook sent to loyalty system
   - "Loyalty points will be awarded!"

8. **Verify in transaction history:**
   - Customer phone shown (📞 5555551234)
   - Webhook status: ✓ Webhook sent

9. **Check integration service logs:**
   - Should show "Points awarded successfully"
   - Points: 358
   - Member ID and new balance

10. **Verify in Salesforce:**
    - Check Loyalty Ledger
    - New entry with 358 points
    - Transaction journal created

**Key Points:**
- ✅ Real-time member lookup
- ✅ Points preview before checkout
- ✅ Automatic webhook to integration
- ✅ Points awarded in Salesforce
- ✅ Bonus points for $25+ purchase

---

### Scenario 3: Large Transaction with Bonus Points ⭐⭐⭐

**Purpose:** Show bonus point tiers

**Steps:**
1. Add items totaling over $50:
   - 3x Double Meat Whataburger ($35.97)
   - 2x Chicken Strip Meal ($19.98)
   - 2x Shake - Vanilla ($9.98)

2. Enter customer phone: `5555551234`

3. **Watch points calculation:**
   - Subtotal: ~$65.93
   - Points to earn: **709 points** (659 base + 50 bonus for $50+ purchase)

4. Complete transaction

5. **Highlight:**
   - "See how large orders get bonus points!"
   - $25-49.99 = +25 bonus
   - $50+ = +50 bonus

**Key Points:**
- ✅ Tiered bonus system
- ✅ Incentivizes larger purchases

---

### Scenario 4: Void Transaction & Points Reversal ⭐⭐⭐

**Purpose:** Demonstrate void handling and points reversal

**Prerequisites:**
- Complete a loyalty transaction first (Scenario 2)

**Steps:**
1. Locate the completed transaction in history

2. Note the customer and amount

3. Click **"Void Transaction"** button

4. Confirm the void: "This will reverse loyalty points"

5. **Transaction updates:**
   - Status changes to: VOIDED
   - Styled in red/gray
   - Second webhook sent

6. **Check integration service logs:**
   - "Voided transaction processed"
   - "Points reversed"
   - Negative points ledger entry

7. **Verify in Salesforce:**
   - New loyalty ledger entry
   - Debit (negative points)
   - Points balance reduced

**Key Points:**
- ✅ Automatic void detection
- ✅ Points reversal webhook
- ✅ Audit trail in Salesforce
- ✅ Prevents fraud/abuse

---

### Scenario 5: Multiple Customer Types ⭐⭐

**Purpose:** Show handling of different customer scenarios

**Test different customers:**

**Test 1: Phone Number**
- Enter: `5555551234`
- Result: ✓ Member found

**Test 2: Email Address**
- Clear cart and phone
- Enter: `test@example.com`
- Result: ✓ Same member found

**Test 3: Non-member**
- Clear cart and customer info
- Enter: `5555559999` (doesn't exist)
- Result: ⚠️ No loyalty preview (guest checkout)

**Test 4: Invalid Format**
- Enter: `555` (incomplete)
- Result: ⚠️ No lookup (waits for valid format)

**Key Points:**
- ✅ Multiple lookup methods
- ✅ Graceful handling of non-members
- ✅ Format validation

---

## Advanced Demo Features

### Settings Configuration ⚙️

1. Click **⚙️ Settings** button

2. Show configurable options:
   - Store ID
   - Terminal ID
   - Webhook URL
   - Enable/disable webhooks

3. Click **"Test Webhook"**
   - Sends test payload
   - Shows success/failure
   - Validates connectivity

4. Try changing webhook URL:
   - Change to invalid URL
   - Try transaction
   - Show webhook failure
   - Restore correct URL

### Transaction History

1. Show **"Recent Transactions"** panel

2. Point out features:
   - Transaction ID
   - Timestamp
   - Amount
   - Item count
   - Customer info
   - Webhook status
   - Void button

3. Click **"🔄 Refresh"** to reload

4. Click **"🗑️ Clear All"** to reset demo

### Points Calculation

1. Before completing a transaction, show the math:
   - Base points: Amount × 10
   - Bonus points: Based on tier
   - Total points displayed

2. Use browser console to call API directly:
```javascript
fetch('http://localhost:3000/api/loyalty/calculate-points', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({amount: 45.67})
}).then(r => r.json()).then(console.log)
```

---

## Troubleshooting During Demo

### Issue: Webhook Failed

**Solution:**
1. Check integration service is running
2. Open Settings in mock POS
3. Click "Test Webhook"
4. Verify URL is correct
5. Check integration service logs

### Issue: Member Not Found

**Solution:**
1. Verify member exists in Salesforce
2. Check phone number format (no dashes)
3. Verify integration service connected to SF
4. Check integration logs for errors

### Issue: Page Won't Load

**Solution:**
1. Verify mock POS running on port 4000
2. Check for port conflicts
3. Restart mock POS server
4. Clear browser cache

---

## Demo Script (10 minutes)

### Introduction (1 min)
"Today I'll demonstrate our Genius POS to Salesforce Loyalty integration using a mock POS terminal. This shows real-time loyalty point accrual, member lookup, and transaction processing."

### Basic Transaction (2 min)
"Let's start with a simple order..." [Scenario 1]
"Notice the transaction completes but no points are awarded because we don't have a loyalty member."

### Loyalty Member Transaction (4 min)
"Now let's see what happens with a loyalty member..." [Scenario 2]
"As soon as I enter the phone number, the system instantly looks up the member and shows their current points. It also calculates how many points they'll earn from this purchase. Watch - 358 points! That's 333 base points plus 25 bonus points for spending over $25."

### Large Transaction Bonus (1 min)
"For larger purchases, we offer even more bonus points..." [Scenario 3]
"See? This $65 order earns 709 points - that includes a 50 point bonus for spending over $50."

### Void & Reversal (2 min)
"What if we need to void a transaction? The system handles that too..." [Scenario 4]
"I'll void this transaction, and you can see it automatically sends a webhook to reverse the loyalty points. This prevents fraud and maintains accurate point balances."

### Conclusion (30 sec)
"As you can see, the integration provides seamless real-time loyalty processing with automatic point accrual, bonus tiers, and transaction reversal - all without requiring any manual intervention from staff."

---

## Pro Tips

1. **Keep it moving**: Don't get stuck in technical details unless asked
2. **Have backup**: Prepare a pre-recorded video in case of technical issues
3. **Use real scenarios**: Frame demonstrations as real customer interactions
4. **Show the value**: Emphasize benefits like "no manual entry" and "real-time"
5. **Be ready for questions**: Know common integration points and technical details

---

## Quick Reset

Between demos or if something goes wrong:

```bash
# Clear all transactions
curl -X DELETE http://localhost:4000/api/transactions

# Refresh browser
F5 or Cmd+R

# Restart services if needed
Ctrl+C in terminals
Re-run npm start / npm run dev
```

---

## Additional Resources

- **Mock POS README**: `mock-pos/README.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Integration Logs**: Check terminal running integration service

---

## Questions to Anticipate

**Q: How fast is the member lookup?**
A: Typically under 500ms - happens in real-time as the cashier enters the phone number.

**Q: What if Salesforce is down?**
A: Transactions queue in Redis and retry automatically. Customers can still checkout, points are awarded when Salesforce comes back online.

**Q: Can we customize the points rules?**
A: Yes! Points per dollar and bonus tiers are fully configurable in the .env file.

**Q: How do we handle refunds/voids?**
A: Voids automatically reverse points. For refunds, the system supports partial refunds with proportional point deductions.

**Q: Is this secure?**
A: Yes - HTTPS enforced, rate limiting, input validation, and audit logging are all included.

---

**Good luck with your demo! 🎉**
