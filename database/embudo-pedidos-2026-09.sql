-- ============================================================
-- Dahila Crochet — embudo carrito → pedido → venta (embudo-pedidos-2026-09.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Por qué (12/09/2026): el admin muestra muchos carritos y pocos pedidos,
-- pero hoy los números no se pueden cruzar:
--   * un pedido no guarda de qué carrito salió, así que un carrito que YA
--     terminó en pedido sigue apareciendo como "activo";
--   * no hay forma de marcar si un pedido de WhatsApp se vendió o no.
-- Esto agrega las dos cosas. El código ya está preparado: /api/orders
-- guarda el carrito si la columna existe, y /admin/pedidos muestra el
-- selector de estado cuando existe `status`. Sin correr esto, todo sigue
-- funcionando igual que antes.
-- ============================================================

-- 1) De qué carrito salió cada pedido (la cookie dahila_cart_id).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cart_id text;
CREATE INDEX IF NOT EXISTS idx_orders_cart_id ON orders(cart_id);

-- 2) Cómo terminó el pedido: lo marca Anush en /admin/pedidos.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'nuevo';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check') THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_status_check CHECK (status IN ('nuevo', 'vendido', 'no_concreto'));
  END IF;
END $$;

-- 3) El admin puede cambiar el estado. Hasta ahora `orders` solo tenía
--    insertar (público), leer y borrar (admin): sin esta policy, el cambio
--    de estado fallaría en silencio.
DROP POLICY IF EXISTS "Admin update orders log" ON orders;
CREATE POLICY "Admin update orders log" ON orders
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Verificación:
-- SELECT status, count(*) FROM orders GROUP BY status;
