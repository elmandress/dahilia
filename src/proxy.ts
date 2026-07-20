import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isDbDown } from '@/lib/db-health'
import { snapshotIsEmpty } from '@/lib/catalog'
import { MAINTENANCE_HTML } from '@/lib/maintenance-page'

// Ciclo de facturación de Supabase que resetea la cuota (el sitio vuelve solo).
// Sirve para el Retry-After: le dice a Google cuándo reintentar sin desindexar.
const QUOTA_RESET = Date.UTC(2026, 6, 29, 12, 0, 0) // 29/07/2026 12:00 UTC

function retryAfterSeconds(): number {
  const secs = Math.round((QUOTA_RESET - Date.now()) / 1000)
  // Piso de 1 h por si ya pasó la fecha (evita un Retry-After 0 o negativo).
  return Math.max(3600, secs)
}

/** Rutas que NUNCA ven el cartel: el admin (para operar) y las APIs. */
function isExempt(pathname: string): boolean {
  return pathname.startsWith('/admin') || pathname.startsWith('/api')
}

function maintenanceResponse(): NextResponse {
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': String(retryAfterSeconds()),
      'Cache-Control': 'no-store',
    },
  })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isExempt(pathname)) {
    // Override manual de respaldo: prender MAINTENANCE_MODE=1 fuerza el cartel
    // sin esperar la detección (por si hay que activarlo a mano).
    if (process.env.MAINTENANCE_MODE === '1') return maintenanceResponse()

    // Detección automática: si NO hay snapshot para servir (catálogo vacío) y la
    // base está caída por cuota, mostramos el cartel de mantenimiento con 503.
    // Cuando exista un snapshot (snapshotIsEmpty === false), dejamos pasar el
    // request: las páginas sirven el catálogo estático en modo lectura y no hace
    // falta el probe.
    if (snapshotIsEmpty && (await isDbDown())) return maintenanceResponse()
  }

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
