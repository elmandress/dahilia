-- ============================================================
-- Dahila Crochet — encender Navidad 2026 (navidad-2026.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- 12/10/2026. Prende el aviso "llega para Navidad" del inicio y de las fichas
-- (ver src/lib/navidad.ts). Las fechas son una PROPUESTA calculada con los
-- datos reales, para que Anush las confirme o cambie antes de correr esto
-- (o después, desde Configuración → Navidad):
--
--   - Encargos a medida hasta el viernes 27/11: el plazo más largo del
--     catálogo es 3 semanas (lead_time_weeks_max = 3), y hoy además hay cola
--     ("listos a finales de octubre"). 27/11 + 3 semanas = 18/12, y quedan
--     unos días de margen para el envío por agencia antes del 24.
--   - Piezas ya tejidas hasta el viernes 18/12: solo falta el envío.
--
-- Igual, cada ficha esconde el aviso sola si SU plazo ya no entra antes del
-- 24/12, y todo desaparece solo pasada cada fecha.
-- ============================================================

INSERT INTO site_settings (key, value) VALUES
  ('navidad_enabled', 'true'),
  ('navidad_encargo_hasta', '2026-11-27'),
  ('navidad_stock_hasta', '2026-12-18')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Verificación:
-- SELECT key, value FROM site_settings WHERE key LIKE 'navidad%';
