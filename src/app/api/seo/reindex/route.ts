import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { notifyIndexNow } from '@/lib/indexnow'

// Lo llama el admin (client-side) después de crear, editar, publicar o
// borrar un producto. Dos trabajos en un solo request:
//
// 1. revalidatePath: tienda/[slug] y colecciones/[slug] ahora son SSG
//    (generateStaticParams + revalidate por hora, ver commit del fix de
//    ISR) — sin esto, el HTML cacheado de esa página seguiría mostrando la
//    versión vieja hasta que venciera solo el revalidate, o sea hasta 1h de
//    desfasaje entre "guardé en el admin" y "se ve en el sitio".
//    revalidatePath lo invalida al toque, apenas se guarda.
// 2. notifyIndexNow: avisa a Bing/Yandex que la URL cambió, server-side para
//    evitar CORS pegándole directo a api.indexnow.org desde el browser.
//
// Fire-and-forget en el sentido de que nunca debe bloquear ni romper el
// guardado del producto en el admin si algo de esto falla.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { paths?: unknown } | null
  const paths = Array.isArray(body?.paths)
    ? body.paths.filter((p): p is string => typeof p === 'string').slice(0, 10)
    : []

  if (paths.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch {
      // Path inválido o fuera del árbol de rutas — no debe tumbar el resto.
    }
  }

  notifyIndexNow(paths)
  return NextResponse.json({ ok: true })
}
