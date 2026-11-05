-- ============================================================
-- Dahila Crochet — lastmod honesto (lastmod-honesto-2026-11.sql)
-- Run in the Supabase SQL Editor (el proyecto de la tienda, no el que ve el MCP).
-- Idempotent: safe to re-run.
-- ============================================================
-- Por qué (04/11/2026, auditoría SEO-04): el sitemap usa products.updated_at
-- como lastmod de cada ficha, y el trigger update_products_updated_at
-- (schema.sql) lo pisa con now() en CUALQUIER update. Reordenar la tienda en
-- el admin guarda el sort_order fila por fila: el 03/11 a las 17:37, 37 de
-- las 41 fichas quedaron con la misma fecha sin que nada de ellas cambiara.
-- Google usa el lastmod solo si es "consistently and verifiably accurate"; si
-- deja de creerlo, se pierde la palanca de "editar la ficha para que la
-- vuelvan a rastrear". Y cada reordenamiento cambiaba el updated_at del
-- bloqueo optimista del editor: una ficha abierta en otra pestaña chocaba sin
-- que nadie la hubiera tocado.
--
-- Qué hace: un trigger propio para products.
--   1. Si el UPDATE trae un updated_at distinto del que había, lo respeta: el
--      editor de la ficha y los precios en lote lo mandan a propósito.
--   2. Si lo único que cambió es sort_order (o nada), no lo toca.
--   3. Si cambió cualquier otra cosa, now(), como antes.
-- La función compartida update_updated_at_column queda igual: la siguen
-- usando las otras tablas (cupones, tejedoras, …).
--
-- Va junto con el código de la misma tanda: las relacionadas de cada ficha ya
-- no salen del orden de la tienda (tienda/[slug]/page.tsx), así que reordenar
-- tampoco cambia sus enlaces. Antes de eso, este lastmod quieto habría
-- escondido cambios reales de enlaces.
-- ============================================================

CREATE OR REPLACE FUNCTION products_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- 1. Puesto a propósito por quien guarda (editor, precios en lote).
  IF NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
    RETURN NEW;
  END IF;
  -- 2. Solo cambió el orden de la tienda (o el UPDATE no cambió nada).
  IF (to_jsonb(NEW) - 'sort_order') = (to_jsonb(OLD) - 'sort_order') THEN
    RETURN NEW;
  END IF;
  -- 3. Un cambio real.
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_touch_updated_at();

-- Verificación --------------------------------------------------------------
-- Cada prueba va dentro de una transacción que se deshace: no deja nada
-- cambiado. Correr una por vez y mirar el resultado del SELECT.
--
-- 1) Reordenar no mueve la fecha (antes = después):
--    BEGIN;
--    SELECT updated_at AS antes FROM products WHERE slug = 'top-race';
--    UPDATE products SET sort_order = sort_order + 1 WHERE slug = 'top-race';
--    SELECT updated_at AS despues FROM products WHERE slug = 'top-race';
--    ROLLBACK;
--
-- 2) Un UPDATE que no cambia nada tampoco la mueve (antes = después):
--    BEGIN;
--    SELECT updated_at AS antes FROM products WHERE slug = 'top-race';
--    UPDATE products SET description = description || '' WHERE slug = 'top-race';
--    SELECT updated_at AS despues FROM products WHERE slug = 'top-race';
--    ROLLBACK;
--
-- 3) Un cambio real sí la mueve (después = ahora, la hora de la transacción):
--    BEGIN;
--    SELECT updated_at AS antes FROM products WHERE slug = 'top-race';
--    UPDATE products SET description = coalesce(description, '') || ' ' WHERE slug = 'top-race';
--    SELECT updated_at AS despues, now() AS ahora FROM products WHERE slug = 'top-race';
--    ROLLBACK;
