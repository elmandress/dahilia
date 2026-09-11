-- ============================================================
-- Dahila Crochet — saca los textos de devoluciones guardados en la base
-- (quitar-devoluciones-2026-09.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Pedido de Mati (04/09/2026): sacar del sitio todo lo referido a cambios,
-- devoluciones, derecho de arrepentimiento y "precios con IVA". El código ya
-- se actualizó (términos, /info, ficha de producto, carrito, blog, JSON-LD).
-- Esto cubre lo que vive en site_settings y el código no puede cambiar solo:
--
--   * FAQ 4 de la home: era "¿Aceptan devoluciones?". Se reemplaza por una
--     pregunta de talle, que es la duda de compra más frecuente. El mismo
--     texto quedó como valor por defecto en HomeClient.tsx.
--   * info_returns: el bloque "Cambios y devoluciones" de /info. La página ya
--     no lo muestra; se borra la clave para que no quede un texto huérfano.
-- ============================================================

UPDATE site_settings SET value = '¿Cómo sé qué talle pedir?'
WHERE key = 'faq_4_q';

UPDATE site_settings SET value =
  'Cada ficha tiene una tabla de medidas en centímetros. Si estás entre dos talles, mandame tus medidas por WhatsApp antes de comprar y te digo cuál conviene, o la tejo directamente con tus medidas.'
WHERE key = 'faq_4_a';

DELETE FROM site_settings WHERE key = 'info_returns';

-- Verificación (no debería devolver ninguna fila):
-- SELECT key, value FROM site_settings
-- WHERE value ILIKE '%devoluc%' OR value ILIKE '%arrepent%' OR value ILIKE '%retract%';
