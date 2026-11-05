// La prenda grande de /ig, arriba de todo (CRO-12, 04/11/2026). La página de la
// bio dependía de que Anush se acordara de "Fijar en la bio" (admin →
// Productos): con ig_destacado_slug vacío no mostraba ninguna prenda destacada.
// Ahora hay un respaldo, y cada una lleva un rótulo verdadero: "La del último
// reel" es solo para la que Anush fijó a mano; elegida sola, dice de dónde sale.
//
// Puro: lo prueban las unitarias (tests/unit/ig-destacada.test.mjs).
import type { Product } from '@/lib/types'
import { isReadyToShip } from '@/lib/types'

export interface Destacada {
  producto: Product
  rotulo: string
  /** 'fijada': la eligió Anush para el reel. 'drop': respaldo automático. */
  motivo: 'fijada' | 'drop'
}

export function elegirDestacada({ pinnedSlug, active, dropCollectionId, dropName, dropLive }: {
  /** site_settings.ig_destacado_slug ("Fijar en la bio"). */
  pinnedSlug: string | null | undefined
  /** Prendas visibles del catálogo. */
  active: Product[]
  /** Colección del drop, solo si está publicada. */
  dropCollectionId: string | null | undefined
  dropName: string
  /** El drop está prendido y ya abrió. */
  dropLive: boolean
}): Destacada | null {
  const slug = (pinnedSlug ?? '').trim()
  const fijada = slug ? active.find((p) => p.slug === slug && p.status === 'active') : undefined
  if (fijada) return { producto: fijada, rotulo: 'La del último reel', motivo: 'fijada' }

  const nombre = dropName.trim()
  if (dropLive && dropCollectionId && nombre) {
    // La primera en stock del drop, en el orden que eligió Anush para la colección.
    const enStock = active
      .filter((p) => p.collection_id === dropCollectionId && isReadyToShip(p))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    if (enStock[0]) return { producto: enStock[0], rotulo: `Del drop ${nombre} · en stock`, motivo: 'drop' }
  }
  return null
}
