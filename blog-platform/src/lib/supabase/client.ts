import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types'

/**
 * Creates a Supabase client for use in Client Components ('use client').
 *
 * @supabase/ssr's createBrowserClient is already a singleton under the hood —
 * calling this function multiple times returns the same instance, so it's safe
 * to call at the top of any client component without a separate context provider.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
