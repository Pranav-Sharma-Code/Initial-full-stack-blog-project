import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types'

/**
 * Creates a Supabase client for use in:
 * - Server Components
 * - Route Handlers
 * - Server Actions
 *
 * This client can read AND write cookies, so it can refresh
 * the user's session automatically.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll called from a Server Component — session refresh
            // cookies will be set by the middleware instead. Safe to ignore.
          }
        },
      },
    }
  )
}

/**
 * Read-only server client for use in Server Components where you only
 * need to read the current session, not write cookies.
 */
export async function createSupabaseServerClientReadOnly() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // No-op: read-only client
        },
      },
    }
  )
}
