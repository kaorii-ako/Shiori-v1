import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = () => !!SUPABASE_URL && !!SUPABASE_ANON_KEY

// Only create the client when both vars are present — avoids crash when running without .env
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export default supabase
