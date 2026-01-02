# 🧪 Complete Testing Checklist - Bug Fixes Verification

## 📅 Date: January 2, 2026
## 🎯 Purpose: Verify all bug fixes from testing-changes-want-to-do.md

---

## 🔐 CUSTOMER (BUYER) ACCOUNT TESTS

### Test 1: Logout Functionality
- [ ] Login as customer (customer@test.com)
- [ ] Navigate to dashboard
- [ ] Click "Logout" button in header
- [ ] **Expected:** Redirected to login page, session cleared
- [ ] Try accessing `/customer/dashboard` directly
- [ ] **Expected:** Redirected to login (protected route)

### Test 2: Saved Properties Persistence
- [ ] Login as customer
- [ ] Go to `/search` or browse properties
- [ ] Click heart icon on at least 3 different properties
- [ ] **Expected:** Heart turns red/filled for each
- [ ] Navigate to "Saved Properties" page
- [ ] **Expected:** All 3 properties appear in the list
- [ ] Refresh the page
- [ ] **Expected:** Properties still appear (persisted)
- [ ] Click heart icon to unsave one property
- [ ] **Expected:** Property removed from list immediately
- [ ] Refresh page
- [ ] **Expected:** Unsaved property does not reappear

### Test 3: Unlock Contact Details
- [ ] Login as customer
- [ ] View any property detail page
- [ ] Initial state: Phone shows as masked (e.g., `+91******00`)
- [ ] Click "View Seller Contact (FREE)" button
- [ ] **Expected:** Phone number reveals (e.g., `+91 98765 43210`)
- [ ] **Expected:** No database error in console
- [ ] Refresh the page
- [ ] **Expected:** Phone number still unlocked (persisted)
- [ ] Check different property
- [ ] **Expected:** Can unlock multiple contacts

### Test 4: Property Search & Filtering
- [ ] Go to `/search` page
- [ ] Filter by city (select from dropdown)
- [ ] **Expected:** Results filtered correctly
- [ ] Filter by price range (min/max price per sqft)
- [ ] **Expected:** Results update correctly
- [ ] Clear filters
- [ ] **Expected:** All properties shown again

---

## 🏢 PROMOTER (SELLER) ACCOUNT TESTS

### Test 5: Logout Functionality
- [ ] Login as promoter (promoter@test.com)
- [ ] Navigate to dashboard
- [ ] Click "Logout" button in header
- [ ] **Expected:** Redirected to login page, session cleared

### Test 6: Post New Property Listing
- [ ] Login as promoter
- [ ] Go to "Post Property" page
- [ ] Fill Step 1: Basic Details (property type, price, area)
- [ ] **Expected:** Price per sqft calculated automatically
- [ ] Fill Step 2: Location (city, locality, address)
- [ ] Fill Step 3: Property Details (bedrooms, bathrooms, etc.)
- [ ] Fill Step 4: Amenities (select 2-3)
- [ ] Fill Step 5: Photos - Upload at least 3 images
- [ ] **Expected:** Images preview correctly
- [ ] Try uploading only 2 images
- [ ] **Expected:** Validation error "Please upload at least 3 images"
- [ ] Upload 3+ images (10MB total or less)
- [ ] Click "Next" through all steps to Step 8: Review
- [ ] **Expected:** All data displayed correctly in review
- [ ] Click "Submit Listing for Review"
- [ ] **Expected:** Success! Redirected to "My Listings" page
- [ ] **Expected:** New listing appears with status "PENDING_VERIFICATION"
- [ ] **Expected:** NO "Bucket not found" error

### Test 7: My Listings Page Filtering
- [ ] After submitting listing, go to "My Listings" page
- [ ] **Expected:** Shows ONLY your listings (not global)
- [ ] Check dashboard stats
- [ ] **Expected:** "My Listings" count increased by 1
- [ ] Filter by status: "Pending"
- [ ] **Expected:** Only pending listings shown
- [ ] Filter by status: "All"
- [ ] **Expected:** All your listings shown (any status)

