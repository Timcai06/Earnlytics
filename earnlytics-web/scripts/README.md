# Scripts Guide

## Layout

- `ops/`: operational scripts used by `package.json` commands.
- `dev/`: one-off inspection/debug scripts that are not part of the standard workflow.

## Naming Convention

- `fetch:*`: pull data from external providers/APIs.
- `sync:*`: reconcile local DB state with trusted upstreams.
- `update:*`: apply data/document updates in place.
- `seed:*`: fill missing baseline data.
- `insert:*`: insert static company lists.
- `alerts:*`: run alert processing/email workflows.
- `generate:*`: generate derived datasets/embeddings.

## Operational Commands (npm)

### Data Ingestion

- `npm run fetch:earnings` -> `scripts/ops/fetch-earnings.ts`
- `npm run fetch:documents` -> `scripts/ops/fetch-documents.ts`
- `npm run fetch:future-earnings` -> `scripts/ops/fetch-future-earnings.ts`
- `npm run sync:sec` -> `scripts/ops/sync-sec-edgar.ts`
- `npm run sync:valuation` -> `scripts/ops/fetch-valuation.ts`
- `npm run sync:benchmarks` -> `scripts/ops/build-industry-benchmarks.ts`

### Analysis / Enrichment

- `npm run analyze:batch` -> `scripts/ops/analyze-batch.ts`
- `npm run generate:embeddings` -> `scripts/ops/generate-embeddings.ts`
- `npm run generate:future-earnings` -> `scripts/ops/generate-future-earnings.ts`

### Data Maintenance

- `npm run update:data-sources` -> `scripts/ops/update-data-sources.ts`
- `npm run update:docs` -> `scripts/ops/update-docs.ts`
- `npm run update:earnings-data` -> `scripts/ops/update-earnings-data.ts`
- `npm run backfill:tier2` -> `scripts/ops/backfill-tier2.ts`
- `npm run seed:missing` -> `scripts/ops/seed-missing-earnings.ts`
- `npm run seed:tier2` -> `scripts/ops/seed-tier2-earnings.ts`
- `npm run insert:tier2` -> `scripts/ops/insert-tier2-companies.ts`
- `npm run insert:tier3` -> `scripts/ops/insert-tier3-companies.ts`

### Alerts & Email

- `npm run alerts:process` -> `scripts/ops/process-alerts.ts`
- `npm run alerts:send-emails` -> `scripts/ops/send-pending-emails.ts`
- `npm run alerts:send-digests` -> `scripts/ops/send-digests.ts`

## Dev / Debug Scripts

- `scripts/dev/check-*.ts`: data consistency probes.
- `scripts/dev/debug-*.ts`: ad-hoc debugging.
- `scripts/dev/show-raw.ts`: inspect raw payloads.

## How to run

- Preferred: run operational scripts via npm, for example `npm run fetch:earnings`.
- Direct run (manual): `npx tsx scripts/ops/<script>.ts` or `npx tsx scripts/dev/<script>.ts`.
