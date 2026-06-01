-- ============================================================
-- Dahila Crochet — Supabase Schema (v2)
-- Run this in the Supabase SQL Editor (https://supabase.com)
-- ============================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CATEGORIES (Categorías)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 2. COLORS (Colores del Atelier)
-- ============================================================
CREATE TABLE IF NOT EXISTS colors (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,           -- e.g., 'Verde Musgo', 'Rosa Pétalo'
  hex        text NOT NULL,           -- e.g., '#6A8456', '#ECC0CB'
  sort_order integer DEFAULT 0
);

-- ============================================================
-- 3. PRODUCTS (Prendas de Dahila)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text UNIQUE NOT NULL,
  name                text NOT NULL,
  description         text,
  category_id         uuid REFERENCES categories(id) ON DELETE SET NULL,
  badge               text,                                    -- 'Nuevo', 'A medida', etc.
  status              text NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('active', 'soldout', 'draft')),
  base_price_uyu      integer,                                 -- precio base si no se especifica por talle
  sort_order          integer DEFAULT 0,
  lead_time_weeks_min integer DEFAULT 2,
  lead_time_weeks_max integer DEFAULT 6,
  material            text,
  care_instructions   text,                                    -- instrucciones de lavado
  is_custom_only      boolean DEFAULT false,                   -- solo se realiza bajo presupuesto
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Function and trigger to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. PRODUCT MEDIA (Fotos y Videos)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_media (
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

CREATE INDEX IF NOT EXISTS idx_product_media_product ON product_media(product_id);

-- ============================================================
-- 5. PRODUCT SIZES (Talles y Precios específicos)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_sizes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        text NOT NULL,                -- 'XS', 'S', 'M', 'L', 'XL', 'Único'
  price_uyu   integer,                      -- NULL indica usar el precio base
  available   boolean DEFAULT true,
  sort_order  integer DEFAULT 0,
  UNIQUE(product_id, size)
);

-- ============================================================
-- 6. PRODUCT COLORS (Colores asignados a productos)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_colors (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id   uuid NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, color_id)
);

-- ============================================================
-- 7. CUSTOM ORDERS (Encargos de clientes)
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name   text NOT NULL,
  customer_email  text NOT NULL,
  whatsapp        text,
  garment_type    text NOT NULL,
  size            text,
  measurements    jsonb,                        -- { busto: '90cm', cintura: '70cm' }
  color_preference text,
  message         text,
  status          text DEFAULT 'new'
                  CHECK (status IN ('new', 'replied', 'in_progress', 'done', 'cancelled')),
  admin_notes     text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE OR REPLACE TRIGGER update_custom_orders_updated_at
  BEFORE UPDATE ON custom_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. CART ITEMS (Carrito persistido en servidor)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     text NOT NULL,                   -- cookie/uuid identificador de carrito
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        text NOT NULL,
  qty         integer NOT NULL DEFAULT 1,
  added_at    timestamptz DEFAULT now(),
  UNIQUE(cart_id, product_id, size)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- ============================================================
-- 9. SITE SETTINGS (Configuraciones generales del sitio)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key         text PRIMARY KEY,
  value       text NOT NULL,
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 10. SEED DEFAULT DATA
-- ============================================================
INSERT INTO categories (slug, name, sort_order) VALUES
  ('tops',       'Tops',       1),
  ('cardigans',  'Cardigans',  2),
  ('accesorios', 'Accesorios', 3),
  ('sets',       'Sets',       4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES
  ('hero_title',    'Tejido artesanal y a medida.'),
  ('hero_subtitle', 'Diseñado y confeccionado a mano en Uruguay.'),
  ('hero_cta',      'Ver Colección'),
  ('contact_whatsapp', '+598 99 123 456'),
  ('contact_instagram', 'dahila.crochet'),
  ('contact_email', 'hola@dahila.uy'),
  ('atelier_address', 'Montevideo, Uruguay'),
  ('lead_time_notice', 'Las prendas a medida demoran entre 2 y 6 semanas según la complejidad.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (status = 'active' OR status = 'soldout');

CREATE POLICY "Admin manage products" ON products
  FOR ALL TO authenticated USING (true);

-- Categories policies
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admin manage categories" ON categories
  FOR ALL TO authenticated USING (true);

-- Colors policies
CREATE POLICY "Public read colors" ON colors
  FOR SELECT USING (true);

CREATE POLICY "Admin manage colors" ON colors
  FOR ALL TO authenticated USING (true);

-- Media policies
CREATE POLICY "Public read media" ON product_media
  FOR SELECT USING (true);

CREATE POLICY "Admin manage media" ON product_media
  FOR ALL TO authenticated USING (true);

-- Sizes policies
CREATE POLICY "Public read sizes" ON product_sizes
  FOR SELECT USING (true);

CREATE POLICY "Admin manage sizes" ON product_sizes
  FOR ALL TO authenticated USING (true);

-- Product colors policies
CREATE POLICY "Public read product_colors" ON product_colors
  FOR SELECT USING (true);

CREATE POLICY "Admin manage product_colors" ON product_colors
  FOR ALL TO authenticated USING (true);

-- Custom orders policies
CREATE POLICY "Public insert orders" ON custom_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage orders" ON custom_orders
  FOR ALL TO authenticated USING (true);

-- Cart policies
CREATE POLICY "Public manage cart_items" ON cart_items
  FOR ALL USING (true);

-- Site settings policies
CREATE POLICY "Public read settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin manage settings" ON site_settings
  FOR ALL TO authenticated USING (true);

-- ============================================================
-- 12. STORAGE BUCKETS & STORAGE POLICIES
-- ============================================================

-- Create 'media' bucket in storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, '{image/*,video/*}')
ON CONFLICT (id) DO NOTHING;

-- Storage public read policy
CREATE POLICY "Public Read Media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Storage authenticated write/delete policies for Admin
CREATE POLICY "Admin Upload Media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

CREATE POLICY "Admin Update Media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

CREATE POLICY "Admin Delete Media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media');
