# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Houlnd Realty** is a real estate marketplace MVP where buyers can browse properties and unlock seller contacts 100% FREE (in production, there may be fees). The platform supports both **offline mode** (SQLite) for local testing and **online mode** (Supabase) for production.

**Key Innovation:** FREE contact unlock for buyers → Maximum leads for sellers → Revenue from premium seller services (2% commission + future premium listings at ₹2,999/month).

---

## Development Commands

### Database Setup (First Time)
```bash
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema to database
npx prisma db seed        # Seed test data with credentials
```

### Development
```bash
npm install               # Install dependencies
npm run dev               # Start dev server (http://localhost:3000)
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
```

### Database Management
```bash
npx prisma studio         # Open database GUI at http://localhost:5555
npx prisma db push        # Sync schema changes to database
npx prisma db seed        # Re-seed database with test data
```

---

## Dual-Mode Architecture

This application has **two completely different runtime modes** controlled by the `USE_OFFLINE` environment variable:

### Offline Mode (Default - SQLite)
- **Database:** SQLite via Prisma (`prisma/dev.db`)
- **Authentication:** JWT tokens with `jose` library, cookies named `offline-auth-token`
- **Auth Implementation:** `src/lib/offlineAuth.ts` (bcrypt password hashing)
- **Storage:** Mock image URLs
- **Contact Unlock:** FREE (no payment processing)
- **Cookie Name:** `offline-auth-token` (critical - used across all server actions)
- **Purpose:** Local development without external dependencies

### Online Mode (Production - Supabase)
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth with SSR package (`@supabase/ssr`)
- **Auth Implementation:** `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts`
- **Storage:** Supabase Storage for images
- **Contact Unlock:** ₹99 via Razorpay integration
- **Purpose:** Production deployment

### Switching Modes
Edit `.env.local`:
```bash
USE_OFFLINE=true                    # Offline mode
NEXT_PUBLIC_USE_OFFLINE=true        # Client-side flag
DATABASE_URL="file:./dev.db"        # SQLite
```

**CRITICAL:** When modifying authentication or server actions, ALWAYS check which mode is active and ensure both modes are supported. Most server actions in `src/app/actions/` have dual-mode logic with conditional checks for `process.env.USE_OFFLINE === 'true'`.

---

## Authentication Architecture

### Offline Mode Authentication
- **File:** `src/lib/offlineAuth.ts`
- **Functions:**
  - `offlineSignUp()` - Creates user with bcrypt password hash
  - `offlineSignIn()` - Validates credentials, returns JWT
  - `offlineGetUser()` - Verifies JWT token
  - `offlineVerifyToken()` - Edge-compatible token verification (NO Prisma)
- **Cookie:** `offline-auth-token` (must be consistent across all actions)
- **Token:** JWT signed with `process.env.JWT_SECRET`, 7-day expiration

### Online Mode Authentication
- **Files:** `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- **Pattern:** Uses `@supabase/ssr` for cookie-based sessions
- **Server Client:** `createClient()` for Server Components, Route Handlers, Server Actions
- **Admin Client:** `createAdminClient()` bypasses RLS with service role key

### Server Actions Pattern
All authentication-dependent actions in `src/app/actions/` follow this pattern:

```typescript
'use server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { offlineGetUser } from '@/lib/offlineAuth'

const isOfflineMode = process.env.USE_OFFLINE === 'true'

export async function myAction() {
  if (isOfflineMode) {
    const cookieStore = await cookies()
    const token = cookieStore.get('offline-auth-token')?.value
    if (!token) return { success: false, error: 'Not authenticated' }

    const { data } = await offlineGetUser(token)
    if (!data.user) return { success: false, error: 'Not authenticated' }

    // Use Prisma for database operations
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Use Supabase for database operations
  }
}
```

---

## Database Schema

**File:** `prisma/schema.prisma`

### Key Models
- **User** - Stores all users (customers, promoters, admins)
  - Role: `CUSTOMER`, `PROMOTER`, or `ADMIN`
  - Offline: Stores `passwordHash` for JWT auth
  - Relationships: listings, unlocks, savedProperties, appointments

- **Listing** - Property listings
  - Status: `DRAFT`, `PENDING`, `LIVE`, `REJECTED`, `SOLD`
  - Key fields: `propertyType`, `totalPrice`, `totalSqft`, `pricePerSqft`
  - Stored as JSON: `amenitiesJson`, `imageUrls`
  - Metrics: `viewCount`, `saveCount`, `unlockCount`

- **Unlock** - Contact unlock records (FREE in offline mode)
  - Unique constraint: `[userId, listingId]` (one unlock per user per listing)
  - Tracks payment in online mode via `paymentProvider`, `paymentRef`

- **SavedProperty** - User's saved/favorited properties
  - Unique constraint: `[userId, listingId]`

- **Appointment** - Property viewing appointments
  - Status: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`
  - Links customer and promoter to listing

