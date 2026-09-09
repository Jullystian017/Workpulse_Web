import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Ensure we use dummy keys if env variables are not present during initial setup
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  // Clean the URL if it accidentally includes /rest/v1/ or similar paths
  const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
