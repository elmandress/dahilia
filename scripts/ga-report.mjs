#!/usr/bin/env node
// scripts/ga-report.mjs — informe de Google Analytics sin entrar al panel.
//
// Por qué existe: hasta ahora, para saber cómo venían las visitas había que
// entrar a GA4 y mandar capturas. La API de datos de Analytics es gratis (hay
// límite de consultas por hora, no de plata) y con la MISMA cuenta de servicio
// que ya usa seo-report se puede leer todo, solo lectura.
//
// Dos pasos, una sola vez:
//   1. Google Cloud (el mismo proyecto de Search Console) → APIs y servicios →
//      Biblioteca → habilitar "Google Analytics Data API" y
//      "Google Analytics Admin API".
//   2. GA4 → Administrar → Gestión de accesos a la propiedad → "+" → agregar el
//      mail de la cuenta de servicio con rol "Lector". Si falta este paso, el
//      script te dice exactamente qué mail agregar.
//
// Uso:
//   npm run ga                   # últimos 28 días
//   npm run ga -- --dias=7
//   npm run ga -- --propiedad=123456789     # si hay más de una propiedad
//   npm run ga -- --key=C:/claves/sa.json
//
// Solo lee. Nunca escribe nada en Analytics.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createPrivateKey, sign as cryptoSign } from 'node:crypto'
import path from 'node:path'

const DEFAULT_KEY_PATH = '.secrets/google-indexing-sa.json'
const TOKEN_URI = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const DATA_API = 'https://analyticsdata.googleapis.com/v1beta'
const ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta'
const OUT_DIR = 'research/mediciones'
const DAY = 864e5

const args = {}
for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([a-z-]+)(?:=(.+))?$/i)
  if (m) args[m[1]] = m[2] ?? true
}

const int = (n) => Math.round(Number(n ?? 0)).toLocaleString('es-UY')
const fmt = (d) => d.toISOString().slice(0, 10)
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|')

function leerCuenta() {
  const keyPath = typeof args.key === 'string' ? args.key : DEFAULT_KEY_PATH
  try {
    // El BOM de un archivo guardado desde Windows rompe el JSON.parse.
    return JSON.parse(readFileSync(keyPath, 'utf8').replace(/^\uFEFF/, ''))
  } catch {
    console.error(`\n🛑  No pude leer la clave en ${keyPath}.\n   Pasá la ruta con --key=... o dejala en ${DEFAULT_KEY_PATH}.\n`)
    process.exit(1)
  }
}

async function getToken(sa) {
  const now = Math.floor(Date.now() / 1000)
  const b64 = (o) => Buffer.from(JSON.stringify(o), 'utf8').toString('base64url')
  const seg = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope: SCOPE, aud: TOKEN_URI, iat: now, exp: now + 3600 })}`
  const sig = cryptoSign('RSA-SHA256', Buffer.from(seg, 'utf8'), createPrivateKey({ key: sa.private_key, format: 'pem' }))
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${seg}.${sig.toString('base64url')}` }),
  })
  const data = await res.json().catch(() => ({}))
  if (!data.access_token) throw new Error(`Google no entregó el token (${res.status}): ${JSON.stringify(data).slice(0, 200)}`)
  return data.access_token
}

/** Traduce los errores que se repiten a qué hay que hacer. */
function explicar(status, body, email) {
  const msg = body?.error?.message ?? ''
  if (status === 403 && /permission|caller does not have/i.test(msg)) {
    return `La cuenta de servicio todavía no tiene acceso a GA4.\n   GA4 → Administrar → Gestión de accesos a la propiedad → "+" → agregar:\n   ${email}\n   con rol "Lector".`
  }
  if (status === 403 && /has not been used|disabled/i.test(msg)) {
    return `Falta habilitar la API en Google Cloud:\n   ${msg.slice(0, 220)}`
  }
  if (status === 429) return 'GA4 cortó por límite de consultas por hora. Probá de nuevo más tarde.'
  return `${status}: ${msg.slice(0, 220)}`
}

async function api(token, url, body, email) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(explicar(res.status, json, email))
  return json
}

