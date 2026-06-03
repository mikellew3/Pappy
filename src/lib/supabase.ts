import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * True when both Supabase env vars are present. When false the app renders a
 * setup screen instead of crashing on a bad client.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

// A single shared client. Auth state (the magic-link session) is persisted to
// localStorage and refreshed automatically.
export const supabase: SupabaseClient = createClient(
  url ?? 'http://localhost:54321',
  anonKey ?? 'public-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
