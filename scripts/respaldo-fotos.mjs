#!/usr/bin/env node
// Guarda una copia local de la foto principal de cada prenda.
//
// Por qué existe: el 20/09/2026 Supabase restringió el proyecto por cuota y,
// con el Storage caído, el sitio mostró 13 de 15 fotos rotas. Estas copias
// viven en public/fotos-respaldo (las sirve Netlify, no Supabase) y solo se
// usan si la foto remota falla — ver src/components/ui/ImagenConRespaldo.tsx.
//
// Uso:
//   npm run respaldo-fotos            # ve qué falta y lo baja
//   npm run respaldo-fotos -- --todas # rehace también las que ya están
//
// De dónde baja: del propio sitio publicado (dahila.uy/_next/image), o sea la
// versión ya optimizada a 640px, no el original. Cuesta una descarga por foto
// nueva y nada más. Conviene correrlo cada vez que Anush suba prendas nuevas.
//
// Al final reescribe src/lib/fotos-respaldo.ts con la lista real de archivos,
// así el código y la carpeta nunca quedan desfasados.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'

const SITIO = process.env.NEXT_PUBLIC_SITE_URL || 'https://dahila.uy'
const DESTINO = 'public/fotos-respaldo'
const ANCHO = 640
const TODAS = process.argv.includes('--todas')

function leerEnv() {
  try {
    const txt = readFileSync('.env.local', 'utf8')
    const out = {}
    for (const linea of txt.split(/\r?\n/)) {
      const m = linea.match(/^(NEXT_PUBLIC_SUPABASE_(?:URL|ANON_KEY))=(.*)$/)
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
    return out
  } catch {
    return {}
  }
}

async function catalogo() {
  const env = leerEnv()
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const h = { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }
    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=slug,status,media:product_media(url,is_primary,position,type)&status=in.(active,soldout)`
    const res = await fetch(url, { headers: h })
    if (res.ok) return { origen: 'base', productos: await res.json() }
    console.log(`⚠️  La base respondió ${res.status}; uso la copia del catálogo.`)
  }
  const snap = JSON.parse(readFileSync('src/lib/catalog-snapshot.json', 'utf8'))
  return { origen: 'snapshot', productos: snap.products ?? [] }
}

const { origen, productos } = await catalogo()
mkdirSync(DESTINO, { recursive: true })
console.log(`📸  ${productos.length} prendas (fuente: ${origen})`)

let bajadas = 0
let saltadas = 0
const fallidas = []
for (const p of productos) {
  const fotos = (p.media ?? []).filter((m) => !m.type || m.type === 'image')
  const principal = fotos.find((m) => m.is_primary) ?? fotos.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]
  if (!principal?.url) continue
  const destino = path.join(DESTINO, `${p.slug}.jpg`)
  if (existsSync(destino) && !TODAS) { saltadas++; continue }
  const url = `${SITIO}/_next/image?url=${encodeURIComponent(principal.url)}&w=${ANCHO}&q=82`
  try {
    const r = await fetch(url, { headers: { Accept: 'image/webp,image/jpeg,*/*' } })
    if (!r.ok) { fallidas.push(`${p.slug} (HTTP ${r.status})`); continue }
    const buf = Buffer.from(await r.arrayBuffer())
    if (buf.length < 3000) { fallidas.push(`${p.slug} (respuesta muy chica)`); continue }
    writeFileSync(destino, buf)
    bajadas++
    console.log(`   ✓ ${p.slug} · ${Math.round(buf.length / 1024)} KB`)
  } catch (e) {
    fallidas.push(`${p.slug} (${e.message})`)
  }
}

// La lista del código se regenera desde la carpeta: nunca desfasada.
const slugs = readdirSync(DESTINO)
  // hero y sobre-anush no son prendas: son fotos del sitio.
  .filter((f) => /\.(jpg|jpeg|webp|png)$/i.test(f) && !['hero', 'sobre-anush'].includes(f.replace(/\.[^.]+$/, '')))
  .map((f) => f.replace(/\.[^.]+$/, ''))
  .sort()
const modulo = readFileSync('src/lib/fotos-respaldo.ts', 'utf8')
const nuevo = modulo.replace(
  /export const FOTOS_RESPALDO = new Set\(\[[\s\S]*?\]\)/,
  `export const FOTOS_RESPALDO = new Set([\n${slugs.map((s) => `  '${s}',`).join('\n')}\n])`
)
writeFileSync('src/lib/fotos-respaldo.ts', nuevo)

console.log(`\n${bajadas} bajadas · ${saltadas} ya estaban · ${slugs.length} prendas con respaldo`)
if (fallidas.length) console.log(`No se pudieron bajar (${fallidas.length}): ${fallidas.join(', ')}`)
console.log('Acordate de commitear public/fotos-respaldo y src/lib/fotos-respaldo.ts.')
