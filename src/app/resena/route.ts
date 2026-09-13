import { NextResponse } from 'next/server'
import { getCatalog } from '@/lib/catalog'
import { googleReviewUrl } from '@/lib/profiles'
import { SITE_URL } from '@/lib/env'

// dahila.uy/resena → el formulario de reseña del Perfil de Google (12/09/2026).
// Un link corto, fácil de mandar por WhatsApp o imprimir en la tarjeta del
// paquete, que no cambia aunque cambie el de Google: el destino se carga en
// Configuración → Contacto. Mientras no esté cargado, lleva a /contacto.
//
// Ojo si se usa en la tarjeta con cupón: el cupón NO puede ir atado a dejar
// una reseña. Google prohíbe las reseñas a cambio de un beneficio.
export const dynamic = 'force-dynamic'

export async function GET() {
  let target: string | undefined
  try {
    target = googleReviewUrl((await getCatalog()).settings)
  } catch {
    // Sin la base, mejor /contacto que un error.
  }
  return NextResponse.redirect(target ?? `${SITE_URL}/contacto`, 307)
}
