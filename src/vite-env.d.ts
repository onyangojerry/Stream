/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_APP_LOGO_URL?: string
  readonly VITE_APP_PRIMARY_COLOR?: string
  readonly VITE_STUN_SERVERS?: string
  readonly VITE_ENABLE_TRANSCRIPTION?: string
  readonly VITE_ENABLE_SIGN_LANGUAGE?: string
  readonly VITE_ENABLE_COLLABORATIVE_DOCS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
