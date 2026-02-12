# Earnlytics

> AI-driven US tech company earnings analysis platform with Chinese summaries.

**Production**: https://earnlytics-ebon.vercel.app  
**Status**: Plan 3 Week 7 Complete (87.5%) → Week 8 In Progress  
**Last Updated**: 2026-02-11

## 🎯 Current Progress

| Phase | Status | Completion | Key Achievements |
|-------|--------|------------|------------------|
| **Plan 1: MVP** | ✅ Complete | 100% | 10 pages, Vercel deployed |
| **Plan 2: AI Automation** | ✅ Complete | 100% | DeepSeek AI, 23 earnings analyzed, GitHub Actions |
| **Plan 3: Scale** | 🚀 Week 7 Done | 87.5% | 30 companies, 109 earnings, 100% AI coverage, email subscription |
| **Plan 3: Week 8** | ⏳ In Progress | 0% | AdSense application prep |

### Database Status (Based on Code Analysis)
- **Companies**: 30 (Tier 1/2/3) - scripts support tier2/tier3 insertion
- **Earnings**: 109 records - scripts for backfilling and seeding
- **AI Analyses**: 100% coverage - analyze-batch.ts script available
- **Subscribers**: Ready (API + UI complete) - send-digests.ts script exists

## 📂 Project Structure

```
earnlytics/
├── AGENTS.md                 # AI assistant knowledge base (updated 2026-02-11)
├── README.md                 # This file
├── .gitignore                # Root gitignore (minimal)
├── doc/                      # Chinese documentation
│   ├── 计划/                 # Execution plans (Plan 1-5)
│   ├── 策略/                 # Strategy docs
│   ├── 技术/                 # Technical docs
│   └── 项目状态报告-20260210.md # Current status report
├── earnlytics-web/           # Next.js 16 frontend ⬅️ Main codebase
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── earnings/[symbol]/ # Dynamic route for earnings
│   │   │   ├── companies/   # Company list page
│   │   │   ├── calendar/    # Earnings calendar
│   │   │   ├── privacy/     # Privacy policy (Week 8 task)
│   │   │   ├── terms/       # Terms of service (Week 8 task)
│   │   │   └── api/         # API routes
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui primitives
│   │   │   ├── icons/       # SVG icon library (replaced all emoji)
│   │   │   └── layout/      # Header, Footer
│   │   └── lib/             # Utilities (ai.ts, supabase.ts)
│   ├── scripts/             # 23 data scripts
│   │   ├── fetch-earnings.ts
│   │   ├── analyze-batch.ts
│   │   ├── backfill-tier2.ts
│   │   └── send-digests.ts
│   └── supabase/migrations/ # Database schema
└── pencil-earnlytics.pen    # Design file (13 pages)
```

## 🚀 Quick Start

```bash
# Frontend development
cd earnlytics-web && npm run dev          # Start dev server (localhost:3000)

# Data Operations
npm run fetch:earnings                    # Fetch latest earnings from FMP
npm run analyze:batch                     # Generate AI analysis (batch of 5)

# Build & Deploy
npm run build                             # Production build
npm run lint                              # Lint check
```

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 16.1.6 |
| Frontend | React | 19.2.3 |
| Frontend | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| UI Components | shadcn/ui | Latest |
| Icons | Lucide React + Custom SVG | Latest |
| Path alias | `@/*` → `./src/*` | - |

### Backend & Infrastructure
- **Hosting**: Vercel Serverless
- **Database**: Supabase PostgreSQL
- **AI Service**: DeepSeek API (¥0.002/1K tokens)
- **Data Source**: Financial Modeling Prep (FMP) API + SEC EDGAR
- **Automation**: GitHub Actions (every 4 hours)

## 📋 Development Plans (Based on Actual Code)

| Phase | Timeline | Goal | Status | Evidence in Code |
|-------|----------|------|--------|------------------|
| **Plan 1: MVP** | Week 1-2 | 10 pages, 10 companies | ✅ Complete | 10+ pages in app/, shadcn/ui components |
| **Plan 2: AI Automation** | Week 3-4 | AI analysis, automation | ✅ Complete | ai.ts, analyze-batch.ts, GitHub Actions |
| **Plan 3: Scale** | Month 2 | 30 companies, 109 earnings | 🚀 87.5% | tier2/tier3 scripts, backfill scripts |
| **Plan 3: Week 8** | Current | AdSense application | ⏳ In Progress | privacy/, terms/ directories exist |
| **Plan 4: Growth** | Month 3 | SEO, traffic growth | 📋 Planned | - |
| **Plan 5: Commercialization** | Month 4-6 | Monetization | 📋 Planned | - |

