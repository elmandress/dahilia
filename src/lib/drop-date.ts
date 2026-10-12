// Fecha del drop (Configuración → Próximo drop, "2026-11-15 10:00") leída en
// hora de Uruguay (UTC-3, sin horario de verano). En el navegador DropTeaser
// la lee en la hora del dispositivo; en el servidor (cron del mail) no hay
// "hora local" confiable, así que se fija el huso.

export function parseDropDateUY(raw: string | undefined | null): Date | null {
  const m = (raw ?? '').trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/)
  if (!m) return null
  const hh = (m[4] ?? '00').padStart(2, '0')
  const mm = m[5] ?? '00'
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${hh}:${mm}:00-03:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "el sábado 15 de noviembre a las 10:00", en español de Uruguay. */
export function dropWhenText(d: Date): string {
  const fmt = new Intl.DateTimeFormat('es-UY', {
    timeZone: 'America/Montevideo', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d)
  const get = (t: string) => fmt.find((p) => p.type === t)?.value ?? ''
  return `el ${get('weekday')} ${get('day')} de ${get('month')} a las ${get('hour')}:${get('minute')}`
}
