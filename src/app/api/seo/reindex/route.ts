import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { notifyIndexNow } from '@/lib/indexnow'

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
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { paths?: unknown; layout?: unknown } | null
  const paths = Array.isArray(body?.paths)
    ? body.paths.filter((p): p is string => typeof p === 'string').slice(0, 10)
    : []
  const layout = body?.layout === true

  if (paths.length === 0 && !layout) {
    return NextResponse.json({ ok: false }, { status: 400 })
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
