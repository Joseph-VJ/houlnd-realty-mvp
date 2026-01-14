# 🎯 AI SKILLS FOR HOULND REALTY MVP

**Last Updated:** January 14, 2026  
**Purpose:** Define AI capabilities and rules for project development

---

## 📋 SKILL 1: Technical & Development Guardian

### 🎯 Purpose
Monitor and improve technical quality by checking security, performance, and best practices

### ✅ AI Responsibilities
- 🔍 **Review Code Changes** for security vulnerabilities
- ⚡ **Check Performance** issues and bottlenecks
- 🏗️ **Validate Architecture** against Next.js + Prisma + Supabase best practices
- 🔄 **Ensure Offline-First** compatibility (dual-mode architecture)
- 📊 **Check TypeScript** strict mode compliance
- 🛡️ **Validate JWT** authentication security

### ⚠️ AI Workflow (MUST FOLLOW)
1. **DETECT** issue in code
2. **REPORT** the issue with details:
   - 📍 File location & line number
   - 🐛 What's wrong
   - 💥 Potential impact/risk
3. **SUGGEST** fix with code example
4. **ASK PERMISSION** before implementing
5. **WAIT** for user approval
6. **IMPLEMENT** only after approval

### � Reference Documentation
- 📄 `docs/technical/SUPABASE_SETUP.md` - Database setup & architecture
- 📄 `docs/technical/OFFLINE_MODE.md` - Offline-first implementation
- 📄 `docs/technical/COMPREHENSIVE_CODEBASE_ANALYSIS.md` - Code structure
- 📄 `prisma/schema.prisma` - Database schema
- 📄 `README.md` - Project overview & setup

### �🚫 Never Do Without Permission
- ❌ Change architecture patterns
- ❌ Switch libraries/frameworks
- ❌ Modify database schema
- ❌ Change authentication flow
- ❌ Update environment variables

### ✅ Validation Checklist
- [ ] Code follows Next.js 16.1 best practices?
- [ ] Works in BOTH offline (SQLite) and online (Supabase) modes?
- [ ] No SQL injection vulnerabilities?
- [ ] No exposed secrets/API keys?
- [ ] Server actions used for data operations?
- [ ] TypeScript types properly defined?
- [ ] No performance bottlenecks (N+1 queries, etc.)?
- [ ] Error handling implemented?
- [ ] JWT tokens properly validated?

---

## 🎨 SKILL 2: UX Simplicity Guardian

### 🎯 Purpose
Ensure UI/UX remains simple and user-friendly for non-technical users

### ✅ AI Responsibilities
- 👥 **Keep UI Simple** - No complex, technical, or confusing designs
- 📱 **Mobile-First** - All features must work perfectly on mobile
- 🎯 **User-Friendly** - Anyone should understand without instructions
- 🚀 **Prevent Complexity** - Stop overly technical UI from being added
- 💬 **Clear Language** - No jargon, simple words only

### 🚫 STRICT RULES (NEVER VIOLATE)
1. **❌ NEVER change existing design without explicit permission**
2. **⚠️ ALWAYS ask before** modifying:
   - Layout/structure
   - Color schemes
   - Navigation flow
   - Button placements
   - Form designs
   - Component library choices

### ✅ What AI Can Do
- ✅ Suggest simpler alternatives to complex UI
- ✅ Point out confusing user flows
- ✅ Recommend mobile-friendly improvements
- ✅ Alert if design might push users away
- ✅ Suggest better wording/labels

### ✅ Validation Checklist
- [ ] Is this simple enough for a non-technical user?
- [ ] Works on mobile (320px width)?
- [ ] No technical jargon in UI text?
- [ ] Clear call-to-action buttons?
- [ ] Forms are easy to fill?
- [ ] Error messages are helpful, not technical?
- [ ] Loading states are clear?
- [ ] Success/failure feedback is obvious?

### 📱 Mobile-First Standards
- ✅ Touch-friendly buttons (min 44x44px)
- ✅ Readable text (min 16px font size)
- ✅ No tiny links or buttons
- ✅ Forms work with mobile keyboards
- ✅ Images load fast on 3G/4G
- ✅ No horizontal scrolling

### 📖 Reference Documentation
- 📄 `docs/business/FREE_FOR_BUYERS.md` - UX philosophy & buyer experience
- 📄 `docs/testing/AI_TESTING_RESULTS.md` - User testing feedback
- 📄 `docs/testing/QUICK_TEST_GUIDE.md` - Testing procedures
- 📄 `src/components/` - UI component library

---

## 📚 SKILL 3: Feature Alignment Validator

### 🎯 Purpose
Ensure all features align with documented business requirements

### 📖 Reference Documents (MUST CHECK ALL)

**Core Business Docs (6 Required):**
1. **BRD** - `docs/business/brd.md` - Business Requirements
2. **FRD** - `docs/business/FRD.md` - Functional Requirements
3. **MRD** - `docs/business/mrd.md` - Market Requirements
4. **PRD** - `docs/business/PRD.md` - Product Requirements
5. **SRS** - `docs/business/srs.md` - Software Specifications
6. **BUSINESS_MODEL** - `docs/business/BUSINESS_MODEL.md` - Revenue model

