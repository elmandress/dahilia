import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env'

// Redirección que conserva las cookies de sesión que Supabase acaba de
// refrescar (si se pierden, el navegador se queda con un token vencido).
function redirectTo(request: NextRequest, from: NextResponse, pathname: string, error?: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = error ? `?e=${error}` : ''
  const res = NextResponse.redirect(url)
  from.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
  return res
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Tener sesión no alcanza (14/09/2026): el registro de cuentas de
    // Supabase estaba abierto, así que cualquiera podía crearse una. Solo
    // pasa quien figura en `admins` (is_admin() en la base, ver
    // database/seguridad-2026-09.sql). La consulta se hace solo acá y solo
    // con sesión: el sitio público no la paga.
    let isAdmin = false
    if (user) {
      const { data, error } = await supabase.rpc('is_admin')
      isAdmin = !error && data === true
    }

    if (request.nextUrl.pathname === '/admin/login') {
      // Ya adentro como admin: directo al panel.
      if (isAdmin) return redirectTo(request, supabaseResponse, '/admin')
      return supabaseResponse
    }

    if (!user) return redirectTo(request, supabaseResponse, '/admin/login')
    // Cuenta sin permiso: al login con el aviso (la página cierra esa sesión).
    if (!isAdmin) return redirectTo(request, supabaseResponse, '/admin/login', 'sin-permiso')
  }

  return supabaseResponse
}
