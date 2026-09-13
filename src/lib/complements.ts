// Qué categoría complementa a cuál — compartido entre la PDP ("Completá el
// look" / relacionados) y el cross-sell del carrito, para que ambos sugieran
// con el mismo criterio de negocio.
export const COMPLEMENT_PREFS: Record<string, string[]> = {
  tops: ['bolsos', 'faldas', 'sets', 'accesorios'],
  cardigans: ['tops', 'accesorios', 'bolsos'],
  // Sweaters es categoría real y no tenía preferencia: su "Completá el look"
  // salía en el orden en que llegaba el catálogo (auditoría 12/09/2026).
  sweaters: ['accesorios', 'tops', 'cardigans'],
  sets: ['bolsos', 'accesorios', 'cardigans'],
  faldas: ['tops', 'accesorios', 'bolsos'],
  bolsos: ['tops', 'accesorios', 'sets'],
  accesorios: ['cardigans', 'tops', 'bolsos'],
}
