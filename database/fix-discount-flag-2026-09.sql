-- ============================================================
-- Dahila Crochet — corrige un dato inconsistente (fix-discount-flag-2026-09.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Encontrado en la auditoría de mercado/producto del 03/09/2026: el producto
-- "Set de bufanda y guantes" tiene discount_active = true con
-- discount_percent = 0. Hoy no muestra ningún badge de oferta (el código
-- exige percent > 0 para renderizarlo), pero queda armado para activarse
-- solo el día que alguien cargue un % sin revisar el toggle.
--
-- Esta migración apaga discount_active en CUALQUIER producto que hoy tenga
-- esa misma combinación (no solo el caso encontrado), para dejar la base
-- consistente de una vez. El editor de producto ya se actualizó (working
-- tree, 03/09/2026) para no volver a guardar esta combinación.
-- ============================================================

UPDATE products
SET discount_active = false
WHERE discount_active = true
  AND (discount_percent IS NULL OR discount_percent <= 0);
