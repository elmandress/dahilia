-- ============================================================
-- Dahila Crochet — margen de ganancia por prenda (margen-por-prenda-2026-10.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Pedido 12/10/2026: en la calculadora de cada producto, poder elegir el
-- margen de ganancia y que quede guardado con la prenda (una pieza de entrada
-- y una de colección no llevan la misma ganancia). Antes el margen vivía solo
-- en la pantalla y volvía a 15% cada vez.
--
-- Va en product_costs (privada, sin lectura pública) junto a horas y
-- materiales: es información interna del negocio, no se muestra en la tienda.
-- NULL = la prenda usa el margen por defecto (15%).
-- ============================================================

ALTER TABLE product_costs ADD COLUMN IF NOT EXISTS margin_pct numeric(5,1);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_costs_margin_pct_range') THEN
    ALTER TABLE product_costs
      ADD CONSTRAINT product_costs_margin_pct_range CHECK (margin_pct IS NULL OR (margin_pct >= 0 AND margin_pct <= 300));
  END IF;
END $$;

-- Verificación:
-- SELECT product_id, labor_hours, materials_cost_uyu, margin_pct FROM product_costs;
