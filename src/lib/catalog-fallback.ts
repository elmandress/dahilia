// Qué catálogo servir cuando una parte de la base falla (QA-08, 04/11/2026).
//
// El catálogo sale de dos consultas cacheadas por separado (lib/catalog.ts):
// el núcleo (productos, categorías, colores y colecciones), que sostiene la
// tienda, y los ajustes (descuentos y Configuración). Antes iban juntas, y un
// error en descuentos o Configuración tiraba TODA la tienda al snapshot
// commiteado: con el del 05/10 eran precios de octubre, sin el drop y con
// "listos a principios de octubre" en el aviso de espera, aunque los productos
// en vivo respondieran.
//
// Acá se decide sin tocar la red ni Next (por eso se prueba con node:test): lo
// que respondió, el último catálogo bueno de esta instancia y el snapshot
// entran por parámetro, y sale el catálogo a mostrar.

import type { Catalog } from './catalog'

export type CatalogCore = Pick<Catalog, 'products' | 'categories' | 'colors' | 'collections'>
export type CatalogExtra = Pick<Catalog, 'discounts' | 'settings'>

/** El último catálogo que salió entero en vivo, con el momento en que se vio. */
export interface LastGood {
  catalog: Catalog
  at: number
}

/** Hasta dónde sirve el último bueno. Más viejo, los descuentos y los avisos ya
 *  pueden ser otros: conviene el snapshot, que dice que es un respaldo. */
export const LAST_GOOD_MAX_MS = 24 * 60 * 60 * 1000

// Claves de Configuración atadas a una fecha: el aviso de lista de espera, el
// próximo drop, la barra de promo y Navidad. Leídas de un snapshot viejo
// afirman algo vencido ("listos a principios de octubre" en noviembre). Sin
// ellas, cada bloque cae a su texto de siempre o no se muestra.
const CLAVE_CON_FECHA = /^(queue_note_|drop_|promo_bar_|navidad_)/

/** Configuración sin las claves que vencen. Un interruptor apagado
 *  (`promo_bar_enabled = 'false'`) se queda: apagar no afirma nada, y sin él la
 *  barra de promo volvería con su texto por defecto aunque Anush la apagó. */
export function sinClavesConFecha(settings: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(settings).filter(([key, value]) =>
      !CLAVE_CON_FECHA.test(key) || (key.endsWith('_enabled') && value === 'false'),
    ),
  )
}

/**
 * El catálogo a mostrar según lo que respondió la base:
 * - todo en vivo → en vivo;
 * - núcleo en vivo y ajustes caídos → los productos en vivo, con descuentos y
 *   Configuración del último bueno (si tiene menos de 24 h); si no, la
 *   Configuración del snapshot sin las claves con fecha y ningún descuento
 *   (las reglas viejas del snapshot aplicadas a precios de hoy darían un
 *   precio que nadie fijó). Queda marcado `degraded`;
 * - núcleo caído → el último bueno si tiene menos de 24 h; si no, el snapshot.
 *   Del snapshot tampoco salen las claves con fecha: puede llevar semanas
 *   desplegado cuando la base se cae.
 */
export function componerCatalogo({
  core,
  extra,
  lastGood,
  snapshot,
  now,
}: {
  core: CatalogCore | null
  extra: CatalogExtra | null
  lastGood: LastGood | null
  snapshot: Catalog
  now: number
}): Catalog {
  const reciente = lastGood && now - lastGood.at < LAST_GOOD_MAX_MS ? lastGood.catalog : null

  if (core && extra) return { ...core, ...extra, source: 'live' }

  if (core) {
    return {
      ...core,
      discounts: reciente?.discounts ?? [],
      settings: reciente?.settings ?? sinClavesConFecha(snapshot.settings),
      source: 'live',
      degraded: true,
    }
  }

  if (reciente) return { ...reciente, degraded: true }
  return { ...snapshot, settings: sinClavesConFecha(snapshot.settings) }
}
