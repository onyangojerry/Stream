# Usage Guide

## 1. Access and Roles

### Guest (not logged in)
Allowed:
- view public ongoing calls
- view public scheduled calls
- view public materials and threads
- submit public join requests with required metadata
- RSVP to public scheduled calls with email

Blocked:
- start calls
- schedule calls
- publish materials
- react to materials
- post threads or replies

### Authenticated user
Allowed:
- all guest visibility features
- start instant calls
- schedule calls
- publish and manage materials
- react, post, reply, and collaborate
- follow users and update profile metadata

## 2. Starting a Call
1. Open `/calls`.
2. Select call type:
- one-on-one
- group
- webinar
3. Select mode:
- instant
- schedule
4. Click action button.

Rules:
- starting a call requires authentication
- if user already belongs to an active meeting, launcher redirects back to that meeting

## 3. Scheduling Calls
1. Open `/scheduler`.
2. Provide title, description, type, start/end date and time, attendee limit.
3. Choose whether to publish as public listing.
4. Save.

Public listing behavior:
- public scheduled calls appear on community page for users and guests
- guests can request access and RSVP

## 4. Community Page
Community page (`/community`) provides:
- active users panel
- ongoing meetings panel
- scheduled public calls panel
- public materials panel
- threaded chats panel

### Join request flow
For public calls, requester must provide:
- name
- GitHub profile/name/url
- interest description

### RSVP flow
Users and guests can RSVP to public scheduled meetings.
- users: email taken from profile
- guests: email entered in RSVP input
- app shows in-session start alert when RSVPed meeting transitions to active

## 5. Ongoing Session Recovery
When a user is part of an active call and navigates away from call page, a floating "Return to call" button appears globally on non-call pages.

## 6. Contribution Rules
The following actions are authenticated-only:
- publish material
- react to material
- post new thread
- reply in thread
- invite collaborator
- create community

## 7. Profile Usage
Profile page stores identity metadata used by community and join workflows:
- display name
- GitHub profile
- interest/bio details

