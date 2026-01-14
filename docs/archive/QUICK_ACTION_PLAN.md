# ⚡ Quick Action Plan - Fix Critical Issues

**Target:** Production-ready in 2-3 weeks
**Current Status:** 75% ready, needs critical fixes

---

## 🔴 WEEK 1: Critical Fixes (MUST DO)

### Day 1-2: Payment System Error Handling

**File 1:** `src/app/api/payments/razorpay/order/route.ts`
```typescript
// Wrap lines 68-82 in try-catch
try {
  const order = await razorpay.orders.create({ /* ... */ })
  return NextResponse.json({ /* ... */ })
} catch (error) {
  console.error('Razorpay order creation failed:', error)
  return NextResponse.json(
    { error: 'Failed to create payment order' },
    { status: 500 }
  )
}
```

**File 2:** `src/app/api/payments/razorpay/verify/route.ts`
```typescript
// Use Prisma transaction for atomicity (lines 102-129)
const result = await prisma.$transaction(async (tx) => {
  const unlock = await tx.unlock.create({ /* ... */ })
  const payment = await tx.paymentOrder.create({ /* ... */ })
  return { unlock, payment }
})
```

### Day 3: API Route Error Handling

**File 3:** `src/app/api/listings/route.ts` (POST)
```typescript
// Add try-catch around line 103-123
try {
  const listing = await prisma.listing.create({ /* ... */ })
  return NextResponse.json({ success: true, listingId: listing.id })
} catch (error) {
  console.error('Failed to create listing:', error)
  return NextResponse.json(
    { error: 'Failed to create property listing' },
    { status: 500 }
  )
}
```

**File 4:** `src/app/api/admin/listings/route.ts` (GET)
```typescript
// Add try-catch around line 29-41
try {
  const listings = await prisma.listing.findMany({ /* ... */ })
  return NextResponse.json({ success: true, data: listings })
} catch (error) {
  console.error('Failed to fetch admin listings:', error)
  return NextResponse.json(
    { error: 'Failed to load listings' },
    { status: 500 }
  )
}
```

### Day 4: Admin Routes Error Handling

**File 5:** `src/app/api/admin/listings/[id]/approve/route.ts`
**File 6:** `src/app/api/admin/listings/[id]/reject/route.ts`
```typescript
// Add try-catch with P2025 (not found) handling
try {
  const listing = await prisma.listing.update({ /* ... */ })
  return NextResponse.json({ success: true, listing })
} catch (error) {
  if (error.code === 'P2025') {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }
  return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
}
```

### Day 5: Testing Critical Fixes

- [ ] Test payment flow end-to-end
- [ ] Test listing creation with errors
- [ ] Test admin approve/reject
- [ ] Verify error messages are user-friendly
- [ ] Check server logs for proper error logging

---

## 🟡 WEEK 2: Medium Priority Fixes

### Day 6-7: Type Safety Improvements

**Remove all `as any` casts (20 instances):**

Files to update:
- `src/app/property/[id]/page.tsx:138`
- `src/app/actions/auth.ts:113, 217`
- `src/app/search/page.tsx`
- And 15 more files

**Create proper type definitions:**
```typescript
// Create src/types/listing.ts
export interface ListingWithPromoter extends Listing {
  promoter: {
    id: string
    fullName: string
    phoneE164: string
  }
}
```

### Day 8: Environment Variable Validation

**Create `src/lib/validateEnv.ts`:**
```typescript
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }

  // Warn about weak secrets
  if (process.env.JWT_SECRET?.includes('change-this')) {
    console.warn('⚠️ WARNING: Using default JWT_SECRET in production!')
  }
}
```

**Call in `src/app/layout.tsx`:**
```typescript
import { validateEnv } from '@/lib/validateEnv'

if (process.env.NODE_ENV === 'production') {
  validateEnv()
}
```

### Day 9-10: Database Connection Management

**Fix Prisma disconnect in auth actions:**

