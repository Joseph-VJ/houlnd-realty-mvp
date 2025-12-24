# Houlnd Realty - Supabase Setup Guide

This guide will walk you through setting up Supabase for the Houlnd Realty project.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (sign up at https://supabase.com)
- Git installed

## 🚀 Phase 0 Setup Steps

### Step 1: Install Dependencies

```bash
npm install
```

This will install all the required packages including:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Server-side rendering support
- `react-hook-form` & `zod` - Form handling and validation
- `zustand` - State management
- `@tanstack/react-query` - Data fetching and caching
- `react-dropzone` & `browser-image-compression` - Image handling

### Step 2: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - **Name**: houlnd-realty (or your choice)
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier
4. Click "Create new project"
5. Wait 2-3 minutes for project setup

### Step 3: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (safe to expose in client)
   - **service_role** key (SECRET - never expose to client!)

### Step 4: Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace placeholder values with your actual Supabase credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-actual-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-actual-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key-here"

# Razorpay (keep existing or add your test keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret-here"

# App Config (keep defaults)
UNLOCK_FEE_INR="99"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 5: Run Database Migrations

You have two options to run migrations:

#### Option A: Supabase SQL Editor (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message
8. Repeat for `002_rls_policies.sql`, `003_rpc_functions.sql`, and `004_storage_setup.sql`

**Order matters! Run migrations in sequence: 001 → 002 → 003 → 004**

#### Option B: Supabase CLI (For advanced users)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

3. Push migrations:
   ```bash
   supabase db push
   ```

### Step 6: Configure Authentication Providers

1. In Supabase dashboard, go to **Authentication** > **Providers**

2. **Enable Email Provider:**
   - Toggle "Email" to ON
   - Enable "Confirm email" if you want email verification
   - Click "Save"

3. **Enable Phone Provider (Optional, for OTP):**
   - Toggle "Phone" to ON
   - Configure Twilio or another SMS provider
   - Add API credentials
   - Click "Save"

4. **Configure Email Templates:**
   - Go to **Authentication** > **Email Templates**
   - Customize "Confirm signup" email
   - Customize "Magic Link" email (if using)

### Step 7: Set Up Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Create bucket with these settings:
   - **Name**: `property-images`
   - **Public**: ✅ Yes (allows public read access for property images)
   - **File size limit**: 5 MB (5000000 bytes)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`
4. Click **Create bucket**

**Storage policies are already created via migration 004_storage_setup.sql**

### Step 8: Verify Database Setup

Run these verification queries in SQL Editor:

```sql
-- Check if all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return: users, listings, unlocks, payment_orders, appointments,
-- availability_slots, saved_properties, notifications, activity_logs

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- All tables should have rowsecurity = true

-- Check if functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';

-- Should include: get_listing_contact, create_notification,
-- get_user_dashboard_stats, etc.
```

### Step 9: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Check for errors in the console

4. The app should load (though most pages aren't built yet)

### Step 10: Generate TypeScript Types (Optional)

After running migrations, you can regenerate types from your actual database:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Generate types
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

Or using the CLI:

```bash
supabase gen types typescript --local > src/types/database.types.ts
```

## ✅ Verification Checklist

Before moving to Phase 1, verify:

- [ ] Supabase project created
- [ ] `.env.local` configured with correct credentials
- [ ] All 4 migration files executed successfully
- [ ] Email auth provider enabled
- [ ] Storage bucket `property-images` created and public
- [ ] `npm install` completed without errors
- [ ] `npm run dev` starts without errors
- [ ] No TypeScript errors when running `npm run build`

## 🔧 Troubleshooting

### Issue: "Missing environment variables"

**Solution:** Ensure `.env.local` has all required variables and restart dev server:
```bash
# Stop server (Ctrl+C)
# Restart server
npm run dev
```

### Issue: "relation 'public.users' does not exist"

**Solution:** Migrations not run correctly. Re-run migrations in order (001 → 002 → 003 → 004)

### Issue: "RLS policy violation" or "permission denied"

**Solution:**
1. Verify RLS policies migration (002) ran successfully
2. Check that you're using the correct Supabase client (not service role in client code)
3. Ensure user is authenticated before querying protected tables

### Issue: "Storage bucket not found"

**Solution:** Create bucket manually in Supabase dashboard (see Step 7)

### Issue: "Cannot find module '@/types/database.types'"

**Solution:** Types file exists at `src/types/database.types.ts`. Verify path alias in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📚 Next Steps

Phase 0 is complete! You've successfully:
- ✅ Migrated from Prisma to Supabase
- ✅ Set up database schema with RLS policies
- ✅ Configured authentication
- ✅ Set up image storage

**Next:** Proceed to Phase 1 - Foundation (Authentication Flows)

See the implementation plan at `C:\Users\Admin\.claude\plans\unified-fluttering-pony.md` for details on Phase 1.

## 🆘 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Houlnd Realty Plan**: See plan file for detailed implementation roadmap
- **GitHub Issues**: Report bugs at your repository

---

**Important Security Notes:**
- ✋ **Never commit `.env.local`** to version control
- 🔐 **Service role key bypasses RLS** - only use server-side
- 🔒 **Anon key is safe** to expose in client code
- 📝 **Always use RLS policies** for data security
