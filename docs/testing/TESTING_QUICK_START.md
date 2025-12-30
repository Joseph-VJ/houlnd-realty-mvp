# 🧪 Testing Quick Start - Security & Business Logic Fixes

**Purpose:** Verify all critical fixes are working correctly
**Time Required:** 15-20 minutes
**Status:** Ready to test ✅

---

## 🚀 Prerequisites

1. **Restart Development Server** (Required for .env changes)
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

2. **Verify Environment**
   ```bash
   # Check JWT_SECRET is set to strong value
   cat .env.local | grep JWT_SECRET
   # Should show: V5tcCbOY8JbVwxGXKS3Gproo3lNwN0h7ciOs/zlu2gs=
   ```

3. **Check Database**
   ```bash
   # Ensure database is seeded
   npx prisma studio
   # Verify users exist: admin@test.com, promoter@test.com, customer@test.com
   ```

---

## ✅ TEST SUITE

### Test 1: Commission Agreement Storage (2 minutes)

**Objective:** Verify new property submissions create agreement records

**Steps:**
1. Login as Promoter
   - URL: http://localhost:3000/login
   - Email: promoter@test.com
   - Password: Promoter123!

2. Create New Property
   - Go to: /promoter/post-new-property
   - Fill all 8 steps (use any test data)
   - ✅ Check: Step 7 shows "I agree to 2% commission"
   - Submit listing

3. Verify Database
   ```bash
   npx prisma studio
   ```
   - Open `listing_agreement_acceptances` table
   - ✅ Check: New record exists for your listing
   - ✅ Check: `accepted_at` has timestamp
   - ✅ Check: `listing_id` matches your new listing

**Expected Result:** ✅ Agreement record created

**If Failed:** Check console logs for errors in createListing action

---

### Test 2: Unlock Count Increment (3 minutes)

**Objective:** Verify contact unlocks increment the counter

**Steps:**
1. Login as Customer
   - URL: http://localhost:3000/login
   - Email: customer@test.com
   - Password: Customer123!

2. Find a Property
   - Go to: /search
   - Click "View Details" on any property
   - Note the current unlock count in database

3. Unlock Contact
   - Click "🔓 Unlock Contact (FREE)"
   - ✅ Check: Phone number revealed
   - ✅ Check: Full number visible (not masked)

4. Verify Counter
   ```bash
   npx prisma studio
   ```
   - Open `listings` table
   - Find the property you unlocked
   - ✅ Check: `unlock_count` increased by 1

5. Check Promoter Dashboard
   - Logout
   - Login as promoter@test.com
   - Go to: /promoter/dashboard
   - ✅ Check: "Unlocks" count shows accurate number

**Expected Result:** ✅ Counter incremented, visible in dashboard

**If Failed:** Check console logs in contact.ts action

---

### Test 3: API Authentication Security (5 minutes)

**Objective:** Verify API routes reject forged authentication

**Test 3A: No Authentication**
```bash
# Try to access admin API without auth
curl http://localhost:3000/api/admin/listings
```
**Expected:** `{"error":"Unauthorized"}`
**Status:** ✅ PASS if 401 error

**Test 3B: Forged Header (OLD VULNERABILITY)**
```bash
# Try to forge user ID header (should be ignored now)
curl -H "x-user-id: fake-admin-id" http://localhost:3000/api/admin/pending-listings
```
**Expected:** `{"error":"Unauthorized"}`
**Status:** ✅ PASS if 401 error (header ignored)

**Test 3C: Valid Authentication**
1. Login as admin@test.com in browser
2. Open DevTools → Network tab
3. Make any admin API request
4. ✅ Check: Request succeeds with 200 status

**Expected Result:** ✅ Only valid sessions work

---

### Test 4: Route Protection (5 minutes)

**Objective:** Verify middleware blocks unauthorized access

**Test 4A: Unauthenticated Access**
1. Logout completely
2. Try to access: http://localhost:3000/admin/dashboard
3. ✅ Check: Redirected to /login?redirect=/admin/dashboard
4. ✅ Check: Never saw admin content (blocked before render)

**Test 4B: Wrong Role Access**
1. Login as Customer (customer@test.com)
2. Try to access: http://localhost:3000/admin/dashboard
3. ✅ Check: Redirected to /unauthorized
4. ✅ Check: Cannot view admin functions

**Test 4C: Correct Role Access**
1. Login as Admin (admin@test.com)
2. Access: http://localhost:3000/admin/dashboard
3. ✅ Check: Page loads successfully
4. ✅ Check: No redirects or errors

**Expected Result:** ✅ Middleware enforces roles server-side

---

### Test 5: Strong JWT Secret (1 minute)

**Objective:** Verify application won't start with weak secret

