// Fecha del drop (Configuración → Próximo drop, "2026-11-15 10:00") leída en
// hora de Uruguay (UTC-3, sin horario de verano). Se usa igual en el servidor
// (cron del mail, /vip, panel de la lista) y en el navegador (DropTeaser), así
// la cuenta regresiva y el aviso nunca discrepan.
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

/** "28 de octubre", para textos cortos (/vip). */
export function dropDayText(d: Date): string {
  return new Intl.DateTimeFormat('es-UY', { timeZone: 'America/Montevideo', day: 'numeric', month: 'long' }).format(d).toLowerCase()
}
