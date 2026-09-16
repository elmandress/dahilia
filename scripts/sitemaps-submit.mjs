#!/usr/bin/env node
// scripts/sitemaps-submit.mjs — (re)envía a Search Console el sitemap y el RSS del blog.
//
// La API de indexación de Google no sirve para esta tienda (solo procesa avisos
// de empleo y transmisiones en vivo: ver index-urls.mjs), y Search Console no
// tiene API para "Solicitar indexación". Lo que sí se puede automatizar es
// avisarle que un sitemap cambió: al reenviarlo, Google lo vuelve a leer y
// encuentra las URLs nuevas. Conviene correrlo después de un deploy que suma
// páginas (notas nuevas, productos nuevos).
//
// Uso:
//   npm run sitemaps               # reenvía sitemap.xml y blog/feed.xml
//   npm run sitemaps -- --listar   # solo muestra el estado, no envía nada
//
// Credenciales: la misma cuenta de servicio que seo-report e index-urls
// (.secrets/google-indexing-sa.json, o GOOGLE_INDEXING_KEY_FILE / --key). Tiene
// que ser Propietario de la propiedad en Search Console. La clave no se imprime.

import { readFileSync, existsSync } from 'node:fs'
import { createPrivateKey, sign as cryptoSign } from 'node:crypto'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dahila.uy').replace(/\/+$/, '')
const PROPERTY = `sc-domain:${new URL(SITE_URL).hostname}`
const FEEDS = [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/blog/feed.xml`]
const TOKEN_URI = 'https://oauth2.googleapis.com/token'
const API = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/sitemaps`

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([a-z-]+)(?:=(.+))?$/i)
  return m ? [m[1], m[2] ?? true] : [a, true]
}))
const keyPath = typeof args.key === 'string' ? args.key : process.env.GOOGLE_INDEXING_KEY_FILE ?? '.secrets/google-indexing-sa.json'

async function token(scope) {
  if (!existsSync(keyPath)) throw new Error(`No encuentro la clave en ${keyPath}`)
  // Sin el BOM que a veces agrega Windows al guardar el JSON.
  const sa = JSON.parse(readFileSync(keyPath, 'utf8').replace(/^\uFEFF/, ''))
  const now = Math.floor(Date.now() / 1000)
  const b64 = (o) => Buffer.from(JSON.stringify(o), 'utf8').toString('base64url')
  const seg = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope, aud: TOKEN_URI, iat: now, exp: now + 3600 })}`
  const sig = cryptoSign('RSA-SHA256', Buffer.from(seg, 'utf8'), createPrivateKey({ key: sa.private_key, format: 'pem' })).toString('base64url')
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${seg}.${sig}` }),
  })
  const data = await res.json().catch(() => ({}))
  if (!data.access_token) throw new Error(`Google no entregó el token (${res.status})`)
  return data.access_token
}

async function list(tok) {
  const res = await fetch(API, { headers: { Authorization: `Bearer ${tok}` } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json.sitemap ?? []
}

async function main() {
  const listOnly = !!args.listar
  const tok = await token(listOnly ? 'https://www.googleapis.com/auth/webmasters.readonly' : 'https://www.googleapis.com/auth/webmasters')

  if (!listOnly) {
    for (const feed of FEEDS) {
      // Solo se envía lo que ya está en línea: un feed que todavía da 404
      // (por ejemplo, antes del deploy que lo crea) quedaría con error.
      const live = await fetch(feed).then((r) => r.ok, () => false)
      if (!live) { console.log(`⏭  ${feed}: todavía no responde, no lo envío`); continue }
      const res = await fetch(`${API}/${encodeURIComponent(feed)}`, { method: 'PUT', headers: { Authorization: `Bearer ${tok}` } })
      if (res.ok) console.log(`✅  Enviado: ${feed}`)
      else {
        const json = await res.json().catch(() => ({}))
        console.log(`❌  ${feed}: ${json.error?.message || `HTTP ${res.status}`}`)
      }
    }
  }

  console.log('\nSitemaps en Search Console:')
  for (const s of await list(tok)) {
    const urls = (s.contents ?? []).map((c) => `${c.submitted} ${c.type}`).join(', ')
    console.log(`   ${s.path}  enviado ${String(s.lastSubmitted ?? '—').slice(0, 10)} · leído ${String(s.lastDownloaded ?? '—').slice(0, 10)} · ${s.isPending ? 'pendiente' : 'procesado'} · errores ${s.errors ?? 0}${urls ? ` · ${urls}` : ''}`)
  }
}

main().catch((err) => {
  console.error(`\n💥  ${err.message}`)
  process.exit(1)
})
