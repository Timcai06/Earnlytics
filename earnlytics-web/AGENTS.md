# EARNLYTICS-WEB

**Context:** Sub-project of earnlytics monorepo

## OVERVIEW

Next.js 16 frontend application with shadcn/ui component library.

## STRUCTURE

```
src/
├── app/              # App Router pages
│   ├── (auth)/       # Route group: auth pages
│   ├── about/
│   ├── calendar/
│   ├── companies/
│   ├── home/
│   └── profile/
├── components/
│   ├── ui/           # shadcn/ui components (badge, button, card, etc.)
│   ├── layout/        # Header, Footer
│   └── sections/      # Page sections
└── lib/              # Utilities (cn helper)

scripts/
├── ops/              # Operational scripts invoked by npm scripts
└── dev/              # One-off checks/debug scripts
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add page | `src/app/[name]/page.tsx` |
| Add UI component | `src/components/ui/` |
| Modify routing | `src/app/` directory |
| Utility functions | `src/lib/utils.ts` |

## TECH

- **Framework:** Next.js 16, React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, class-variance-authority
- **Components:** shadcn/ui, Radix UI primitives
- **Icons:** Lucide React
- **Path alias:** `@/*` → `./src/*`

## COMPONENT PATTERNS

```tsx
// shadcn/ui component structure
import { cn } from "@/lib/utils"

export function Component({ className, ...props }) {
  return <div className={cn("base-classes", className)} {...props} />
}
```

## COMMANDS

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## ANTI-PATTERNS

- **Never** use `as any`, `@ts-ignore`, `@ts-expect-error`
- **Never** add configs to root (only in this directory)
