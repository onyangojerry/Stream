# Stream

Modern, feature-rich video communication built with React, TypeScript, WebRTC, and Vite. Includes group calls, screen share, recording, transcription, collaborative docs, smart waiting room, and Supabase authentication.

## Highlights
- Fast dev experience (Vite), responsive UI (Tailwind), dark/light mode
- WebRTC peer-to-peer with Supabase auth and role-based controls
- Modular React components and lightweight state (Zustand)
- Secure authentication with email/password and profile management

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account ([create one free](https://supabase.com))

### Installation
```bash
git clone https://github.com/onyangojerry/Stream.git
cd Stream
npm install
```

### Setup Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Add your Supabase URL and anon key to `.env`
4. Run the SQL setup from `docs/SUPABASE_SETUP.md` in Supabase SQL Editor

### Start Dev Server
```bash
npm run dev
```
Open http://localhost:3000

## Scripts
- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview built app
- `npm run lint`: run ESLint

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State**: Zustand
- **Auth**: Supabase Authentication
- **Database**: Supabase PostgreSQL
- **RTC**: WebRTC, SimplePeer
- **Icons**: Lucide React

## Features
- ✅ Email/password authentication with Supabase
- ✅ User profiles with avatars
- ✅ One-on-one & group video calls (up to 50 participants)
- ✅ Screen sharing
- ✅ Local recording with download
- ✅ Real-time transcription
- ✅ Sign language detection
- ✅ Collaborative documents
- ✅ Smart waiting room with host controls
- ✅ Dark/light mode
- ✅ Fully responsive design

## Documentation
- **Supabase Setup**: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- API & Data: [docs/API.md](docs/API.md)
- Usage Guide: [docs/USAGE.md](docs/USAGE.md)
- Features & Workflows: [docs/WORKFLOWS.md](docs/WORKFLOWS.md)
- Waiting Room: [docs/WAITING_ROOM_GUIDE.md](docs/WAITING_ROOM_GUIDE.md)
- Deployment: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Configuration: [docs/CONFIGURATION.md](docs/CONFIGURATION.md)
- Security & Privacy: [docs/PRIVACY_SECURITY.md](docs/PRIVACY_SECURITY.md)
- Contributing: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
- Changelog: [docs/CHANGELOG.md](docs/CHANGELOG.md)
- Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)

## License
See repository license information.
