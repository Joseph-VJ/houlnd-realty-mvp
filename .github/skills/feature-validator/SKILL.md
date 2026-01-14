---
name: feature-validator
description: Validate all features against 6 core business requirement documents (BRD, FRD, MRD, PRD, SRS, BUSINESS_MODEL). Use when implementing any new feature, user story, or capability. Enforces requirements traceability and alerts on undocumented features.
---

# Feature Alignment Validator

## Purpose
Ensure all features align with documented business requirements

## Reference Documents (MUST CHECK ALL)

### Core Business Docs (6 Required):
1. **BRD** - `docs/business/brd.md` - Business Requirements
2. **FRD** - `docs/business/FRD.md` - Functional Requirements
3. **MRD** - `docs/business/mrd.md` - Market Requirements
4. **PRD** - `docs/business/PRD.md` - Product Requirements
5. **SRS** - `docs/business/srs.md` - Software Specifications
6. **BUSINESS_MODEL** - `docs/business/BUSINESS_MODEL.md` - Revenue model

### Supporting Documentation:
- `docs/business/FREE_FOR_BUYERS.md` - Free buyer philosophy
- `docs/technical/SELLER_LISTING_FLOW_ANALYSIS.md` - Feature flows
- `docs/DOCUMENTATION_INDEX.md` - Full doc inventory
- `docs/PROJECT_OVERVIEW.md` - High-level summary

## AI Workflow for New Features
1. **📝 Feature Request Received**
2. **🔍 Search ALL 6 docs** for matching requirement
3. **Decision Tree:**
   
   ```
   Feature in docs?
   ├─ ✅ YES → Proceed with implementation
   └─ ❌ NO → Follow "Undocumented Feature Protocol"
   ```

## Undocumented Feature Protocol
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

## Validation Checklist
- [ ] Feature exists in at least ONE of the 6 docs?
- [ ] Implementation matches documented requirements?
- [ ] No conflicting requirements across docs?
- [ ] User stories/use cases covered?
- [ ] Business logic aligns with BUSINESS_MODEL?
- [ ] Technical specs match SRS?
- [ ] Functional behavior matches FRD?

## Core Business Logic (Always Validate Against)
From BUSINESS_MODEL.md:
- ✅ **FREE for Buyers** - All customer features must be free
- ✅ **Paid for Sellers** - Revenue comes from promoters/sellers only
- ✅ **Offline-First** - Must work without internet
- ✅ **Dual-Mode** - Support both SQLite (offline) and Supabase (online)
- ✅ **Lead Generation** - Maximize seller leads, not buyer friction

## Red Flags (Alert User Immediately)
- 🚫 Feature charges buyers money
- 🚫 Feature breaks offline mode
- 🚫 Feature conflicts with "free for buyers" model
- 🚫 Feature requires always-online connection
- 🚫 Feature not in any of the 6 reference docs
