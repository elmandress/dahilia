// Fuente única de lectura/escritura de "vistos hace poco" — antes vivía
// duplicada (misma key, mismo límite, misma lógica) en RecentlyViewed.tsx
// (PDP) y en TiendaClient.tsx (tienda). Cada componente sigue con su propio
// diseño (son contextos distintos), pero ahora leen/escriben del mismo lugar.
export interface RecentItem {
  slug: string
  name: string
  photo: string
  price: number
}

const KEY = 'dahila_recently_viewed'
const MAX = 8

/** Safe on SSR/private mode — nunca tira. */
export function readRecentlyViewed(): RecentItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Registra `item` como visto y devuelve la lista completa actualizada (más reciente primero). */
export function recordRecentlyViewed(item: RecentItem): RecentItem[] {
  const prev = readRecentlyViewed()
  const next = [item, ...prev.filter((p) => p.slug !== item.slug)].slice(0, MAX)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* modo privado / storage lleno */ }
  return next
}
