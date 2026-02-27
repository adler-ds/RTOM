# Heroku Deployment Files

This directory contains files for deploying to Heroku.

## Files

- **Procfile** - Tells Heroku how to run the app
- **app.json** - Configuration for one-click Heroku deployment
- **docs/HEROKU_DEPLOYMENT.md** - Complete deployment guide

## Quick Deploy

Click to deploy:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/adler-ds/genius-salesforce-loyalty-integration)

## Manual Deploy

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add Redis
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set GENIUS_API_KEY="your_key"
heroku config:set SALESFORCE_USERNAME="user@example.com"
# ... (see HEROKU_DEPLOYMENT.md for all variables)

# Deploy
git push heroku main

# Open app
heroku open
```

See `docs/HEROKU_DEPLOYMENT.md` for complete instructions.
