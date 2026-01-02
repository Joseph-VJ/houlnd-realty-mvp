# Deployment Troubleshooting Guide

Common issues when deploying to Vercel and their solutions.

---

## 🔴 Error: "Server Action not found on the server"

### Symptoms
```
Server Action "60f1f3be8ad48457ffd2460a3248d5b70529cbca4a" was not found on the server.
Read more: https://nextjs.org/docs/messages/failed-to-find-server-action
```

### Cause
This happens when there's a **cache mismatch** between:
- Your browser's cached JavaScript (old build)
- The server's current deployment (new build)

Common after:
- Redeploying the app
- Updating environment variables
- Making code changes

### ✅ Solutions (Try in Order)

#### 1. Hard Refresh Browser (Fastest)
**Windows/Linux**: `Ctrl + Shift + R`
**Mac**: `Cmd + Shift + R`

This forces your browser to download fresh JavaScript from the server.

#### 2. Clear Browser Cache Completely
1. Press `F12` to open Dev Tools
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

**OR**

- **Chrome**: Settings → Privacy → Clear browsing data → Cached images and files
- **Firefox**: Settings → Privacy → Clear Data → Cached Web Content
- **Edge**: Settings → Privacy → Clear browsing data → Cached images and files

#### 3. Try Incognito/Private Window
- **Chrome**: `Ctrl + Shift + N`
- **Firefox**: `Ctrl + Shift + P`
- **Edge**: `Ctrl + Shift + N`

Visit your app in incognito mode. If it works here, it's definitely a cache issue.

#### 4. Force Clean Redeploy on Vercel

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. ✅ Make sure **"Use existing Build Cache"** is **DISABLED**
5. Click **"Redeploy"**
6. Wait for build to complete
7. Hard refresh your browser again (`Ctrl + Shift + R`)

#### 5. Clear Vercel Edge Cache

Sometimes Vercel's CDN caches responses. To clear it:

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the **Production** deployment
3. Click **"..."** → **"Promote to Production"**
4. This forces a cache purge

---

## 🔴 Error: "Invalid API key"

### Symptoms
Red error banner: "Invalid API key" on login page

### Cause
Supabase environment variables are missing or incorrect

### ✅ Solution

1. **Get credentials from Supabase**:
   - Go to Supabase Dashboard → Settings → API
   - Copy **Project URL**: `https://xxxxx.supabase.co`
   - Copy **anon public key**: Long string starting with `eyJ...`

