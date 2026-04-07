# GitHub + Heroku Auto-Deploy Instructions

This project follows the same deployment pattern used in `Football-Throw-Game`:
- Node app with `npm start`
- `Procfile` (`web: node server.js`)
- Environment variables in Heroku Config Vars (never in git)

## 1) Confirm GitHub remote

This repo is already linked to:
- `origin`: `https://github.com/adler-ds/RTOM.git`

Check:
```bash
git -C "/Users/dadler/Cursor Projects/RTOM-Retail-Banking" remote -v
```

## 2) Push code to GitHub

```bash
cd "/Users/dadler/Cursor Projects/RTOM-Retail-Banking"
git add .
git commit -m "Initial Salesforce Personalization web app"
git push -u origin main
```

## 3) Create Heroku app (one-time)

```bash
heroku login
heroku create rtom-retail-banking
```

## 4) Connect Heroku to GitHub for automatic deploys

Heroku Dashboard:
1. Open your Heroku app
2. Go to **Deploy** tab
3. Deployment method: **GitHub**
4. Connect repository: `adler-ds/RTOM`
5. Choose branch: `main`
6. Enable **Automatic Deploys**

## 5) Set required Heroku config vars

```bash
heroku config:set PERSONALIZATION_BASE_URL="https://your-tenant-specific-endpoint.com" --app rtom-retail-banking
heroku config:set PERSONALIZATION_ACCESS_TOKEN="your_access_token" --app rtom-retail-banking
heroku config:set PORT=3001 --app rtom-retail-banking
```

## 6) Verify

```bash
heroku logs --tail --app rtom-retail-banking
curl https://rtom-retail-banking.herokuapp.com/api/health
```

Expected health response includes:
- `status: "ok"`
- `service: "Salesforce Personalization"`

## Notes

- Keep secrets only in Heroku Config Vars and local `.env`.
- `Procfile` is required for Heroku web dyno startup.
- Every push to `main` triggers auto deploy once GitHub integration is enabled.
