'use client'

import { useState, useSyncExternalStore } from 'react'
import { sortSizes } from './types'
import type { Product, ProductSize } from './types'
import { waLink, WHATSAPP_DEFAULT } from './whatsapp'

// El último talle que eligió la clienta: la próxima prenda arranca en ese talle
// si lo tiene disponible, en vez de volver a pedírselo en cada ficha
// (investigación 13/09/2026). Solo si el talle existe tal cual en la prenda
// nueva: una "M" no se arrastra a un bolso de talle único.
const SIZE_KEY = 'dahila_talle'
const noSubscribe = () => () => {}
function readRememberedSize(): string | null {
  try { return localStorage.getItem(SIZE_KEY) } catch { return null }
}

// ?talle=M/L en la URL deja ese talle elegido (17/09/2026). Google lo exige
// para mostrar cada talle como variante en sus fichas de comerciantes: cada
// variante tiene que poder abrirse ya elegida desde su propia URL (ver el
// ProductGroup de /tienda/[slug]). Se lee en el cliente, igual que el talle
// recordado, para no romper la hidratación.
function readUrlSize(): string | null {
  try { return new URLSearchParams(window.location.search).get('talle') } catch { return null }
}

type TalleFila = Pick<ProductSize, 'size' | 'available'> & { sort_order?: number | null }

/**
 * Qué talle queda elegido, a partir de lo que se sabe (puro: lo prueban las
 * unitarias). Arranca en el talle recordado si esta prenda lo tiene
 * disponible; si no, en el primer talle DISPONIBLE, no en el primero de la
 * lista (que puede estar agotado y dejaría el botón "Agregar" apuntando a un
 * talle sin stock). "Primero" en el orden que eligió la dueña (sort_order): los
 * productos que no pasan por el catálogo normalizado (colecciones, ofertas,
 * favoritos) pueden traer los talles desordenados (auditoría 12/09/2026).
 *
 * `talle` es el talle con el que se trabaja; `elegido`, el que se muestra como
 * elegido (VIS-01, 04/11/2026). Con dos o más disponibles y nadie que eligiera,
 * `elegido` es null y `necesitaElegir` es true: ningún talle aparece marcado y
 * el botón pide elegir. Antes la ficha pintaba de negro el primero (un XS/S que
 * nadie eligió) y "Agregar" lo sumaba; sin devoluciones, eso es un pedido
 * equivocado o una charla para corregirlo. Con una sola variante disponible no
 * hay nada que elegir: esa cuenta como elegida.
 */
export function resolverSeleccion<T extends TalleFila>({ sizes, chosen, urlSize, remembered }: {
  sizes: T[] | null | undefined
  /** El que tocó la clienta en esta visita. */
  chosen: string | null
  /** ?talle= de la URL. */
  urlSize: string | null
  /** El último que eligió en otra ficha (localStorage). */
  remembered: string | null
}) {
  const filas = sortSizes(sizes)
  const disponibles = filas.filter((s) => s.available)
  const rememberedFits = remembered && disponibles.some((s) => s.size === remembered) ? remembered : null
  // El de la URL manda sobre el recordado: es el que pidió el link. Se acepta
  // aunque esté agotado, porque la ficha tiene que mostrar ESA variante (con su
  // aviso de agotado), no saltar a otra. Un talle que la prenda no tiene se ignora.
  const urlFits = urlSize && filas.some((s) => s.size === urlSize) ? urlSize : null
  const talle = chosen ?? urlFits ?? rememberedFits ?? (disponibles[0]?.size || filas[0]?.size || 'Único')
  // ¿El talle lo eligió alguien (ella ahora, el link o una visita anterior) o
  // es solo el primero disponible?
  const talleConfirmed = chosen !== null || urlFits !== null || rememberedFits !== null
  const elegido = talleConfirmed || disponibles.length === 1 ? talle : null
  const necesitaElegir = disponibles.length > 1 && !talleConfirmed
  return { talle, talleConfirmed, disponibles, elegido, necesitaElegir }
}

/**
 * Selección de talle compartida entre la ficha completa (ProductDetailsClient)
 * y la vista rápida (QuickViewModal) — antes duplicada letra por letra en los
 * dos archivos (auditoría 03/09/2026). La regla vive en resolverSeleccion.
 */
export function useSizeSelection(product: Product) {
  const sizes = sortSizes(product.sizes)
  // En el servidor y al hidratar no hay talle recordado ni de la URL (null): el
  // HTML sale sin talle elegido y el recordado aparece recién en el cliente,
  // sin error de hidratación (leerlo en el valor inicial de un useState sí la
  // rompería).
  const remembered = useSyncExternalStore(noSubscribe, readRememberedSize, () => null)
  const fromUrl = useSyncExternalStore(noSubscribe, readUrlSize, () => null)
  const [chosen, setChosen] = useState<string | null>(null)
  const { talle, talleConfirmed, disponibles, elegido, necesitaElegir } = resolverSeleccion({
    sizes, chosen, urlSize: fromUrl, remembered,
  })

  const setTalle = (size: string) => {
    setChosen(size)
    try { localStorage.setItem(SIZE_KEY, size) } catch { /* storage bloqueado */ }
  }

  // ¿El talle elegido está en stock? Un producto sin filas de talle se trata
  // como disponible — son piezas de talle único.
  const selectedSizeRow = sizes.find((s) => s.size === talle)
  const sizeAvailable = !selectedSizeRow || selectedSizeRow.available

  return { talle, setTalle, sizeAvailable, talleConfirmed, elegido, necesitaElegir, disponibles }
}

/**
 * Mensaje de WhatsApp prellenado para "avisame cuando vuelva" en un producto
 * agotado — mismo texto en la ficha completa, la vista rápida y el aviso del
 * carrito cuando la pieza se agota al agregarla. El link lo arma waLink: un
 * link de Configuración sin https o con '?phone=' ya no lo rompe (QA-15).
 */
export function getRestockWhatsAppUrl(product: Pick<Product, 'name'>, whatsappUrl: string): string {
  const text = `Hola! Vi "${product.name}" en la web pero está agotado. ¿Me avisás cuando vuelva? 🧶`
  return waLink(whatsappUrl, text) ?? waLink(WHATSAPP_DEFAULT, text)!
}
