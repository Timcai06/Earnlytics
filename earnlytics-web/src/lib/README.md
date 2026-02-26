# `src/lib` Guide

This folder contains reusable runtime logic. Keep it focused on cross-page/shared code.

## Current structure

- `ai/`: chat, embeddings, RAG, and provider client integrations.
- `alerts/`: alert evaluation and notification delivery logic.
- `analysis/`: investment analysis orchestration and scoring logic.
- `prompts/`: prompt templates used by analysis/AI modules.
- `sec-edgar/`: SEC EDGAR fetch/parsing helpers.
- `stock-data.ts`: market data fetch/transform helpers.
- `supabase.ts`: shared Supabase client and related types.
- `utils.ts`: generic utility helpers (`cn`, common helpers).

## Rules

- Prefer `src/lib` for shared domain logic, not page-specific code.
- If logic is only used by one route, keep it near that route first.
- Route-local data modules should live in `src/app/<route>/` (for example `home-data.ts`, `dashboard-data.ts`).
- For new scripts, import from `src/lib/*` rather than duplicating logic in `scripts/`.
