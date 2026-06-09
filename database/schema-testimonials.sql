-- ============================================================
-- Dahila Crochet — Testimonials + CRO seeds (schema-testimonials.sql)
-- Run AFTER schema-extra.sql, in the Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================

-- ============================================================
-- 1. TESTIMONIALS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author      text        NOT NULL,
  location    text,
  text        text        NOT NULL,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read testimonials"  ON testimonials;
DROP POLICY IF EXISTS "Admin manage testimonials" ON testimonials;

-- Anyone can read (home page carousel is public)
CREATE POLICY "Public read testimonials"
  ON testimonials FOR SELECT USING (true);

-- Only authenticated (admin) users can insert / update / delete
CREATE POLICY "Admin manage testimonials"
  ON testimonials FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_testimonials_sort
  ON testimonials(sort_order ASC);

-- ============================================================
-- 2. SITE_SETTINGS — new keys for CRO features
--    ON CONFLICT DO NOTHING preserves any existing values.
-- ============================================================

INSERT INTO site_settings (key, value) VALUES

  -- Maker bio (shows on every PDP)
  ('maker_name',       'Anush'),
  ('maker_bio',        ''),
  ('maker_photo_url',  ''),

  -- Installments / cuotas link on PDP
  ('installments_enabled', 'false'),
  ('installments_label',   '¿Querés pagar en 2 cuotas? Hablemos por WhatsApp →'),

  -- Atelier page photo strip (3:4 portrait photos)
  ('atelier_photo_1', '/photos/detalle-tejido.jpg'),
  ('atelier_photo_2', '/photos/atelier-escritorio.png'),
  ('atelier_photo_3', '/photos/bufanda-verde.png')

ON CONFLICT (key) DO NOTHING;
