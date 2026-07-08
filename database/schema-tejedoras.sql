-- ============================================================
-- Dahila Crochet — Red de tejedoras (schema-tejedoras.sql)
-- Ejecutar DESPUÉS de schema.sql, en el Supabase SQL Editor.
-- Idempotente: seguro de re-ejecutar.
-- ============================================================
-- Postulaciones de tejedoras desde la página pública /tejedoras.
-- Modelo: Manos del Uruguay (pago por pieza aprobada, ficha técnica por
-- modelo, control de calidad centralizado) — ver /admin/estrategia.
--
-- Seguridad: mismo modelo que custom_orders — el público solo puede INSERTAR
-- su propia postulación; leer/gestionar es exclusivo del admin (contiene PII).
-- ============================================================

CREATE TABLE IF NOT EXISTS weaver_applications (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  location         text,                        -- departamento / ciudad
  whatsapp         text,
  email            text,
  experience       text,                        -- '<1', '1-3', '3-5', '5+' años
  skills           text,                        -- qué sabe tejer (lista separada por comas)
  availability     text,                        -- horas semanales disponibles
  has_materials    boolean DEFAULT false,       -- si tiene agujas/lana propias
  portfolio        text,                        -- links a fotos de trabajos (IG, Drive…)
  message          text,
  status           text DEFAULT 'new'
                   CHECK (status IN ('new', 'contacted', 'sample', 'approved', 'rejected')),
  admin_notes      text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE OR REPLACE TRIGGER update_weaver_applications_updated_at
  BEFORE UPDATE ON weaver_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_weaver_applications_status_created
  ON weaver_applications(status, created_at DESC);

ALTER TABLE weaver_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public submit weaver application" ON weaver_applications;
CREATE POLICY "Public submit weaver application" ON weaver_applications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage weaver applications" ON weaver_applications;
CREATE POLICY "Admin manage weaver applications" ON weaver_applications
  FOR ALL TO authenticated USING (true);
