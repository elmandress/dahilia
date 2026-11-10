// Fecha del drop (Configuración → Próximo drop, "2026-11-15 10:00") leída en
// hora de Uruguay (UTC-3, sin horario de verano). Se usa igual en el servidor
// (cron del mail, /vip, panel de la lista) y en el navegador (DropTeaser), así
// la cuenta regresiva y el aviso nunca discrepan. También los días enteros de
// los cupones y la clave con la que el aviso a la lista sale una sola vez.
//
// Tolerante a cómo se escribe a mano (27/10/2026: estaba cargada "2026/10/28 "
// y el servidor no la entendía → "no hay drop" en el panel y el aviso a la
// lista sin programar, el día antes del drop). Acepta:
//   2026-10-28 10:00 · 2026/10/28 10:00 · 2026.10.28 · 28/10/2026 10hs · 28-10-2026 10.30
// Sin hora → 00:00 (el panel avisa que falta).

interface Parts { y: string; mo: string; d: string; h?: string; mi?: string }

function parts(raw: string | undefined | null): Parts | null {
  const s = (raw ?? '').trim().replace(/\s+/g, ' ')
  if (!s) return null
  const time = '(?:[ T,]+(\\d{1,2})(?:[:.h](\\d{2}))?\\s*(?:hs?|hrs?)?\\.?)?'
  const ymd = new RegExp(`^(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})${time}$`, 'i').exec(s)
  if (ymd) return { y: ymd[1], mo: ymd[2], d: ymd[3], h: ymd[4], mi: ymd[5] }
  const dmy = new RegExp(`^(\\d{1,2})[-/.](\\d{1,2})[-/.](\\d{4})${time}$`, 'i').exec(s)
  if (dmy) return { y: dmy[3], mo: dmy[2], d: dmy[1], h: dmy[4], mi: dmy[5] }
  return null
}

