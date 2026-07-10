-- ============================================================
-- Dahila Crochet — 5ª pregunta frecuente: variantes de escritura del
-- nombre (faq-seo-variante-nombre-2026-07.sql)
-- Ejecutar UNA VEZ en el Supabase SQL Editor del proyecto de la tienda.
-- ============================================================
-- Mucha gente busca "Dalia crochet" o "Dahlia crochet" en vez de "Dahila".
-- Esta pregunta lo aclara de forma natural (no es keyword stuffing: es una
-- pregunta real que alguien se haría). Aparece en la FAQPage del home,
-- en /llms.txt y es editable desde /admin/configuracion → Preguntas
-- frecuentes → Pregunta 5. Si Anush prefiere otro texto, lo puede editar
-- ahí sin tocar código ni volver a correr este script.
-- ============================================================

INSERT INTO site_settings (key, value) VALUES
  ('faq_5_q', '¿Dahila se escribe con H? ¿Es lo mismo que Dalia o Dahlia?'),
  ('faq_5_a', 'Sí — somos Dahila Crochet. Mucha gente nos busca como "Dalia" o "Dahlia" y llega igual: es la misma marca, hecha a mano en Montevideo.')
ON CONFLICT (key) DO NOTHING;
