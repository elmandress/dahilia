-- ============================================================
-- Dahila Crochet — Cerrar el acceso público a carritos y favoritos
-- Correr en el SQL Editor de Supabase. Idempotente.
-- ============================================================
--
-- ⚠️ ORDEN OBLIGATORIO: primero tiene que estar DEPLOYADO el código que usa
-- la clave de servicio en /api/cart y /api/favorites, y la variable
-- SUPABASE_SERVICE_ROLE_KEY tiene que estar cargada en Netlify.
-- Si corrés esto ANTES, el carrito del sitio deja de funcionar.
--
-- EL PROBLEMA QUE ARREGLA
-- `cart_items` y `favorites` tenían la policy `FOR ALL USING (true)`: sin
-- filtro por fila y sin cláusula TO, o sea que aplicaba también al rol
-- anónimo. Verificado en vivo con la anon key pública (la misma que viaja en
-- el navegador de cualquiera): un `select *` plano devolvía los 51 ítems de
-- carrito y los favoritos de TODAS las visitantes. Sin login, sin adivinar
-- ningún id. Y con `FOR ALL` también se podía editar y borrar.
--
-- POR QUÉ NO SE PODÍA ARREGLAR CON RLS SOLO
-- El dueño de un carrito anónimo es una cookie, no un usuario logueado. RLS
-- no puede leer esa cookie, así que no hay forma de escribir una policy que
-- diga "solo tu carrito". La solución correcta es la inversa: cerrar la
-- tabla del todo y que solo el servidor —que sí conoce la cookie— entre con
-- la clave de servicio, filtrando a mano por cart_id / fav_id.
--
-- QUÉ PASA DESPUÉS DE CORRER ESTO
-- La tienda sigue funcionando igual (el carrito pasa por el servidor). Lo
-- que deja de funcionar es leer carritos ajenos desde afuera.
-- ============================================================


-- ── cart_items ──────────────────────────────────────────────
-- Se elimina la policy abierta. Al no quedar NINGUNA policy que habilite a
-- anon, con RLS activo el acceso queda denegado por defecto — que es
-- exactamente lo que queremos. La clave de servicio saltea RLS, así que el
-- sitio sigue andando.
DROP POLICY IF EXISTS "Public manage cart_items" ON cart_items;
DROP POLICY IF EXISTS "Public read cart_items"   ON cart_items;
DROP POLICY IF EXISTS "Public insert cart_items" ON cart_items;
DROP POLICY IF EXISTS "Admin manage cart_items"  ON cart_items;

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- El admin (ya logueado y en la tabla `admins`) sigue viendo los carritos
-- abandonados en /admin/carritos. Sin esto esa pantalla queda vacía.
CREATE POLICY "Admin read cart_items" ON cart_items
  FOR SELECT TO authenticated USING (public.is_admin());


-- ── favorites ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Public manage favorites" ON favorites;
DROP POLICY IF EXISTS "Public read favorites"   ON favorites;
DROP POLICY IF EXISTS "Public insert favorites" ON favorites;
DROP POLICY IF EXISTS "Admin manage favorites"  ON favorites;

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read favorites" ON favorites
  FOR SELECT TO authenticated USING (public.is_admin());


-- ── Verificación ────────────────────────────────────────────
-- 1. Qué policies quedaron. Esperado: solo las dos "Admin read".
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('cart_items', 'favorites')
ORDER BY tablename, policyname;

-- 2. RLS activo en las dos. Ambas tienen que decir true.
SELECT relname AS tabla, relrowsecurity AS rls_activo
FROM pg_class
WHERE relname IN ('cart_items', 'favorites');

-- ============================================================
-- CÓMO COMPROBAR QUE FUNCIONÓ (2 minutos, desde el sitio)
--   1. Entrá a dahila.uy, agregá algo al carrito. Tiene que andar igual.
--   2. Recargá la página: la prenda tiene que seguir ahí.
--   3. Entrá a /admin/carritos: tenés que seguir viendo los carritos.
-- Si el paso 1 o 2 falla, es que falta la variable
-- SUPABASE_SERVICE_ROLE_KEY en Netlify (o falta redeployar después de
-- agregarla). Para volver atrás mientras tanto:
--   CREATE POLICY "Public manage cart_items" ON cart_items FOR ALL USING (true);
--   CREATE POLICY "Public manage favorites"  ON favorites  FOR ALL USING (true);
-- ============================================================
