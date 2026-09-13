-- Orden de categorías y palabras de búsqueda (13/09/2026)
-- Se corre en Supabase → SQL Editor. Idempotente: se puede correr dos veces.
-- Nada de esto es obligatorio: todo se puede cambiar después desde el admin.
-- La web lo muestra en menos de una hora (o al guardar algo en el admin).
--
-- Por qué (research/estadisticas-2026-09-13.md):
--  · Orden. El Cardigan amour es lo que más se agrega al carrito (12 carritos)
--    y el Spring cardigan es la ficha que más clics trae de Google. Se viene
--    el verano (tops) y fin de año (accesorios para regalar). Los sweaters van
--    al final hasta el próximo invierno. Hoy Tops y Sweaters tienen el mismo
--    número (1) y el menú las muestra en cualquier orden.
--  · Palabras. Búsquedas reales de Google donde la tienda ya sale en la primera
--    página pero casi nadie hace clic: "top de hilo", "set de crochet", "bolsa
--    dona". Solo se agregan donde son ciertas: la mayoría de los tops son de
--    algodón y algunos de hilo acrílico; la DONUT bag es, literalmente, una
--    bolsa con forma de dona.

begin;

-- 1) Orden de categorías
update public.categories set sort_order = 1 where slug = 'cardigans'  and sort_order is distinct from 1;
update public.categories set sort_order = 2 where slug = 'tops'       and sort_order is distinct from 2;
update public.categories set sort_order = 3 where slug = 'accesorios' and sort_order is distinct from 3;
update public.categories set sort_order = 4 where slug = 'sets'       and sort_order is distinct from 4;
update public.categories set sort_order = 5 where slug = 'sweaters'   and sort_order is distinct from 5;

-- 2) Tops: "tops de hilo"
update public.categories
set description = replace(description, 'Tops tejidos a crochet a mano en Montevideo,', 'Tops de crochet y de hilo, tejidos a mano en Montevideo,')
where slug = 'tops'
  and description like 'Tops tejidos a crochet a mano en Montevideo,%';

-- 3) Sets: "sets de crochet"
update public.categories
set description = replace(description, 'Sets tejidos a crochet:', 'Sets de crochet tejidos a mano:')
where slug = 'sets'
  and description like 'Sets tejidos a crochet:%';

-- 4) DONUT bag: "bolsa dona"
update public.products
set description = replace(description, 'La DONUT bag es el bolso', 'La DONUT bag (la bolsa dona) es el bolso')
where slug = 'donut-bag'
  and description like 'La DONUT bag es el bolso%';

commit;

-- Para ver cómo quedó:
-- select slug, sort_order, left(description, 70) from public.categories order by sort_order;
-- select slug, left(description, 70) from public.products where slug = 'donut-bag';
