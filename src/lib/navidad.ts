// Aviso "llega para Navidad" (08/10/2026).
//
// Las fechas las pone Anush en Configuración → "Navidad" (no se calculan
// solas: ella sabe cuánta cola tiene). El código solo agrega dos frenos de
// honestidad:
//   - pasada la fecha, o pasado el 24/12, el aviso desaparece solo;
//   - una prenda a medida cuyo plazo máximo ya no entra antes del 24/12 no
//     muestra el aviso aunque la fecha general siga vigente.

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre']

/** "2026-12-05" → fin de ese día, hora local. Inválida → null. */
export function parseDay(s: string | undefined | null): Date | null {
  const m = (s ?? '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "5 de diciembre" */
export function formatDay(d: Date): string {
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`
}

export interface NavidadDates {
  /** Último día para encargar una pieza a medida. */
  encargoHasta: Date | null
  /** Último día para pedir una pieza ya tejida (llega con el envío). */
  stockHasta: Date | null
}

function christmasOf(now: Date): Date {
  return new Date(now.getFullYear(), 11, 24, 23, 59, 59)
}

/** Texto para una ficha, o null si no corresponde mostrar nada. */
export function navidadForProduct(
  dates: NavidadDates,
  opts: { readyNow: boolean; leadMaxWeeks: number; now: Date },
): string | null {
  const { now } = opts
  const xmas = christmasOf(now)
  if (now > xmas) return null
  if (opts.readyNow) {
    const d = dates.stockHasta ?? dates.encargoHasta
    if (!d || now > d) return null
    return `Ya está tejida: pedila antes del ${formatDay(d)} y llega para Navidad.`
  }
  const d = dates.encargoHasta
  if (!d || now > d) return null
  const latestArrival = new Date(now.getTime() + Math.max(0, opts.leadMaxWeeks) * 7 * 86_400_000)
  if (latestArrival > xmas) return null
  return `Encargala antes del ${formatDay(d)} y llega para Navidad.`
}
