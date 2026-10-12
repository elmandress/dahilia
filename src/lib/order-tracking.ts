// Seguimiento de pedidos de la tienda (12/10/2026) — compartido entre el
// carrito (genera el código), la API (lo valida), la página pública /pedido y
// el admin. Ver database/seguimiento-pedidos-2026-10.sql.

export type OrderStage = 'recibido' | 'confirmado' | 'tejiendo' | 'terminado' | 'enviado'

export const ORDER_STAGES: Array<{ key: OrderStage; label: string; blurb: string }> = [
  { key: 'recibido', label: 'Recibido', blurb: 'Tu pedido llegó. Coordinamos por WhatsApp el pago y el envío.' },
  { key: 'confirmado', label: 'Confirmado', blurb: 'Pago confirmado: tu pieza ya tiene su lugar en el taller.' },
  { key: 'tejiendo', label: 'Tejiendo', blurb: 'Se está tejiendo a mano, punto por punto.' },
  { key: 'terminado', label: 'Terminado', blurb: 'Está terminada y revisada. Se prepara para salir.' },
  { key: 'enviado', label: 'Enviado', blurb: 'Va en camino. Cualquier duda del envío, escribime.' },
]

export function stageIndex(stage: string | null | undefined): number {
  const i = ORDER_STAGES.findIndex((s) => s.key === stage)
  return i < 0 ? 0 : i
}

/** Sin caracteres que se confunden (0/O, 1/I): se dicta por WhatsApp. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const ORDER_CODE_RE = /^PED-[A-HJ-NP-Z2-9]{6}$/

export function makeOrderCode(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return `PED-${Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')}`
}

export function normalizeOrderCode(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/\s+/g, '')
  return s.startsWith('PED-') ? s : s.length === 6 ? `PED-${s}` : s
}
