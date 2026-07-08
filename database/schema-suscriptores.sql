-- ============================================================
-- Dahila Crochet — Lista VIP / suscriptores (schema-suscriptores.sql)
-- Ejecutar DESPUÉS de schema.sql, en el Supabase SQL Editor.
-- Idempotente: seguro de re-ejecutar.
-- ============================================================
-- Captura de emails para drops y lanzamientos (footer + landing).
-- Es EL activo que habilita la estrategia de drops: audiencia propia,
-- no alquilada al algoritmo de Instagram. Ver /admin/estrategia.
--
-- Seguridad: el público solo puede INSERTAR su propio email; leer/exportar
-- la lista es exclusivo del admin. El UNIQUE por lower(email) evita duplicados
-- (el server action trata el duplicado como éxito: "ya estabas anotada").
-- ============================================================

CREATE TABLE IF NOT EXISTS subscribers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  name            text,
  source          text DEFAULT 'footer'
                  CHECK (source IN ('footer', 'encargo', 'drop', 'manual')),
  created_at      timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email
  ON subscribers (lower(email));

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public subscribe" ON subscribers;
CREATE POLICY "Public subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage subscribers" ON subscribers;
CREATE POLICY "Admin manage subscribers" ON subscribers
  FOR ALL TO authenticated USING (true);
