// El contenido del cajón del carrito baja aparte (INT-2, revisión final
// 05/11/2026). La lista, "Sumale un detalle" y el pedido por WhatsApp (con su
// checkout, el aviso del pedido y el armado del mensaje) iban en el JS que
// carga TODA página, también para quien nunca abre el carrito: ~8 KB
// comprimidos de los ~12 que la rama sumó en cada ruta. El armazón (panel,
// título y cerrar) sigue en el layout; esto baja cuando hay señal de que se va
// a abrir: al agregar algo, al pasar o apoyar el dedo en el ícono del
// carrito, o en un momento libre si el carrito ya tiene piezas.
import type { ComponentType } from 'react'

let promesa: Promise<ComponentType> | null = null
let listo: ComponentType | null = null

/** Baja el contenido una sola vez. Si falla (sin red), el próximo intento reintenta. */
export function cargarContenidoCajon(): Promise<ComponentType> {
  if (!promesa) {
    promesa = import('./CartDrawerContenido').then((m) => {
      listo = m.CartDrawerContenido
      return m.CartDrawerContenido
    })
    promesa.catch(() => { promesa = null })
  }
  return promesa
}

/** Adelanta la descarga ante una señal de que se va a abrir. Nunca falla. */
export function precargarCajon(): void {
  cargarContenidoCajon().catch(() => { /* se reintenta al abrir */ })
}

/** El contenido, si ya bajó. */
export function contenidoCajonListo(): ComponentType | null {
  return listo
}
