# Development Workflows

## Feature Delivery Workflow
1. Define behavior and role/access matrix.
2. Confirm data model impact.
3. Implement data and state layers.
4. Implement UI and route behavior.
5. Validate with build/type/lint checks.
6. Update docs.

## Persistence Workflow
Use this sequence for persistent features:
1. SQL schema update (`supabase/community_schema.sql` or setup docs)
2. Service wrapper update (`src/services/*Api.ts`)
3. Store actions/state updates (`src/store/*Store.ts`)
4. Page/component integration (`src/pages/*`, `src/components/*`)

## Release Workflow
1. Run `npm run build:check`.
2. Run `npm run lint`.
3. Smoke test auth, calls, scheduler, community, join requests, RSVP.
4. Deploy with env configured and schema applied.