**Test 5A: Remove JWT Secret**
```bash
# Edit .env.local and comment out JWT_SECRET
# JWT_SECRET=V5tcCbOY8JbVwxGXKS3Gproo3lNwN0h7ciOs/zlu2gs=
```

```bash
# Restart server
npm run dev
```

**Expected:** ❌ Server crashes with error:
```
SECURITY ERROR: JWT_SECRET environment variable is required.
```

**Test 5B: Short JWT Secret**
```bash
# Edit .env.local
JWT_SECRET=short
```

```bash
# Restart server
npm run dev
```

**Expected:** ❌ Server crashes with error:
```
SECURITY ERROR: JWT_SECRET must be at least 32 characters long.
Current length: 5.
```

**Test 5C: Restore Valid Secret**
```bash
# Edit .env.local
JWT_SECRET=V5tcCbOY8JbVwxGXKS3Gproo3lNwN0h7ciOs/zlu2gs=
```

```bash
# Restart server
npm run dev
```

**Expected:** ✅ Server starts successfully

---

## 📊 REGRESSION TESTS

**Objective:** Ensure existing functionality still works

### Regression 1: Login Flow (2 minutes)
- [ ] Customer can login
- [ ] Promoter can login
- [ ] Admin can login
- [ ] Logout works for all roles

### Regression 2: Property Search (2 minutes)
- [ ] /search page loads
- [ ] City filter works
- [ ] Price/sqft filter works
- [ ] Property details page loads

### Regression 3: Property Submission (3 minutes)
- [ ] All 8 steps load
- [ ] Form validation works
- [ ] Submit creates listing
- [ ] Status is PENDING_VERIFICATION

### Regression 4: Admin Workflow (2 minutes)
- [ ] Admin sees pending listings
- [ ] Approve button works
- [ ] Status changes to LIVE
- [ ] Property appears in search

---

## ✅ SUCCESS CRITERIA

### All Tests Pass If:
1. ✅ Commission agreements stored in database
2. ✅ Unlock counts increment correctly
3. ✅ API routes reject forged authentication
4. ✅ Middleware blocks wrong roles
5. ✅ Application enforces strong JWT secrets
6. ✅ All regression tests pass

### Test Results Summary:
```
Business Logic Tests:
[✅] Test 1: Commission Agreement Storage
[✅] Test 2: Unlock Count Increment

Security Tests:
[✅] Test 3: API Authentication
[✅] Test 4: Route Protection
[✅] Test 5: JWT Secret Enforcement

Regression Tests:
[✅] Login Flow
[✅] Property Search
[✅] Property Submission
[✅] Admin Workflow

OVERALL: ✅ PASS / ❌ FAIL
```

---

## 🐛 TROUBLESHOOTING

### Issue: Server won't start
**Error:** `SECURITY ERROR: JWT_SECRET...`
**Fix:** Check `.env.local` has valid JWT_SECRET (32+ chars)

### Issue: API returns 401
**Cause:** Session expired or cookies cleared
**Fix:** Re-login to get new JWT token

### Issue: Middleware redirects in loop
**Cause:** Role mismatch or session corruption
**Fix:** Clear cookies and re-login

### Issue: Unlock count not incrementing
**Check:**
1. Console logs for errors in contact.ts
2. Database permissions
3. Prisma client connection

### Issue: Agreement not stored
**Check:**
1. Console logs for errors in createListing.ts
2. Check `listing_agreement_acceptances` table exists
3. Verify foreign key relationship

---

## 📝 REPORTING ISSUES

**If Tests Fail:**

1. **Capture Error Details:**
   - Browser console errors
   - Server console logs
   - Network tab (DevTools)
   - Database state (Prisma Studio)

2. **Note Test Number:**
   - Which test failed? (Test 1-5)
   - At what step?
   - Expected vs actual result?

3. **Check Logs:**
   ```bash
   # Server logs show detailed errors
   # Look for lines starting with "Error:"
   ```

4. **Verify Files Modified:**
   ```bash
   git status
   git diff
   ```

---

## 🎯 QUICK COMMANDS

```bash
# Start server
npm run dev

# Open database
npx prisma studio

# Check logs (Windows)
Get-Content .\logs\error.log -Tail 50

# Test API endpoint
curl http://localhost:3000/api/health

# Generate new JWT secret
openssl rand -base64 32
```

---

## ✅ FINAL CHECKLIST

Before marking as complete, verify:
- [ ] All 5 main tests pass
- [ ] All 4 regression tests pass
- [ ] No console errors
- [ ] Database updated correctly
- [ ] Server runs without warnings
- [ ] All roles work correctly

**Sign-off:**
- Tested by: _________________
- Date: _________________
- Status: ✅ PASS / ❌ FAIL
- Notes: _________________

---

**Total Testing Time:** ~20 minutes
**Next Step:** Security penetration testing
**Reference:** See CRITICAL_FIXES_COMPLETED.md for detailed fix descriptions
