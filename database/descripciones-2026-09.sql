-- ============================================================================
-- Descripciones nuevas para 11 fichas (19/09/2026) — REVISAR ANTES DE CORRER
-- ============================================================================
-- Qué es: borradores para las 10 fichas con menos de 250 caracteres, más Top
-- RACE (sin indexar en Google). Texto propuesto y "antes" lado a lado en
-- entrega/descripciones-2026-09.md: que Anush lo lea y corrija lo que quiera
-- ANTES de correr esto (o que lo copie a mano desde el admin).
--
-- De dónde sale cada dato (nada inventado):
--   - material, talles y cuidados: lo que ya está cargado en cada producto;
--   - horas de tejido: la tabla de precios aprobada (/admin/estrategia,
--     PRICE_TABLE). Solo en las fichas que la tienen; Spring, Amour, Granny's,
--     Senda y Cherry no tienen horas medidas y por eso no las dicen;
--   - colores, forma y detalles: lo que se ve en las fotos de cada ficha;
--   - "podés pedirlo en otros colores": lo que el sitio ya promete en /tienda.
--
-- Por qué importa: con 1-2 líneas, Google tiene muy pocas palabras para
-- asociar la ficha con una búsqueda y quien entra no tiene con qué decidir. Y
-- al guardar, el trigger update_products_updated_at mueve la fecha de la ficha:
-- el sitemap se la anuncia a Google, que hoy no vuelve a Sweater Cherry (vio un
-- 404 el 14/09), Top RACE ni Spring porque "no cambiaron".
--
-- Seguro de correr dos veces: cada UPDATE solo se aplica si la ficha no se
-- tocó desde el 19/09 (compara updated_at). Si Anush ya la editó a mano, esa
-- fila se saltea y su versión queda como está.
-- Cómo: Supabase → SQL Editor → pegar todo → Run. La web lo muestra dentro de
-- la hora (o al instante si después se guarda cualquier cosa desde el admin).
-- ============================================================================

UPDATE products SET description = $d$Spring es un cardigan de crochet color crudo, abierto adelante, con flores tejidas y aplicadas una por una en rosa, fucsia, rojo y celeste, todas con centro amarillo. Las mangas son bien amplias y el cuerpo cae suelto, así que se puede llevar arriba de un buzo o de una remera. Está tejido en acrílico antipilling, que aguanta el uso y los lavados sin formar pelotitas. Queda lindo con jean y algo oscuro abajo, que hace resaltar las flores. Se teje a mano cuando lo encargás, en talle S, M o L, y podés pedirlo en otros colores. Envío a todo Uruguay.$d$
WHERE slug = 'spring-cardigan' AND updated_at = '2026-08-26T18:07:43.364305+00:00';

UPDATE products SET description = $d$Amour es un cardigan de crochet color crudo con corazones rojos tejidos en las mangas y a los costados. Las mangas son anchas y se juntan en el puño, y el frente queda abierto. Está tejido en acrílico antipilling, que mantiene el tejido prolijo lavado tras lavado. Combina con negro, con jean y con cualquier básico que deje lucir los corazones. Se teje a mano cuando lo encargás, en talle S o M/L, y podés pedirlo en otros colores. Envío a todo Uruguay.$d$
WHERE slug = 'cardigan-amour' AND updated_at = '2026-08-26T18:08:10.121802+00:00';

UPDATE products SET description = $d$Granny's es un cardigan de crochet armado con hexágonos tipo granny en bordó, rosa, fucsia y lila sobre un fondo beige. Se cierra con un lazo tejido adelante y tiene mangas acampanadas. Está tejido en algodón, una fibra fresca que se lleva bien en el entretiempo. Queda lindo sobre un cuello alto claro o una remera básica. Se teje a mano cuando lo encargás, en talle S o M/L, y podés pedir otra combinación de colores. Envío a todo Uruguay.$d$
WHERE slug = 'granny-s-cardigan' AND updated_at = '2026-09-11T12:46:44.398727+00:00';

UPDATE products SET description = $d$Cherry es un sweater de crochet rojo cereza, con un punto calado que deja ver la trama en todo el cuerpo. Es holgado, de cuello redondo y con mangas anchas. Está tejido en una mezcla de mitad lana natural y mitad acrílico: la lana abriga y el acrílico lo hace más fácil de cuidar. Se lleva con jean y una remera abajo, que se asoma por el calado. Se teje a mano cuando lo encargás, en talle S, M o L, y podés pedirlo en otros colores. Envío a todo Uruguay.$d$
WHERE slug = 'sweater-cherry' AND updated_at = '2026-09-11T12:46:44.398727+00:00';

