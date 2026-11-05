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
import { feedItemId } from './catalog-ids'

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
  add_to_wishlist: 'AddToWishlist', // corazón de favoritos
  begin_checkout: 'InitiateCheckout', // el pedido por WhatsApp
  generate_lead: 'Lead', // encargo a medida
  sign_up: 'CompleteRegistration', // lista privada (VIP)
  search: 'Search',
  whatsapp_click: 'Contact',
}

/** Las cookies de Meta duran 90 días, como las que crea fbevents.js. */
const FB_COOKIE_MAX_AGE = 90 * 24 * 60 * 60

function readCookie(name: string): string | null {
  const m = new RegExp(`(?:^|; )${name}=([^;]*)`).exec(document.cookie)
  return m ? m[1] : null
}

/**
 * _fbc a mano cuando se llega con ?fbclid= (formato documentado por Meta:
 * fb.1.<ms>.<fbclid>). fbevents.js lo crea solo, pero carga con lazyOnload y
 * lo bloquean los ad-blockers; sin esta cookie la API de conversiones no puede
 * atar la venta al clic del anuncio. Si ya había una de otro clic, se
 * reescribe (TRK-03, 04/11/2026): antes se conservaba la vieja y, con
 * fbevents bloqueado, el clic en un anuncio nuevo quedaba atado al anterior.
 */
function captureFbclid(): void {
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid')
    if (!fbclid) return
    // Todo lo que sigue a "fb.1.<ms>." es el fbclid que guardó.
    const guardado = readCookie('_fbc')?.split('.').slice(3).join('.')
    if (guardado === fbclid) return
    document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; path=/; max-age=${FB_COOKIE_MAX_AGE}; SameSite=Lax; Secure`
  } catch { /* cookies bloqueadas: el píxel lo intenta igual */ }
}

/**
 * _fbp antes del primer evento, con el formato de Meta (fb.1.<ms>.<10
 * dígitos>). Solo lo creaba fbevents.js, que carga con lazyOnload: la vista
 * de la ficha sale por la API de conversiones apenas hidrata, y la primera
 * vista de quien llega de un anuncio iba sin fbp (TRK-03). Cuando fbevents.js
 * carga, reusa esta cookie en vez de crear otra.
 */
function ensureFbp(): void {
  try {
    if (readCookie('_fbp')) return
    const azar = String(Math.floor(Math.random() * 1e10)).padStart(10, '0')
    document.cookie = `_fbp=fb.1.${Date.now()}.${azar}; path=/; max-age=${FB_COOKIE_MAX_AGE}; SameSite=Lax; Secure`
  } catch { /* cookies bloqueadas: el píxel lo intenta igual */ }
}

/** El snippet oficial: deja fbq con su cola lista aunque la librería llegue tarde. */
export function ensureFbq(): boolean {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return false
  if (!window.fbq) {
    captureFbclid()
    ensureFbp()
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
    // Sin "eventos automáticos": fbevents bajaba signals/config y escaneaba la
    // página buscando botones (Lighthouse 03/11/2026: ~0,9 s de bloqueo en el
    // celular, de los 1,35 s que sumaba Meta). Los eventos que importan ya
    // salen a mano desde track(). Tiene que ir antes del init.
    window.fbq('set', 'autoConfig', false, META_PIXEL_ID)
    window.fbq('init', META_PIXEL_ID)
  }
  return true
}

function newEventId(): string {
  try { return crypto.randomUUID() } catch { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }
}

/**
 * El id de la prenda en el catálogo (merchant-feed.xml): slug-talle si tiene
 * talles, solo el slug si no, y también con "Único" o "Talle único" (TRK-01:
 * antes comparaba contra el literal 'Único' y el Sweater net no coincidía).
 * Es la misma regla del feed: vive en lib/catalog-ids.ts. Este nombre queda
 * para lo que ya lo importa (el Purchase de meta-compra).
 */
export { feedItemId as metaContentId } from './catalog-ids'

/**
 * Los mismos datos para el píxel y para la API de conversiones. Exportada
 * para las pruebas unitarias.
 *
 * `params.meta_group === true` (lo pone quien mide, con tieneVariantes): el
 * evento va a nivel prenda, content_type product_group con el slug, que en el
 * feed es el item_group_id. Es la vista de una prenda con talles, o una
 * consulta sin talle elegido. Todo lo demás va a nivel ítem: product con el
 * id del feed (feedItemId). Antes toda vista salía como product_group, también
 * la de las 15 prendas sin talles, que en el feed son ítems sueltos.
 */
export function metaData(event: string, params?: Record<string, unknown>): Record<string, unknown> {
  const items = Array.isArray(params?.items) ? params.items as GaItem[] : []
  const data: Record<string, unknown> = {}
  if (items.length > 0) {
    const group = params?.meta_group === true
    const ids = items.map((i) => (group ? i.item_id : feedItemId(i.item_id, i.item_variant)))
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
