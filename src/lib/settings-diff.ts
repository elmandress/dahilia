// Qué cambió en Configuración y si otra pantalla lo pisó mientras tanto
// (QA-09 y QA-ARQ-1, 04/11/2026).
//
// Anush y Mati editan desde dispositivos distintos, y site_settings también lo
// escriben el reloj del drop, la bio, los reels, el blog y Estrategia. Antes de
// guardar se releen SOLO las claves que se van a escribir y se comparan por
// VALOR con lo que se cargó al abrir la pantalla. No por fecha: site_settings
// no tiene trigger de updated_at y Estrategia escribe sin ella, así que un
// chequeo por fecha dejaría pasar justo esas pisadas.
//
// Puro a propósito: lo prueban las unitarias con node:test.

type Valores = Record<string, string | null | undefined>

/** Una fila que no existe y una fila vacía no son lo mismo: si otra pantalla
 *  borró la clave, también es un cambio. */
const valor = (v: string | null | undefined): string | null => (v == null ? null : String(v))

/**
 * Claves con un valor distinto del que se cargó (lo que hay que guardar). En
 * pantalla, una clave sin fila se ve como campo vacío: tocarla y dejarla vacía
 * no es un cambio (antes quedaba "con cambios" y creaba una fila vacía).
 */
export function cambiosPendientes(antes: Valores, ahora: Valores): string[] {
  return Object.keys(ahora).filter((k) => ahora[k] != null && (antes[k] ?? '') !== ahora[k])
}

/**
 * Claves cuyo valor en la base ya no es el que se cargó: otra pantalla las
 * cambió (o las borró) después de abrir esta. `frescos` es la relectura de la
 * base justo antes de escribir; una clave sin fila no está en el objeto.
 */
export function conflictos(antes: Valores, frescos: Valores, claves: string[]): string[] {
  return claves.filter((k) => valor(frescos[k]) !== valor(antes[k]))
}
