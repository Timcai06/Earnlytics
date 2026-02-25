# Scripts Guide

## Layout

- `ops/`: operational scripts used by `package.json` commands.
- `dev/`: one-off inspection/debug scripts that are not part of the standard workflow.

## How to run

- Preferred: run operational scripts via npm, for example `npm run fetch:earnings`.
- Direct run (manual): `npx tsx scripts/ops/<script>.ts` or `npx tsx scripts/dev/<script>.ts`.
