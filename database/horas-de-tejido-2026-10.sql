-- ============================================================
-- Dahila Crochet — horas de tejido en la ficha (horas-de-tejido-2026-10.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Pedido 08/10/2026: mostrar en la ficha de cada prenda cuántas horas de
-- tejido lleva, para que la clienta entienda el precio de algo hecho a mano.
--
-- POR QUÉ UNA COLUMNA EN `products` y no leerlo de product_costs: product_costs
-- es privada a propósito (tiene el costo de materiales y no tiene policy de
-- lectura pública). Las horas que se MUESTRAN van acá, en una columna pública;
-- las de la cuenta interna siguen en product_costs.labor_hours. El editor del
-- admin carga las dos desde un solo campo ("Horas de tejido") y un check
-- "Mostrar en la ficha" decide si esta columna queda con el número o en NULL.
--
-- NULL = la ficha no dice nada de horas (el estado de todas las prendas hasta
-- que Anush las confirme una por una). No se precarga con las horas estimadas
-- de la tabla de precios: mostrarle a una clienta un número que nadie
-- cronometró sería inventar.
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS knit_hours numeric(5,1);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_knit_hours_positive'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_knit_hours_positive CHECK (knit_hours IS NULL OR knit_hours > 0);
  END IF;
END $$;

-- Verificación:
-- SELECT name, knit_hours FROM products ORDER BY sort_order;
