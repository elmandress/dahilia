import { NextResponse } from 'next/server'
import { notifyIndexNow } from '@/lib/indexnow'

// Lo llama el admin (client-side) después de crear, editar, publicar o
// borrar un producto — así el ping a IndexNow corre server-side (evita
// problemas de CORS pegándole directo a api.indexnow.org desde el browser)
// sin bloquear el guardado: responde apenas encola el fetch, no espera a
// que Bing conteste.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { paths?: unknown } | null
  const paths = Array.isArray(body?.paths)
    ? body.paths.filter((p): p is string => typeof p === 'string').slice(0, 10)
    : []

  if (paths.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  notifyIndexNow(paths)
  return NextResponse.json({ ok: true })
}
