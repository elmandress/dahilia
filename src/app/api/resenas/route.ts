import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { fetchGoogleReviews } from '@/lib/google-reviews'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// Reseñas reales del Perfil de Google para la sección de la home.
//
// Va por el servidor (no desde el navegador) para que la clave de Google no
// viaje al cliente, y SIN caché: la política de Places no permite guardar su
// contenido (ver src/lib/google-reviews.ts). El componente la llama recién
// cuando la sección entra en pantalla, así que no se gasta una llamada por
// cada visita al sitio.
//
// Si no está configurada la clave, responde 200 con { ok: false } y la sección
// simplemente no se muestra: nunca un error a la vista de la clienta.
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  const ip = getClientIp(await headers())
  if (!checkRateLimit(`resenas:${ip}`, { windowMs: 60_000, max: 20 })) {
    return NextResponse.json({ ok: false }, { status: 429, headers: NO_STORE })
  }
  // `req` no se usa para leer parámetros a propósito: la respuesta es la misma
  // para todo el mundo y así no hay nada que un visitante pueda manipular.
  void req

  const data = await fetchGoogleReviews()
  if (!data) return NextResponse.json({ ok: false }, { headers: NO_STORE })
  return NextResponse.json({ ok: true, ...data }, { headers: NO_STORE })
}
