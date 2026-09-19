// Serializa datos estructurados para <script type="application/ld+json">.
//
// JSON.stringify NO escapa "</script>": si un texto cargado en el admin (el
// nombre o la descripción de un producto, un setting, una colección) lo
// contuviera, cerraría el script y lo que siguiera se interpretaría como HTML.
// Escapar <, > y & como secuencias \u00XX lo vuelve inofensivo, y el JSON es
// idéntico para quien lo lee (Google, las IAs): JSON.parse devuelve lo mismo.
// También se escapan los separadores de línea U+2028 y U+2029, que algunos
// intérpretes viejos tratan como fin de línea. Auditoría de seguridad del
// 19/09/2026.
//
// La barra invertida se arma con String.fromCharCode(92) a propósito: escrita
// literal junto a una "u" en el código fuente, algunas herramientas la
// convierten en el carácter y el escape se pierde.
const BS = String.fromCharCode(92)
const ESCAPES: Array<[RegExp, string]> = [
  [/</g, `${BS}u003c`],
  [/>/g, `${BS}u003e`],
  [/&/g, `${BS}u0026`],
  [new RegExp(String.fromCharCode(0x2028), 'g'), `${BS}u2028`],
  [new RegExp(String.fromCharCode(0x2029), 'g'), `${BS}u2029`],
]

export function jsonLdScript(data: unknown): string {
  let out = JSON.stringify(data)
  for (const [re, rep] of ESCAPES) out = out.replace(re, rep)
  return out
}
