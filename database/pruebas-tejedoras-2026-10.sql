-- ============================================================
-- Dahila Crochet — ficha de la muestra de cada tejedora (pruebas-tejedoras-2026-10.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- 12/10/2026. Anush está probando muchas tejedoras para poder delegar muchos
-- pedidos y quedarse con lo más difícil. Para compararlas con el mismo
-- criterio, cada postulación guarda el resultado de su muestra pagada:
--   - qué modelo tejió, cuántas horas le llevó (cronometradas), la calidad
--     (1 a 5) y la tarifa por hora acordada.
-- Con eso /admin/tejedoras aplica la regla de delegación de Estrategia:
--   horas × tarifa + materiales ≤ 70% del precio.
--
-- weaver_applications ya es privada para lectura (solo admin), así que estas
-- columnas no se exponen en ningún lado público.
-- ============================================================

ALTER TABLE weaver_applications
  ADD COLUMN IF NOT EXISTS sample_product_id uuid REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE weaver_applications ADD COLUMN IF NOT EXISTS sample_hours numeric(5,1);
ALTER TABLE weaver_applications ADD COLUMN IF NOT EXISTS sample_quality smallint;
ALTER TABLE weaver_applications ADD COLUMN IF NOT EXISTS sample_rate_uyu integer;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'weaver_sample_quality_range') THEN
    ALTER TABLE weaver_applications
      ADD CONSTRAINT weaver_sample_quality_range CHECK (sample_quality IS NULL OR sample_quality BETWEEN 1 AND 5);
  END IF;
END $$;

-- Verificación:
-- SELECT name, status, sample_hours, sample_quality, sample_rate_uyu FROM weaver_applications;
