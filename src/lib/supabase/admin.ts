import 'server-only'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from '@/lib/env'

/**
 * Cliente con `service_role`: SALTEA RLS por completo.
 *
 * Por qué existe: `cart_items` y `favorites` tenían policies `FOR ALL
 * USING (true)`, o sea que cualquiera con la anon key (que viaja en el bundle
 * público) podía leer, editar y borrar el carrito de CUALQUIER visitante —
 * verificado en vivo, un `select *` plano devolvía la tabla entera. El
 * scoping real por cookie siempre vivió en las route handlers, no en la base.
 *
 * Para poder cerrar esas policies, las rutas que legítimamente necesitan
 * cruzar filas de distintos visitantes tienen que autenticarse como servicio.
 * De ahí este cliente.
 *
 * REGLAS DE USO — no negociables:
 *  1. Solo en route handlers y server actions. El `import 'server-only'` hace
 *     que el build FALLE si alguien lo importa desde un componente cliente.
 *  2. Cada consulta filtra a mano por el scope del visitante (`cart_id`,
 *     `fav_id` de la cookie). Sin RLS de red, ese filtro ES la seguridad:
 *     una query sin `.eq()` acá expone datos de todo el mundo.
 *  3. Nunca se expone el resultado crudo de una consulta sin scopear.
 *
 * Devuelve null si la env var no está (deploy sin configurar): quien llame
 * debe caer al cliente normal en vez de romper. Así el sitio sigue andando
 * aunque falte la clave — degradado, no caído.
 */
let cached: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key.trim() === '') return null
  if (cached) return cached
  cached = createSupabaseClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
