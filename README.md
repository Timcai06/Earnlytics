# Earnlytics

> AI-driven US tech company earnings analysis platform with Chinese summaries.

## 📂 Project Structure

```
earnlytics/
├── AGENTS.md                 # AI assistant knowledge base
├── README.md                 # This file
├── .gitignore                # Root gitignore (minimal)
├── doc/                      # Chinese documentation
│   ├── 计划/                 # Execution plans
│   ├── 策略/                 # Strategy docs
│   ├── 技术/                 # Technical docs
│   └── 备用/                 #备用资源
├── earnlytics-web/           # Next.js 16 frontend ⬅️ Main codebase
│   ├── AGENTS.md            # Frontend-specific guidelines
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   │   ├── ui/          # shadcn/ui primitives
│   │   │   ├── layout/      # Header, Footer
│   │   │   └── sections/    # Page sections
│   │   └── lib/             # Utilities
│   ├── public/              # Static assets
│   └── package.json         # Dependencies
└── pencil-earnlytics.pen    # Design file (13 pages)
```

## 🚀 Quick Start

```bash
# Frontend development
cd earnlytics-web && npm run dev

# Build
cd earnlytics-web && npm run build

# Lint
cd earnlytics-web && npm run lint
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Icons | Lucide React |
| Path alias | `@/*` → `./src/*` |
| Backend | Vercel Serverless |
| Database | Supabase PostgreSQL |
| AI | DeepSeek API |
| Data | FMP API + SEC EDGAR |

## 📋 Development Plans

| Phase | Timeline | Goal |
|-------|----------|------|
| 计划1 | Week 1-2 | MVP launch, 5 companies |
| 计划2 | Week 3-4 | Automation, 10 companies |
| 计划3 | Month 2 | 30 companies, AdSense |
| 计划4 | Month 3 | SEO, traffic growth |
| 计划5 | Month 4-6 | Commercialization |

## 💰 Cost Budget

| Phase | Monthly Cost | Main Expense |
|-------|--------------|--------------|
| MVP | ¥0 | Free tier |
| Automation | ¥1-2 | DeepSeek API |
| Scale | ¥10-20 | Potential DB upgrade |

## 📚 Documentation (Chinese)

| Path | Content |
|------|---------|
| `doc/计划/` | Execution plans |
| `doc/策略/` | Strategy documents |
| `doc/技术/` | Technical documentation |

## ⚠️ Anti-Patterns

- **Never** run `create-next-app` in root directory
- **Never** add duplicate `.gitignore` rules

## 📝 Notes

- Uses DOVE VPN proxy (HTTP 7897) for GitHub access
- Doc folder uses Chinese naming (计划, 技术, 策略)
- All frontend configs reside in `earnlytics-web/`

---

**Status**: Development in progress  
**Branch**: main
