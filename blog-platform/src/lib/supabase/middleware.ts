import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types'

/**
 * Creates a Supabase client wired into the Next.js proxy (middleware) cycle.
 *
 * FIX: Removed `request.cookies.set()` — NextRequest cookies are read-only
 * in Next.js App Router. The refreshed token is written ONLY to the outgoing
 * response cookies, which is the correct pattern per @supabase/ssr docs.
 *
 * Always call getUser() after creating this client — that is what triggers
 * the token refresh. Never skip it.
 */
export async function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Read cookies from the incoming request
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ✅ FIX: Do NOT call request.cookies.set() — it's read-only.
          // Rebuild the response with a fresh NextResponse so Next.js can
          // properly forward the Set-Cookie headers to the browser.
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // This call is MANDATORY — it triggers the JWT refresh if the token is expired.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, response, user }
}
