import 'server-only'
import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * El usuario logueado SI figura en `admins` (función is_admin() de la base),
 * o null. Tener sesión no alcanza: el registro de cuentas de Supabase estuvo
 * abierto, así que cualquiera podía tener una (auditoría 14/09/2026).
 * El proxy hace el mismo chequeo para las páginas de /admin
 * (lib/supabase/middleware.ts); esto cubre server actions y route handlers,
 * que se pueden llamar directo sin pasar por esas páginas.
 * Ver database/seguridad-2026-09.sql.
 */
export async function getAdminUser(supabase: SupabaseClient): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.rpc('is_admin')
  return !error && data === true ? user : null
}
