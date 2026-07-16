import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Null until .env.local is filled in — App shows setup instructions instead
 * of crashing on a missing-config throw. */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

/** For modules that only run behind the configured gate in App. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}
