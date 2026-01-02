# Scripts Directory

This directory contains all utility scripts organized by purpose.

## Directory Structure

```
scripts/
├── database/           # SQL scripts for database operations
│   ├── rls/           # Row Level Security scripts
│   │   ├── disable-rls.sql
│   │   ├── force-disable-rls.sql
│   │   ├── setup-rls-policies.sql
│   │   └── grant-permissions.sql
│   ├── seed/          # Seed data scripts
│   │   └── insert-user-profiles.sql
│   ├── check-listings.sql
│   ├── debug-users.sql
│   ├── fix-images.sql
│   └── verify-users.sql
├── setup/             # Project setup scripts
│   ├── create-supabase-users.ts
│   ├── reset-passwords.ts
│   ├── generate-env.js
│   └── test-supabase.ts
└── tests/             # Test scripts
    ├── run_all_tests.ts
    ├── test_offline_admin_approval.ts
    ├── test_offline_complete_mvp.ts
    ├── test_offline_customer_unlock.ts
    ├── test_offline_promoter_submit.ts
    ├── test_workflow_admin.ts
    ├── test_workflow_buyer.ts
    └── test_workflow_promoter.ts
```

## Usage

### Database Scripts

Run SQL scripts in **Supabase SQL Editor** (Dashboard → SQL Editor):

```sql
-- Example: Fix listing images
-- Copy content from scripts/database/fix-images.sql
```

### Setup Scripts

```bash
# Create test users in Supabase
npx tsx scripts/setup/create-supabase-users.ts

# Reset passwords for test users
npx tsx scripts/setup/reset-passwords.ts

# Generate environment variables
node scripts/setup/generate-env.js

# Test Supabase connection
npx tsx scripts/setup/test-supabase.ts
```

### Test Scripts

```bash
# Run all tests
npx tsx scripts/tests/run_all_tests.ts

# Run individual tests
npx tsx scripts/tests/test_offline_customer_unlock.ts
npx tsx scripts/tests/test_offline_promoter_submit.ts
npx tsx scripts/tests/test_offline_admin_approval.ts
npx tsx scripts/tests/test_offline_complete_mvp.ts

# Workflow tests
npx tsx scripts/tests/test_workflow_admin.ts
npx tsx scripts/tests/test_workflow_buyer.ts
npx tsx scripts/tests/test_workflow_promoter.ts
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@test.com | Customer123! |
| Promoter | promoter@test.com | Promoter123! |
| Admin | admin@test.com | Admin123! |
