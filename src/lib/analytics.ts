// Medición del sitio: una sola puerta (`track`) para Umami y Google Analytics 4.
//
// - Umami recibe los eventos con los nombres del embudo (add_to_cart,
//   order_sent, encargo_sent…), igual que siempre.
// - GA4 recibe, cuando corresponde, el evento RECOMENDADO por Google con sus
//   parámetros (view_item, add_to_cart, begin_checkout, generate_lead,
//   sign_up, search). Con esos nombres se llenan los informes de e-commerce y
//   se pueden marcar como "eventos clave": hasta el 14/09/2026, GA4 mostraba 0.
// - No se mide nada en /admin ni en un navegador que alguna vez entró al admin
//   (Anush, Mati): "Admin | Dahila Crochet" tenía 66 vistas en GA4.
const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
const SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const ANALYTICS_ENABLED = Boolean(WEBSITE_ID && SCRIPT_URL)
export const ANALYTICS_SCRIPT_URL = SCRIPT_URL
export const ANALYTICS_WEBSITE_ID = WEBSITE_ID
export const GA_MEASUREMENT_ID = GA_ID

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void }
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

// ── Tráfico interno ────────────────────────────────────────────────────────

const INTERNAL_KEY = 'dahila_interno'

export function isInternalVisitor(): boolean {
  try { return localStorage.getItem(INTERNAL_KEY) === '1' } catch { return false }
}

/**
 * Marca este navegador como interno: desde ahí no se cargan los scripts de
 * medición (ver use-analytics-allowed.ts). Además prende los "apagados"
 * oficiales de cada herramienta, que cortan en el acto aunque el script ya
 * esté cargado: `umami.disabled` (Umami) y `ga-disable-<ID>` (GA4).
 */
export function markInternalVisitor(): void {
  try {
    localStorage.setItem(INTERNAL_KEY, '1')
    localStorage.setItem('umami.disabled', '1')
  } catch { /* storage bloqueado: igual se corta abajo */ }
  if (GA_ID) (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true
}

// ── GA4 ────────────────────────────────────────────────────────────────────

/**
 * Deja gtag listo ya (el snippet oficial: dataLayer + js + config), aunque la
 * librería de 171 KB se cargue recién cuando la página terminó (lazyOnload).
 * Sin esto se perdía lo que se mide al abrir una página, como la vista de la
 * ficha: gtag todavía no existía. Cuando la librería llega, procesa la cola en
 * orden.
 */
export function ensureGtag(): boolean {
  if (typeof window === 'undefined' || !GA_ID || isInternalVisitor()) return false
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || []
    // gtag.js lee el objeto `arguments`, no un array: así es el snippet oficial.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', GA_ID)
  }
  return true
}

/** Un producto en el formato de e-commerce de GA4. */
export type GaItem = {
  item_id: string
  item_name: string
  price: number
  quantity?: number
  item_variant?: string
  item_category?: string
}

/** Moneda, valor y productos: los parámetros de e-commerce de GA4. */
export function gaCommerce(items: GaItem[], value?: number) {
  return {
    currency: 'UYU',
    value: value ?? items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0),
    items,
  }
}

// ── Umami ──────────────────────────────────────────────────────────────────

// Umami llega después de hidratar: lo que se mide antes (la vista de la ficha
// al abrirla) espera en esta cola y sale cuando carga el script.
const umamiQueue: Array<[string, Record<string, unknown> | undefined]> = []

export function flushUmamiQueue(): void {
  if (typeof window === 'undefined' || !window.umami) return
  for (const [event, props] of umamiQueue.splice(0)) window.umami.track(event, props)
}

// ── La puerta única ────────────────────────────────────────────────────────

/**
 * Un evento del sitio. `ga` (opcional) es su versión para GA4: el nombre
 * recomendado por Google y sus parámetros, que se suman a los de Umami. Si no
 * se pasa, GA4 recibe el mismo evento que Umami.
 */
export function track(
  event: string,
  props?: Record<string, unknown>,
  ga?: { name?: string; params?: Record<string, unknown> },
): void {
  if (typeof window === 'undefined' || isInternalVisitor()) return
  if (ANALYTICS_ENABLED) {
    if (window.umami) window.umami.track(event, props)
    else if (umamiQueue.length < 50) umamiQueue.push([event, props])
  }
  if (ensureGtag()) window.gtag!('event', ga?.name ?? event, ga ? { ...props, ...ga.params } : props)
}