### Database Provider
The schema uses `provider = "sqlite"` by default. For Supabase deployment, this should be changed to `provider = "postgresql"` and migrations re-run.

---

## Server Actions Organization

All server actions are in `src/app/actions/`:

- **auth.ts** - User authentication (signup, signin, signout)
- **listings.ts** - Property CRUD, admin approval/rejection, search/filter
- **contact.ts** - Contact unlock logic (FREE offline, ₹99 online via Razorpay)
- **savedProperties.ts** - Save/unsave properties
- **appointments.ts** - Schedule, confirm, cancel property viewings
- **dashboard.ts** - Dashboard data for customers, promoters, admins
- **createListing.ts** - Multi-step property submission form

**Pattern:** All actions return `{ success: boolean, error?: string, data?: any }`

---

## Routing Structure

### Public Routes
- `/` - Landing page
- `/search` - Browse all LIVE properties
- `/property/[id]` - Property detail page
- `/about`, `/contact` - Static pages
- `/legal/terms`, `/legal/privacy` - Legal pages

### Auth Routes (Route Group: `(auth)`)
- `/login` - Login page
- `/register` - Registration page (select CUSTOMER or PROMOTER role)

### Customer Routes
- `/customer/dashboard` - View saved properties, unlocked contacts, appointments
- `/customer/saved` - Saved properties list
- `/customer/appointments` - Manage appointments

### Promoter Routes
- `/promoter/dashboard` - View my listings, stats
- `/promoter/listings` - Manage my property listings
- `/promoter/post-new-property` - 8-step property submission form
- `/promoter/appointments` - Manage appointment requests

### Admin Routes
- `/admin/dashboard` - System overview, stats
- `/admin/pending-listings` - Review and approve/reject PENDING listings
- `/admin/listings` - View all listings
- `/admin/users` - User management

---

## Key Features & Business Logic

### 1. Property Submission Workflow
- Promoter submits property via 8-step form
- Initial status: `PENDING`
- Admin reviews at `/admin/pending-listings`
- Admin can APPROVE → status becomes `LIVE` (visible in search)
- Admin can REJECT → status becomes `REJECTED` with reason
- Only `LIVE` properties appear in public search

### 2. Contact Unlock System
- **Offline:** Clicking unlock button creates `Unlock` record, contact shows immediately (FREE)
- **Online:** Initiates Razorpay payment flow (₹99), contact unlocks after successful payment
- Phone numbers masked as `+91******00` until unlocked
- File: `src/app/actions/contact.ts`

### 3. Save/Unsave Properties
- Users can favorite properties (heart icon)
- Creates `SavedProperty` record
- Accessible in customer dashboard
- File: `src/app/actions/savedProperties.ts`

### 4. Search & Filters
- Search by: city, property type, bedrooms, bathrooms, price range, price/sqft
- Sort by: price (asc/desc), price/sqft, newest
- Pagination support
- Only shows `LIVE` listings to non-admin users
- File: `src/app/actions/listings.ts` (`searchListings()`)

### 5. Appointment Scheduling
- Customers can schedule property viewings
- Creates `Appointment` record linking customer, promoter, and listing
- Promoters can confirm/cancel
- File: `src/app/actions/appointments.ts`

---

## Important Patterns & Conventions

### 1. Cookie Naming Convention
**CRITICAL:** In offline mode, the auth cookie MUST be named `offline-auth-token` everywhere. Recent bugs occurred due to mismatched cookie names (`auth-token` vs `offline-auth-token`). Always use:
```typescript
const token = cookieStore.get('offline-auth-token')?.value
```

### 2. Image Handling
- **Offline:** Mock URLs stored in `imageUrls` JSON field (e.g., `/images/property-1.jpg`)
- **Online:** Actual Supabase Storage URLs
- Images stored as JSON array: `["url1", "url2", "url3"]`

### 3. Phone Number Format
- Stored in E.164 format: `+919876543210`
- Masked display: `+91******10` (last 2 digits visible)
- File: `src/lib/mask.ts` for masking utilities

