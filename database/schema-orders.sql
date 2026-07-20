-- ============================================================
-- Dahila Crochet — Captura de pedidos enviados (schema-orders.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Hoy, cuando alguien completa el checkout, el mensaje se arma en el
-- navegador y se abre WhatsApp — no queda ningún registro en la base. Esta
-- migración agrega una tabla `orders` de solo-registro (append-only): una
-- fila por cada vez que alguien tocó "Coordinar por WhatsApp", con una foto
-- de lo que llevaba. NO reemplaza a WhatsApp como canal de venta — Anush
-- sigue coordinando ahí — esto es solo para poder ver el historial sin tener
-- que buscar en los chats.
--
-- Seguridad: la tabla se puede INSERTAR desde el sitio público (como
-- cart_items hoy), pero SOLO se puede LEER/BORRAR si sos admin — a
-- diferencia de cart_items/custom_orders, que hoy dejan leer a cualquier
-- usuario autenticado (ver schema-security-hardening.sql). Por eso esta
-- migración crea `admins` + `is_admin()` si todavía no existen (son
-- exactamente las mismas definiciones que trae schema-security-hardening.sql
-- — correr esta migración sola alcanza para que `orders` quede bien).
--
-- ⚠️ Si todavía no insertaste tu user_id en `admins`, /admin/pedidos te va a
-- mostrar 0 pedidos aunque haya datos (RLS te va a estar bloqueando a vos
-- también). Corré esto para insertarte:
--   select id, email from auth.users order by created_at;   -- para ver tu id
--   insert into admins (user_id, email) values ('<tu-id>', '<tu-email>')
--   on conflict (user_id) do nothing;
-- ============================================================

-- 1. Tabla de administradores + helper is_admin() — igual que en
--    schema-security-hardening.sql; CREATE IF NOT EXISTS la hace idempotente
--    sin importar si esa migración ya corrió antes.
CREATE TABLE IF NOT EXISTS admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
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

-- 2. La tabla de pedidos en sí.
CREATE TABLE IF NOT EXISTS orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz DEFAULT now(),
  -- Foto de lo que llevaba: [{name, slug, size, qty, unit_price_uyu}, ...]
  -- Es una copia, no una referencia — si un producto se borra o cambia de
  -- precio después, el pedido sigue mostrando lo que realmente se pidió.
  items          jsonb NOT NULL,
  subtotal_uyu   numeric NOT NULL DEFAULT 0,
  discount_uyu   numeric NOT NULL DEFAULT 0,
  total_uyu      numeric NOT NULL DEFAULT 0,
  coupon_code    text,
  free_shipping  boolean NOT NULL DEFAULT false,
  gift_note      text
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert orders log" ON orders;
CREATE POLICY "Public insert orders log" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read orders log" ON orders;
CREATE POLICY "Admin read orders log" ON orders
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin delete orders log" ON orders;
CREATE POLICY "Admin delete orders log" ON orders
  FOR DELETE TO authenticated USING (public.is_admin());
