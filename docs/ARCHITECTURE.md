# Architecture

## System Overview
Striim is a client-heavy SPA with Supabase-backed persistence.

- UI and route logic live in React pages/components
- state is centralized in domain stores (Zustand)
- data operations are isolated in service modules
- Supabase provides authentication, relational data, and storage URLs

## Runtime Layers
1. Routing layer (`src/App.tsx`)
- public and protected routes
- lazy-loaded page modules

2. Shell layer (`src/components/Layout.tsx`)
- top navigation
- call return shortcut
- presence heartbeat integration

3. Domain pages (`src/pages/*`)
- calls, scheduler, community, profile, auth, recordings

4. Store layer (`src/store/*`)
- state transitions and client-side guards

5. Service layer (`src/services/*`)
- Supabase query/write wrappers

## Key Stores
- `useAuthStore`: session, login/signup/logout, profile mapping
- `useSchedulerStore`: scheduled meetings, active states, attendee tracking, one-active-call guard
- `useCommunityStore`: users, join requests, materials, reactions, threads, follows, invites
- `useCallSessionStore`: active call context for global return shortcut
- `useVideoStore`: in-call media and participant UI state
- `useRecordingStore`: local recording state and artifacts

## Persistence Model
Supabase tables are defined in `supabase/community_schema.sql` plus `profiles`.

Core persisted entities:
- scheduled meetings and joined users
- meeting RSVPs
- public user presence mirror
- meeting join requests
- community threads/messages
- public materials and reactions
- follows and collaboration invites

## Access Control Model
Application behavior enforces:
- guests can view public data and submit constrained requests/RSVP
- authenticated users can start calls and contribute content
- protected routes for group/webinar/scheduler/profile/recordings

Database layer uses RLS policies from schema file. Current policies include prototype-permissive reads for public community surfaces and should be reviewed for production hardening.

## Update Flow Example
Example: RSVP flow
1. UI submits RSVP action in `Community` page
2. Service `schedulerApi.upsertMeetingRsvp` writes to `meeting_rsvps`
3. Periodic refresh updates RSVP counts and local RSVP membership
4. UI shows start notification when RSVPed meeting becomes active

