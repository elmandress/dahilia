-- ============================================================
-- Dahila Crochet — vocabulario uruguayo en las categorías (vocabulario-uruguayo-2026-10.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- 08/10/2026. En Uruguay se dice "buzo", "saco" y "musculosa"; el catálogo
-- decía solo "sweater", "cardigan" y "top". El texto de la categoría se ve
-- arriba de la grilla y es lo que Google lee para saber qué hay ahí: con la
-- palabra local, la página puede rankear en búsquedas que casi no tienen
-- tiendas uruguayas compitiendo (ver src/lib/vocabulario.ts).
--
-- Cada UPDATE solo cambia el texto si sigue siendo EXACTAMENTE el original:
-- si Anush ya lo editó desde el admin, no se pisa (y no pasa nada).
-- ============================================================

UPDATE categories SET description =
  'Cardigans —o sacos, como les decimos acá— de crochet tejidos a mano, de corto y 3/4 a oversize. En algodón para entretiempo y aire acondicionado, o en hilados más abrigados para el frío. Al tejerse a pedido, elegís color y talle: en un cardigan, además, el talle perdona más que en cualquier otra prenda.'
WHERE slug = 'cardigans'
  AND description = 'Cardigans de crochet tejidos a mano, de corto y 3/4 a oversize. En algodón para entretiempo y aire acondicionado, o en hilados más abrigados para el frío. Al tejerse a pedido, elegís color y talle: en un cardigan, además, el talle perdona más que en cualquier otra prenda.';

UPDATE categories SET description =
  'Sweaters y buzos tejidos a mano en lana y mezclas con lana: las piezas más abrigadas del taller, para el invierno de verdad. Se tejen a pedido, en tu talle y en el color que elijas.'
WHERE slug = 'sweaters'
  AND description = 'Sweaters tejidos a mano en lana y mezclas con lana: las piezas más abrigadas del taller, para el invierno de verdad. Se tejen a pedido, en tu talle y en el color que elijas.';

UPDATE categories SET description =
  'Tops y musculosas de crochet y de hilo, tejidos a mano en Montevideo, la mayoría en algodón: frescos, con caída y en punto abierto para el verano uruguayo. Se tejen después de tu pedido, así que elegís talle y color — y si estás entre dos talles, se ajusta a tus medidas.'
WHERE slug = 'tops'
  AND description = 'Tops de crochet y de hilo, tejidos a mano en Montevideo, la mayoría en algodón: frescos, con caída y en punto abierto para el verano uruguayo. Se tejen después de tu pedido, así que elegís talle y color — y si estás entre dos talles, se ajusta a tus medidas.';

-- Verificación:
-- SELECT slug, description FROM categories ORDER BY sort_order;
