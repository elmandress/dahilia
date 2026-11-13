-- ============================================================
-- Dahila Crochet — fin del CiberLunes (fin-ciberlunes-2026-11.sql)
-- Run in the Supabase SQL Editor (el proyecto de la tienda, no el que ve el MCP).
-- Idempotent: safe to re-run.
-- ============================================================
-- Por qué (13/11/2026): el −15 % del CiberLunes seguía prendido en las cuatro
-- prendas de Sunset ’26 y la barra de arriba seguía diciendo "15% off esta
-- semana". Se pidió sacarlo el 13/11 con el proyecto restringido por cuota
-- (402), así que no se pudo apagar desde el admin: el respaldo del catálogo
-- (src/lib/catalog-snapshot.json) ya salió sin el descuento, y esto lo apaga
-- en la base apenas vuelva a responder. Si no se corre, el descuento VUELVE a
-- la tienda cuando vuelva la base.
--
-- Qué hace:
--   1. Apaga el descuento propio del 15 % en las prendas del drop Sunset ’26
--      (solo ese: otro porcentaje o otra prenda no se tocan).
--   2. Saca "15% off esta semana" de la barra de promo, si sigue ahí.
-- No toca precios de lista ni las reglas de la tabla discounts (el 04/11 no
-- había ninguna activa).
--
-- Después de correrlo: entrar a /admin y guardar cualquier ficha (o esperar
-- hasta una hora) para que la tienda refresque su caché.
-- ============================================================

update products
   set discount_active = false,
       discount_percent = 0
 where discount_active
   and discount_percent = 15
   and slug in ('bolso-margot-butter', 'bolso-margot-cherry', 'poncho-ete', 'manguitas-tramonto');

update site_settings
   set value = 'Sunset ‘26 en stock',
       updated_at = now()
 where key = 'promo_bar_text'
   and value ilike '%15\% off%';

-- Verificación: las dos consultas tienen que volver vacías.
select slug, discount_percent from products where discount_active and discount_percent = 15;
select value from site_settings where key = 'promo_bar_text' and value ilike '%15\% off%';