`src/app/actions/auth.ts:368-393`
```typescript
const prisma = new PrismaClient()
try {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user
} finally {
  await prisma.$disconnect()  // Always called, even on error
}
```

Apply same pattern to all Prisma usage in server actions.

---

## 🟢 WEEK 3: Testing & Production Prep

### Day 11-12: Automated Testing

**Install testing dependencies:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

**Create test files:**
- `src/app/actions/__tests__/auth.test.ts`
- `src/app/actions/__tests__/listings.test.ts`
- `src/components/__tests__/PropertyCard.test.tsx`

**Focus on critical paths:**
1. Payment verification
2. Listing creation
3. User authentication

### Day 13-14: Load Testing

**Test scenarios:**
- 100 concurrent users browsing properties
- 50 concurrent payment transactions
- Database connection pool behavior
- Memory leak detection

**Tools:**
- k6 for load testing
- Chrome DevTools for memory profiling

### Day 15: Production Environment Setup

**Create `.env.production`:**
```bash
USE_OFFLINE=false
NEXT_PUBLIC_USE_OFFLINE=false

# Real Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-real-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Strong JWT secret (generated)
JWT_SECRET=$(openssl rand -base64 32)

# Production Razorpay keys
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your-secret

# Production database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**Deployment checklist:**
- [ ] Generate strong JWT_SECRET
- [ ] Configure production Razorpay keys
- [ ] Set up Supabase production project
- [ ] Configure production database
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CDN for images
- [ ] Set up SSL certificates
- [ ] Configure backup strategy

---

## 📊 Progress Tracking

### Week 1 Status:
- [ ] Payment order creation error handling
- [ ] Payment verification atomicity
- [ ] Listings API error handling
- [ ] Admin API error handling
- [ ] Critical path testing

**Target:** 95% critical issues resolved

### Week 2 Status:
- [ ] Type safety improvements (remove `as any`)
- [ ] Environment variable validation
- [ ] Database connection management
- [ ] signOut() error handling
- [ ] Register OTP error handling

**Target:** 90% medium issues resolved

### Week 3 Status:
- [ ] Unit tests for critical paths
- [ ] Integration tests for payment flow
- [ ] Load testing completed
- [ ] Production environment configured
- [ ] Deployment ready

**Target:** 100% production-ready

---

## 🎯 Success Criteria

Before marking as "production-ready", verify:

### Error Handling:
✅ All payment routes have try-catch blocks
✅ All API routes return user-friendly error messages
✅ Database transactions are atomic (payment verification)
✅ All Prisma disconnects are in finally blocks
✅ No unhandled promise rejections

### Type Safety:
✅ Zero `as any` casts remaining
✅ Proper TypeScript interfaces defined
✅ No type errors in production build

### Testing:
✅ 80%+ test coverage on critical paths
✅ All payment scenarios tested
✅ Load testing passed with 100+ concurrent users

### Production Setup:
✅ Strong secrets configured
✅ Environment variables validated
✅ Error monitoring enabled
✅ Backup strategy in place
✅ SSL certificates configured

---

## 📞 Quick Reference

**Files to Modify (Critical):**
1. `src/app/api/payments/razorpay/order/route.ts`
2. `src/app/api/payments/razorpay/verify/route.ts`
3. `src/app/api/listings/route.ts`
4. `src/app/api/admin/listings/route.ts`
5. `src/app/api/admin/listings/[id]/approve/route.ts`
6. `src/app/api/admin/listings/[id]/reject/route.ts`

**Files to Modify (Medium):**
- `src/app/actions/auth.ts` (Prisma disconnect)
- 20 files with `as any` casts
- `src/lib/validateEnv.ts` (create new)

**Estimated Time:**
- Week 1 (Critical): **40 hours**
- Week 2 (Medium): **30 hours**
- Week 3 (Testing): **30 hours**
- **Total: 100 hours (2.5 weeks full-time)**

---

**Last Updated:** December 25, 2025
**Status:** Ready to start fixes
**Next Action:** Begin with payment route error handling (Day 1)
