import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export function isSupabaseEnabled(): boolean {
  return (
    import.meta.env.VITE_USE_SUPABASE === 'true' &&
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey)
  )
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!isSupabaseEnabled()) {
    throw new Error('Supabase is not configured')
  }
  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return client
}