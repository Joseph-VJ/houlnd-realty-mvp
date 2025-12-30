#!/usr/bin/env node

/**
 * Generate environment variables for Vercel deployment
 * Run: node scripts/generate-env.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Environment Variables for Vercel\n');
console.log('=' .repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('base64');

console.log('\n📋 REQUIRED ENVIRONMENT VARIABLES:\n');
console.log('Copy these to Vercel Dashboard → Settings → Environment Variables\n');

console.log('1. JWT_SECRET (CRITICAL - Required for build)');
console.log(`   JWT_SECRET=${jwtSecret}`);

console.log('\n2. Offline Mode (Set to false for production)');
console.log('   USE_OFFLINE=false');
console.log('   NEXT_PUBLIC_USE_OFFLINE=false');

console.log('\n3. App URL (Replace with your actual Vercel URL)');
console.log('   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app');

console.log('\n\n📊 DATABASE SETUP REQUIRED:\n');
console.log('Choose ONE of these options:\n');

console.log('Option A - Neon (Recommended, Free)');
console.log('  1. Go to: https://neon.tech');
console.log('  2. Create project and copy connection string');
console.log('  3. Add to Vercel:');
console.log('     DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require');
console.log('     DIRECT_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require\n');

console.log('Option B - Vercel Postgres ($0.50/month)');
console.log('  1. Vercel Dashboard → Storage → Create Database → Postgres');
console.log('  2. Variables automatically added\n');

console.log('Option C - Railway (Free $5 credit)');
console.log('  1. Go to: https://railway.app');
console.log('  2. New Project → Provision PostgreSQL');
console.log('  3. Copy connection string from Connect tab\n');

console.log('Option D - Supabase (Free 500MB)');
console.log('  1. Go to: https://supabase.com');
console.log('  2. Create project');
console.log('  3. Settings → Database → Copy connection strings\n');

console.log('\n\n🎯 OPTIONAL (For Payments):\n');
console.log('   RAZORPAY_KEY_ID=your_razorpay_key');
console.log('   RAZORPAY_KEY_SECRET=your_razorpay_secret');
console.log('   UNLOCK_FEE_INR=99');

console.log('\n\n📝 SUPABASE SPECIFIC (Only if using Supabase):\n');
console.log('   NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_anon_key]');

console.log('\n\n🚀 NEXT STEPS:\n');
console.log('1. Copy JWT_SECRET above to Vercel');
console.log('2. Choose a database option and set up');
console.log('3. Add DATABASE_URL and DIRECT_URL to Vercel');
console.log('4. Push database schema: npx prisma db push');
console.log('5. Redeploy on Vercel');

console.log('\n' + '=' .repeat(60));
console.log('\n✅ All values generated! Copy to Vercel and deploy.\n');

// Also save to a local file for reference
const fs = require('fs');
const envContent = `# Generated on ${new Date().toISOString()}
# DO NOT COMMIT THIS FILE TO GIT
# Add these to Vercel Dashboard → Settings → Environment Variables

# === REQUIRED ===
JWT_SECRET=${jwtSecret}
USE_OFFLINE=false
NEXT_PUBLIC_USE_OFFLINE=false
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# === DATABASE (Choose one option and fill in) ===
# Option A: Neon
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# === OPTIONAL: Supabase (if using Supabase for auth) ===
# NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_key]

# === OPTIONAL: Payments ===
# RAZORPAY_KEY_ID=your_key
# RAZORPAY_KEY_SECRET=your_secret
# UNLOCK_FEE_INR=99
`;

fs.writeFileSync('.env.vercel.template', envContent);
console.log('💾 Saved template to: .env.vercel.template\n');
