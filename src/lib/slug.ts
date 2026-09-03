// Saneamiento de slugs de /tienda/[slug].
//
// Por qué existe: en GA4 aparece `/tienda/spring-cardigan 🥰` con título
// "Producto no encontrado". Es un link pegado desde Instagram donde el emoji
// (o un espacio, o un punto final de una oración) quedó pegado a la URL.
// Antes eso daba 404 y se perdía la visita; ahora se redirige 308 al slug real.
//
// Todos los slugs del catálogo son [a-z0-9-] (verificado contra el snapshot),
// así que la regla puede ser estricta: cualquier otro carácter es basura
// pegada, no parte del slug. Eso evita falsos positivos con acentos/ñ.

/**
 * Normaliza un slug quitando lo que no sea [a-z0-9-].
 * Devuelve `null` si no queda nada aprovechable.
 */
export function cleanSlug(raw: string): string | null {
  // Decodificar PRIMERO: el slug puede llegar percent-encoded
  // (`spring-cardigan%20%F0%9F%A5%B0`), que es justo la forma en que llega el
  // caso real de Instagram. Sin esto, el `%` y los dígitos del escape
  // sobreviven al filtro y quedan pegados al slug ("spring-cardigan20f09fa5b0").
  // decodeURIComponent lanza con secuencias mal formadas (un `%` suelto):
  // en ese caso seguimos con el original, que igual se limpia abajo.
  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    /* secuencia inválida: limpiamos el crudo */
  }

  const cleaned = decoded
    .normalize('NFC')
    // Espacios (incluido %20 ya decodificado), emojis y puntuación → fuera.
    // A propósito NO se pasa a minúsculas: normalizar mayúsculas haría que
    // /tienda/Spring-Cardigan redirija a /tienda/spring-cardigan, y en un
    // filesystem case-insensitive las dos rutas comparten el mismo archivo de
    // caché ISR — el redirect terminaba pisando la página real del producto.
    // Además no hay un solo caso de mayúsculas en los datos: lo que llega de
    // Instagram es el emoji o el espacio pegado al final.
    .replace(/[^a-zA-Z0-9-]+/g, '')
    // Guiones sobrantes en los extremos: "-spring-cardigan-" → "spring-cardigan".
    .replace(/^-+|-+$/g, '')

  return cleaned.length > 0 ? cleaned : null
}

/**
 * Si `raw` trae basura pegada, devuelve el slug limpio para redirigir.
 * Si ya está limpio (el caso normal), devuelve `null` — no hay que hacer nada.
 */
export function slugRedirectTarget(raw: string): string | null {
  const cleaned = cleanSlug(raw)
  if (!cleaned || cleaned === raw) return null
  return cleaned
}
