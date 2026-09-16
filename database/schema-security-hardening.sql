-- ⚠️ 14/09/2026: SUPERADO. Correr database/seguridad-2026-09.sql, que hace
--    los PASOS 1 a 3 de este archivo de una vez, sin nada que descomentar y
--    sin riesgo de quedarte afuera del panel. Este archivo queda como historia.
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
    'collections','testimonials','homepage_media',
    -- Agregadas 2026-09-03 (auditoría): estas 3 migraciones se sumaron un
    -- día después de escribirse este archivo (2026-07-08 vs. 2026-07-07,
    -- ver git log) y nunca se incorporaron acá — hasta ahora, correr este
    -- PASO 3 dejaba coupons/subscribers con la policy abierta original.
    'coupons','subscribers',
    -- 04/09/2026: costos internos del marcador de precios (costos-produccion-2026-09.sql).
    'product_costs'
  ] LOOP
    -- Si la tabla todavía no existe (una migración que no se corrió), se
    -- saltea en vez de cortar el PASO 3 entero: DROP POLICY IF EXISTS falla
    -- igual si la TABLA no existe — el IF EXISTS es sobre la policy.
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      -- Recrea una única policy de administración basada en is_admin().
      EXECUTE format('DROP POLICY IF EXISTS "Admin manage %1$s" ON %1$I', t);
      EXECUTE format(
        'CREATE POLICY "Admin manage %1$s" ON %1$I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
        t
      );
    END IF;
  END LOOP;
END $$;

-- coupon_redemptions y weaver_applications quedan FUERA del loop genérico a
-- propósito: sus policies abiertas originales (schema-cupones.sql,
-- schema-tejedoras.sql) se llamaron con un ESPACIO en el nombre ("Admin
-- manage coupon redemptions", "Admin manage weaver applications"), no con
-- guion bajo como el resto — el DROP POLICY del loop de arriba arma el
-- nombre a partir del nombre de tabla (guion bajo) y nunca las habría
-- encontrado. Sin este bloque aparte, correr el PASO 3 hubiera dejado la
-- policy vieja "USING (true)" viva EN PARALELO a una nueva con is_admin():
-- como las policies permisivas de Postgres se combinan con OR, la tabla
-- habría seguido abierta a cualquier autenticado pese a "correr el fix".
-- Hallazgo de la auditoría 03/09/2026 — nunca se ejecutó así en producción.
DROP POLICY IF EXISTS "Admin manage coupon redemptions" ON coupon_redemptions;
CREATE POLICY "Admin manage coupon_redemptions" ON coupon_redemptions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage weaver applications" ON weaver_applications;
CREATE POLICY "Admin manage weaver_applications" ON weaver_applications
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

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


-- ⚠️ SUPERADO (nota del 12/09/2026) — NO CORRER ESTE PASO 4.
--   cart_items y favorites ya quedaron cerradas con
--   database/cerrar-carritos-favoritos.sql (ya corrido), que además deja a la
--   admin leerlas vía is_admin(). Las route handlers ya usan la service role.
--   Si se descomenta lo de abajo, /admin/carritos deja de ver los carritos
--   (USING (false) no tiene excepción para la admin).
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
