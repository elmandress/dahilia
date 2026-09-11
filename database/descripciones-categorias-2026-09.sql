-- ============================================================
-- Dahila Crochet — descripciones de categoría (descripciones-categorias-2026-09.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- POR QUÉ: las 5 categorías tenían `description` en NULL, y la página de
-- categoría no mostraba ningún texto propio — era breadcrumb + filtros +
-- grilla. Google no tenía una sola línea que leer para distinguir
-- /tienda/cardigans de cualquier otra grilla de productos, y eso se ve en
-- Search Console: "cardigans de mujer" acumula impresiones reales pero en
-- posición ~58, y "cardigan" en ~69.
--
-- El código ya se actualizó (working tree, 04/09/2026) para RENDERIZAR este
-- texto arriba de la grilla, además de usarlo en el meta y el JSON-LD como
-- hacía antes. Se puede editar después desde /admin/categorias.
--
-- Los textos describen lo que HAY de verdad en cada categoría (materiales y
-- tipos de pieza verificados contra la base el 04/09/2026). Si cambia mucho el
-- surtido, conviene revisarlos.
-- ============================================================

UPDATE categories SET description =
  'Tops tejidos a crochet a mano en Montevideo, la mayoría en algodón: frescos, con caída y en punto abierto para el verano uruguayo. Se tejen después de tu pedido, así que elegís talle y color — y si estás entre dos talles, se ajusta a tus medidas.'
WHERE slug = 'tops';

UPDATE categories SET description =
  'Cardigans de crochet tejidos a mano, de corto y 3/4 a oversize. En algodón para entretiempo y aire acondicionado, o en hilados más abrigados para el frío. Al tejerse a pedido, elegís color y talle: en un cardigan, además, el talle perdona más que en cualquier otra prenda.'
WHERE slug = 'cardigans';

UPDATE categories SET description =
  'Sweaters tejidos a mano en lana y mezclas con lana: las piezas más abrigadas del taller, para el invierno de verdad. Se tejen a pedido, en tu talle y en el color que elijas.'
WHERE slug = 'sweaters';

UPDATE categories SET description =
  'Sets tejidos a crochet: dos o tres piezas hechas del mismo hilado y el mismo punto, para que combinen de verdad y no solo "parecido". De playa en algodón, de salida en hilado con brillo, o de abrigo en lana. Cada pieza se puede tejer en su propio talle.'
WHERE slug = 'sets';

UPDATE categories SET description =
  'Accesorios tejidos a mano: bolsos en trapillo reciclado y algodón, bufandas, bandanas y calentadores. Son las piezas de plazo más corto del taller y las más fáciles de regalar, porque no dependen del talle.'
WHERE slug = 'accesorios';

-- Verificación (debería devolver 5 filas, ninguna en NULL):
-- SELECT slug, left(description, 60) FROM categories ORDER BY sort_order;
