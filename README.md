# Striim

Striim is a web-based collaboration platform for scheduled and instant calls, public community visibility, moderated join requests, and shared materials.

## Scope
This repository contains a React + TypeScript frontend that uses Supabase for authentication, persistence, and storage-backed community features.

## Current Product Capabilities
- Authenticated call launcher at `/calls` for one-on-one, group, and webinar sessions
- Instant and scheduled call modes
- Public and private meeting visibility controls
- Community dashboard for:
  - active users
  - ongoing calls
  - public scheduled calls
  - public materials
  - threaded chats
- Join request workflow for public meetings requiring:
  - requester name
  - GitHub profile/name/url
  - short interest description
- RSVP support for public scheduled meetings (authenticated users and guests)
- Floating "Return to call" shortcut when a session is active and user navigates away
- One active joined meeting per user rule

## Access Model
### Guest user
- Can view public community data (public ongoing calls, public scheduled calls, public threads/materials)
- Can submit join requests to public meetings with required metadata
- Can RSVP to public scheduled meetings using email
- Cannot start calls
- Cannot post/reply/react/publish/collaborate

### Authenticated user
- Can start and schedule calls
- Can request/join meetings based on meeting conditions
- Can publish and manage materials
- Can post/reply in threads and react to materials
- Can manage profile metadata and follow users

## Tech Stack
- React 18
- TypeScript
- Vite
- Zustand
- Supabase (Auth, Postgres, Storage)
- Tailwind CSS
- Framer Motion

## Project Structure
- `src/pages/` route-level UI
- `src/components/` shared UI and call controls
- `src/store/` Zustand stores
- `src/services/` Supabase data access wrappers
- `supabase/community_schema.sql` schema and policies for community features
- `docs/` operational and developer documentation

## Prerequisites
- Node.js 18+
- npm
- Supabase project

## Quick Start
1. Install dependencies
```bash
npm install
```

2. Configure environment variables
```bash
cp .env.example .env
```
Set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3. Apply required database setup in Supabase SQL Editor
- `docs/SUPABASE_SETUP.md` (`profiles` table and auth-compatible policies)
- `supabase/community_schema.sql` (community, meetings, follows, RSVPs, storage policies)

4. Start development server
```bash
npm run dev
```
Open `http://localhost:3000`.

## Commands
- `npm run dev` start dev server
- `npm run build` create production build
- `npm run build:check` run type-check and production build
- `npm run lint` run ESLint
- `npm run preview` preview production build locally

## Routes
- `/` home
- `/calls` call launcher
- `/join` join-by-id page
- `/community` community dashboard
- `/call/:roomId` one-on-one call page
- `/group/:roomId` group call page (authenticated)
- `/webinar/:roomId` webinar page (authenticated)
- `/scheduler` meeting scheduler (authenticated)
- `/recordings` recordings page (authenticated)
- `/profile` profile page (authenticated)

## Documentation Map
- `docs/USAGE.md` end-user usage and behavior by role
- `docs/SUPABASE_SETUP.md` Supabase setup and migration order
- `docs/ARCHITECTURE.md` system architecture and store/service design
- `docs/API.md` service/store APIs and table contract reference
- `docs/CONFIGURATION.md` environment and runtime configuration
- `docs/DEPLOYMENT.md` deployment and production checklist
- `docs/SECURITY.md` security model and hardening guidance
- `docs/PRIVACY_SECURITY.md` privacy/data handling summary
- `docs/TROUBLESHOOTING.md` common issues and fixes
- `docs/CONTRIBUTING.md` contribution workflow and quality gates
- `docs/WORKFLOWS.md` implementation workflows for feature delivery

