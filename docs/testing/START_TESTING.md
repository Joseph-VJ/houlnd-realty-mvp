# 🚀 START TESTING NOW!

**Everything is ready. Here's how to test the complete workflow in offline mode.**

---

## ⚡ Quick Start (2 minutes)

```bash
# Server is already running on port 3000
http://localhost:3000
```

---

## 🧪 Test Flow 1: Customer Unlocking Contact (5 min)

### Step 1: Browse Properties
```
1. Open: http://localhost:3000/search
2. See: 15 properties displayed
3. Try: City filter → Select "Mumbai"
4. Try: Price/sqft filter → Min: 5000, Max: 10000
5. Result: Properties filtered correctly ✅
```

### Step 2: View Property Details
```
6. Click: "View Details" on any property
7. See: Full property page with images
8. See: Contact shown as masked: +91******00
9. See: "🔓 Unlock Contact (FREE for Testing)" button
```

### Step 3: Try to Unlock (Not Logged In)
```
10. Click: "🔓 Unlock Contact (FREE for Testing)"
11. Result: Redirected to /login ✅
```

### Step 4: Register as Customer
```
12. Click: "Sign Up" tab
13. Select: "I want to Buy" (Customer role)
14. Enter:
    Email: yourtest@test.com
    Password: Test123!
    Full Name: Test User
    Phone: +911234567890
15. Click: "Create Account"
16. Result: Registered and redirected to dashboard ✅
```

### Step 5: Go Back and Unlock Contact
```
17. Go to: /search
18. Click: Same property "View Details"
19. Click: "🔓 Unlock Contact (FREE for Testing)"
20. Wait: 1 second
21. See: Full phone number displayed! ✅
22. See: "+919876543210" (promoter's phone)
23. See: "Call Now" and "Schedule Visit" buttons enabled
```

### Step 6: Save the Property
```
24. Click: Heart icon (❤️)
25. Result: Heart fills, property saved ✅
26. Go to: /customer/dashboard
27. See: Saved property in your list
```

**SUCCESS!** ✅ Complete customer workflow tested!

---

## 🧪 Test Flow 2: Promoter Submitting Property (10 min)

### Step 1: Login as Promoter
```
1. Logout (if needed)
2. Go to: /login
3. Enter:
   Email: promoter@test.com
   Password: Promoter123!
4. Click: "Sign In"
5. Result: Logged in, see promoter dashboard ✅
```

### Step 2: Submit New Property
```
6. Click: "Post New Property" or go to /promoter/post-new-property
7. Fill Step 1 (Basic Details):
   - Property Type: Apartment
   - Total Price: 5000000 (₹50 lakh)
   - Area: 1000 sq.ft
   - Price Type: Negotiable
8. Click: "Next"
```

### Step 3: Fill All 8 Steps
```
9. Step 2 (Location):
   - City: Delhi
   - Locality: Dwarka
   - Address: Sector 10
10. Click: "Next"

11. Step 3 (Property Details):
    - Bedrooms: 2
    - Bathrooms: 2
    - Furnishing: Semi-Furnished
    - Description: "Beautiful 2BHK in Dwarka"
12. Click: "Next"

13. Step 4 (Amenities):
    - Select: Gym, Parking, Security
    - Amenities Price: 50000
14. Click: "Next"

15. Step 5 (Photos):
    - Upload: Any images (or skip - mock URLs will be used)
16. Click: "Next"

17. Step 6 (Availability):
    - Coming soon, just click "Next"

18. Step 7 (Agreement):
    - Check: "I agree to 2% commission"
19. Click: "Next"

20. Step 8 (Review):
    - Review all info
21. Click: "Submit Listing for Review"
```

### Step 4: Verify Submission
```
22. Wait: 2 seconds
23. Result: Redirected to /promoter/listings?success=true
24. See: Your property listed with status "PENDING" ✅
25. Note: Property ID (you'll need it for admin approval)
```

### Step 5: Verify NOT in Public Search
```
26. Logout
27. Go to: /search
28. Look for: Your new property
29. Result: NOT visible (correct - needs admin approval!) ✅
```

**SUCCESS!** ✅ Promoter workflow tested!

---

