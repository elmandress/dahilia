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
  const [chosen, setChosen] = useState<string | null>(null)
  const talle = chosen ?? rememberedFits ?? (firstAvailable || sizes[0]?.size || 'Único')

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
