-- ============================================================
-- Dahila Crochet — seguimiento de pedidos y producción (seguimiento-pedidos-2026-10.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- Requiere schema-orders.sql y embudo-pedidos-2026-09.sql (ya corridos).
-- ============================================================
-- 12/10/2026. Dos cosas sobre la misma tabla `orders`:
--
-- 1. SEGUIMIENTO para la clienta (como Rudy Jude y las marcas a pedido):
--    cada pedido sale de la tienda con un código (PED-XXXXXX) que va dentro
--    del mensaje de WhatsApp. En dahila.uy/pedido lo ingresa y ve en qué
--    etapa está: recibido → confirmado → tejiendo → terminado → enviado.
--    Igual que con los encargos: la mayoría de los "¿cómo va lo mío?" se
--    responden solos.
--
-- 2. PRODUCCIÓN con la red de tejedoras: a qué tejedora se le asignó cada
--    pedido, cuánto se le paga y si ya se le pagó. /admin/produccion muestra
--    el tablero por etapa y cuánto se le debe a cada una.
--
-- La página pública lee con la clave de servicio en el servidor y muestra
-- SOLO la etapa y las prendas: nada de tejedora, pagos ni notas de regalo.
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code text;
CREATE UNIQUE INDEX IF NOT EXISTS orders_tracking_code_key ON orders(tracking_code) WHERE tracking_code IS NOT NULL;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'recibido';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_stage_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_stage_check
      CHECK (stage IN ('recibido', 'confirmado', 'tejiendo', 'terminado', 'enviado'));
  END IF;
END $$;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stage_updated_at timestamptz;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS weaver_id uuid REFERENCES weaver_applications(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS weaver_pay_uyu integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS weaver_paid boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_orders_stage ON orders(stage);
CREATE INDEX IF NOT EXISTS idx_orders_weaver ON orders(weaver_id);

-- Verificación:
-- SELECT tracking_code, status, stage, weaver_id, weaver_pay_uyu, weaver_paid
-- FROM orders ORDER BY created_at DESC LIMIT 20;
