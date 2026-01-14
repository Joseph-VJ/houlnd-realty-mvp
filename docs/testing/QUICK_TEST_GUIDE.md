# Houlnd Realty MVP - Quick Test Reference Guide

## 🚀 Quick Start

### Start the Application
```bash
cd f:\opus-4.5\houlnd test\houlnd-realty-mvp
npm run dev
```

**Access:** http://localhost:3000

---

## 👥 Test User Accounts

### Account 1: Customer
```
Email:    customer@test.com
Password: Customer123!
Role:     Customer/Buyer
Path:     /customer/dashboard
```

### Account 2: Promoter/Seller
```
Email:    promoter@test.com
Password: Promoter123!
Role:     Promoter
Path:     /promoter/dashboard
```

---

## 🧪 Quick Test Checklist

### Phase 1: Authentication (5 min)
- [ ] Visit `http://localhost:3000`
- [ ] Click "Login"
- [ ] Use customer@test.com / Customer123!
- [ ] Verify redirect to `/customer/dashboard`
- [ ] Check "Customer" badge visible

### Phase 2: Property Search (5 min)
- [ ] Click "Search" in navigation
- [ ] See 30 properties loaded
- [ ] **Check Price/sq.ft displayed on each card** ✅ (Main USP)
- [ ] Use price filter (min: 5000, max: 10000)
- [ ] Sort by "₹/sq.ft: Low to High"
- [ ] Click on any property

### Phase 3: Property Details (3 min)
- [ ] Review all property information
- [ ] See amenities list with checkmarks
- [ ] Find "Unlock Contact for ₹99" button
- [ ] Click heart to save property
- [ ] Observe heart changes to filled ❤️

### Phase 4: Logout & Switch User (3 min)
- [ ] Click "Logout" button
- [ ] Verify redirected to homepage
- [ ] Login as promoter@test.com / Promoter123!
- [ ] Verify promoter dashboard loads

**Total Time:** ~16 minutes

---

## 📊 Key Metrics to Check

| Item | Expected | Status |
|------|----------|--------|
| Properties Listed | 30 | ✅ |
| Price/sq.ft Filter | Present | ✅ |
| Cities | Pune, Mumbai, Hyderabad, Bangalore, Delhi | ✅ |
| Price Range | ₹3,684 - ₹12,000 per sq.ft | ✅ |
| Authentication | JWT/Offline | ✅ |
| Customer Dashboard | Stats + Search | ✅ |
| Promoter Dashboard | Stats + Post Property | ✅ |
| Mobile | Responsive | ⚠️ Limited Testing |

---

## 🎯 Test Scenarios

### Scenario 1: Property Buyer Journey
1. Homepage → "I Want to Buy"
2. Login as customer
3. Search properties (use price filter)
4. Save favorite properties (click heart)
5. View property details
6. See "Unlock Contact for ₹99"
7. Logout

### Scenario 2: Property Seller Journey
1. Homepage → "I Want to Sell"
2. Login as promoter
3. View dashboard with stats
4. Click "Post New Property" (may not be implemented)
5. Click "My Listings"
6. Logout

### Scenario 3: Browse Without Login
1. Homepage → "Browse Properties Without Signup"
2. View all 30 properties
3. See price/sq.ft on each
4. Click on property
5. See "Unlock Contact" button (requires login)

---

## 🔍 What to Look For

### ✅ Should Work
- [ ] Homepage displays clearly
- [ ] Login accepts valid credentials
- [ ] Properties display with all details
- [ ] Price/sq.ft visible on cards and detail page
- [ ] Filters are responsive
- [ ] Save button changes from 🤍 to ❤️
- [ ] Navigation shows correct role
- [ ] Logout clears session
- [ ] Role-based dashboards work

### ⚠️ Known Offline Mode Limitations
- Saved properties don't persist (Supabase API issue)
- Dashboard stats show 0 (RPC functions not available)
- Appointment booking may not work (Supabase API)
- Property posting may not be implemented

### 🔴 Not Tested (Require Payment Integration)
- Contact unlock payment flow
- Razorpay payment processing
- Payment confirmation

---

## 📱 Pages to Test

