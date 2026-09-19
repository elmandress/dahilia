// Los ids de productos, ítems del carrito y favoritos son uuid en Postgres.
// Un valor con otra forma no puede existir: se rechaza antes de ir a la base,
// que si no contesta con un error de sintaxis (22P02) y la ruta devuelve 500
// después de gastar un viaje a Supabase. Auditoría de seguridad 19/09/2026.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}
