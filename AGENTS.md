# EARNLYTICS KNOWLEDGE BASE

**Generated:** 2026-02-10
**Updated:** 2026-02-11
**Current Status:** Plan 3 Week 7 Complete (87.5%) → Week 8 In Progress
**Branch:** main

## PROJECT STATUS

| Phase | Status | Completion | Key Deliverables |
|-------|--------|------------|------------------|
| **Plan 1: MVP** | ✅ Complete | 100% | 10 pages, Vercel deployed |
| **Plan 2: AI Automation** | ✅ Complete | 100% | DeepSeek AI, 23 earnings analyzed, GitHub Actions |
| **Plan 3: Scale** | 🚀 Week 7 Complete | 87.5% | 30 companies, 109 earnings, 100% AI analyzed, email subscription ready |
| **Plan 3: Week 8** | ⏳ In Progress | 0% | AdSense application, required pages |

**Production:** https://earnlytics-ebon.vercel.app  
**GitHub:** https://github.com/Timcai06/Earnlytics

---

## OVERVIEW

AI-driven US tech company earnings analysis platform with Chinese summaries. Monorepo with Next.js frontend + project documentation.

## STRUCTURE

```
earnlytics/
├── doc/                           # Project docs (Chinese)
│   ├── 计划/                       # Plan documents
│   │   ├── 计划1-MVP启动/
│   │   ├── 计划2-AI自动化/
│   │   ├── 计划3-规模化/
│   │   └── 00-项目总览.md
│   └── 项目状态报告-20260210.md    # Current status report
├── earnlytics-web/                # Next.js 16 frontend
│   ├── src/
│   │   ├── app/                   # App Router
│   │   │   ├── earnings/[symbol]/ # Dynamic route for earnings
│   │   │   ├── companies/         # Company list page
│   │   │   └── api/               # API routes
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui primitives
│   │   │   ├── icons/             # SVG icon library
│   │   │   └── layout/            # Header, Footer
│   │   └── lib/                   # Utils (cn helper, ai.ts, supabase.ts)
│   ├── scripts/                   # Data scripts
│   │   ├── fetch-earnings.ts
│   │   └── analyze-batch.ts
│   └── supabase/migrations/       # Database schema
├── pencil-earnlytics.pen          # Design file (13 pages)
├── PLAN2部署指南.md               # Deployment guide
└── PLAN2数据验证指南.md           # Data validation guide
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add page | `earnlytics-web/src/app/[name]/page.tsx` | App Router, dynamic routes use `[param]` |
| Add UI component | `earnlytics-web/src/components/ui/` | shadcn/ui |
| Add icon | `earnlytics-web/src/components/icons/` | SVG icons (replaced all emoji) |
| AI analysis logic | `earnlytics-web/src/lib/ai.ts` | DeepSeek integration |
| Database schema | `earnlytics-web/supabase/migrations/` | SQL migrations |
| Data scripts | `earnlytics-web/scripts/` | fetch-earnings.ts, analyze-batch.ts |
| API routes | `earnlytics-web/src/app/api/*/` | Serverless functions |
| Design reference | `pencil-earnlytics.pen` | 13-page Pencil design file |
| Plan documents | `doc/计划/` | Chinese planning docs |
| Deployment guide | `PLAN2部署指南.md` | Step-by-step deployment |

## TECH STACK

- **Frontend:** Next.js 16 + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Icons:** Lucide React + Custom SVG icons
- **Path alias:** `@/*` → `./src/*`

### Backend & Infrastructure
- **Hosting:** Vercel Serverless
- **Database:** Supabase PostgreSQL
- **AI Service:** DeepSeek API (¥0.002/1K tokens)
- **Data Source:** Financial Modeling Prep (FMP) API
- **Automation:** GitHub Actions (every 4 hours)

## ANTI-PATTERNS (THIS PROJECT)

### NEVER Do These
- ❌ Run `create-next-app` in root directory (creates duplicate config)
- ❌ Add API keys to git (use environment variables)
- ❌ Use `as any`, `@ts-ignore`, `@ts-expect-error`
- ❌ Add `.gitignore` rules that overlap with `earnlytics-web/.gitignore`
- ❌ Commit `.env.local` or files containing secrets

### ALWAYS Do These
- ✅ Use SVG icons from `src/components/icons/`
- ✅ Follow shadcn/ui patterns for components
- ✅ Update progress documents when completing tasks
- ✅ Use dynamic routes for parameterized pages
- ✅ Test build before committing

## COMMANDS

```bash
# Development
cd earnlytics-web && npm run dev          # Start dev server (localhost:3000)

# Data Operations
npm run fetch:earnings                    # Fetch latest earnings from FMP
npm run analyze:batch                     # Generate AI analysis (batch of 5)

# Build & Deploy
npm run build                             # Production build
npm run lint                              # Lint check
```

## CURRENT SYSTEM STATE

### Database Status (2026-02-11)
| Table | Records | Status |
|-------|---------|--------|
| companies | 30 | ✅ Complete (Tier 1/2/3) |
| earnings | 109 | ✅ Complete |
| ai_analyses | 109 | ✅ 100% Coverage |
| subscribers | 0 | ✅ Ready (API + UI done) |

### Key Architecture Decisions

#### 1. Dynamic Routing for Earnings
**Changed from:** `/earnings?symbol=aapl` (query params)  
**Changed to:** `/earnings/aapl` (dynamic route)  
**Reason:** Next.js 15 params are Promises, simpler to use dynamic segments  
**Implementation:** `src/app/earnings/[symbol]/page.tsx` using `React.use()` to unwrap params

#### 2. SVG Icons Instead of Emoji
**All emoji replaced with SVG components**  
**Location:** `src/components/icons/index.tsx`  
**Benefits:** Consistent styling, better performance, no platform differences

#### 3. AI Analysis Batch Processing
**Approach:** Process 5 earnings at a time  
**Reason:** Control API costs, manageable execution time  
**Command:** `npm run analyze:batch` (run multiple times for all data)

## KNOWN ISSUES & SOLUTIONS

| Issue | Solution | File |
|-------|----------|------|
| useSearchParams returns null | Use dynamic route `[symbol]` instead | `earnings/[symbol]/page.tsx` |
| params is Promise in Next.js 15 | Use `React.use()` to unwrap | `earnings/[symbol]/page.tsx` |
| Environment variables in scripts | Use dotenv to load `.env.local` | `scripts/*.ts` |
| API keys leaked to git | 1) Delete file, 2) Rotate keys, 3) Add to `.gitignore` | Already fixed |

## NEXT STEPS (PLAN 3 - WEEK 8)

### Immediate Tasks (Week 8)
1. **AdSense Required Pages**
   - Privacy Policy page (`/privacy`)
   - Terms of Service page (`/terms`)
   - Contact page (`/contact`)
   - Update About Us page

2. **AdSense Integration**
   - Research AdSense code integration
   - Add top banner ad slot
   - Add in-content ad slot
   - Add bottom ad slot
   - Configure responsive ad units

3. **Submit AdSense Application**
   - Check all requirements
   - Submit application
   - Wait for review (1-2 weeks)

### Optional Improvements (Week 7b)
- Add data source labels (SEC EDGAR / Sample data)
- Add earnings history selector
- Add quarter-over-quarter comparison view
- Add "latest" badge to newest earnings

### Completed Tasks (Week 5-7)
✅ Expanded to 30 companies (Tier 1/2/3)
✅ 109 earnings with 100% AI analysis coverage
✅ Calendar page (`/calendar`)
✅ Email subscription feature (API + UI)
✅ Data quality improvements (44 earnings backfilled)

## NOTES

- Project uses DOVE VPN proxy (HTTP 7897) for GitHub access
- Doc folder uses Chinese naming conventions (计划, 技术, 策略)
- Root `.gitignore` is minimal; full rules in `earnlytics-web/.gitignore`
- Monthly AI cost: ~¥0.2-1 (extremely low cost)
- All API keys must be rotated if accidentally committed
- Dynamic routes use `[symbol]` format, accessed via `React.use(params)` in Next.js 15

---

**Last Updated:** 2026-02-10  
**Session Context:** Plan 2 complete (100%), ready for Plan 3 scale-out
