-- ============================================================
-- Dahila Crochet — costos de producción internos (costos-produccion-2026-09.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Para el marcador de precios dinámico del admin (lib/pricing.ts): guarda las
-- horas de tejido y el costo de materiales de cada producto. Se corrigen desde
-- el Table Editor de Supabase (tabla product_costs) cuando Anush cronometre
-- una pieza real; el admin los lee de ahí.
--
-- POR QUÉ UNA TABLA APARTE y no columnas en `products`: `products` se lee
-- públicamente (la anon key y el catálogo del sitio hacen select *). Como
-- columnas, los costos terminarían en el HTML de cada página y en la API
-- pública — cualquiera vería cuánto cuesta hacer cada pieza. Acá NO hay
-- policy de lectura para anon: solo el admin logueado la ve.
--
-- Precarga: las horas y materiales de la tabla de precios aprobada
-- (PRICE_TABLE en src/app/admin/estrategia/data.ts, generada desde ese
-- archivo, 31 productos). ON CONFLICT DO NOTHING: si Anush ya editó
-- un valor, volver a correr esto NO lo pisa.
-- ============================================================

CREATE TABLE IF NOT EXISTS product_costs (
  product_id          uuid PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  labor_hours         numeric(5,1),
  materials_cost_uyu  integer,
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE product_costs ENABLE ROW LEVEL SECURITY;

-- Mismo patrón que el resto de las tablas de administración hoy. Cuando se
-- corra el PASO 3 de schema-security-hardening.sql, esta tabla también pasa
-- a is_admin() (ya está incluida en su lista).
DROP POLICY IF EXISTS "Admin manage product_costs" ON product_costs;
CREATE POLICY "Admin manage product_costs" ON product_costs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO product_costs (product_id, labor_hours, materials_cost_uyu)
SELECT p.id, v.hours, v.materials
FROM (VALUES
  ('set-brisa', 16, 350),
  ('cardigan-3-4', 22, 480),
  ('cardigan-cruzado', 22, 480),
  ('poncho', 19, 450),
  ('set-lueur', 18, 380),
  ('chaleco', 16, 350),
  ('set-lurex', 17, 400),
  ('beach-set', 20, 450),
  ('top-flower', 16, 320),
  ('top-cherry', 14, 300),
  ('top-summer', 14, 300),
  ('falda-serenada', 14, 300),
  ('top-higgie', 13, 280),
  ('top-race', 13, 280),
  ('top-maresia', 13, 280),
  ('top-lagom', 13, 280),
  ('top-amelie', 13, 280),
  ('top-halter', 11, 250),
  ('top-duna', 11, 250),
  ('set-de-bufanda-y-guantes', 9, 220),
  ('cowl-neck-top', 8, 200),
  ('bolso-de-estudiante', 7, 250),
  ('tote-bag-de-playa', 7, 250),
  ('donut-bag', 6, 220),
  ('bolso-a-cuadros', 8, 300),
  ('mini-tote-bag', 5, 180),
  ('bolso-lola', 10, 350),
  ('bufanda-sophie', 5, 180),
  ('calentadores', 5, 180),
  ('bandana', 4, 150),
  ('mini-bufandas', 3, 100)
) AS v(slug, hours, materials)
JOIN products p ON p.slug = v.slug
ON CONFLICT (product_id) DO NOTHING;

-- Verificación: cuántos productos tienen costos cargados.
-- SELECT count(*) FROM product_costs;
