import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // All admin auth is delegated to Supabase via session cookies (updateSession).
  // Supabase auth itself rate-limits brute force on signInWithPassword.
  //
  // Note: the admin login form calls supabase.auth.* from the browser, so
  // the actual login request never traverses this proxy. We rely on
  // Supabase's built-in IP-based throttling there.
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|photos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
