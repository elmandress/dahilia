-- ============================================================
-- Dahila Crochet — INSERT público de pedidos acotado (pedidos-insert-seguro-2026-11.sql)
-- Run in the Supabase SQL Editor (el proyecto de la tienda, no el que ve el MCP).
-- Idempotent: safe to re-run.
-- Requiere schema-orders.sql, embudo-pedidos-2026-09.sql y
-- seguimiento-pedidos-2026-10.sql (ya corridos: status, stage, tracking_code
-- y las columnas de producción).
-- ============================================================
-- Por qué (04/11/2026, auditoría CRO-08 / QA-M2): la policy
-- "Public insert orders log" es WITH CHECK (true). La clave pública viaja en
-- el navegador, así que cualquiera puede hacer POST a /rest/v1/orders con
-- cualquier columna: un pedido con status 'vendido', stage 'enviado', una
-- tejedora asignada o un código de seguimiento elegido. Eso infla "Vendidos",
-- el monto vendido y "De dónde vienen" en /admin/pedidos, y el pedido aparece
-- en /pedido. /api/orders es la única que inserta, y nunca manda esas columnas.
--
-- PASO A (ahora): la policy pública solo deja insertar un pedido recién
-- llegado, como los que arma /api/orders. Sirve con el código de hoy (que
-- inserta con la clave pública) y con el nuevo (que inserta con la clave de
-- servicio y ni pasa por acá).
--
-- PASO B (después, comentado abajo): borrar la policy. Recién cuando Mati
-- confirme que SUPABASE_SERVICE_ROLE_KEY está en Netlify y esté desplegado el
-- /api/orders que inserta con la clave de servicio. Si se corre antes, el
-- respaldo con la clave pública deja de registrar pedidos (la venta por
-- WhatsApp sigue igual, pero no queda registro).
-- ============================================================

-- PASO A ------------------------------------------------------------------
DROP POLICY IF EXISTS "Public insert orders log" ON orders;
CREATE POLICY "Public insert orders log" ON orders
  FOR INSERT WITH CHECK (
    status = 'nuevo'
    AND stage = 'recibido'
    AND weaver_id IS NULL
    AND weaver_pay_uyu IS NULL
    AND weaver_paid IS NOT TRUE
    AND stage_updated_at IS NULL
    AND (tracking_code IS NULL OR tracking_code ~ '^PED-[A-HJ-NP-Z2-9]{6}$')
  );

-- PASO B (NO correr todavía) ----------------------------------------------
-- Con SUPABASE_SERVICE_ROLE_KEY confirmada en Netlify y /api/orders con
-- service role desplegado:
--
-- DROP POLICY IF EXISTS "Public insert orders log" ON orders;

-- Verificación --------------------------------------------------------------
-- 1) La policy quedó con la condición nueva:
--    SELECT policyname, cmd, with_check FROM pg_policies
--     WHERE tablename = 'orders' AND policyname = 'Public insert orders log';
--
-- 2) Prueba con la clave PÚBLICA, desde una terminal. Un pedido "vendido"
--    tiene que dar 42501 (RLS) y no crear ninguna fila:
--    curl -s -X POST "$SUPABASE_URL/rest/v1/orders" \
--      -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
--      -H "Content-Type: application/json" \
--      -d '{"items":[],"status":"vendido"}'
--    → {"code":"42501","message":"new row violates row-level security policy for table \"orders\"", ...}