## 🧪 Test Flow 3: Admin Approving Property (3 min)

### Step 1: Login as Admin
```
1. Go to: /login
2. Enter:
   Email: admin@test.com
   Password: Admin123!
3. Click: "Sign In"
4. Result: See admin dashboard ✅
```

### Step 2: View Pending Properties
```
5. On dashboard, see section: "Pending Listings"
6. Find: The property you just submitted
7. Status: "PENDING"
8. See: Property details (price, location, etc.)
```

### Step 3: Approve Property
```
9. Click: "Approve" button on your property
10. Wait: 1 second
11. Result: Status changes to "LIVE" ✅
12. See: Green checkmark or "LIVE" badge
```

### Step 4: Verify in Public Search
```
13. Logout
14. Go to: /search
15. Look for: Your property
16. Result: NOW VISIBLE! ✅
17. Click: "View Details"
18. See: Full property page loads perfectly
```

**SUCCESS!** ✅ Admin approval workflow tested!

---

## 🎯 Quick Verification Checklist

After testing all 3 flows, verify:

### Customer Features:
- [ ] Can browse 15 properties
- [ ] All filters work (city, type, price, bedrooms)
- [ ] Can register as customer
- [ ] Can save properties
- [ ] Can unlock contact (FREE offline)
- [ ] Sees full phone number after unlock
- [ ] Saved properties show in dashboard

### Promoter Features:
- [ ] Can login as promoter
- [ ] Can submit new property (8 steps)
- [ ] Property shows as PENDING
- [ ] Property NOT in public search (before approval)
- [ ] Can view own listings in dashboard

### Admin Features:
- [ ] Can login as admin
- [ ] Can see pending properties
- [ ] Can approve properties
- [ ] Approved properties appear in search

### Property Detail Page:
- [ ] Loads without errors
- [ ] Shows all property info
- [ ] Image carousel works
- [ ] Save button works
- [ ] Unlock button works (FREE)
- [ ] Share button works

---

## 🐛 If Something Doesn't Work

### Property Detail Page Error?
- Check: Server logs for errors
- Verify: Property ID is valid
- Try: Another property from search

### Can't Login?
- Verify: Email/password correct
- Check: Database has user accounts (run `npx prisma db seed`)
- Try: Register new account

### Contact Unlock Not Working?
- Check: You're logged in
- Verify: `NEXT_PUBLIC_USE_OFFLINE=true` in `.env.local`
- See: Console for errors

### Property Not Appearing After Approval?
- Verify: Status is "LIVE" (not "PENDING")
- Check: Admin dashboard shows approved
- Try: Refresh /search page

---

## 📊 Test Credentials Quick Reference

```
Customer: customer@test.com / Customer123!
Promoter: promoter@test.com / Promoter123!
Admin: admin@test.com / Admin123!
```

---

## ✅ Expected Results

After completing all 3 test flows:

- **Properties in search:** 16 (15 seeded + 1 you submitted)
- **Unlocked contacts:** 1+ (the ones you unlocked)
- **Saved properties:** 1+ (the ones you saved)
- **Pending properties:** 0 (you approved the one you submitted)

---

## 🎉 Success Indicators

You know everything is working when:

1. ✅ You can unlock contact and see full phone number (FREE)
2. ✅ You can save properties and see them in dashboard
3. ✅ You can submit property → Admin approves → Appears in search
4. ✅ No errors in console
5. ✅ All pages load quickly
6. ✅ Filters and sorting work

---

## 🚀 What's Next?

After verifying everything works:

### Option A: Continue Testing
- Test edge cases
- Try different filter combinations
- Test with multiple users
- Use AI browser testing

### Option B: Fix Remaining Issues
- See: `COMPREHENSIVE_CODEBASE_ANALYSIS.md`
- 6 critical issues in payment/API routes
- Type safety improvements
- Error handling additions

### Option C: Add Features
- Appointment scheduling
- Email notifications
- Advanced search
- Property comparisons

---

**Ready?** Start with Test Flow 1 (Customer) - it's the quickest! 🎯

**Server:** http://localhost:3000
**Time needed:** 20 minutes for all 3 flows
**Difficulty:** Easy (just follow the steps)

**GO!** 🚀
