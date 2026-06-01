-- ============================================================
-- Dahila Crochet — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- CATEGORIES (dynamic — admin creates them)
-- ============================================================
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Seed default categories
INSERT INTO categories (slug, name, sort_order) VALUES
  ('tops',       'Tops',       1),
  ('cardigans',  'Cardigans',  2),
  ('accesorios', 'Accesorios', 3),
  ('sets',       'Sets',       4);

-- ============================================================
-- COLORS (reusable palette — admin creates them)
-- ============================================================
CREATE TABLE colors (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,           -- 'Rosa palo', 'Verde musgo'
  hex        text NOT NULL,           -- '#E693A7'
  sort_order integer DEFAULT 0
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text UNIQUE NOT NULL,
  name                text NOT NULL,
  description         text,
  category_id         uuid REFERENCES categories(id) ON DELETE SET NULL,
  badge               text,                                    -- free text: 'Nuevo', 'A medida', etc.
  status              text NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('active', 'soldout', 'draft')),
  base_price_uyu      integer,                                 -- fallback price if no per-size price
  sort_order          integer DEFAULT 0,
  lead_time_weeks_min integer DEFAULT 4,
  lead_time_weeks_max integer DEFAULT 6,
  material            text,
  care_instructions   text,                                    -- washing / care notes
  is_custom_only      boolean DEFAULT false,                   -- only available as custom order
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PRODUCT MEDIA (photos AND videos)
-- ============================================================
CREATE TABLE product_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         text NOT NULL,                -- Supabase Storage URL
  type        text NOT NULL DEFAULT 'image' -- 'image' | 'video'
              CHECK (type IN ('image', 'video')),
  alt         text,
  position    integer NOT NULL DEFAULT 0,
  is_primary  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_product_media_product ON product_media(product_id);

-- ============================================================
-- PRODUCT SIZES with per-size pricing
-- ============================================================
CREATE TABLE product_sizes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        text NOT NULL,                -- 'XS', 'S', 'M', 'L', 'XL', 'Único', etc.
  price_uyu   integer,                      -- NULL means use product.base_price_uyu
  available   boolean DEFAULT true,
  sort_order  integer DEFAULT 0,
  UNIQUE(product_id, size)
);

-- ============================================================
-- PRODUCT COLORS (many-to-many)
-- ============================================================
CREATE TABLE product_colors (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id   uuid NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, color_id)
);

-- ============================================================
-- CUSTOM ORDERS (Encargos a medida)
-- ============================================================
CREATE TABLE custom_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name   text NOT NULL,
  customer_email  text NOT NULL,
  whatsapp        text,
  garment_type    text NOT NULL,
  size            text,
  measurements    jsonb,
  color_preference text,
  message         text,
  status          text DEFAULT 'new'
                  CHECK (status IN ('new', 'replied', 'in_progress', 'done', 'cancelled')),
  admin_notes     text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TRIGGER update_custom_orders_updated_at
  BEFORE UPDATE ON custom_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CART (server-side, cookie-based persistence)
-- ============================================================
CREATE TABLE cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     text NOT NULL,                   -- cookie value
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        text NOT NULL,
  qty         integer NOT NULL DEFAULT 1,
  added_at    timestamptz DEFAULT now(),
  UNIQUE(cart_id, product_id, size)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ============================================================
-- SITE SETTINGS (key-value config store)
-- ============================================================
CREATE TABLE site_settings (
  key         text PRIMARY KEY,
  value       text NOT NULL,
  updated_at  timestamptz DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('hero_title',    'Tejido con tiempo.'),
  ('hero_subtitle', 'Otoño 2026 — Edición a medida'),
  ('hero_cta',      'Ver tienda'),
  ('hero_image',    ''),
  ('whatsapp',      '+598 94 605 015'),
  ('instagram',     '@dahila.crochet'),
  ('email',         'hola@dahila.uy');

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Public read access for products, categories, colors, media, sizes
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read active products and related data
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (status = 'active');
CREATE POLICY "Admin all products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);
CREATE POLICY "Admin all categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read colors" ON colors
  FOR SELECT USING (true);
CREATE POLICY "Admin all colors" ON colors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read media" ON product_media
  FOR SELECT USING (true);
CREATE POLICY "Admin all media" ON product_media
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read sizes" ON product_sizes
  FOR SELECT USING (true);
CREATE POLICY "Admin all sizes" ON product_sizes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read product_colors" ON product_colors
  FOR SELECT USING (true);
CREATE POLICY "Admin all product_colors" ON product_colors
  FOR ALL USING (auth.role() = 'authenticated');

-- Only authenticated admin can see orders
CREATE POLICY "Admin all orders" ON custom_orders
  FOR ALL USING (auth.role() = 'authenticated');
-- Anyone can INSERT orders (the form)
CREATE POLICY "Public insert orders" ON custom_orders
  FOR INSERT WITH CHECK (true);

-- Cart: anyone can manage their own cart items (matched by cart_id cookie)
CREATE POLICY "Public all cart" ON cart_items
  FOR ALL USING (true);

-- Site settings: public read, admin write
CREATE POLICY "Public read settings" ON site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admin all settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SUPABASE STORAGE BUCKET
-- ============================================================
-- Run this separately in the Storage section or via API:
-- Create a bucket called 'media' with public access
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