/** Una tabla simple: dimensión + métricas. */
function tabla(res, titulo, columnas) {
  const filas = res?.rows ?? []
  const L = ['', `## ${titulo}`, '']
  if (!filas.length) return [...L, 'Sin datos en el período.']
  L.push(`| ${columnas.join(' | ')} |`, `|${columnas.map(() => '---').join('|')}|`)
  for (const f of filas) {
    const dims = (f.dimensionValues ?? []).map((d) => cell(d.value))
    const mets = (f.metricValues ?? []).map((m) => int(m.value))
    L.push(`| ${[...dims, ...mets].join(' | ')} |`)
  }
  return L
}

async function main() {
  const sa = leerCuenta()
  const email = sa.client_email
  const token = await getToken(sa)
  const dias = Number(args.dias) || 28
  const hasta = new Date(Date.now() - DAY)
  const desde = new Date(hasta.getTime() - (dias - 1) * DAY)
  const rango = [{ startDate: fmt(desde), endDate: fmt(hasta) }]

  // Propiedad: la que digan por parámetro, o la única que ve esta cuenta.
  let propiedad = typeof args.propiedad === 'string' ? `properties/${args.propiedad}` : null
  let nombre = ''
  if (!propiedad) {
    const sum = await api(token, `${ADMIN_API}/accountSummaries`, null, email)
    const props = (sum.accountSummaries ?? []).flatMap((a) => a.propertySummaries ?? [])
    if (props.length === 0) {
      throw new Error(`Esta cuenta de servicio no ve ninguna propiedad de GA4.\n   Agregá ${email} como "Lector" en GA4 → Administrar → Gestión de accesos a la propiedad.`)
    }
    if (props.length > 1) {
      console.log('Propiedades visibles:')
      for (const p of props) console.log(`   ${p.property.replace('properties/', '')} · ${p.displayName}`)
      console.log('Elegí una con --propiedad=<número>.')
    }
    propiedad = props[0].property
    nombre = props[0].displayName ?? ''
  }

  console.log(`📈  ${nombre || propiedad} · ${fmt(desde)} → ${fmt(hasta)}`)

  const pedir = (body) => api(token, `${DATA_API}/${propiedad}:runReport`, { dateRanges: rango, ...body }, email)

  const [totales, canales, paginas, eventos, ciudades] = await Promise.all([
    pedir({ metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'keyEvents' }] }),
    pedir({ dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'keyEvents' }], limit: 12 }),
    pedir({ dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }], limit: 20, orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] }),
    pedir({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], limit: 20, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }] }),
    pedir({ dimensions: [{ name: 'city' }], metrics: [{ name: 'activeUsers' }], limit: 8, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }] }),
  ])

  const t = totales.rows?.[0]?.metricValues ?? []
  const hoy = fmt(new Date())
  const L = [
    `# Google Analytics — ${hoy}`, '',
    `Propiedad \`${nombre || propiedad}\`. Período: ${fmt(desde)} a ${fmt(hasta)} (${dias} días).`, '',
    '| Usuarios | Sesiones | Vistas | Eventos clave |', '|---|---|---|---|',
    `| ${int(t[0]?.value)} | ${int(t[1]?.value)} | ${int(t[2]?.value)} | ${int(t[3]?.value)} |`,
    ...tabla(canales, 'De dónde llegan', ['Canal', 'Sesiones', 'Usuarios', 'Eventos clave']),
    ...tabla(paginas, 'Páginas más vistas', ['Página', 'Vistas', 'Usuarios']),
    ...tabla(eventos, 'Eventos', ['Evento', 'Veces']),
    ...tabla(ciudades, 'Ciudades', ['Ciudad', 'Usuarios']),
    '', '_Generado con `npm run ga`. Solo lectura._', '',
  ]

  mkdirSync(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, `ga-${hoy}.md`)
  writeFileSync(file, L.join('\n'))
  console.log(`   Usuarios: ${int(t[0]?.value)} · Sesiones: ${int(t[1]?.value)} · Eventos clave: ${int(t[3]?.value)}`)
  console.log(`\n✅  Informe: ${file}`)
}

main().catch((err) => {
  console.error(`\n🛑  ${err.message}\n`)
  process.exit(1)
})