### Week 8 Tasks (In Progress - Based on Code Structure)
- [ ] Complete Privacy Policy page (`/privacy`)
- [ ] Complete Terms of Service page (`/terms`)  
- [ ] Complete Contact page (`/contact`)
- [ ] AdSense integration
- [ ] Submit AdSense application

## 💰 Cost Analysis (Based on Actual Implementation)

| Phase | Monthly Cost | Main Expense | Actual (Based on Code) |
|-------|--------------|--------------|------------------------|
| MVP | ¥0 | Free tier | ✅ ¥0 (Vercel, Supabase free) |
| Automation | ¥1-2 | DeepSeek API | ✅ ¥0.2-1 (batch processing) |
| Scale | ¥10-20 | Potential DB upgrade | 🚀 ¥0.2-1 (still on free tiers) |

**Current Monthly Cost**: ~¥0.2-1 (extremely low, all free tiers)

## 🔑 Key Architecture Decisions (Visible in Code)

### 1. Dynamic Routing for Earnings
**Changed from**: `/earnings?symbol=aapl` (query params)  
**Changed to**: `/earnings/aapl` (dynamic route)  
**Evidence**: `src/app/earnings/[symbol]/page.tsx` exists  
**Reason**: Next.js 15+ params are Promises, simpler to use dynamic segments

### 2. SVG Icons Instead of Emoji
**All emoji replaced with SVG components**  
**Evidence**: `src/components/icons/index.tsx` exists with custom icons  
**Benefits**: Consistent styling, better performance, no platform differences

### 3. AI Analysis Batch Processing
**Approach**: Process 5 earnings at a time  
**Evidence**: `scripts/analyze-batch.ts` with batch logic  
**Reason**: Control API costs, manageable execution time

## 📚 Documentation (Chinese)

| Path | Content | Status |
|------|---------|--------|
| `doc/计划/` | Execution plans (Plan 1-5) | ✅ Complete |
| `doc/策略/` | Strategy documents | ✅ Complete |
| `doc/技术/` | Technical documentation | ✅ Complete |
| `doc/项目状态报告-20260210.md` | Current status report | ✅ Updated |

## ⚠️ Anti-Patterns (THIS PROJECT)

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

## 🐛 Known Issues & Solutions (From Code Analysis)

| Issue | Solution | Evidence |
|-------|----------|----------|
| useSearchParams returns null | Use dynamic route `[symbol]` instead | `earnings/[symbol]/page.tsx` |
| params is Promise in Next.js 15 | Use `React.use()` to unwrap | `earnings/[symbol]/page.tsx` |
| Environment variables in scripts | Use dotenv to load `.env.local` | `scripts/*.ts` with config() |
| API keys leaked to git | 1) Delete file, 2) Rotate keys, 3) Add to `.gitignore` | Already fixed |

## 📝 Notes

- Project uses DOVE VPN proxy (HTTP 7897) for GitHub access
- Doc folder uses Chinese naming conventions (计划, 技术, ���略)
- Root `.gitignore` is minimal; full rules in `earnlytics-web/.gitignore`
- Monthly AI cost: ~¥0.2-1 (extremely low cost, batch processing)
- All API keys must be rotated if accidentally committed
- Dynamic routes use `[symbol]` format, accessed via `React.use(params)` in Next.js 15
- 23 data scripts available for various operations

## 🎉 Key Achievements (Based on Code Evidence)

1. **✅ Complete Frontend**: 10+ pages with dynamic routing
2. **✅ AI Integration**: DeepSeek API with batch processing
3. **✅ Data Pipeline**: 23 scripts for data fetching and analysis
4. **✅ Database Schema**: Supabase migrations with proper structure
5. **✅ UI System**: shadcn/ui + custom SVG icons
6. **✅ Automation**: GitHub Actions for scheduled tasks
7. **✅ Scalability**: Support for 30 companies across 3 tiers

---

**Production**: https://earnlytics-ebon.vercel.app  
**GitHub**: https://github.com/Timcai06/Earnlytics  
**Branch**: main  
**Last Updated**: 2026-02-11  
**Next Update**: After Week 8 tasks completion
