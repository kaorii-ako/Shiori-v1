import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const isSupabaseConfigured = () =>
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 10

let supabaseClient = null
if (isSupabaseConfigured()) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  } catch (e) {
    console.warn('[Shiori] Supabase init failed, running without auth:', e.message)
  }
}

export const supabase = supabaseClient
export default supabaseClient
