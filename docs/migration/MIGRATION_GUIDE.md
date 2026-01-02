# SQLite to PostgreSQL Migration Guide for Vercel

This guide walks you through migrating your Houlnd Realty app from SQLite to PostgreSQL for production deployment on Vercel.

## Prerequisites

- Supabase account (free tier works)
- Vercel account
- Access to your production Razorpay credentials
- Local development environment with Node.js and npm

---

## Step 1: Set Up Supabase PostgreSQL Database

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Project Name**: `houlnd-realty` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
4. Click **"Create new project"** and wait for provisioning (~2 minutes)

### 1.2 Get Your Database Connection Strings

1. In your Supabase project dashboard, go to **Settings > Database**
2. Scroll down to **Connection String**
3. Copy both connection strings:

   **For DATABASE_URL** (use "URI" in Session mode):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

   **For DIRECT_URL** (use "Connection string" - Direct connection):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. Replace `[YOUR-PASSWORD]` with your database password

---

## Step 2: Update Local Environment for Testing

### 2.1 Create a New Environment File

Create `.env.production.local` for testing the PostgreSQL connection locally:

```bash
# Copy the example file
cp .env.production.example .env.production.local
```

### 2.2 Configure the Environment Variables

Edit `.env.production.local` with your actual values:

```env
# Database
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key

# App Config
USE_OFFLINE=false
NEXT_PUBLIC_USE_OFFLINE=false
NEXT_PUBLIC_APP_URL=http://localhost:3000

# JWT Secret (generate new one: openssl rand -base64 32)
JWT_SECRET=your_secure_jwt_secret_here

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
UNLOCK_FEE_INR=99
```

---

## Step 3: Migrate Database Schema

### 3.1 Reset Prisma Migrations

Since you're switching databases, you need to create a new migration:

```bash
# Navigate to your project
cd houlnd-realty-mvp

# Remove old SQLite migrations
rm -rf prisma/migrations

# Create initial PostgreSQL migration
npx prisma migrate dev --name init
```

This will:
- Create the PostgreSQL schema
- Generate a new migration file
- Generate the Prisma client

### 3.2 Verify Database Connection

Check that tables were created:

```bash
npx prisma studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) to browse your database.

---

## Step 4: Migrate Data (Optional)

If you have existing SQLite data you want to migrate:

### 4.1 Export SQLite Data

```bash
# Install dependencies
npm install -D ts-node

# Create a data export script
```

Create `prisma/export-data.ts`:

```typescript
import { PrismaClient as SQLiteClient } from '@prisma/client';

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./dev.db' } }
});

async function exportData() {
  const users = await sqlite.user.findMany();
  const listings = await sqlite.listing.findMany();
  // ... export other tables

  console.log(JSON.stringify({ users, listings }, null, 2));
  await sqlite.$disconnect();
}

exportData();
```

### 4.2 Import to PostgreSQL

Create `prisma/import-data.ts` with similar logic to insert exported data.

**Note**: For production launches without existing data, skip this step.

---

## Step 5: Test Locally with PostgreSQL

### 5.1 Run Development Server

```bash
# Use production env for testing
NODE_ENV=production npm run dev
```

### 5.2 Test Key Features

- [ ] User registration and login
- [ ] Create a property listing
- [ ] Save a property
- [ ] Unlock property details (with Razorpay test mode)
- [ ] Schedule an appointment
- [ ] Check notifications

---

## Step 6: Deploy to Vercel

### 6.1 Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### 6.2 Initialize Vercel Project

```bash
# Login to Vercel
vercel login

# Link your project
vercel link
```

### 6.3 Configure Environment Variables on Vercel

Go to your project on [vercel.com](https://vercel.com):

1. Navigate to **Settings > Environment Variables**
2. Add the following variables (use values from `.env.production.local`):

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | Your Supabase connection string (pooled) | Production, Preview |
| `DIRECT_URL` | Your Supabase direct connection string | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | https://[PROJECT-REF].supabase.co | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `USE_OFFLINE` | `false` | Production, Preview |
| `NEXT_PUBLIC_USE_OFFLINE` | `false` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | https://your-app.vercel.app | Production |
| `JWT_SECRET` | Your production JWT secret | Production, Preview |
| `RAZORPAY_KEY_ID` | Your Razorpay key ID | Production, Preview |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret | Production, Preview |
| `UNLOCK_FEE_INR` | `99` | Production, Preview, Development |

**Important**:
- Use different JWT_SECRET for production (generate with `openssl rand -base64 32`)
- Use Razorpay production keys for Production environment
- Use Razorpay test keys for Preview/Development environments

### 6.4 Run Database Migrations on Vercel

Before deploying, ensure your database schema is up to date:

```bash
# Push schema to Supabase (for first deployment)
npx prisma db push
```

**Note**: For subsequent schema changes, use:
```bash
npx prisma migrate deploy
```

### 6.5 Deploy to Vercel

```bash
# Deploy to production
vercel --prod
```

Or use GitHub integration:
1. Push your code to GitHub
2. Import repository in Vercel dashboard
3. Vercel will auto-deploy on push

---

## Step 7: Post-Deployment Verification

### 7.1 Check Build Logs

In Vercel dashboard:
1. Go to **Deployments**
2. Click on latest deployment
3. Check **Build Logs** for any errors

Common issues:
- Missing environment variables
- Prisma client generation failures
- Database connection timeouts

### 7.2 Test Production App

Visit your Vercel URL and test:

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Login with created user
- [ ] Create a new listing
- [ ] Upload images to listings
- [ ] Search and filter properties
- [ ] Save properties
- [ ] Make a test payment (Razorpay)
- [ ] Schedule appointments
- [ ] Admin dashboard (if applicable)

### 7.3 Monitor Database

Check Supabase dashboard:
1. **Database > Tables**: Verify data is being created
2. **Database > Logs**: Check for any query errors
3. **Project Settings > Database > Pool**: Monitor connection usage

---

## Step 8: Schema Changes (Future Updates)

When you need to modify your database schema:

### 8.1 Local Development

```bash
# 1. Update prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Test locally
npm run dev
```

### 8.2 Deploy Schema Changes

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.production.local
npx prisma migrate deploy
git add .
git commit -m "feat: add new schema migration"
git push

# Option 2: Let Vercel handle it
# Add this to your vercel.json (if needed):
```

