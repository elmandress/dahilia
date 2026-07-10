-- ============================================================
-- Dahila Crochet — Primera versión de descripciones de producto
-- (descripciones-productos-2026-07.sql)
-- Ejecutar UNA VEZ en el Supabase SQL Editor del proyecto de la tienda.
-- ============================================================
-- Las fichas sin descripción son el mayor freno de SEO/IA/conversión del
-- sitio (thin content en las 32 URLs más importantes). Este script deja una
-- primera versión honesta para TODAS: solo usa datos reales (tipo de prenda,
-- hecho a pedido, talle y colores a elección, envío) — nada de materiales,
-- horas ni medidas inventadas. Redacción variada a propósito: 30 fichas con
-- el mismo texto serían contenido duplicado.
--
-- GUARDA: solo escribe donde la descripción está VACÍA. Las fichas que ya
-- tienen texto (ej. Set BRISA, Set LUEUR) no se tocan. Anush puede editar
-- todo desde /admin/productos — esto es el piso, no el techo.
-- ============================================================

-- ── Cardigans y abrigo ───────────────────────────────────────

UPDATE products SET description = 'Un cardigan de crochet con mangas 3/4, pensado para el entretiempo: sobre una camisa, un vestido o directamente con jean y listo. Se teje a mano cuando lo pedís, en tu talle y en los colores que elijas — escribinos y vemos juntas las opciones. Como todo tejido a mano, se cuida fácil: lavado suave a mano y secado en horizontal. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'cardigan-3-4' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'El cardigan cruzado es la pieza de abrigo más versátil del catálogo: cerrado queda formal, abierto acompaña cualquier look de todos los días. Tejido a crochet, punto por punto, especialmente para vos — elegís talle y colores antes de que empiece. Una prenda que no vas a ver repetida, porque no existe otra igual. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'cardigan-cruzado' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'Un poncho tejido a mano es de esas prendas que se heredan: abriga, no pasa de moda y queda bien con todo lo que tengas puesto abajo. Este se teje a pedido, así que los colores los definís vos. Ideal para las tardes frescas de acá — y como regalo, es de los que no fallan. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'poncho' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'El chaleco tejido es el punto medio justo: más abrigo que un top, más liviano que un cardigan. Va arriba de camisas, remeras o vestidos, y le suma textura a cualquier conjunto simple. Se teje a crochet cuando lo encargás, en tu talle exacto y el tono que prefieras. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'chaleco' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'Polainas tejidas a crochet para los días de frío de verdad: abrigan los tobillos sin sumar bulto, y le dan un detalle artesanal a cualquier look de invierno. Van igual de bien con calzas, jeans o por encima de unas botas. Hechas a mano, en el color que elijas. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'calentadores' AND (description IS NULL OR btrim(description) = '');

-- ── Tops ─────────────────────────────────────────────────────

UPDATE products SET description = 'El top FLOWER lleva el crochet a su versión más delicada: un tejido calado que se luce solo, con un jean de tiro alto o sobre un traje de baño. Cada uno se teje a mano cuando lo pedís, en tu talle y con los colores que elijas entre las lanas disponibles. No hay dos iguales. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-flower' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'CHERRY es un top tejido a crochet con espíritu de verano: fresco, con textura y con ese detalle hecho a mano que ninguna prenda de máquina tiene. Combinalo con shorts de día o con falda de noche. Se teje a tu medida y en tus colores — contanos qué tenés en mente. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-cherry' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'Un clásico de temporada: el top SUMMER se teje a mano en crochet y está pensado para el calor — liviano, con caída y fresco. Funciona igual de bien en la playa que en la ciudad. Al hacerse a pedido, elegís talle y paleta de colores antes de que empiece el tejido. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-summer' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'HIGGIE es de esos tops que se vuelven los favoritos del placard: simple, cómodo y con la textura única del crochet hecho a mano. Anda solo o abajo de un cardigan cuando refresca. Se teje especialmente para vos, en tu talle y tus colores. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-higgie' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'El top RACE tiene un aire deportivo llevado al lenguaje del crochet: líneas limpias y un tejido a mano que le da carácter. Para el día a día con jean o bermuda, o para sumarle textura a un look de noche. Tejido a pedido: vos elegís talle y colores. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-race' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'MARESIA — como la brisa del mar que le da nombre — es un top pensado para el verano: tejido a crochet, aireado y con movimiento. Queda perfecto sobre bikini o con un short de lino. Se hace a mano cuando lo encargás, a tu medida y en los tonos que prefieras. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-maresia' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'LAGOM: ni más, ni menos — justo. Un top tejido a crochet de líneas simples que combina con todo y no compite con nada. La textura del punto hecho a mano es el único protagonista. Elegís talle y colores, y se teje especialmente para vos. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-lagom' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'AMÉLIE es el top romántico del catálogo: crochet con detalle, femenino sin ser cursi. Para vestirlo con falda los días de sol o con jean y campera de noche. Como todo lo de Dahila, se teje a mano a pedido — tu talle, tus colores, tu prenda. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-amelie' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'Un halter tejido a crochet: escote limpio adelante, espalda libre, y toda la textura del punto hecho a mano. Es el top de las noches de verano — con pantalón de tiro alto es infalible. Se teje a tu medida (el calce del halter lo agradece) y en los colores que elijas. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-halter' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'DUNA es un top de crochet suave y sin complicaciones, pensado para acompañar: arena, mate, tarde de rambla. Liviano y fresco, el tipo de prenda que te ponés sin pensar y queda bien igual. Tejido a mano a pedido, en tu talle y tus tonos. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'top-duna' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'El COWL NECK es el top de crochet con cuello volcado: un detalle que lo hace distinto sin dejar de ser fácil de usar. Es también una linda puerta de entrada al tejido a mano — y un regalo seguro. Se hace a pedido, a tu medida y en los colores que quieras. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'cowl-neck-top' AND (description IS NULL OR btrim(description) = '');

