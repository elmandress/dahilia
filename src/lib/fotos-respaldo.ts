// Respaldo de fotos para cuando el Storage de Supabase no responde.
//
// El 20/09/2026 el proyecto quedó restringido por cuota de egress y las fotos
// pasaron a dar 402: el inicio mostró 13 de 15 imágenes rotas, con el texto
// alternativo sobre un cuadro crema. Las prendas SON el producto, así que un
// sitio sin fotos no vende.
//
// Acá viven copias locales (en /public, las sirve Netlify, no Supabase) de la
// foto principal de las prendas más vistas. `ImagenConRespaldo` las usa solo
// si la foto remota falla, así que en condiciones normales no cambian nada y
// cuando el servicio vuelve, el sitio se recupera solo.
//
// Para sumar o actualizar una: guardá el archivo como
// public/fotos-respaldo/<slug>.jpg (≤200 KB, 640px de ancho alcanza) y agregá
// el slug a esta lista.
export const FOTOS_RESPALDO = new Set([
  'bandana',
  'beach-set',
  'bolso-a-cuadros',
  'bolso-de-estudiante',
  'bolso-lola',
  'box-de-regalo',
  'bufanda-sophie',
  'calentadores',
  'cardigan-3-4',
  'cardigan-amour',
  'cardigan-cruzado',
  'chaleco',
  'cowl-neck-top',
  'donut-bag',
  'falda-serenada',
  'granny-s-cardigan',
  'mini-bufandas',
  'mini-tote-bag',
  'poncho',
  'set-brisa',
  'set-de-bufanda-y-guantes',
  'set-lueur',
  'set-lurex',
  'spring-cardigan',
  'sweater-cherry',
  'sweater-senda',
  'top-amelie',
  'top-cherry',
  'top-duna',
  'top-flower',
  'top-halter',
  'top-higgie',
  'top-lagom',
  'top-maresia',
  'top-race',
  'top-summer',
  'tote-bag-de-playa',
])

/** La foto local de esa prenda, o null si no hay respaldo para ella. */
export function fotoRespaldo(slug?: string | null): string | null {
  if (!slug) return null
  return FOTOS_RESPALDO.has(slug) ? `/fotos-respaldo/${slug}.jpg` : null
}