### 4. Price Fields
- `totalPrice` - Total property price in INR
- `pricePerSqft` - Calculated: `totalPrice / totalSqft`
- All prices stored as `Float` in database

### 5. Prisma Client Usage
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Always disconnect after operations in serverless functions
await prisma.$disconnect()
```

In `offlineAuth.ts`, Prisma is dynamically imported to avoid edge runtime issues:
```typescript
async function getPrismaClient() {
  const { PrismaClient } = await import('@prisma/client');
  return new PrismaClient();
}
```

---

## Test Credentials

After running `npx prisma db seed`, use these credentials:

| Role       | Email                 | Password      |
|------------|-----------------------|---------------|
| Customer   | customer@test.com     | Customer123!  |
| Promoter   | promoter@test.com     | Promoter123!  |
| Admin      | admin@test.com        | Admin123!     |

**Seed File:** `prisma/seed.ts` - Creates test users and 10 sample properties (5 LIVE, 5 PENDING)

---

## Common Development Tasks

### Adding a New Server Action
1. Create function in appropriate file under `src/app/actions/`
2. Add `'use server'` directive at top of file
3. Implement dual-mode logic (offline and online)
4. Use consistent response format: `{ success, error?, data? }`
5. Handle authentication with correct cookie name

### Modifying Database Schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (development) or create migration (production)
3. Update TypeScript types if needed
4. Re-seed if schema changes affect seed data: `npx prisma db seed`

### Debugging Authentication Issues
1. Check `.env.local` for `USE_OFFLINE` value
2. Verify cookie name is `offline-auth-token` (offline) or Supabase cookie (online)
3. Check JWT_SECRET is set in `.env.local`
4. Inspect cookies in browser DevTools → Application → Cookies
5. Check server action logs for authentication errors

### Testing Both Modes
1. Test offline: `USE_OFFLINE=true npm run dev`
2. Test online: `USE_OFFLINE=false npm run dev` (requires Supabase credentials)
3. Ensure all features work in both modes

---

## Documentation

Complete documentation is in the `docs/` folder:

- **PROJECT_OVERVIEW.md** - Complete feature documentation
- **QUICK_REFERENCE.md** - Test credentials and quick commands
- **business/BUSINESS_MODEL.md** - Revenue strategy, pricing
- **business/FREE_FOR_BUYERS.md** - Lead generation model
- **technical/OFFLINE_MODE_COMPLETE.md** - Offline mode implementation details
- **technical/CHANGES_SUMMARY.md** - Recent changes and bug fixes
- **testing/START_TESTING.md** - Step-by-step testing workflows

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Server Components)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database (Offline):** SQLite via Prisma ORM
- **Database (Online):** PostgreSQL via Supabase
- **Authentication (Offline):** JWT with `jose` library
- **Authentication (Online):** Supabase Auth with `@supabase/ssr`
- **Forms:** React Hook Form + Zod validation
- **State Management:** Zustand (client-side), React Query (server state)
- **Payments:** Razorpay (online mode only)
- **Image Compression:** `browser-image-compression`

---

## Deployment Notes

### Vercel Deployment (Online Mode)
1. Set environment variables in Vercel dashboard:
   - `USE_OFFLINE=false`
   - `NEXT_PUBLIC_USE_OFFLINE=false`
   - `DATABASE_URL` (Supabase PostgreSQL connection string)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - Razorpay keys
2. Change `prisma/schema.prisma` provider to `postgresql`
3. Run Prisma migrations
4. Deploy to Vercel

### Environment Variables
See `.env.local` for all required variables. Never commit actual credentials.

---

## Known Issues & Recent Fixes

**December 26, 2025:**
- ✅ Fixed authentication cookie mismatch (`auth-token` → `offline-auth-token`)
- ✅ Updated all server actions to use correct cookie name
- ✅ Organized documentation into `docs/` folders
- ✅ Login now works correctly in offline mode

See `docs/technical/CHANGES_SUMMARY.md` for detailed change log.

---

## Important Reminders

1. **Cookie Naming:** ALWAYS use `offline-auth-token` in offline mode
2. **Dual-Mode Support:** When modifying auth or database logic, support both modes
3. **Prisma Disconnect:** Always disconnect Prisma client in serverless functions
4. **Admin Approval:** Properties are PENDING by default, require admin approval to be LIVE
5. **Contact Unlock:** FREE in offline mode, paid (₹99) in online mode
6. **Image URLs:** Mock URLs in offline, real Supabase URLs in online mode
