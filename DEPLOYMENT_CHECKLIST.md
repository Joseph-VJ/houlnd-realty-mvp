# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel with PostgreSQL.

## Pre-Deployment

### Database Setup
- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Connection strings copied (DATABASE_URL and DIRECT_URL)
- [ ] Supabase anon key copied

### Local Testing
- [ ] Prisma schema updated to `postgresql`
- [ ] Old migrations removed (`rm -rf prisma/migrations`)
- [ ] New migration created (`npx prisma migrate dev --name init`)
- [ ] Database schema verified in Prisma Studio
- [ ] App tested locally with PostgreSQL
- [ ] All features work (auth, listings, payments, appointments)

### Code Changes
- [x] [prisma/schema.prisma](f:\opus-4.5\houlnd test\houlnd-realty-mvp\prisma\schema.prisma) updated to `postgresql`
- [x] [package.json](f:\opus-4.5\houlnd test\houlnd-realty-mvp\package.json) has `postinstall: "prisma generate"`
- [ ] All changes committed to Git
- [ ] Changes pushed to GitHub/GitLab

### Environment Variables Prepared
- [ ] Production JWT_SECRET generated (`openssl rand -base64 32`)
- [ ] Razorpay production keys ready
- [ ] Production app URL determined
- [ ] All values documented in `.env.production.example`

## Vercel Setup

### Project Configuration
- [ ] Vercel account created/logged in
- [ ] New project created or existing project linked
- [ ] GitHub repository connected (if using Git integration)
- [ ] Build & Development Settings correct:
  - Framework Preset: `Next.js`
  - Build Command: `next build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### Environment Variables Added
Add these in Vercel Dashboard → Settings → Environment Variables:

#### Database (Production & Preview)
- [ ] `DATABASE_URL` - Supabase pooled connection string
- [ ] `DIRECT_URL` - Supabase direct connection string

#### Supabase (All Environments)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### App Configuration
- [ ] `USE_OFFLINE=false` (Production & Preview)
- [ ] `NEXT_PUBLIC_USE_OFFLINE=false` (All Environments)
- [ ] `NEXT_PUBLIC_APP_URL` (Production: your-app.vercel.app)

#### Security (Production & Preview)
- [ ] `JWT_SECRET` - Strong production secret

#### Payments (Production & Preview)
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `UNLOCK_FEE_INR=99`

### Database Migration
- [ ] Schema pushed to Supabase (`npx prisma db push`)
- [ ] Tables verified in Supabase Dashboard
- [ ] Test data added (optional)

## Deployment

### Initial Deploy
- [ ] Deploy triggered (via Git push or Vercel CLI)
- [ ] Build logs checked for errors
- [ ] Build completed successfully
- [ ] No Prisma generation errors
- [ ] No database connection errors

### Post-Deploy Verification
- [ ] Production URL accessible
- [ ] Homepage loads without errors
- [ ] No console errors in browser

## Testing in Production

### Authentication
- [ ] User registration works
- [ ] Email/phone validation works
- [ ] Login successful
- [ ] Session persists across page reloads
- [ ] Logout works

### Property Listings
- [ ] View listings page
- [ ] Search and filter works
- [ ] Property details load
- [ ] Image uploads work
- [ ] Create new listing (as promoter)
- [ ] Edit listing works
- [ ] Delete listing works

### User Features
- [ ] Save property works
- [ ] Saved properties list displays
- [ ] Unlock property (test payment)
- [ ] Unlocked properties accessible
- [ ] Schedule appointment works
- [ ] View appointments

### Payments
- [ ] Razorpay checkout opens
- [ ] Test payment succeeds (if using test keys)
- [ ] Payment status updates correctly
- [ ] Unlock granted after payment

### Admin Features (if applicable)
- [ ] Admin dashboard accessible
- [ ] Approve/reject listings
- [ ] View all users
- [ ] Analytics display

### Data Persistence
- [ ] Create test data
- [ ] Trigger redeployment
- [ ] Verify test data still exists after redeploy

## Monitoring

### Supabase Dashboard
- [ ] Tables populated with data
- [ ] No error logs in Database → Logs
- [ ] Connection pool usage normal
- [ ] Query performance acceptable

### Vercel Dashboard
- [ ] No runtime errors in Functions
- [ ] Response times acceptable
- [ ] Analytics enabled (optional)
- [ ] Error tracking configured (optional)

## Optional Enhancements

### Performance
- [ ] Database indexes added for common queries
- [ ] Connection pooling optimized
- [ ] Image optimization verified
- [ ] Enable Vercel Analytics

### Security
- [ ] Environment variable review
- [ ] No secrets in client-side code
- [ ] CORS configured properly
- [ ] Rate limiting on sensitive endpoints
- [ ] Vercel WAF enabled (paid plans)

### Monitoring
- [ ] Sentry or error tracking integrated
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Database backup schedule verified
- [ ] Alert notifications configured

### Development Workflow
- [ ] Preview deployments working
- [ ] Staging environment set up (optional)
- [ ] CI/CD pipeline configured (optional)

## Rollback Plan

If something goes wrong:

- [ ] Rollback plan documented
- [ ] Previous deployment can be instantly restored (Vercel → Deployments → Promote)
- [ ] Database backup available
- [ ] Team notified of issues

## Success Criteria

All of the following should be true:

- ✅ App is live on Vercel at production URL
- ✅ All features work as expected
- ✅ Data persists across deployments
- ✅ No critical errors in logs
- ✅ Authentication flow complete
- ✅ Payments processing correctly
- ✅ Performance is acceptable
- ✅ Team can access and use the app

---

## Quick Commands Reference

```bash
# Local testing with PostgreSQL
npx prisma migrate dev --name migration_name
npx prisma studio

# Push schema without migration
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Deploy with Vercel CLI
vercel --prod

# View production logs
vercel logs --prod

# Pull environment variables
vercel env pull .env.production.local
```

---

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Prisma Slack**: https://slack.prisma.io

---

**Last Updated**: {DATE}
**Deployed By**: {YOUR_NAME}
**Production URL**: {YOUR_VERCEL_URL}
