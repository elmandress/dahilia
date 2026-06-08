-- ============================================================
-- Dahila Crochet — Collections / Lookbook (schema-collections.sql)
-- Run AFTER schema.sql, in the Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================
-- Goals:
--   1. `collections` table — a named, ordered grouping of products with its own
--      cover image and short story (e.g. "Invierno 2026"). Public read for
--      published ones; authenticated admin manages all.
--   2. `products.collection_id` — optional FK so a product belongs to one
--      collection. NULL = not in any collection (the default), so this is purely
--      additive and changes nothing for existing products.
-- ============================================================

CREATE TABLE IF NOT EXISTS collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,                       -- short story shown on the collection page
  cover_url   text,                       -- horizontal cover/lookbook image
  published   boolean NOT NULL DEFAULT true,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_published ON collections(published, sort_order);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS collection_id uuid REFERENCES collections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);

-- RLS — mirror categories: anyone reads published collections; authenticated
-- admins manage everything. (idempotent: drop-then-create.)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read collections" ON collections;
CREATE POLICY "Public read collections" ON collections
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admin manage collections" ON collections;
CREATE POLICY "Admin manage collections" ON collections
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
