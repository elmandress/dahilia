// De dónde vino la visita que terminó en un pedido, sin depender de ningún
// script de analytics de terceros, así que no lo pierden los ad-blockers. Se
// manda junto con el pedido en /api/orders (y con el encargo) para que el
// admin muestre el canal real de cada venta, no solo de las visitas que un
// script pudo medir. Guarda solo fuente/medio/campaña y el dominio de origen:
// nada personal.
//
// Modelo "último clic no directo", el que usa GA4 por defecto (14/09/2026):
// una visita que llega desde afuera (Instagram, TikTok, Google, un link con
// UTM) pisa lo guardado; una visita directa (sin referrer ni UTM) NO lo pisa
// mientras no pasen 30 días. Antes vivía en sessionStorage, que muere con la
// pestaña: quien veía una prenda en Instagram y volvía al otro día
// escribiendo dahila.uy quedaba como "Directo", y GA4 marcaba 172 sesiones
// directas en una semana (la mitad del tráfico).
const STORAGE_KEY = 'dahila_attribution'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export interface Attribution {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  referrer_host: string | null
}

type Stored = Attribution & { ts: number }

function readStored(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Partial<Stored>
    if (!s.ts || Date.now() - s.ts > MAX_AGE_MS) return null
    return {
      utm_source: s.utm_source ?? null,
      utm_medium: s.utm_medium ?? null,
      utm_campaign: s.utm_campaign ?? null,
      referrer_host: s.referrer_host ?? null,
    }
  } catch {
    return null
  }
}

// Llamar una vez al cargar la app (ver AttributionCapture.tsx).
export function captureAttribution(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)

  let referrerHost: string | null = null
  try {
    referrerHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : null
  } catch {
    referrerHost = null
  }
  // Un referrer del propio dominio (navegación interna) no es una fuente.
  if (referrerHost && referrerHost === window.location.hostname.replace(/^www\./, '')) referrerHost = null

  // /ig existe SOLO para ser el link de la bio de Instagram (ver app/ig), así
  // que quien entra por ahí viene de Instagram por definición. Damos eso por
  // sentado cuando no vienen UTM en la URL: el link de la bio puede ser
  // simplemente "dahila.uy/ig", corto y prolijo, en vez de arrastrar
  // "?utm_source=instagram&utm_medium=bio" a la vista de todo el mundo.
  // Un UTM explícito en la URL siempre gana (sirve para distinguir un reel
  // puntual de la bio, p. ej. ?utm_medium=reel-poncho).
  const esLandingDeInstagram = window.location.pathname.replace(/\/+$/, '') === '/ig'
  const utmSource = params.get('utm_source') ?? (esLandingDeInstagram ? 'instagram' : null)

  // Visita directa: se conserva la última fuente real (si no venció).
  if (!utmSource && !referrerHost) return

  const attribution: Stored = {
    utm_source: utmSource,
    utm_medium: params.get('utm_medium') ?? (esLandingDeInstagram ? 'bio' : null),
    utm_campaign: params.get('utm_campaign'),
    referrer_host: referrerHost,
    ts: Date.now(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
  } catch {
    /* localStorage no disponible (privado/bloqueado): no es crítico */
  }
}

export function getAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null
  return readStored()
}

// Etiqueta corta y humana para mostrar en /admin/pedidos.
export function channelLabel(a: Pick<Attribution, 'utm_source' | 'referrer_host'> | null): string {
  const raw = (a?.utm_source || a?.referrer_host || '').toLowerCase()
  if (!raw) return 'Directo'
  // Botón "Compartir" de la ficha (ShareButton): el boca a boca.
  if (raw === 'compartido') return 'Link compartido'
  if (raw.includes('instagram')) return 'Instagram'
  if (raw.includes('facebook') || raw.includes('fb.')) return 'Facebook'
  if (raw.includes('whatsapp')) return 'WhatsApp'
  if (raw.includes('tiktok')) return 'TikTok'
  // Asistentes de IA (12/09/2026), ANTES que 'google': gemini.google.com
  // contiene "google" y se contaba como búsqueda de Google. ChatGPT además
  // agrega utm_source=chatgpt.com a los links que cita.
  if (raw.includes('chatgpt') || raw.includes('openai')) return 'ChatGPT'
  if (raw.includes('perplexity')) return 'Perplexity'
  if (raw.includes('gemini') || raw.includes('bard.google')) return 'Gemini'
  if (raw.includes('copilot')) return 'Copilot'
  if (raw.includes('claude')) return 'Claude'
  if (raw.includes('google')) return 'Google'
  if (raw.includes('bing')) return 'Bing'
  if (raw.includes('pinterest')) return 'Pinterest'
  return a?.utm_source || a?.referrer_host || 'Directo'
}