### Test 8: Dashboard Statistics
- [ ] Login as promoter with existing listings
- [ ] Check dashboard metrics
- [ ] **Expected:** "Listings" shows actual count (not 0)
- [ ] **Expected:** "Total Earnings" calculated correctly
- [ ] **Expected:** "Recent Unlocks" displays recent contacts unlocked
- [ ] Click "Post Property" button
- [ ] **Expected:** Navigates to post property wizard

---

## 👑 ADMIN ACCOUNT TESTS

### Test 9: Admin Dashboard Metrics
- [ ] Login as admin (admin@test.com)
- [ ] Check dashboard metrics
- [ ] **Expected:** "Platform Users" shows actual count (not 0)
- [ ] **Expected:** "Total Customers" shows customer count
- [ ] **Expected:** "Total Promoters" shows promoter count
- [ ] **Expected:** "Pending Review" shows pending listings count
- [ ] **Expected:** "Live Listings" shows approved listings count
- [ ] **Expected:** All metrics are > 0 if data exists

### Test 10: Admin Listings Route
- [ ] From admin dashboard, click "Listings" tab
- [ ] **Expected:** Navigates to `/admin/listings` (no logout)
- [ ] **Expected:** Page loads with all listings
- [ ] Filter by status: "Pending"
- [ ] **Expected:** Only pending listings shown
- [ ] Filter by status: "Live"
- [ ] **Expected:** Only live listings shown
- [ ] Use search bar: type city name
- [ ] **Expected:** Results filtered by search query
- [ ] Click "View Details" on any listing
- [ ] **Expected:** Opens property detail page

### Test 11: Pending Listings Management
- [ ] Click "Pending" in admin navbar
- [ ] **Expected:** Opens `/admin/pending-listings`
- [ ] **Expected:** Shows only PENDING_VERIFICATION listings
- [ ] Click "Review" on a listing
- [ ] Click "Approve"
- [ ] **Expected:** Status changes to "LIVE"
- [ ] **Expected:** Listing appears in "Live Listings"
- [ ] Review another pending listing
- [ ] Click "Reject" and provide reason
- [ ] **Expected:** Status changes to "REJECTED"
- [ ] **Expected:** Rejection reason saved

### Test 12: User Management
- [ ] Click "Users" in admin navbar
- [ ] **Expected:** Opens `/admin/users`
- [ ] **Expected:** Table shows all users (not empty)
- [ ] **Expected:** Shows customers, promoters, admins
- [ ] Filter by role: "CUSTOMER"
- [ ] **Expected:** Only customers shown
- [ ] Search by email
- [ ] **Expected:** User found if exists

### Test 13: Admin Logout
- [ ] From admin dashboard, click "Logout" button
- [ ] **Expected:** Redirected to login page
- [ ] **Expected:** Session cleared
- [ ] Try accessing `/admin/dashboard` directly
- [ ] **Expected:** Redirected to login

---

## 🔄 CROSS-FUNCTIONAL TESTS

### Test 14: Save → Unlock → Schedule Flow
- [ ] Login as customer
- [ ] Search and find a property
- [ ] Save the property (click heart)
- [ ] Click property to view details
- [ ] Unlock seller contact
- [ ] **Expected:** Contact revealed
- [ ] (Future) Schedule appointment if enabled
- [ ] Check "Saved Properties" page
- [ ] **Expected:** Property still saved

### Test 15: Post → Admin Review → Customer View Flow
- [ ] Login as promoter
- [ ] Post a new property listing
- [ ] Logout
- [ ] Login as admin
- [ ] Go to "Pending" listings
- [ ] Approve the new listing
- [ ] Logout
- [ ] Login as customer
- [ ] Search for properties
- [ ] **Expected:** New listing appears in search results
- [ ] Click to view details
- [ ] **Expected:** All details correct
- [ ] Unlock contact
- [ ] **Expected:** Promoter contact revealed

