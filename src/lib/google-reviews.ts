import 'server-only'

// Reseñas reales del Perfil de Google (Places API New), pedidas en el momento
// en que alguien llega a la sección. NO se guardan.
//
// Por qué no se cachean (política verificada el 16/09/2026,
// developers.google.com/maps/documentation/places/web-service/policies):
// "You must not pre-fetch, cache, or store Places API content beyond the
// allowed exceptions, although the place_id is exempt from caching
// restrictions" y "You can therefore store place ID values indefinitely".
// O sea: el identificador del lugar sí se puede guardar; las reseñas, la
// puntuación y el conteo no. Por eso esto no usa unstable_cache ni ISR, y la
// ruta que lo expone va con no-store.
//
// Costo: el SKU "Place Details Enterprise + Atmosphere" sale USD 25 cada 1.000
// llamadas, con 1.000 gratis por mes. La sección pide los datos recién cuando
// entra en pantalla, así que se gasta una llamada por visitante que llega
// hasta ahí, no una por visita.
//
// Configuración (Netlify → Environment variables):
//   GOOGLE_PLACES_API_KEY   clave de Google Cloud con Places API (New) activada
//   GOOGLE_PLACE_ID         opcional; si falta, se resuelve por nombre una vez
//
// Sin la clave, todo esto devuelve null y la sección no se muestra: nunca se
// inventan reseñas ni puntajes.

const KEY = process.env.GOOGLE_PLACES_API_KEY
const PLACE_ID_ENV = process.env.GOOGLE_PLACE_ID
const BUSCAR = 'Dahila Crochet, Montevideo, Uruguay'
const TIMEOUT_MS = 4000

// ─── Tope de gasto, en el código ─────────────────────────────────────────────
// Google cobra automáticamente lo que pase de las 1.000 llamadas gratis del mes
// (USD 25 cada 1.000). Este contador corta antes: cuando se llega al tope del
// día, la sección deja de pedir reseñas y no se dibuja, sin errores a la vista.
// 30 por día ≈ 900 por mes, debajo del tramo gratuito incluso en el peor caso.
//
// Límite honesto de esto: el contador vive en memoria del servidor, y Netlify
// puede levantar más de una instancia, así que el tope real es "30 por día por
// instancia". Es un cinturón, no la única protección: el freno duro es la cuota
// diaria en Google Cloud (APIs y servicios → Places API → Cuotas), que sí es
// global. Los dos juntos hacen que una factura sorpresa sea imposible.
const MAX_POR_DIA = Math.max(0, Number(process.env.GOOGLE_PLACES_MAX_DIA ?? 30))
let díaActual = ''
let usadasHoy = 0

function dentroDelTope(): boolean {
  const hoy = new Date().toISOString().slice(0, 10)
  if (hoy !== díaActual) {
    díaActual = hoy
    usadasHoy = 0
  }
  if (usadasHoy >= MAX_POR_DIA) {
    if (usadasHoy === MAX_POR_DIA) {
      usadasHoy += 1 // avisa una sola vez por día, no en cada visita
      console.warn(`Reseñas de Google: se llegó al tope de ${MAX_POR_DIA} llamadas por día. La sección no se muestra hasta mañana.`)
    }
    return false
  }
  usadasHoy += 1
  return true
}

export interface GoogleReview {
  author: string
  /** Foto de perfil de quien escribió. La atribución es obligatoria. */
  photo: string | null
  rating: number
  text: string
  /** "hace 2 semanas", tal como lo devuelve Google en español. */
  when: string
  /** Link a ESA reseña en Google. Obligatorio poder abrirla. */
  uri: string | null
}

export interface GoogleReviewsData {
  rating: number
  total: number
  /** Link al perfil en Google Maps. */
  mapsUri: string | null
  reviews: GoogleReview[]
}

async function pedir(url: string, init: RequestInit): Promise<unknown | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, cache: 'no-store' })
    if (!res.ok) {
      console.error('Places API', res.status, (await res.text()).slice(0, 200))
      return null
    }
    return await res.json()
  } catch (e) {
    console.error('Places API sin respuesta', e instanceof Error ? e.message : e)
    return null
  } finally {
    clearTimeout(t)
  }
}

// El identificador SÍ se puede guardar (es la excepción de la política), así
// que se resuelve una vez por proceso y queda en memoria.
let placeIdEnMemoria: string | null = PLACE_ID_ENV?.trim() || null

async function resolverPlaceId(): Promise<string | null> {
  if (placeIdEnMemoria) return placeIdEnMemoria
  const json = await pedir('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName',
    },
    body: JSON.stringify({ textQuery: BUSCAR, languageCode: 'es', regionCode: 'UY' }),
  }) as { places?: Array<{ id?: string; displayName?: { text?: string } }> } | null
  const primero = json?.places?.[0]
  // Chequeo mínimo de que es el negocio y no un homónimo.
  if (!primero?.id || !/dahila/i.test(primero.displayName?.text ?? '')) return null
  placeIdEnMemoria = primero.id
  return placeIdEnMemoria
}

interface PlaceDetails {
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: Array<{
    rating?: number
    relativePublishTimeDescription?: string
    text?: { text?: string }
    originalText?: { text?: string }
    googleMapsUri?: string
    authorAttribution?: { displayName?: string; photoUri?: string; uri?: string }
  }>
}

/** Puntuación, cantidad y hasta 5 reseñas. null si no está configurado o falla. */
export async function fetchGoogleReviews(): Promise<GoogleReviewsData | null> {
  if (!KEY) return null
  const placeId = await resolverPlaceId()
  if (!placeId) return null

  const json = await pedir(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=es&regionCode=UY`,
    {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': KEY,
        'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
      },
    }
  ) as PlaceDetails | null
  if (!json || typeof json.rating !== 'number') return null

  // El texto va entero, sin recortar: la política pide mostrarlo tal cual.
  const reviews: GoogleReview[] = (json.reviews ?? [])
    .map((r) => ({
      author: r.authorAttribution?.displayName?.trim() || 'Clienta de Dahila',
      photo: r.authorAttribution?.photoUri ?? null,
      rating: typeof r.rating === 'number' ? r.rating : 0,
      text: (r.text?.text ?? r.originalText?.text ?? '').trim(),
      when: r.relativePublishTimeDescription?.trim() || '',
      uri: r.googleMapsUri ?? r.authorAttribution?.uri ?? null,
    }))
    .filter((r) => r.text.length > 0)

  return {
    rating: json.rating,
    total: json.userRatingCount ?? 0,
    mapsUri: json.googleMapsUri ?? null,
    reviews,
  }
}
