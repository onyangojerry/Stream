# Configuration & Customization

## Environment Variables
Create a `.env` in the project root:

```env
# Supabase (Required for authentication)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App
VITE_APP_NAME=Stream
VITE_APP_VERSION=2.0.0

# Branding (optional)
VITE_APP_LOGO_URL=https://yourdomain.com/logo.png
VITE_APP_PRIMARY_COLOR=#3B82F6

# WebRTC (optional)
VITE_STUN_SERVERS=stun:stun.l.google.com:19302

# Feature toggles
VITE_ENABLE_TRANSCRIPTION=true
VITE_ENABLE_SIGN_LANGUAGE=true
VITE_ENABLE_COLLABORATIVE_DOCS=true
```

**Important**: See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions on setting up Supabase authentication.

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
