// Qué promete una ficha fuera del sitio: el <title>, la descripción, la tarjeta
// que viaja por WhatsApp e Instagram y la descripción de Pinterest (SEO-03,
// 04/11/2026). Las 7 piezas en stock del drop decían "tejido a mano, a tu
// medida" en el title y "en tus colores" en la descripción, y la tarjeta OG
// decía fijo "A tu talle y en tus colores" en las 41 fichas, bolsos incluidos.
// Mientras tanto la ficha decía "En stock: sale sin la espera de los
// encargos": quien llegaba de Google o de un link compartido esperaba elegir
// colores de una pieza que ya está tejida.
//
// Una sola fuente, pura (la usa también ProductDetailsClient, en el navegador).
// El estado de stock va solo en la descripción, que se renueva con el ISR: el
// title lo guarda Google durante semanas y WhatsApp guarda la vista previa por
// URL, y son piezas de pocas unidades.
import type { Discount, Product } from './types'
import {
  dropVisibility, getEffectivePrice, getFinalPrice, getListingSize, hasPriceRange,
  isReadyToShip, isTalleUnico, variantLabel,
} from './types'
import { localTermFor } from './vocabulario'

/** ¿Se elige talle de verdad? Hay filas, no es solo "Único" y son talles, no
 *  modelos (las Pulseras Terra no se hacen "a tu talle"). */
function tieneTallesReales(p: Pick<Product, 'sizes'>): boolean {
  return !isTalleUnico(p.sizes) && variantLabel(p.sizes) === 'Talle'
}

/** Se teje cuando la encargan (no está en stock): es la única que se puede
 *  hacer en otros colores o a medida. */
function aPedido(p: Product): boolean {
  return !isReadyToShip(p)
}

/**
 * El remate del title ("Spring cardigan — saco tejido a mano, a tu medida") y
 * la línea de valor de la descripción.
 *   - En stock, o sin talles reales: "tejido a mano en Uruguay". "En Uruguay"
 *     es el modificador con el que se puede rankear (ver las categorías en
 *     tienda/[slug]/page.tsx).
 *   - A pedido y con talles reales: "tejido a mano, a tu medida".
 * La palabra uruguaya va solo si el nombre no la trae (lib/vocabulario.ts).
 */
export function promesaFicha(p: Product): { titulo: string; linea: string } {
  const local = localTermFor(p)
  const termino = local ? `${local} ` : ''
  if (!aPedido(p)) {
    return {
      titulo: `${termino}tejido a mano en Uruguay`,
      linea: 'Tejido a mano en Montevideo. En stock: sale sin espera. Envío a todo Uruguay.',
    }
  }
  if (tieneTallesReales(p)) {
    return {
      titulo: `${termino}tejido a mano, a tu medida`,
      linea: 'Tejido a mano en Montevideo, en tu talle y en tus colores. Envío a todo Uruguay.',
    }
  }
  return {
    titulo: `${termino}tejido a mano en Uruguay`,
    linea: 'Tejido a mano en Montevideo, en tus colores. Envío a todo Uruguay.',
  }
}

/** El pie de la tarjeta OG. Sin el estado de stock: la imagen queda guardada
 *  en las vistas previas mucho después de que la pieza se venda. */
export function textoTarjetaOG(p: Product): string {
  if (!aPedido(p)) return 'Tejido a mano en Uruguay'
  return tieneTallesReales(p)
    ? 'Tejido a mano en Uruguay · A tu talle y en tus colores'
    : 'Tejido a mano en Uruguay · En tus colores'
}

export interface DatosTarjetaOG {
  nombre: string
  /** Precio final del talle disponible más barato (con descuentos de lote). */
  final: number
  /** Precio de lista del mismo talle: se muestra tachado si es mayor. */
  lista: number
  /** El precio cambia según el talle: va "desde". */
  desde: boolean
  pie: string
}

/**
 * Qué muestra la tarjeta OG de una ficha, o null para la tarjeta genérica de
 * la marca (SEO-13). null sin prenda, con la prenda en un drop que todavía no
 * se lanzó (colección en borrador o "Próximamente": la RLS esconde la
 * colección y el join llega vacío) o en borrador: la ruta /og no puede
 * mostrar nombre, precio ni foto a quien adivine el slug por un adelanto de
 * Instagram. Las "Solo con link" (acceso de la lista VIP) se muestran: ese
 * link se comparte a propósito. Exige el join `collection`.
 */
export function datosTarjetaOG(p: Product | null | undefined, discounts: Discount[] = []): DatosTarjetaOG | null {
  if (!p) return null
  if (dropVisibility(p) === 'hidden') return null
  if (p.status !== 'active' && p.status !== 'soldout') return null
  // El mismo precio "desde" que la tarjeta de la tienda, con los descuentos
  // de lote: antes la tarjeta de WhatsApp mostraba el precio lleno si había
  // una regla por categoría.
  const talle = getListingSize(p)
  return {
    nombre: p.name,
    final: getFinalPrice(p, talle, discounts),
    lista: getEffectivePrice(p, talle),
    desde: hasPriceRange(p),
    pie: textoTarjetaOG(p),
  }
}
