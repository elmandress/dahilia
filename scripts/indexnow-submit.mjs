#!/usr/bin/env node
// scripts/indexnow-submit.mjs — avisa por IndexNow qué URLs hay que volver a
// mirar. Lo consumen Bing, Yandex, Seznam y Naver; Google NO. Igual importa:
// ChatGPT busca con el índice de Bing, así que estar fresco ahí es la vía más
// directa a que una IA cite a Dahila.
//
// Por qué existe: el sitio ya avisa a IndexNow cuando Anush guarda algo en el
// admin (/api/seo/reindex → src/lib/indexnow.ts), pero una nota nueva del blog
// llega por deploy, no por el admin, y nunca se avisaba. Esto cierra ese hueco.
//
// Es gratis, no tiene límite de uso y no necesita ninguna clave secreta: la
// "llave" de IndexNow es pública y ya está publicada en el sitio.
//
// Uso (después de un deploy):
//   npm run indexnow                  # todas las URLs del sitemap
//   npm run indexnow -- --ultimas=10  # las 10 más nuevas según <lastmod>
//   npm run indexnow -- --url=https://dahila.uy/blog/una-nota
//   npm run indexnow -- --listar      # muestra qué mandaría, sin mandar nada

import { readFileSync } from 'node:fs'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dahila.uy').replace(/\/+$/, '')
const HOST = new URL(SITE_URL).host

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z-]+)(?:=(.+))?$/i)
  if (m) args[m[1]] = m[2] ?? true
}

// Única fuente de verdad de la llave: el mismo archivo que usa el sitio.
function leerLlave() {
  const src = readFileSync('src/lib/indexnow.ts', 'utf8')
  const m = src.match(/INDEXNOW_KEY\s*=\s*'([a-f0-9]{8,64})'/i)
  if (!m) throw new Error('No encontré INDEXNOW_KEY en src/lib/indexnow.ts')
  return m[1]
}

async function urlsDelSitemap() {
  const xml = await (await fetch(`${SITE_URL}/sitemap.xml`)).text()
  const bloques = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((b) => b[1])
  const filas = bloques.map((b) => ({
    url: (b.match(/<loc>\s*([^<\s]+)\s*<\/loc>/) ?? [])[1],
    lastmod: (b.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/) ?? [])[1] ?? '',
  })).filter((f) => f.url)
  filas.sort((a, b) => (b.lastmod || '').localeCompare(a.lastmod || ''))
  return filas
}

async function main() {
  const key = leerLlave()

  // Si el archivo de la llave no responde, IndexNow rechaza todo en silencio.
  const keyUrl = `${SITE_URL}/${key}.txt`
  const res = await fetch(keyUrl)
  const contenido = (await res.text()).trim()
  if (!res.ok || contenido !== key) {
    console.error(`\n🛑  ${keyUrl} no devuelve la llave (HTTP ${res.status}). Sin eso IndexNow ignora los avisos.\n`)
    process.exit(1)
  }

  let urls
  if (typeof args.url === 'string') {
    urls = [args.url]
  } else {
    const filas = await urlsDelSitemap()
    const n = Number(args.ultimas)
    urls = (n > 0 ? filas.slice(0, n) : filas).map((f) => f.url)
  }
  if (urls.length === 0) {
    console.error('No hay URLs para avisar.')
    process.exit(1)
  }

  console.log(`IndexNow · ${urls.length} URL${urls.length === 1 ? '' : 's'} de ${HOST}`)
  for (const u of urls.slice(0, 10)) console.log(`   ${u.replace(SITE_URL, '') || '/'}`)
  if (urls.length > 10) console.log(`   … y ${urls.length - 10} más`)

  if (args.listar) {
    console.log('\n(--listar: no se mandó nada)')
    return
  }

  const envio = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: keyUrl, urlList: urls }),
  })
  // 200 y 202 son las dos respuestas buenas (202 = recibido, la llave se
  // verifica después). 422 suele ser una URL de otro dominio en la lista.
  if (envio.status === 200 || envio.status === 202) {
    console.log(`\n✅  Avisado (HTTP ${envio.status}). Bing y compañía lo procesan en las próximas horas.`)
  } else {
    console.error(`\n⚠️  IndexNow respondió ${envio.status}: ${(await envio.text()).slice(0, 200)}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
