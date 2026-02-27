# Heroku Deployment Guide

Complete guide for deploying the Genius POS to Salesforce Loyalty Integration to Heroku.

## Prerequisites

- Heroku account ([sign up free](https://signup.heroku.com/))
- Heroku CLI installed ([download](https://devcenter.heroku.com/articles/heroku-cli))
- Git repository (already set up!)
- Salesforce org with Loyalty Management configured

## Quick Deploy

### Option 1: Deploy Button (Easiest)

Click this button to deploy directly to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/adler-ds/genius-salesforce-loyalty-integration)

This will:
1. Create a new Heroku app
2. Provision Heroku Redis addon
3. Prompt you for environment variables
4. Build and deploy the application

### Option 2: Heroku CLI

#### 1. Install Heroku CLI

**macOS:**
```bash
brew tap heroku/brew && brew install heroku
```

**Other platforms:** [Download installer](https://devcenter.heroku.com/articles/heroku-cli)

#### 2. Login to Heroku

```bash
heroku login
```

#### 3. Create Heroku App

```bash
cd genius-salesforce-loyalty-integration

# Create app (Heroku will generate a name if you don't specify one)
heroku create genius-loyalty-integration

# Or with custom name
heroku create your-app-name
```

#### 4. Add Redis Addon

```bash
heroku addons:create heroku-redis:mini
```

**Plans available:**
- `mini` - Free for development/testing (25MB, 20 connections)
- `premium-0` - $15/month (25MB, 40 connections)
- `premium-1` - $60/month (100MB, 100 connections)

#### 5. Configure Environment Variables

```bash
# Genius POS Configuration
heroku config:set GENIUS_API_KEY="your_genius_api_key"
heroku config:set GENIUS_STORE_ID="your_store_id"
heroku config:set GENIUS_TERMINAL_ID="terminal_001"
heroku config:set GENIUS_API_BASE_URL="https://api.xenial.com/v1"

# Salesforce Configuration
heroku config:set SALESFORCE_USERNAME="integration@yourcompany.com"
heroku config:set SALESFORCE_PASSWORD="your_password"
heroku config:set SALESFORCE_SECURITY_TOKEN="your_security_token"
heroku config:set SALESFORCE_CLIENT_ID="your_connected_app_client_id"
heroku config:set SALESFORCE_CLIENT_SECRET="your_connected_app_secret"
heroku config:set SALESFORCE_LOYALTY_PROGRAM_NAME="Your Loyalty Program"
heroku config:set SALESFORCE_LOGIN_URL="https://login.salesforce.com"

# Points Configuration
heroku config:set POINTS_PER_DOLLAR="10"
heroku config:set MINIMUM_TRANSACTION_FOR_POINTS="1.00"

# Application Configuration
heroku config:set NODE_ENV="production"
heroku config:set LOG_LEVEL="info"
```

Or set all at once from your `.env` file:
```bash
# Edit .env file first, then:
cat .env | heroku config:set
```

#### 6. Deploy to Heroku

```bash
# Push to Heroku
git push heroku main

# Or if you're on a different branch
git push heroku your-branch:main
```

#### 7. Scale Dynos

```bash
# Ensure web dyno is running
heroku ps:scale web=1
```

#### 8. Open Your App

```bash
heroku open
```

Or visit: `https://your-app-name.herokuapp.com`

---

## Verify Deployment

### Check Health Endpoint

```bash
curl https://your-app-name.herokuapp.com/api/webhooks/health
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

### View Logs

```bash
# Real-time logs
heroku logs --tail

# Last 100 lines
heroku logs -n 100

# Filter by dyno
heroku logs --dyno web

# Filter by level
heroku logs --tail | grep ERROR
```

---

## Configure Genius POS Webhooks

Once deployed, configure your Genius POS webhooks to point to your Heroku app:

**Webhook URL:**
```
https://your-app-name.herokuapp.com/api/webhooks/genius/transaction
```

**Void Webhook URL:**
```
https://your-app-name.herokuapp.com/api/webhooks/genius/void
```

See `docs/WEBHOOK_SETUP.md` for detailed webhook configuration.

---

## Redis Configuration

Heroku automatically configures Redis connection using these environment variables:
- `REDIS_URL` - Complete Redis connection URL
- `REDIS_TLS_URL` - TLS Redis connection URL

The application automatically detects and uses these.

To view Redis info:
```bash
heroku redis:info
```

To access Redis CLI:
```bash
heroku redis:cli
```

---

## Scaling

### Vertical Scaling (Dyno Size)

Upgrade dyno type for more resources:

```bash
# Standard-1X: $25/month (512MB RAM)
heroku ps:resize web=standard-1x

# Standard-2X: $50/month (1GB RAM)
heroku ps:resize web=standard-2x

# Performance-M: $250/month (2.5GB RAM)
heroku ps:resize web=performance-m
```

### Horizontal Scaling (More Dynos)

Run multiple instances:

```bash
# Run 2 web dynos
heroku ps:scale web=2

# Run 3 web dynos
heroku ps:scale web=3
```

**Note:** Multiple dynos require Redis to share queue state.

---

## Monitoring

### Heroku Dashboard

View metrics at: `https://dashboard.heroku.com/apps/your-app-name`

Metrics include:
- Response time
- Throughput
- Memory usage
- Error rate

### Application Logs

```bash
# Watch logs in real-time
heroku logs --tail

# Save logs to file
heroku logs -n 1000 > logs.txt
```

### Enable Log Drains

Forward logs to external services:

```bash
# Papertrail
heroku addons:create papertrail

# Logentries
heroku addons:create logentries
```

---

## Maintenance

### Restart Application

```bash
heroku restart
```

### Run Commands

```bash
# Open bash console
heroku run bash

# Run one-off task
heroku run node dist/index.js
```

### Database Backups

Redis data is ephemeral on Heroku. For persistence:

```bash
# Upgrade to production Redis plan
heroku addons:create heroku-redis:premium-0
```

---

## Environment Variables Management

### View All Config

```bash
heroku config
```

### Get Specific Variable

```bash
heroku config:get SALESFORCE_USERNAME
```

### Update Variable

```bash
heroku config:set POINTS_PER_DOLLAR="15"
```

### Remove Variable

```bash
heroku config:unset VARIABLE_NAME
```

### Bulk Update from File

Create `heroku-config.txt`:
```
GENIUS_API_KEY=your_key
SALESFORCE_USERNAME=user@example.com
```

Then apply:
```bash
cat heroku-config.txt | xargs heroku config:set
```

---

## Custom Domain

### Add Custom Domain

```bash
heroku domains:add loyalty.yourdomain.com
```

### Configure DNS

Add CNAME record:
```
loyalty.yourdomain.com -> your-app-name.herokuapp.com
```

### Enable SSL

```bash
heroku certs:auto:enable
```

Heroku automatically provisions SSL certificates via Let's Encrypt.

---

## Troubleshooting

### Application Crashes

**Check logs:**
```bash
heroku logs --tail
```

**Common issues:**
- Missing environment variables
- Redis connection failed
- Salesforce authentication failed
- Port binding issues

### Redis Connection Issues

**Check Redis status:**
```bash
heroku redis:info
```

**Verify connection string:**
```bash
heroku config:get REDIS_URL
```

### Out of Memory

**Check memory usage:**
```bash
heroku ps
```

**Solutions:**
- Upgrade to larger dyno
- Optimize code
- Check for memory leaks

### Build Failures

**View build logs:**
```bash
heroku builds:info
```

**Common causes:**
- Missing dependencies in package.json
- TypeScript compilation errors
- Node version mismatch

---

## Cost Estimation

### Free Tier
- **Dyno**: Free (550-1000 hours/month)
- **Redis**: Mini plan (free for hobby apps)
- **Total**: $0/month

**Limitations:**
- Dynos sleep after 30 min inactivity
- 25MB Redis storage
- No custom domain SSL

### Production Tier
- **Dyno**: Standard-1X ($25/month)
- **Redis**: Premium-0 ($15/month)
- **Total**: $40/month

**Benefits:**
- No sleeping dynos
- 40 Redis connections
- Free SSL for custom domains
- 99.95% uptime SLA

---

## Security Best Practices

1. **Use SSL/TLS**: Enabled by default on Heroku
2. **Rotate credentials**: Update tokens regularly
3. **Limit access**: Use IP whitelisting if possible
4. **Monitor logs**: Set up alerts for errors
5. **Keep dependencies updated**: Run `npm audit`

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix
```

---

## Continuous Deployment

### Connect to GitHub

Enable automatic deploys from GitHub:

1. Go to: `https://dashboard.heroku.com/apps/your-app-name/deploy/github`
2. Connect GitHub repository
3. Enable "Automatic Deploys" from main branch
4. (Optional) Enable "Wait for CI to pass"

Now every push to GitHub automatically deploys to Heroku!

### Review Apps

Enable review apps for pull requests:

1. Create `heroku.yml` in your repo
2. Enable review apps in Heroku dashboard
3. Each PR gets its own app for testing

---

## Heroku CLI Quick Reference

```bash
# App management
heroku apps:info                    # View app info
heroku apps:destroy --confirm name  # Delete app

# Logs
heroku logs --tail                  # Stream logs
heroku logs -n 500                  # Last 500 lines

# Config
heroku config                       # View all config
heroku config:set KEY=value         # Set config
heroku config:unset KEY             # Remove config

# Scaling
heroku ps                           # View dynos
heroku ps:scale web=2               # Scale to 2 dynos
heroku ps:restart                   # Restart app

# Redis
heroku redis:info                   # Redis status
heroku redis:cli                    # Redis console

# Addons
heroku addons                       # List addons
heroku addons:create NAME           # Add addon
heroku addons:destroy NAME          # Remove addon

# Releases
heroku releases                     # View releases
heroku rollback v123                # Rollback to version
```

---

## Support

- **Heroku Support**: https://help.heroku.com
- **Status Page**: https://status.heroku.com
- **Dev Center**: https://devcenter.heroku.com
- **Community**: https://stackoverflow.com/questions/tagged/heroku

---

## Next Steps

1. ✅ Deploy to Heroku
2. ✅ Configure environment variables
3. ✅ Set up custom domain (optional)
4. ✅ Configure Genius POS webhooks
5. ✅ Test with mock POS or real transactions
6. ✅ Enable monitoring and alerts
7. ✅ Set up CI/CD from GitHub

Your integration is now running in the cloud! 🚀
