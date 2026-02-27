# Troubleshooting

## Authentication
### Symptom
Login/signup succeeds but profile/community pages error.

### Checks
- `profiles` table exists
- `profiles` RLS policies exist
- `.env` values are correct

## Community Data Not Persisting
### Symptom
Materials, threads, follows, or join requests reset or fail.

### Checks
- `supabase/community_schema.sql` fully applied
- required tables exist (`public_materials`, `community_threads`, `user_follows`, etc.)
- browser console for Supabase policy errors

## Scheduling or RSVP Issues
### Symptom
Scheduled meetings or RSVP counts do not update.

### Checks
- `scheduled_meetings` and `meeting_rsvps` tables exist
- row-level policies are in place
- network calls to Supabase succeed

## Guest Access Violations
### Symptom
Guest can perform contribution actions.

### Expected
Guest can view and submit constrained join request/RSVP only.
Guest cannot start calls, post/reply, or react.

### Action
Verify UI guards in `Community` and `Calls` pages and protected route wiring.

## Build Failures
Run:
```bash
npm run build:check
```
Fix type errors and stale imports before deployment.

