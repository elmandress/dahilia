-- ============================================================
-- Dahila Crochet — SQL MAESTRO (schema-master.sql)
-- ============================================================
-- EJECUTÁ ESTE ARCHIVO COMPLETO en el SQL Editor de Supabase.
-- Es idempotente: podés correrlo más de una vez sin romper nada.
-- Incluye TODO lo de las migraciones anteriores + las nuevas.
-- ============================================================


-- ============================================================
-- PARTE 1: STORAGE BUCKET "media"
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 'media', true, 104857600,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','video/quicktime','video/webm']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public Read Media"    ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Media"   ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Media"   ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Media"   ON storage.objects;

CREATE POLICY "Public Read Media"    ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');


-- ============================================================
-- PARTE 2: TABLA TESTIMONIALS
-- ============================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author     text        NOT NULL,
  location   text,
  text       text        NOT NULL,
  sort_order int         NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read testimonials"  ON testimonials;
DROP POLICY IF EXISTS "Admin manage testimonials" ON testimonials;

CREATE POLICY "Public read testimonials"  ON testimonials FOR SELECT USING (true);
CREATE POLICY "Admin manage testimonials" ON testimonials FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON testimonials(sort_order ASC);


-- ============================================================
-- PARTE 3: TABLA HOMEPAGE_MEDIA (slots de fotos editables)
-- ============================================================