-- ── Faldas y sets ────────────────────────────────────────────

UPDATE products SET description = 'La falda SERENADA lleva el crochet de la playa a la calle: tejida a mano, con la caída y la transparencia justas para usarla sobre bikini o con top y sandalias. Se hace a pedido, en tu talle exacto y los colores que elijas. Una pieza única — literalmente. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'falda-serenada' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'El set LUREX reúne piezas tejidas a crochet pensadas para combinarse entre sí — comprar el conjunto asegura que los tonos y el punto conversen. Se teje a mano cuando lo pedís, a tu medida y con los colores elegidos con vos. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'set-lurex' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'El BEACH set es el conjunto de playa tejido a mano: piezas que funcionan juntas o por separado, del balneario al chiringuito sin pasar por casa. Cada set se teje a pedido, así que el talle y la paleta los definís vos. Envío a todo Uruguay — llega antes que el verano si lo pedís a tiempo.', updated_at = now()
WHERE slug = 'beach-set' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'Bufanda y guantes tejidos a crochet, en set: el regalo de invierno que siempre queda bien — y como van juntos, los tonos combinan de fábrica (bueno, de taller). Se tejen a mano en el color que elijas. Envío a todo Uruguay, con tiempo para que llegue antes del frío.', updated_at = now()
WHERE slug = 'set-de-bufanda-y-guantes' AND (description IS NULL OR btrim(description) = '');

-- ── Bolsos ───────────────────────────────────────────────────

UPDATE products SET description = 'El bolso de estudiante: espacio para cuadernos, computadora chica y el resto de tu día. Tejido a crochet a mano, aguanta el uso diario y suma un detalle artesanal que ningún bolso de fábrica tiene. Lo pedís en el color que quieras y se teje para vos. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'bolso-de-estudiante' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'La tote de playa tejida a crochet: entra la toalla, el mate, el protector y el libro que no vas a leer. El tejido abierto deja salir la arena solo — el truco de siempre de los bolsos de red, en versión hecha a mano. Elegí tu color y se teje a pedido. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'tote-bag-de-playa' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'La DONUT bag es el bolso con forma redonda que se volvió firma del crochet: chico, con personalidad y justo para lo esencial. Tejido a mano en el color que elijas — un accesorio que levanta cualquier look básico. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'donut-bag' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'El bolso a cuadros combina el tejido a crochet con un dibujo geométrico que se hace punto por punto — de los bolsos del catálogo, el de más trabajo de color. Espacioso para el día a día y distinto a todo lo que se ve. Se teje a pedido en la combinación de tonos que elijas. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'bolso-a-cuadros' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'La mini tote es el bolso chico de todos los días: celular, llaves, billetera y listo. Tejida a crochet a mano, es de esas compras chicas que terminás usando más que ninguna otra. También es un regalo fácil de acertar. Elegí el color y se teje para vos. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'mini-tote-bag' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'LOLA es el bolso grande del catálogo: el que se lleva todo — y encima, tejido a mano. Estructura generosa, textura de crochet y un color que elegís vos cuando lo encargás. Para el trabajo, un fin de semana corto o la vida entera adentro. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'bolso-lola' AND (description IS NULL OR btrim(description) = '');

-- ── Accesorios ───────────────────────────────────────────────

UPDATE products SET description = 'SOPHIE es una bufanda tejida a crochet, suave y con el largo justo para dar dos vueltas. El accesorio de invierno que más se regala — y el que más se agradece. Se teje a mano en el color que elijas. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'bufanda-sophie' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'La bandana tejida a crochet: en el pelo, en el cuello o atada a la cartera — un mismo accesorio, tres usos. Es la pieza más accesible del catálogo y la manera más fácil de probar lo hecho a mano (o de regalarlo). Elegí tu color y se teje para vos. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'bandana' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'Las mini bufandas son el accesorio con más onda del invierno: cortas, anudadas al cuello, dan el detalle sin el bulto de una bufanda entera. Tejidas a crochet a mano, en el color que quieras. Compra chica, efecto grande — y el regalo express perfecto. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'mini-bufandas' AND (description IS NULL OR btrim(description) = '');

UPDATE products SET description = 'Un box para regalar tejido a mano sin errarle: se arma con piezas del catálogo y llega presentado para sorprender. Contanos para quién es y armamos juntas la combinación — colores, piezas y presupuesto a tu medida. Envío a todo Uruguay.', updated_at = now()
WHERE slug = 'box-de-regalo' AND (description IS NULL OR btrim(description) = '');

-- Los sets BRISA y LUEUR ya tienen descripción cargada (la lista de piezas
-- que incluyen) — la guarda de arriba los deja como están. Si se quiere,
-- se amplían a mano desde /admin/productos.
