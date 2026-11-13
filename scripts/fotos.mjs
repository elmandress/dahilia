#!/usr/bin/env node
// Trae las fotos de la tienda a public/media, para que las sirva el propio
// sitio y no Supabase.
//
// Por qué existe: el 12/11/2026 el proyecto de Supabase quedó restringido por
// tercera vez por "Cached Egress" (5 GB/mes en el plan gratis). Cada foto que
// Netlify no tenía en caché se bajaba entera de Supabase: 40–70 descargas por
// visitante. Y con el proyecto restringido tampoco había de dónde recuperar
// las fotos: la única copia estaba ahí adentro. Ver lib/media.ts, "Fotos
// servidas desde el propio sitio".
//
// Qué hace: arma la lista de fotos (la base si responde, más el respaldo del
// catálogo) y baja las que falten en public/media desde EL SITIO PUBLICADO
// (dahila.uy/media/…), no desde Supabase. El sitio ya las tiene: o como archivo
// del deploy anterior, o en su caché. Así Supabase entrega cada foto una sola
// vez en la vida, la primera que alguien la pide.
//
// Uso:
//   npm run fotos            # baja lo que falta; commitear public/media
//   (automático)             # `npm run build` lo corre dentro de Netlify
//
// Commitear public/media es el respaldo real: si Supabase se cae, se pausa o
// se pierde, las fotos están en el repo. En Netlify corre en cada build para
// cubrir lo que todavía no se commiteó; ahí nunca hace fallar el deploy.

