# Configuration

## Environment Variables

Required:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

These are read from `src/lib/supabase.ts`.

## Local Setup
1. Copy `.env.example` to `.env`
2. Add required values
3. Restart dev server after changes

## Runtime Flags
Current runtime behavior is mostly code-defined, not env-flag heavy.

## Validation Commands
```bash
npm run build:check
npm run lint
```

## Misconfiguration Symptoms
- missing env values: auth and data sync failures
- wrong Supabase key/url: network errors from Supabase client
- missing schema migration: feature-specific failures (community, scheduler, RSVP)