Create `vercel.json`:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "env": {
    "PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK": "1"
  }
}
```

---

## Troubleshooting

### Issue: "Can't reach database server"

**Solution**:
- Check DATABASE_URL is correct
- Verify Supabase project is active
- Check firewall/network settings

### Issue: "Prisma Client Not Generated"

**Solution**:
```bash
npx prisma generate
```

Ensure `postinstall` script exists in [package.json](f:\opus-4.5\houlnd test\houlnd-realty-mvp\package.json):
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Issue: "Migration Failed on Vercel"

**Solution**:
- Use `prisma db push` for first deployment
- For production, run migrations manually:
  ```bash
  DATABASE_URL="your_production_url" npx prisma migrate deploy
  ```

### Issue: "Connection Pool Timeout"

**Solution**:
- Use connection pooling URL for DATABASE_URL
- Increase pool size in Supabase settings
- Add connection pool settings to DATABASE_URL:
  ```
  ?pgbouncer=true&connection_limit=1
  ```

### Issue: "Environment Variables Not Loading"

**Solution**:
- Redeploy after adding env vars
- Check variable names match exactly
- Ensure correct environment is selected (Production/Preview/Development)

---

## Rollback Plan

If you need to rollback to SQLite locally:

1. Update `.env.local`:
   ```env
   DATABASE_URL="file:./dev.db"
   USE_OFFLINE=true
   NEXT_PUBLIC_USE_OFFLINE=true
   ```

2. Update [prisma/schema.prisma](f:\opus-4.5\houlnd test\houlnd-realty-mvp\prisma\schema.prisma):
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. Regenerate client:
   ```bash
   npx prisma generate
   npm run dev
   ```

---

## Performance Optimization

### Enable Connection Pooling

Update your DATABASE_URL in Vercel:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

### Add Database Indexes

For better query performance, consider adding indexes to frequently queried fields:

```prisma
model Listing {
  // ...
  @@index([status])
  @@index([city])
  @@index([propertyType])
  @@index([createdAt])
}
```

Apply with:
```bash
npx prisma migrate dev --name add_indexes
```

---

## Security Checklist

- [ ] Use strong DATABASE_URL password
- [ ] Different JWT_SECRET for production
- [ ] Enable Supabase Row Level Security (RLS) if needed
- [ ] Use Razorpay production keys only in Production environment
- [ ] Enable HTTPS only (Vercel handles this)
- [ ] Add rate limiting to API routes
- [ ] Enable Vercel Web Application Firewall
- [ ] Regular database backups (Supabase auto-backups daily)

---

## Cost Considerations

### Supabase Free Tier Limits
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

**Upgrade triggers**:
- Exceeding 500 MB database
- Need more than 7 days of backups
- Need custom domain for database
- Require 24/7 support

### Vercel Free Tier Limits
- 100 GB bandwidth/month
- 100 GB-hours compute
- 6,000 minutes build time/month

**Upgrade triggers**:
- High traffic (>100 GB/month)
- Need custom auth solutions
- Team collaboration features

---

## Next Steps

1. Set up monitoring with [Sentry](https://sentry.io) or [LogRocket](https://logrocket.com)
2. Configure automated database backups beyond Supabase defaults
3. Set up staging environment for testing
4. Implement analytics (Vercel Analytics, Google Analytics)
5. Add error tracking and logging
6. Set up CI/CD pipeline for automated testing

---

## Support Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## Summary

You've successfully:
- ✅ Updated Prisma schema to PostgreSQL
- ✅ Configured Supabase database connection
- ✅ Set up environment variables for Vercel
- ✅ Deployed to Vercel with persistent database
- ✅ Verified all features work in production

Your app now has a production-ready database that persists across deployments!
