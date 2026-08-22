-- ============================================================
-- Dahila Crochet — Atribución de canal en pedidos
-- (schema-orders-attribution.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- Requiere que database/schema-orders.sql ya haya corrido (la tabla
-- `orders` tiene que existir).
-- ============================================================
-- Agrega de dónde vino cada pedido (Instagram, Google, directo, etc.),
-- capturado en el navegador desde la URL (utm_source/medium/campaign) o el
-- referrer, sin depender de Umami/GA4 — así /admin/pedidos puede mostrar el
-- canal real de cada VENTA, no solo de las visitas que un script de
-- analytics pudo medir (los bloqueadores de anuncios no afectan esto: es un
-- POST directo a nuestra propia API, no un script de terceros).
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referrer_host text;
