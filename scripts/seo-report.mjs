#!/usr/bin/env node
// scripts/seo-report.mjs — informe mensual de Search Console, sin entrar al panel.
//
// Usa la misma cuenta de servicio que scripts/index-urls.mjs (figura como
// Propietaria de la propiedad en Search Console) y solo LEE datos:
//   - clics, impresiones, CTR y posición: últimos 28 días vs. los 28 anteriores;
//   - las búsquedas y las páginas que más traen;
//   - las búsquedas con la marca (dahila / dalia / dahlia): la señal de si
//     Google ya aprendió que "Dahila" es una marca y no un error de tipeo;
//   - cuántas URLs del sitemap tiene indexadas Google (URL Inspection API).
// Deja el informe en research/mediciones/ y suma una fila al historial CSV.
//
// Requisito, una sola vez: habilitar "Google Search Console API" en el
// proyecto de Google Cloud de la cuenta de servicio. Si falta, el script lo
// avisa con el link para habilitarla.
//
// Uso:
//   npm run seo-report
//   npm run seo-report -- --no-inspect         # sin revisar la indexación (más rápido)
//   npm run seo-report -- --detalle            # además: seo-detalle-FECHA.md con todas las
//                                              # páginas, 200 búsquedas, búsquedas por página,
//                                              # dispositivos, evolución diaria, oportunidades
//                                              # y la indexación URL por URL
//   npm run seo-report -- --key=C:/claves/sa.json
//
// El informe de IA generativa de Search Console y el de Bing no los lee este
// script: se miran en cada panel (research/seo-ia-2026-09.md, §5).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createPrivateKey, sign as cryptoSign } from 'node:crypto'
import path from 'node:path'

// ─── Config ───────────────────────────────────────────────────────────────────

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dahila.uy').replace(/\/+$/, '')
const DEFAULT_KEY_PATH = '.secrets/google-indexing-sa.json'
const TOKEN_URI = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const API = 'https://searchconsole.googleapis.com'
const OUT_DIR = 'research/mediciones'
// Variantes con las que se busca la marca (sintaxis RE2 de la API).
const BRAND_REGEX = 'dah|dali|dahl'
const DAY = 864e5

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const fmt = (d) => d.toISOString().slice(0, 10)
const int = (n) => Math.round(n ?? 0).toLocaleString('es-UY')
const pct = (n) => ((n ?? 0) * 100).toFixed(1).replace('.', ',') + '%'
const posi = (n) => (n ? n.toFixed(1).replace('.', ',') : '—')
function change(now, before) {
  if (!before) return now ? 'nuevo' : '—'
  const d = Math.round(((now - before) / before) * 100)
  return (d >= 0 ? '+' : '') + d + '%'
}
const cell = (s) => String(s).replace(/\|/g, '\\|')

function parseArgs(argv) {
  const args = {}
  for (const arg of argv.slice(2)) {
    const m = arg.match(/^--([a-z-]+)(?:=(.+))?$/i)
    if (m) args[m[1]] = m[2] ?? true
  }
  return args
}

/** Si la clave está dentro del repo, exige que git la ignore (mismo criterio que index-urls). */
function assertKeyProtected(keyPath) {
  if (!existsSync(keyPath)) return
  const rel = path.relative(process.cwd(), path.resolve(keyPath))
  if (rel.startsWith('..') || path.isAbsolute(rel)) return
  try {
    execFileSync('git', ['check-ignore', '-q', rel], { stdio: 'ignore' })
  } catch (err) {
    if (err.status !== 1) return
    console.error(`\n🛑  La clave está dentro del repo y git NO la ignora: ${keyPath}\n   Movela a .secrets/ (ignorada) antes de seguir.\n`)
    process.exit(1)
  }
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000)
  const b64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url')
  const segments = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope: SCOPE, aud: TOKEN_URI, iat: now, exp: now + 3600 })}`
  const signature = cryptoSign('RSA-SHA256', Buffer.from(segments, 'utf8'), createPrivateKey({ key: sa.private_key, format: 'pem' }))
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${segments}.${signature.toString('base64url')}` }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) throw new Error(`Google no entregó el token (${res.status}): ${JSON.stringify(data)}`)
  return data.access_token
}

