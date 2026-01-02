# Potential Issues & Fixes for PostgreSQL Migration

This document outlines potential issues you might encounter during migration and how to fix them.

---

## 🔴 High Priority Issues

### Issue 1: Migration Lock File Shows SQLite

**File**: [prisma/migrations/migration_lock.toml](prisma/migrations/migration_lock.toml:3)

**Current State**:
```toml
provider = "sqlite"
```

**Expected After Migration**:
```toml
provider = "postgresql"
```

**Impact**: Medium - Prevents creating PostgreSQL migrations

**Fix**: This is automatically updated when you run your first PostgreSQL migration:
```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

**Verification**:
```bash
cat prisma/migrations/migration_lock.toml
# Should show: provider = "postgresql"
```

---

### Issue 2: Old SQLite Migrations Incompatible

**Location**: `prisma/migrations/`
**Files**:
- `20251224150557_init_sqlite/migration.sql`
- `20251224161236_add_password_hash_and_verified/migration.sql`

**Impact**: High - Will cause migration errors

**SQLite-Specific Syntax**:
```sql
-- SQLite uses:
INTEGER PRIMARY KEY AUTOINCREMENT
DATETIME DEFAULT CURRENT_TIMESTAMP

-- PostgreSQL needs:
SERIAL PRIMARY KEY
TIMESTAMP DEFAULT NOW()
```

**Fix**: Remove all existing migrations before creating PostgreSQL ones:
```bash
# Backup if needed
cp -r prisma/migrations prisma/migrations.backup

# Remove SQLite migrations
rm -rf prisma/migrations

# Create fresh PostgreSQL migration
npx prisma migrate dev --name init
```

**Why This Works**: Prisma will generate proper PostgreSQL syntax based on your updated [schema.prisma](prisma/schema.prisma).

---

### Issue 3: Environment Variables Not Set

**Impact**: Critical - App won't connect to database

**Missing Variables** (for production):
```env
DATABASE_URL=           # Supabase pooled connection
DIRECT_URL=            # Supabase direct connection
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
JWT_SECRET=            # Must be 32+ characters
```

**Fix**:

1. **Local Testing**:
   ```bash
   cp .env.production.example .env.production.local
   # Edit .env.production.local with real values
   ```

2. **Vercel Deployment**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add each variable from [.env.production.example](.env.production.example)
   - Set correct environment scope (Production, Preview, Development)

**Verification**:
```bash
# Local test
echo $DATABASE_URL
# Should show PostgreSQL connection string

# Vercel test
vercel env pull .env.vercel
cat .env.vercel
```

---

## 🟡 Medium Priority Issues

### Issue 4: UUID Generation Differences

**Context**: SQLite stores UUIDs as TEXT, PostgreSQL uses native UUID type

**Example**:
```typescript
// SQLite: id stored as TEXT
"123e4567-e89b-12d3-a456-426614174000"

// PostgreSQL: id stored as UUID (binary)
123e4567-e89b-12d3-a456-426614174000
```

**Impact**: Low for new deployments, Medium if migrating existing data

**When It Matters**:
- Migrating existing SQLite data to PostgreSQL
- Direct SQL queries (Prisma handles this automatically)

**Fix**: Use Prisma ORM for all queries (you're already doing this ✅)

**If Migrating Data**:
```typescript
// Convert SQLite TEXT to PostgreSQL UUID
const user = await prisma.user.create({
  data: {
    id: 'existing-uuid-from-sqlite', // Works fine
    email: 'user@example.com'
  }
});
```

---

### Issue 5: DateTime Storage Format

**Context**:
- SQLite: Stores as ISO 8601 TEXT (`"2024-12-30T10:30:00.000Z"`)
- PostgreSQL: Uses TIMESTAMP or TIMESTAMPTZ

**Impact**: Low - Prisma handles conversion

**Potential Issue**: Timezone information
```javascript
// SQLite
createdAt: "2024-12-30T10:30:00.000Z" // Always UTC string

// PostgreSQL (with TIMESTAMPTZ)
createdAt: 2024-12-30 10:30:00+00 // Timezone-aware
```

**Fix**: No action needed - Prisma handles this. But consider using TIMESTAMPTZ in custom SQL:

**Enhanced Prisma Schema** (optional):
```prisma
// Current (works fine)
model User {
  createdAt DateTime @default(now())
}

