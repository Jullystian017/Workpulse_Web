import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Ensure we use dummy keys if env variables are not present during initial setup
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