import { readFileSync, existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const EN_BUILD = process.argv.includes('--build')
const DESTINO = 'public/media'
const SITIO = (process.env.FOTOS_ORIGEN || process.env.URL || 'https://dahila.uy').replace(/\/$/, '')
const MAX_LADO = 1600
const CALIDAD = 82
const PRESUPUESTO_MS = EN_BUILD ? 150_000 : 15 * 60_000
const EN_PARALELO = 6

// Mismos criterios que fotoLocal() en src/lib/media.ts.
const URL_STORAGE = /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/media\/([A-Za-z0-9][A-Za-z0-9._\-/]*?\.(?:jpe?g|png|webp|gif|avif))(?![A-Za-z0-9._\-/])/gi

function rutasEn(texto) {
  const out = new Set()
  for (const m of texto.matchAll(URL_STORAGE)) {
    if (!m[1].includes('..') && !m[1].includes('//')) out.add(m[1])
  }
  return out
}

function leerEnvLocal() {
  try {
    const out = {}
    for (const linea of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
      const m = linea.match(/^(NEXT_PUBLIC_SUPABASE_(?:URL|ANON_KEY))=(.*)$/)
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
    return out
  } catch {
    return {}
  }
}

/** Todas las fotos que nombra la base. Solo lectura, con la clave pública: son
 *  consultas de texto, no bajan ninguna foto. Si no responde, no pasa nada. */
async function rutasDeLaBase() {
  const env = { ...leerEnvLocal(), ...process.env }
  const base = env.NEXT_PUBLIC_SUPABASE_URL
  const clave = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const out = new Set()
  if (!base || !clave) return out
  const headers = { apikey: clave, Authorization: `Bearer ${clave}` }
  // Tablas que guardan URLs de fotos. Una que no exista o no sea pública
  // responde con error y se saltea.
  const tablas = ['product_media', 'categories', 'collections', 'colors', 'site_settings', 'testimonials', 'profiles', 'reels']
  await Promise.all(tablas.map(async (tabla) => {
    try {
      const res = await fetch(`${base}/rest/v1/${tabla}?select=*`, { headers, signal: AbortSignal.timeout(10_000) })
      if (!res.ok) return
      for (const r of rutasEn(await res.text())) out.add(r)
    } catch { /* la base no responde: queda el respaldo del catálogo */ }
  }))
  return out
}

function rutasDelRespaldo() {
  try {
    return rutasEn(readFileSync('src/lib/catalog-snapshot.json', 'utf8'))
  } catch {
    return new Set()
  }
}

/** Achica las fotos crudas de celular (2–8 MB) a lo que la tienda muestra.
 *  Mismo formato y misma ruta; si no hay sharp o algo falla, queda como vino. */
async function achicar(buffer) {
  try {
    const sharp = (await import('sharp')).default
    const img = sharp(buffer, { failOn: 'none' })
    const meta = await img.metadata()
    const grande = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_LADO
    if (!grande && buffer.length < 700_000) return buffer
    // rotate() aplica la orientación EXIF antes de descartarla.
    let salida = img.rotate().resize({ width: MAX_LADO, height: MAX_LADO, fit: 'inside', withoutEnlargement: true })
    if (meta.format === 'jpeg') salida = salida.jpeg({ quality: CALIDAD, mozjpeg: true })
    else if (meta.format === 'png') salida = salida.png({ compressionLevel: 9 })
    else if (meta.format === 'webp') salida = salida.webp({ quality: CALIDAD })
    else return buffer
    const out = await salida.toBuffer()
    return out.length < buffer.length ? out : buffer
  } catch {
    return buffer
  }
}

async function main() {
  if (EN_BUILD && process.env.NETLIFY !== 'true') return // en tu máquina, `npm run build` no baja nada
  const inicio = Date.now()
  const rutas = new Set([...rutasDelRespaldo(), ...(await rutasDeLaBase())])
  const faltan = [...rutas].filter((r) => !existsSync(path.join(DESTINO, r))).sort()
  console.log(`📸  ${rutas.size} fotos en el catálogo · ${rutas.size - faltan.length} ya están en ${DESTINO} · faltan ${faltan.length}`)
  if (faltan.length === 0) return

  let bajadas = 0
  let bytes = 0
  const fallidas = []
  let i = 0
  async function tanda() {
    while (i < faltan.length) {
      const ruta = faltan[i++]
      if (Date.now() - inicio > PRESUPUESTO_MS) { fallidas.push(`${ruta} (sin tiempo)`); continue }
      try {
        const res = await fetch(`${SITIO}/media/${ruta}`, { signal: AbortSignal.timeout(20_000) })
        const tipo = res.headers.get('content-type') ?? ''
        if (!res.ok || !tipo.startsWith('image/')) { fallidas.push(`${ruta} (${res.status})`); continue }
        const foto = await achicar(Buffer.from(await res.arrayBuffer()))
        const destino = path.join(DESTINO, ruta)
        await mkdir(path.dirname(destino), { recursive: true })
        await writeFile(destino, foto)
        bajadas++
        bytes += foto.length
      } catch (e) {
        fallidas.push(`${ruta} (${e?.name ?? 'error'})`)
      }
    }
  }
  await Promise.all(Array.from({ length: EN_PARALELO }, tanda))

  console.log(`✅  ${bajadas} fotos nuevas en ${DESTINO} (${(bytes / 1e6).toFixed(1)} MB)`)
  if (fallidas.length) {
    console.log(`⚠️  ${fallidas.length} no se pudieron traer desde ${SITIO} (el sitio las sigue sirviendo por /media; se reintenta en el próximo build):`)
    for (const f of fallidas.slice(0, 15)) console.log(`     ${f}`)
    if (fallidas.length > 15) console.log(`     … y ${fallidas.length - 15} más`)
  }
  if (!EN_BUILD && bajadas > 0) console.log('👉  Commiteá public/media: es el respaldo de las fotos fuera de Supabase.')
}

main().catch((e) => {
  console.error('fotos:', e?.message ?? e)
  // En el build nunca frena el deploy: sin estas copias el sitio igual sirve
  // las fotos por /media (src/app/media/[...path]/route.ts).
  process.exit(EN_BUILD ? 0 : 1)
})