// Enhanced (better for PostgreSQL)
model User {
  createdAt DateTime @default(now()) @db.Timestamptz
}
```

---

### Issue 6: Prisma Client Not Generated on Vercel

**Symptom**: Build fails with "Cannot find module '@prisma/client'"

**Cause**: Prisma Client not generated during Vercel build

**Fix**: ✅ Already done - [package.json](package.json:13) has:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

**Verification** (local):
```bash
rm -rf node_modules/.prisma
npm install
# Should see: "✔ Generated Prisma Client"
```

**Alternative Fix** (if issue persists):
Update `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build"
}
```

---

## 🟢 Low Priority Issues

### Issue 7: Connection Pool Exhaustion

**Symptom**: "Too many connections" error on Vercel

**Cause**: Serverless functions open new connections

**Impact**: Can cause 500 errors under high load

**Fix**: Use connection pooling (already configured in `.env.production.example`):

```env
# Use Supabase pooler (Pgbouncer)
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true"
```

**Additional Configuration**:
```env
# Limit connections per serverless function
DATABASE_URL="...?connection_limit=1"
```

**Verification**:
- Monitor Supabase Dashboard → Database → Connection Pooling
- Should show connections under limit

---

### Issue 8: Prisma Studio Not Working with Pooled Connection

**Symptom**: Prisma Studio fails to connect with pooled DATABASE_URL

**Cause**: Pgbouncer in transaction mode doesn't support all Prisma features

**Fix**: Use DIRECT_URL for Prisma Studio:
```bash
# Won't work with pooled connection
npx prisma studio

# Force direct connection
DATABASE_URL=$DIRECT_URL npx prisma studio
```

**Already Configured**: [schema.prisma](prisma/schema.prisma:11) has:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")        # Pooled (for app)
  directUrl = env("DIRECT_URL")         # Direct (for migrations/studio)
}
```

---

### Issue 9: Build Time Increases

**Symptom**: Vercel builds take longer than before

**Cause**:
- Prisma Client generation
- PostgreSQL schema introspection

**Impact**: Minimal (15-30 seconds longer)

**Optimization**:
```json
// vercel.json
{
  "build": {
    "env": {
      "PRISMA_GENERATE_DATAPROXY": "true"
    }
  }
}
```

**Note**: Not critical, builds still complete in 1-2 minutes

---

## 🔧 Data Migration Issues

### Issue 10: Migrating Existing SQLite Data

**Scenario**: You have important data in `dev.db` (978 KB)

**Challenge**: Different data formats between SQLite and PostgreSQL

**Solution**: Create migration script

**Migration Script** (`scripts/migrate-data.ts`):
```typescript
import { PrismaClient as SQLiteClient } from '@prisma/client';
import { PrismaClient as PostgresClient } from '@prisma/client';

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./dev.db' } }
});

const postgres = new PostgresClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function migrateData() {
  console.log('🔄 Starting data migration...');

  // 1. Migrate Users
  const users = await sqlite.user.findMany();
  for (const user of users) {
    await postgres.user.upsert({
      where: { id: user.id },
      update: {},
      create: user
    });
  }
  console.log(`✅ Migrated ${users.length} users`);

  // 2. Migrate Listings
  const listings = await sqlite.listing.findMany();
  for (const listing of listings) {
    await postgres.listing.upsert({
      where: { id: listing.id },
      update: {},
      create: listing
    });
  }
  console.log(`✅ Migrated ${listings.length} listings`);

  // 3. Migrate other tables...
  // (Repeat for SavedProperty, Unlock, PaymentOrder, etc.)

  console.log('🎉 Migration complete!');
}

migrateData()
  .catch(console.error)
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });
```

**Run Migration**:
```bash
npx tsx scripts/migrate-data.ts
```

**Note**: For production launch without existing data, skip this and use seed data instead.

---

## 🚨 Deployment Issues

### Issue 11: Vercel Build Fails - "DATABASE_URL Not Found"

**Cause**: Environment variables not set in Vercel

**Fix**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Ensure `DATABASE_URL` is set for **Production** and **Preview**
3. Click "Redeploy" after adding variables

**Common Mistake**: Setting variables only for "Production" but deploying to "Preview"

---

### Issue 12: Migration Fails on Vercel

**Symptom**: "Migration failed to apply" during deployment

**Cause**: Trying to run migrations during Vercel build

**Fix**: Apply migrations manually before deploying:
```bash
# Local or CI/CD
npx prisma migrate deploy

# Then deploy
git push
```

**Best Practice**: Use `prisma db push` for first deployment:
```bash
npx prisma db push
git push
```

---

### Issue 13: "Prisma Client is unable to be run in the browser"

**Symptom**: Error in browser console

**Cause**: Importing Prisma Client in client component

**Bad**:
```typescript
// ❌ Don't do this
'use client';
import { prisma } from '@/lib/db';
```

