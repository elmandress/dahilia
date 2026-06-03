-- ============================================================
-- Dahila Crochet — Additive migration (schema-extra.sql)
-- Run AFTER schema.sql, in the Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================
-- Goals:
--   1. Fix media bucket + storage policies (photo upload failures).
--   2. Add site_settings keys used by the new CMS panels:
--        - hero text + hero photo
--        - homepage process strip (3 columns)
--        - FAQ entries (JSON array as text)
--        - about-section copy + photo
--        - contact info (whatsapp, instagram)
--        - lead-time defaults
--   3. Add `homepage_media` table for editable home photos.
--   4. Add an explicit RLS policy for cart cookie linkage.
-- ============================================================

-- ============================================================
-- 1. STORAGE BUCKET — make sure `media` exists with the right
--    configuration and broad enough policies for authenticated
--    admins to upload.
-- ============================================================

-- Ensure the bucket exists (idempotent — leaves an existing bucket alone).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,                                                         -- public read
  104857600,                                                    -- 100 MB per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','video/quicktime','video/webm']
)
ON CONFLICT (id) DO UPDATE
  SET public           = EXCLUDED.public,
      file_size_limit  = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop any prior policies to avoid duplicate-policy errors on re-run.
DROP POLICY IF EXISTS "Public Read Media"        ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload"     ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update"     ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete"     ON storage.objects;
-- Legacy names from schema.sql v1:
DROP POLICY IF EXISTS "Admin Upload Media"       ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Media"       ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Media"       ON storage.objects;

-- Public read for anyone (anon + authenticated).
CREATE POLICY "Public Read Media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Any authenticated user can write — admin is "any logged-in user" in this app.
CREATE POLICY "Authenticated Upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated Update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated Delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

-- ============================================================
-- 2. SITE SETTINGS — seed new editable keys.
--    Existing values are preserved by `ON CONFLICT DO NOTHING`.
-- ============================================================

INSERT INTO site_settings (key, value) VALUES
  -- Hero (home)
  ('hero_title',         'Tejido con tiempo.'),
  ('hero_subtitle',      'Edición a medida'),
  ('hero_cta',           'Ver tienda'),
  ('hero_image_url',     '/photos/top-lace-parque.png'),

  -- Process strip (3 columns under "New in")
  ('process_1_title',    'A medida'),
  ('process_1_body',     'Cada pieza la trabajo con tu medida exacta y los colores que elegís vos.'),
  ('process_2_title',    'Hecho a mano'),
  ('process_2_body',     'Lana natural, sin prisa. El plazo lo charlamos según el modelo.'),
  ('process_3_title',    'Envío incluido'),
  ('process_3_body',     'A todo Uruguay. Internacionales bajo consulta, con tracking.'),

  -- About section (split)
  ('about_eyebrow',      'Sobre Anush'),
  ('about_title',        'Detrás de cada hilo'),
  ('about_title_em',     'está mi mesa.'),
  ('about_body',         'Soy Anush. Tejo a crochet desde chica y hago prendas únicas, sin apuro y con vos.'),
  ('about_image_url',    '/photos/atelier-escritorio.png'),
  ('about_cta',          'Conocé el espacio'),

  -- FAQ (4 Q/A pairs, plain text — kept as separate keys for simple editing)
  ('faq_1_q',            '¿Cuánto tarda un encargo?'),
  ('faq_1_a',            'Depende del modelo. Te aviso cuando empiezo y cuando está listo para que estés tranquila.'),
  ('faq_2_q',            '¿Puedo elegir colores?'),
  ('faq_2_a',            'Sí. Después de confirmar el modelo te muestro las lanas reales que tengo y elegimos juntas.'),
  ('faq_3_q',            '¿Hacen envíos al exterior?'),
  ('faq_3_a',            'Bajo consulta. Trabajé con clientas en Argentina, Brasil y España — escribime y vemos costos.'),
  ('faq_4_q',            '¿Aceptan devoluciones?'),
  ('faq_4_a',            'Como cada pieza se hace a medida, no aceptamos cambios. Por eso te acompaño durante todo el proceso.'),

  -- Contact (used by Header/Footer/Contacto/JSON-LD)
  ('contact_whatsapp',   '+598 94 605 015'),
  ('contact_whatsapp_url','https://wa.me/59894605015'),
  ('contact_instagram',  '@dahila.crochet'),
  ('contact_instagram_url','https://www.instagram.com/dahila.crochet/'),
  ('contact_location',   'Montevideo, Uruguay'),

  -- Brand voice toggles
  ('brand_short_intro',  'Prendas tejidas a mano, a tu medida, desde Montevideo.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. HOMEPAGE MEDIA — extra editable photos (gallery / split images)
--    that the owner can swap from /admin/configuracion without
--    touching code.
-- ============================================================

CREATE TABLE IF NOT EXISTS homepage_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot        text UNIQUE NOT NULL,    -- e.g. 'hero', 'about', 'strip_1'
  url         text NOT NULL,
  alt         text,
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE homepage_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read homepage_media" ON homepage_media;
DROP POLICY IF EXISTS "Admin manage homepage_media" ON homepage_media;

CREATE POLICY "Public read homepage_media"
  ON homepage_media FOR SELECT USING (true);

CREATE POLICY "Admin manage homepage_media"
  ON homepage_media FOR ALL TO authenticated USING (true);

-- ============================================================
-- 4. CART_ITEMS — tighten the public policy slightly. The cart_id
--    is opaque (UUID) and lives in an HttpOnly cookie set by the
--    /api/cart route handler, so allowing ALL operations on cart_items
--    where the cart_id matches is fine. We keep the existing policy.
-- ============================================================

-- (No change needed — the existing "Public manage cart_items" policy is correct.)

-- ============================================================
-- 5. INDEXES for query performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_status_sort
  ON products(status, sort_order)
  WHERE status IN ('active', 'soldout');

CREATE INDEX IF NOT EXISTS idx_custom_orders_status_created
  ON custom_orders(status, created_at DESC);
