-- ============================================================
-- Dahila Crochet — Atribución de canal en encargos
-- (schema-encargos-attribution.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Mismo criterio que schema-orders-attribution.sql pero para `custom_orders`
-- (el formulario de /encargo): de dónde vino cada pedido a medida, capturado
-- en el navegador (utm_source/medium/campaign o referrer), sin depender de
-- Umami/GA4. Ver src/lib/attribution.ts.
-- ============================================================

ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS referrer_host text;