UPDATE products SET description = $d$Senda es un sweater de crochet en bloques de rojo, bordó y negro, con cuello alto y puños negros. Es corto, con mangas anchas y un punto cerrado que abriga. Está tejido en lana acrílica. Queda bien con jean de tiro alto, que acompaña el largo. Se teje a mano cuando lo encargás, en talle S, M o L, y podés pedir otra combinación de colores. Envío a todo Uruguay.$d$
WHERE slug = 'sweater-senda' AND updated_at = '2026-09-03T21:51:27.314422+00:00';

UPDATE products SET description = $d$El set Brisa trae tres piezas de crochet en color crudo para la playa: un bikini de triángulo, una gargantilla y una salida de playa de malla calada. Las tres se tejen juntas, así el tono y el punto coinciden. Está tejido en algodón mercerizado, un hilo con brillo suave y más resistente al uso. Lleva unas 16 horas de tejido. Se hace a mano cuando lo encargás, en talle S, M o L. Envío a todo Uruguay.$d$
WHERE slug = 'set-brisa' AND updated_at = '2026-09-05T18:48:44.484128+00:00';

UPDATE products SET description = $d$El set Lueur trae tres piezas de crochet en tono caramelo con brillo: un short mini con cinturón tejido, una bufanda finita y un ponchito de red para llevar encima. Está tejido en algodón con lurex, que le da un brillo sutil a la luz. Lleva unas 18 horas de tejido. Se puede usar todo junto o combinar cada pieza por separado. Se hace a mano cuando lo encargás, en talle S, M o L. Envío a todo Uruguay.$d$
WHERE slug = 'set-lueur' AND updated_at = '2026-08-23T18:06:07.490839+00:00';

UPDATE products SET description = $d$El set Lurex trae tres piezas de crochet en marrón con brillo: un top halter que se cruza en el cuello, con una abertura adelante; una minifalda con cordón para ajustar en la cintura, y un gorro de red. Los bordes llevan un piquito tejido que le da la terminación. Está tejido en algodón con lurex. Lleva unas 17 horas de tejido. Se hace a mano cuando lo encargás, en talle S, M o L. Envío a todo Uruguay.$d$
WHERE slug = 'set-lurex' AND updated_at = '2026-09-02T01:55:14.070896+00:00';

UPDATE products SET description = $d$Una caja para regalar algo tejido a mano sin errarle. Se arma con piezas del catálogo, de trapillo reciclado, y llega en una caja kraft con la etiqueta de Dahila, lista para entregar. Contanos para quién es y armamos juntas la combinación: piezas, colores y presupuesto. Envío a todo Uruguay.$d$
WHERE slug = 'box-de-regalo' AND updated_at = '2026-09-09T16:37:45.442969+00:00';

UPDATE products SET description = $d$Sophie es una bufanda finita tejida a crochet en lana, suave y con el largo justo para dar dos vueltas o atarla adelante como un pañuelo. Lleva unas 5 horas de tejido. Es de los regalos más fáciles: no depende del talle. Se teje a mano en el color que elijas. Envío a todo Uruguay.$d$
WHERE slug = 'bufanda-sophie' AND updated_at = '2026-08-23T18:06:07.490839+00:00';

UPDATE products SET description = $d$El top Race tiene un aire deportivo llevado al crochet: negro, con franjas blancas arriba y abajo y breteles finos. Es corto, de líneas rectas, y está tejido en hilo acrílico. Lleva unas 13 horas de tejido. Para el día a día con jean o bermuda, o para sumarle textura a un look de noche. Se teje a mano cuando lo encargás, en talle S, M o L, y podés pedirlo en otros colores. Envío a todo Uruguay.$d$
WHERE slug = 'top-race' AND updated_at = '2026-08-23T18:06:07.490839+00:00';

-- Resultado: cuáles quedaron con texto nuevo (updated_at de hoy) y cuáles se
-- saltearon porque ya se habían editado a mano.
SELECT slug, length(description) AS caracteres, updated_at::date AS modificada
FROM products
WHERE slug IN ('spring-cardigan','cardigan-amour','granny-s-cardigan','sweater-cherry','sweater-senda','set-brisa','set-lueur','set-lurex','box-de-regalo','bufanda-sophie','top-race')
ORDER BY slug;
