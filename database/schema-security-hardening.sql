-- ============================================================
-- Dahila Crochet — Endurecimiento de seguridad (schema-security-hardening.sql)
-- LEER TODO ANTES DE CORRER. Este archivo tiene pasos que requieren una
-- decisión tuya (qué usuario es admin) y NO debe correrse a ciegas.
-- ============================================================
-- Contexto de la auditoría (2026-07):
--   * CRÍTICO: el signup de Supabase Auth está ABIERTO y todas las policies de
--     escritura usan `TO authenticated USING (true)` → "cualquier usuario
--     logueado es admin". Como la anon key viaja en el bundle público,
--     cualquiera puede registrarse y quedar con acceso de admin (incluida la
--     PII de custom_orders).
--
-- ORDEN DE APLICACIÓN RECOMENDADO:
--   PASO 0 (dashboard, hazlo YA): Authentication → Providers/Sign In →
--           desactivar "Enable email signups". Mitiga el riesgo en el acto.
--   PASO 1: crear la tabla `admins` y la función is_admin().
--   PASO 2: INSERTAR TU user_id en `admins` (si no, te bloqueás a vos misma).
--   PASO 3: recién entonces, cambiar las policies a is_admin().
-- ============================================================


-- ============================================================
-- PASO 1 — Tabla de administradores + helper is_admin()
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- Nadie lee/edita esta tabla desde el cliente; solo el service_role/dashboard.
DROP POLICY IF EXISTS "No client access to admins" ON admins;
CREATE POLICY "No client access to admins" ON admins FOR SELECT USING (false);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ============================================================
-- PASO 2 — ⚠️ OBLIGATORIO antes del PASO 3 ⚠️
--   Buscá tu user_id en Authentication → Users (o con la consulta de abajo)
--   e insertalo. Si saltás esto y corrés el PASO 3, PERDÉS acceso de admin.
-- ============================================================
--   select id, email from auth.users order by created_at;   -- para ver tu id
--
-- INSERT INTO admins (user_id, email)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'tu-email@ejemplo.com')
-- ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- PASO 3 — Cambiar las policies de "cualquier autenticado" a "solo admin".
--   Descomentá este bloque SOLO después de completar el PASO 2 y de haber
--   verificado que tu fila está en `admins`.
-- ============================================================
/*
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products','categories','colors','product_media','product_sizes',
    'product_colors','custom_orders','site_settings','discounts',
    'collections','testimonials','homepage_media'
  ] LOOP
    -- Recrea una única policy de administración basada en is_admin().
    EXECUTE format('DROP POLICY IF EXISTS "Admin manage %1$s" ON %1$I', t);
    EXECUTE format(
      'CREATE POLICY "Admin manage %1$s" ON %1$I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
      t
    );
  END LOOP;
END $$;

-- Storage: reemplazar el patrón "cualquier authenticated escribe" por admin.
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Admin Upload Media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admin Update Media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_admin()) WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "Admin Delete Media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());
*/


-- ============================================================
-- PASO 4 (OPCIONAL, defensa en profundidad) — Cerrar cart_items / favorites.
--   Hoy tienen `FOR ALL USING (true)`: cualquiera con la anon key puede LEER,
--   editar o BORRAR los carritos de todos. El scoping real por cookie ya vive
--   en las route handlers (/api/cart, /api/favorites).
--
--   ⚠️ Para cerrarlas necesitás que esas route handlers usen la SERVICE_ROLE
--   key (server-only) en vez de la anon key. Si cerrás esto SIN hacer ese
--   cambio, el carrito del sitio deja de funcionar. Por eso queda comentado.
--
--   Pasos: (a) agregar SUPABASE_SERVICE_ROLE_KEY como env var server-only,
--          (b) crear un cliente admin en las route handlers de cart/favorites,
--          (c) descomentar lo de abajo.
-- ============================================================
/*
DROP POLICY IF EXISTS "Public manage cart_items" ON cart_items;
CREATE POLICY "No anon access to cart_items" ON cart_items FOR SELECT USING (false);

DROP POLICY IF EXISTS "Public manage favorites" ON favorites;
CREATE POLICY "No anon access to favorites" ON favorites FOR SELECT USING (false);
*/


-- ============================================================
-- PASO 5 (recomendado) — Limpieza de carritos viejos (TTL).
--   cart_items crece para siempre. Esta función borra ítems inactivos.
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_stale_carts(p_days int DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM cart_items
  WHERE added_at < now() - make_interval(days => p_days);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_stale_carts(int) FROM public, anon, authenticated;

-- Para programarla semanalmente (requiere pg_cron):
--   select cron.schedule('cleanup-stale-carts', '0 4 * * 1',
--          $$ select public.cleanup_stale_carts(90); $$);
