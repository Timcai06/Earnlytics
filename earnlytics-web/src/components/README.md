# Components Boundary Guide

## Directory Roles

- `ui/`: primitive and reusable building blocks (button, input, toast, tooltip).
- `layout/`: global page shells and navigation (header/footer/sidebar/auth layout).
- `home/`: landing/home specific sections.
- `portfolio/`: portfolio tracking, holdings, position details.
- `investment/`: deep analysis and AI-investment workflow components.
- `companies/`, `ads/`, `animation/`, `performance/`: feature-specific shared blocks.

## Placement Rules

- If a component is used across multiple features and has no business context, put it in `ui/`.
- If a component is tied to one route domain, keep it in that domain folder.
- Avoid placing business logic in `ui/`; keep domain logic in feature folders.
- Prefer local imports from feature barrels (`index.ts`) where available.

## Naming

- Use `PascalCase.tsx` for React components.
- Legacy kebab-case component files have been migrated to `PascalCase` (as of 2026-02-26).
- Keep new file names consistent inside the same feature folder.
