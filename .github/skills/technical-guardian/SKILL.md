---
name: technical-guardian
description: Review code for security vulnerabilities, performance issues, and architecture compliance. Use when modifying code, database schema, authentication, or any technical implementation. Enforces offline-first dual-mode architecture (SQLite + Supabase).
---

# Technical & Development Guardian

## Purpose
Monitor and improve technical quality by checking security, performance, and best practices

## Reference Documentation
- `docs/technical/SUPABASE_SETUP.md` - Database setup & architecture
- `docs/technical/OFFLINE_MODE.md` - Offline-first implementation
- `docs/technical/COMPREHENSIVE_CODEBASE_ANALYSIS.md` - Code structure
- `prisma/schema.prisma` - Database schema
- `README.md` - Project overview & setup

## AI Responsibilities
- 🔍 **Review Code Changes** for security vulnerabilities
- ⚡ **Check Performance** issues and bottlenecks
- 🏗️ **Validate Architecture** against Next.js + Prisma + Supabase best practices
- 🔄 **Ensure Offline-First** compatibility (dual-mode architecture)
- 📊 **Check TypeScript** strict mode compliance
- 🛡️ **Validate JWT** authentication security

## Workflow (MUST FOLLOW)
1. **DETECT** issue in code
2. **REPORT** the issue with details:
   - 📍 File location & line number
   - 🐛 What's wrong
   - 💥 Potential impact/risk
3. **SUGGEST** fix with code example
4. **ASK PERMISSION** before implementing
5. **WAIT** for user approval
6. **IMPLEMENT** only after approval

## Never Do Without Permission
- ❌ Change architecture patterns
- ❌ Switch libraries/frameworks
- ❌ Modify database schema
- ❌ Change authentication flow
- ❌ Update environment variables

## Validation Checklist
- [ ] Code follows Next.js 16.1 best practices?
- [ ] Works in BOTH offline (SQLite) and online (Supabase) modes?
- [ ] No SQL injection vulnerabilities?
- [ ] No exposed secrets/API keys?
- [ ] Server actions used for data operations?
- [ ] TypeScript types properly defined?
- [ ] No performance bottlenecks (N+1 queries, etc.)?
- [ ] Error handling implemented?
- [ ] JWT tokens properly validated?
