// Optimización one-time del bucket `media` de Supabase Storage.
//
// Por qué existe: auditoría jul 2026 — 11,6 GB de egress/mes con ~150 MB
// almacenados. Las fotos existentes se subieron crudas (2–8 MB, fotos de
// celular) y con cacheControl de 1 HORA, así que Googlebot, el CDN de
// Netlify y cada crawler re-descargan originales pesados todo el tiempo.
// Las subidas NUEVAS ya salen comprimidas (src/lib/media.ts); este script
// arregla las viejas UNA VEZ: baja cada imagen, la reduce a ≤1600px JPEG
// q82 y la vuelve a subir EN LA MISMA RUTA (las URLs no cambian) con
// caché de 1 año.
//
// Uso (desde la raíz del repo, con Node 20+):
//   1. Poner las credenciales del proyecto de la TIENDA (no el del MCP):
//        set SUPABASE_URL=https://<proyecto>.supabase.co
//        set SUPABASE_SERVICE_ROLE_KEY=<service_role, Settings → API>
//   2. Ver qué haría (no toca nada):
//        node scripts/optimizar-storage.mjs
//   3. Aplicar de verdad:
//        node scripts/optimizar-storage.mjs --apply
//
// El service role key NUNCA se commitea ni se pone en .env.local.

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const URL_ = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APPLY = process.argv.includes('--apply')

if (!URL_ || !KEY) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.')
  process.exit(1)
}

const supabase = createClient(URL_, KEY)
const BUCKET = 'media'
const MAX_EDGE = 1600
const QUALITY = 82
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i

async function* walk(prefix) {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 })
  if (error) throw new Error(`list(${prefix}): ${error.message}`)
  for (const entry of data ?? []) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    // Las carpetas vienen sin metadata; los archivos con ella.
    if (entry.id === null && !entry.metadata) yield* walk(path)
    else yield { path, size: entry.metadata?.size ?? 0 }
  }
}

let totalBefore = 0
let totalAfter = 0
let count = 0
let skipped = 0

for await (const file of walk('')) {
  if (!IMAGE_EXT.test(file.path)) { skipped++; continue }

  const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(file.path)
  if (dlErr) { console.error(`✗ descarga ${file.path}: ${dlErr.message}`); continue }

  const input = Buffer.from(await blob.arrayBuffer())
  let output
  try {
    output = await sharp(input)
      .rotate() // respeta la orientación EXIF antes de descartar metadata
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
      .toBuffer()
  } catch (e) {
    console.error(`✗ no se pudo procesar ${file.path}: ${e.message}`)
    continue
  }

  const before = input.length
  const after = output.length
  totalBefore += before

  // Si la versión nueva no ahorra al menos 10%, se re-sube el ORIGINAL solo
  // para renovarle el cacheControl (de 1 hora a 1 año) sin perder calidad.
  const worthIt = after < before * 0.9
  const body = worthIt ? output : input
  totalAfter += body.length
  count++

  const label = `${(before / 1024).toFixed(0)} KB → ${(body.length / 1024).toFixed(0)} KB${worthIt ? '' : ' (solo caché)'}`
  if (!APPLY) {
    console.log(`[dry-run] ${file.path}: ${label}`)
    continue
  }

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(file.path, body, {
    upsert: true,
    cacheControl: '31536000',
    contentType: worthIt ? 'image/jpeg' : (blob.type || 'image/jpeg'),
  })
  console.log(upErr ? `✗ subida ${file.path}: ${upErr.message}` : `✓ ${file.path}: ${label}`)
}

console.log('—'.repeat(50))
console.log(`${count} imágenes (${skipped} archivos salteados)`)
console.log(`Total: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB`)
if (!APPLY) console.log('Dry-run: nada se modificó. Ejecutá con --apply para aplicar.')
