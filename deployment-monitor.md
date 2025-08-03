# Deployment Monitoring Guide

## Current Deployment Status

✅ **Changes Pushed**: Updated app.yaml configuration pushed to GitHub
🔄 **Auto-Deploy**: DigitalOcean should automatically trigger new deployment

## What to Monitor

### 1. DigitalOcean App Platform Dashboard

Visit: <https://cloud.digitalocean.com/apps>

**Look for:**

- ✅ New deployment starting for `spaghetti-platform`
- 🔄 Two components building:
  - **frontend** (Static Site)
  - **api** (Service)

### 2. Build Logs to Watch

**Frontend Build (Static Site):**

```bash
# Should see:
npm ci
npm run build
✓ built in X.Xs
```

**API Build (Service):**

```bash
# Should see:
dotnet restore
dotnet build
✓ Build succeeded
```

### 3. Expected Configuration Changes

**Before (Current Issue):**

- Single service at root showing "Hello! you've requested /"

**After (Fixed):**

- **Frontend**: Static site at `/` serving React app
- **API**: Service at `/api/*` handling backend requests

## Monitoring Commands

### Check deployment status

```bash
# If you have doctl installed:
doctl apps list
doctl apps get <app-id>

# Check logs:
doctl apps logs <app-id> --type=build
doctl apps logs <app-id> --type=deploy
```

### Manual verification

```bash
# Test frontend (should show React app HTML):
curl -I https://spaghetti-platform-drgev.ondigitalocean.app/

# Test API (should return API response):
curl -I https://spaghetti-platform-drgev.ondigitalocean.app/api/health
```

## NOTE: Use the installed `shot-scraper` python command line tool (Documentation is at <https://shot-scraper.datasette.io/en/stable/>) to capture screenshots of the deployed platform when needed.


## Common Issues & Solutions

### Issue 1: Frontend build fails

**Symptoms:** Static site deployment fails during npm build
**Solution:** Check if all dependencies are in package.json

```bash
# Fix command:
cd src/frontend && npm install --save-dev missing-package
```

### Issue 2: API routing conflicts

**Symptoms:** API returns 404 for /api calls
**Solution:** Update API controller routes to include /api prefix

### Issue 3: Environment variables missing

**Symptoms:** Frontend can't connect to API
**Solution:** Verify VITE_API_BASE_URL is set correctly in app.yaml

## Success Indicators

✅ **Frontend Working:**

- Homepage loads React application
- No "Hello! you've requested /" message
- Console shows no major errors

✅ **API Working:**

- `/api/health` returns 200 status
- API calls from frontend succeed
- No CORS errors in browser console

✅ **Routing Working:**

- Frontend routes (like `/dashboard`) work
- API calls go to correct backend
- Static assets load properly

## Next Steps After Deployment

1. **Test Authentication Flow**
2. **Verify All React Routes**
3. **Check API Integration**
4. **Monitor Performance**
5. **Set up SSL (if needed)**

## Emergency Rollback

If deployment fails, revert app.yaml:

```bash
git revert HEAD
git push origin master
```
