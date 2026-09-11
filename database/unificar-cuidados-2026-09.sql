-- ============================================================
-- Dahila Crochet — unifica el texto de cuidados (unificar-cuidados-2026-09.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Encontrado el 04/09/2026: había TRES textos de cuidado distintos conviviendo,
-- y dos de ellos se contradecían con el tercero en algo que importa de verdad:
--
--   35 productos  →  "Lavá a mano con agua FRÍA…"   (el correcto, detallado)
--    2 productos  →  "Lavar a mano con agua TIBIA…" (Granny's cardigan y
--                                                     Sweater cherry, los dos
--                                                     más nuevos, cargados a mano)
--
-- Por qué gana el de agua fría, y no es una preferencia de redacción:
--   * El salto de temperatura entre lavado y enjuague es lo que afieltra y
--     apelmaza la fibra — con agua tibia es más fácil que ese salto ocurra.
--   * Es el texto que ya tiene el 95% del catálogo, así que unificar hacia él
--     es un cambio de 2 filas y no de 35.
--   * Es el único de los tres que cubre el ciclo completo (lavado, enjuague,
--     secado horizontal, no colgar, no secarropas, ventilar al guardar).
--   * Está escrito en la voz de la marca (voseo), como el resto del sitio.
--
-- Esta migración reemplaza el texto SOLO en los productos que hoy dicen "tibia".
-- No toca ningún otro producto. Al filtrar por el contenido y no por slug,
-- también corrige cualquier producto futuro que se cargue con el texto viejo.
-- ============================================================

UPDATE products
SET care_instructions =
  E'Lavá a mano con agua fría y jabón neutro, sin frotar ni retorcer. Enjuagá con agua a la misma temperatura: el cambio brusco es lo que apelmaza la fibra.\n'
  || E'Para secar: apoyala en horizontal sobre una toalla, a la sombra. Nunca colgada — el peso del agua la estira. Nada de secarropas.\n'
  || E'Si la guardás mucho tiempo, sacala del placard cada tanto para que la fibra respire.'
WHERE care_instructions ILIKE '%agua tibia%';

-- Verificación (debería devolver 0 filas después de correr lo de arriba):
-- SELECT name, care_instructions FROM products WHERE care_instructions ILIKE '%agua tibia%';
