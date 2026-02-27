# Quick Start Guide

Get the Genius POS to Salesforce Loyalty Integration running in minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Redis 6+ installed and running
- [ ] Genius POS API credentials
- [ ] Salesforce org with Loyalty Management
- [ ] Salesforce Connected App created

## Installation (5 minutes)

### 1. Run Setup Script

```bash
cd genius-salesforce-loyalty-integration
./setup.sh
```

The script will:
- Verify Node.js version
- Check Redis installation
- Install npm dependencies
- Build TypeScript
- Create necessary directories
- Copy environment template

### 2. Configure Environment

Edit `.env` file with your credentials:

```bash
nano .env
```

**Required variables:**
```env
# Genius POS
GENIUS_API_KEY=your_api_key_here
GENIUS_STORE_ID=your_store_id

# Salesforce
SALESFORCE_USERNAME=your_username@company.com
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_token
SALESFORCE_CLIENT_ID=your_connected_app_client_id
SALESFORCE_CLIENT_SECRET=your_connected_app_client_secret
SALESFORCE_LOYALTY_PROGRAM_NAME=Whataburger Rewards
```

### 3. Start Redis

```bash
# macOS with Homebrew
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis

# Or run directly
redis-server
```

### 4. Start the Service

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
Server started on port 3000
Environment: development
Genius POS to Salesforce Loyalty Integration Service Running
```

### 5. Verify Installation

Test the health endpoint:

```bash
curl http://localhost:3000/api/webhooks/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-27T10:00:00Z",
  "queue": {
    "waiting": 0,
    "active": 0,
    "completed": 0,
    "failed": 0
  }
}
```

## Testing the Integration (10 minutes)

### Test 1: Member Lookup

```bash
curl -X GET "http://localhost:3000/api/loyalty/member/lookup?phone=5555551234"
```

### Test 2: Points Calculation

```bash
curl -X POST http://localhost:3000/api/loyalty/calculate-points \
  -H "Content-Type: application/json" \
  -d '{"amount": 25.50}'
```

### Test 3: Process Test Transaction

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

Check the job status:
```bash
curl -X GET "http://localhost:3000/api/admin/queue/job/{jobId}"
```

## Salesforce Setup (15 minutes)

### 1. Create Loyalty Program

1. Log in to Salesforce
2. Go to **Loyalty Management** app
3. Create new **Loyalty Program**:
   - Name: "Whataburger Rewards" (or your brand)
   - Type: Points-Based
   - Status: Active

### 2. Create Test Member

1. Create a **Contact**:
   - Phone: +15555551234
   - Email: test@example.com

2. Create **Loyalty Program Member**:
   - Link to Contact
   - Status: Active
   - Membership Number: TEST001

### 3. Configure Connected App

1. Go to **Setup** > **App Manager**
2. **New Connected App**
3. Enable OAuth Settings
4. Copy Consumer Key and Secret to `.env`

See `docs/SALESFORCE_SETUP.md` for detailed instructions.

## Genius POS Setup (10 minutes)

### 1. Configure Webhook in Genius POS

1. Log in to Genius Back Office
2. Navigate to **Settings** > **Integrations** > **Webhooks**
3. Create webhook:
   - URL: `https://your-domain.com/api/webhooks/genius/transaction`
   - Events: `transaction.created`, `transaction.completed`

### 2. Test Webhook Delivery

Make a test transaction in Genius POS and verify it appears in the integration logs.

See `docs/WEBHOOK_SETUP.md` for detailed instructions.

## Production Deployment (30 minutes)

### Option 1: Docker

```bash
docker-compose up -d
```

### Option 2: PM2

```bash
npm run build
pm2 start ecosystem.config.json
pm2 save
```

### Option 3: Cloud Platform

See `docs/DEPLOYMENT.md` for AWS, GCP, Azure, and Kubernetes deployment guides.

## Monitoring

### View Logs

```bash
# Development
npm run dev  # Logs to console

# Production
tail -f logs/combined.log
```

### Check Queue Status

```bash
curl http://localhost:3000/api/admin/queue/stats
```

### Monitor with PM2

```bash
pm2 monit
pm2 logs genius-loyalty-integration
```

## Common Issues & Solutions

### Issue: Redis Connection Failed

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Issue: Salesforce Authentication Failed

**Solution:**
- Verify username, password, and security token
- Ensure Connected App credentials are correct
- Check that user has necessary permissions

### Issue: Webhook Not Receiving Events

**Solution:**
- Verify webhook URL is correct
- Check SSL certificate is valid
- Ensure port 443 is open
- Review Genius POS webhook configuration

### Issue: Points Not Being Awarded

**Solution:**
- Check transaction meets minimum amount (default $1.00)
- Verify member exists and is active
- Review transaction status (must be "completed")
- Check logs for errors

## Next Steps

1. **Configure Production Environment**
   - Set up HTTPS with SSL certificate
   - Configure production Redis instance
   - Set up monitoring and alerts

2. **Train Staff**
   - How to look up loyalty members at POS
   - How to apply rewards/vouchers
   - Troubleshooting common issues

3. **Test End-to-End**
   - Complete test transaction
   - Verify points awarded
   - Test voucher redemption
   - Verify points reversal for voids

4. **Go Live**
   - Enable webhooks in production
   - Monitor initial transactions
   - Be ready to respond to issues

## Support & Documentation

- **Full Documentation**: `README.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Deployment**: `docs/DEPLOYMENT.md`
- **Salesforce Setup**: `docs/SALESFORCE_SETUP.md`
- **Webhook Setup**: `docs/WEBHOOK_SETUP.md`

## Example Integration Code

See `examples/pos-client.ts` for a complete example of integrating the loyalty service into a POS terminal.

## Troubleshooting Commands

```bash
# Check service status
curl http://localhost:3000/api/webhooks/health

# View recent logs
tail -n 50 logs/combined.log

# Check Redis
redis-cli ping

# Test Salesforce connection
npm run dev  # Watch startup logs

# View queue stats
curl http://localhost:3000/api/admin/queue/stats

# Check specific job
curl http://localhost:3000/api/admin/queue/job/{jobId}
```

## Performance Tips

1. **Use Redis in Production**: Don't use in-memory queue
2. **Scale Horizontally**: Run multiple instances behind load balancer
3. **Monitor API Limits**: Check Salesforce API usage regularly
4. **Cache Member Data**: Reduce Salesforce API calls
5. **Use CDN**: For static assets if adding web UI

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] Firewall rules in place
- [ ] Regular security updates
- [ ] Webhook signature verification (if supported by Genius POS)
- [ ] IP whitelisting for webhooks
- [ ] Monitoring and alerting configured

## Success Metrics

Track these KPIs to measure integration success:

- **Webhook Success Rate**: >99%
- **Processing Time**: <3 seconds
- **Points Accuracy**: 100%
- **Member Lookup Speed**: <500ms
- **Error Rate**: <0.1%

## Getting Help

If you encounter issues:

1. Check the logs: `logs/error.log`
2. Review the troubleshooting section above
3. Consult the detailed documentation
4. Check Redis and Salesforce connectivity
5. Verify configuration in `.env`

---

**Congratulations!** Your Genius POS to Salesforce Loyalty integration is now running. 🎉

For questions or issues, refer to the comprehensive documentation in the `docs/` directory.
