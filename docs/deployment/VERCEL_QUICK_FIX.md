# 🚨 Vercel Quick Fix Guide

**Having deployment issues?** Use these quick fixes.

---

## ⚡ Most Common Issue: Server Action Cache Error

**Error**: "Server Action not found on the server"

### Fix in 10 Seconds
```
Press: Ctrl + Shift + R (Windows/Linux)
Press: Cmd + Shift + R (Mac)
```

**Done!** This hard refreshes your browser and loads the new code.

---

## 🔑 Environment Variables Quick Check

Run this checklist:

```bash
# Required in Vercel Settings → Environment Variables:

✅ JWT_SECRET (32+ characters)
✅ USE_OFFLINE=false
✅ NEXT_PUBLIC_USE_OFFLINE=false
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ DATABASE_URL (Session Pooler - port 6543)
✅ DIRECT_URL (Direct connection - port 5432)
```

**After adding any variable**: Redeploy!

---

## 🗄️ Database Quick Setup

```bash
# 1. Push schema to database
DATABASE_URL="your_connection_string" npx prisma db push

# 2. Seed with test users
DATABASE_URL="your_connection_string" npx prisma db seed

# 3. Verify (opens GUI)
DATABASE_URL="your_connection_string" npx prisma studio
```

---

## 🔄 Force Clean Redeploy

When nothing else works:

1. Vercel → **Deployments**
2. Click **"..."** on latest
3. Click **"Redeploy"**
4. ✅ **DISABLE** "Use existing Build Cache"
5. Wait for build
6. Hard refresh browser (`Ctrl + Shift + R`)

---

## 🧪 Test Accounts

After seeding database:

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@test.com` | `Customer123!` |
| Promoter | `promoter@test.com` | `Promoter123!` |
| Admin | `admin@test.com` | `Admin123!` |

---

## 📞 Connection Strings Format

### For DATABASE_URL (Session Pooler):
```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-region.pooler.supabase.com:6543/postgres
```

### For DIRECT_URL (Direct):
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

**Note**: Different ports! (6543 vs 5432)

---

## 🐛 Debug Commands

```bash
# Check Vercel logs
vercel logs --prod

# Test build locally
npm run build

# Pull environment variables
vercel env pull .env.vercel

# Validate Prisma schema
npx prisma validate

# Test database connection
DATABASE_URL="your_url" npx prisma db pull
```

---

## ✅ Deployment Success Checklist

- [ ] All environment variables added to Vercel
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Database seeded (`npx prisma db seed`)
- [ ] Deployment succeeded (green checkmark)
- [ ] Hard refresh browser (`Ctrl + Shift + R`)
- [ ] Login works with test account
- [ ] No errors in browser console (`F12`)
- [ ] No errors in Vercel Function Logs

---

## 🔒 Security Reminder

If you shared your database password:

1. Supabase → Settings → Database
2. Click **"Reset database password"**
3. Update `DATABASE_URL` and `DIRECT_URL` in Vercel
4. Redeploy

---

**Need more help?** See [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md)

**Project URL**: https://houlnd-realty-mvp.vercel.app
