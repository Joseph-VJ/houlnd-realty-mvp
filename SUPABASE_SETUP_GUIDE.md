# Supabase Setup Guide for Houlnd Realty

## Current Issue
You're seeing "Invalid login credentials" because the app is configured for **offline mode** (SQLite), but you want to use **Supabase**.

## Steps to Fix

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGc...`)

### 2. Update Local Environment (.env.local)

Replace these lines in `.env.local`:

```env
USE_OFFLINE=false
NEXT_PUBLIC_USE_OFFLINE=false

NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

### 3. Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```
USE_OFFLINE = false
NEXT_PUBLIC_USE_OFFLINE = false
NEXT_PUBLIC_SUPABASE_URL = https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = YOUR-ANON-KEY-HERE
DATABASE_URL = postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### 4. Run Database Migrations on Supabase

```bash
npx prisma migrate deploy
```

### 5. Seed Test Users (Optional)

```bash
npx prisma db seed
```

**Test Accounts** (after seeding):
- Customer: `customer@test.com` / `Customer123!`
- Promoter: `promoter@test.com` / `Promoter123!`
- Admin: `admin@test.com` / `Admin123!`

### 6. Restart Development Server

```bash
npm run dev
```

### 7. Redeploy to Vercel

```bash
git add .
git commit -m "Configure Supabase for production"
git push origin master
```

Vercel will auto-deploy.

## Verify Setup

1. Check Supabase connection works locally
2. Try logging in with test credentials
3. Check Vercel deployment logs for errors

## Troubleshooting

- **"Invalid credentials"** - Database not seeded or wrong mode
- **"Failed to fetch"** - Wrong Supabase URL/Key
- **Build errors on Vercel** - Environment variables not set

---

**Need Help?** The credentials should be in your Supabase project dashboard.
