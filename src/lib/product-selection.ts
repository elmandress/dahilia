'use client'

import { useState, useSyncExternalStore } from 'react'
import { sortSizes } from './types'
import type { Product } from './types'

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

/**
 * Selección de talle compartida entre la ficha completa (ProductDetailsClient)
 * y la vista rápida (QuickViewModal) — antes duplicada letra por letra en los
 * dos archivos (auditoría 03/09/2026). Arranca en el talle recordado si esta
 * prenda lo tiene disponible; si no, en el primer talle DISPONIBLE, no en el
 * primero de la lista (que puede estar agotado y dejaría el botón "Agregar"
 * apuntando a un talle sin stock).
 *
 * "Primero" en el orden que eligió la dueña (sort_order): los productos que no
 * pasan por el catálogo normalizado (colecciones, ofertas, favoritos) pueden
 * traer los talles desordenados, y el talle por defecto no puede depender de
 * eso (auditoría 12/09/2026).
 */
export function useSizeSelection(product: Product) {
  const sizes = sortSizes(product.sizes)
  const firstAvailable = sizes.find((s) => s.available)?.size
  // En el servidor y al hidratar no hay talle recordado (null): el HTML sale
  // igual que siempre y el recordado aparece recién en el cliente, sin error de
  // hidratación (leerlo en el valor inicial de un useState sí la rompería).
  const remembered = useSyncExternalStore(noSubscribe, readRememberedSize, () => null)
  const rememberedFits = remembered && sizes.some((s) => s.size === remembered && s.available) ? remembered : null
  // El de la URL manda sobre el recordado: es el que pidió el link. Se acepta
  // aunque esté agotado, porque la ficha tiene que mostrar ESA variante (con su
  // aviso de agotado), no saltar a otra. Un talle que la prenda no tiene se ignora.
  const fromUrl = useSyncExternalStore(noSubscribe, readUrlSize, () => null)
  const urlFits = fromUrl && sizes.some((s) => s.size === fromUrl) ? fromUrl : null
  const [chosen, setChosen] = useState<string | null>(null)
  const talle = chosen ?? urlFits ?? rememberedFits ?? (firstAvailable || sizes[0]?.size || 'Único')

  const setTalle = (size: string) => {
    setChosen(size)
    try { localStorage.setItem(SIZE_KEY, size) } catch { /* storage bloqueado */ }
  }

  // ¿El talle elegido está en stock? Un producto sin filas de talle se trata
  // como disponible — son piezas de talle único.
  const selectedSizeRow = sizes.find((s) => s.size === talle)
  const sizeAvailable = !selectedSizeRow || selectedSizeRow.available

  return { talle, setTalle, sizeAvailable }
}

/**
 * Mensaje de WhatsApp prellenado para "avisame cuando vuelva" en un producto
 * agotado — mismo texto en la ficha completa y en la vista rápida.
 */
export function getRestockWhatsAppUrl(product: Product, whatsappUrl: string): string {
  const text = encodeURIComponent(
    `Hola! Vi "${product.name}" en la web pero está agotado. ¿Me avisás cuando vuelva? 🧶`
  )
  return `${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${text}`
}
