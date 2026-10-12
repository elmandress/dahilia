-- ============================================================
-- Dahila Crochet — orígenes nuevos de la lista VIP (lista-vip-origenes-2026-10.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- 12/10/2026. La lista VIP tenía 6 personas. Además del footer y el encargo,
-- ahora se puede entrar desde: el popup ('popup'), la página dahila.uy/vip
-- ('vip', pensada para el link de historias de Instagram) y el bloque de la
-- home ('home') y la tarjeta QR del paquete ('gracias'). Con el origen guardado, /admin/suscriptores dice cuál de
-- todas las entradas funciona.
--
-- Hasta correr esto, el sitio guarda esas suscripciones como 'drop' (nadie
-- queda afuera, solo se pierde el detalle del origen).
-- ============================================================

ALTER TABLE subscribers DROP CONSTRAINT IF EXISTS subscribers_source_check;
ALTER TABLE subscribers
  ADD CONSTRAINT subscribers_source_check
  CHECK (source IN ('footer', 'encargo', 'drop', 'manual', 'popup', 'vip', 'home', 'gracias'));

-- Verificación:
-- SELECT source, count(*) FROM subscribers GROUP BY source ORDER BY 2 DESC;