export function parseDropDateUY(raw: string | undefined | null): Date | null {
  const p = parts(raw)
  if (!p) return null
  const mo = Number(p.mo), d = Number(p.d), h = Number(p.h ?? 0), mi = Number(p.mi ?? 0)
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = new Date(`${p.y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:00-03:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** El drop ya abrió (la fecha cargada quedó atrás). false sin fecha válida. */
export function dropHasLaunched(raw: string | undefined | null): boolean {
  const launch = parseDropDateUY(raw)
  return launch !== null && launch.getTime() <= Date.now()
}

/** Fecha y hora de Montevideo por separado, para los inputs del admin
 *  (date: "2026-10-28", time: "18:00"). null si no se entiende. */
export function dropDateInputs(raw: string | undefined | null): { date: string; time: string } | null {
  const d = parseDropDateUY(raw)
  if (!d) return null
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Montevideo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d)
  const get = (t: string) => f.find((p) => p.type === t)?.value ?? ''
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }
}

/** La fecha trae hora (si no, se toma la medianoche y conviene avisarlo). */
export function dropDateHasTime(raw: string | undefined | null): boolean {
  return parts(raw)?.h !== undefined
}

/** "el sábado 15 de noviembre a las 10:00", en español de Uruguay. */
export function dropWhenText(d: Date): string {
  const fmt = new Intl.DateTimeFormat('es-UY', {
    timeZone: 'America/Montevideo', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d)
  const get = (t: string) => fmt.find((p) => p.type === t)?.value ?? ''
  // es-UY escribe el mes con mayúscula ("Setiembre"): en una oración va en minúscula.
  return `el ${get('weekday').toLowerCase()} ${get('day')} de ${get('month').toLowerCase()} a las ${get('hour')}:${get('minute')}`
}

/**
 * "hasta el sáb 7/11": cuándo termina un descuento, en hora de Montevideo, para
 * ponerlo al lado del precio tachado. null si la fecha no se puede leer: sin
 * fecha no se muestra nada (nunca se inventa una).
 */
export function descuentoHastaTexto(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const parts = new Intl.DateTimeFormat('es-UY', {
    timeZone: 'America/Montevideo', weekday: 'long', day: 'numeric', month: 'numeric',
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const dia = get('weekday').toLowerCase().slice(0, 3)
  if (!dia || !get('day') || !get('month')) return null
  return `hasta el ${dia} ${get('day')}/${get('month')}`
}

/** "28 de octubre", para textos cortos (/vip). */
export function dropDayText(d: Date): string {
  return new Intl.DateTimeFormat('es-UY', { timeZone: 'America/Montevideo', day: 'numeric', month: 'long' }).format(d).toLowerCase()
}

// ── Días enteros en hora de Uruguay (QA-16, 04/11/2026) ─────────────────────
// Los cupones se guardaban con new Date(`${d}T00:00:00`), que usa la zona del
// navegador: desde una compu en otra zona, cada guardado corría la vigencia un
// día. El offset va fijo porque Uruguay no tiene horario de verano desde 2015.
// null si no es una fecha "aaaa-mm-dd" (lo que da un <input type="date">).

function diaUY(d: string, hora: string): string | null {
  const s = (d ?? '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const date = new Date(`${s}T${hora}-03:00`)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** "2026-11-07" → "2026-11-07T03:00:00.000Z": el 7 arranca a las 00:00 de Montevideo. */
export function inicioDiaUY(d: string): string | null {
  return diaUY(d, '00:00:00')
}

/** "2026-11-07" → "2026-11-08T02:59:59.000Z": el 7 termina a las 23:59:59 de Montevideo. */
export function finDiaUY(d: string): string | null {
  return diaUY(d, '23:59:59')
}

// ── El aviso del drop a la lista, una sola vez (QA-13, 04/11/2026) ─────────
// La clave era `${nombre}|${fecha tal como se escribió}`: corregir «Sunset ‘26»
// por «Sunset '26» a horas del lanzamiento armaba un envío nuevo y la lista
// entera recibía el mismo mail dos veces. Ahora la clave es la colección y el
// instante del lanzamiento, que es lo que define un drop.

/** Clave del aviso: "sunset-26|2026-10-28T22:00:00.000Z" (sin colección, "tienda|…"). */
export function dropSentKey(slug: string, launch: Date): string {
  return `${slug || 'tienda'}|${launch.toISOString()}`
}

/** Un aviso a la lista que salió hace menos de esto bloquea otro, aunque la clave cambie. */
export const AVISO_PAUSA_MS = 12 * 3_600_000

/**
 * El aviso de este drop ya salió. Cuenta como enviado si lo anotado coincide
 * con la clave nueva, o con la vieja (`${nombre}|${fecha}`) para que el drop
 * en curso no se reenvíe al desplegar este cambio, o si cualquier aviso salió
 * hace menos de 12 h. La vieja se compara solo por la fecha: lleva el nombre
 * adentro, y corregirlo tampoco tiene que reenviar ese drop.
 */
export function avisoYaEnviado(p: {
  /** site_settings.lista_email_enviado */
  enviado: string | null | undefined
  /** site_settings.lista_email_enviado_at (ISO) */
  enviadoAt: string | null | undefined
  name: string
  rawDate: string
  slug: string
  launch: Date | null
  now?: number
}): boolean {
  if (!p.name) return false
  const anotado = (p.enviado ?? '').trim()
  if (anotado) {
    // Una fecha escrita a mano nunca termina como un ISO ("…:00.000Z"): la
    // clave nueva no puede confundirse con una vieja.
    if (p.rawDate && anotado.endsWith(`|${p.rawDate}`)) return true
    if (p.launch && anotado === dropSentKey(p.slug, p.launch)) return true
  }
  const at = p.enviadoAt ? Date.parse(p.enviadoAt) : NaN
  return Number.isFinite(at) && (p.now ?? Date.now()) - at < AVISO_PAUSA_MS
}
