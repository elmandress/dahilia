import { SUPABASE_URL } from '@/lib/env'
import { EXT_FOTO } from '@/lib/media'

// Las fotos de la tienda, servidas desde dahila.uy/media/<ruta del storage>.
//
// Por qué existe: ver "Fotos servidas desde el propio sitio" en lib/media.ts.
// Esta ruta solo atiende lo que NO está en public/media (los archivos de ahí
// los entrega el CDN sin pasar por acá): una foto recién subida desde el
// admin. La baja de Supabase y la devuelve con caché "durable" de Netlify
// —compartido entre todos sus nodos—, así que Supabase la entrega una vez por
// deploy y no una vez por visitante. El siguiente build la copia a
// public/media (scripts/fotos.mjs) y ya no vuelve a pasar por acá.
//
// El optimizador (/_next/image → Image CDN de Netlify) acepta esta ruta como
// origen: verificado en producción el 13/11/2026 con /_next/image?url=/og.

const UN_ANIO = 31536000
const SEGMENTO = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const TIPO_POR_EXT: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
}

function fallo(status: number, segundosEnCdn: number): Response {
  return new Response(null, {
    status,
    headers: {
      // El navegador no lo guarda; el CDN sí, un rato corto, para que una
      // caída de Supabase no convierta cada foto en una invocación de función.
      'Cache-Control': 'no-store',
      'Netlify-CDN-Cache-Control': `public, max-age=${segundosEnCdn}`,
    },
  })
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const archivo = path?.[path.length - 1] ?? ''
  if (!path?.length || path.length > 6 || !path.every((s) => SEGMENTO.test(s)) || !EXT_FOTO.test(archivo)) {
    return fallo(404, 300)
  }

  let origen: Response
  try {
    origen = await fetch(`${SUPABASE_URL}/storage/v1/object/public/media/${path.join('/')}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    return fallo(502, 60)
  }
  // 400 es lo que responde el storage cuando el objeto no existe.
  if (origen.status === 404 || origen.status === 400) return fallo(404, 300)
  if (!origen.ok || !origen.body) return fallo(502, 60)

  // Solo imágenes: un archivo con extensión de foto pero otro contenido no se
  // sirve desde nuestro dominio.
  const tipo = (origen.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  const ext = archivo.split('.').pop()!.toLowerCase()
  const contentType =
    tipo.startsWith('image/') && tipo !== 'image/svg+xml'
      ? tipo
      : tipo === '' || tipo === 'application/octet-stream'
        ? TIPO_POR_EXT[ext]
        : undefined
  if (!contentType) return fallo(404, 300)

  const headers = new Headers({
    'Content-Type': contentType,
    // Inmutable por construcción: cada subida lleva un sufijo aleatorio y
    // upsert:false (lib/media.ts), así que una ruta nunca cambia de contenido.
    'Cache-Control': `public, max-age=${UN_ANIO}, immutable`,
    'Netlify-CDN-Cache-Control': `public, max-age=${UN_ANIO}, immutable, durable`,
    'X-Content-Type-Options': 'nosniff',
  })
  const largo = origen.headers.get('content-length')
  if (largo && !origen.headers.get('content-encoding')) headers.set('Content-Length', largo)
  return new Response(origen.body, { status: 200, headers })
}
