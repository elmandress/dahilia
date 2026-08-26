-- ============================================================
-- Dahila Crochet — Tarjeta de agradecimiento con QR (2026-08)
-- Ejecutar DESPUÉS de schema.sql y schema-cupones.sql, en el SQL Editor de
-- Supabase. Idempotente: seguro de re-ejecutar.
-- ============================================================
-- La tarjetita física que va en cada paquete tiene un QR que apunta a
-- dahila.uy/gracias — una página no linkeada desde el resto del sitio
-- (noindex, solo ses llega escaneando) que le regala 15% de descuento a
-- quien la escanea. Esto crea el cupón real y el contenido editable de esa
-- página en site_settings, para que Anush pueda cambiar el texto o rotar el
-- código después desde /admin/configuracion y /admin/cupones, sin pedir un
-- redeploy.
--
-- Si en algún momento se quiere rotar el código (por ejemplo, para una
-- segunda tanda de tarjetas), basta con crear un cupón nuevo en
-- /admin/cupones y actualizar 'qr_discount_code' (y opcionalmente
-- 'qr_discount_percent') en /admin/configuracion con el código nuevo — no
-- hace falta tocar este archivo de nuevo.
-- ============================================================

INSERT INTO coupons (code, label, kind, value, max_uses_per_customer, active)
VALUES ('GRACIAS15', 'Tarjeta de agradecimiento — QR del paquete', 'percent', 15, 1, true)
ON CONFLICT ((upper(code))) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES
  ('qr_thanks_enabled', 'true'),
  ('qr_thanks_eyebrow', 'Solo para vos'),
  ('qr_thanks_title', 'Gracias por tu compra'),
  ('qr_thanks_body', 'Escaneaste el QR de tu paquete — este descuento es exclusivo para quien llega hasta acá.'),
  ('qr_discount_code', 'GRACIAS15'),
  ('qr_discount_percent', '15')
ON CONFLICT (key) DO NOTHING;
