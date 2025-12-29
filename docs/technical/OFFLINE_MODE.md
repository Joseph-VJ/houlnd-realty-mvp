# Offline Testing Mode

This document explains how to test the application offline using SQLite instead of Supabase.

## Overview

The application supports an **offline testing mode** that uses SQLite database and JWT-based authentication instead of Supabase. This allows you to:
- Test the full application without internet connection
- Develop without Supabase credentials
- Run automated tests faster
- Debug locally without cloud dependencies

**Note:** Offline mode is for testing only. The production application uses Supabase.

## How to Enable Offline Mode

### 1. Set Environment Variable

In `.env.local`, set:
```env
USE_OFFLINE=true
```

The application will automatically:
- Use SQLite database (`dev.db`) instead of Supabase PostgreSQL
- Use JWT-based authentication instead of Supabase Auth
- Store session tokens in HTTP-only cookies

### 2. Database Setup

The SQLite database is already configured and migrated. The database file is:
```
./dev.db
```

If you need to reset the database:
```bash
# Delete the database
rm dev.db

# Run migrations again
npx prisma migrate dev --name init_sqlite
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will run in offline mode at `http://localhost:3000`

## Features in Offline Mode

### ✅ Working Features

- **Authentication**
  - Sign up with email/password
  - Sign in with email/password
  - Sign out
  - Session management with JWT
  - Role-based access (CUSTOMER, PROMOTER, ADMIN)

- **Database**
  - All models (User, Listing, Appointment, etc.)
  - CRUD operations via Prisma
  - Data persistence in SQLite

### ⚠️ Limited Features

The following features require Supabase and won't work in offline mode:

- **OTP/Phone Verification** - Uses Supabase Auth
- **File Storage** - Uses Supabase Storage for images
- **Real-time Updates** - Uses Supabase Realtime
- **Email Sending** - Requires email service provider

## How It Works

### Architecture

```
┌─────────────────────────────────────────────┐
│          Application Layer                   │
├─────────────────────────────────────────────┤
│  ┌─────────────┐      ┌─────────────┐       │
│  │   Online    │      │   Offline   │       │
│  │    Mode     │      │    Mode     │       │
│  └─────────────┘      └─────────────┘       │
│        │                     │               │
│        ▼                     ▼               │
│  ┌─────────────┐      ┌─────────────┐       │
│  │  Supabase   │      │   SQLite    │       │
│  │    Auth     │      │  + JWT      │       │
│  │     +       │      │     +       │       │
│  │ PostgreSQL  │      │   Prisma    │       │
│  └─────────────┘      └─────────────┘       │
└─────────────────────────────────────────────┘
```

### Authentication Flow

**Sign Up:**
1. User submits registration form
2. `signUp` action checks `USE_OFFLINE` flag
3. If offline: Creates user in SQLite with bcrypt password hash
4. Generates JWT token with user info
5. Sets HTTP-only cookie with token
6. Redirects to dashboard

**Sign In:**
1. User submits login form
2. `signIn` action checks `USE_OFFLINE` flag
3. If offline: Queries SQLite for user
4. Verifies password with bcrypt
5. Generates new JWT token
6. Sets HTTP-only cookie
7. Redirects to role-specific dashboard

**Protected Routes:**
1. Middleware intercepts request
2. Reads `offline_token` cookie
3. Verifies JWT signature and expiration
4. Allows/denies access based on token validity

### Data Access

In offline mode, the application uses Prisma Client directly:

```typescript
// Online mode
const { data } = await supabase.from('users').select('*')

// Offline mode
const prisma = new PrismaClient()
const data = await prisma.user.findMany()
```

## Database Schema

The SQLite schema is identical to the Supabase PostgreSQL schema, with these conversions:

| PostgreSQL | SQLite |
|------------|--------|
| `enum Role { CUSTOMER, PROMOTER, ADMIN }` | `String` with validation |
| `Json` type | `String` (JSON serialized) |
| `String[]` array | `String` (JSON serialized array) |

## Environment Variables

Complete `.env.local` for offline mode:

```env
# Offline Testing Mode
USE_OFFLINE=true

# Supabase (ignored in offline mode)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key

# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (change for production)
JWT_SECRET=offline-test-secret-key-change-this-in-production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Razorpay (optional)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
UNLOCK_FEE_INR=99
```

## Switching Back to Online Mode

To switch back to Supabase:

1. Set in `.env.local`:
   ```env
   USE_OFFLINE=false
   ```

2. Add real Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_real_anon_key
   ```

3. Restart the dev server

## Testing Checklist

Use this checklist to test features in offline mode:

- [ ] Sign up as Customer
- [ ] Sign up as Promoter
- [ ] Sign in with created account
- [ ] Sign out
- [ ] Access protected routes (dashboards)
- [ ] Create listing (if storage not needed)
- [ ] Search listings
- [ ] Book appointment
- [ ] View appointments

## Troubleshooting

**Issue:** "Not authenticated" error in offline mode

**Solution:** 
- Check that `USE_OFFLINE=true` in `.env.local`
- Clear cookies and sign in again
- Check that JWT_SECRET is set

---

**Issue:** Database tables not found

**Solution:**
```bash
npx prisma generate
npx prisma migrate dev --name init_sqlite
```

---

**Issue:** Password comparison fails

**Solution:**
- Ensure `bcryptjs` is installed: `npm install bcryptjs`
- Check that passwordHash field exists in User model

---

**Issue:** Token expired

**Solution:**
- Tokens expire after 7 days
- Sign in again to get a new token
- You can modify expiration in `offlineAuth.ts`:
  ```typescript
  .setExpirationTime('30d') // 30 days
  ```

## Development Tips

1. **Seed Test Data:**
   Create a seed script to populate test data:
   ```bash
   npx prisma db seed
   ```

2. **View Database:**
   Use Prisma Studio to view/edit SQLite data:
   ```bash
   npx prisma studio
   ```

3. **Reset Database:**
   Start fresh during development:
   ```bash
   rm dev.db
   npx prisma migrate dev --name init_sqlite
   ```

4. **Debug Mode:**
   Enable Prisma query logging:
   ```typescript
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'],
   })
   ```

## File Structure

Offline mode files:
```
src/
├── lib/
│   └── offlineAuth.ts          # JWT authentication logic
├── app/
│   └── actions/
│       └── auth.ts             # Auth actions (online/offline)
└── middleware.ts               # Request middleware

prisma/
├── schema.prisma               # SQLite schema
└── migrations/
    └── [timestamp]_init_sqlite/
        └── migration.sql       # Initial SQLite migration

dev.db                          # SQLite database file (gitignored)
.env.local                      # Environment config
.env                            # Prisma DATABASE_URL
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **JWT Secret:** Change `JWT_SECRET` to a strong random value
2. **HTTPS Only:** In production, use secure cookies (HTTPS)
3. **Token Expiration:** Adjust token lifetime based on security needs
4. **Password Hashing:** bcrypt rounds set to 10 (secure default)
5. **SQL Injection:** Prisma prevents SQL injection automatically

## Production Deployment

**DO NOT use offline mode in production!**

Offline mode is for local development and testing only. For production:

1. Set `USE_OFFLINE=false`
2. Use Supabase with proper security policies
3. Enable Row Level Security (RLS)
4. Use environment-specific credentials
5. Enable HTTPS with secure cookies

## Contributing

When contributing code that affects authentication or database:

1. Test both online and offline modes
2. Ensure feature parity where applicable
3. Document limitations in offline mode
4. Update this README with changes

---

**Questions?** Check the main [README.md](../README.md) or create an issue.
