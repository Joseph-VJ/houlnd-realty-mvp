#!/usr/bin/env node

/**
 * Generate environment variables for Vercel deployment
 * 
 * Usage: node scripts/setup/generate-env.js
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
console.log('  3. Settings → Database → Connection string\n');

console.log('=' .repeat(60));
console.log('\n✅ Summary of ALL Required Variables:\n');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('DATABASE_URL=<your-connection-string>');
console.log('DIRECT_URL=<your-connection-string>');
console.log('USE_OFFLINE=false');
console.log('NEXT_PUBLIC_USE_OFFLINE=false');
console.log('NEXT_PUBLIC_APP_URL=https://your-app.vercel.app');
console.log('\n');