**Supporting Documentation:**
- 📄 `docs/business/FREE_FOR_BUYERS.md` - Free buyer philosophy
- 📄 `docs/technical/SELLER_LISTING_FLOW_ANALYSIS.md` - Feature flows
- 📄 `docs/DOCUMENTATION_INDEX.md` - Full doc inventory
- 📄 `docs/PROJECT_OVERVIEW.md` - High-level summary

### ✅ AI Workflow for New Features
1. **📝 Feature Request Received**
2. **🔍 Search ALL 6 docs** for matching requirement
3. **Decision Tree:**
   
   ```
   Feature in docs?
   ├─ ✅ YES → Proceed with implementation
   └─ ❌ NO → Follow "Undocumented Feature Protocol"
   ```

### ⚠️ Undocumented Feature Protocol
When feature is NOT in any of the 6 docs:

1. **🛑 PAUSE implementation**
2. **📋 INFORM user:**
   - "This feature is not documented in BRD/FRD/MRD/PRD/SRS/BUSINESS_MODEL"
   - "Searched: [list what you searched for]"
   - "Results: Not found"
3. **💡 SUGGEST next steps:**
   - Option A: Add feature to appropriate doc first (recommend which doc)
   - Option B: Skip this feature (explain why it might not fit)
   - Option C: Proceed anyway (explain risks)
4. **⏸️ WAIT for user decision**
5. **✅ Proceed** only after user confirms

### ✅ Validation Checklist
- [ ] Feature exists in at least ONE of the 6 docs?
- [ ] Implementation matches documented requirements?
- [ ] No conflicting requirements across docs?
- [ ] User stories/use cases covered?
- [ ] Business logic aligns with BUSINESS_MODEL?
- [ ] Technical specs match SRS?
- [ ] Functional behavior matches FRD?

### 🎯 Core Business Logic (Always Validate Against)
From BUSINESS_MODEL.md:
- ✅ **FREE for Buyers** - All customer features must be free
- ✅ **Paid for Sellers** - Revenue comes from promoters/sellers only
- ✅ **Offline-First** - Must work without internet
- ✅ **Dual-Mode** - Support both SQLite (offline) and Supabase (online)
- ✅ **Lead Generation** - Maximize seller leads, not buyer friction

### 🚨 Red Flags (Alert User Immediately)
- 🚫 Feature charges buyers money
- 🚫 Feature breaks offline mode
- 🚫 Feature conflicts with "free for buyers" model
- 🚫 Feature requires always-online connection
- 🚫 Feature not in any of the 6 reference docs

---

## 🎓 How to Use These Skills

### For Developers:
1. Share this file with AI before starting work
2. AI will automatically apply these rules
3. AI will ask permission before major changes
4. Review AI suggestions before approving

### For AI Assistants:
1. **Load this file** at start of each session
2. **Apply all 3 skills** to every task
3. **Follow workflows** exactly as documented
4. **Ask permission** when rules require it
5. **Validate** against checklists before completing tasks

---

## 📊 Skill Priority Order

When rules conflict, follow this priority:

1. **🔴 SECURITY** (Skill 1) - Security issues override everything
2. **🟡 BUSINESS LOGIC** (Skill 3) - Feature must align with business docs
3. **🟢 UX SIMPLICITY** (Skill 2) - Keep it simple for users

**Example:**
- Security vulnerability > Feature request > Design preference
- Business requirement > UX preference
- User safety > Everything else

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 14, 2026 | Initial skills created: Technical Guardian, UX Simplicity, Feature Validator |

---

## 🎯 Next Skills (Coming Soon)

_Space reserved for additional skills to be added_

---

## 📚 Master Documentation Index

### Business Documentation (`docs/business/`)
- `AI_SKILLS.md` - This file (AI capabilities & rules)
- `BUSINESS_MODEL.md` - Revenue model & business logic
- `FREE_FOR_BUYERS.md` - Free buyer philosophy
- `brd.md` - Business Requirements Document
- `FRD.md` - Functional Requirements Document
- `mrd.md` - Market Requirements Document
- `PRD.md` - Product Requirements Document
- `srs.md` - Software Requirements Specification

### Technical Documentation (`docs/technical/`)
- `COMPREHENSIVE_CODEBASE_ANALYSIS.md` - Code architecture
- `SUPABASE_SETUP.md` - Database & Supabase config
- `OFFLINE_MODE.md` - Offline-first implementation
- `OFFLINE_MODE_COMPLETE.md` - Offline mode status
- `SELLER_LISTING_FLOW_ANALYSIS.md` - Feature analysis
- `ALL_5_PHASES_COMPLETE.md` - Development phases
- `ALL_FIXES_IMPLEMENTED.md` - Bug fix history
- `IMPLEMENTATION_VERIFICATION.md` - Feature verification

### Testing Documentation (`docs/testing/`)
- `AI_TESTING_RESULTS.md` - Test results
- `QUICK_TEST_GUIDE.md` - Testing procedures
- `START_TESTING.md` - Test setup instructions
- `TEST_REPORT_COMPREHENSIVE.md` - Full test reports

### Project Root
- `README.md` - Project overview & quick start
- `CLAUDE.md` - AI interaction guidelines
- `package.json` - Dependencies & scripts
- `prisma/schema.prisma` - Database schema
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration

---

**END OF DOCUMENT**
