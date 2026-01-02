# Quick Start Guide

Get your Houlnd Realty app running locally or deploy to production.

## Local Development (SQLite)

For local testing with SQLite database:

```bash
# 1. Install dependencies
npm install

# 2. Use local environment
cp .env.local.example .env.local
# Edit .env.local if needed

# 3. Set up database
npx prisma migrate dev --name init
npx prisma db seed  # Optional: add test data

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Local Development (PostgreSQL)

For local testing with Supabase PostgreSQL:

```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase project (see MIGRATION_GUIDE.md)

# 3. Configure environment
cp .env.production.example .env.production.local
# Edit with your Supabase credentials

# 4. Set up database
npx prisma db push

# 5. Start development server
npm run dev
```

---

## Production Deployment (Vercel)

Deploy to Vercel with PostgreSQL:

### One-Time Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Save database password

2. **Get Connection Strings**
   - Supabase Dashboard → Settings → Database
   - Copy "Connection String" (URI - Session mode) for DATABASE_URL
   - Copy "Connection String" (Direct connection) for DIRECT_URL

3. **Set Up Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

4. **Add Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.production.example`
   - See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for full list

5. **Push Database Schema**
   ```bash
   npx prisma db push
   ```

### Deploy

```bash
# Deploy to production
vercel --prod

# Or push to GitHub (if connected)
git push origin main
```

---

## Environment Modes

Your app supports two modes:

### Offline Mode (SQLite)
- Uses local SQLite database
- Best for development and testing
- No internet required for database
- Data stored in `dev.db` file

**Activate with:**
```env
USE_OFFLINE=true
NEXT_PUBLIC_USE_OFFLINE=true
DATABASE_URL="file:./dev.db"
```

### Online Mode (PostgreSQL)
- Uses Supabase PostgreSQL
- Required for Vercel deployment
- Data persists across deployments
- Supports concurrent users

**Activate with:**
```env
USE_OFFLINE=false
NEXT_PUBLIC_USE_OFFLINE=false
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

---

## Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create new migration
npx prisma db push             # Push schema (no migration)
npx prisma generate            # Generate Prisma Client

# Deployment
vercel                         # Deploy to preview
vercel --prod                  # Deploy to production
vercel logs --prod             # View production logs
```

---

## Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Verify Supabase project is active
- Test connection: `npx prisma db pull`

### "Prisma Client Not Found"
```bash
npx prisma generate
```

### "Port 3000 already in use"
```bash
# Kill the process (Windows)
taskkill /F /IM node.exe

# Or use different port
PORT=3001 npm run dev
```

### Reset Database
```bash
# SQLite (local)
rm -f dev.db
npx prisma migrate dev --name init

# PostgreSQL (Supabase)
npx prisma migrate reset
```

---

## Next Steps

1. ✅ Get app running locally
2. 📖 Read [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for full migration details
3. ✅ Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for production
4. 🚀 Deploy to Vercel

---

## Need Help?

- **Migration Issues**: See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **Deployment Issues**: See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Prisma Issues**: https://www.prisma.io/docs
- **Vercel Issues**: https://vercel.com/docs
- **Supabase Issues**: https://supabase.com/docs
