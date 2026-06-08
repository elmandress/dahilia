-- ============================================================
-- Dahila Crochet — Favorites + optional stock count (schema-favorites.sql)
-- Run AFTER schema.sql, in the Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================
-- Goals:
--   1. `favorites` table — a cookie-scoped wishlist, mirroring cart_items.
--      No login: rows are keyed by an opaque `fav_id` cookie, exactly like the
--      cart. The /api/favorites route handler enforces ownership by fav_id.
--   2. Optional precise `stock_qty` on product_sizes so the storefront can show
--      "Quedan N" / "Última disponible". NULL keeps the existing boolean-only
--      behaviour, so this column is purely opt-in for the owner.
-- ============================================================

-- ============================================================
-- 1. FAVORITES (wishlist) — cookie-scoped, one row per product per visitor.
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fav_id      text NOT NULL,                   -- cookie/uuid del visitante
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at    timestamptz DEFAULT now(),
  UNIQUE(fav_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_fav ON favorites(fav_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Same model as cart_items: the anon client may manage favorites; the route
-- handler scopes every query by the HttpOnly fav_id cookie, so a visitor can
-- only ever touch their own rows. (idempotent: drop-then-create.)
DROP POLICY IF EXISTS "Public manage favorites" ON favorites;
CREATE POLICY "Public manage favorites" ON favorites
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 2. OPTIONAL precise stock count on product_sizes.
--    NULL = the owner only tracks the boolean `available` (default, unchanged).
--    Set a small integer to surface "Quedan N" on the storefront.
-- ============================================================
ALTER TABLE product_sizes
  ADD COLUMN IF NOT EXISTS stock_qty integer;