/** Llamada a la API; traduce los errores que se repiten a qué hacer. */
async function api(token, url, body) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (res.ok) return json
  const msg = json.error?.message || `HTTP ${res.status}`
  if (/has not been used|is disabled|SERVICE_DISABLED/i.test(msg)) {
    const link = msg.match(/https:\/\/console\.developers\.google\.com\/\S+/)?.[0]?.replace(/[.,)]+$/, '')
    throw new Error(
      'La API de Search Console no está habilitada en el proyecto de Google Cloud.\n' +
      `   Habilitala con un clic: ${link ?? 'Google Cloud Console → APIs y servicios → Biblioteca → "Google Search Console API"'}\n` +
      '   y volvé a correr el script en unos minutos.',
    )
  }
  if (res.status === 403) {
    throw new Error(`Sin permiso: ${msg}\n   La cuenta de servicio tiene que figurar en Search Console → Configuración → Usuarios y permisos.`)
  }
  throw new Error(msg)
}

async function findProperty(token) {
  const { siteEntry = [] } = await api(token, `${API}/webmasters/v3/sites`)
  const host = new URL(SITE_URL).hostname
  const pick = siteEntry.find((e) => e.siteUrl === `sc-domain:${host}`)
    ?? siteEntry.find((e) => e.siteUrl.replace(/\/$/, '') === SITE_URL)
  if (!pick) {
    throw new Error(`La cuenta de servicio no ve la propiedad de ${host}. Propiedades visibles: ${siteEntry.map((e) => e.siteUrl).join(', ') || 'ninguna'}`)
  }
  return pick.siteUrl
}

