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

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createPrivateKey, sign as cryptoSign } from 'node:crypto'
import path from 'node:path'

const DEFAULT_KEY_PATH = '.secrets/google-indexing-sa.json'
const TOKEN_URI = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const DATA_API = 'https://analyticsdata.googleapis.com/v1beta'
const ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta'
const OUT_DIR = 'research/mediciones'
const DAY = 864e5

// Ciudades con centros de datos de Meta (CRO-15, 04/11/2026). Con la campaña
// paga, GA4 cuenta como "usuarios" a los robots de Meta que revisan cada
// anuncio: el 02-03/11 fueron 19 de 119 (Prineville 8, Fort Worth 5, Luleå 4,
// Altoona 2). Inflan el embudo y bajan el costo por vista de prenda, así que
// la campaña se mide con el embudo de Uruguay. GA4 escribe "Lulea" sin tilde.
const CIUDADES_META = [
  'Prineville', 'Fort Worth', 'Luleå', 'Lulea', 'Altoona', 'Forest City', 'Clonee', 'Odense',
  'Los Lunas', 'New Albany', 'Papillion', 'Henrico', 'Eagle Mountain',
]
// Los pasos del embudo, con el evento de GA4 que los marca.
const EMBUDO = [
  ['Vieron una prenda', 'view_item'],
  ['Agregaron al carrito', 'add_to_cart'],
  ['Mandaron el pedido', 'begin_checkout'],
]
const SOLO_URUGUAY = { filter: { fieldName: 'country', stringFilter: { matchType: 'EXACT', value: 'Uruguay' } } }
const DEL_EMBUDO = { filter: { fieldName: 'eventName', inListFilter: { values: EMBUDO.map(([, e]) => e) } } }

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

  const [totales, canales, paginas, eventos, ciudades, uruguay, embudoTotal, embudoUruguay, ciudadesMeta] = await Promise.all([
    pedir({ metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'keyEvents' }] }),
    pedir({ dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'keyEvents' }], limit: 12 }),
    pedir({ dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }], limit: 20, orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] }),
    pedir({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], limit: 20, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }] }),
    pedir({ dimensions: [{ name: 'city' }], metrics: [{ name: 'activeUsers' }], limit: 8, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }] }),
    // Embudo: usuarios de Uruguay, y usuarios por paso, en total y de Uruguay.
    pedir({ metrics: [{ name: 'activeUsers' }], dimensionFilter: SOLO_URUGUAY }),
    pedir({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'activeUsers' }], dimensionFilter: DEL_EMBUDO }),
    pedir({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'activeUsers' }], dimensionFilter: { andGroup: { expressions: [DEL_EMBUDO, SOLO_URUGUAY] } } }),
    pedir({ dimensions: [{ name: 'city' }], metrics: [{ name: 'activeUsers' }], dimensionFilter: { filter: { fieldName: 'city', inListFilter: { values: CIUDADES_META } } }, limit: 20, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }] }),
  ])

  const t = totales.rows?.[0]?.metricValues ?? []
  const hoy = fmt(new Date())

  // Uruguay + resto = total, por construcción: el resto es la diferencia.
  const usuarios = Number(t[0]?.value ?? 0)
  const usuariosUy = Number(uruguay.rows?.[0]?.metricValues?.[0]?.value ?? 0)
  const porEvento = (res) => Object.fromEntries((res?.rows ?? []).map((f) => [f.dimensionValues?.[0]?.value, Number(f.metricValues?.[0]?.value ?? 0)]))
  const pasosTotal = porEvento(embudoTotal)
  const pasosUy = porEvento(embudoUruguay)
  const meta = (ciudadesMeta.rows ?? []).map((f) => [f.dimensionValues?.[0]?.value ?? '', Number(f.metricValues?.[0]?.value ?? 0)])
  const usuariosMeta = meta.reduce((s, [, n]) => s + n, 0)
  const pctMeta = usuarios > 0 ? `${Math.round((usuariosMeta / usuarios) * 100)} %` : '—'
  const L = [
    `# Google Analytics — ${hoy}`, '',
    `Propiedad \`${nombre || propiedad}\`. Período: ${fmt(desde)} a ${fmt(hasta)} (${dias} días).`, '',
    '| Usuarios | Sesiones | Vistas | Eventos clave |', '|---|---|---|---|',
    `| ${int(t[0]?.value)} | ${int(t[1]?.value)} | ${int(t[2]?.value)} | ${int(t[3]?.value)} |`,
    ...tabla(canales, 'De dónde llegan', ['Canal', 'Sesiones', 'Usuarios', 'Eventos clave']),
    ...tabla(paginas, 'Páginas más vistas', ['Página', 'Vistas', 'Usuarios']),
    ...tabla(eventos, 'Eventos', ['Evento', 'Veces']),
    ...tabla(ciudades, 'Ciudades', ['Ciudad', 'Usuarios']),
    '', '## Embudo solo Uruguay', '',
    'Para medir la campaña y el costo por vista de prenda, la columna que vale es Uruguay: el resto incluye a los robots de Meta que revisan cada anuncio. Usuarios únicos por paso.', '',
    '| Paso | Total | Uruguay | Resto |', '|---|---|---|---|',
    `| Usuarios | ${int(usuarios)} | ${int(usuariosUy)} | ${int(usuarios - usuariosUy)} |`,
    ...EMBUDO.map(([rotulo, ev]) => {
      const total = pasosTotal[ev] ?? 0
      const uy = pasosUy[ev] ?? 0
      return `| ${rotulo} (\`${ev}\`) | ${int(total)} | ${int(uy)} | ${int(total - uy)} |`
    }),
    '', `**Usuarios desde centros de datos de Meta:** ${int(usuariosMeta)} de ${int(usuarios)} (${pctMeta})${meta.length ? `: ${meta.map(([c, n]) => `${cell(c)} ${int(n)}`).join(', ')}` : ''}. Son robots que revisan los anuncios, no clientas: sacalos de la cuenta para medir la campaña.`,
    '', '_Generado con `npm run ga`. Solo lectura._', '',
  ]

  mkdirSync(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, `ga-${hoy}.md`)
  writeFileSync(file, L.join('\n'))

  // Historial de GA, una fila por día (si se corre dos veces el mismo día, la
  // segunda reemplaza a la primera, como el de Search Console). Va en su
  // propio archivo: historial.csv lo reescribe seo-report con sus columnas.
  const csv = path.join(OUT_DIR, 'historial-ga.csv')
  const header = 'fecha,desde,hasta,usuarios,usuarios_uruguay,usuarios_centros_meta'
  const previas = existsSync(csv) ? readFileSync(csv, 'utf8').split(/\r?\n/).filter((l) => l && l !== header && !l.startsWith(`${hoy},`)) : []
  const fila = [hoy, fmt(desde), fmt(hasta), usuarios, usuariosUy, usuariosMeta].join(',')
  writeFileSync(csv, [header, ...previas, fila].join('\n') + '\n')

  console.log(`   Usuarios: ${int(t[0]?.value)} · Sesiones: ${int(t[1]?.value)} · Eventos clave: ${int(t[3]?.value)}`)
  console.log(`   Uruguay: ${int(usuariosUy)} · Centros de datos de Meta: ${int(usuariosMeta)} (${pctMeta})`)
  console.log(`\n✅  Informe: ${file}\n   Historial: ${csv}`)
}

main().catch((err) => {
  console.error(`\n🛑  ${err.message}\n`)
  process.exit(1)
})
