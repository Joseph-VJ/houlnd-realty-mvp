---
name: dual-mode-guardian
description: Ensure all code changes support BOTH offline (SQLite + JWT) and online (Supabase) modes. Use when modifying authentication, database operations, server actions, or any feature that differs between development and production environments. Prevents mode-specific bugs and cookie naming errors.
---

# Dual-Mode Architecture Guardian

## Purpose
Enforce dual-mode compatibility for all code changes to support both offline (SQLite) and online (Supabase) runtime modes

## Critical Background
This application has **TWO COMPLETELY DIFFERENT runtime modes** controlled by `USE_OFFLINE` environment variable:

### Offline Mode (Development - SQLite)
- Database: SQLite via Prisma (`prisma/dev.db`)
- Authentication: JWT tokens with `jose` library
- **Cookie Name:** `offline-auth-token` ⚠️ MUST BE EXACT
- Auth File: `src/lib/offlineAuth.ts`
- Contact Unlock: FREE (no payment)
- Images: Mock URLs

### Online Mode (Production - Supabase)
- Database: PostgreSQL via Supabase
- Authentication: Supabase Auth with `@supabase/ssr`
- Cookie Name: Supabase managed
- Auth Files: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- Contact Unlock: ₹99 via Razorpay
- Images: Supabase Storage URLs

## 🚨 Known Bug Pattern (PREVENT THIS)
**Cookie Naming Bug (Dec 26, 2025):**
- Server actions used `auth-token` instead of `offline-auth-token`
- Authentication broke in offline mode
- Required fix across all server actions

## ✅ Mandatory Dual-Mode Pattern

All server actions in `src/app/actions/` MUST follow this pattern:

```typescript
'use server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { offlineGetUser } from '@/lib/offlineAuth'

const isOfflineMode = process.env.USE_OFFLINE === 'true'

export async function myAction() {
  if (isOfflineMode) {
    // OFFLINE MODE
    const cookieStore = await cookies()
    const token = cookieStore.get('offline-auth-token')?.value  // ⚠️ EXACT NAME
    if (!token) return { success: false, error: 'Not authenticated' }

    const { data } = await offlineGetUser(token)
    if (!data.user) return { success: false, error: 'Not authenticated' }

    // Use Prisma for database operations
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    // ... operations
    await prisma.$disconnect()
  } else {
    // ONLINE MODE
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Use Supabase for database operations
  }
}
```

## AI Workflow (MUST FOLLOW)

When modifying ANY server action or authentication code:

1. **CHECK MODE DETECTION**
   - [ ] Uses `process.env.USE_OFFLINE === 'true'` check?
   - [ ] Has both `if (isOfflineMode)` and `else` branches?

2. **VALIDATE OFFLINE MODE**
   - [ ] Cookie name is EXACTLY `offline-auth-token`? ⚠️ CRITICAL
   - [ ] Uses `offlineGetUser()` from `@/lib/offlineAuth`?
   - [ ] Uses Prisma for database operations?
   - [ ] Calls `await prisma.$disconnect()` after operations?

3. **VALIDATE ONLINE MODE**
   - [ ] Uses `createClient()` from `@/lib/supabase/server`?
   - [ ] Uses Supabase client for database operations?
   - [ ] Handles Supabase auth properly?

4. **VALIDATE RESPONSE FORMAT**
   - [ ] Returns `{ success: boolean, error?: string, data?: any }`?
   - [ ] Both modes return same response structure?

5. **TEST BOTH MODES**
   - [ ] Test with `USE_OFFLINE=true`?
   - [ ] Test with `USE_OFFLINE=false`?

## 🚫 Never Do Without Permission
- ❌ Remove dual-mode logic (breaks one environment)
- ❌ Change cookie name from `offline-auth-token` in offline mode
- ❌ Use Supabase in offline mode
- ❌ Use Prisma in online mode (except for migrations)
- ❌ Hard-code offline or online assumptions

## ⚠️ Red Flags (Alert Immediately)

**Cookie Naming Issues:**
- 🚫 `cookieStore.get('auth-token')` - WRONG, must be `offline-auth-token`
- 🚫 `cookieStore.get('token')` - WRONG
- 🚫 Any cookie name other than `offline-auth-token` in offline mode

**Mode Detection Issues:**
- 🚫 No `isOfflineMode` check in server action
- 🚫 Only one mode implemented (missing if/else)
- 🚫 Hard-coded Supabase or Prisma without mode check

**Database Issues:**
- 🚫 Prisma used in online mode (should use Supabase)
- 🚫 Supabase used in offline mode (should use Prisma)
- 🚫 Missing `prisma.$disconnect()` in offline mode

## ✅ Validation Checklist

Before approving ANY server action or auth change:

- [ ] Both offline and online modes implemented?
- [ ] Cookie name is `offline-auth-token` in offline mode?
- [ ] Prisma used in offline, Supabase in online?
- [ ] Response format identical in both modes?
- [ ] Authentication errors handled in both modes?
- [ ] Database disconnection handled (offline mode)?
- [ ] Environment variable check present?
- [ ] No hard-coded mode assumptions?

## 📖 Reference Documentation
- `CLAUDE.md` - Complete dual-mode architecture documentation
- `src/lib/offlineAuth.ts` - Offline JWT authentication
- `src/lib/supabase/server.ts` - Online Supabase authentication
- `src/app/actions/` - All server actions (dual-mode examples)
- `docs/technical/OFFLINE_MODE_COMPLETE.md` - Offline implementation details
- `.env.local` - Environment variable configuration

## Common Dual-Mode Scenarios

### 1. Image Handling
```typescript
if (isOfflineMode) {
  // Mock URLs: "/images/property-1.jpg"
} else {
  // Supabase Storage URLs
}
```

### 2. Contact Unlock
```typescript
if (isOfflineMode) {
  // FREE - Just create Unlock record
} else {
  // ₹99 - Initiate Razorpay payment
}
```

### 3. Database Queries
```typescript
if (isOfflineMode) {
  const prisma = new PrismaClient()
  const user = await prisma.user.findUnique({ where: { id } })
  await prisma.$disconnect()
} else {
  const { data: user } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .single()
}
```

## Priority
This skill has **HIGHEST PRIORITY** when authentication or server actions are modified. Security and dual-mode compatibility must work before any other features.
