-- ============================================================
-- Dahila Crochet — Papelera / archivado de encargos (schema-archive-orders.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Goal: dar a la dueña una forma cómoda de sacar de la vista los encargos
-- cancelados/completados sin destruir el historial (soft-delete), con opción
-- de restaurar o eliminar definitivamente desde /admin/encargos.
--
-- El panel degrada con gracia: si esta migración NO se corrió, el botón
-- "Archivar" muestra un aviso pidiendo correrla, y todo lo demás sigue igual.
-- ============================================================

-- 1. Columna de archivado (NULL = visible en las pestañas normales).
ALTER TABLE custom_orders
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- 2. Índice parcial para listar rápido lo archivado (papelera) sin penalizar
--    la consulta normal (que filtra archived_at IS NULL del lado del cliente).
CREATE INDEX IF NOT EXISTS idx_custom_orders_archived
  ON custom_orders(archived_at)
  WHERE archived_at IS NOT NULL;

-- ============================================================
-- 3. (OPCIONAL) Limpieza automática de la papelera.
--    Borra DEFINITIVAMENTE los encargos cancelados que estén archivados
--    hace más de `p_days` días. No toca nada que no esté cancelado+archivado.
--    Ejecutala a mano cuando quieras, o programala con pg_cron (ver abajo).
-- ============================================================
CREATE OR REPLACE FUNCTION public.purge_archived_orders(p_days int DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM custom_orders
  WHERE status = 'cancelled'
    AND archived_at IS NOT NULL
    AND archived_at < now() - make_interval(days => p_days);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Solo el service_role / dashboard debería ejecutar la purga.
REVOKE ALL ON FUNCTION public.purge_archived_orders(int) FROM public, anon, authenticated;

-- Para programarla mensualmente (requiere la extensión pg_cron habilitada):
--   select cron.schedule('purge-archived-orders', '0 4 1 * *',
--          $$ select public.purge_archived_orders(90); $$);