### Test 16: Error Handling - No Auth
- [ ] Logout (ensure not logged in)
- [ ] Try to access `/customer/dashboard`
- [ ] **Expected:** Redirected to login with message
- [ ] Try to access `/promoter/post-new-property`
- [ ] **Expected:** Redirected to login
- [ ] Try to access `/admin/dashboard`
- [ ] **Expected:** Redirected to login

### Test 17: Error Handling - Wrong Role
- [ ] Login as customer
- [ ] Try to access `/promoter/dashboard` directly
- [ ] **Expected:** Access denied or redirected
- [ ] Try to access `/admin/dashboard` directly
- [ ] **Expected:** Access denied or redirected
- [ ] Login as promoter
- [ ] Try to access `/admin/users` directly
- [ ] **Expected:** Access denied or redirected

---

## 🐛 SPECIFIC BUG FIXES VERIFICATION

### ✅ Fix 1: Logout Button (Customer)
**Original Issue:** Clicking logout does nothing
- [ ] **VERIFY:** Logout button clears session and redirects

### ✅ Fix 2: Logout Button (Promoter)
**Original Issue:** Same as customer
- [ ] **VERIFY:** Logout button works correctly

### ✅ Fix 3: Admin Metrics
**Original Issue:** All metrics show 0
- [ ] **VERIFY:** Metrics show actual counts from database

### ✅ Fix 4: Admin Listings Route
**Original Issue:** Clicking "Listings" logs admin out
- [ ] **VERIFY:** Route works without logging out

### ✅ Fix 5: Saved Properties
**Original Issue:** Saved properties not persisting
- [ ] **VERIFY:** Save/unsave persists after page refresh

### ✅ Fix 6: Unlock Contact
**Original Issue:** "null value in column 'id'" error
- [ ] **VERIFY:** Unlock works without database errors

### ✅ Fix 7: Image Upload
**Original Issue:** "Bucket not found" error on submission
- [ ] **VERIFY:** Listing submission succeeds with images
- [ ] **VERIFY:** Falls back to base64 if bucket missing

### ✅ Fix 8: Promoter Listings Filter
**Original Issue:** Shows global listings instead of user's
- [ ] **VERIFY:** "My Listings" shows only logged-in promoter's listings

### ✅ Fix 9: Error Messages
**Original Issue:** Silent failures, unclear errors
- [ ] **VERIFY:** User-friendly error messages displayed

---

## 📊 PERFORMANCE CHECKS

### Test 18: Page Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Search results load in < 3 seconds
- [ ] Property details load in < 2 seconds
- [ ] Image uploads process in < 10 seconds

### Test 19: Responsiveness
- [ ] Test on mobile viewport (375px width)
- [ ] Test on tablet viewport (768px width)
- [ ] Test on desktop viewport (1920px width)
- [ ] **Expected:** All pages responsive and usable

---

## ✨ PASS CRITERIA

All checkboxes above should be checked ✅ for the system to be considered:
- **Functionally Complete** ✓
- **Bug-Free** ✓
- **User-Friendly** ✓
- **Ready for Production** ✓

---

## 📝 Notes Section

Use this space to record any issues found during testing:

**Issues Found:**
1. _____________________________________
2. _____________________________________
3. _____________________________________

**Performance Notes:**
- _____________________________________
- _____________________________________

**UX Improvements Needed:**
- _____________________________________
- _____________________________________

---

## ✅ Sign-Off

- [ ] All customer tests passed
- [ ] All promoter tests passed
- [ ] All admin tests passed
- [ ] All cross-functional tests passed
- [ ] All bug fixes verified
- [ ] Performance acceptable
- [ ] Ready for deployment

**Tested By:** ___________________________
**Date:** ___________________________
**Signature:** ___________________________
