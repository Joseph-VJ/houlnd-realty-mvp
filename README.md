# 🏠 Houlnd Realty - Real Estate Marketplace MVP

A modern real estate marketplace platform where buyers can browse and unlock seller contacts 100% FREE.

**Key Innovation:** FREE contact unlock for buyers → Maximum leads for sellers → Revenue from premium seller services.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
USE_OFFLINE=true                    # Enable offline mode (SQLite)
NEXT_PUBLIC_USE_OFFLINE=true
DATABASE_URL="file:./dev.db"        # SQLite database
JWT_SECRET=your-secret-key-here
```

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Credentials

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Customer** | customer@test.com | Customer123! |
| **Promoter** | promoter@test.com | Promoter123! |
| **Admin** | admin@test.com | Admin123! |

---

## 📚 Complete Documentation

**All documentation is in the [docs/](docs/) folder.**

### Quick Links:

#### New to the Project?
- 📖 [Project Overview](docs/PROJECT_OVERVIEW.md) - Complete project documentation
- ⚡ [Quick Reference](docs/QUICK_REFERENCE.md) - Credentials and commands

#### Want to Test?
- 🧪 [Testing Guide](docs/testing/START_TESTING.md) - Step-by-step testing workflows

#### Business Model?
- 💰 [Business Model](docs/business/BUSINESS_MODEL.md) - Revenue strategy
- 🎉 [FREE for Buyers](docs/business/FREE_FOR_BUYERS.md) - Lead generation model

#### Technical Details?
- 🔧 [Changes Summary](docs/technical/CHANGES_SUMMARY.md) - All changes made
- ⚙️ [Offline Mode](docs/technical/OFFLINE_MODE_COMPLETE.md) - Implementation details

**📁 [Browse All Documentation](docs/README.md)**

---

## 💡 Key Features

### For Buyers (100% FREE):
- ✅ Browse all properties
- ✅ Advanced search and filters
- ✅ Save favorite properties
- ✅ **Unlock seller contacts (FREE)**
- ✅ Call sellers directly
- ✅ Schedule property visits

### For Sellers:
- ✅ Submit property listings
- ✅ **Edit existing listings**
- ✅ Manage property portfolio
- ✅ Admin quality control
- ✅ Get maximum leads (FREE unlock for buyers)
- 💰 Future: Premium listings (₹2,999/month)
- 💰 2% commission on successful sales

### For Admins:
- ✅ Review pending properties
- ✅ Approve/reject listings
- ✅ **Dashboard with real-time statistics**
- ✅ User management
- ✅ Quality control system

---

## 🏗️ Tech Stack

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions, Prisma ORM
- **Database:** SQLite (offline), Supabase (online)
- **Authentication:** JWT (offline), Supabase Auth (online)
- **Deployment:** Vercel-ready

---

## 🎯 Dual-Mode Architecture

This application supports **both offline and online modes**:

### Offline Mode (Current Setup)
- **Database:** SQLite (`dev.db`)
- **Auth:** JWT tokens with cookies
- **Storage:** Mock image URLs
- **Purpose:** Local testing without external dependencies

### Online Mode (Production)
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Authentication
- **Storage:** Supabase Storage
- **Purpose:** Production deployment

**Switch modes:** Change `USE_OFFLINE` in `.env.local`

---

## 📋 Project Structure

```
houlnd-realty-mvp/
├── src/
│   ├── app/
│   │   ├── actions/          # Server actions (dual-mode)
│   │   │   ├── auth.ts
│   │   │   ├── contact.ts    # FREE unlock
│   │   │   ├── savedProperties.ts
│   │   │   └── createListing.ts
│   │   ├── property/[id]/    # Property details
│   │   ├── search/           # Search page
│   │   └── api/              # API routes
│   ├── components/           # React components
│   ├── hooks/                # Custom hooks
│   └── lib/                  # Utilities
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── docs/                     # 📚 Complete documentation
│   ├── README.md
│   ├── business/
│   ├── technical/
│   └── testing/
└── README.md                 # This file
```

---

## 🔧 Development Commands

### Database:
```bash
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema to database
npx prisma db seed        # Seed test data
npx prisma studio         # Open database GUI
```

### Development:
```bash
npm run dev               # Start dev server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
```

---

## 🧪 Testing Workflows

### 1. Customer Workflow (5 min)
1. Login as customer@test.com
2. Browse properties at /search
3. View property details
4. Save property (heart icon)
5. Unlock contact (FREE!)
6. See full phone number

### 2. Promoter Workflow (10 min)
1. Login as promoter@test.com
2. Submit new property (8 steps)
3. Check status (PENDING)
4. Verify NOT in public search

### 3. Admin Workflow (3 min)
1. Login as admin@test.com
2. View pending properties
3. Approve property
4. Verify appears in search

**📖 [Complete Testing Guide](docs/testing/START_TESTING.md)**

---

## 💰 Business Model

### FREE for Buyers:
- No charges to browse properties
- No charges to unlock contacts
- No subscriptions or hidden fees
- **Total Cost:** ₹0

### Revenue from Sellers:
- 2% commission on successful sales
- Future: Premium listings (₹2,999/month)
- Future: Analytics dashboard
- Future: Marketing packages

### Why This Works:
1. FREE for buyers → More buyers use platform
2. More buyers → More contact unlocks
3. More unlocks → More leads for sellers
4. More leads → Sellers pay premium prices
5. **Result:** 6x more leads than competitors charging ₹99

**📖 [Complete Business Model](docs/business/BUSINESS_MODEL.md)**

---

## 🎯 Competitive Advantage

| Platform | Buyer Cost | Our Advantage |
|----------|-----------|---------------|
| MagicBricks | ₹99-299 | ✅ We're FREE |
| 99acres | ₹149 | ✅ We're FREE |
| Housing.com | ₹99 | ✅ We're FREE |
| NoBroker | ₹999 plan | ✅ We're FREE |
| **Houlnd** | **FREE** | ✅ **Only FREE platform** |

---

## 📊 Current Status

### ✅ Complete:
- Property browsing and search
- User authentication (dual-mode)
- Property submission workflow
- **Property editing with full 8-step form**
- Admin approval system
- **Admin dashboard with Prisma statistics**
- **FREE contact unlock (both modes)**
- Save/unsave properties
- Complete offline mode support
- Base64 image storage for offline mode

### 🔄 Future Enhancements:
- Seller analytics dashboard
- Premium listing features
- Email notifications
- Enhanced appointment scheduling
- Mobile app
- Image optimization and thumbnails

---

## 🐛 Recent Updates

**December 30, 2025:**
- ✅ Added complete property editing functionality
- ✅ Migrated admin dashboard from Supabase to Prisma
- ✅ Fixed image storage (base64 in offline mode)
- ✅ Created Prisma client singleton
- ✅ Fixed Next.js 15 async params handling
- ✅ Updated database queries to use correct status values

**December 26, 2025:**
- ✅ Fixed authentication cookie mismatch
- ✅ Updated all server actions to use correct cookie name
- ✅ Organized documentation into folders
- ✅ Login now works correctly in offline mode

**📖 [Complete Session Log](docs/SESSION_DEC_30_EDIT_AND_DASHBOARD.md)**

---

## 🤝 Contributing

1. Read [Project Overview](docs/PROJECT_OVERVIEW.md)
2. Check [Technical Docs](docs/technical/)
3. Follow existing code patterns
4. Test in both offline and online modes

---

## 📝 Learn More

### About Next.js:
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

### About This Project:
- [Complete Documentation](docs/README.md)
- [Business Model](docs/business/BUSINESS_MODEL.md)
- [Testing Guide](docs/testing/START_TESTING.md)

---

## 🚀 Deployment

### Vercel (Recommended):
1. Set environment variables (Supabase credentials)
2. Set `USE_OFFLINE=false`
3. Deploy to Vercel
4. Run migrations

**📖 [Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)**

---

## 📞 Support

**Questions?** Check the [docs/](docs/) folder first!

- 📖 [Project Overview](docs/PROJECT_OVERVIEW.md)
- ⚡ [Quick Reference](docs/QUICK_REFERENCE.md)
- 🧪 [Testing Guide](docs/testing/START_TESTING.md)

---

## 📄 License

This is a proprietary MVP project.

---

**Built with ❤️ using Next.js 16**

**Last Updated:** December 30, 2025