**Good**:
```typescript
// ✅ Use server actions
'use client';
import { getListings } from '@/app/actions/listings';
```

**Already Fixed**: Your codebase correctly uses server actions ✅

---

## 🛡️ Security Issues

### Issue 14: Database Credentials in Git

**Risk**: HIGH - Exposing production credentials

**Check**:
```bash
git log --all --full-history --source -- .env.production.local
```

**Prevention**:
```bash
# Add to .gitignore (if not already there)
echo ".env.production.local" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore
```

**Best Practice**: Use `.env.example` files for templates only

---

### Issue 15: Weak JWT_SECRET

**Risk**: Medium - Session hijacking

**Check**:
```bash
# Bad (too short)
JWT_SECRET=mysecret

# Good (32+ characters)
JWT_SECRET=V5tcCbOY8JbVwxGXKS3Gproo3lNwN0h7ciOs/zlu2gs=
```

**Generate Strong Secret**:
```bash
openssl rand -base64 32
```

**Important**: Use different secrets for development and production!

---

## 📊 Performance Issues

### Issue 16: Slow Queries on Large Tables

**Symptom**: Listing page loads slowly

**Cause**: Missing database indexes

**Fix**: Add indexes to frequently queried fields

**Update [schema.prisma](prisma/schema.prisma)**:
```prisma
model Listing {
  // ... existing fields ...

  @@index([status])
  @@index([city])
  @@index([propertyType])
  @@index([pricePerSqft])
  @@index([createdAt])
  @@index([promoterId])
}
```

**Apply**:
```bash
npx prisma migrate dev --name add_indexes
```

**Note**: Supabase migrations already include these indexes! ([supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql))

---

### Issue 17: N+1 Query Problem

**Symptom**: Many database queries for one page load

**Example**:
```typescript
// ❌ Bad (N+1 queries)
const listings = await prisma.listing.findMany();
for (const listing of listings) {
  const promoter = await prisma.user.findUnique({
    where: { id: listing.promoterId }
  });
}

// ✅ Good (1 query with join)
const listings = await prisma.listing.findMany({
  include: { promoter: true }
});
```

**Check Your Code**: Already using `include` properly ✅
- [src/app/actions/listings.ts](src/app/actions/listings.ts)

---

## 🧪 Testing Issues

### Issue 18: Seed Data Not Loading

**Symptom**: `npx prisma db seed` fails

**Causes**:
1. Missing seed script in [package.json](package.json)
2. Database connection issues
3. Foreign key constraints

**Verification**:
```json
// package.json should have:
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```
✅ Already configured correctly

**If Still Fails**:
```bash
# Run seed directly
npx tsx prisma/seed.ts

# Check errors
DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
```

---

## 📝 Summary of Required Actions

| Issue | Priority | Action | Status |
|-------|----------|--------|--------|
| Migration lock file | 🔴 High | Run `prisma migrate dev` | Auto-fixed |
| Old SQLite migrations | 🔴 High | Remove migrations folder | Action needed |
| Environment variables | 🔴 High | Set in Vercel & local | Action needed |
| UUID differences | 🟡 Medium | Use Prisma ORM | ✅ Already done |
| DateTime format | 🟡 Medium | No action needed | ✅ Auto-handled |
| Connection pooling | 🟡 Medium | Use pooled URL | ✅ Configured |
| Database indexes | 🟢 Low | Add indexes (optional) | ✅ In Supabase SQL |
| Build optimization | 🟢 Low | Optional tweaks | Not critical |

---

## 🎯 Pre-Migration Checklist

Before running migration commands, verify:

- [ ] Supabase project created
- [ ] Connection strings obtained
- [ ] `.env.production.local` configured
- [ ] Backup SQLite data (if needed): `cp dev.db dev.db.backup`
- [ ] Old migrations backed up: `cp -r prisma/migrations prisma/migrations.backup`
- [ ] All code committed to git
- [ ] Ready to remove old migrations

**Once verified, proceed with**:
```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check Prisma Logs**:
   ```bash
   DEBUG="prisma:*" npx prisma migrate dev
   ```

2. **Check Database Logs**:
   - Supabase Dashboard → Database → Logs

3. **Check Vercel Logs**:
   ```bash
   vercel logs --prod
   ```

4. **Resources**:
   - [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
   - [Supabase Troubleshooting](https://supabase.com/docs/guides/platform/troubleshooting)
   - [Vercel Deployment Issues](https://vercel.com/docs/concepts/deployments/troubleshoot-a-build)

---

**All issues documented! Ready to proceed with migration? See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for step-by-step instructions.**
