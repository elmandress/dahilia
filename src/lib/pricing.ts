import { PRICE_TABLE } from '@/app/admin/estrategia/data'

// ─────────────────────────────────────────────────────────────
// Marcador de precios dinámico (admin) — 04/09/2026.
//
// Responde, para cada producto: ¿cuánto te paga hoy por hora? ¿cuánto
// tendría que valer para pagarte al menos el salario mínimo? ¿cuánto estás
// por debajo? ¿a cuánto conviene subirlo AHORA, sin saltar de golpe?
//
// Usa el mismo criterio que ordena toda la estrategia de precios
// (/admin/estrategia): contribución por hora = (precio − materiales) / horas.
// Nada de números mágicos: todo sale de las horas y materiales cargados y del
// salario mínimo vigente. Es "dinámico" porque se recalcula con el precio
// en vivo — en el editor, a medida que Anush lo escribe.
//
// Por qué el salario mínimo y no un número más ambicioso: es el piso legal
// (por debajo, la pieza le paga a Anush menos que el mínimo por su hora), y
// en los datos reales del catálogo el precio que resulta NO es irreal: hay
// piezas de la misma categoría que ya se venden a ese nivel (se muestra en
// cada recomendación cuando pasa). La Calculadora de /admin/estrategia sigue
// existiendo para una cuenta más completa (tarifa propia + margen + comisión).
// ─────────────────────────────────────────────────────────────

/** Salario mínimo nacional por hora (jul 2026: $25.383/mes ÷ 200 h). Misma
 *  cifra que HOUR_REFS en admin/estrategia/data.ts. */
export const HOURLY_FLOOR_UYU = 127

/** Tope de cada escalón de suba. Es el tamaño de paso que ya se aplicó en
 *  julio 2026 (PRICE_TABLE, columna "before" → "today"): casi todas las piezas
 *  subieron entre 7% y 19%, con mediana ~11% (Set BRISA, +29%, fue la
 *  excepción). 15% queda dentro de ese rango. */
export const MAX_STEP = 0.15

/** Si después de un escalón lo que falta es menos que esto, se junta con él:
 *  evita un último paso ridículo de $20. */
const MERGE_TAIL = 0.05

/** Margen para considerar "en precio" (absorbe el redondeo). */
const OK_TOLERANCE = 0.03

export type PricingStatus = 'no-data' | 'hold' | 'ok' | 'under'

export interface PricingPeer {
  slug: string
  name: string
  price: number | null
  categoryId: string | null
}

export interface PricingInput {
  slug: string
  price: number | null
  /** Horas y materiales cargados en el admin (tabla product_costs). Si faltan,
   *  se usan los de la tabla aprobada (PRICE_TABLE). */
  hours?: number | null
  materials?: number | null
  categoryId?: string | null
  /** Otros productos activos: para mostrar si el catálogo ya vende a ese nivel. */
  peers?: PricingPeer[]
}

export interface PricingRecommendation {
  status: PricingStatus
  /** De dónde salieron horas y materiales. */
  source: 'cargado' | 'tabla' | null
  price: number | null
  hours: number | null
  materials: number | null
  /** Lo que queda por hora hoy: (precio − materiales) / horas. */
  perHour: number | null
  /** Precio que paga al menos el salario mínimo por hora. */
  fairPrice: number | null
  /** Cuánto falta para el precio justo, en pesos y en % del precio justo. */
  gap: number
  gapPct: number
  /** Escalones sugeridos desde el precio actual hasta el justo. */
  stages: number[]
  nextPrice: number | null
  /** Pieza de la misma categoría que ya se vende a ese nivel (si hay). */
  peer: { name: string; price: number } | null
  /** El porqué, en lenguaje simple, para mostrarle a Anush. */
  reasons: string[]
}

export const formatUyu = (n: number) => `$${Math.round(n).toLocaleString('es-UY')}`
const round10 = (x: number) => Math.round(x / 10) * 10
const ceil10 = (x: number) => Math.ceil(x / 10) * 10

/** Escalones de hasta MAX_STEP cada uno, desde `price` hasta `fair`. */
export function planStages(price: number, fair: number): number[] {
  const stages: number[] = []
  let current = price
  for (let i = 0; i < 40 && current < fair; i++) {
    const next = Math.max(round10(current * (1 + MAX_STEP)), current + 10)
    if (next >= fair || fair - next < next * MERGE_TAIL) {
      stages.push(fair)
      break
    }
    stages.push(next)
    current = next
  }
  return stages
}

