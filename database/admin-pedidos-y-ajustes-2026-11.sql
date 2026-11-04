-- ============================================================
-- Dahila Crochet — pedidos: motivo, monto cobrado y aviso a Meta; Configuración
-- interna fuera de la clave pública (admin-pedidos-y-ajustes-2026-11.sql)
-- Run in the Supabase SQL Editor (el proyecto de la tienda, no el que ve el MCP).
-- Idempotent: safe to re-run.
-- Requiere schema-orders.sql y embudo-pedidos-2026-09.sql (status de orders y
-- la policy "Admin update orders log"), ya corridos.
-- ============================================================
-- Por qué (04/11/2026, auditoría CRO-02, TRK-02 y QA-17):
--
-- 1) "No se concretó" no decía por qué. El motivo, opcional, usa las mismas
--    categorías que la planilla de research/decision-anuncios-2026-11.md, para
--    poder sumar las dos.
-- 2) Al marcar "Vendido", Anush confirma cuánto cobró por las prendas (sin
--    envío). Ese monto, y no el total que mandó el navegador, es el que le
--    llega a Meta como compra y el que suma "Monto vendido".
-- 3) La compra se avisa a Meta UNA vez: la fecha queda anotada cuando Meta
--    respondió bien, y volver a marcar el pedido no la manda de nuevo.
-- 4) Con la clave pública (la que viaja en el navegador) se leían todas las
--    filas de site_settings, también el estado interno de la lista privada y
--    el progreso de Estrategia. La tienda no los lee: el panel los sigue
--    leyendo con su policy de admin, y el reloj de la lista usa la clave de
--    servicio. qr_discount_code queda público a propósito: /gracias lo
--    muestra y va impreso en la tarjeta.
--
-- El código ya está preparado: sin correr esto, el panel marca "Vendido" sin
-- guardar el monto, no ofrece el motivo y avisa a Meta como antes (puede
-- repetirse si se vuelve a marcar). /admin lo muestra en "Falta terminar de
-- configurar" hasta que se corra.
-- ============================================================

-- 1) Por qué no se concretó (opcional).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS no_concreto_motivo text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_no_concreto_motivo_check') THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_no_concreto_motivo_check CHECK (
        no_concreto_motivo IS NULL
        OR no_concreto_motivo IN ('precio', 'envio', 'talle', 'pago', 'no_contesto', 'otro')
      );
  END IF;
END $$;

-- 2) Lo cobrado por las prendas, sin envío (UYU).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS purchase_value_uyu integer;

-- 3) Cuándo se le avisó la compra a Meta. Las ventas que ya estaban marcadas
--    quedan como avisadas, una sola vez (solo cuando se crea la columna): el
--    código anterior usaba otro event_id, así que volver a marcarlas mandaría
--    una compra nueva con fecha de hoy que Meta no reconocería como repetida.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'meta_purchase_sent_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN meta_purchase_sent_at timestamptz;
    UPDATE orders SET meta_purchase_sent_at = now() WHERE status = 'vendido';
  END IF;
END $$;

-- 4) La clave pública ya no lee la Configuración interna (lista_*, estrategia_*).
DROP POLICY IF EXISTS "Public read settings" ON site_settings;
CREATE POLICY "Public read settings" ON site_settings
  FOR SELECT USING (key !~ '^(lista_|estrategia_)');

-- Verificación ---------------------------------------------------------------
-- 1) Las tres columnas:
--    SELECT column_name, data_type FROM information_schema.columns
--     WHERE table_schema = 'public' AND table_name = 'orders'
--       AND column_name IN ('no_concreto_motivo', 'purchase_value_uyu', 'meta_purchase_sent_at');
--    → 3 filas.
--
-- 2) Con la clave PÚBLICA, desde una terminal (solo lectura). La lista privada
--    tiene que dar 0 filas y el WhatsApp de la tienda, 1:
--    curl -s "$SUPABASE_URL/rest/v1/site_settings?select=key&key=like.lista_*" \
--      -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
--    → []
--    curl -s "$SUPABASE_URL/rest/v1/site_settings?select=key&key=eq.contact_whatsapp_url" \
--      -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
--    → [{"key":"contact_whatsapp_url"}]
