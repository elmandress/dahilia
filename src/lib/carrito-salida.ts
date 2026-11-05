// Qué ofrecer cuando en el carrito no queda nada para pedir (NEG-2, revisión
// final 05/11/2026). Antes era siempre "ya no está disponible… ¿se puede
// volver a tejer?", también con la prenda a la venta y solo el talle
// renombrado. Lo usan el cajón y /carrito.
//
// Aparte de cart-summary a propósito: ese módulo lo importa CartProvider, y
// todo lo que tenga viaja en el JS de cada página (INT-2).
//
// Puro (sin JSX ni next/*): lo prueban las unitarias con node:test.
import type { Product } from './types'
import { variantLabel } from './types'
import type { CartIssue } from './cart-summary'
import { waLink, WHATSAPP_DEFAULT, mensajeVolverATejer } from './whatsapp'

/**
 * La salida según el motivo. Si las piezas tienen motivos distintos (o se
 * agotaron), queda la de volver a tejer.
 */
export type SalidaSinPedible =
  | { tipo: 'volver-a-tejer' }
  | { tipo: 'elegir-talle'; slug: string }
  | { tipo: 'a-medida'; slug: string }
  | { tipo: 'proximamente' }

export function salidaSinPedible(
  noDisponibles: Array<{ item: { product: Pick<Product, 'slug'> }; issue: CartIssue }>
): SalidaSinPedible {
  const todas = (issue: CartIssue) => noDisponibles.length > 0 && noDisponibles.every((u) => u.issue === issue)
  const slug = noDisponibles[0]?.item.product.slug ?? ''
  if (todas('talle-inexistente')) return { tipo: 'elegir-talle', slug }
  if (todas('a-medida')) return { tipo: 'a-medida', slug }
  if (todas('drop-oculto')) return { tipo: 'proximamente' }
  return { tipo: 'volver-a-tejer' }
}

/** Lo que dicen el cajón y /carrito sin nada para pedir: el texto y el botón. */
export interface SalidaSinPedido {
  tipo: SalidaSinPedible['tipo']
  texto: string
  label: string
  href: string
  /** true: abre WhatsApp en otra pestaña; false: una página del sitio. */
  externo: boolean
}

export function salidaSinPedido(
  noDisponibles: Array<{ item: { product: Pick<Product, 'slug' | 'name' | 'sizes'> }; issue: CartIssue }>,
  whatsappUrl: string
): SalidaSinPedido {
  const salida = salidaSinPedible(noDisponibles)
  const una = noDisponibles.length <= 1
  const pieza = una ? 'La pieza de tu carrito' : 'Las piezas de tu carrito'
  switch (salida.tipo) {
    case 'elegir-talle': {
      const rotulo = variantLabel(noDisponibles[0]?.item.product.sizes) === 'Modelo' ? 'modelo' : 'talle'
      return {
        tipo: salida.tipo,
        texto: una
          ? `Cambió el ${rotulo} de la pieza de tu carrito: elegilo de nuevo en su ficha.`
          : `Cambiaron los ${rotulo}s de las piezas de tu carrito: elegilos de nuevo en cada ficha.`,
        label: `Elegir el ${rotulo} de nuevo`,
        href: `/tienda/${salida.slug}`,
        externo: false,
      }
    }
    case 'a-medida':
      return {
        tipo: salida.tipo,
        texto: `${pieza} ahora ${una ? 'se teje' : 'se tejen'} solo a medida.`,
        label: una ? 'Pedila a medida' : 'Pedir a medida',
        href: `/encargo?desde=${encodeURIComponent(salida.slug)}`,
        externo: false,
      }
    case 'proximamente':
      return {
        tipo: salida.tipo,
        texto: `${pieza} todavía no ${una ? 'está' : 'están'} a la venta. En la lista privada te avisamos cuando ${una ? 'salga' : 'salgan'}.`,
        label: una ? 'Avisame cuando salga' : 'Avisame cuando salgan',
        href: '/vip',
        externo: false,
      }
    default: {
      const text = mensajeVolverATejer(noDisponibles.map((u) => u.item.product.name))
      return {
        tipo: 'volver-a-tejer',
        texto: `${una ? 'La pieza de tu carrito ya no está disponible.' : 'Las piezas de tu carrito ya no están disponibles.'} Podés preguntarle a Anush si se puede volver a tejer.`,
        label: 'Preguntar si se puede volver a tejer',
        href: waLink(whatsappUrl, text) ?? waLink(WHATSAPP_DEFAULT, text)!,
        externo: true,
      }
    }
  }
}
