-- ============================================================
-- Dahila Crochet — Infraestructura de drops (drops-2026-07.sql)
-- Ejecutar DESPUÉS de schema-collections.sql, en el Supabase SQL Editor.
-- Idempotente: seguro de re-ejecutar.
-- ============================================================
-- Estados de una colección para el ciclo de un drop:
--
--   borrador      published=false, coming_soon=false  → no existe para el público
--   próximamente  published=false, coming_soon=true   → la portada aparece en
--                 /colecciones con la etiqueta "Próximamente", sin poder entrar.
--                 Sirve para las 3 semanas de expectativa del playbook de drops.
--   solo con link published=true,  unlisted=true      → la página funciona pero
--                 no aparece en /colecciones ni en el sitemap. Es el "acceso
--                 anticipado": se manda el link a la lista VIP 24 h antes.
--   publicada     published=true,  unlisted=false     → visible en todos lados.
--
-- El bloque "Próximo drop" del home (countdown + captura VIP) se maneja aparte,
-- desde Configuración → "Próximo drop" (site_settings, sin cambios de schema).
-- ============================================================

ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS coming_soon boolean NOT NULL DEFAULT false;

ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS unlisted boolean NOT NULL DEFAULT false;

-- La política pública ahora también deja LEER las colecciones "próximamente"
-- (el sitio muestra solo la portada; la página de la colección sigue exigiendo
-- published=true, así que el contenido no se filtra antes de tiempo).
DROP POLICY IF EXISTS "Public read collections" ON collections;
CREATE POLICY "Public read collections" ON collections
  FOR SELECT USING (published = true OR coming_soon = true);