| Page | URL | Role | Status |
|------|-----|------|--------|
| Homepage | `/` | All | ✅ Working |
| Search | `/search` | All | ✅ Working |
| Property Detail | `/property/[id]` | All | ✅ Working |
| Login | `/login` | All | ✅ Working |
| Register | `/register` | All | ✅ Working |
| Customer Dashboard | `/customer/dashboard` | Customer | ✅ Working |
| Saved Properties | `/customer/saved` | Customer | ⚠️ Partial |
| Customer Appointments | `/customer/appointments` | Customer | ⚠️ Partial |
| Promoter Dashboard | `/promoter/dashboard` | Promoter | ✅ Working |
| My Listings | `/promoter/listings` | Promoter | ✅ Working |
| Post New Property | `/promoter/post-new-property` | Promoter | 🔄 Not Tested |

---

## 🎨 Design Review Checklist

- [ ] Clean, modern interface
- [ ] Professional color scheme (blue/white/gray)
- [ ] Good readability with proper contrast
- [ ] Proper spacing and padding
- [ ] Responsive layout (desktop)
- [ ] Consistent typography
- [ ] Clear call-to-action buttons
- [ ] Icon usage appropriate
- [ ] Navigation intuitive
- [ ] Forms well-organized

---

## ⚡ Performance Notes

**Load Times:**
- Homepage: 0.5s
- Search: 1.0s
- Property Detail: 2-3s
- Dashboard: 1-2s

**Database:**
- SQLite local database
- No network latency
- Fast queries

---

## 📋 Offline Mode Details

**Environment:**
```
USE_OFFLINE=true
NEXT_PUBLIC_USE_OFFLINE=true
DATABASE_URL="file:./dev.db"
JWT_SECRET=offline-test-secret-key
```

**What Works:**
- ✅ User authentication (JWT)
- ✅ User profiles (Prisma/SQLite)
- ✅ Property listings
- ✅ Role-based access control

**What Doesn't Work:**
- ❌ Supabase API calls
- ❌ RPC functions
- ❌ Real-time subscriptions
- ❌ Direct Supabase storage

---

## 🆘 Troubleshooting

### Issue: "Unable to acquire lock"
**Solution:** Another Next.js instance is running
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### Issue: Database errors
**Solution:** Reset database
```bash
rm dev.db
npx prisma migrate deploy
npx prisma db seed
```

### Issue: Auth not working
**Solution:** Clear cookies and try again
```
Ctrl+Shift+Delete → Clear cookies
Reload page
```

### Issue: Page shows "Loading..." forever
**Solution:** Check browser console for errors
- Look for Supabase API errors (expected in offline mode)
- Check if JWT token is set (check cookies)

---

## 🔗 Important URLs

```
Homepage:       http://localhost:3000
Search:         http://localhost:3000/search
Login:          http://localhost:3000/login
Register:       http://localhost:3000/register
Customer DB:    http://localhost:3000/customer/dashboard
Promoter DB:    http://localhost:3000/promoter/dashboard
Saved Props:    http://localhost:3000/customer/saved
Appointments:   http://localhost:3000/customer/appointments
My Listings:    http://localhost:3000/promoter/listings
```

---

## 📈 Success Criteria

### Must Have (MVP)
- ✅ Users can see 30+ properties
- ✅ Price/sq.ft filter prominent
- ✅ Customer & Promoter roles work
- ✅ Authentication working
- ✅ Property details visible

### Should Have (Polish)
- ✅ Professional design
- ✅ Smooth navigation
- ✅ Clear error messages
- ⚠️ Save feature (UI works, persistence issue)

### Nice to Have (Future)
- ❌ Image upload
- ❌ Appointment booking
- ❌ Payment integration
- ❌ Reviews/ratings

---

## 📝 Notes for Testers

1. **Price per Square Foot** is the main differentiator - make sure it's visible everywhere
2. **Contact Unlock for ₹99** is the monetization model - verify it's clear
3. **Role-based dashboards** should show different content - verify customer != promoter
4. **Offline limitations** - some Supabase features won't work, this is expected
5. **Sample data** - 15 properties created, all have realistic data

---

## 🏁 Final Checklist

Before marking testing complete:
- [ ] All 3 main journeys tested (browse, customer, promoter)
- [ ] Price/sq.ft filter verified working
- [ ] Authentication tested both roles
- [ ] Property details complete
- [ ] Save feature UI working
- [ ] Navigation responsive
- [ ] No major UI errors
- [ ] Performance acceptable
- [ ] Professional appearance

---

**Last Updated:** December 25, 2025  
**Application Status:** ✅ Ready for Testing  
**Estimated Test Duration:** 20-30 minutes for full walkthrough

*For detailed findings, see TEST_REPORT_COMPREHENSIVE.md*
