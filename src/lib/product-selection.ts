'use client'

import { useState } from 'react'
import type { Product } from './types'

/**
 * Selección de talle compartida entre la ficha completa (ProductDetailsClient)
 * y la vista rápida (QuickViewModal) — antes duplicada letra por letra en los
 * dos archivos (auditoría 03/09/2026). Arranca en el primer talle DISPONIBLE,
 * no en el primero de la lista (que puede estar agotado y dejaría el botón
 * "Agregar" apuntando a un talle sin stock).
 */
export function useSizeSelection(product: Product) {
  const firstAvailable = product.sizes?.find((s) => s.available)?.size
  const [talle, setTalle] = useState<string>(firstAvailable || product.sizes?.[0]?.size || 'Único')

  // ¿El talle elegido está en stock? Un producto sin filas de talle se trata
  // como disponible — son piezas de talle único.
  const selectedSizeRow = product.sizes?.find((s) => s.size === talle)
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
