-- ============================================================
-- Dahila Crochet — Nuevo número de WhatsApp (whatsapp-2026-07.sql)
-- Ejecutar UNA VEZ en el Supabase SQL Editor del proyecto de la tienda.
-- ============================================================
-- Nuevo número: 099 850 073 → internacional 59899850073.
-- El sitio lee estos settings en header, footer, carrito, PDP, encargo,
-- tejedoras, contacto, términos y JSON-LD. Los fallbacks del código ya
-- quedaron actualizados; esto actualiza la fuente de verdad (la base).
-- (Alternativa equivalente: editarlo a mano en /admin/configuracion.)
-- ============================================================

UPDATE site_settings
SET value = '+598 99 850 073'
WHERE key = 'contact_whatsapp';

UPDATE site_settings
SET value = 'https://wa.me/59899850073'
WHERE key = 'contact_whatsapp_url';