async function searchAnalytics(token, site, range, dimensions = [], opts = {}) {
  const body = { ...range, dimensions, rowLimit: opts.rowLimit ?? 25 }
  if (opts.type) body.type = opts.type // 'image' = Google Imágenes (por defecto, web)
  if (opts.brand) {
    body.dimensionFilterGroups = [{ filters: [{ dimension: 'query', operator: 'includingRegex', expression: BRAND_REGEX }] }]
  }
  const json = await api(token, `${API}/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, body)
  return json.rows ?? []
}

const totalsOf = (rows) => rows[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 }

async function sitemapUrls() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`)
  if (!res.ok) return []
  const xml = await res.text()
  return [...xml.matchAll(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'))
}

async function inspect(token, site, url) {
  const json = await api(token, `${API}/v1/urlInspection/index:inspect`, { inspectionUrl: url, siteUrl: site, languageCode: 'es' })
  const s = json.inspectionResult?.indexStatusResult ?? {}
  return { url, verdict: s.verdict ?? 'VERDICT_UNSPECIFIED', coverage: s.coverageState ?? '', lastCrawl: s.lastCrawlTime ?? '' }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv)
  const keyPath = typeof args.key === 'string' ? args.key : process.env.GOOGLE_INDEXING_KEY_FILE ?? DEFAULT_KEY_PATH
  assertKeyProtected(keyPath)
  if (!existsSync(keyPath)) {
    console.error(`\n❌  No encontré la clave de la cuenta de servicio en ${keyPath} (ver scripts/index-urls.mjs).\n`)
    process.exit(1)
  }
  const sa = JSON.parse(readFileSync(keyPath, 'utf8').replace(/^\uFEFF/, ''))
  const token = await getAccessToken(sa)
  const site = await findProperty(token)

  const end = new Date(Date.now() - 3 * DAY) // Search Console tarda ~2-3 días en consolidar
  const cur = { startDate: fmt(new Date(end.getTime() - 27 * DAY)), endDate: fmt(end) }
  const prev = { startDate: fmt(new Date(end.getTime() - 55 * DAY)), endDate: fmt(new Date(end.getTime() - 28 * DAY)) }
  console.log(`📊  ${site} · ${cur.startDate} → ${cur.endDate} (vs. ${prev.startDate} → ${prev.endDate})`)

  // Sitemaps enviados a Search Console (solo lectura): si el sitemap no está
  // enviado, o Google no lo lee hace semanas, las URLs nuevas se descubren tarde.
  const sitemaps = await api(token, `${API}/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps`)
    .then((j) => j.sitemap ?? [])
    .catch((err) => [{ path: `ERROR: ${err.message.split('\n')[0]}` }])

  const [curT, prevT, brandT, brandPrevT, queries, brandQueries, pages, countries] = await Promise.all([
    searchAnalytics(token, site, cur).then(totalsOf),
    searchAnalytics(token, site, prev).then(totalsOf),
    searchAnalytics(token, site, cur, [], { brand: true }).then(totalsOf),
    searchAnalytics(token, site, prev, [], { brand: true }).then(totalsOf),
    searchAnalytics(token, site, cur, ['query'], { rowLimit: 25 }),
    searchAnalytics(token, site, cur, ['query'], { rowLimit: 20, brand: true }),
    searchAnalytics(token, site, cur, ['page'], { rowLimit: 15 }),
    searchAnalytics(token, site, cur, ['country'], { rowLimit: 5 }),
  ])

  // Indexación de cada URL del sitemap (1 llamada por URL; cuota: 2.000 por día).
  let inspected = []
  if (!args['no-inspect']) {
    const urls = await sitemapUrls()
    console.log(`🔎  Revisando la indexación de ${urls.length} URLs del sitemap…`)
    for (const url of urls) {
      try {
        inspected.push(await inspect(token, site, url))
      } catch (err) {
        inspected.push({ url, verdict: 'ERROR', coverage: err.message.split('\n')[0], lastCrawl: '' })
      }
      await sleep(150)
    }
  }
  const indexed = inspected.filter((r) => r.verdict === 'PASS')
  const notIndexed = inspected.filter((r) => r.verdict !== 'PASS')

  // --detalle: todo lo que hace falta para decidir qué explotar y qué mejorar.
  let det = null
  if (args.detalle) {
    const [pagesAll, queriesAll, pageQuery, devices, byDate, imagePages] = await Promise.all([
      searchAnalytics(token, site, cur, ['page'], { rowLimit: 100 }),
      searchAnalytics(token, site, cur, ['query'], { rowLimit: 200 }),
      searchAnalytics(token, site, cur, ['page', 'query'], { rowLimit: 500 }),
      searchAnalytics(token, site, cur, ['device'], { rowLimit: 5 }),
      searchAnalytics(token, site, cur, ['date'], { rowLimit: 60 }),
      searchAnalytics(token, site, cur, ['page'], { rowLimit: 25, type: 'image' }),
    ])
    det = { pagesAll, queriesAll, pageQuery, devices, byDate, imagePages }
  }

  // ─── Informe en Markdown ───
  const today = fmt(new Date())
  const L = []
  L.push(`# Search Console — ${today}`, '')
  L.push(`Propiedad \`${site}\`. Período: ${cur.startDate} a ${cur.endDate}, comparado con ${prev.startDate} a ${prev.endDate}.`, '')
  L.push('| | Últimos 28 días | 28 anteriores | Cambio |', '|---|---|---|---|')
  L.push(`| Clics | ${int(curT.clicks)} | ${int(prevT.clicks)} | ${change(curT.clicks, prevT.clicks)} |`)
  L.push(`| Impresiones | ${int(curT.impressions)} | ${int(prevT.impressions)} | ${change(curT.impressions, prevT.impressions)} |`)
  L.push(`| CTR | ${pct(curT.ctr)} | ${pct(prevT.ctr)} | |`)
  L.push(`| Posición media | ${posi(curT.position)} | ${posi(prevT.position)} | |`, '')
  L.push('## Búsquedas con la marca (dahila / dalia / dahlia)', '')
  L.push(`${int(brandT.clicks)} clics y ${int(brandT.impressions)} impresiones (antes: ${int(brandPrevT.clicks)} y ${int(brandPrevT.impressions)}). Si crecen, Google está aprendiendo que "Dahila" es una marca.`, '')
  if (brandQueries.length) {
    L.push('| Búsqueda | Clics | Impresiones | Posición |', '|---|---|---|---|')
    for (const r of brandQueries) L.push(`| ${cell(r.keys[0])} | ${int(r.clicks)} | ${int(r.impressions)} | ${posi(r.position)} |`)
    L.push('')
  }
  L.push('## Búsquedas que más traen', '')
  if (queries.length) {
    L.push('| Búsqueda | Clics | Impresiones | Posición |', '|---|---|---|---|')
    for (const r of queries) L.push(`| ${cell(r.keys[0])} | ${int(r.clicks)} | ${int(r.impressions)} | ${posi(r.position)} |`)
  } else {
    L.push('Sin datos en el período.')
  }
  L.push('', '## Páginas que más traen', '')
  if (pages.length) {
    L.push('| Página | Clics | Impresiones | Posición |', '|---|---|---|---|')
    for (const r of pages) L.push(`| ${cell(r.keys[0].replace(SITE_URL, '') || '/')} | ${int(r.clicks)} | ${int(r.impressions)} | ${posi(r.position)} |`)
  } else {
    L.push('Sin datos en el período.')
  }
  L.push('', '## Sitemaps enviados a Search Console', '')
  if (sitemaps.length) {
    L.push('| Sitemap | Enviado | Leído por Google | Pendiente | Errores | Advertencias |', '|---|---|---|---|---|---|')
    for (const s of sitemaps) {
      L.push(`| ${cell(s.path ?? '')} | ${(s.lastSubmitted ?? '—').slice(0, 10)} | ${(s.lastDownloaded ?? '—').slice(0, 10)} | ${s.isPending ? 'sí' : 'no'} | ${s.errors ?? 0} | ${s.warnings ?? 0} |`)
    }
  } else {
    L.push(`**No hay ningún sitemap enviado.** Search Console → Sitemaps → agregar \`${SITE_URL}/sitemap.xml\`.`)
  }
  L.push('', '## Países', '')
  L.push(countries.length ? countries.map((r) => `${r.keys[0].toUpperCase()}: ${int(r.clicks)} clics, ${int(r.impressions)} impresiones`).join(' · ') : 'Sin datos en el período.')
  if (inspected.length) {
    L.push('', `## Indexación: ${indexed.length} de ${inspected.length} URLs del sitemap indexadas`, '')
    if (notIndexed.length) {
      L.push('| URL | Estado |', '|---|---|')
      for (const r of notIndexed) L.push(`| ${cell(r.url.replace(SITE_URL, '') || '/')} | ${cell(r.coverage || r.verdict)} |`)
    } else {
      L.push('Todas indexadas.')
    }
  }
  L.push('', '_Generado con `npm run seo-report`. El informe de IA generativa de Search Console y el de Bing se miran en cada panel._', '')

  mkdirSync(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, `seo-${today}.md`)
  writeFileSync(file, L.join('\n'))

  if (det) {
    const rel = (u) => cell(u.replace(SITE_URL, '') || '/')
    const D = []
    D.push(`# Search Console, detalle — ${today}`, '')
    D.push(`Propiedad \`${site}\`. Período: ${cur.startDate} a ${cur.endDate}. Complementa a \`seo-${today}.md\`.`, '')
    D.push('## Dispositivos', '')
    D.push(det.devices.length ? det.devices.map((r) => `${r.keys[0]}: ${int(r.clicks)} clics, ${int(r.impressions)} impresiones, CTR ${pct(r.ctr)}, posición ${posi(r.position)}`).join(' · ') : 'Sin datos.')
    D.push('', '## Día por día', '', '| Fecha | Clics | Impresiones |', '|---|---|---|')
    for (const r of det.byDate) D.push(`| ${r.keys[0]} | ${int(r.clicks)} | ${int(r.impressions)} |`)
    D.push('', '## Todas las páginas con impresiones (por impresiones)', '', '| Página | Clics | Impresiones | CTR | Posición |', '|---|---|---|---|---|')
    for (const r of [...det.pagesAll].sort((a, b) => b.impressions - a.impressions)) {
      D.push(`| ${rel(r.keys[0])} | ${int(r.clicks)} | ${int(r.impressions)} | ${pct(r.ctr)} | ${posi(r.position)} |`)
    }
    // Google Imágenes va aparte: con prendas, la foto es parte de cómo se busca.
    D.push('', '## Google Imágenes: páginas cuyas fotos aparecen', '')
    if (det.imagePages.length) {
      D.push('| Página | Clics | Impresiones | Posición |', '|---|---|---|---|')
      for (const r of [...det.imagePages].sort((a, b) => b.impressions - a.impressions)) {
        D.push(`| ${rel(r.keys[0])} | ${int(r.clicks)} | ${int(r.impressions)} | ${posi(r.position)} |`)
      }
    } else {
      D.push('Sin impresiones en Google Imágenes en el período.')
    }
    D.push('', '## Búsquedas (hasta 200, por impresiones)', '', '| Búsqueda | Clics | Impresiones | CTR | Posición |', '|---|---|---|---|---|')
    for (const r of [...det.queriesAll].sort((a, b) => b.impressions - a.impressions)) {
      D.push(`| ${cell(r.keys[0])} | ${int(r.clicks)} | ${int(r.impressions)} | ${pct(r.ctr)} | ${posi(r.position)} |`)
    }
    D.push('', '## Qué búsquedas traen a cada página (hasta 8 por página)', '')
    const byPage = new Map()
    for (const r of det.pageQuery) {
      const list = byPage.get(r.keys[0]) ?? []
      list.push(r)
      byPage.set(r.keys[0], list)
    }
    const pageOrder = [...byPage.entries()].sort((a, b) => b[1].reduce((n, r) => n + r.impressions, 0) - a[1].reduce((n, r) => n + r.impressions, 0))
    for (const [page, rows] of pageOrder) {
      D.push(`**${rel(page)}**: ` + rows.sort((a, b) => b.impressions - a.impressions).slice(0, 8)
        .map((r) => `${cell(r.keys[1])} (${int(r.impressions)} imp, pos ${posi(r.position)}${r.clicks ? `, ${int(r.clicks)} clic${r.clicks > 1 ? 's' : ''}` : ''})`).join(' · '))
    }
    // Cerca de la primera página y con impresiones: donde un mejor título, un
    // mejor snippet o más contenido pueden mover clics sin empezar de cero.
    const opps = det.pageQuery
      .filter((r) => r.position >= 3 && r.position <= 15 && r.impressions >= 3)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 40)
    D.push('', '## Oportunidades: posición 3 a 15, con 3 impresiones o más', '')
    if (opps.length) {
      D.push('| Página | Búsqueda | Impresiones | Clics | Posición |', '|---|---|---|---|---|')
      for (const r of opps) D.push(`| ${rel(r.keys[0])} | ${cell(r.keys[1])} | ${int(r.impressions)} | ${int(r.clicks)} | ${posi(r.position)} |`)
    } else {
      D.push('Ninguna en el período.')
    }
    if (inspected.length) {
      D.push('', '## Indexación URL por URL', '', '| URL | Veredicto | Estado | Último rastreo |', '|---|---|---|---|')
      for (const r of inspected) D.push(`| ${rel(r.url)} | ${r.verdict} | ${cell(r.coverage)} | ${r.lastCrawl ? r.lastCrawl.slice(0, 10) : '—'} |`)
    }
    D.push('', '_Generado con `npm run seo-report -- --detalle`._', '')
    writeFileSync(path.join(OUT_DIR, `seo-detalle-${today}.md`), D.join('\n'))
  }

  // Una fila por día: si el informe se corre dos veces el mismo día, la segunda
  // reemplaza a la primera (antes quedaban filas duplicadas). Si esta corrida
  // no revisó la indexación (--no-inspect), conserva la de la anterior.
  const csv = path.join(OUT_DIR, 'historial.csv')
  const header = 'fecha,desde,hasta,clics,impresiones,ctr,posicion,clics_marca,impresiones_marca,indexadas,urls_revisadas'
  const rows = existsSync(csv) ? readFileSync(csv, 'utf8').split(/\r?\n/).filter((l) => l && l !== header) : []
  const earlierToday = rows.find((l) => l.startsWith(`${today},`))?.split(',')
  const row = [
    today, cur.startDate, cur.endDate, curT.clicks, curT.impressions, (curT.ctr ?? 0).toFixed(4), (curT.position ?? 0).toFixed(1),
    brandT.clicks, brandT.impressions,
    inspected.length ? indexed.length : (earlierToday?.[9] ?? ''),
    inspected.length || (earlierToday?.[10] ?? ''),
  ].join(',')
  writeFileSync(csv, [header, ...rows.filter((l) => !l.startsWith(`${today},`)), row].join('\n') + '\n')

  console.log(`\n   Clics: ${int(curT.clicks)} (${change(curT.clicks, prevT.clicks)}) · Impresiones: ${int(curT.impressions)} (${change(curT.impressions, prevT.impressions)}) · Posición: ${posi(curT.position)}`)
  console.log(`   Marca: ${int(brandT.clicks)} clics / ${int(brandT.impressions)} impresiones`)
  if (inspected.length) console.log(`   Indexadas: ${indexed.length} de ${inspected.length}`)
  console.log(`\n✅  Informe: ${file}\n   Historial: ${csv}`)
}

main().catch((err) => {
  console.error(`\n💥  ${err.message}`)
  process.exit(1)
})
