# Configuration & Customization

## Environment Variables

### Required Variables
Create a `.env` file in the project root with these **required** values:

```env
# Supabase (Required for authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Getting Supabase Credentials:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

📖 **Full Setup Guide**: See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for complete instructions including database schema.

### Optional Variables

```env
# Application Settings
VITE_APP_NAME=Stream
VITE_APP_VERSION=2.0.0

# Custom Branding
VITE_APP_LOGO_URL=https://yourdomain.com/logo.png
VITE_APP_PRIMARY_COLOR=#3B82F6

# WebRTC Configuration
VITE_STUN_SERVERS=stun:stun.l.google.com:19302
# For production, add TURN servers:
# VITE_TURN_SERVERS=turn:your-server.com:3478

# Feature Toggles
VITE_ENABLE_TRANSCRIPTION=true
VITE_ENABLE_SIGN_LANGUAGE=true
VITE_ENABLE_COLLABORATIVE_DOCS=true
```

### Environment File Setup

```bash
# Copy the example file
cp .env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

## TypeScript Configuration

The project includes type definitions for environment variables in `src/vite-env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME?: string
  // ... other vars
}
```

This provides autocomplete and type safety when accessing `import.meta.env.VITE_*` variables.

## Customization

### Theme
- Tailwind config: `tailwind.config.js`
- Global styles: `src/index.css`
- Dark/Light mode: built-in toggle, respects system preference

### Feature Configuration
```ts
export const CONFIG = {
  maxParticipants: 50,
  recordingEnabled: true,
  transcriptionEnabled: true,
  waitingRoomEnabled: true,
  videoQualityOptions: ['720p', '1080p', '4K']
}
```

### UI Components
- Modular components, replaceable icons (Lucide)
- Animations via Framer Motion

## Advanced Configuration

### WebRTC
```js
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add TURN servers for production
  ],
  sdpSemantics: 'unified-plan'
}
```

### Performance
- Route-based code splitting
- Inspect bundle sizes via `npm run build`
- Automatic cleanup of streams and connections
