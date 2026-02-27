# Privacy and Data Handling

## Data Stored
Persisted in Supabase:
- user profile records (`profiles`)
- public profile/presence mirror (`profiles_public`)
- scheduled meetings and RSVP records
- meeting join requests
- community content (materials, reactions, threads, replies)
- follows and collaboration invites

Client-side persisted state:
- selected UI/workspace state and active call session context via Zustand persist

## Data Exposure Rules
- guests can read public community surfaces
- contribution operations require authentication
- public join request metadata is intentionally collected for moderation

## Media and Recording Notes
- in-call media is browser-driven
- recording behavior is client-controlled in current implementation

## Production Recommendation
Perform a privacy review of:
- retention periods
- moderation metadata visibility
- export/delete workflows

