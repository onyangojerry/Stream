# Deployment

## 1. Pre-Deployment Requirements
- Node.js 18+
- valid Supabase project
- environment variables configured in host
- database migrations applied

## 2. Build Pipeline
```bash
npm ci
npm run build:check
npm run build
```
Deploy `dist/`.

## 3. Required Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 4. Database Migration Order
1. Apply `profiles` setup from `docs/SUPABASE_SETUP.md`
2. Apply `supabase/community_schema.sql`

## 5. Production Smoke Test
- auth flows: signup/login/logout/profile update
- `/calls`: guest blocked from call start
- `/community`: public visibility loads for guests
- join requests: requires name/GitHub/interest
- RSVP: create RSVP and verify count/update
- call return shortcut appears when session active and user leaves call page
- one-active-call-per-user enforcement works

## 6. Rollback Guidance
If deployment introduces critical failures:
1. redeploy previous frontend artifact
2. avoid destructive schema rollback unless planned migration script exists
3. isolate and patch forward

