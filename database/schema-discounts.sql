-- ============================================================
-- Dahila Crochet — Discounts + product attributes migration
-- (schema-discounts.sql)
-- Run AFTER schema.sql and schema-extra.sql, in the Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================
-- Goals:
--   1. Per-product discount (percentage) with an on/off flag.
--   2. Batch / category-wide discounts via a `discounts` table.
--   3. Helpers so the app can compute the effective (discounted) price.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PER-PRODUCT DISCOUNT COLUMNS
-- ------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS discount_percent integer NOT NULL DEFAULT 0
    CHECK (discount_percent >= 0 AND discount_percent <= 90);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS discount_active boolean NOT NULL DEFAULT false;

-- ------------------------------------------------------------
-- 2. BATCH / CATEGORY DISCOUNTS TABLE
--    A rule applies either to a whole category or to ALL products.
--    `scope`:
--       'all'      → applies to every active product
--       'category' → applies to products in `category_id`
--    The app picks the BEST (highest) applicable discount between the
--    product-level value and any matching batch rule.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discounts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label        text NOT NULL,                         -- 'Liquidación invierno'
  scope        text NOT NULL DEFAULT 'all'
               CHECK (scope IN ('all', 'category')),
  category_id  uuid REFERENCES categories(id) ON DELETE CASCADE,
  percent      integer NOT NULL DEFAULT 0
               CHECK (percent >= 0 AND percent <= 90),
  active       boolean NOT NULL DEFAULT true,
  starts_at    timestamptz,                           -- optional window
  ends_at      timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(active, scope);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active discounts" ON discounts;
DROP POLICY IF EXISTS "Admin manage discounts" ON discounts;

-- Public can read active discounts (so the storefront can compute prices).
CREATE POLICY "Public read active discounts"
  ON discounts FOR SELECT
  USING (active = true);

CREATE POLICY "Admin manage discounts"
  ON discounts FOR ALL TO authenticated USING (true);

-- ------------------------------------------------------------
-- 3. PRODUCT ATTRIBUTES used by the storefront filters.
--    A denormalised colour-family tag keeps filtering cheap without
--    joining product_colors. Optional — colours filter still works via
--    the join, this is just a fast path if you want it later.
-- ------------------------------------------------------------
-- (No change required; storefront filters by joined product_colors.)

-- ------------------------------------------------------------
-- 4. Convenience: seed a disabled "all" discount row so the admin
--    panel always has something to toggle.
-- ------------------------------------------------------------
INSERT INTO discounts (label, scope, percent, active)
SELECT 'Descuento general', 'all', 0, false
WHERE NOT EXISTS (SELECT 1 FROM discounts WHERE scope = 'all');
