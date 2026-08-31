import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { notifyIndexNow } from '@/lib/indexnow'
import { createClient } from '@/lib/supabase/server'
import { CATALOG_TAG } from '@/lib/catalog'

// Lo llama el admin (client-side) después de guardar algo que un visitante
// ve en el sitio público. Dos modos, se pueden combinar en el mismo request:
//
// 1. `paths`: revalidatePath de URLs puntuales (una ficha de producto, una
//    colección) + aviso a IndexNow (Bing/Yandex) de que esa URL cambió.
//    Server-side para evitar CORS pegándole directo a api.indexnow.org desde
//    el browser.
// 2. `layout: true`: revalidatePath('/', 'layout') invalida TODAS las rutas
//    que comparten el layout raíz de una sola vez — para cambios que no son
//    "una URL" sino algo transversal (site_settings: banner de promo, umbral
//    de envío gratis, contacto; discounts: una oferta que se prende/apaga y
//    afecta el precio mostrado en /tienda, /ofertas, /carrito y la home a la
//    vez). Sin esto esos cambios quedan desfasados hasta que venza el
//    revalidate de cada página por separado (hasta 1h).
//
// Todas las rutas públicas ahora son estáticas/ISR (ver el fix de ISR) —
// antes de esto TODO se re-renderizaba en cada visita, así que esta
// invalidación explícita es la contraparte obligatoria de ese cambio: sin
// ella, "guardé en el admin" y "se ve en el sitio" quedan desincronizados.
//
// Fire-and-forget en el sentido de que nunca debe bloquear ni romper el
// guardado en el admin si algo de esto falla.
//
// Seguridad (auditoría 2026-08): este endpoint NO tenía ningún chequeo de
// auth — cualquiera en internet podía invalidar el caché ISR de todo el sitio
// (revalidatePath('/', 'layout')) a repetición, forzando re-renders/consultas
// a Supabase en cada visita siguiente (vector de costo/DoS, no de datos), y
// hacer que se le avisen a Bing/Yandex URLs arbitrarias vía IndexNow. Se exige
// sesión (igual criterio que el resto del admin: cualquier usuario logueado,
// no todavía is_admin() — ver database/schema-security-hardening.sql para el
// endurecimiento pendiente de eso).
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as { paths?: unknown; layout?: unknown } | null
  const paths = Array.isArray(body?.paths)
    ? body.paths.filter((p): p is string => typeof p === 'string').slice(0, 10)
    : []
  const layout = body?.layout === true

  if (paths.length === 0 && !layout) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  // Invalidar el caché de DATOS además del HTML. Son dos capas distintas:
  // revalidatePath tira el HTML cacheado de una ruta, pero el catálogo vive en
  // un unstable_cache compartido (lib/catalog.ts) que sobrevive a eso y
  // volvería a servir los datos viejos al re-renderizar. Se invalida siempre:
  // todo lo que llama a este endpoint (productos, precios, descuentos,
  // settings, colecciones, categorías) sale de ese mismo payload, y hacerlo de
  // más no cuesta nada — el siguiente request lo repuebla con una consulta.
  // `{ expire: 0 }` y no el perfil 'max': 'max' marca el tag como stale y sirve
  // stale-while-revalidate (la primera visita después de guardar todavía vería
  // lo viejo). Acá el disparador es "Anush guardó en el CMS y va a mirar el
  // sitio", así que corresponde expirar ya: el primer request paga una consulta
  // y ve el cambio. Es la única forma no deprecada de pedir eso en Next 16
  // (revalidateTag de un solo argumento quedó deprecado).
  try {
    revalidateTag(CATALOG_TAG, { expire: 0 })
  } catch {
    // No debe tumbar el resto del request.
  }

  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch {
      // Path inválido o fuera del árbol de rutas — no debe tumbar el resto.
    }
  }
  if (layout) {
    try {
      revalidatePath('/', 'layout')
    } catch {
      // No debe tumbar el resto del request.
    }
  }

  if (paths.length > 0) notifyIndexNow(paths)
  return NextResponse.json({ ok: true })
}
