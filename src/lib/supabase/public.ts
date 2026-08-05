import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env'

// Cliente de solo lectura para páginas públicas (home, /tienda, categorías,
// productos, colecciones, sitemap…). A diferencia de `supabase/server.ts`,
// NO toca `cookies()` — cookies() es una Request-time API y con Cache
// Components deshabilitado (next.config.ts no tiene `cacheComponents: true`,
// modelo "previous") su sola presencia en el árbol de render vuelve dinámica
// TODA la ruta, incluida cualquier página que use este layout, sin importar
// el `export const revalidate` que declare. Verificado con `next build`:
// antes de este cliente, cada ruta pública salía ƒ Dynamic.
//
// Ninguna lectura pública depende de sesión (las policies de estas tablas
// son de lectura abierta), así que este cliente sin cookies devuelve
// exactamente los mismos datos. El cliente CON cookies (`server.ts`) queda
// reservado para /admin, /api/cart, /api/favorites y demás rutas que sí
// necesitan la sesión del usuario.
export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })
}
