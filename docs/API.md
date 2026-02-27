# API and Data Reference

This project does not expose a separate backend REST server in-repo. Most behavior is implemented through:
- client-side stores
- Supabase table queries via `src/services/*`

## 1. Service Modules

### `src/services/communityApi.ts`
Handles community-related persistence:
- users presence mirror (`profiles_public`)
- join requests (`meeting_join_requests`)
- materials (`public_materials`)
- reactions (`material_reactions`, `material_reaction_events`)
- invites (`collaboration_invites`)
- communities (`communities`)
- threads and messages (`community_threads`, `community_thread_messages`)
- follows (`user_follows`)
- file upload to `public-materials` storage bucket

### `src/services/schedulerApi.ts`
Handles meeting scheduling and RSVP:
- scheduled meetings (`scheduled_meetings`)
- meeting RSVP (`meeting_rsvps`)

## 2. Store APIs (High-Level)

### `useAuthStore`
- `signup`
- `login`
- `logout`
- `updateProfile`
- `initializeAuth`

### `useSchedulerStore`
- `initializeScheduler`
- `addMeeting`
- `updateMeeting`
- `deleteMeeting`
- `joinMeeting(meetingId, userId)`
- `leaveMeeting(meetingId, userId)`
- `getUserActiveMeeting(userId)`
- `getMyOngoingMeetings(userId)`

### `useCommunityStore`
- `initializeCommunity`
- `submitJoinRequest`
- `publishMaterial`
- `updateMaterial`
- `deleteMaterial`
- `reactToMaterial`
- `createThread`
- `addThreadMessage`
- `toggleFollowUser`

### `useCallSessionStore`
- `setActiveCall`
- `clearActiveCall`

## 3. UI Route Surface
- `/` home
- `/calls` call launcher
- `/join` join flow
- `/community` community suite
- `/scheduler` scheduling
- `/call/:roomId` one-on-one call
- `/group/:roomId` group call
- `/webinar/:roomId` webinar
- `/profile` profile

## 4. Access Expectations
- Call start is authenticated-only
- Group/webinar routes are protected
- Community contribution actions are authenticated-only
- Public visibility and request/RSVP flows are guest-accessible

## 5. Data Contract Notes
- `scheduled_meetings.joined_user_ids` tracks joined members
- `meeting_rsvps` stores notifications intent and contact identity
- `meeting_join_requests` stores requester metadata for moderation