2. **Update in Vercel**:
   - Settings → Environment Variables
   - Update `NEXT_PUBLIC_SUPABASE_URL` with Project URL
   - Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` with anon key
   - **Make sure to copy the FULL key** (200+ characters)

3. **Redeploy**: Deployments → Redeploy

---

## 🔴 Error: "Invalid login credentials"

### Symptoms
Error message when trying to log in with test credentials

### Cause
Database has no users yet (seed data not loaded)

### ✅ Solution

Run the seed command to create test users:

```bash
# Replace with your actual DATABASE_URL
DATABASE_URL="postgresql://..." npx prisma db seed
```

This creates 3 test accounts:
- **Customer**: `customer@test.com` / `Customer123!`
- **Promoter**: `promoter@test.com` / `Promoter123!`
- **Admin**: `admin@test.com` / `Admin123!`

**Verify in Supabase**:
- Dashboard → Table Editor → users table
- Should see 3 users

---

## 🔴 Error: "Can't reach database server"

### Symptoms
Build fails with database connection error

### Cause
- DATABASE_URL is wrong
- Database password is incorrect
- Supabase project is paused/deleted

### ✅ Solution

1. **Verify password**:
   - Supabase → Settings → Database → Reset password
   - Copy new password

2. **Update connection strings**:
   - Session Pooler (for `DATABASE_URL`): Port 6543
   - Direct (for `DIRECT_URL`): Port 5432

3. **Test locally**:
   ```bash
   DATABASE_URL="your_url" npx prisma db pull
   ```

4. **Update in Vercel** → Redeploy

---

## 🔴 Error: "Prisma Client not generated"

### Symptoms
```
Cannot find module '@prisma/client'
```

### Cause
Prisma Client wasn't generated during build

### ✅ Solution

**Verify package.json has**:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

✅ Already configured in this project.

**Manual fix**:
```bash
npx prisma generate
```

---

## 🔴 Build Succeeds but App Shows Errors

### Symptoms
- Build passes on Vercel
- App loads but features don't work
- Console shows errors

### ✅ Checklist

1. **Environment Variables Set?**
   - All 7+ required variables added to Vercel
   - Enabled for correct environments (Production/Preview)

2. **Database Schema Pushed?**
   ```bash
   npx prisma db push
   ```

3. **Seed Data Loaded?**
   ```bash
   npx prisma db seed
   ```

4. **Browser Cache Cleared?**
   - Hard refresh: `Ctrl + Shift + R`

5. **Vercel Logs Clean?**
   - Deployments → View Function Logs
   - Look for runtime errors

---

## 🔴 Environment Variables Not Working

### Symptoms
- Variables added in Vercel but app doesn't use them
- `process.env.VARIABLE` is undefined

### ✅ Solution

1. **Public variables** must start with `NEXT_PUBLIC_`:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ❌ `SUPABASE_URL` (won't work in browser)

2. **After adding variables**:
   - Must redeploy (don't just push code)
   - Variables don't apply to existing deployments

3. **Check correct environment**:
   - Production variables for production deployment
   - Preview variables for preview deployments

---

## 🛠️ General Debugging Steps

### 1. Check Vercel Build Logs
1. Deployments → Click on deployment
2. Look for **Build Logs**
3. Check for errors during build

### 2. Check Vercel Function Logs
1. Deployments → Click on deployment
2. Click **"View Function Logs"**
3. Look for runtime errors

### 3. Check Browser Console
1. Press `F12` → Console tab
2. Look for red error messages
3. Check Network tab for failed requests

### 4. Test Locally First
```bash
# Pull production env vars
vercel env pull .env.vercel

# Test build locally
npm run build

# Test production mode locally
npm run start
```

### 5. Verify Database Connection
```bash
# Test connection
DATABASE_URL="your_url" npx prisma db pull

# View database
DATABASE_URL="your_url" npx prisma studio
```

---

## 📋 Post-Deployment Checklist

After each deployment, verify:

- [ ] Build completed successfully (green checkmark)
- [ ] No errors in Build Logs
- [ ] App loads at production URL
- [ ] Login works
- [ ] Database operations work
- [ ] All pages load correctly
- [ ] No console errors in browser
- [ ] No errors in Vercel Function Logs

---

## 🆘 Still Having Issues?

### Quick Diagnostics

Run these to gather info:

```bash
# Check Node version
node --version

# Check dependencies
npm list

# Verify Prisma schema
npx prisma validate

# Check database connection
DATABASE_URL="your_url" npx prisma db pull

# View environment variables (locally)
cat .env.local
```

### Get Help

1. **Check Vercel Status**: https://www.vercel-status.com
2. **Check Supabase Status**: https://status.supabase.com
3. **Vercel Docs**: https://vercel.com/docs
4. **Next.js Docs**: https://nextjs.org/docs

---

## 🔒 Security Best Practices

After deployment:

- [ ] Reset database password (if shared publicly)
- [ ] Use different JWT_SECRET for production
- [ ] Enable Vercel Authentication
- [ ] Set up domain restrictions
- [ ] Enable Vercel Firewall (Pro plan)
- [ ] Review environment variable access
- [ ] Set up monitoring/alerts

---

**Last Updated**: 2025-12-30
**For Project**: Houlnd Realty MVP
**Deployment Platform**: Vercel
**Database**: Supabase PostgreSQL