export function recommendPrice(input: PricingInput): PricingRecommendation {
  const row = PRICE_TABLE.find((r) => r.slug === input.slug)
  const loaded = input.hours != null && input.hours > 0 && input.materials != null && input.materials >= 0
  const hours = loaded ? (input.hours as number) : (row?.hours ?? null)
  const materials = loaded ? (input.materials as number) : (row?.materials ?? null)
  const source: PricingRecommendation['source'] = loaded
    ? 'cargado'
    : hours != null && materials != null ? 'tabla' : null
  const price = input.price != null && input.price > 0 ? input.price : null

  const empty: PricingRecommendation = {
    status: 'no-data', source, price, hours, materials,
    perHour: null, fairPrice: null, gap: 0, gapPct: 0,
    stages: [], nextPrice: null, peer: null, reasons: [],
  }
  if (price == null) {
    return { ...empty, reasons: ['Este producto no tiene precio base cargado, así que no hay nada que comparar.'] }
  }
  if (hours == null || hours <= 0 || materials == null) {
    return {
      ...empty,
      reasons: ['Faltan las horas de tejido y el costo de materiales. Con esos dos datos se calcula todo lo demás — lo ideal es cronometrar una pieza real y cargar ese número.'],
    }
  }

  const perHour = Math.round((price - materials) / hours)
  const fairPrice = ceil10(materials + hours * HOURLY_FLOOR_UYU)
  const gap = Math.max(0, fairPrice - price)
  const gapPct = Math.round((gap / fairPrice) * 100)
  const hoursLabel = Number.isInteger(hours) ? String(hours) : hours.toLocaleString('es-UY')
  const base = { source, price, hours, materials, perHour, fairPrice }
  const reasons: string[] = [
    `Hoy te quedan ${formatUyu(perHour)} por hora de trabajo: (${formatUyu(price)} − ${formatUyu(materials)} de materiales) ÷ ${hoursLabel} h.`,
  ]

  if (row?.priority === 'hold') {
    reasons.push('Es una pieza de entrada: su precio bajo es a propósito, como puerta para probar la marca y para regalos. No se recomienda subirla.')
    return { ...base, status: 'hold', gap, gapPct, stages: [], nextPrice: null, peer: null, reasons }
  }

  if (price >= fairPrice * (1 - OK_TOLERANCE)) {
    reasons.push(`Ya te paga al menos el salario mínimo por hora (${formatUyu(HOURLY_FLOOR_UYU)}). Por esta cuenta no hace falta subirla.`)
    return { ...base, status: 'ok', gap: 0, gapPct: 0, stages: [], nextPrice: null, peer: null, reasons }
  }

  const stages = planStages(price, fairPrice)
  const candidates = (input.peers ?? []).filter(
    (p) => p.slug !== input.slug && input.categoryId != null && p.categoryId === input.categoryId
      && p.price != null && p.price >= fairPrice * 0.9
  )
  candidates.sort((a, b) => Math.abs((a.price as number) - fairPrice) - Math.abs((b.price as number) - fairPrice))
  const peer = candidates[0] ? { name: candidates[0].name, price: candidates[0].price as number } : null

  reasons.push(`Para pagarte al menos el salario mínimo (${formatUyu(HOURLY_FLOOR_UYU)} por hora), esta pieza tendría que valer ${formatUyu(fairPrice)}: ${formatUyu(materials)} de materiales + ${hoursLabel} h × ${formatUyu(HOURLY_FLOOR_UYU)}.`)
  if (peer) {
    reasons.push(`No es un precio fuera de lo que tus clientas pagan: ${peer.name} ya se vende a ${formatUyu(peer.price)} en la misma categoría.`)
  }
  reasons.push(stages.length > 1
    ? `No hace falta subirla de golpe: en escalones de hasta ${Math.round(MAX_STEP * 100)}% —el tamaño de paso que ya usaste en julio— son ${stages.length} etapas. La primera es ${formatUyu(stages[0])}.`
    : `Se llega en un solo paso: ${formatUyu(stages[0])}.`)
  reasons.push('Cada suba, acompañada de algo visible (fotos nuevas, packaging, colección nueva). Y si la pieza junta más de un mes de lista de espera, podés saltar directo a la etapa siguiente.')

  return { ...base, status: 'under', gap, gapPct, stages, nextPrice: stages[0] ?? null, peer, reasons }
}
