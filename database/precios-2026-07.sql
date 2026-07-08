-- ============================================================
-- Dahila Crochet — Aumento de precios aprobado (precios-2026-07.sql)
-- Ejecutar UNA VEZ en el Supabase SQL Editor del proyecto de la tienda.
-- ============================================================
-- Fuente: tabla "HOY" de ESTRATEGIA-DEFINITIVA.md (aprobada por la dueña).
-- Criterio: primer paso moderado hacia el precio justo; prioriza las piezas
-- con más horas de trabajo y peor contribución por hora (statement y sets).
-- Bandana, Mini bufandas y Box de regalo quedan en HOLD (no se tocan).
--
-- Los precios por talle existentes se corren el MISMO delta absoluto que el
-- precio base del producto (el sobrecosto de un talle grande es materia/horas
-- extra, un monto fijo — no un porcentaje).
--
-- Nota: es una migración de datos puntual, no de esquema. Si más adelante se
-- vuelven a ajustar precios desde el panel, NO re-ejecutar este archivo
-- (pisaría los valores nuevos con los de julio 2026).
-- ============================================================

-- 1. Precio base por producto ─────────────────────────────────
UPDATE products p
SET base_price_uyu = v.price
FROM (VALUES
  -- Prioridad 🔴 (statement y sets subvaluados)
  ('set-brisa',                890),   -- 690 → 890  (+29%)
  ('cardigan-3-4',            1290),   -- 1100 → 1290 (+17%)
  ('cardigan-cruzado',        1290),   -- 1100 → 1290 (+17%)
  ('poncho',                  1290),   -- 1100 → 1290 (+17%)
  ('set-lueur',               1150),   -- 999 → 1150  (+15%)
  -- Prioridad 🟠
  ('chaleco',                 1190),   -- 1000 → 1190 (+19%)
  ('set-lurex',               1250),   -- 1100 → 1250 (+14%)
  ('beach-set',               1490),   -- 1300 → 1490 (+15%)
  ('top-flower',              1250),   -- 1100 → 1250 (+14%)
  ('top-cherry',              1090),   -- 990 → 1090  (+10%)
  ('top-summer',              1090),   -- 990 → 1090  (+10%)
  ('falda-serenada',          1090),   -- 990 → 1090  (+10%)
  -- Prioridad 🟡
  ('top-higgie',              1050),   -- 950 → 1050  (+11%)
  ('top-race',                 990),   -- 899 → 990   (+10%)
  ('top-maresia',              990),   -- 899 → 990   (+10%)
  ('top-lagom',                990),   -- 899 → 990   (+10%)
  ('top-amelie',               990),   -- 899 → 990   (+10%)
  ('top-halter',               890),   -- 780 → 890   (+14%)
  ('top-duna',                 890),   -- 780 → 890   (+14%)
  ('set-de-bufanda-y-guantes', 790),   -- 700 → 790   (+13%)
  ('cowl-neck-top',            620),   -- 560 → 620   (+11%)
  -- Prioridad 🟢 (bolsos y accesorios — ya bien pagos por hora)
  ('bolso-de-estudiante',      720),   -- 650 → 720   (+11%)
  ('tote-bag-de-playa',        720),   -- 670 → 720   (+7%)
  ('donut-bag',                720),   -- 650 → 720   (+11%)
  ('bolso-a-cuadros',         1050),   -- 950 → 1050  (+11%)
  ('mini-tote-bag',            650),   -- 590 → 650   (+10%)
  ('bolso-lola',              1390),   -- 1300 → 1390 (+7%)
  ('bufanda-sophie',           590),   -- 550 → 590   (+7%)
  ('calentadores',             590)    -- 550 → 590   (+7%)
  -- HOLD (sin cambio): bandana (500), mini-bufandas (360), box-de-regalo (650)
) AS v(slug, price)
WHERE p.slug = v.slug;

-- 2. Precios por talle (mismo delta absoluto que el precio base) ─────────────
UPDATE product_sizes ps
SET price_uyu = v.price
FROM (VALUES
  ('beach-set',        'S', 1090),  -- 900 + 190
  ('beach-set',        'M', 1290),  -- 1100 + 190
  ('beach-set',        'L', 1490),  -- 1300 + 190
  ('cardigan-cruzado', 'S', 1190),  -- 999 + 190 (redondeado)
  ('cardigan-cruzado', 'M', 1390),  -- 1200 + 190
  ('cardigan-cruzado', 'L', 1540),  -- 1350 + 190
  ('chaleco',          'S', 1140),  -- 950 + 190
  ('chaleco',          'M', 1290),  -- 1100 + 190
  ('chaleco',          'L', 1440),  -- 1250 + 190
  ('set-lueur',        'S', 1150),  -- 999 + 150 (redondeado)
  ('set-lueur',        'M', 1350),  -- 1199 + 150 (redondeado)
  ('set-lueur',        'L', 1450),  -- 1299 + 150 (redondeado)
  ('set-lurex',        'S', 1250),  -- 1100 + 150
  ('set-lurex',        'M', 1350),  -- 1200 + 150
  ('set-lurex',        'L', 1450),  -- 1300 + 150
  ('top-flower',       'S', 1100),  -- 950 + 150
  ('top-flower',       'M', 1250),  -- 1100 + 150
  ('top-flower',       'L', 1400)   -- 1250 + 150
) AS v(slug, size, price), products p
WHERE p.slug = v.slug
  AND ps.product_id = p.id
  AND ps.size = v.size;
