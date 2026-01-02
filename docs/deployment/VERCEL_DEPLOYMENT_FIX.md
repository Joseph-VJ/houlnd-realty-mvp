# Vercel Deployment Error Fix

## Error You're Seeing

```
Error: SECURITY ERROR: JWT_SECRET environment variable is required
and must be at least 32 characters long
```

---

## 🎯 Complete Solution (2 Steps)

### Step 1: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `houlnd-realty-mvp`
3. **Go to**: Settings → Environment Variables
4. **Add these required variables**:

#### Minimum Required (to fix build error):

```env
JWT_SECRET=V5tcCbOY8JbVwxGXKS3Gproo3lNwN0h7ciOs/zlu2gs=
USE_OFFLINE=false
NEXT_PUBLIC_USE_OFFLINE=false
```

**Generate your own JWT_SECRET** (recommended):
```bash
openssl rand -base64 32
```

#### For Database (choose ONE option below):

---

### Step 2: Choose Your Database

You MUST use a cloud PostgreSQL database. SQLite won't work on Vercel.

## Option A: Neon (Fastest - Recommended)

**Free Tier**: 10 GB storage, 100 hours compute/month

### Setup (2 minutes):

1. **Create Account**: https://neon.tech
2. **Create Project**: Click "New Project"
   - Name: `houlnd-realty`
   - Region: Choose closest to you
   - PostgreSQL version: 15 (default)
3. **Get Connection String**:
   - Copy the connection string shown
   - Format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

4. **Add to Vercel**:
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   DIRECT_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

5. **Push Schema**:
   ```bash
   cd houlnd-realty-mvp
   DATABASE_URL="your_neon_url" npx prisma db push
   DATABASE_URL="your_neon_url" npx prisma db seed
   ```

---

## Option B: Vercel Postgres

**Cost**: $0.50/month minimum (includes PostgreSQL)

### Setup (3 minutes):

1. **In Vercel Dashboard**: Storage → Create Database
2. **Select**: Postgres
3. **Create**: Database will be provisioned
4. **Environment Variables**: Automatically added to your project
5. **Push Schema**:
   ```bash
   vercel env pull .env.vercel
   npx prisma db push
   npx prisma db seed
   ```

---

## Option C: Railway

**Free Tier**: $5 credit/month

### Setup (2 minutes):

1. **Create Account**: https://railway.app
2. **New Project**: Click "New Project" → "Provision PostgreSQL"
3. **Get Connection String**:
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy "Postgres Connection URL"
4. **Add to Vercel**:
   ```env
   DATABASE_URL=postgresql://user:pass@containers-us-west-xxx.railway.app:6543/railway
   DIRECT_URL=postgresql://user:pass@containers-us-west-xxx.railway.app:6543/railway
   ```
5. **Push Schema**:
   ```bash
   DATABASE_URL="your_railway_url" npx prisma db push
   DATABASE_URL="your_railway_url" npx prisma db seed
   ```

---

## Option D: Supabase

**Free Tier**: 500 MB database

### Setup (5 minutes):

1. **Create Account**: https://supabase.com
2. **New Project**: Create new project, save password
3. **Get Connection Strings**:
   - Settings → Database
   - Copy "Connection String" (Session mode) for DATABASE_URL
   - Copy "Connection String" (Direct) for DIRECT_URL
4. **Add to Vercel** (see template below)
5. **Push Schema**:
   ```bash
   DATABASE_URL="your_supabase_url" npx prisma db push
   DATABASE_URL="your_supabase_url" npx prisma db seed
   ```

---

## Complete Environment Variables List

After choosing a database, add ALL these to Vercel:

```env
# Required for Build
JWT_SECRET=[generate with: openssl rand -base64 32]
USE_OFFLINE=false
NEXT_PUBLIC_USE_OFFLINE=false

# Database (from your chosen provider)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Optional (for Supabase auth - only if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_key]

# Payments (optional - for Razorpay)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
UNLOCK_FEE_INR=99
```

---

## Step-by-Step: Add Variables to Vercel

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **For each variable**:
   - Click "Add New"
   - Enter **Key** (e.g., `JWT_SECRET`)
   - Enter **Value** (e.g., your generated secret)
   - Select **Environments**:
     - Production: ✓
     - Preview: ✓
     - Development: ✓
   - Click "Save"

3. **After adding all variables**:
   - Go to **Deployments** tab
   - Click "..." on latest deployment
   - Click **"Redeploy"**

---

## Verify Deployment

After redeployment:

1. **Check Build Logs**:
   - Should see: ✓ Compiled successfully
   - No JWT_SECRET error

2. **Test Your App**:
   - Visit your Vercel URL
   - Try to register a user
   - Check if data persists

3. **Monitor Database**:
   - Check your database provider dashboard
   - Verify tables were created
   - See if data is being inserted

---

## Quick Start Commands

```bash
# 1. Generate JWT secret
openssl rand -base64 32

# 2. Pull Vercel env vars (after adding them)
vercel env pull .env.vercel

# 3. Push database schema
npx prisma db push

# 4. Seed database with sample data
npx prisma db seed

# 5. Test locally with production config
DATABASE_URL="your_db_url" npm run dev

# 6. Deploy
git push origin master
# (Vercel auto-deploys from GitHub)
```

---

## Troubleshooting

### "Still getting JWT_SECRET error"
- **Fix**: Redeploy after adding environment variables
- Vercel doesn't apply env vars to existing deployments

### "Database connection failed"
- **Fix**: Check DATABASE_URL is correct
- Test locally first: `DATABASE_URL="your_url" npx prisma db pull`

### "Prisma Client not found"
- **Fix**: Should be auto-fixed by postinstall script
- Verify package.json has: `"postinstall": "prisma generate"`

### "Tables not found"
- **Fix**: Run `npx prisma db push` before deploying
- Or add migration to Vercel build command

---

## My Recommendation

**Use Neon** - Here's why:
- ✅ Fastest setup (2 minutes)
- ✅ Generous free tier (10 GB)
- ✅ Best for serverless (auto-scaling)
- ✅ Good for Vercel deployments
- ✅ No credit card required

**Setup Steps**:
1. Go to https://neon.tech → Sign up
2. Create project → Copy connection string
3. Add to Vercel as `DATABASE_URL` and `DIRECT_URL`
4. Run: `DATABASE_URL="neon_url" npx prisma db push`
5. Redeploy on Vercel

---

## Need Help?

If stuck, share:
- Which database option you chose
- Error message you're seeing
- Screenshot of Vercel environment variables (hide sensitive values)

I'll help you get it working!