CREATE TABLE IF NOT EXISTS homepage_media (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot       text UNIQUE NOT NULL,
  url        text NOT NULL,
  alt        text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homepage_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read homepage_media" ON homepage_media;
DROP POLICY IF EXISTS "Admin manage homepage_media" ON homepage_media;

CREATE POLICY "Public read homepage_media"  ON homepage_media FOR SELECT USING (true);
CREATE POLICY "Admin manage homepage_media" ON homepage_media FOR ALL TO authenticated USING (true);


-- ============================================================
-- PARTE 4: ÍNDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_status_sort
  ON products(status, sort_order)
  WHERE status IN ('active', 'soldout');

CREATE INDEX IF NOT EXISTS idx_custom_orders_status_created
  ON custom_orders(status, created_at DESC);


-- ============================================================
-- PARTE 5: TODOS LOS SEEDS DE site_settings
-- ON CONFLICT DO NOTHING => nunca pisa valores que ya editaste
-- ============================================================

INSERT INTO site_settings (key, value) VALUES

  -- ── Barra de promoción ──────────────────────────────────
  ('promo_bar_enabled',  'true'),
  ('promo_bar_text',     'Hecho a mano en Uruguay · Envío a todo el país · A medida'),
  ('promo_bar_link',     ''),
  ('promo_bar_bg',       '#1F1A1B'),
  ('promo_bar_fg',       '#FFFFFF'),

  -- ── Banner del home (apagado por defecto) ───────────────
  ('home_banner_enabled',   'false'),
  ('home_banner_eyebrow',   ''),
  ('home_banner_title',     ''),
  ('home_banner_body',      ''),
  ('home_banner_cta_label', 'Ver la tienda'),
  ('home_banner_cta_link',  '/tienda'),
  ('home_banner_image_url', ''),

  -- ── Hero ────────────────────────────────────────────────
  ('hero_title',          'Tejido con tiempo.'),
  ('hero_subtitle',       'Edición a medida'),
  ('hero_cta',            'Ver tienda'),
  ('hero_image_url',      '/photos/top-lace-parque.png'),
  ('hero_image_position', '50% 30%'),

  -- ── Tira de proceso ─────────────────────────────────────
  ('process_1_title', 'A medida'),
  ('process_1_body',  'Cada pieza la trabajo con tu medida exacta y los colores que elegís vos.'),
  ('process_2_title', 'Hecho a mano'),
  ('process_2_body',  'Lana natural, sin prisa. El plazo lo charlamos según el modelo.'),
  ('process_3_title', 'Envío incluido'),
  ('process_3_body',  'A todo Uruguay. Internacionales bajo consulta, con tracking.'),

  -- ── Sobre nosotros ──────────────────────────────────────
  ('about_eyebrow',       'Sobre nosotros'),
  ('about_title',         'Detrás de cada hilo'),
  ('about_title_em',      'está nuestra mesa.'),
  ('about_body',          'En Dahila tejemos a crochet prendas únicas, sin apuro y con vos.'),
  ('about_body_2',        ''),
  ('about_quote',         ''),
  ('about_image_url',     '/photos/atelier-escritorio.png'),
  ('about_cta',           'Conocé más'),
  ('about_value_1_title', 'Hecho a mano'),
  ('about_value_1_body',  'Cada prenda se teje pieza por pieza, sin máquinas.'),
  ('about_value_2_title', 'A tu medida'),
  ('about_value_2_body',  'Ajustamos talle y colores a lo que vos querés.'),
  ('about_value_3_title', 'Materiales nobles'),
  ('about_value_3_body',  'Lana y algodón natural, elegidos con cuidado.'),

  -- ── FAQ ─────────────────────────────────────────────────
  ('faq_1_q', '¿Cuánto tarda un encargo?'),
  ('faq_1_a', 'Depende del modelo. Te aviso cuando empiezo y cuando está listo para que estés tranquila.'),
  ('faq_2_q', '¿Puedo elegir colores?'),
  ('faq_2_a', 'Sí. Después de confirmar el modelo te muestro las lanas reales que tengo y elegimos juntas.'),
  ('faq_3_q', '¿Hacen envíos al exterior?'),
  ('faq_3_a', 'Bajo consulta. Trabajé con clientas en Argentina, Brasil y España — escribime y vemos costos.'),
  ('faq_4_q', '¿Aceptan devoluciones?'),
  ('faq_4_a', 'Como cada pieza se hace a medida, no aceptamos cambios. Por eso te acompaño durante todo el proceso.'),

  -- ── Contacto ────────────────────────────────────────────
  ('contact_whatsapp',      '+598 94 605 015'),
  ('contact_whatsapp_url',  'https://wa.me/59894605015'),
  ('contact_instagram',     '@dahila.crochet'),
  ('contact_instagram_url', 'https://www.instagram.com/dahila.crochet/'),
  ('contact_location',      'Montevideo, Uruguay'),
  ('brand_short_intro',     'Prendas tejidas a mano, a tu medida, desde Montevideo.'),

  -- ── Información / envíos ────────────────────────────────
  ('size_guide_note',   ''),
  ('shipping_estimate', 'Envío a todo Uruguay · Montevideo y por agencia al interior'),
  ('pdp_trust_1',       'Envío a todo Uruguay'),
  ('pdp_trust_2',       'Hecho a mano'),
  ('pdp_trust_3',       'Coordinás por WhatsApp'),
  ('info_shipping',     ''),
  ('info_returns',      ''),
  ('info_care',         ''),
  ('info_custom',       ''),
  ('info_payment',      ''),

  -- ── La artesana (aparece en cada PDP) ───────────────────
  ('maker_name',       'Anush'),
  ('maker_bio',        ''),
  ('maker_photo_url',  ''),

  -- ── Cuotas / opciones de pago (link a WhatsApp en PDP) ──
  ('installments_enabled', 'false'),
  ('installments_label',   '¿Querés pagar en 2 cuotas? Hablemos por WhatsApp →'),

  -- ── Fotos de la página Atelier ───────────────────────────
  ('atelier_photo_1', '/photos/detalle-tejido.jpg'),
  ('atelier_photo_2', '/photos/atelier-escritorio.png'),
  ('atelier_photo_3', '/photos/bufanda-verde.png'),

  -- ── "Esta semana en el taller" (home) ───────────────────
  ('atelier_note_enabled',   'false'),
  ('atelier_note_text',      ''),
  ('atelier_note_cta_label', ''),
  ('atelier_note_cta_link',  '/encargo'),

  -- ── Stepper "Cómo funciona" en fichas a medida ──────────
  ('pdp_process_enabled',      'false'),
  ('pdp_process_step_1_icon',  'chat-text'),
  ('pdp_process_step_1_label', 'Escribís'),
  ('pdp_process_step_1_body',  'Contame qué prenda querés, tu medida y colores favoritos.'),
  ('pdp_process_step_2_icon',  'scissors'),
  ('pdp_process_step_2_label', 'Elegimos juntas'),
  ('pdp_process_step_2_body',  'Te muestro las lanas disponibles y confirmamos todos los detalles.'),
  ('pdp_process_step_3_icon',  'needle'),
  ('pdp_process_step_3_label', 'Te lo tejo'),
  ('pdp_process_step_3_body',  'Trabajo en tu prenda y te aviso cuando está lista para enviar.')

ON CONFLICT (key) DO NOTHING;
