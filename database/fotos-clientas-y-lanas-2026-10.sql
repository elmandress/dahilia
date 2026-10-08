-- ============================================================
-- Dahila Crochet — fotos de lanas y de clientas (fotos-clientas-y-lanas-2026-10.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Pedido 08/10/2026 ("agregá todo" sobre la lista de ideas):
--
-- 1. colors.image_url — foto de cerca del ovillo real. En la ficha, tocar un
--    color muestra esa foto en vez de solo el circulito: sin devoluciones, ver
--    el color verdadero antes de comprar es lo que da confianza. Se sube desde
--    /admin/colores. NULL = el color se ve como hasta ahora.
--
-- 2. testimonials.photo_url + product_id — "Clientas con su Dahila": la foto
--    de una clienta usando la prenda, atada a la prenda que compró. Se carga
--    desde /admin/testimonios. Solo fotos con permiso de la clienta.
--
-- Las dos tablas ya son de lectura pública (el sitio las muestra); las
-- columnas nuevas no exponen nada privado. Hasta correr esto el sitio sigue
-- andando igual: lee con select('*') y las columnas faltantes quedan vacías.
-- ============================================================

ALTER TABLE colors ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_testimonials_product ON testimonials(product_id);

-- Verificación:
-- SELECT name, image_url FROM colors ORDER BY sort_order;
-- SELECT author, photo_url, product_id FROM testimonials ORDER BY sort_order;
