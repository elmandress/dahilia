// Utilidades compartidas de medios (cliente y servidor).
//
// `slugify` vivía copiado en 3 páginas del admin; acá queda la única copia.
// `mediaPath` arma el nombre de archivo del storage con palabras reales:
// Google Images usa el nombre del archivo como señal de relevancia
// (Search Central, "Image SEO best practices") — "top-flower-dahila-crochet-
// ab12.jpg" le dice algo al buscador; "1737271721_x4f2.jpg" no le dice nada.
// Solo afecta subidas nuevas: las fotos existentes conservan su URL.

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function mediaPath(folder: string, hint: string, originalFileName: string): string {
  const ext = (originalFileName.split('.').pop() || 'jpg').toLowerCase()
  const base = slugify(hint).slice(0, 60) || 'foto'
  // Sufijo corto anti-colisión: dos fotos del mismo producto no se pisan.
  const rand = Math.random().toString(36).slice(2, 6)
  return `${folder}/${base}-dahila-crochet-${rand}.${ext}`
}

// ── Control de egress de Supabase ────────────────────────────
// Auditoría jul 2026: 11,6 GB de egress con ~150 MB almacenados. Causas:
// (1) fotos de celular subidas crudas (2–8 MB), (2) cacheControl de 1 hora
// en cada upload → todo el mundo re-descarga cada hora, (3) URLs crudas del
// storage expuestas a bots en JSON-LD/sitemap/OG. Estas utilidades atacan
// las tres. Los objetos son inmutables (sufijo aleatorio + upsert:false),
// así que un año de caché es correcto por construcción.

export const STORAGE_CACHE_SECONDS = '31536000'

/** Lado mayor máximo para fotos de producto: 1600px cubre el zoom del
 *  lightbox en cualquier pantalla y pesa ~10× menos que un original de 4000px. */
const MAX_IMAGE_EDGE = 1600
const JPEG_QUALITY = 0.82

/**
 * Reduce y re-encoda una imagen en el navegador antes de subirla al storage.
 * Devuelve el archivo listo para subir (JPEG ≤1600px) o el original intacto
 * cuando no es una imagen que sepamos decodificar (videos, HEIC raros) o
 * cuando ya es más liviano que la versión re-encodada.
 */
export async function prepareImageForUpload(file: File): Promise<{ blob: Blob; ext: string; contentType: string }> {
  const passthrough = { blob: file as Blob, ext: (file.name.split('.').pop() || 'jpg').toLowerCase(), contentType: file.type || 'application/octet-stream' }
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return passthrough

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return passthrough
    // Fondo blanco: al pasar PNG con transparencia a JPEG, lo transparente
    // se volvería negro sin esto.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    if (!blob || blob.size >= file.size) return passthrough
    return { blob, ext: 'jpg', contentType: 'image/jpeg' }
  } catch {
    // HEIC u otro formato que el navegador no decodifica: sube el original.
    return passthrough
  }
}

/**
 * URL de una foto del storage servida a través del optimizador del sitio
 * (`/_next/image`, cacheado por el CDN de Netlify). Para lo que consumen los
 * BOTS — JSON-LD, sitemap, tarjeta OG — esto corta el egress de Supabase:
 * Googlebot-Image y los crawlers de WhatsApp/Meta descargan desde dahila.uy
 * una versión de ~100 KB en vez del original de varios MB desde supabase.co.
 * `w` debe existir en images.deviceSizes y `q` en images.qualities
 * (next.config.ts) o Next responde 400.
 */
export function botImageUrl(siteUrl: string, rawUrl: string, w: 640 | 1200 = 1200, q: 82 | 90 = 82): string {
  if (!rawUrl.startsWith('http')) return `${siteUrl}${rawUrl}`
  return `${siteUrl}/_next/image?url=${encodeURIComponent(rawUrl)}&w=${w}&q=${q}`
}
