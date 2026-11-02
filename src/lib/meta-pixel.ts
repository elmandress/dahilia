// Meta (píxel de Facebook/Instagram) + API de conversiones, en el navegador.
//
// Por qué existe (02/11/2026): la campaña de ventas del drop Sunset '26
// optimizaba por "agregar al carrito" con el píxel 1107860632053526, pero el
// sitio no tenía código de Meta: el píxel nunca recibió un evento y Meta
// gastó $1.011 repartiendo el anuncio a ciegas.
//
// Cada evento sale por dos caminos con el MISMO event_id, y Meta los cuenta
// una sola vez (deduplicación por event_id + nombre, ventana de 48 h):
//   1. el píxel (fbevents.js), que lo pierden los bloqueadores y Safari;
//   2. /api/meta (sendBeacon), que lo reenvía desde el servidor por la API de
//      conversiones con la IP y las cookies _fbp/_fbc.
//
// Los eventos no se disparan acá a mano: salen solos de `track()` (analytics.ts)
// traduciendo el nombre de GA4 al estándar de Meta. Un botón nuevo que ya mide
// en GA4 queda medido en Meta sin tocar nada.
import type { GaItem } from './analytics'

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown }

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

/** GA4 → Meta. Solo los eventos que le sirven a Meta para optimizar. */
const GA_TO_META: Record<string, string> = {
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout', // el pedido por WhatsApp
  generate_lead: 'Lead', // encargo a medida
  sign_up: 'CompleteRegistration', // lista privada (VIP)
  search: 'Search',
  whatsapp_click: 'Contact',
}

/**
 * _fbc a mano cuando se llega con ?fbclid= (formato documentado por Meta:
 * fb.1.<ms>.<fbclid>). fbevents.js lo crea solo, pero carga con lazyOnload y
 * lo bloquean los ad-blockers; sin esta cookie la API de conversiones no puede
 * atar la venta al clic del anuncio.
 */
function captureFbclid(): void {
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid')
    if (!fbclid || document.cookie.includes('_fbc=')) return
    const maxAge = 90 * 24 * 60 * 60
    document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`
  } catch { /* cookies bloqueadas: el píxel lo intenta igual */ }
}

/** El snippet oficial: deja fbq con su cola lista aunque la librería llegue tarde. */
export function ensureFbq(): boolean {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return false
  if (!window.fbq) {
    captureFbclid()
    const n: Fbq = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args)
      else n.queue!.push(args)
    }
    if (!window._fbq) window._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    window.fbq = n
    window.fbq('init', META_PIXEL_ID)
  }
  return true
}

function newEventId(): string {
  try { return crypto.randomUUID() } catch { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }
}

/**
 * El id de la prenda en el catálogo (merchant-feed.xml): slug-talle si tiene
 * talles, solo el slug si no. Las prendas sin talles viajan en el carrito con
 * el talle 'Único', que en el feed no existe.
 */
export function metaContentId(slug: string, size?: string | null): string {
  return size && size !== 'Único' ? `${slug}-${size}` : slug
}

/** Los mismos datos para el píxel y para la API de conversiones. */
function metaData(event: string, params?: Record<string, unknown>): Record<string, unknown> {
  const items = Array.isArray(params?.items) ? params.items as GaItem[] : []
  const data: Record<string, unknown> = {}
  if (items.length > 0) {
    // ViewContent va a nivel prenda (product_group = item_group_id del feed);
    // carrito y pedido, a nivel talle: el id del feed es slug-talle.
    const group = event === 'ViewContent'
    const ids = items.map((i) => (group ? i.item_id : metaContentId(i.item_id, i.item_variant)))
    data.content_ids = ids
    data.content_type = group ? 'product_group' : 'product'
    data.contents = items.map((i, k) => ({ id: ids[k], quantity: i.quantity ?? 1, item_price: i.price }))
    data.num_items = items.reduce((s, i) => s + (i.quantity ?? 1), 0)
    if (items.length === 1) data.content_name = items[0].item_name
    if (items[0].item_category) data.content_category = items[0].item_category
  }
  if (typeof params?.value === 'number') {
    data.value = params.value
    data.currency = params.currency ?? 'UYU'
  }
  if (typeof params?.search_term === 'string') data.search_string = params.search_term
  return data
}

/** Manda un evento estándar a Meta por los dos caminos. */
function sendMeta(event: string, data: Record<string, unknown>): void {
  if (!ensureFbq()) return
  const eventId = newEventId()
  window.fbq!('track', event, data, { eventID: eventId })
  try {
    const body = JSON.stringify({ event_name: event, event_id: eventId, event_source_url: window.location.href, custom_data: data })
    // sendBeacon sobrevive a la navegación: el pedido abre WhatsApp enseguida.
    if (!navigator.sendBeacon?.('/api/meta', new Blob([body], { type: 'application/json' }))) {
      fetch('/api/meta', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {})
    }
  } catch { /* sin servidor: el píxel ya salió */ }
}

/** Desde `track()`: traduce el evento de GA4 si a Meta le sirve. */
export function trackMeta(gaName: string, params?: Record<string, unknown>): void {
  const event = GA_TO_META[gaName]
  if (event) sendMeta(event, metaData(event, params))
}

/** Una vista de página (en cada cambio de ruta: el sitio navega sin recargar). */
export function metaPageView(): void {
  if (ensureFbq()) window.fbq!('track', 'PageView')
}
