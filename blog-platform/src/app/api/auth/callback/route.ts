import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/callback
 *
 * Supabase sends the user here after:
 * - Email confirmation links
 * - Magic link logins
 * - OAuth provider redirects (Google, GitHub, etc.)
 *
 * This route exchanges the one-time `code` param for a real
 * session token and stores it in the cookie.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // The page the user was trying to reach before being redirected to auth
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful — redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Auth callback error:', error.message)
  }

  // Something went wrong — redirect to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
