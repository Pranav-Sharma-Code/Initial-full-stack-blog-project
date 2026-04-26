import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard']

// Routes that authenticated users should NOT be able to reach
const AUTH_ROUTES = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh the Supabase session token and get the current user.
  // This MUST run on every request so the cookie stays fresh.
  const { response, user } = await createSupabaseMiddlewareClient(request)

  const isAuthenticated = !!user
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))

  // Unauthenticated → protected route: redirect to /login with return path
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated → auth pages: redirect to home (they're already logged in)
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // All other requests: pass through with the refreshed session cookie
  return response
}

export const config = {
  matcher: [
    /*
     * Run on every path EXCEPT:
     * - _next/static  (Next.js static chunks)
     * - _next/image   (image optimisation)
     * - api/auth      (Supabase auth callback — no session needed)
     * - favicon.ico
     * - Static assets (svg, png, jpg, gif, webp, ico, woff2, etc.)
     */
    '/((?!_next/static|_next/image|api/auth|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
