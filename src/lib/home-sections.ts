// Secciones de prendas de la home, armadas en el servidor (VIS-06, 04/11/2026).
// Antes HomeClient armaba "Nuevo", "Disponible ahora" y "Accesorios" cada una
// por su lado con las 12 primeras del catálogo, y el mismo bolso salía en las
// tres: 11 tarjetas para 5 prendas, una tienda de 41 que parecía de 5. Ahora
// cada prenda aparece una sola vez, en la primera sección que la reclama, y al
// cliente viajan como mucho 12 (4 por sección).
//
// Puro (sin JSX ni next/*): lo usan la página de la home y HomeClient, y lo
// prueban las unitarias (tests/unit/home-secciones.test.mjs).
import type { Product } from '@/lib/types'
import { isReadyToShip } from '@/lib/types'
import { SITE_URL } from '@/lib/env'

export interface SeccionesHome {
  /** Las últimas publicadas, por fecha de alta (no por el orden manual). */
  nuevo: Product[]
  /** Ya tejidas, listas para enviar (isReadyToShip) que no salieron en "Nuevo". */
  enStock: Product[]
  /** Accesorios que no salieron arriba. */
  accesorios: Product[]
}

/** Una fila de 4 en escritorio, dos de 2 en el celular. */
const POR_SECCION = 4
/** Una sección con una sola tarjeta se ve como un descuido: no se muestra. */
const MINIMO = 2

export function armarSeccionesHome(productos: Product[]): SeccionesHome {
  const activos = productos.filter((p) => p.status === 'active')
  const usadas = new Set<string>()
  const tomar = (lista: Product[], minimo = MINIMO): Product[] => {
    const elegidas = lista.filter((p) => !usadas.has(p.id)).slice(0, POR_SECCION)
    // Una sección que no llega al mínimo no se muestra, y sus prendas quedan
    // libres para la siguiente.
    if (elegidas.length < minimo) return []
    for (const p of elegidas) usadas.add(p.id)
    return elegidas
  }
  const porFecha = [...activos].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
  // "Nuevo" sí va con una sola prenda: vacía, la home diría "No hay piezas en
  // la tienda por ahora" teniendo una.
  const nuevo = tomar(porFecha, 1)
  const enStock = tomar(activos.filter(isReadyToShip))
  const accesorios = tomar(activos.filter((p) => p.category?.slug === 'accesorios'))
  return { nuevo, enStock, accesorios }
}

/**
 * Destino del botón de la portada (hero_cta_href): una ruta del sitio. Un link
 * completo copiado de la barra del navegador ("https://dahila.uy/colecciones/
 * sunset-26") se convierte en ruta, con la misma regla que Configuración; antes
 * caía a /tienda sin avisar (QA-15). Lo que no es del sitio va a /tienda.
 */
export function destinoPortada(raw: string | null | undefined, siteUrl: string = SITE_URL): string {
  let v = (raw ?? '').trim()
  if (/^https?:\/\//i.test(v)) {
    try {
      const host = (h: string) => h.replace(/^www\./, '').toLowerCase()
      const url = new URL(v)
      if (host(url.hostname) === 'dahila.uy' || host(url.hostname) === host(new URL(siteUrl).hostname)) {
        v = `${url.pathname}${url.search}${url.hash}`
      }
    } catch {
      // No es una URL: cae a /tienda abajo.
    }
  }
  return v.startsWith('/') && !v.startsWith('//') ? v : '/tienda'
}

/** Dos rutas del sitio llevan a la misma página (sin mirar query, ancla ni barra final). */
export function mismaRuta(a: string | null | undefined, b: string | null | undefined): boolean {
  const limpia = (r: string) => r.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  return !!a && !!b && limpia(a) === limpia(b)
}

/** Cómo va el bloque del drop debajo de la portada en el celular (VIS-02). */
export type DropArriba = 'ocultar-movil' | 'compacto-movil'

/**
 * Con el drop abierto y la portada llevando ya a su colección, el bloque del
 * drop repetía el mismo destino (cinta, portada y bloque: tres links a la
 * colección en pantalla y media) y empujaba la primera prenda a 1,96
 * pantallas: en el celular se oculta. Si llevan a lugares distintos, o el drop
 * todavía no abrió, va compacto (sin foto ni texto largo). En escritorio el
 * bloque no cambia. Los textos de la portada no se tocan: son de Configuración.
 */
export function varianteDropArriba({ dropLive, heroHref, dropCollectionHref }: {
  dropLive: boolean
  heroHref: string
  dropCollectionHref: string | null
}): DropArriba {
  return dropLive && mismaRuta(heroHref, dropCollectionHref) ? 'ocultar-movil' : 'compacto-movil'
}
