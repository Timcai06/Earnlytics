# EARNLYTICS KNOWLEDGE BASE

**Generated:** 2026-02-08 13:20
**Commit:** 6bb5790
**Branch:** main

## OVERVIEW

AI-driven US tech company earnings analysis platform with Chinese summaries. Monorepo with Next.js frontend + project documentation.

## STRUCTURE

```
earnlytics/
├── doc/                    # Project docs (Chinese)
├── earnlytics-web/          # Next.js 16 frontend
│   ├── src/
│   │   ├── app/            # App Router (page.tsx per route)
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui primitives
│   │   │   ├── layout/     # Header, Footer
│   │   │   └── sections/  # Page sections
│   │   └── lib/            # Utils (cn helper)
│   └── public/
└── pencil-earnlytics.pen    # Design file (13 pages)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add page | `earnlytics-web/src/app/[name]/page.tsx` | App Router |
| Add UI component | `earnlytics-web/src/components/ui/` | shadcn/ui |
| Modify layout | `earnlytics-web/src/components/layout/` | Header/Footer |
| Design reference | `pencil-earnlytics.pen` | Pencil design file |
| Project plans | `doc/计划/` | Chinese planning docs |

## TECH STACK

- **Frontend:** Next.js 16 + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Icons:** Lucide React
- **Path alias:** `@/*` → `./src/*`

## ANTI-PATTERNS (THIS PROJECT)

- **Never** run `create-next-app` in root directory (creates duplicate config)
- **Never** add `.gitignore` rules that overlap with `earnlytics-web/.gitignore`

## COMMANDS

```bash
# Frontend development
cd earnlytics-web && npm run dev

# Build
cd earnlytics-web && npm run build

# Lint
cd earnlytics-web && npm run lint
```

## NOTES

- Project uses DOVE VPN proxy (HTTP 7897) for GitHub access
- Doc folder uses Chinese naming conventions (计划, 技术, 策略)
- Root `.gitignore` is minimal; full rules in `earnlytics-web/.gitignore`
