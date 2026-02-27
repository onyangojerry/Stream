# Contributing

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

Apply required SQL before data-feature work:
- `docs/SUPABASE_SETUP.md`
- `supabase/community_schema.sql`

## Workflow
1. Understand requested behavior and access rules first.
2. If persistence is affected, update in order:
- schema
- service API wrapper
- store logic
- UI
3. Validate locally:
```bash
npm run build:check
npm run lint
```
4. Update docs for behavior changes.

## PR Expectations
- changes are scoped and production-oriented
- no stale/demo behavior reintroduced in production flows
- permission boundaries are explicit in logic and UI
- docs stay aligned with implementation

